import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sanityWrite as sanity } from '@/lib/sanity-server'
import { sendEmail } from '@/lib/ses'
import { emailShell } from '@/lib/email'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// ── Auth ─────────────────────────────────────────────────────────────
async function isAdmin(req?: NextRequest): Promise<boolean> {
  if (req) {
    const secret = req.headers.get('x-admin-secret')
    if (secret && process.env.ADMIN_SECRET && secret === process.env.ADMIN_SECRET) return true
  }
  const session = await auth()
  const user = session?.user as any
  return !!(user?.isAdmin || user?.role === 'admin' || user?.tier === 'admin')
}

// In-memory cache for computed drive-time boundaries (best-effort; serverless
// instances may not persist it, which is fine — it just skips recompute on warm
// hits). Keyed by rounded lat/lng + maxHours; entries expire after 24h.
const boundaryCache = new Map<string, { boundary: any; ts: number }>()

// ── Helpers ──────────────────────────────────────────────────────────
const INTENTION_LABELS: Record<string, string> = {
  cookbook: 'Cookbook content',
  travel_inspiration: 'Travel inspiration content',
  recipe_dev: 'Recipe development',
  features: 'Restaurant / producer features',
  sponsored: 'Sponsored / brand trip',
  personal: 'Personal trip',
  scouting: 'Scouting / recce',
  event_coverage: 'Event or festival coverage',
  collaboration: 'Collaboration / partnership',
}

function extractText(message: any): string {
  const block = message?.content?.[0]
  return (block && block.type === 'text' ? block.text : '') || ''
}

function parseJsonBlock(text: string): any {
  // Strip markdown fences then try object or array
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const match = cleaned.match(/[[{][\s\S]*[\]}]/)
  return JSON.parse(match ? match[0] : cleaned)
}

function intentionText(intentions?: string[]): string {
  if (!intentions?.length) return 'a mix of content and personal enjoyment'
  return intentions.map((i) => INTENTION_LABELS[i] || i).join(', ')
}

// Build a compact plain-text summary of a trip's planned route + pinned stops,
// safe to inject into AI prompts so suggestions reference the REAL itinerary.
// Returns '' when there is no trip. Kept bounded (~3000 chars, ~60 places) so it
// never blows up a prompt. `trip` is untyped because it may be a full Sanity doc
// or a lightweight client-supplied object.
function buildRouteContext(trip: any): string {
  if (!trip) return ''
  const lines: string[] = []

  // ── Header: title / where / dates / drive limit ──
  const title = (trip.title || '').toString().trim()
  if (title) lines.push(`Trip: ${title}`)
  const where = [trip.region, trip.country].map((s: any) => (s || '').toString().trim()).filter(Boolean).join(', ')
  if (where) lines.push(`Region/countries: ${where}`)
  const start = (trip.startDate || '').toString().trim()
  const end = (trip.endDate || '').toString().trim()
  if (start || end) lines.push(`Dates: ${start || '?'} to ${end || '?'}`)
  if (trip.maxDriveHours != null && trip.maxDriveHours !== '') {
    lines.push(`Max drive hours/day: ${trip.maxDriveHours}`)
  }

  // ── Ordered itinerary legs ──
  const legs = Array.isArray(trip.itinerary) ? trip.itinerary : []
  if (legs.length) {
    lines.push('', 'Itinerary (in order):')
    legs.forEach((leg: any, i: number) => {
      if (!leg) return
      const label = (leg.label || '').toString().trim() || `Leg ${i + 1}`
      const country = (leg.country || '').toString().trim()
      const ls = (leg.startDate || '').toString().trim()
      const le = (leg.endDate || '').toString().trim()
      const mode = (leg.travelModeIn || '').toString().trim()
      let line = `${i + 1}. ${label}`
      if (country) line += ` (${country})`
      if (ls || le) line += ` ${ls || '?'}–${le || '?'}`
      if (mode) line += ` [${mode}]`
      const notes = (leg.notes || '').toString().trim()
      if (notes) line += ` — ${notes}`
      lines.push(line)
    })
  }

  // ── Pinned places (capped) ──
  const places = Array.isArray(trip.places) ? trip.places : []
  if (places.length) {
    const CAP = 60
    const shown = places.slice(0, CAP)
    lines.push('', `Pinned places (${places.length}):`)
    shown.forEach((pl: any) => {
      if (!pl) return
      const name = (pl.name || '').toString().trim()
      if (!name) return
      const placeType = (pl.placeType || '').toString().trim()
      const location = (pl.location || '').toString().trim()
      lines.push(`- ${[name, placeType, location].filter(Boolean).join(' — ')}`)
    })
    if (places.length > CAP) lines.push(`- …and ${places.length - CAP} more pinned places`)
  }

  let out = lines.join('\n').trim()
  // Hard cap to keep the prompt bounded; truncate gracefully.
  const MAX = 3000
  if (out.length > MAX) out = out.slice(0, MAX - 1).trimEnd() + '…'
  return out
}

// ── Link verification ────────────────────────────────────────────────
// Known main pages for the platforms we suggest. Used as a reliable
// fallback when an AI-supplied link is missing or unreachable, since the
// user always wants to land on a working main page rather than a dead URL.
const PLATFORM_HOMEPAGES: Record<string, string> = {
  workaway: 'https://www.workaway.info',
  wwoof: 'https://wwoof.net',
  helpx: 'https://www.helpx.net',
  worldpackers: 'https://www.worldpackers.com',
  'work away': 'https://www.workaway.info',
  hippohelp: 'https://hippohelp.com',
  trustedhousesitters: 'https://www.trustedhousesitters.com',
  park4night: 'https://park4night.com',
  campercontact: 'https://www.campercontact.com',
  britstops: 'https://www.britstops.com',
  'france passion': 'https://www.france-passion.com',
  'brit stops': 'https://www.britstops.com',
  searchforsites: 'https://www.searchforsites.co.uk',
  ioverlander: 'https://ioverlander.com',
  campspace: 'https://www.campspace.com',
  hipcamp: 'https://www.hipcamp.com',
  homecamper: 'https://www.homecamper.com',
}

function normaliseUrl(url?: string): string {
  if (!url) return ''
  const trimmed = url.trim()
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

// Look up a reliable homepage from a platform name (fuzzy)
function homepageForPlatform(platform?: string): string | undefined {
  if (!platform) return undefined
  const key = platform.toLowerCase().trim()
  if (PLATFORM_HOMEPAGES[key]) return PLATFORM_HOMEPAGES[key]
  for (const [name, url] of Object.entries(PLATFORM_HOMEPAGES)) {
    if (key.includes(name) || name.includes(key)) return url
  }
  return undefined
}

// Reduce a URL to its origin (scheme + host) — the "main page"
function toMainPage(url: string): string {
  try {
    const u = new URL(normaliseUrl(url))
    return `${u.protocol}//${u.hostname}`
  } catch {
    return url
  }
}

type LinkCheck = { ok: boolean; status?: number; url: string }

// Fetch with a timeout; try HEAD then GET. Returns whether the URL resolves.
async function checkUrl(rawUrl: string, timeoutMs = 6000): Promise<LinkCheck> {
  const url = normaliseUrl(rawUrl)
  if (!url) return { ok: false, url }
  const attempt = async (method: 'HEAD' | 'GET'): Promise<LinkCheck | null> => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(url, {
        method,
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VanlifeEatsBot/1.0)' },
      })
      // Treat any non-5xx, non-404 as reachable (many sites reject HEAD with 403/405)
      const ok = res.status < 400 || res.status === 401 || res.status === 403 || res.status === 405
      return { ok, status: res.status, url }
    } catch {
      return null
    } finally {
      clearTimeout(timer)
    }
  }
  const head = await attempt('HEAD')
  if (head && head.ok) return head
  const get = await attempt('GET')
  if (get) return get
  return head || { ok: false, url }
}

/**
 * Verify a single item's link. Strategy (user always wants a working main page):
 *  1. If the given link resolves, reduce it to its main page (origin) and mark verified.
 *  2. Otherwise fall back to the known platform homepage if we have one.
 *  3. Otherwise clear the link and flag it unreachable.
 * Returns { link, linkStatus } where linkStatus ∈ 'verified' | 'homepage' | 'unreachable'.
 */
async function verifyItemLink(link?: string, platform?: string): Promise<{ link: string; linkStatus: 'verified' | 'homepage' | 'unreachable' }> {
  const candidate = normaliseUrl(link)
  const homepage = homepageForPlatform(platform)

  if (candidate) {
    const check = await checkUrl(candidate)
    if (check.ok) return { link: toMainPage(candidate), linkStatus: 'verified' }
  }
  if (homepage) {
    const check = await checkUrl(homepage)
    if (check.ok) return { link: homepage, linkStatus: 'homepage' }
    return { link: homepage, linkStatus: 'homepage' } // trusted list — keep even if it blocked our bot
  }
  return { link: '', linkStatus: 'unreachable' }
}

// Verify many items in parallel (bounded), each { link, platform }
async function verifyLinks<T extends { link?: string; platform?: string }>(items: T[]): Promise<(T & { linkStatus: 'verified' | 'homepage' | 'unreachable' })[]> {
  return Promise.all(items.map(async (it) => {
    const { link, linkStatus } = await verifyItemLink(it.link, it.platform)
    return { ...it, link, linkStatus }
  }))
}

// Map over items applying an async fn, but never running more than `limit`
// tasks concurrently. Used to verify AI-found contact links/socials in parallel
// without flooding remote hosts (which can look like abuse / rate-trip us).
async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length)
  let cursor = 0
  const workers = Array.from({ length: Math.min(Math.max(1, limit), items.length || 1) }, async () => {
    while (cursor < items.length) {
      const i = cursor++
      results[i] = await fn(items[i], i)
    }
  })
  await Promise.all(workers)
  return results
}

// ── Email scraping from a contact's own website ─────────────────────
// Fetch a page's raw HTML (GET, short timeout, browser-ish UA). Returns '' on
// any failure so callers can fail-soft.
async function fetchHtml(rawUrl: string, timeoutMs = 8000): Promise<string> {
  const url = normaliseUrl(rawUrl)
  if (!url) return ''
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VanlifeEatsBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    })
    const type = res.headers.get('content-type') || ''
    if (!res.ok || !type.includes('text/html')) return ''
    // Cap the body so a huge page can't blow up memory.
    const text = await res.text()
    return text.slice(0, 500_000)
  } catch {
    return ''
  } finally {
    clearTimeout(timer)
  }
}

const EMAIL_SCRAPE_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g
// Extensions/junk that look like emails but aren't (e.g. sprite@2x.png, wixpress).
const EMAIL_JUNK = /(\.(png|jpg|jpeg|gif|webp|svg|css|js|woff2?|ttf)$)|(^[0-9]+@)|(@[0-9.]+$)|(sentry|wixpress|example\.com|yourdomain|domain\.com|email\.com|@2x|@3x)/i

