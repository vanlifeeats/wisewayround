// Integration tests for the four new SCENIC AI POST actions in
// app/api/admin/travel-planner/route.ts:
//   - ai-find-scenic-roads   (task 7.2)
//   - ai-find-scenic-parkups (task 8.2)
//   - ai-road-safety         (task 9.2)
//   - ai-replan-route        (part of Property 10, task 10.2)
//
// The route module imports several heavy / network-bound modules at the top
// level (`@/auth`, `@/lib/sanity-server`, `@/lib/ses`, `@/lib/email`,
// `@anthropic-ai/sdk`). We mock each with minimal stubs purely so the module
// imports cleanly in a node (vitest) environment and so we can drive the AI
// response (or force it to throw). The REAL `next/server` NextResponse is used
// (it works in node) — we read `.status` and `await .json()` off it.
//
// Auth is driven through the mocked `auth()` (admin session by default so the
// handler's local isAdmin() guard passes). Mapbox geocoding is exercised via a
// mocked global fetch returning a controllable feature center.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// ── Mutable auth session, controllable per test ──────────────────────
// Default: an admin session so isAdmin() passes.
let mockSession: any = { user: { isAdmin: true } }

vi.mock('@/auth', () => ({
  auth: vi.fn(async () => mockSession),
}))

// Sanity write client — exposed as shared spies so individual tests can assert
// NO write (patch/create/commit/transaction) ever happens on a fail-soft path.
// Declared via vi.hoisted so it is available inside the hoisted vi.mock factory.
const sanityWriteMock = vi.hoisted(() => ({
  fetch: vi.fn(),
  create: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  commit: vi.fn(),
  transaction: vi.fn(),
}))

vi.mock('@/lib/sanity-server', () => ({
  sanityWrite: sanityWriteMock,
}))

vi.mock('@/lib/ses', () => ({
  sendEmail: vi.fn(async () => true),
}))

vi.mock('@/lib/email', () => ({
  emailShell: vi.fn(() => '<html></html>'),
}))

// ── Controllable Anthropic mock ──────────────────────────────────────
// `messagesCreate` is the single spy backing `new Anthropic().messages.create`.
// Tests set its resolved value (a message with a JSON text block) or make it
// reject to exercise the fail-soft catch branches.
const messagesCreate = vi.hoisted(() => vi.fn())

vi.mock('@anthropic-ai/sdk', () => ({
  default: class Anthropic {
    messages = { create: messagesCreate }
  },
}))

// Build a fake Anthropic message whose first content block is `obj` as JSON.
function aiMessage(obj: unknown) {
  return { content: [{ type: 'text', text: JSON.stringify(obj) }] }
}

// Import after mocks are registered.
import { POST } from './route'
import { NextRequest } from 'next/server'

// ── Helpers ──────────────────────────────────────────────────────────
function makeRequest(body: unknown): NextRequest {
  return new NextRequest('https://vanlifeeats.test/api/admin/travel-planner', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })
}

// A fake Mapbox geocoding success returning a single feature with the given
// center [lng, lat]. The handlers read `data.features[0].center`.
function mapboxGeocode(lng: number, lat: number) {
  return {
    ok: true,
    json: async () => ({ features: [{ center: [lng, lat] }] }),
  }
}

let originalSecret: string | undefined
let originalPublic: string | undefined

beforeEach(() => {
  // Reset auth to admin by default and clear all spies.
  mockSession = { user: { isAdmin: true } }
  messagesCreate.mockReset()
  sanityWriteMock.fetch.mockReset()
  sanityWriteMock.create.mockReset()
  sanityWriteMock.patch.mockReset()
  sanityWriteMock.delete.mockReset()
  sanityWriteMock.commit.mockReset()
  sanityWriteMock.transaction.mockReset()

  // Save existing token env so individual tests can override / restore.
  originalSecret = process.env.MAPBOX_SECRET_TOKEN
  originalPublic = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  // Default: token present so geocoding is active.
  process.env.MAPBOX_SECRET_TOKEN = 'test-token'
})

afterEach(() => {
  // Restore token env exactly as it was.
  if (originalSecret === undefined) delete process.env.MAPBOX_SECRET_TOKEN
  else process.env.MAPBOX_SECRET_TOKEN = originalSecret
  if (originalPublic === undefined) delete process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  else process.env.NEXT_PUBLIC_MAPBOX_TOKEN = originalPublic

  vi.unstubAllGlobals()
})

// Assert that none of the Sanity write client's mutating methods were called.
function expectNoSanityWrite() {
  expect(sanityWriteMock.create).not.toHaveBeenCalled()
  expect(sanityWriteMock.patch).not.toHaveBeenCalled()
  expect(sanityWriteMock.commit).not.toHaveBeenCalled()
  expect(sanityWriteMock.delete).not.toHaveBeenCalled()
  expect(sanityWriteMock.transaction).not.toHaveBeenCalled()
}

