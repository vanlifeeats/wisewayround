// Integration tests for the `drive-legs` POST action in
// app/api/admin/travel-planner/route.ts.
//
// The route imports several heavy / network-bound modules at the top level
// (`@/auth`, `@/lib/sanity-server`, `@/lib/ses`, `@/lib/email`,
// `@anthropic-ai/sdk`). None are exercised by the `drive-legs` branch, so they
// are mocked with minimal stubs purely so the module imports cleanly in a node
// (vitest) environment. Auth is driven through the mocked `auth()` so we can
// flip admin/non-admin per test. Mapbox is exercised via a mocked global fetch.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// ── Mutable auth session, controllable per test ──────────────────────
// Default: an admin session so isAdmin() passes.
let mockSession: any = { user: { isAdmin: true } }

vi.mock('@/auth', () => ({
  auth: vi.fn(async () => mockSession),
}))

// Minimal stubs for modules the drive-legs branch never touches.
vi.mock('@/lib/sanity-server', () => ({
  sanityWrite: {
    fetch: vi.fn(),
    create: vi.fn(),
    patch: vi.fn(),
    transaction: vi.fn(),
  },
}))

vi.mock('@/lib/ses', () => ({
  sendEmail: vi.fn(async () => true),
}))

vi.mock('@/lib/email', () => ({
  emailShell: vi.fn(() => '<html></html>'),
}))

vi.mock('@anthropic-ai/sdk', () => ({
  default: class Anthropic {
    messages = { create: vi.fn(async () => ({ content: [{ type: 'text', text: '{}' }] })) }
  },
}))

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

// A hop from A → B. Coordinates are arbitrary but finite.
function hop(key: string, from = { lat: 51.5, lng: -0.12 }, to = { lat: 48.85, lng: 2.35 }) {
  return { key, from, to }
}

// A fake Mapbox Directions success response for given metres/seconds.
function mapboxOk(distance: number, duration: number) {
  return {
    ok: true,
    json: async () => ({ routes: [{ distance, duration }] }),
  }
}

// A fake non-2xx Mapbox response.
function mapboxNotOk(status = 500) {
  return {
    ok: false,
    status,
    json: async () => ({ message: 'error' }),
  }
}

let originalSecret: string | undefined
let originalPublic: string | undefined

beforeEach(() => {
  vi.restoreAllMocks()
  // Reset auth to admin by default.
  mockSession = { user: { isAdmin: true } }

  // Save existing token env so individual tests can override / restore.
  originalSecret = process.env.MAPBOX_SECRET_TOKEN
  originalPublic = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  // Default: token present so the routing branch is active.
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

describe('drive-legs action', () => {
  // Req 3.7, 5.5 — two valid hops produce two ok results and totals that sum
  // the successful hops (raw metres/seconds, no server-side formatting).
  it('returns two ok hops and totals equal to the summed distances/durations', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mapboxOk(1000, 600))
      .mockResolvedValueOnce(mapboxOk(2500, 1500))
    vi.stubGlobal('fetch', fetchMock)

    const res = await POST(makeRequest({ action: 'drive-legs', hops: [hop('a'), hop('b')] }))
    expect(res.status).toBe(200)
    const data = await res.json()

    expect(data.results).toHaveLength(2)
    const byKey = Object.fromEntries(data.results.map((r: any) => [r.key, r]))

    expect(byKey.a).toMatchObject({ ok: true, distanceMeters: 1000, durationSeconds: 600 })
    expect(byKey.b).toMatchObject({ ok: true, distanceMeters: 2500, durationSeconds: 1500 })

    expect(data.totals).toEqual({ distanceMeters: 3500, durationSeconds: 2100 })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  // Req 3.5 — one hop's Mapbox call fails (rejects); the other succeeds. The
  // failed hop is ok:false with error 'no-route' and is excluded from totals.
  it('marks a failed hop ok:false and excludes it from totals while the other succeeds', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('network down')) // hop 'a' fails
      .mockResolvedValueOnce(mapboxOk(4000, 2400)) // hop 'b' ok
    vi.stubGlobal('fetch', fetchMock)

    const res = await POST(makeRequest({ action: 'drive-legs', hops: [hop('a'), hop('b')] }))
    expect(res.status).toBe(200)
    const data = await res.json()

    const byKey = Object.fromEntries(data.results.map((r: any) => [r.key, r]))
    expect(byKey.a).toMatchObject({ ok: false, error: 'no-route' })
    expect(byKey.b).toMatchObject({ ok: true, distanceMeters: 4000, durationSeconds: 2400 })

    // Totals exclude the failed hop.
    expect(data.totals).toEqual({ distanceMeters: 4000, durationSeconds: 2400 })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  // Also covers a non-2xx Mapbox response (res.ok === false) → 'no-route'.
  it('treats a non-2xx Mapbox response as ok:false / no-route', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mapboxNotOk(500))
      .mockResolvedValueOnce(mapboxOk(1200, 720))
    vi.stubGlobal('fetch', fetchMock)

    const res = await POST(makeRequest({ action: 'drive-legs', hops: [hop('a'), hop('b')] }))
    const data = await res.json()

    const byKey = Object.fromEntries(data.results.map((r: any) => [r.key, r]))
    expect(byKey.a).toMatchObject({ ok: false, error: 'no-route' })
    expect(byKey.b).toMatchObject({ ok: true, distanceMeters: 1200, durationSeconds: 720 })
    expect(data.totals).toEqual({ distanceMeters: 1200, durationSeconds: 720 })
  })

  // Req 7.6 — missing Mapbox token → graceful, non-throwing 200 response with
  // every hop ok:false / 'no-token', zero totals, a warning, and no fetch call.
  it('returns a graceful no-token state (no fetch) when the Mapbox token is missing', async () => {
    delete process.env.MAPBOX_SECRET_TOKEN
    delete process.env.NEXT_PUBLIC_MAPBOX_TOKEN

    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const res = await POST(makeRequest({ action: 'drive-legs', hops: [hop('a'), hop('b')] }))
    expect(res.status).toBe(200)
    const data = await res.json()

    expect(data.results).toHaveLength(2)
    for (const r of data.results) {
      expect(r.ok).toBe(false)
      expect(r.error).toBe('no-token')
    }
    expect(data.totals).toEqual({ distanceMeters: 0, durationSeconds: 0 })
    expect(data.warning).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  // Req 7.2 — a request that fails isAdmin() gets 401 and never calls Mapbox.
  it('returns 401 for a non-admin request and makes no Mapbox call', async () => {
    mockSession = null // no session → not admin

    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const res = await POST(makeRequest({ action: 'drive-legs', hops: [hop('a')] }))
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.error).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