// Pull unique, plausible emails out of HTML: prefer explicit mailto: links,
// then fall back to text matches. Junk/asset "emails" are filtered out.
function extractEmails(html: string): string[] {
  if (!html) return []
  const found = new Set<string>()
  // mailto: links are the most reliable signal.
  const mailtoRe = /mailto:([^"'?>\s]+)/gi
  let m: RegExpExecArray | null
  while ((m = mailtoRe.exec(html)) !== null) {
    const addr = decodeURIComponent(m[1]).trim().toLowerCase()
    if (addr && !EMAIL_JUNK.test(addr)) found.add(addr)
  }
  // Plain-text addresses anywhere on the page.
  const text = html.replace(/<[^>]+>/g, ' ')
  const textMatches = text.match(EMAIL_SCRAPE_RE) || []
  for (const raw of textMatches) {
    const addr = raw.trim().toLowerCase()
    if (addr && !EMAIL_JUNK.test(addr)) found.add(addr)
  }
  return Array.from(found)
}

// Rank scraped emails: prefer role addresses (press/partnerships/hello/info…),
// then same-domain addresses, then anything else. Returns the best or ''.
function pickBestEmail(emails: string[], siteHost?: string): string {
  if (emails.length === 0) return ''
  const rolePriority = ['press', 'partnership', 'partnerships', 'collab', 'marketing', 'media', 'pr', 'hello', 'hi', 'contact', 'info', 'enquiries', 'enquiry', 'office']
  const host = (siteHost || '').replace(/^www\./, '').toLowerCase()
  const score = (e: string) => {
    const [local, domain] = e.split('@')
    let sc = 0
    const roleIdx = rolePriority.findIndex((r) => local === r || local.startsWith(r))
    if (roleIdx >= 0) sc += (rolePriority.length - roleIdx) * 10
    if (host && domain && domain.replace(/^www\./, '') === host) sc += 25
    return sc
  }
  return [...emails].sort((a, b) => score(b) - score(a))[0]
}

// Find likely contact/press page URLs linked from a homepage's HTML.
function findContactPages(html: string, baseUrl: string): string[] {
  if (!html) return []
  const out = new Set<string>()
  const hrefRe = /href\s*=\s*["']([^"']+)["']/gi
  const wanted = /(contact|kontakt|press|media|about|work-with|werk|impressum|presse)/i
  let m: RegExpExecArray | null
  let base: URL | null = null
  try { base = new URL(normaliseUrl(baseUrl)) } catch { base = null }
  while ((m = hrefRe.exec(html)) !== null) {
    const href = m[1]
    if (!wanted.test(href)) continue
    if (/^(mailto:|tel:|javascript:|#)/i.test(href)) continue
    try {
      const abs = base ? new URL(href, base).toString() : href
      // Same host only — don't wander off to social sites.
      if (base && new URL(abs).hostname.replace(/^www\./, '') !== base.hostname.replace(/^www\./, '')) continue
      out.add(abs.split('#')[0])
    } catch { /* skip bad href */ }
    if (out.size >= 4) break
  }
  return Array.from(out)
}

// Scrape the best public email for a single site: homepage first, then up to
// two likely contact pages. Returns { email, contactUrl } — email '' if none
// confidently found, in which case contactUrl is a verified page to check.
async function scrapeContactEmail(website: string): Promise<{ email: string; contactUrl: string; source: string }> {
  const site = normaliseUrl(website)
  if (!site) return { email: '', contactUrl: '', source: '' }
  let host = ''
  try { host = new URL(site).hostname } catch { /* ignore */ }

  const homeHtml = await fetchHtml(site)
  let emails = extractEmails(homeHtml)
  let best = pickBestEmail(emails, host)
  if (best) return { email: best, contactUrl: '', source: site }

  // No email on the homepage — try likely contact/press pages.
  const pages = findContactPages(homeHtml, site)
  let firstReachablePage = ''
  for (const page of pages.slice(0, 2)) {
    const html = await fetchHtml(page)
    if (html && !firstReachablePage) firstReachablePage = page
    const pageEmails = extractEmails(html)
    best = pickBestEmail(pageEmails, host)
    if (best) return { email: best, contactUrl: page, source: page }
  }
  return { email: '', contactUrl: firstReachablePage || (pages[0] || ''), source: '' }
}

// Verify a single AI-found contact: check the website (blank + note if dead),
// check any social handles (blank + note if dead), and flag low-confidence
// suggestions. Returns the cleaned contact with a `linkVerified` boolean.
// Social handle → profile URL builders (handle may include a leading @).
const SOCIAL_URL: Record<'instagram' | 'tiktok' | 'youtube', (handle: string) => string> = {
  instagram: (h) => `https://instagram.com/${h.replace(/^@/, '')}`,
  tiktok: (h) => `https://tiktok.com/@${h.replace(/^@/, '')}`,
  youtube: (h) => `https://youtube.com/@${h.replace(/^@/, '')}`,
}

async function verifyFoundContact(raw: any): Promise<any> {
  const contact = { ...raw }
  const noteParts: string[] = []
  let linkVerified = false

  // ── Website ──
  const website = (contact.website || '').toString().trim()
  if (website) {
    const check = await checkUrl(website)
    if (check.ok) {
      linkVerified = true
    } else {
      contact.website = ''
      noteParts.push(' [Link removed — could not be verified]')
    }
  }

  // ── Social handles (collabs only carry these) ──
  for (const platform of ['instagram', 'tiktok', 'youtube'] as const) {
    const handle = (contact[platform] || '').toString().trim()
    if (!handle) continue
    const profileUrl = SOCIAL_URL[platform](handle)
    const check = await checkUrl(profileUrl)
    if (check.ok) {
      linkVerified = true
    } else {
      contact[platform] = ''
      noteParts.push(` [${platform} handle removed — could not be verified]`)
    }
  }

  contact.linkVerified = linkVerified

  // ── Low-confidence suggestions: make it obvious this is a lead, not a verified contact ──
  if (contact.confident === false) {
    const name = (contact.name || '').toString()
    if (!/^search for:/i.test(name)) contact.name = `Search for: ${name}`.trim()
  }

  if (noteParts.length) {
    contact.notes = `${(contact.notes || '').toString()}${noteParts.join('')}`.trim()
  }

  return contact
}

// Verify a batch of AI-found contacts, bounded to 5 concurrent verifications.
// Fail-soft: if verification throws, callers should fall back to raw results.
async function verifyFoundContacts(contacts: any[]): Promise<any[]> {
  return mapWithConcurrency(contacts, 5, (c) => verifyFoundContact(c))
}

// Reverse-geocode lat/lng to a human place name via Mapbox (best-effort)
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const token = process.env.MAPBOX_SECRET_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
  if (!token) return ''
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=place,region,district,locality&limit=1&access_token=${token}`
    const res = await fetch(url)
    if (!res.ok) return ''
    const data = await res.json()
    return data?.features?.[0]?.place_name || ''
  } catch {
    return ''
  }
}

// Build a geodesic circle as a GeoJSON Polygon Feature. Uses the standard
// destination-point formula on a sphere (earth radius 6371 km). This gives an
// approximate "straight-line driving range" ring around a centre point. The
// simple formula is fine for our visual use near normal latitudes; longitudes
// are wrapped to [-180, 180] so points crossing the antimeridian stay valid.
function circlePolygon(lng: number, lat: number, radiusKm: number, points = 64): any {
  const R = 6371 // km
  const latRad = (lat * Math.PI) / 180
  const lngRad = (lng * Math.PI) / 180
  const angular = radiusKm / R // angular distance in radians
  const coords: [number, number][] = []
  for (let i = 0; i <= points; i++) {
    const bearing = (i / points) * 2 * Math.PI
    const lat2 = Math.asin(
      Math.sin(latRad) * Math.cos(angular) +
        Math.cos(latRad) * Math.sin(angular) * Math.cos(bearing)
    )
    const lng2 =
      lngRad +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angular) * Math.cos(latRad),
        Math.cos(angular) - Math.sin(latRad) * Math.sin(lat2)
      )
    // Normalise longitude to [-180, 180]
    let outLng = (lng2 * 180) / Math.PI
    outLng = ((outLng + 540) % 360) - 180
    const outLat = (lat2 * 180) / Math.PI
    coords.push([outLng, outLat])
  }
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [coords] },
  }
}

// Destination point given a start, an initial bearing (degrees) and a
// great-circle distance (km). Same spherical model as circlePolygon (R=6371);
// longitude is wrapped to [-180, 180]. Returns [lng, lat] (GeoJSON order).
function destPoint(lat: number, lng: number, bearingDeg: number, distanceKm: number): [number, number] {
  const R = 6371 // km
  const latRad = (lat * Math.PI) / 180
  const lngRad = (lng * Math.PI) / 180
  const bearing = (bearingDeg * Math.PI) / 180
  const angular = distanceKm / R
  const lat2 = Math.asin(
    Math.sin(latRad) * Math.cos(angular) +
      Math.cos(latRad) * Math.sin(angular) * Math.cos(bearing)
  )
  const lng2 =
    lngRad +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angular) * Math.cos(latRad),
      Math.cos(angular) - Math.sin(latRad) * Math.sin(lat2)
    )
  let outLng = (lng2 * 180) / Math.PI
  outLng = ((outLng + 540) % 360) - 180
  const outLat = (lat2 * 180) / Math.PI
  return [outLng, outLat]
}

// Fetch the real driving duration (seconds) from origin → dest via Mapbox
// Directions, with an abort timeout. Returns null on any failure/timeout so the
// caller can treat it conservatively (as "too far").
async function drivingDurationSeconds(
  fromLng: number,
  fromLat: number,
  toLng: number,
  toLat: number,
  token: string,
  timeoutMs = 7000
): Promise<number | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false&access_token=${token}`
    const res = await fetch(url, { cache: 'no-store', signal: controller.signal })
    if (!res.ok) return null
    const data = await res.json()
    const dur = data?.routes?.[0]?.duration
    return typeof dur === 'number' && Number.isFinite(dur) ? dur : null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

// Like drivingDurationSeconds(), but returns BOTH the driving duration (seconds)
// and route distance (meters) via the same Mapbox Directions driving profile,
// with the same AbortController + timeout pattern. Returns null on any
// failure/timeout/no-route so the caller can fail soft.
async function drivingDurationDistance(
  fromLng: number,
  fromLat: number,
  toLng: number,
  toLat: number,
  token: string,
  timeoutMs = 7000
): Promise<{ durationSeconds: number; distanceMeters: number } | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false&access_token=${token}`
    const res = await fetch(url, { cache: 'no-store', signal: controller.signal })
    if (!res.ok) return null
    const data = await res.json()
    const dur = data?.routes?.[0]?.duration
    const dist = data?.routes?.[0]?.distance
    if (typeof dur !== 'number' || !Number.isFinite(dur)) return null
    if (typeof dist !== 'number' || !Number.isFinite(dist)) return null
    return { durationSeconds: dur, distanceMeters: dist }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

// ── GET — list trips or fetch one, or email log ──────────────────────
export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  const mode = req.nextUrl.searchParams.get('mode')

  if (mode === 'emailLog' && id) {
    const logs = await sanity.fetch(
      `*[_type == "travelEmailLog" && trip._ref == $id] | order(sentAt desc){ _id, contactName, to, subject, goal, status, sentAt }`,
      { id }
    )
    return NextResponse.json({ logs })
  }

  // ── Search recipes/articles for the linked-content picker ──────────
  if (mode === 'searchContent') {
    const q = (req.nextUrl.searchParams.get('q') || '').trim()
    if (!q) return NextResponse.json({ results: [] })
    const results = await sanity.fetch(
      `*[_type in ["recipe", "article"] && title match $term] | order(_type asc, title asc)[0...20]{
        _id, _type, title, "slug": slug.current, category
      }`,
      { term: `${q}*` }
    )
    return NextResponse.json({ results })
  }

  // ── Cross-trip "Next actions" dashboard ────────────────────────────
  if (mode === 'nextActions') {
    // Active/planning trips only (skip archived/completed), with contacts still needing outreach
    const trips = await sanity.fetch(
      `*[_type == "travelPlan" && !(status in ["archived", "completed"])] | order(coalesce(startDate, updatedAt, _createdAt) asc){
        _id, title, country, region, status, startDate, endDate,
        "outreach": contacts[status in ["to_contact", "contacted"]]{ name, role, status, email, instagram, tiktok },
        "pipeline": contentIdeas[status != "published"]{ title, format, status },
        "opps": opportunities[status in ["to_research", "applied"]]{ name, oppType, status, platform, link }
      }`
    )
    return NextResponse.json({ trips })
  }

  if (id) {
    const trip = await sanity.fetch(`*[_type == "travelPlan" && _id == $id][0]{
      ...,
      "linkedContentResolved": linkedContent[]->{ _id, _type, title, "slug": slug.current, category }
    }`, { id })
    if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    return NextResponse.json({ trip })
  }

  const trips = await sanity.fetch(
    `*[_type == "travelPlan"] | order(coalesce(updatedAt, createdAt, _createdAt) desc){
      _id, title, country, region, status, intentions, startDate, endDate,
      "contactCount": count(contacts), "contentCount": count(contentIdeas), "placeCount": count(places)
    }`
  )
  return NextResponse.json({ trips })
}

// ── POST — all mutating + AI actions ─────────────────────────────────
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ── Image upload (multipart/form-data) ─────────────────────────────
  // Branched BEFORE req.json() so multipart requests don't fail JSON parsing.
  const contentType = req.headers.get('content-type') || ''
  if (contentType.includes('multipart/form-data')) {
    try {
      const form = await req.formData()
      const file = form.get('file') as File | null
      if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Only images allowed' }, { status: 400 })
      if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: 'File too large — max 20 MB' }, { status: 400 })
      const buffer = Buffer.from(await file.arrayBuffer())
      const asset = await sanity.assets.upload('image', buffer, { filename: file.name })
      return NextResponse.json({ assetId: asset._id, url: asset.url })
    } catch (e: any) {
      return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 })
    }
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { action } = body

  try {
    // ── Create a trip ────────────────────────────────────────────────
    if (action === 'create') {
      const { trip } = body
      if (!trip?.title || !trip?.country) {
        return NextResponse.json({ error: 'Title and country are required' }, { status: 400 })
      }
      const now = new Date().toISOString()
      const created = await sanity.create({
        _type: 'travelPlan',
        title: trip.title,
        country: trip.country,
        region: trip.region || '',
        status: trip.status || 'idea',
        intentions: trip.intentions || [],
        startDate: trip.startDate || undefined,
        endDate: trip.endDate || undefined,
        overview: trip.overview || '',
        travelMethod: trip.travelMethod || undefined,
        currency: trip.currency || 'GBP',
        contacts: [],
        places: [],
        food: [],
        activities: [],
        checklist: [],
        contentIdeas: [],
        createdAt: now,
        updatedAt: now,
      })
      return NextResponse.json({ success: true, trip: created })
    }

    // ── Update trip fields (top-level or full arrays) ────────────────
    if (action === 'update') {
      const { id, patch } = body
      if (!id) return NextResponse.json({ error: 'Missing trip id' }, { status: 400 })
      const updated = await sanity
        .patch(id)
        .set({ ...patch, updatedAt: new Date().toISOString() })
        .commit()
      return NextResponse.json({ success: true, trip: updated })
    }

    // ── Delete a trip ────────────────────────────────────────────────
    if (action === 'delete') {
      const { id } = body
      if (!id) return NextResponse.json({ error: 'Missing trip id' }, { status: 400 })
      // Remove associated email logs first, then the trip
      const logIds: string[] = await sanity.fetch(`*[_type == "travelEmailLog" && trip._ref == $id]._id`, { id })
      const tx = sanity.transaction()
      logIds.forEach((lid) => tx.delete(lid))
      tx.delete(id)
      await tx.commit()
      return NextResponse.json({ success: true })
    }

    // ── AI: generate a trip plan (places, food, activities, content) ─
    if (action === 'ai-generate-plan') {
      const { country, region, intentions } = body
      if (!country) return NextResponse.json({ error: 'Country is required' }, { status: 400 })

      const routeContext = body.routeContext || buildRouteContext(body.trip) || ''
      const routeBlock = routeContext
        ? `\n\nTHIS TRIP'S PLANNED ROUTE & PINNED STOPS (use these real locations; tailor suggestions to them):\n${routeContext}\n`
        : ''

      const where = region ? `${region}, ${country}` : country
      const prompt = `You are helping Zoe & Mark from Wise Way Round plan a food-focused trip to ${where}.
The trip intentions are: ${intentionText(intentions)}.${routeBlock}${routeContext ? '\nWhere relevant, reference the actual planned stops and route above.\n' : ''}
Suggest a practical plan as a single JSON object with these keys:
- "places": array of 6-8 objects { "name", "placeType" (e.g. restaurant, market, farm, producer, landmark), "location", "why" (1 sentence), "priority" ("Must" | "High" | "Nice to have"), "link" (the official website URL for this place if you are confident it exists, otherwise omit or use an empty string — never invent a URL) }
- "food": array of 6-8 objects { "name" (dish or product), "where" (where to find it), "notes" (1 sentence) }
- "activities": array of 4-6 objects { "name", "notes" (1 sentence) }
- "contentIdeas": array of 6-8 objects { "title", "format" (one of: short_form, long_form, cookbook_chapter, newsletter, photo_set), "platform" (e.g. Instagram, TikTok, YouTube, Website, Newsletter), "notes" (1 sentence angle), "hashtags" (array of 5-10 relevant, researched hashtags for this idea — mix broad reach tags and specific niche/location tags, each starting with #) }

For website links: only include a "link" when you are reasonably confident of the real official domain (e.g. a well-known restaurant or producer). Do not fabricate URLs — leave it blank if unsure.
For hashtags: tailor them to the platform, the topic, and the destination (${where}). Include location and food-travel tags a vanlife/foodie audience would use.
Focus on authentic, independent, food-lover-worthy picks that suit a campervan travelling audience. Mix well-known highlights with hidden gems.
Return ONLY valid JSON — no markdown, no commentary.`

      try {
        const anthropic = new Anthropic()
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }],
        })
        const plan = parseJsonBlock(extractText(message))
        const rawPlaces = Array.isArray(plan.places) ? plan.places : []
        // Verify each place link; keep the item even if the link is dropped
        const verifiedPlaces = await Promise.all(rawPlaces.map(async (pl: any) => {
          if (!pl?.link) return { ...pl, linkStatus: 'none' }
          const { link, linkStatus } = await verifyItemLink(pl.link, undefined)
          return { ...pl, link, linkStatus }
        }))
        return NextResponse.json({
          plan: {
            places: verifiedPlaces,
            food: Array.isArray(plan.food) ? plan.food : [],
            activities: Array.isArray(plan.activities) ? plan.activities : [],
            contentIdeas: Array.isArray(plan.contentIdeas) ? plan.contentIdeas : [],
          },
        })
      } catch (e: any) {
        // Graceful failure — never 500 the whole request over a generation.
        return NextResponse.json({
          plan: { places: [], food: [], activities: [], contentIdeas: [] },
          error: e?.message || 'AI failed',
        })
      }
    }

    // ── AI: generate content ideas only ──────────────────────────────
    if (action === 'ai-content-ideas') {
      const { country, region, intentions, count } = body
      if (!country) return NextResponse.json({ error: 'Country is required' }, { status: 400 })
      const num = Math.min(count || 8, 15)
      const where = region ? `${region}, ${country}` : country

      const routeContext = body.routeContext || buildRouteContext(body.trip) || ''
      const routeBlock = routeContext
        ? `\n\nTHIS TRIP'S PLANNED ROUTE & PINNED STOPS (use these real locations; tailor suggestions to them):\n${routeContext}\nBase content ideas on the actual planned stops and route above where relevant.\n`
        : ''

      const prompt = `You are helping Zoe & Mark from Wise Way Round brainstorm content for a trip to ${where}.
Trip intentions: ${intentionText(intentions)}.${routeBlock}

Generate ${num} content ideas as a JSON array of objects { "title", "format" (one of: short_form, long_form, cookbook_chapter, newsletter, photo_set), "platform", "notes" (1 sentence angle/hook), "hashtags" (array of 5-10 relevant, researched hashtags for this idea — mix broad reach tags and specific niche/location tags for ${where}, each starting with #) }.
Include a healthy mix of short-form (reels/TikTok) and long-form (articles/videos/cookbook chapters).
Tailor hashtags to the platform, the topic, and the destination — the kind a vanlife/foodie audience would actually search and use.
Return ONLY valid JSON — no markdown.`

      try {
        const anthropic = new Anthropic()
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 3000,
          messages: [{ role: 'user', content: prompt }],
        })
        const ideas = parseJsonBlock(extractText(message))
        return NextResponse.json({ ideas: Array.isArray(ideas) ? ideas : [] })
      } catch (e: any) {
        // Graceful failure — never 500 the whole request over a generation.
        return NextResponse.json({ ideas: [], error: e?.message || 'AI failed' })
      }
    }

    // ── AI: find work-exchange / volunteering / farm stays / park-ups ─
    if (action === 'ai-find-opportunities') {
      const { country, region } = body
      if (!country) return NextResponse.json({ error: 'Country is required' }, { status: 400 })
      const where = region ? `${region}, ${country}` : country

      const routeContext = body.routeContext || buildRouteContext(body.trip) || ''
      const routeBlock = routeContext
        ? `\n\nTHIS TRIP'S PLANNED ROUTE & PINNED STOPS (use these real locations; tailor suggestions to them):\n${routeContext}\nPrioritise opportunities and park-ups near the actual planned stops and route above.\n`
        : ''

      const prompt = `You are helping Zoe & Mark from Wise Way Round find ways to travel ${where} cheaply in a campervan: work-exchange placements, volunteering, farm stays, and free/cheap park-ups.${routeBlock}

Return a single JSON object with two arrays:
- "opportunities": 6-8 objects for work exchanges, volunteering and farm stays: { "name", "oppType" (one of: work_exchange, volunteering, farm_stay, host_stay), "platform" (the real platform this is found on, e.g. Workaway, WWOOF, HelpX, Worldpackers), "location", "description" (1 sentence), "exchange" (what you give and get, 1 sentence), "bestMonths" (typical season this is available, e.g. "Apr–Oct" or "Year round"), "contact" (a public contact detail ONLY if genuinely and publicly known — otherwise empty string; never invent emails), "link" (the platform's official website or a real search/listing URL — NEVER invent a specific listing URL; prefer the platform homepage or a real country search page) }
- "parkups": 6-8 objects for free or cheap overnight stops: { "name", "oppType" ("free_parkup" or "paid_stopover"), "platform" (e.g. Park4Night, Campercontact, Britstops, France Passion, aire network), "location", "description" (1 sentence), "cost" (e.g. "Free", "€12/night", "Donation"), "facilities" (short list, e.g. "Water, toilets, waste, electric"), "maxStay" (e.g. "48 hrs", "3 nights"), "rating" (typical rating if widely known, e.g. "4.5 on Park4Night", else empty), "bestMonths" (e.g. "Apr–Oct", "Year round"), "link" (real platform/website URL — never fabricate a precise coordinate link) }

Rules for links: only use URLs you are confident are real (official platform domains or genuine country/region search pages). If unsure of an exact page, use the platform homepage. Never invent listing IDs, coordinates, or contact emails.
Focus on options that genuinely suit food-loving vanlife travellers (farms, vineyards, smallholdings, community projects).
Return ONLY valid JSON — no markdown, no commentary.`

      try {
        const anthropic = new Anthropic()
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 4500,
          messages: [{ role: 'user', content: prompt }],
        })
        const parsed = parseJsonBlock(extractText(message))
        const rawOpps = Array.isArray(parsed.opportunities) ? parsed.opportunities : []
        const rawParkups = Array.isArray(parsed.parkups) ? parsed.parkups : []
        // Verify every link before returning — replace dead/deep links with the platform main page
        const [opportunities, parkups] = await Promise.all([
          verifyLinks(rawOpps),
          verifyLinks(rawParkups),
        ])
        return NextResponse.json({ opportunities, parkups })
      } catch (e: any) {
        // Graceful failure — never 500 the whole request over a generation.
        return NextResponse.json({ opportunities: [], parkups: [], error: e?.message || 'AI failed' })
      }
    }

    // ── AI: find overnight PARK-UPS along the route (fail-soft) ──────
    // Modelled on ai-search-places: the AI must NOT invent coordinates — it
    // returns a geocodable `location` per park-up. We forward-geocode each via
    // Mapbox (bounded 5-concurrent), drop any that can't geocode (no coords =
    // can't pin), verify links with checkUrl (blank if dead), and flag
    // low-confidence picks with a "Search for: " prefix. Always returns 200
    // with { parkups } (or { parkups: [], error }).
    if (action === 'ai-find-parkups') {
      const { country, region } = body as { country?: string; region?: string }
      const where = region ? `${region}, ${country || ''}`.replace(/,\s*$/, '') : (country || '')

      const routeContext = body.routeContext || buildRouteContext(body.trip) || ''
      const routeBlock = routeContext
        ? `\n\nTHIS TRIP'S PLANNED ROUTE & PINNED STOPS (draw park-ups from these real regions/route):\n${routeContext}\n`
        : ''

      const prompt = `You are helping Zoe & Mark from Wise Way Round find real overnight PARK-UPS / stopovers for a campervan${where ? ` in ${where}` : ''}.${routeBlock}
Find 8-10 real overnight park-ups / stopovers along the trip's route — free aires, paid stopovers, coastal spots, official camper stops.

CRITICAL HONESTY RULES — read carefully:
- Do NOT invent exact coordinates. For each spot, return a "location" string that is a real, geocodable place name or address (e.g. "Aire de Camping-Car, Cassis, France") — specific enough to find on a map.
- Do NOT fabricate listing URLs. Use the platform homepage (e.g. https://park4night.com) or an empty string — NEVER invent a listing ID / precise coordinate link.
- Set "confident" to false when you are describing a type of spot / a lead rather than a specific known place.

Return a JSON array called "parkups" of 8-10 objects, each with exactly these keys:
- "name" (spot name)
- "oppType" (one of: "free_parkup", "paid_stopover")
- "platform" (the real platform — Park4Night, Campercontact, Britstops, France Passion, or a real aire network)
- "location" (a real geocodable place name or address — NOT coordinates)
- "cost" (e.g. "Free", "€12/night", "Donation")
- "facilities" (short list, e.g. "Water, toilets, waste, electric")
- "maxStay" (e.g. "48 hrs", "3 nights")
- "rating" (typical rating if widely known, e.g. "4.5 on Park4Night", else "")
- "bestMonths" (e.g. "Apr–Oct", "Year round")
- "link" (real platform homepage URL ONLY if confident, otherwise "")
- "confident" (boolean — true ONLY if you're sure this specific spot exists)

Return ONLY valid JSON — no markdown, no commentary.`

      try {
        const anthropic = new Anthropic()
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }],
        })
        const parsed = parseJsonBlock(extractText(message))
        const rawParkups = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed?.parkups)
            ? parsed.parkups
            : []

        const token = process.env.MAPBOX_SECRET_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

        // Forward-geocode one location string → [lng, lat] via Mapbox.
        const geocodeOne = async (loc: string): Promise<[number, number] | null> => {
          if (!token || !loc || !loc.trim()) return null
          try {
            const q = encodeURIComponent(loc.trim())
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?limit=1&types=place,locality,region,district,address,poi&access_token=${token}`
            const res = await fetch(url, { cache: 'no-store' })
            if (!res.ok) return null
            const data = await res.json()
            const center = data?.features?.[0]?.center
            if (!Array.isArray(center) || center.length !== 2) return null
            const [lng, lat] = center
            if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null
            return [lng, lat]
          } catch {
            return null
          }
        }

        // Geocode all in parallel, bounded to 5 concurrent.
        const geocoded = await mapWithConcurrency(rawParkups, 5, async (pl: any) => {
          const coords = await geocodeOne((pl?.location || '').toString())
          if (!coords) return null // can't map a spot with no coords → skip
          const [lng, lat] = coords

          // Verify the link; blank it if unreachable.
          let link = normaliseUrl(pl?.link)
          if (link) {
            const check = await checkUrl(link)
            if (!check.ok) link = ''
          }
          // Fallback: if no usable link but we know the platform, use its homepage.
          if (!link) {
            const home = homepageForPlatform((pl?.platform || '').toString())
            if (home) link = home
          }

          // Low-confidence: prefix name so it reads as a lead, not a fact.
          let name = (pl?.name || '').toString().trim()
          if (pl?.confident === false && !/^search for:/i.test(name)) {
            name = `Search for: ${name}`.trim()
          }

          const oppType = pl?.oppType === 'paid_stopover' ? 'paid_stopover' : 'free_parkup'
          return {
            name,
            oppType,
            platform: (pl?.platform || '').toString().trim(),
            location: (pl?.location || '').toString().trim(),
            cost: (pl?.cost || '').toString().trim(),
            facilities: (pl?.facilities || '').toString().trim(),
            maxStay: (pl?.maxStay || '').toString().trim(),
            rating: (pl?.rating || '').toString().trim(),
            bestMonths: (pl?.bestMonths || '').toString().trim(),
            link,
            confident: pl?.confident !== false,
            lat,
            lng,
          }
        })

        const parkups = geocoded.filter(Boolean)
        return NextResponse.json({ parkups })
      } catch (e: any) {
        // Graceful failure — never 500 the whole request over a search.
        return NextResponse.json({ parkups: [], error: e?.message || 'AI failed' })
      }
    }

    // ── AI: find WORK-FOR-STAY opportunities along the route (fail-soft) ─
    // Same approach as ai-find-parkups: geocodable `location` (no invented
    // coordinates), forward-geocode via Mapbox (bounded 5-concurrent), drop
    // ungeocodable results, verify links, flag low-confidence with a
    // "Search for: " prefix. Always returns 200 with { workstays }.
    if (action === 'ai-find-workstays') {
      const { country, region } = body as { country?: string; region?: string }
      const where = region ? `${region}, ${country || ''}`.replace(/,\s*$/, '') : (country || '')

      const routeContext = body.routeContext || buildRouteContext(body.trip) || ''
      const routeBlock = routeContext
        ? `\n\nTHIS TRIP'S PLANNED ROUTE & PINNED STOPS (draw work-stays from these real regions/route):\n${routeContext}\n`
        : ''

      const prompt = `You are helping Zoe & Mark from Wise Way Round find real WORK-FOR-STAY / work-for-food opportunities for a campervan traveller${where ? ` in ${where}` : ''}.${routeBlock}
Find 8-10 real work-for-stay opportunities along the route — WWOOF farms, Workaway/HelpX host stays, volunteering, farm stays — where you work in exchange for a free pitch and/or meals.

CRITICAL HONESTY RULES — read carefully:
- Do NOT invent exact coordinates. For each, return a "location" string that is a real, geocodable place name or address (e.g. "Organic farm near Ronda, Andalucía, Spain") — specific enough to find on a map.
- Do NOT fabricate listing URLs. Use the platform homepage / a real search page (e.g. https://www.workaway.info) or an empty string — NEVER invent a specific listing URL.
- Set "confident" to false when you are describing a type of host / a lead rather than a specific known listing.

Return a JSON array called "workstays" of 8-10 objects, each with exactly these keys:
- "name" (host / farm / project name)
- "oppType" (one of: "work_exchange", "volunteering", "farm_stay", "host_stay")
- "platform" (the real platform — Workaway, WWOOF, HelpX, Worldpackers)
- "location" (a real geocodable place name or address — NOT coordinates)
- "exchange" (what you give and get, 1 sentence — e.g. "4 hrs/day help for a free pitch + meals")
- "bestMonths" (e.g. "Apr–Oct", "Year round")
- "link" (real platform / search-page URL ONLY if confident, otherwise "")
- "confident" (boolean — true ONLY if you're sure this specific listing exists)

Return ONLY valid JSON — no markdown, no commentary.`

      try {
        const anthropic = new Anthropic()
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }],
        })
        const parsed = parseJsonBlock(extractText(message))
        const rawStays = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed?.workstays)
            ? parsed.workstays
            : []

        const token = process.env.MAPBOX_SECRET_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

        // Forward-geocode one location string → [lng, lat] via Mapbox.
        const geocodeOne = async (loc: string): Promise<[number, number] | null> => {
          if (!token || !loc || !loc.trim()) return null
          try {
            const q = encodeURIComponent(loc.trim())
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?limit=1&types=place,locality,region,district,address,poi&access_token=${token}`
            const res = await fetch(url, { cache: 'no-store' })
            if (!res.ok) return null
            const data = await res.json()
            const center = data?.features?.[0]?.center
            if (!Array.isArray(center) || center.length !== 2) return null
            const [lng, lat] = center
            if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null
            return [lng, lat]
          } catch {
            return null
          }
        }

        // Geocode all in parallel, bounded to 5 concurrent.
        const VALID_TYPES = ['work_exchange', 'volunteering', 'farm_stay', 'host_stay']
        const geocoded = await mapWithConcurrency(rawStays, 5, async (pl: any) => {
          const coords = await geocodeOne((pl?.location || '').toString())
          if (!coords) return null // can't map with no coords → skip
          const [lng, lat] = coords

          // Verify the link; blank it if unreachable.
          let link = normaliseUrl(pl?.link)
          if (link) {
            const check = await checkUrl(link)
            if (!check.ok) link = ''
          }
          // Fallback: if no usable link but we know the platform, use its homepage.
          if (!link) {
            const home = homepageForPlatform((pl?.platform || '').toString())
            if (home) link = home
          }

          // Low-confidence: prefix name so it reads as a lead, not a fact.
          let name = (pl?.name || '').toString().trim()
          if (pl?.confident === false && !/^search for:/i.test(name)) {
            name = `Search for: ${name}`.trim()
          }

          const oppType = VALID_TYPES.includes(pl?.oppType) ? pl.oppType : 'work_exchange'
          return {
            name,
            oppType,
            platform: (pl?.platform || '').toString().trim(),
            location: (pl?.location || '').toString().trim(),
            exchange: (pl?.exchange || '').toString().trim(),
            bestMonths: (pl?.bestMonths || '').toString().trim(),
            link,
            confident: pl?.confident !== false,
            lat,
            lng,
          }
        })

        const workstays = geocoded.filter(Boolean)
        return NextResponse.json({ workstays })
      } catch (e: any) {
        // Graceful failure — never 500 the whole request over a search.
        return NextResponse.json({ workstays: [], error: e?.message || 'AI failed' })
      }
    }

    // ── AI: find work + park-ups NEAR a live location (geolocation) ───
    if (action === 'ai-find-nearby') {
      const { lat, lng } = body as { lat?: number; lng?: number }
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        return NextResponse.json({ error: 'Valid coordinates are required' }, { status: 400 })
      }
      const placeName = await reverseGeocode(lat, lng)
      const whereText = placeName
        ? `near ${placeName} (coordinates ${lat.toFixed(3)}, ${lng.toFixed(3)})`
        : `near coordinates ${lat.toFixed(3)}, ${lng.toFixed(3)}`

      const routeContext = body.routeContext || buildRouteContext(body.trip) || ''
      const routeBlock = routeContext
        ? `\n\nTHIS TRIP'S PLANNED ROUTE & PINNED STOPS (use these real locations; tailor suggestions to them):\n${routeContext}\nWhere it helps, relate nearby options to the planned stops and route above.\n`
        : ''

      const prompt = `Zoe & Mark from Wise Way Round is travelling in a campervan and is currently ${whereText}. Find work and stay options within roughly 30–50km that he could act on now.${routeBlock}

Return a single JSON object with two arrays:
- "opportunities": 5-7 nearby work exchanges / volunteering / farm stays: { "name", "oppType" (one of: work_exchange, volunteering, farm_stay, host_stay), "platform" (real platform to find/apply, e.g. Workaway, WWOOF, HelpX), "location" (nearby town/area), "description" (1 sentence), "exchange" (what you give and get), "contact" (public contact ONLY if genuinely known, else empty string — never invent), "link" (real platform website or genuine local search page — never fabricate a listing URL) }
- "parkups": 6-8 nearby overnight stops: { "name", "oppType" ("free_parkup" or "paid_stopover"), "platform" (e.g. Park4Night, Campercontact, aire network), "location", "description" (1 sentence), "cost", "facilities", "maxStay", "rating" (if widely known, else empty), "link" (real platform/search URL — never fabricate coordinates) }

Base suggestions on genuinely known places and platforms for this area. If you are not confident a specific spot exists, describe the type of spot and point to the right platform search page rather than inventing a precise listing. Never invent contact emails, phone numbers, coordinates or listing IDs.
Prioritise the closest, most practical options first.
Return ONLY valid JSON — no markdown, no commentary.`

      try {
        const anthropic = new Anthropic()
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 4500,
          messages: [{ role: 'user', content: prompt }],
        })
        const parsed = parseJsonBlock(extractText(message))
        const rawOpps = (Array.isArray(parsed.opportunities) ? parsed.opportunities : []).map((o: any) => ({ ...o, nearMe: true }))
        const rawParkups = (Array.isArray(parsed.parkups) ? parsed.parkups : []).map((o: any) => ({ ...o, nearMe: true }))
        const [opportunities, parkups] = await Promise.all([
          verifyLinks(rawOpps),
          verifyLinks(rawParkups),
        ])
        return NextResponse.json({ opportunities, parkups, placeName })
      } catch (e: any) {
        // Graceful failure — never 500 the whole request over a lookup.
        return NextResponse.json({ opportunities: [], parkups: [], placeName, error: e?.message || 'AI failed' })
      }
    }

    // ── Verify a batch of links on demand (main-page fallback) ────────
    if (action === 'verify-links') {
      const { items } = body as { items?: Array<{ key?: string; link?: string; platform?: string }> }
      if (!Array.isArray(items)) return NextResponse.json({ error: 'No items provided' }, { status: 400 })
      const results = await Promise.all(items.map(async (it) => {
        const { link, linkStatus } = await verifyItemLink(it.link, it.platform)
        return { key: it.key, link, linkStatus }
      }))
      return NextResponse.json({ results })
    }

    // ── Forward-geocode a place name → coordinates (itinerary legs) ───
    if (action === 'geocode') {
      const { query } = body as { query?: string }
      if (!query || !query.trim()) return NextResponse.json({ error: 'A place name is required' }, { status: 400 })
      const token = process.env.MAPBOX_SECRET_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
      if (!token) return NextResponse.json({ error: 'Geocoding unavailable — Mapbox not configured', results: [] })
      try {
        const q = encodeURIComponent(query.trim())
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?limit=5&types=place,locality,region,district,address,poi&access_token=${token}`
        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok) return NextResponse.json({ error: 'Geocoding request failed', results: [] }, { status: 502 })
        const data = await res.json()
        const results = (data.features || [])
          .filter((f: any) => Array.isArray(f.center) && f.center.length === 2)
          .map((f: any) => ({ label: f.place_name as string, lat: f.center[1] as number, lng: f.center[0] as number }))
        return NextResponse.json({ results })
      } catch (e: any) {
        return NextResponse.json({ error: e?.message || 'Geocoding failed', results: [] }, { status: 502 })
      }
    }

    // ── AI: free-text place search for the Route Map (fail-soft) ─────
    // Asks the AI for 6-8 places matching a free-text query, drawn from the
    // trip's route/regions. The AI must NOT invent coordinates — it returns a
    // geocodable `location` string per place. We then forward-geocode each
    // location via Mapbox (bounded parallel), drop any place that can't be
    // geocoded (no coords = can't pin on the map), verify links, and flag
    // low-confidence picks with a "Search for: " prefix. Always returns 200
    // with { places } (or { places: [], error }).
    if (action === 'ai-search-places') {
      const { query } = body as { query?: string }
      if (!query || !query.trim()) {
        return NextResponse.json({ places: [], error: 'A search query is required' })
      }

      const routeContext = body.routeContext || buildRouteContext(body.trip) || ''
      const routeBlock = routeContext
        ? `\n\nTHIS TRIP'S PLANNED ROUTE & PINNED STOPS (draw suggestions from these real regions/route):\n${routeContext}\n`
        : ''

      const prompt = `You are helping Zoe & Mark from Wise Way Round — a food, vanlife and travel content creator — find real places matching a search.

Search query: "${query.trim()}"${routeBlock}
Suggest 6-8 real places that match the query, drawn from the trip's route/regions above where relevant (if no route is given, use the query's own geography).

CRITICAL RULES — read carefully:
- Do NOT invent coordinates. For each place, return a "location" string that is a real, geocodable place name or address (e.g. "Elafonissi Beach, Crete, Greece") — specific enough to find on a map.
- Only include a "link" when you are genuinely confident of the real official URL; otherwise use an empty string. Never fabricate a URL.
- Set "confident" to false when you are describing a type of place / a lead rather than a specific known place.

Return a JSON array called "places" of 6-8 objects, each with exactly these keys:
- "name" (place name)
- "placeType" (e.g. beach, restaurant, market, viewpoint, ruins, park-up, producer, landmark)
- "location" (a real geocodable place name or address — NOT coordinates)
- "why" (1 sentence on why it fits the search)
- "link" (real official URL ONLY if confident, otherwise "")
- "confident" (boolean — true ONLY if you're sure this specific place exists)

Return ONLY valid JSON — no markdown, no commentary.`

      try {
        const anthropic = new Anthropic()
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 3000,
          messages: [{ role: 'user', content: prompt }],
        })
        const parsed = parseJsonBlock(extractText(message))
        const rawPlaces = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed?.places)
            ? parsed.places
            : []

        const token = process.env.MAPBOX_SECRET_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

        // Forward-geocode one location string → [lng, lat] via Mapbox
        // (same approach as the `geocode` action: features[0].center).
        const geocodeOne = async (loc: string): Promise<[number, number] | null> => {
          if (!token || !loc || !loc.trim()) return null
          try {
            const q = encodeURIComponent(loc.trim())
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?limit=1&types=place,locality,region,district,address,poi&access_token=${token}`
            const res = await fetch(url, { cache: 'no-store' })
            if (!res.ok) return null
            const data = await res.json()
            const center = data?.features?.[0]?.center
            if (!Array.isArray(center) || center.length !== 2) return null
            const [lng, lat] = center
            if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null
            return [lng, lat]
          } catch {
            return null
          }
        }

        // Geocode all locations in parallel, bounded to 5 concurrent.
        const geocoded = await mapWithConcurrency(rawPlaces, 5, async (pl: any) => {
          const coords = await geocodeOne((pl?.location || '').toString())
          if (!coords) return null // can't map a place with no coords → skip
          const [lng, lat] = coords

          // Verify the link; blank it if unreachable.
          let link = normaliseUrl(pl?.link)
          if (link) {
            const check = await checkUrl(link)
            if (!check.ok) link = ''
          }

          // Low-confidence: prefix name so it reads as a lead, not a fact.
          let name = (pl?.name || '').toString().trim()
          if (pl?.confident === false && !/^search for:/i.test(name)) {
            name = `Search for: ${name}`.trim()
          }

          return {
            name,
            placeType: (pl?.placeType || '').toString().trim(),
            location: (pl?.location || '').toString().trim(),
            why: (pl?.why || '').toString().trim(),
            link,
            lat,
            lng,
            confident: pl?.confident !== false,
          }
        })

        const places = geocoded.filter(Boolean)
        return NextResponse.json({ places })
      } catch (e: any) {
        // Graceful failure — never 500 the whole request over a search.
        return NextResponse.json({ places: [], error: e?.message || 'AI failed' })
      }
    }

    // ── AI: find ICONIC / SCENIC ROADS & mountain passes (fail-soft) ──
    // Modelled on ai-search-places / ai-find-parkups: the model returns a
    // geocodable `location` string (NEVER coordinates); the server
    // forward-geocodes each location via Mapbox (bounded 5-concurrent) and
    // returns server-side coords so the client can pin. Low-confidence or
    // ungeocodable picks are KEPT with a "Search for: " name prefix per the
    // existing convention (so they read as leads, not facts). Always returns
    // HTTP 200 with { roads } (or { roads: [], error }). No Sanity write.
    if (action === 'ai-find-scenic-roads') {
      const { country, region, legLabel } = body as {
        country?: string
        region?: string
        legLabel?: string
      }
      const where = region ? `${region}, ${country || ''}`.replace(/,\s*$/, '') : (country || '')

      const routeContext = body.routeContext || buildRouteContext(body.trip) || ''
      const routeBlock = routeContext
        ? `\n\nTHIS TRIP'S PLANNED ROUTE & PINNED STOPS (draw scenic roads from these real regions/route):\n${routeContext}\n`
        : ''
      const focusBlock = legLabel && legLabel.trim()
        ? `\n\nFocus especially on iconic/scenic roads near this stop/leg: "${legLabel.trim()}".\n`
        : ''

      const prompt = `You are helping Zoe & Mark from Wise Way Round find ICONIC, well-known SCENIC ROADS and MOUNTAIN PASSES for a campervan road trip${where ? ` in ${where}` : ''}.${routeBlock}${focusBlock}
Suggest 0-20 genuinely iconic, well-known scenic roads and mountain passes relevant to the trip's route/regions above (if no route is given, use the region's own geography).

CRITICAL HONESTY RULES — read carefully:
- Do NOT invent exact coordinates. For each road, return a "location" string that is a real, geocodable place name describing where the road is (e.g. "Furka Pass, Switzerland", "Transfagarasan, Romania") — specific enough to find on a map.
- Do NOT invent roads. Only include roads/passes you genuinely know exist.
- Set "confident" to false when you are unsure a specific road exists or when you are describing a type of road / a lead rather than a specific known road.

Return a JSON array called "roads" of 0-20 objects, each with exactly these keys:
- "name" (the road / pass name, e.g. "Transfagarasan Highway")
- "location" (a real geocodable place name — NOT coordinates)
- "roadType" (e.g. "mountain pass", "coastal road", "scenic byway")
- "why" (1 sentence on why it is iconic / worth driving)
- "bestMonths" (e.g. "May–Oct", "Year round", or "")
- "scenicRating" (free text if widely known, e.g. "5/5", else "")
- "seasonalNote" (short knowledge-based note on seasonality / closures, else "")
- "confident" (boolean — true ONLY if you're sure this specific road exists)

Return ONLY valid JSON — no markdown, no commentary.`

      try {
        const anthropic = new Anthropic()
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }],
        })
        const parsed = parseJsonBlock(extractText(message))
        const rawRoads = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed?.roads)
            ? parsed.roads
            : []

        const token = process.env.MAPBOX_SECRET_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

        // Forward-geocode one location string → [lng, lat] via Mapbox.
        const geocodeOne = async (loc: string): Promise<[number, number] | null> => {
          if (!token || !loc || !loc.trim()) return null
          try {
            const q = encodeURIComponent(loc.trim())
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?limit=1&types=place,locality,region,district,address,poi&access_token=${token}`
            const res = await fetch(url, { cache: 'no-store' })
            if (!res.ok) return null
            const data = await res.json()
            const center = data?.features?.[0]?.center
            if (!Array.isArray(center) || center.length !== 2) return null
            const [lng, lat] = center
            if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null
            return [lng, lat]
          } catch {
            return null
          }
        }

        // Geocode all in parallel, bounded to 5 concurrent. Unlike the place/
        // park-up finders we KEEP ungeocodable or low-confidence roads (flagged
        // with a "Search for: " prefix) so the user still gets the lead — they
        // simply arrive without server coords (coords are NEVER model-supplied).
        const geocoded = await mapWithConcurrency(rawRoads, 5, async (rd: any) => {
          const coords = await geocodeOne((rd?.location || '').toString())
          const lowConfidence = rd?.confident === false || !coords

          // Low-confidence / ungeocodable: prefix name so it reads as a lead.
          let name = (rd?.name || '').toString().trim()
          if (lowConfidence && !/^search for:/i.test(name)) {
            name = `Search for: ${name}`.trim()
          }

          const road: any = {
            name,
            location: (rd?.location || '').toString().trim(),
            roadType: (rd?.roadType || '').toString().trim(),
            why: (rd?.why || '').toString().trim(),
            bestMonths: (rd?.bestMonths || '').toString().trim(),
            scenicRating: (rd?.scenicRating || '').toString().trim(),
            seasonalNote: (rd?.seasonalNote || '').toString().trim(),
            confident: rd?.confident !== false,
          }
          // Attach server-side coordinates ONLY when we geocoded them.
          if (coords) {
            road.lat = coords[1]
            road.lng = coords[0]
          }
          return road
        })

        const roads = geocoded.filter(Boolean)
        return NextResponse.json({ roads })
      } catch (e: any) {
        // Graceful failure — never 500 the whole request over a search.
        return NextResponse.json({ roads: [], error: e?.message || 'AI failed' })
      }
    }

    // ── AI: find SCENIC overnight PARK-UPS near a stop (fail-soft) ────
    // Modelled on ai-find-parkups with a SCENIC emphasis + per-stop focus.
    // Model knowledge ONLY — no Park4Night API. Returns a geocodable
    // `location` (NEVER coordinates); the server forward-geocodes via Mapbox
    // (bounded 5-concurrent); low-confidence/ungeocodable picks are kept with
    // a "Search for: " prefix. Always returns HTTP 200 with { parkups }
    // (or { parkups: [], error }). No Sanity write.
    if (action === 'ai-find-scenic-parkups') {
      const { country, region, stopLabel } = body as {
        country?: string
        region?: string
        stopLabel?: string
      }
      const where = region ? `${region}, ${country || ''}`.replace(/,\s*$/, '') : (country || '')

      const routeContext = body.routeContext || buildRouteContext(body.trip) || ''
      const routeBlock = routeContext
        ? `\n\nTHIS TRIP'S PLANNED ROUTE & PINNED STOPS (draw park-ups from these real regions/route):\n${routeContext}\n`
        : ''
      const focusBlock = stopLabel && stopLabel.trim()
        ? `\n\nFocus especially on scenic park-ups near this stop: "${stopLabel.trim()}".\n`
        : ''

      const prompt = `You are helping Zoe & Mark from Wise Way Round find likely SCENIC overnight PARK-UP spots for a campervan${where ? ` in ${where}` : ''}.${routeBlock}${focusBlock}
Suggest the best SCENIC overnight park-up spots (sea views, mountain views, lakes, forests, dramatic landscapes) — prioritise the most scenic spots over the merely convenient.

CRITICAL HONESTY RULES — read carefully:
- Use your own knowledge ONLY. Do NOT claim access to any live Park4Night data or listings.
- Do NOT invent exact coordinates. For each spot, return a "location" string that is a real, geocodable place name or address (e.g. "Lac de Sainte-Croix, France") — specific enough to find on a map.
- Set "confident" to false when you are describing a type of scenic spot / a lead rather than a specific known place.

Return a JSON array called "parkups" of objects, each with exactly these keys:
- "name" (spot name)
- "location" (a real geocodable place name or address — NOT coordinates)
- "description" (1 sentence, or "")
- "facilities" (short list, e.g. "Water, toilets, waste", or "")
- "cost" (e.g. "Free", "€12/night", "Donation", or "")
- "rating" (typical rating if widely known, else "")
- "scenicNote" (what makes it scenic — the view / setting)
- "bestMonths" (e.g. "Apr–Oct", "Year round", or "")
- "confident" (boolean — true ONLY if you're sure this specific spot exists)

Return ONLY valid JSON — no markdown, no commentary.`

      try {
        const anthropic = new Anthropic()
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }],
        })
        const parsed = parseJsonBlock(extractText(message))
        const rawParkups = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed?.parkups)
            ? parsed.parkups
            : []

        const token = process.env.MAPBOX_SECRET_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

        // Forward-geocode one location string → [lng, lat] via Mapbox.
        const geocodeOne = async (loc: string): Promise<[number, number] | null> => {
          if (!token || !loc || !loc.trim()) return null
          try {
            const q = encodeURIComponent(loc.trim())
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?limit=1&types=place,locality,region,district,address,poi&access_token=${token}`
            const res = await fetch(url, { cache: 'no-store' })
            if (!res.ok) return null
            const data = await res.json()
            const center = data?.features?.[0]?.center
            if (!Array.isArray(center) || center.length !== 2) return null
            const [lng, lat] = center
            if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null
            return [lng, lat]
          } catch {
            return null
          }
        }

        // Geocode all in parallel, bounded to 5 concurrent. Keep ungeocodable /
        // low-confidence spots flagged with a "Search for: " prefix (coords are
        // NEVER model-supplied — only ever the server's Mapbox geocode).
        const geocoded = await mapWithConcurrency(rawParkups, 5, async (pl: any) => {
          const coords = await geocodeOne((pl?.location || '').toString())
          const lowConfidence = pl?.confident === false || !coords

          let name = (pl?.name || '').toString().trim()
          if (lowConfidence && !/^search for:/i.test(name)) {
            name = `Search for: ${name}`.trim()
          }

          const parkup: any = {
            name,
            location: (pl?.location || '').toString().trim(),
            description: (pl?.description || '').toString().trim(),
            facilities: (pl?.facilities || '').toString().trim(),
            cost: (pl?.cost || '').toString().trim(),
            rating: (pl?.rating || '').toString().trim(),
            scenicNote: (pl?.scenicNote || '').toString().trim(),
            bestMonths: (pl?.bestMonths || '').toString().trim(),
            confident: pl?.confident !== false,
          }
          if (coords) {
            parkup.lat = coords[1]
            parkup.lng = coords[0]
          }
          return parkup
        })

        const parkups = geocoded.filter(Boolean)
        return NextResponse.json({ parkups })
      } catch (e: any) {
        // Graceful failure — never 500 the whole request over a search.
        return NextResponse.json({ parkups: [], error: e?.message || 'AI failed' })
      }
    }

    // ── AI: SEASONAL ROAD-SAFETY guidance for a road/leg (fail-soft) ──
    // Model KNOWLEDGE ONLY, keyed to a month — there is NO live road-status
    // API and no external road service is ever called. Returns typical
    // seasonal guidance (closures, winter risks) plus a verifyNote that states
    // the guidance has no live source and must be verified before travel.
    // Always returns HTTP 200 with { safety } (or { safety: null, error }).
    // No Sanity write.
    if (action === 'ai-road-safety') {
      const { roadOrLegName, month, country, region } = body as {
        roadOrLegName?: string
        month?: string | number
        country?: string
        region?: string
      }
      const where = region ? `${region}, ${country || ''}`.replace(/,\s*$/, '') : (country || '')
      const monthStr = (month ?? '').toString().trim()
      const target = (roadOrLegName || '').toString().trim()

      const prompt = `You are helping Zoe & Mark from Wise Way Round understand typical SEASONAL ROAD SAFETY for a campervan road trip.

Road or area: "${target}"${where ? ` (in ${where})` : ''}.
Month of travel: "${monthStr}".

CRITICAL HONESTY RULES — read carefully:
- Use your own general knowledge ONLY. You do NOT have access to any live road-status / closure data source. Do NOT claim current, real-time conditions.
- Give TYPICAL seasonal guidance for this road/area in the given month: likely closures, and winter risks such as snow, chains requirements, and ice.
- If you are unsure, say so plainly rather than inventing specifics.

Return a single JSON object with exactly these keys:
- "summary" (2-3 sentence overview of typical conditions for this road/area in this month)
- "closures" (array of strings — typical seasonal closures to be aware of; [] if none)
- "winterRisks" (array of strings — snow / chains / ice and similar risks; [] if none)
- "verifyNote" (a sentence stating this is general knowledge with NO live data source and must be verified with official/local sources before travel)

Return ONLY valid JSON — no markdown, no commentary.`

      try {
        const anthropic = new Anthropic()
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }],
        })
        const parsed = parseJsonBlock(extractText(message))

        const toStringArray = (v: any): string[] =>
          Array.isArray(v) ? v.map((x) => (x ?? '').toString().trim()).filter(Boolean) : []

        const verifyNote = (parsed?.verifyNote || '').toString().trim()
          || 'This is general seasonal knowledge only — there is no live road-status data source. Verify current conditions with official and local sources before travelling.'

        const safety = {
          summary: (parsed?.summary || '').toString().trim(),
          closures: toStringArray(parsed?.closures),
          winterRisks: toStringArray(parsed?.winterRisks),
          verifyNote,
        }
        return NextResponse.json({ safety })
      } catch (e: any) {
        // Graceful failure — never 500 the whole request over a lookup.
        return NextResponse.json({ safety: null, error: e?.message || 'AI failed' })
      }
    }

    // ── AI: RE-PLAN the itinerary from a free-text instruction (fail-soft) ─
    // Reads the current itinerary FROM `trip` (never hard-coded here) and
    // proposes an adjusted ordered itinerary honouring the instruction. The
    // HANDLER performs NO Sanity write — proposals are applied client-side
    // only. Geocoding of proposals is deferred to accept-time, so this handler
    // does NOT geocode. Always returns HTTP 200 with { proposedLegs }
    // (or { proposedLegs: [], error }).
    if (action === 'ai-replan-route') {
      const { instruction, trip } = body as { instruction?: string; trip?: any }

      const routeContext = body.routeContext || buildRouteContext(trip) || ''
      const routeBlock = routeContext
        ? `\n\nTHIS TRIP'S CURRENT ITINERARY & PINNED STOPS (adjust THIS real itinerary — do not invent a new one):\n${routeContext}\n`
        : ''

      const prompt = `You are helping Zoe & Mark from Wise Way Round re-plan a campervan road-trip itinerary.${routeBlock}
Instruction from the user: "${(instruction || '').toString().trim()}"

Propose an ADJUSTED, ordered itinerary that honours the instruction while respecting the trip's existing legs, dates, and countries above. Keep legs the user clearly wants; only change what the instruction implies. Do not invent an entirely new trip.

CRITICAL HONESTY RULES — read carefully:
- Base the proposal on the real itinerary above. Do NOT invent coordinates — return a geocodable "location" string for each leg (coordinates are added later when the user accepts).
- Keep dates realistic and in order; use "YYYY-MM-DD" format when you set them.

Return a JSON array called "proposedLegs" of objects (in travel order), each with exactly these keys:
- "label" (stop / leg name)
- "country" (country name, or "")
- "startDate" ("YYYY-MM-DD" or "")
- "endDate" ("YYYY-MM-DD" or "")
- "location" (a real geocodable place name — NOT coordinates)
- "priorityLevel" (one of "Must-do" or "Optional")
- "notes" (1 sentence on the change / rationale, or "")

Return ONLY valid JSON — no markdown, no commentary.`

      try {
        const anthropic = new Anthropic()
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }],
        })
        const parsed = parseJsonBlock(extractText(message))
        const rawLegs = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed?.proposedLegs)
            ? parsed.proposedLegs
            : []

        const proposedLegs = rawLegs.map((lg: any) => {
          const priorityLevel = lg?.priorityLevel === 'Optional' ? 'Optional' : 'Must-do'
          return {
            label: (lg?.label || '').toString().trim(),
            country: (lg?.country || '').toString().trim(),
            startDate: (lg?.startDate || '').toString().trim(),
            endDate: (lg?.endDate || '').toString().trim(),
            location: (lg?.location || '').toString().trim(),
            priorityLevel,
            notes: (lg?.notes || '').toString().trim(),
          }
        }).filter((lg: any) => lg.label)

        return NextResponse.json({ proposedLegs })
      } catch (e: any) {
        // Graceful failure — never 500 the whole request; itinerary unchanged.
        return NextResponse.json({ proposedLegs: [], error: e?.message || 'AI failed' })
      }
    }

    // ── Exact drive time + distance between two places (fail-soft) ────
    // Geocodes From/To (or uses supplied coords) and asks Mapbox Directions
    // for the real driving duration and distance. Every path returns HTTP 200
    // with { ok } — never a 500 — matching the fail-soft ai-*/geocode actions.
    if (action === 'event-drive-time') {
      const { fromLocation, toLocation, from, to } = body as {
        fromLocation?: string
        toLocation?: string
        from?: { lat?: number; lng?: number }
        to?: { lat?: number; lng?: number }
      }

      // Resolve the Mapbox token exactly as geocode/isochrone do.
      const token = process.env.MAPBOX_SECRET_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
      if (!token) {
        return NextResponse.json({ ok: false, message: 'Drive-time lookup unavailable — Mapbox not configured' })
      }

      // Forward-geocode a place name → [lng, lat] using the same Mapbox
      // geocoding approach the `geocode` action uses (features[0].center).
      const geocodeOne = async (query: string): Promise<[number, number] | null> => {
        const q = encodeURIComponent(query.trim())
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?limit=5&types=place,locality,region,district,address,poi&access_token=${token}`
        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok) return null
        const data = await res.json()
        const center = data?.features?.[0]?.center
        if (!Array.isArray(center) || center.length !== 2) return null
        const [lng, lat] = center
        if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null
        return [lng, lat]
      }

      // Resolve an endpoint: prefer supplied finite coords, else geocode the string.
      const resolveEndpoint = async (
        coords: { lat?: number; lng?: number } | undefined,
        place: string | undefined
      ): Promise<[number, number] | null> => {
        if (coords && Number.isFinite(coords.lng) && Number.isFinite(coords.lat)) {
          return [coords.lng as number, coords.lat as number]
        }
        if (place && place.trim()) return geocodeOne(place)
        return null
      }

      const fromPoint = await resolveEndpoint(from, fromLocation)
      const toPoint = await resolveEndpoint(to, toLocation)
      if (!fromPoint || !toPoint) {
        return NextResponse.json({ ok: false, message: 'Could not find one of those places — check the spelling' })
      }

      const result = await drivingDurationDistance(fromPoint[0], fromPoint[1], toPoint[0], toPoint[1], token)
      if (!result) {
        return NextResponse.json({ ok: false, message: 'No drivable route between those places' })
      }

      return NextResponse.json({
        ok: true,
        durationSeconds: result.durationSeconds,
        distanceMeters: result.distanceMeters,
        label: `${fromLocation || ''} → ${toLocation || ''}`,
        message: '',
      })
    }

    // ── AI: suggest a midway stopover to break an over-long drive ────
    if (action === 'ai-suggest-stopover') {
      const { from, to, maxHours } = body as {
        from?: { lat?: number; lng?: number; label?: string }
        to?: { lat?: number; lng?: number; label?: string }
        maxHours?: number
      }
      // Validate both endpoints have finite coordinates.
      if (
        !from ||
        !to ||
        !Number.isFinite(from.lat) ||
        !Number.isFinite(from.lng) ||
        !Number.isFinite(to.lat) ||
        !Number.isFinite(to.lng)
      ) {
        return NextResponse.json({ error: 'Valid from/to coordinates are required' }, { status: 400 })
      }

      // Geographic midpoint (simple average is fine for breaking a drive).
      const midLat = ((from.lat as number) + (to.lat as number)) / 2
      const midLng = ((from.lng as number) + (to.lng as number)) / 2

      try {
        if (!process.env.ANTHROPIC_API_KEY) {
          return NextResponse.json({ suggestions: [], error: 'AI unavailable' })
        }
        const midpointName = await reverseGeocode(midLat, midLng)
        const limitHours = Number.isFinite(maxHours) && (maxHours as number) > 0 ? (maxHours as number) : 6
        const fromText = from.label?.trim() || `${(from.lat as number).toFixed(3)}, ${(from.lng as number).toFixed(3)}`
        const toText = to.label?.trim() || `${(to.lat as number).toFixed(3)}, ${(to.lng as number).toFixed(3)}`
        const nearText = midpointName ? ` (roughly near ${midpointName})` : ''

        const routeContext = body.routeContext || buildRouteContext(body.trip) || ''
        const routeBlock = routeContext
          ? `\n\nTHIS TRIP'S PLANNED ROUTE & PINNED STOPS (use these real locations; tailor suggestions to them):\n${routeContext}\nPrefer stopovers that fit naturally with the planned stops and route above.\n`
          : ''

        const prompt = `Zoe & Mark from Wise Way Round is driving from ${fromText} to ${toText} in a campervan. This drive is too long to do in one go (his limit is about ${limitHours} hours per day), so he wants to break the journey with an overnight stop roughly halfway${nearText}.${routeBlock}

Suggest 1-3 good overnight stopover towns or villages roughly halfway along this route that suit a campervan foodie traveller (somewhere with character, good food nearby, and practical for parking a van overnight).

Return each as a JSON object: { "name" (the town/village), "why" (1 sentence on why it's a good break), "approxLocation" (a human description of where it is, e.g. "midway between X and Y, near the coast") }.
Never invent coordinates. Return ONLY a JSON array — no markdown, no commentary.`

        const anthropic = new Anthropic()
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 1200,
          messages: [{ role: 'user', content: prompt }],
        })
        const parsed = parseJsonBlock(extractText(message))
        const suggestions = Array.isArray(parsed) ? parsed : []
        return NextResponse.json({ suggestions, midpointName })
      } catch (e: any) {
        // Graceful failure — never 500 the whole request over a suggestion.
        return NextResponse.json({ suggestions: [], error: e?.message || 'AI unavailable' })
      }
    }

    // ── AI: find nearest major airports (IATA + distance) for flights ─
    if (action === 'ai-nearest-airports') {
      const { query, lat, lng } = body as { query?: string; lat?: number; lng?: number }
      const hasQuery = typeof query === 'string' && query.trim().length > 0
      const hasCoords = Number.isFinite(lat) && Number.isFinite(lng)
      if (!hasQuery && !hasCoords) {
        return NextResponse.json({ error: 'A place name or valid coordinates are required' }, { status: 400 })
      }

      try {
        if (!process.env.ANTHROPIC_API_KEY) {
          return NextResponse.json({ airports: [], error: 'AI unavailable' })
        }

        // Resolve a human location description. Reverse-geocode coords when no query is given.
        let placeName: string | undefined
        let locationDesc: string
        if (hasQuery) {
          locationDesc = (query as string).trim()
        } else {
          placeName = await reverseGeocode(lat as number, lng as number)
          locationDesc = placeName || `${lat},${lng}`
        }

        const prompt = `List the 3-5 nearest major passenger airports to ${locationDesc}. For each return JSON { "name", "iata" (3-letter IATA code), "city", "approxDistanceKm" (approximate driving distance in km, number), "lat" (number), "lng" (number) }. Only real airports with real IATA codes; order nearest first. Never invent codes or coordinates — if unsure of exact coordinates, still give the airport but omit lat/lng. Return ONLY a JSON array.`

        const anthropic = new Anthropic()
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 1200,
          messages: [{ role: 'user', content: prompt }],
        })
        const parsed = parseJsonBlock(extractText(message))
        const results = Array.isArray(parsed) ? parsed : []
        return NextResponse.json({ airports: results, placeName })
      } catch (e: any) {
        // Graceful failure — never 500 the whole request over an airport lookup.
        return NextResponse.json({ airports: [], error: e?.message || 'Airport lookup failed' })
      }
    }

    // ── AI: per-account content ideas tuned to the planned route ─────
    if (action === 'ai-account-content') {
      const { account, accountLabel, accountNiche, accountIsFood, country, region, intentions } = body as {
        account?: string
        accountLabel?: string
        accountNiche?: string
        accountIsFood?: boolean
        country?: string
        region?: string
        intentions?: string[]
      }

      // Accounts are now editable per-trip, so the account details come from the
      // body rather than a hardcoded map. Fall back gracefully if any are missing.
      const name = (accountLabel || '').toString().trim() || 'this account'
      const brief = (accountNiche || '').toString().trim() || 'general travel & vanlife content'
      const isFood = !!accountIsFood

      const foodRule = isFood
        ? 'Food is central to this account — regional dishes, markets, producers, and cooking are the main subjects.'
        : 'IMPORTANT: This account is NOT a food channel. Do NOT create food-led ideas. No recipes, dishes, restaurants, markets, tavernas, or "what to eat" content as the subject or hook of any idea. Food may only appear incidentally (e.g. a coffee stop mentioned in passing), never as the focus. Keep every idea centred on this account\u2019s actual niche.'

      const briefText = isFood
        ? brief
        : `${brief} This is NOT a food channel — do not lead with food.`

      const routeContext = body.routeContext || buildRouteContext(body.trip) || ''
      const routeBlock = routeContext
        ? `\n\nTHIS TRIP'S PLANNED ROUTE & PINNED STOPS (use these REAL locations — base ideas on them):\n${routeContext}\n`
        : ''
      const where = [region, country].filter(Boolean).join(', ')

      const prompt = `You are brainstorming content ideas for the "${name}" account.
Account voice & niche: ${briefText}
${where ? `Destination: ${where}.\n` : ''}Trip intentions: ${intentionText(intentions)}.${routeBlock}
Generate 8-10 content ideas as a JSON array of objects with exactly these keys:
- "title"
- "format" (one of: short_form, long_form, travel_guide)
- "platform" (e.g. Instagram, TikTok, YouTube, Blog, Newsletter)
- "notes" (1-sentence angle/hook)
- "location" (which pinned stop or region from the route this idea draws on)
- "hashtags" (array of 5-10 tags, each starting with #, tailored to the account, platform and place)

Requirements:
- Include a MIX of short_form, long_form AND travel_guide (blog) formats.
- Base every idea on the ACTUAL pinned locations and route above where available.
- Keep everything in the "${name}" voice described.
- ${foodRule}
Return ONLY valid JSON — no markdown, no commentary.`

      try {
        const anthropic = new Anthropic()
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 3500,
          messages: [{ role: 'user', content: prompt }],
        })
        const parsed = parseJsonBlock(extractText(message))
        const ideas = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.ideas) ? parsed.ideas : []
        return NextResponse.json({ ideas, account })
      } catch (e: any) {
        // Graceful failure — never 500 the whole request over a generation.
        return NextResponse.json({ ideas: [], account, error: e?.message || 'AI failed' })
      }
    }

    // ── AI: Wise Way Round cookbook recipe suggestions from the route ──
    if (action === 'ai-cookbook-recipes') {
      const { country, region } = body as { country?: string; region?: string }

      const routeContext = body.routeContext || buildRouteContext(body.trip) || ''
      const routeBlock = routeContext
        ? `\n\nTHIS TRIP'S PLANNED ROUTE & PINNED STOPS (use these REAL regions and pinned FOOD stops):\n${routeContext}\n`
        : ''
      const where = [region, country].filter(Boolean).join(', ')

      const prompt = `You are suggesting recipes for the "Wise Way Round" cookbook. The cookbook's niche is ALWAYS simple and easy to cook.
${where ? `Destination: ${where}.\n` : ''}From the route's regions/countries and pinned FOOD stops, suggest regional classics and delicacies that are WORTHY of a cookbook but still achievable simply in a campervan kitchen.${routeBlock}
Generate 8-10 recipes as a JSON array of objects with exactly these keys:
- "title" (the dish)
- "region" (where it's from — tie it to a pinned stop or country on the route)
- "why" (1 sentence — why it's cookbook-worthy)
- "keyIngredients" (array of 4-8 ingredients)
- "difficulty" (always the string "Simple & easy")
- "vanKitchenNote" (1 sentence on making it easy/practical in a van)
- "format" (default the string "cookbook_chapter")

Emphasise SIMPLE & EASY throughout — nothing that needs specialist equipment or long, fiddly technique.
Base the dishes on the ACTUAL regions and pinned food stops above where available.
Return ONLY valid JSON — no markdown, no commentary.`

      try {
        const anthropic = new Anthropic()
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 3500,
          messages: [{ role: 'user', content: prompt }],
        })
        const parsed = parseJsonBlock(extractText(message))
        const recipes = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.recipes) ? parsed.recipes : []
        return NextResponse.json({ recipes })
      } catch (e: any) {
        // Graceful failure — never 500 the whole request over a generation.
        return NextResponse.json({ recipes: [], error: e?.message || 'AI failed' })
      }
    }

    // ── AI: must-try local dishes, delicacies & produce along the route ──
    if (action === 'ai-find-musttry') {
      const { country, region } = body as { country?: string; region?: string }

      const routeContext = body.routeContext || buildRouteContext(body.trip) || ''
      const routeBlock = routeContext
        ? `\n\nTHIS TRIP'S PLANNED ROUTE & PINNED STOPS (use these REAL regions and pinned FOOD stops):\n${routeContext}\n`
        : ''
      const where = [region, country].filter(Boolean).join(', ')

      const prompt = `You are helping Zoe & Mark from Wise Way Round plan what to EAT and BUY along a road trip${where ? ` to ${where}` : ''}.
From the trip's regions and route, list local DISHES, DELICACIES and REGIONAL PRODUCE that are a MUST-TRY.
These are things to seek out, taste and buy — NOT recipes. Do NOT give cooking instructions, ingredients lists or methods.${routeBlock}
Return a JSON array called "items" of 10-14 objects, each with exactly these keys:
- "name" (the dish, delicacy or produce)
- "region" (tie it to a specific route stop or country on the route)
- "kind" (one of: "dish", "delicacy", "produce")
- "why" (1 sentence — what makes it special / cookbook-worthy)
- "whereToFind" (a specific market, town or producer to get it)

Base every pick on the ACTUAL regions and pinned food stops above where available.
Return ONLY valid JSON — no markdown, no commentary.`

      try {
        const anthropic = new Anthropic()
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 3500,
          messages: [{ role: 'user', content: prompt }],
        })
        const parsed = parseJsonBlock(extractText(message))
        const items = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.items) ? parsed.items : []
        return NextResponse.json({ items })
      } catch (e: any) {
        // Graceful failure — never 500 the whole request over a generation.
        return NextResponse.json({ items: [], error: e?.message || 'AI failed' })
      }
    }

    // ── AI: find social-media collab accounts for the trip's regions ─
    if (action === 'ai-find-collabs') {
      const { country, region } = body as { country?: string; region?: string }

      const routeContext = body.routeContext || buildRouteContext(body.trip) || ''
      const routeBlock = routeContext
        ? `\n\nTHIS TRIP'S PLANNED ROUTE & PINNED STOPS (use these REAL regions to target relevant accounts):\n${routeContext}\n`
        : ''
      const where = [region, country].filter(Boolean).join(', ')

      const prompt = `You are helping Zoe & Mark from Wise Way Round — a UK-based food, vanlife and travel content creator — find social-media accounts he could approach for a COLLABORATION during a trip${where ? ` to ${where}` : ''}.${routeBlock}
Focus on accounts RELEVANT TO THE TRIP'S REGIONS: fellow creators, food and travel influencers, local city/region pages, community and vanlife accounts, and independent restaurants/producers with a strong social presence.

CRITICAL HONESTY RULES — read carefully:
- Do NOT invent specific @handles, follower counts, or emails. If you are not confident that a specific account genuinely exists, DESCRIBE the TYPE of account and who to look for (e.g. "Athens street-food creators"), set "confident" to false, and leave the handle fields ("instagram", "tiktok", "youtube") and "website" EMPTY rather than fabricating anything.
- Only fill in a handle or URL when you are genuinely confident that specific, well-known account exists.
- Prefer well-known, genuinely likely accounts. It is completely fine to suggest search strategies and described targets instead of specific handles.

Return a JSON array called "contacts" of 8-12 objects, each with exactly these keys:
- "name" (person/page name, or a described target e.g. "Athens street-food creators")
- "role" (one of: creator, restaurant, producer, tourism_board, other)
- "country" (which itinerary country/region this relates to)
- "instagram" (handle ONLY if genuinely known, otherwise "")
- "tiktok" (handle ONLY if genuinely known, otherwise "")
- "youtube" (handle/channel ONLY if genuinely known, otherwise "")
- "website" (a real URL ONLY if genuinely known, otherwise "")
- "notes" (why they're a good collab fit; if this is a described target rather than a specific account, say so explicitly)
- "confident" (boolean — true ONLY if you are reasonably sure this specific account exists)

Return ONLY valid JSON — no markdown, no commentary.`

      try {
        const anthropic = new Anthropic()
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }],
        })
        const parsed = parseJsonBlock(extractText(message))
        const rawContacts = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed?.contacts)
            ? parsed.contacts
            : []
        // Verify links/socials before returning (bounded parallel). Fail-soft:
        // if verification itself throws, return the raw results rather than fail.
        let contacts = rawContacts
        try {
          contacts = await verifyFoundContacts(rawContacts)
        } catch {
          contacts = rawContacts.map((c: any) => ({ ...c, linkVerified: false }))
        }
        return NextResponse.json({ contacts, kind: 'collab' })
      } catch (e: any) {
        // Graceful failure — never 500 the whole request over a generation.
        return NextResponse.json({ contacts: [], kind: 'collab', error: e?.message || 'AI failed' })
      }
    }

    // ── AI: find travel & experience companies for UGC / paid work ───
    if (action === 'ai-find-companies') {
      const { country, region } = body as { country?: string; region?: string }

      const routeContext = body.routeContext || buildRouteContext(body.trip) || ''
      const routeBlock = routeContext
        ? `\n\nTHIS TRIP'S PLANNED ROUTE & PINNED STOPS (use these REAL regions to target relevant companies):\n${routeContext}\n`
        : ''
      const where = [region, country].filter(Boolean).join(', ')

      const prompt = `You are helping Zoe & Mark from Wise Way Round — a UK-based food, vanlife and travel content creator — find TRAVEL & EXPERIENCE COMPANIES${where ? ` in ${where}` : ''} that could offer him UGC (user-generated content) or paid content work.${routeBlock}
Include a RANGE of company types: tour operators, activity/experience providers, campsites and aires networks, dive centres, food-tour companies, tourism boards, and destination-marketing organisations. Do NOT limit the list to only companies known to work with influencers — include a broad, genuine mix.

CRITICAL HONESTY RULES — read carefully:
- For each company, set "worksWithInfluencers" to "yes" ONLY if you genuinely know they run creator/UGC/ambassador programmes; set it to "no" if you know they don't; otherwise set it to "unknown". Do NOT guess "yes".
- Do NOT invent emails or exact contact pages. Give the real company website/homepage ONLY if you are confident it exists; otherwise leave "website" EMPTY and set "confident" to false.
- Only mark "confident" true when you are sure the company genuinely exists.

Return a JSON array called "contacts" of 8-12 objects, each with exactly these keys:
- "name" (company name)
- "role" (a short type like "tour operator", or simply "company")
- "country" (which itinerary country/region this relates to)
- "website" (real homepage ONLY if confident, otherwise "")
- "worksWithInfluencers" (one of: "yes", "no", "unknown")
- "notes" (what they do, plus any UGC/creator angle)
- "confident" (boolean — true ONLY if you're sure the company exists)

Return ONLY valid JSON — no markdown, no commentary.`

      try {
        const anthropic = new Anthropic()
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }],
        })
        const parsed = parseJsonBlock(extractText(message))
        const rawContacts = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed?.contacts)
            ? parsed.contacts
            : []
        // Verify links before returning (bounded parallel). Fail-soft: if
        // verification itself throws, return the raw results rather than fail.
        let contacts = rawContacts
        try {
          contacts = await verifyFoundContacts(rawContacts)
        } catch {
          contacts = rawContacts.map((c: any) => ({ ...c, linkVerified: false }))
        }
        return NextResponse.json({ contacts, kind: 'company' })
      } catch (e: any) {
        // Graceful failure — never 500 the whole request over a generation.
        return NextResponse.json({ contacts: [], kind: 'company', error: e?.message || 'AI failed' })
      }
    }

    // ── Find a public contact email by SCRAPING each contact's website ──
    // Given a batch of contacts that have a website but no email, fetch their
    // homepage (and up to two likely contact/press pages) and extract REAL
    // published email addresses off the page — mailto: links and text matches,
    // with asset/junk filtered out and role/same-domain addresses preferred.
    // No AI guessing: only addresses genuinely present on the site are returned.
    // When none is found, a verified contact-page URL is returned as a lead.
    // Always returns HTTP 200 with { results } (fail-soft).
    if (action === 'find-emails') {
      const { contacts } = body as {
        contacts?: Array<{ key?: string; name?: string; company?: string; website?: string; country?: string; role?: string }>
      }
      if (!Array.isArray(contacts) || contacts.length === 0) {
        return NextResponse.json({ results: [] })
      }
      // Cap the batch so a huge selection can't fire off hundreds of fetches.
      const batch = contacts.slice(0, 20)

      const findOne = async (c: any) => {
        const website = (c.website || '').toString().trim()
        if (!website) {
          return { key: c.key, email: '', contactUrl: '', note: 'No website on this contact — add one to scrape it.' }
        }
        try {
          const { email, contactUrl } = await scrapeContactEmail(website)
          if (email) {
            return { key: c.key, email, contactUrl: '', note: 'Scraped from their website — verify before sending.' }
          }
          if (contactUrl) {
            return { key: c.key, email: '', contactUrl, note: 'No email on the site — open their contact page.' }
          }
          return { key: c.key, email: '', contactUrl: '', note: 'No public email found on their website.' }
        } catch {
          return { key: c.key, email: '', contactUrl: '', note: 'Could not read their website.' }
        }
      }

      try {
        const results = await mapWithConcurrency(batch, 4, findOne)
        return NextResponse.json({ results })
      } catch (e: any) {
        return NextResponse.json({ results: [], error: e?.message || 'Scrape failed' })
      }
    }

    // ── AI: compose an email to a contact ────────────────────────────
    if (action === 'ai-compose-email') {
      const { contact, goal, tone, tripContext } = body as {
        contact: any
        goal?: string
        tone?: string
        tripContext?: { title?: string; country?: string; region?: string; intentions?: string[]; startDate?: string; endDate?: string }
      }
      if (!contact?.name) return NextResponse.json({ error: 'Contact name is required' }, { status: 400 })

      const goalText = goal || 'introduce myself and open a conversation'
      const toneText = tone || 'warm and professional'
      const dates =
        tripContext?.startDate || tripContext?.endDate
          ? `Travel dates: ${tripContext?.startDate || '?'} to ${tripContext?.endDate || '?'}.`
          : ''

      const routeContext = body.routeContext || buildRouteContext(body.trip) || ''
      const routeBlock = routeContext
        ? `\n\nTHIS TRIP'S PLANNED ROUTE & PINNED STOPS (real locations — reference where it makes the email more specific and genuine):\n${routeContext}\n`
        : ''

      const prompt = `Write an outreach email from Zoe & Mark of Wise Way Round (a food & campervan travel brand).

Recipient: ${contact.name}${contact.role ? `, ${contact.role}` : ''}${contact.company ? ` at ${contact.company}` : ''}.
Trip: ${tripContext?.title || 'an upcoming trip'} to ${[tripContext?.region, tripContext?.country].filter(Boolean).join(', ') || 'the region'}.
Trip intentions: ${intentionText(tripContext?.intentions)}. ${dates}${routeBlock}
Email goal: ${goalText}.
Tone: ${toneText}.

Rules:
- Keep it concise (120-180 words), genuine, and specific to who they are.
- Do NOT invent specific facts, prices, or dates that weren't given.
- Return a JSON object: { "subject": string, "body": string }.
- The body should be plain text with line breaks (use \\n), no greeting placeholders like [Name] — use the actual name.
Return ONLY valid JSON — no markdown.`

      try {
        const anthropic = new Anthropic()
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 1200,
          messages: [{ role: 'user', content: prompt }],
        })
        const draft = parseJsonBlock(extractText(message))
        return NextResponse.json({ subject: draft.subject || '', body: draft.body || '' })
      } catch (e: any) {
        // Graceful failure — never 500 the whole request over a draft.
        return NextResponse.json({ subject: '', body: '', error: e?.message || 'AI failed' })
      }
    }

    // ── Send an email to a contact via SES + log it ──────────────────
    if (action === 'send-email') {
      const { tripId, contactName, contactKey, to, subject, body: emailBody } = body as {
        tripId?: string
        contactName?: string
        contactKey?: string
        to?: string
        subject?: string
        body?: string
      }
      if (!to || !to.includes('@')) return NextResponse.json({ error: 'A valid recipient email is required' }, { status: 400 })
      if (!subject) return NextResponse.json({ error: 'Subject is required' }, { status: 400 })

      const html = emailShell({
        heading: subject,
        body: (emailBody || '').replace(/\n/g, '<br/>'),
        from: 'mark',
        recipientEmail: to,
      })

      const ok = await sendEmail({
        from: 'Zoe & Mark at Wise Way Round <hello@wisewayround.co.uk>',
        to,
        replyTo: 'hello@wisewayround.co.uk',
        subject,
        html,
      })

      const now = new Date().toISOString()
      await sanity.create({
        _type: 'travelEmailLog',
        trip: tripId ? { _type: 'reference', _ref: tripId } : undefined,
        contactName: contactName || '',
        to,
        subject,
        body: emailBody || '',
        goal: body.goal || '',
        status: ok ? 'sent' : 'failed',
        sentAt: now,
      })

      if (!ok) return NextResponse.json({ error: 'Email failed to send (SES). Logged as failed.' }, { status: 502 })

      // Append a conversation entry to the matching contact, if we can find one
      if (tripId && contactName) {
        try {
          const trip = await sanity.fetch(`*[_type == "travelPlan" && _id == $id][0]{ contacts }`, { id: tripId })
          const contacts = Array.isArray(trip?.contacts) ? trip.contacts : []
          // Prefer matching by _key (unambiguous); fall back to name when key is
          // absent or not found, so contacts sharing a name aren't mis-attributed.
          let idx = contactKey ? contacts.findIndex((c: any) => c?._key === contactKey) : -1
          if (idx < 0) idx = contacts.findIndex((c: any) => c?.name === contactName)
          if (idx >= 0) {
            const entry = {
              _type: 'conversationEntry',
              _key: `conv-${Date.now()}`,
              date: now,
              channel: 'Email',
              note: `Sent: ${subject}`,
            }
            const existing = Array.isArray(contacts[idx].conversations) ? contacts[idx].conversations : []
            contacts[idx] = {
              ...contacts[idx],
              conversations: [entry, ...existing],
              status: contacts[idx].status === 'to_contact' ? 'contacted' : contacts[idx].status,
            }
            await sanity.patch(tripId).set({ contacts, updatedAt: now }).commit()
          }
        } catch (e) {
          // Non-fatal — the email already sent and logged
          console.error('Failed to append conversation entry:', e)
        }
      }

      return NextResponse.json({ success: true, message: `Email sent to ${to}` })
    }

    // ── Send a bulk email to many contacts via SES + log each ────────
    if (action === 'send-bulk-email') {
      const { tripId, recipients, subject, body: emailBody, goal } = body as {
        tripId?: string
        recipients?: Array<{ name?: string; email?: string; contactKey?: string }>
        subject?: string
        body?: string
        goal?: string
      }
      if (!subject) return NextResponse.json({ error: 'Subject is required' }, { status: 400 })
      const list = Array.isArray(recipients) ? recipients : []

      const results: Array<{ to: string; ok: boolean; error?: string }> = []
      let sent = 0
      let failed = 0

      // Sequentially to respect SES send-rate limits and avoid spam flags.
      for (const r of list) {
        const to = (r?.email || '').toString().trim()
        const name = (r?.name || '').toString().trim()
        if (!to || !to.includes('@')) {
          failed++
          results.push({ to: to || '(no email)', ok: false, error: 'Invalid recipient email' })
          continue
        }

        // Personalise {{name}} (fall back to "there" when no name).
        const personalised = (emailBody || '').replace(/\{\{\s*name\s*\}\}/g, name || 'there')
        const html = emailShell({
          heading: subject,
          body: personalised.replace(/\n/g, '<br/>'),
          from: 'mark',
          recipientEmail: to,
        })

        const now = new Date().toISOString()
        let ok = false
        try {
          ok = await sendEmail({
            from: 'Zoe & Mark at Wise Way Round <hello@wisewayround.co.uk>',
            to,
            replyTo: 'hello@wisewayround.co.uk',
            subject,
            html,
          })
        } catch (e: any) {
          ok = false
        }

        // Log every send (sent or failed).
        try {
          await sanity.create({
            _type: 'travelEmailLog',
            trip: tripId ? { _type: 'reference', _ref: tripId } : undefined,
            contactName: name,
            to,
            subject,
            body: personalised,
            goal: goal || '',
            status: ok ? 'sent' : 'failed',
            sentAt: now,
          })
        } catch (e) {
          // Non-fatal — logging failure must not abort the batch.
          console.error('Failed to log bulk email:', e)
        }

        if (ok) {
          sent++
          results.push({ to, ok: true })

          // Append a conversation entry to the matching contact (same as send-email).
          if (tripId && (r?.contactKey || name)) {
            try {
              const trip = await sanity.fetch(`*[_type == "travelPlan" && _id == $id][0]{ contacts }`, { id: tripId })
              const contacts = Array.isArray(trip?.contacts) ? trip.contacts : []
              let idx = r?.contactKey ? contacts.findIndex((c: any) => c?._key === r.contactKey) : -1
              if (idx < 0 && name) idx = contacts.findIndex((c: any) => c?.name === name)
              if (idx >= 0) {
                const entry = {
                  _type: 'conversationEntry',
                  _key: `conv-${Date.now()}-${idx}`,
                  date: now,
                  channel: 'Email',
                  note: `Sent: ${subject}`,
                }
                const existing = Array.isArray(contacts[idx].conversations) ? contacts[idx].conversations : []
                contacts[idx] = {
                  ...contacts[idx],
                  conversations: [entry, ...existing],
                  status: contacts[idx].status === 'to_contact' ? 'contacted' : contacts[idx].status,
                }
                await sanity.patch(tripId).set({ contacts, updatedAt: now }).commit()
              }
            } catch (e) {
              // Non-fatal — the email already sent and logged.
              console.error('Failed to append bulk conversation entry:', e)
            }
          }
        } else {
          failed++
          results.push({ to, ok: false, error: 'SES send failed' })
        }
      }

      return NextResponse.json({ sent, failed, results })
    }

    // ── Drive legs: per-hop Mapbox Directions for the itinerary calendar ─
    if (action === 'drive-legs') {
      const { hops } = body as {
        hops?: Array<{ key: string; from: { lat: number; lng: number }; to: { lat: number; lng: number } }>
      }
      if (!Array.isArray(hops)) return NextResponse.json({ error: 'No hops provided' }, { status: 400 })

      // Match reverseGeocode() in this file: prefer the secret token, fall back to the public one.
      const token = process.env.MAPBOX_SECRET_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

      // No token → graceful, non-throwing state (Req 7.6). Every hop is unresolved; totals are zero.
      if (!token) {
        return NextResponse.json({
          results: hops.map((h) => ({ key: h.key, ok: false, error: 'no-token' })),
          totals: { distanceMeters: 0, durationSeconds: 0 },
          warning: 'MAPBOX_SECRET_TOKEN not set',
        })
      }

      const isFiniteNum = (v: any): v is number => typeof v === 'number' && Number.isFinite(v)

      // Compute every hop in parallel; each is wrapped so one failure never rejects the batch (Req 3.5).
      const results = await Promise.all(
        hops.map(async (h) => {
          const from = h?.from
          const to = h?.to
          if (!from || !to || !isFiniteNum(from.lat) || !isFiniteNum(from.lng) || !isFiniteNum(to.lat) || !isFiniteNum(to.lng)) {
            return { key: h?.key, ok: false as const, error: 'coords-needed' }
          }
          try {
            const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${from.lng},${from.lat};${to.lng},${to.lat}?geometries=geojson&overview=full&access_token=${token}`
            const res = await fetch(url, { cache: 'no-store' })
            if (!res.ok) return { key: h.key, ok: false as const, error: 'no-route' }
            const data = await res.json()
            const route = data?.routes?.[0]
            if (!route) return { key: h.key, ok: false as const, error: 'no-route' }
            return {
              key: h.key,
              ok: true as const,
              distanceMeters: route.distance as number,
              durationSeconds: route.duration as number,
            }
          } catch {
            return { key: h.key, ok: false as const, error: 'no-route' }
          }
        })
      )

      // Totals sum only successful hops; raw metres/seconds — the client formats (Req 3.7, 5.5).
      const totals = results.reduce(
        (acc, r) => {
          if (r.ok) {
            acc.distanceMeters += r.distanceMeters || 0
            acc.durationSeconds += r.durationSeconds || 0
          }
          return acc
        },
        { distanceMeters: 0, durationSeconds: 0 }
      )

      return NextResponse.json({ results, totals })
    }

    // ── Isochrone: "how far can I drive" range from a start point ─────
    // Mapbox caps contours_minutes at 60 min and contours_meters at 100 km per
    // contour, so a true multi-hour isochrone isn't available from one call.
    // Pragmatic approach: return a precise Mapbox isochrone up to 60 minutes
    // (the shaded zone) PLUS approximate geodesic "range rings" for the half,
    // two-thirds and full maxHours using an 80 km/h average road-speed estimate.
    if (action === 'isochrone') {
      const { lat, lng, maxHours } = body as { lat?: number; lng?: number; maxHours?: number }
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return NextResponse.json({ error: 'Valid coordinates are required' }, { status: 400 })
      }
      if (!Number.isFinite(maxHours) || (maxHours as number) <= 0) {
        return NextResponse.json({ error: 'A positive maxHours is required' }, { status: 400 })
      }
      const cLat = lat as number
      const cLng = lng as number
      const hours = maxHours as number

      // Match other Mapbox actions: prefer the secret token, fall back to public.
      const token = process.env.MAPBOX_SECRET_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
      if (!token) {
        return NextResponse.json({ contours: [], rings: [], error: 'Mapbox not configured' })
      }

      try {
        const AVG_KMH = 67 // conservative average road speed estimate for range rings

        // Approximate driving-range rings at half / two-thirds / full of the limit.
        const ringHours = [hours / 2, (hours * 2) / 3, hours]
        const rings = ringHours.map((h) => {
          const km = Math.round(h * AVG_KMH)
          return { hours: Math.round(h * 10) / 10, km, geojson: circlePolygon(cLng, cLat, km) }
        })

        // Precise Mapbox isochrone up to 60 minutes (the shaded "up to 1 hour" zone).
        // Request up to three ascending minute bands, each clamped to 1..60.
        const totalMin = Math.min(60, Math.max(1, Math.round(hours * 60)))
        const bandSet = new Set<number>([
          Math.max(1, Math.round(totalMin / 3)),
          Math.max(1, Math.round((totalMin * 2) / 3)),
          totalMin,
        ])
        const bands = Array.from(bandSet)
          .filter((m) => m >= 1 && m <= 60)
          .sort((a, b) => a - b)

        let isochrone: any = null
        try {
          const minutesParam = bands.join(',')
          const url = `https://api.mapbox.com/isochrone/v1/mapbox/driving/${cLng},${cLat}?contours_minutes=${minutesParam}&polygons=true&denoise=1&access_token=${token}`
          const res = await fetch(url, { cache: 'no-store' })
          if (res.ok) {
            const data = await res.json()
            if (data && Array.isArray(data.features)) isochrone = data
          }
        } catch {
          // Isochrone is best-effort; rings still give a useful visual.
          isochrone = null
        }

        const centerName = await reverseGeocode(cLat, cLng)

        return NextResponse.json({ isochrone, rings, centerName })
      } catch (e: any) {
        return NextResponse.json({ rings: [], error: e?.message || 'Isochrone failed' })
      }
    }

    // ── Drive-time boundary: an accurate, on-demand reachable boundary ────
    // Unlike the instant `isochrone` estimate (precise ≤1h + geodesic rings),
    // this walks 16 compass bearings and binary-searches each for the point
    // whose REAL Mapbox driving duration ≈ the full maxHours limit. The 16
    // endpoints form a GeoJSON polygon that hugs the true road network. It is
    // more expensive (up to 16×5 Directions calls) so it runs only when asked.
    if (action === 'drive-boundary') {
      const { lat, lng, maxHours } = body as { lat?: number; lng?: number; maxHours?: number }
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return NextResponse.json({ error: 'Valid coordinates are required' }, { status: 400 })
      }
      if (!Number.isFinite(maxHours) || (maxHours as number) <= 0) {
        return NextResponse.json({ error: 'A positive maxHours is required' }, { status: 400 })
      }
      const cLat = lat as number
      const cLng = lng as number
      const hours = maxHours as number

      // Match other Mapbox actions: prefer the secret token, fall back to public.
      const token = process.env.MAPBOX_SECRET_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
      if (!token) {
        return NextResponse.json({ boundary: null, error: 'Mapbox not configured' })
      }

      // In-memory cache (best-effort). Hit within 24h returns immediately.
      const cacheKey = `${cLat.toFixed(3)}|${cLng.toFixed(3)}|${hours}`
      const cached = boundaryCache.get(cacheKey)
      if (cached && Date.now() - cached.ts < 24 * 60 * 60 * 1000) {
        return NextResponse.json({ boundary: cached.boundary, cached: true })
      }

      try {
        const SPOKES = 16
        const STEPS = 5 // binary-search iterations per spoke
        const targetSeconds = hours * 3600
        const hiKm = hours * 110 // generous upper bound — motorways beat 80 km/h
        const fallbackKm = hours * 80 // geodesic estimate if a spoke has no route

        // Each spoke's binary search is sequential (each step depends on the
        // previous bound), but the 16 spokes run in parallel.
        const spokeResults = await Promise.all(
          Array.from({ length: SPOKES }, (_, i) => i * (360 / SPOKES)).map(async (bearing) => {
            let lo = 0
            let hi = hiKm
            let best = 0 // best confirmed reachable distance for this bearing
            let anyRoute = false

            for (let step = 0; step < STEPS; step++) {
              const mid = (lo + hi) / 2
              const [dLng, dLat] = destPoint(cLat, cLng, bearing, mid)
              const dur = await drivingDurationSeconds(cLng, cLat, dLng, dLat, token)
              if (dur == null) {
                // No route / timeout → treat as too far (conservative): pull hi down.
                hi = mid
                continue
              }
              anyRoute = true
              if (dur < targetSeconds * 0.98) {
                lo = mid // can go further
                best = mid
              } else if (dur > targetSeconds * 1.02) {
                hi = mid // overshoot
              } else {
                best = mid // within tolerance
                break
              }
            }

            const distanceKm = anyRoute ? Math.max(best, lo) : fallbackKm
            const endpoint = destPoint(cLat, cLng, bearing, distanceKm)
            return { endpoint, real: anyRoute }
          })
        )

        const realSpokes = spokeResults.filter((s) => s.real).length
        const ring: [number, number][] = spokeResults.map((s) => s.endpoint)
        ring.push(ring[0]) // close the polygon

        const boundary = {
          type: 'Feature',
          properties: { hours },
          geometry: { type: 'Polygon', coordinates: [ring] },
        }

        boundaryCache.set(cacheKey, { boundary, ts: Date.now() })

        return NextResponse.json({ boundary, spokes: realSpokes, cached: false })
      } catch (e: any) {
        return NextResponse.json({ boundary: null, error: e?.message || 'Drive-boundary failed' })
      }
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  } catch (err: any) {
    console.error('travel-planner error:', err)
    return NextResponse.json({ error: err.message || 'Request failed' }, { status: 500 })
  }
}