// ─────────────────────────────────────────────────────────────────────
// Task 7.2 — ai-find-scenic-roads
// ─────────────────────────────────────────────────────────────────────
describe('ai-find-scenic-roads action', () => {
  // Req 2.1, 2.2 — success returns HTTP 200 with a `roads` array carrying the
  // documented fields, and a geocoded road carries SERVER lat/lng (from the
  // mocked Mapbox center) — never the model-supplied stray coordinates.
  it('returns 200 with documented roads and server-geocoded coords (never model coords)', async () => {
    // The model result includes a STRAY lat/lng that must never be copied.
    messagesCreate.mockResolvedValueOnce(
      aiMessage({
        roads: [
          {
            name: 'Transfagarasan Highway',
            location: 'Transfagarasan, Romania',
            roadType: 'mountain pass',
            why: 'Dramatic hairpins over the Carpathians.',
            bestMonths: 'Jul–Oct',
            scenicRating: '5/5',
            seasonalNote: 'Closed in winter.',
            confident: true,
            lat: 11.11, // stray model coords — MUST be ignored
            lng: 22.22,
          },
        ],
      }),
    )
    // Server geocode returns a controllable center [lng, lat].
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mapboxGeocode(24.6, 45.6)))

    const res = await POST(makeRequest({ action: 'ai-find-scenic-roads', country: 'Romania' }))
    expect(res.status).toBe(200)
    const data = await res.json()

    expect(Array.isArray(data.roads)).toBe(true)
    expect(data.roads).toHaveLength(1)
    const road = data.roads[0]
    // Documented shape.
    expect(road).toMatchObject({
      name: 'Transfagarasan Highway',
      location: 'Transfagarasan, Romania',
      roadType: 'mountain pass',
      why: 'Dramatic hairpins over the Carpathians.',
      bestMonths: 'Jul–Oct',
      scenicRating: '5/5',
      seasonalNote: 'Closed in winter.',
      confident: true,
    })
    // Coordinates come from the server geocode, NOT the model's stray values.
    expect(road.lat).toBe(45.6)
    expect(road.lng).toBe(24.6)
    expect(road.lat).not.toBe(11.11)
    expect(road.lng).not.toBe(22.22)
    expectNoSanityWrite()
  })

  // Req 2.8 — fail-soft: when Anthropic throws, respond HTTP 200 with
  // { roads: [], error } and perform no Sanity write.
  it('fails soft with 200 { roads: [], error } when Anthropic throws', async () => {
    messagesCreate.mockRejectedValueOnce(new Error('model exploded'))
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const res = await POST(makeRequest({ action: 'ai-find-scenic-roads', country: 'Romania' }))
    expect(res.status).toBe(200)
    const data = await res.json()

    expect(data.roads).toEqual([])
    expect(typeof data.error).toBe('string')
    expect(data.error.length).toBeGreaterThan(0)
    expectNoSanityWrite()
  })
})

// ─────────────────────────────────────────────────────────────────────
// Task 8.2 — ai-find-scenic-parkups
// ─────────────────────────────────────────────────────────────────────
describe('ai-find-scenic-parkups action', () => {
  // Req 4.3, 4.4 — success returns HTTP 200 with a `parkups` array in the
  // documented shape; a geocoded park-up carries server coords, not model ones.
  it('returns 200 with documented parkups and server-geocoded coords', async () => {
    messagesCreate.mockResolvedValueOnce(
      aiMessage({
        parkups: [
          {
            name: 'Lac de Sainte-Croix',
            location: 'Lac de Sainte-Croix, France',
            description: 'Turquoise lake aire.',
            facilities: 'Water, toilets',
            cost: 'Free',
            rating: '4.5',
            scenicNote: 'Lakeside with gorge views.',
            bestMonths: 'Apr–Oct',
            confident: true,
            lat: 1.23, // stray model coords — MUST be ignored
            lng: 4.56,
          },
        ],
      }),
    )
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mapboxGeocode(6.2, 43.76)))

    const res = await POST(makeRequest({ action: 'ai-find-scenic-parkups', country: 'France' }))
    expect(res.status).toBe(200)
    const data = await res.json()

    expect(Array.isArray(data.parkups)).toBe(true)
    expect(data.parkups).toHaveLength(1)
    const p = data.parkups[0]
    expect(p).toMatchObject({
      name: 'Lac de Sainte-Croix',
      location: 'Lac de Sainte-Croix, France',
      description: 'Turquoise lake aire.',
      facilities: 'Water, toilets',
      cost: 'Free',
      rating: '4.5',
      scenicNote: 'Lakeside with gorge views.',
      bestMonths: 'Apr–Oct',
      confident: true,
    })
    expect(p.lat).toBe(43.76)
    expect(p.lng).toBe(6.2)
    expect(p.lat).not.toBe(1.23)
    expect(p.lng).not.toBe(4.56)
    expectNoSanityWrite()
  })

  // Req 4.10 — fail-soft: Anthropic throws → HTTP 200 { parkups: [], error }.
  it('fails soft with 200 { parkups: [], error } when Anthropic throws', async () => {
    messagesCreate.mockRejectedValueOnce(new Error('model exploded'))
    vi.stubGlobal('fetch', vi.fn())

    const res = await POST(makeRequest({ action: 'ai-find-scenic-parkups', country: 'France' }))
    expect(res.status).toBe(200)
    const data = await res.json()

    expect(data.parkups).toEqual([])
    expect(typeof data.error).toBe('string')
    expect(data.error.length).toBeGreaterThan(0)
    expectNoSanityWrite()
  })
})

// ─────────────────────────────────────────────────────────────────────
// Task 9.2 — ai-road-safety
// ─────────────────────────────────────────────────────────────────────
describe('ai-road-safety action', () => {
  // Req 3.1, 3.3 — success returns HTTP 200 with a `safety` object carrying
  // summary / closures / winterRisks and a NON-EMPTY verifyNote.
  it('returns 200 with a safety object and a non-empty verifyNote', async () => {
    messagesCreate.mockResolvedValueOnce(
      aiMessage({
        summary: 'High alpine pass; often snow-closed in deep winter.',
        closures: ['Typically closed Nov–May'],
        winterRisks: ['Snow', 'Ice', 'Chains may be required'],
        verifyNote: 'General knowledge only — verify with official sources before travel.',
      }),
    )

    const res = await POST(
      makeRequest({ action: 'ai-road-safety', roadOrLegName: 'Furka Pass', month: 'January' }),
    )
    expect(res.status).toBe(200)
    const data = await res.json()

    expect(data.safety).toBeTruthy()
    expect(typeof data.safety.summary).toBe('string')
    expect(data.safety.summary.length).toBeGreaterThan(0)
    expect(Array.isArray(data.safety.closures)).toBe(true)
    expect(Array.isArray(data.safety.winterRisks)).toBe(true)
    expect(data.safety.winterRisks).toContain('Snow')
    // verifyNote must be present and non-empty.
    expect(typeof data.safety.verifyNote).toBe('string')
    expect(data.safety.verifyNote.trim().length).toBeGreaterThan(0)
    expectNoSanityWrite()
  })

  // Req 3.7 — fail-soft: Anthropic throws → HTTP 200 { safety: null, error }.
  it('fails soft with 200 { safety: null, error } when Anthropic throws', async () => {
    messagesCreate.mockRejectedValueOnce(new Error('model exploded'))

    const res = await POST(
      makeRequest({ action: 'ai-road-safety', roadOrLegName: 'Furka Pass', month: 'January' }),
    )
    expect(res.status).toBe(200)
    const data = await res.json()

    expect(data.safety).toBeNull()
    expect(typeof data.error).toBe('string')
    expect(data.error.length).toBeGreaterThan(0)
    expectNoSanityWrite()
  })
})

// ─────────────────────────────────────────────────────────────────────
// Task 10.2 — Property 10 (fail-soft across ALL four actions)
// ─────────────────────────────────────────────────────────────────────
// Feature: scenic-road-trip-planner, Property 10: For any failure in ai-find-scenic-roads, ai-road-safety, ai-find-scenic-parkups, or ai-replan-route, the handler responds with HTTP 200 and an empty-but-valid payload plus a non-empty error field, and performs no write to the trip's Sanity document.
describe('Property 10 — every new AI action is fail-soft', () => {
  it('returns 200 + empty-but-valid payload + non-empty error + no Sanity write for all four actions when Anthropic throws', async () => {
    // The failure space here is exactly the four actions, so a direct iteration
    // over them covers Property 10 (no fast-check needed).
    const cases: Array<{ action: string; emptyKey: string; empty: unknown }> = [
      { action: 'ai-find-scenic-roads', emptyKey: 'roads', empty: [] },
      { action: 'ai-find-scenic-parkups', emptyKey: 'parkups', empty: [] },
      { action: 'ai-road-safety', emptyKey: 'safety', empty: null },
      { action: 'ai-replan-route', emptyKey: 'proposedLegs', empty: [] },
    ]

    for (const c of cases) {
      // Fresh throwing Anthropic + a fetch spy that must stay unused on failure.
      messagesCreate.mockReset()
      messagesCreate.mockRejectedValue(new Error(`fail:${c.action}`))
      const fetchMock = vi.fn()
      vi.stubGlobal('fetch', fetchMock)

      const res = await POST(
        makeRequest({
          action: c.action,
          country: 'France',
          roadOrLegName: 'Some Road',
          month: 'January',
          instruction: 'make it shorter',
          trip: { title: 'Trip', itinerary: [{ _key: 'a', label: 'Leg A', startDate: '2026-06-01' }] },
        }),
      )

      expect(res.status, `${c.action} should be HTTP 200`).toBe(200)
      const data = await res.json()

      // Empty-but-valid payload under the documented key.
      expect(data[c.emptyKey], `${c.action} empty payload`).toEqual(c.empty)
      // Non-empty error field.
      expect(typeof data.error, `${c.action} error is string`).toBe('string')
      expect(data.error.length, `${c.action} error non-empty`).toBeGreaterThan(0)
      // No write to the trip's Sanity document.
      expectNoSanityWrite()
    }
  })
})
