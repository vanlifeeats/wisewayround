// Pure helper module for the Travel Itinerary Calendar feature.
//
// This file is intentionally free of React/Next imports so it can be unit-tested
// in isolation and safely imported from both the client page and test files.
//
// A first-class concern here is DATE ACCURACY (Requirement 5.1): all date
// utilities operate ONLY on 'YYYY-MM-DD' strings and do the calendar math
// arithmetically. We never construct a JS Date from a bare date string
// (e.g. `new Date('2024-01-01')`), because that applies a UTC/local offset and
// can shift the day. Where a Date is used at all (weekday computation), it is
// constructed from explicit numeric args via `Date.UTC(...)`, which is offset-safe.

// ── Types (Data Models) ─────────────────────────────────────────────

export type TravelMode = 'drive' | 'ferry' | 'flight' | 'train' | 'other'

export interface ItineraryLeg {
  _type: 'itineraryLeg'
  _key: string
  label: string
  country?: string
  startDate?: string // 'YYYY-MM-DD'
  endDate?: string // 'YYYY-MM-DD'; when absent, treated as == startDate
  coordinates?: { lat: number; lng: number }
  travelModeIn: TravelMode
  departureCountry?: string
  manualDistanceKm?: number
  manualDurationMins?: number
  notes?: string
  sourceRef?: string
  // Must-do vs optional stop. Written verbatim; styling-only — never reorders
  // the itinerary (ordering stays by start date via orderLegs).
  priorityLevel?: string
}

export interface DriveHop {
  key: string // `${fromKey}->${toKey}`
  fromKey: string
  toKey: string
  mode: TravelMode
  needsCoords: boolean // true if either endpoint lacks coordinates and mode === 'drive'
  from?: { lat: number; lng: number }
  to?: { lat: number; lng: number }
}

export interface HopResult {
  key: string
  ok: boolean
  distanceMeters?: number
  durationSeconds?: number
  error?: string
}

export interface DayLookup {
  date: string // 'YYYY-MM-DD'
  covered: boolean
  legs: ItineraryLeg[]
  departureCountry?: string
}

// ── Dates: string-first, timezone-safe (Req 5.1, 5.2) ────────────────

export interface Ymd {
  y: number
  m: number // 1-12
  d: number
}

/** True for a leap year using the correct Gregorian rule. */
function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
}

/** Number of days in a given month (m is 1-12). Returns 0 for an out-of-range month. */
function daysInMonth(y: number, m: number): number {
  switch (m) {
    case 1:
    case 3:
    case 5:
    case 7:
    case 8:
    case 10:
    case 12:
      return 31
    case 4:
    case 6:
    case 9:
    case 11:
      return 30
    case 2:
      return isLeapYear(y) ? 29 : 28
    default:
      return 0
  }
}

/** Zero-pad a non-negative integer to at least two digits. */
function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

/** Format a Ymd back into a zero-padded 'YYYY-MM-DD' string. */
function formatYmd(v: Ymd): string {
  const year = v.y < 1000 ? `000${v.y}`.slice(-4) : `${v.y}`
  return `${year}-${pad2(v.m)}-${pad2(v.d)}`
}

/**
 * Parse a strict 'YYYY-MM-DD' string into a Ymd, validating a REAL calendar date.
 * Rejects bad format, month 00 or >12, day 00, day beyond the month length, and
 * non-leap Feb 29. Returns null when invalid. Does not touch JS Date parsing.
 */
export function parseYmd(s: string): Ymd | null {
  if (typeof s !== 'string') return null
  // Strict format: exactly 4 digits, '-', 2 digits, '-', 2 digits.
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (!match) return null
  const y = Number(match[1])
  const m = Number(match[2])
  const d = Number(match[3])
  if (m < 1 || m > 12) return null
  const maxDay = daysInMonth(y, m)
  if (d < 1 || d > maxDay) return null
  return { y, m, d }
}

/** Order-preserving compare key: y*10000 + m*100 + d. */
export function ymdToOrdinal(v: Ymd): number {
  return v.y * 10000 + v.m * 100 + v.d
}

/** True when the string is a valid calendar date. */
export function isValidDate(s: string): boolean {
  return parseYmd(s) !== null
}

/**
 * Compare two 'YYYY-MM-DD' strings, returning -1 | 0 | 1 via ordinal.
 * If either input is invalid, fall back to a deterministic comparison:
 * invalid dates sort before valid ones, and two invalids compare by string.
 */
export function compareDates(a: string, b: string): number {
  const pa = parseYmd(a)
  const pb = parseYmd(b)
  if (pa && pb) {
    const oa = ymdToOrdinal(pa)
    const ob = ymdToOrdinal(pb)
    if (oa < ob) return -1
    if (oa > ob) return 1
    return 0
  }
  // Deterministic handling when one or both are invalid.
  if (!pa && !pb) {
    if (a < b) return -1
    if (a > b) return 1
    return 0
  }
  return pa ? 1 : -1
}

/**
 * Inclusive number of days from start to end date ('YYYY-MM-DD' strings).
 * Returns 0 if either date is missing/invalid or end is before start.
 * Inclusive means start===end → 1 day.
 *
 * Timezone-safe: parses via `parseYmd` and does the span arithmetic through
 * `Date.UTC(...)` with explicit numeric args, so there is no local-offset drift.
 */
export function inclusiveDayCount(start?: string, end?: string): number {
  if (!start || !end) return 0
  const s = parseYmd(start)
  const e = parseYmd(end)
  if (!s || !e) return 0
  const sUTC = Date.UTC(s.y, s.m - 1, s.d)
  const eUTC = Date.UTC(e.y, e.m - 1, e.d)
  if (eUTC < sUTC) return 0
  return Math.round((eUTC - sUTC) / 86400000) + 1
}

/** All 'YYYY-MM-DD' strings for the given month (month 1-12), zero-padded. */
export function eachDayOfMonth(year: number, month: number): string[] {
  const total = daysInMonth(year, month)
  const out: string[] = []
  for (let d = 1; d <= total; d++) {
    out.push(formatYmd({ y: year, m: month, d }))
  }
  return out
}

/**
 * Day of week for a valid Ymd (0 = Sunday .. 6 = Saturday). Uses Date.UTC with
 * explicit numeric args (offset-safe), then reads getUTCDay(). This never parses
 * a bare date string, so there is no timezone drift.
 */
function dayOfWeek(v: Ymd): number {
  return new Date(Date.UTC(v.y, v.m - 1, v.d)).getUTCDay()
}

/** Add `n` days to a valid Ymd, returning a new Ymd. Handles month/year rollover. */
function addDays(v: Ymd, n: number): Ymd {
  let { y, m, d } = v
  d += n
  // Roll forward.
  while (d > daysInMonth(y, m)) {
    d -= daysInMonth(y, m)
    m += 1
    if (m > 12) {
      m = 1
      y += 1
    }
  }
  // Roll backward.
  while (d < 1) {
    m -= 1
    if (m < 1) {
      m = 12
      y -= 1
    }
    d += daysInMonth(y, m)
  }
  return { y, m, d }
}

/**
 * Padded 6x7-style month grid including leading days from the previous month and
 * trailing days from the next month, so the grid starts on `weekStartsOn`
 * (0 = Sunday .. 6 = Saturday). Returns 'YYYY-MM-DD' strings. Weekday is computed
 * arithmetically (via Date.UTC), never by parsing a bare date string.
 */
export function monthGridDays(year: number, month: number, weekStartsOn: number): string[] {
  const first: Ymd = { y: year, m: month, d: 1 }
  const firstDow = dayOfWeek(first)
  // How many leading days from the previous month are needed.
  const normalizedStart = ((weekStartsOn % 7) + 7) % 7
  const leading = ((firstDow - normalizedStart) % 7 + 7) % 7

  const daysThisMonth = daysInMonth(year, month)
  const totalCells = leading + daysThisMonth
  // Pad up to a whole number of weeks, minimum 6 rows (6x7 grid).
  const rows = Math.max(6, Math.ceil(totalCells / 7))
  const cellCount = rows * 7

  const start = addDays(first, -leading)
  const out: string[] = []
  let cursor = start
  for (let i = 0; i < cellCount; i++) {
    out.push(formatYmd(cursor))
    cursor = addDays(cursor, 1)
  }
  return out
}

/** True when start <= day <= end inclusive (via ordinal comparison). */
export function dateInRange(day: string, start: string, end: string): boolean {
  return compareDates(start, day) <= 0 && compareDates(day, end) <= 0
}

// ── Coverage / overlap / gap / bounds (Req 2.2, 2.5, 2.6, 4.1, 4.4, 4.5) ──

/**
 * All legs whose inclusive [startDate, endDate] range contains `day`.
 * A leg with no endDate is treated as a single-day leg (end = start).
 * Legs with a missing or invalid startDate are skipped.
 */
export function legsCovering(day: string, legs: ItineraryLeg[]): ItineraryLeg[] {
  const out: ItineraryLeg[] = []
  for (const leg of legs) {
    const start = leg.startDate
    if (!start || !isValidDate(start)) continue
    const end = leg.endDate && isValidDate(leg.endDate) ? leg.endDate : start
    if (dateInRange(day, start, end)) out.push(leg)
  }
  return out
}

/** True when more than one leg covers `day`. */
export function isOverlap(day: string, legs: ItineraryLeg[]): boolean {
  return legsCovering(day, legs).length > 1
}

/**
 * The timeline bounds: min of all valid startDates and max of all
 * (endDate ?? startDate) values across legs with valid dates.
 * Returns null when no leg has a valid startDate.
 */
export function timelineBounds(legs: ItineraryLeg[]): { min: string; max: string } | null {
  let min: string | null = null
  let max: string | null = null
  for (const leg of legs) {
    const start = leg.startDate
    if (!start || !isValidDate(start)) continue
    const end = leg.endDate && isValidDate(leg.endDate) ? leg.endDate : start
    if (min === null || compareDates(start, min) < 0) min = start
    if (max === null || compareDates(end, max) > 0) max = end
  }
  if (min === null || max === null) return null
  return { min, max }
}

/**
 * All dates within the timeline bounds that are covered by ZERO legs, in
 * ascending order. Iterates day-by-day arithmetically (no `new Date(string)`).
 * Returns [] when there are no valid-dated legs.
 */
export function gapDays(legs: ItineraryLeg[]): string[] {
  const bounds = timelineBounds(legs)
  if (!bounds) return []
  const out: string[] = []
  const start = parseYmd(bounds.min)
  const end = parseYmd(bounds.max)
  if (!start || !end) return []
  let cursor: Ymd = start
  const endOrdinal = ymdToOrdinal(end)
  // Walk from min to max inclusive; endpoints are covered by definition.
  while (ymdToOrdinal(cursor) <= endOrdinal) {
    const day = formatYmd(cursor)
    if (legsCovering(day, legs).length === 0) out.push(day)
    cursor = addDays(cursor, 1)
  }
  return out
}

// ── Unit conversion (Req 3.2, 3.3, 5.3, 5.4) ─────────────────────────

/** Metres in one mile — matches the route-planner value. */
const MILES_TO_METERS = 1609.344
/** Default fuel price used by the route-planner fuel estimate. */
const DEFAULT_FUEL_PRICE_PER_LITRE = 1.45
/** Litres in one imperial gallon — matches the route-planner value. */
const LITRES_PER_GALLON = 4.546
/** Default vehicle efficiency in miles-per-gallon. */
const DEFAULT_MPG = 30

/** Convert metres to miles, rounded to one decimal place. */
export function metersToMiles1dp(m: number): number {
  return Math.round((m / MILES_TO_METERS) * 10) / 10
}

/** Convert metres to kilometres, rounded to one decimal place. */
export function metersToKm1dp(m: number): number {
  return Math.round((m / 1000) * 10) / 10
}

/**
 * Convert seconds to whole hours and whole minutes. `h` and `m` are
 * non-negative integers with 0 <= m < 60. Negative or NaN input yields {h:0,m:0}.
 */
export function secondsToHm(s: number): { h: number; m: number } {
  if (!Number.isFinite(s) || s < 0) return { h: 0, m: 0 }
  const totalMinutes = Math.floor(s / 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return { h, m }
}

/**
 * Estimated fuel cost in GBP for a drive of `distanceMeters`, using the
 * route-planner method (default 30 mpg, £1.45/litre, 4.546 litres/gallon).
 * Returns the raw numeric cost; callers format to currency.
 */
export function fuelCostGBP(distanceMeters: number, mpg: number = DEFAULT_MPG): number {
  const miles = distanceMeters / MILES_TO_METERS
  const gallons = miles / mpg
  const litres = gallons * LITRES_PER_GALLON
  return litres * DEFAULT_FUEL_PRICE_PER_LITRE
}

/**
 * Estimate fuel cost for a distance, given vehicle mpg (imperial) and fuel
 * price per litre. Uses 4.546 litres/gallon. Returns raw GBP number (>= 0).
 * Guards against non-finite / non-positive mpg (returns 0). Reuses the
 * module-scoped MILES_TO_METERS and LITRES_PER_GALLON constants.
 */
export function estimateFuelCost(distanceMeters: number, mpg: number, pricePerLitre: number): number {
  if (!Number.isFinite(distanceMeters) || distanceMeters <= 0) return 0
  if (!Number.isFinite(mpg) || mpg <= 0) return 0
  if (!Number.isFinite(pricePerLitre) || pricePerLitre < 0) return 0
  const miles = distanceMeters / MILES_TO_METERS
  const gallons = miles / mpg
  const litres = gallons * LITRES_PER_GALLON
  return litres * pricePerLitre
}

// ── Ordering + drive hops + totals (Req 1.8, 3.4, 3.5, 3.7, 5.5) ─────

/**
 * Stable sort of legs by startDate ascending. Legs with a missing or invalid
 * startDate sort to the end (preserving their relative order). Returns a new
 * array; the input is not mutated.
 */
export function orderLegs(legs: ItineraryLeg[]): ItineraryLeg[] {
  const hasValidStart = (leg: ItineraryLeg): boolean =>
    !!leg.startDate && isValidDate(leg.startDate)
  // Decorate with original index to guarantee a stable sort across engines.
  return legs
    .map((leg, i) => ({ leg, i }))
    .sort((a, b) => {
      const aValid = hasValidStart(a.leg)
      const bValid = hasValidStart(b.leg)
      if (aValid && bValid) {
        const c = compareDates(a.leg.startDate as string, b.leg.startDate as string)
        return c !== 0 ? c : a.i - b.i
      }
      if (aValid && !bValid) return -1
      if (!aValid && bValid) return 1
      return a.i - b.i
    })
    .map((x) => x.leg)
}

/**
 * The 1–12 month number(s) spanned by a leg's inclusive [startDate, endDate]
 * range, in travel order. Reuses the timezone-safe `parseYmd` and the ordinal
 * compare key; never constructs a JS Date from a bare date string.
 *
 * Rules (Req 1.8, 3.4):
 * - Returns [] when startDate is missing or invalid.
 * - When endDate is missing/empty, the span is the single startDate month.
 * - Returns [] when endDate is present-and-invalid, or endDate < startDate.
 * - Otherwise walks month-by-month from the start month to the end month in
 *   calendar order, so a range crossing a year boundary lists the months
 *   actually travelled (e.g. Dec→Jan → [12, 1], Nov→Feb → [11, 12, 1, 2]).
 */
export function travelMonthsOf(leg: ItineraryLeg): number[] {
  const start = leg.startDate ? parseYmd(leg.startDate) : null
  if (!start) return []

  // No end date → single-month span at the start month.
  if (!leg.endDate) return [start.m]

  const end = parseYmd(leg.endDate)
  if (!end) return []

  // Reject end strictly before start (via order-preserving ordinal).
  if (ymdToOrdinal(end) < ymdToOrdinal(start)) return []

  const months: number[] = []
  let y = start.y
  let m = start.m
  // Walk forward one month at a time until we pass the end month/year.
  while (y < end.y || (y === end.y && m <= end.m)) {
    months.push(m)
    m += 1
    if (m > 12) {
      m = 1
      y += 1
    }
  }
  return months
}

/** True only for the winter months November–March (11, 12, 1, 2, 3) (Req 3.5). */
export function isWinterMonth(month: number): boolean {
  return month === 11 || month === 12 || month === 1 || month === 2 || month === 3
}

/** True when a coordinate pair has finite numeric lat and lng. */
function hasFiniteCoords(coords?: { lat: number; lng: number }): boolean {
  return (
    !!coords &&
    Number.isFinite(coords.lat) &&
    Number.isFinite(coords.lng)
  )
}

/**
 * Build drive hops between consecutive legs (after ordering by start date).
 * The hop's `mode` is the mode by which you ARRIVE at the `to` leg
 * (`to.travelModeIn`). `needsCoords` is true when the mode is 'drive' and
 * either endpoint lacks finite coordinates. Coordinate objects are only
 * attached when both lat and lng are finite numbers.
 */
export function buildDriveHops(legs: ItineraryLeg[]): DriveHop[] {
  const ordered = orderLegs(legs)
  const hops: DriveHop[] = []
  for (let i = 0; i + 1 < ordered.length; i++) {
    const from = ordered[i]
    const to = ordered[i + 1]
    const mode = to.travelModeIn
    const fromOk = hasFiniteCoords(from.coordinates)
    const toOk = hasFiniteCoords(to.coordinates)
    const hop: DriveHop = {
      key: `${from._key}->${to._key}`,
      fromKey: from._key,
      toKey: to._key,
      mode,
      needsCoords: mode === 'drive' && !(fromOk && toOk),
    }
    if (fromOk) hop.from = { lat: from.coordinates!.lat, lng: from.coordinates!.lng }
    if (toOk) hop.to = { lat: to.coordinates!.lat, lng: to.coordinates!.lng }
    hops.push(hop)
  }
  return hops
}

/**
 * Sum distanceMeters and durationSeconds over hop results where ok === true.
 * Failed and coords-needed hops contribute 0.
 */
export function sumHopTotals(results: HopResult[]): {
  distanceMeters: number
  durationSeconds: number
} {
  let distanceMeters = 0
  let durationSeconds = 0
  for (const r of results) {
    if (r.ok) {
      distanceMeters += r.distanceMeters ?? 0
      durationSeconds += r.durationSeconds ?? 0
    }
  }
  return { distanceMeters, durationSeconds }
}

// ── Day lookup + sharing (Req 4.2, 4.6, 4.7) ─────────────────────────

/**
 * The departure country for `day`. `orderedLegs` is assumed ordered by start
 * date, but is re-ordered defensively. Finds the first leg covering `day`
 * (preserving order); if it has a non-empty departureCountry that is returned.
 * Otherwise the country of the immediately preceding leg in the ordered list
 * is returned, or '' if none. Returns '' when no leg covers the day.
 */
export function departureCountryFor(day: string, orderedLegs: ItineraryLeg[]): string {
  const ordered = orderLegs(orderedLegs)
  const covering = legsCovering(day, ordered)
  if (covering.length === 0) return ''
  const first = covering[0]
  if (first.departureCountry && first.departureCountry.trim() !== '') {
    return first.departureCountry
  }
  const idx = ordered.indexOf(first)
  if (idx > 0) {
    const prev = ordered[idx - 1]
    return prev.country ?? ''
  }
  return ''
}

/**
 * Plain-text shareable summary for `day`. Includes the date, each covering
 * leg's location label and country, and the departure country. NEVER includes
 * any leg's private `notes`. When no leg covers the day, a line is produced
 * saying no plan is recorded for that date.
 */
export function buildShareableSummary(day: string, legs: ItineraryLeg[]): string {
  const covering = legsCovering(day, legs)
  if (covering.length === 0) {
    return `${day} — no plan recorded for this date`
  }
  const lines: string[] = []
  for (const leg of covering) {
    const label = leg.label ?? ''
    const country = leg.country ?? ''
    const place = [label, country].filter((p) => p && p.trim() !== '').join(', ')
    lines.push(`${day} — ${place}`)
  }
  const departure = departureCountryFor(day, legs)
  if (departure && departure.trim() !== '') {
    lines.push(`Flying from: ${departure}`)
  }
  return lines.join('\n')
}

// ── Validation + normalisation (Req 1.2, 1.3, 1.4, 5.6, 7.5) ─────────

/**
 * Validate a leg prior to save. Returns { ok:false, error } with a specific
 * message for: blank label, blank/invalid startDate, invalid endDate, or an
 * endDate earlier than the startDate. Otherwise { ok:true }.
 */
export function validateLeg(leg: Partial<ItineraryLeg>): { ok: boolean; error?: string } {
  if (!leg.label || leg.label.trim() === '') {
    return { ok: false, error: 'Location label is required' }
  }
  if (!leg.startDate || !isValidDate(leg.startDate)) {
    return { ok: false, error: 'A valid start date is required' }
  }
  if (leg.endDate) {
    if (!isValidDate(leg.endDate)) {
      return { ok: false, error: 'End date is not a valid date' }
    }
    if (compareDates(leg.endDate, leg.startDate) < 0) {
      return { ok: false, error: 'End date cannot be before start date' }
    }
  }
  return { ok: true }
}

/**
 * Return a copy of the leg where an empty/undefined endDate is set equal to the
 * startDate (single-day leg). The input is not mutated.
 */
export function normaliseLeg(leg: ItineraryLeg): ItineraryLeg {
  const copy: ItineraryLeg = { ...leg }
  if (!copy.endDate) {
    copy.endDate = copy.startDate
  }
  return copy
}

/**
 * Non-blocking flag: true when the leg's range falls partially or wholly
 * outside the trip window. Returns true if tripStart is a valid date and the
 * leg starts before it, OR tripEnd is a valid date and the leg's effective end
 * (endDate ?? startDate) is after it. A missing/invalid bound imposes no
 * constraint on that side.
 */
export function isOutOfWindow(leg: ItineraryLeg, tripStart?: string, tripEnd?: string): boolean {
  const start = leg.startDate
  if (!start || !isValidDate(start)) return false
  const end = leg.endDate && isValidDate(leg.endDate) ? leg.endDate : start
  if (tripStart && isValidDate(tripStart) && compareDates(start, tripStart) < 0) {
    return true
  }
  if (tripEnd && isValidDate(tripEnd) && compareDates(end, tripEnd) > 0) {
    return true
  }
  return false
}

// ── Max drive-time guardrail (drive-hour limit) ──────────────────────
//
// These helpers back the Calendar-tab "Drives" guardrail: a configurable
// per-day drive-hour limit, per-hop over-limit detection, a suggested even
// split of an over-long drive, and a trip-wide over-limit summary. All are
// pure and total (no throws), so they can be unit/property-tested in isolation
// and safely called from the client during render.

/** Default per-day drive-hour limit used when a trip has no explicit value. */
export const DEFAULT_MAX_DRIVE_HOURS = 6

/**
 * Convert hours to seconds. Non-finite or negative input is clamped to 0, so
 * the result is always a finite non-negative number.
 */
export function hoursToSeconds(h: number): number {
  if (!Number.isFinite(h) || h < 0) return 0
  return h * 3600
}

/**
 * True when a drive of `durationSeconds` exceeds the `maxHours` limit
 * (strictly greater than — being exactly at the limit is fine). When
 * `maxHours` is not a finite positive number it is treated as "no limit",
 * so this returns false.
 */
export function isOverDriveLimit(durationSeconds: number, maxHours: number): boolean {
  if (!Number.isFinite(maxHours) || maxHours <= 0) return false
  if (!Number.isFinite(durationSeconds)) return false
  return durationSeconds > maxHours * 3600
}

/**
 * Suggest how to break an over-long drive into equal segments so each is at or
 * under the limit. `segments` is the minimum number of equal drives that keeps
 * each within the limit; `perSegmentSeconds` is the (rounded) length of each.
 * When `maxHours` is not a finite positive number, or `durationSeconds` is
 * non-positive, no split is suggested: `{ segments: 1, perSegmentSeconds }`
 * where perSegmentSeconds is the original duration clamped to >= 0.
 */
export function splitPlan(
  durationSeconds: number,
  maxHours: number
): { segments: number; perSegmentSeconds: number } {
  const safeDuration = Number.isFinite(durationSeconds) ? durationSeconds : 0
  if (!Number.isFinite(maxHours) || maxHours <= 0 || safeDuration <= 0) {
    return { segments: 1, perSegmentSeconds: Math.max(0, safeDuration || 0) }
  }
  const limitSeconds = maxHours * 3600
  const segments = Math.max(1, Math.ceil(safeDuration / limitSeconds))
  const perSegmentSeconds = Math.round(safeDuration / segments)
  return { segments, perSegmentSeconds }
}

/**
 * Summarise how many successful drive hops exceed the limit and by how much.
 * Considers only `ok === true` results with a numeric `durationSeconds`.
 * `overCount` is how many exceed the limit; `worstOverSeconds` is the largest
 * single overage (durationSeconds - limit, floored at 0), or 0 when none are
 * over. When `maxHours` is not a finite positive number there is no limit, so
 * both values are 0.
 */
export function overLimitSummary(
  results: HopResult[],
  maxHours: number
): { overCount: number; worstOverSeconds: number } {
  if (!Number.isFinite(maxHours) || maxHours <= 0) {
    return { overCount: 0, worstOverSeconds: 0 }
  }
  const limitSeconds = maxHours * 3600
  let overCount = 0
  let worstOverSeconds = 0
  for (const r of results) {
    if (!r.ok || !Number.isFinite(r.durationSeconds ?? NaN)) continue
    const over = (r.durationSeconds as number) - limitSeconds
    if (over > 0) {
      overCount += 1
      if (over > worstOverSeconds) worstOverSeconds = over
    }
  }
  return { overCount, worstOverSeconds }
}

// ── Leg association (Req 2.5, 4.7, 5.2) ──────────────────────────────
//
// Scenic-road `place` rows and park-up `opportunity` rows carry an optional
// `legKey` (the `_key` of their associated `itineraryLeg`) and an optional
// `coordinates` geopoint { lat, lng }. These helpers resolve each item to a
// single leg deterministically so the Route Guide can group items under their
// leg. They are pure and stable for identical input.

/**
 * Minimal shape of a trip `place` or park-up `opportunity` for association:
 * an optional explicit `legKey` and an optional `coordinates` geopoint. Both
 * also carry a `_key`, which is used as a final deterministic tie-break.
 */
export interface Associable {
  _key?: string
  legKey?: string
  coordinates?: { lat: number; lng: number }
}

/**
 * Squared euclidean distance between two coordinate pairs on raw lat/lng.
 * This is a deterministic monotonic proxy for distance (no sqrt needed for
 * nearest-neighbour comparison). Both endpoints are assumed to have finite
 * coordinates (callers guard with `hasFiniteCoords`).
 */
function squaredCoordDistance(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const dLat = a.lat - b.lat
  const dLng = a.lng - b.lng
  return dLat * dLat + dLng * dLng
}

/**
 * Resolve the leg `_key` a place/park-up belongs to (Req 2.5, 5.2):
 *  1. Prefer the item's explicit `legKey` when a leg with that `_key` exists
 *     in `legs`.
 *  2. Otherwise, when the item has finite coordinates, pick the nearest leg
 *     that also has finite coordinates by squared-euclidean distance on
 *     lat/lng. Ties are broken deterministically by leg order (first wins),
 *     then by leg `_key`.
 *  3. Otherwise (no legKey match and no coordinate-based match possible)
 *     return undefined.
 *
 * Pure and deterministic: the same input always yields the same result and the
 * function never mutates its arguments.
 */
export function legKeyForPlace(
  place: Associable,
  legs: ItineraryLeg[]
): string | undefined {
  const legArr = Array.isArray(legs) ? legs : []

  // 1. Explicit legKey wins when that leg actually exists.
  if (place && place.legKey) {
    const match = legArr.find((l) => l && l._key === place.legKey)
    if (match) return match._key
  }

  // 2. Nearest leg by coordinates (only possible when the place has coords).
  if (!place || !hasFiniteCoords(place.coordinates)) return undefined
  const pc = place.coordinates as { lat: number; lng: number }

  let bestKey: string | undefined
  let bestDist = Infinity
  for (let i = 0; i < legArr.length; i++) {
    const leg = legArr[i]
    if (!leg || !hasFiniteCoords(leg.coordinates)) continue
    const dist = squaredCoordDistance(pc, leg.coordinates as { lat: number; lng: number })
    if (dist < bestDist) {
      bestDist = dist
      bestKey = leg._key
    } else if (dist === bestDist && bestKey !== undefined) {
      // Deterministic tie-break: the earlier leg already holds `bestKey`
      // (first-wins by order). Fall back to the smaller `_key` only to stay
      // stable if two equidistant legs were somehow visited out of order.
      if (leg._key < bestKey) bestKey = leg._key
    }
  }
  return bestKey
}

/**
 * The subset of `places` that resolve (via `legKeyForPlace`) to `leg._key`.
 * Order is preserved from the input array. Pure and deterministic.
 */
export function associatePlacesToLeg<T extends Associable>(
  places: T[],
  leg: ItineraryLeg,
  legs: ItineraryLeg[]
): T[] {
  if (!Array.isArray(places) || !leg) return []
  return places.filter((p) => legKeyForPlace(p, legs) === leg._key)
}

/**
 * The subset of park-up opportunities whose explicit `legKey === leg._key`.
 * Park-ups are associated purely by their stored `legKey` (Req 4.7); order is
 * preserved from the input array. Pure and deterministic.
 */
export function associateParkupsToLeg<T extends Associable>(
  opps: T[],
  leg: ItineraryLeg
): T[] {
  if (!Array.isArray(opps) || !leg) return []
  return opps.filter((o) => o && o.legKey === leg._key)
}

// ── Road-type classification + re-plan merge (Req 1.5, 2.6) ──────────
//
// These two pure helpers back the scenic road-trip planner. `ensureRoadType`
// guarantees a `placeType` string classifies to the existing `road` map
// category (the client `placeCategory()` returns 'road' when the type contains
// the substring 'road'). `mergeProposedLegs` folds accepted AI re-plan
// proposals into the current itinerary without dropping or overwriting any leg
// the user did not accept. Both are total and deterministic — no throws, no
// mutation of inputs — so they can be unit/property-tested in isolation and
// safely called from the client.

/**
 * Return a `placeType` string GUARANTEED to contain the lowercase substring
 * `"road"`, so the frontend `placeCategory()` classifier maps it to the `'road'`
 * map category (Req 2.6).
 *
 * Rules:
 * - If the input already contains `"road"` (case-insensitive) it is returned
 *   unchanged (e.g. `'coastal road'` → `'coastal road'`, `'Iconic Road'` →
 *   `'Iconic Road'`).
 * - A non-empty input without `"road"` has `' road'` appended
 *   (e.g. `'mountain pass'` → `'mountain pass road'`).
 * - An empty/whitespace-only (or non-string) input yields `'scenic road'`.
 *
 * Deterministic and total: the same input always yields the same result and the
 * result always contains `"road"`.
 */
export function ensureRoadType(roadType: string): string {
  if (typeof roadType !== 'string' || roadType.trim() === '') {
    return 'scenic road'
  }
  if (roadType.toLowerCase().includes('road')) {
    return roadType
  }
  return `${roadType} road`
}

/**
 * Merge accepted re-plan proposals into the current itinerary WITHOUT dropping
 * or overwriting any leg the user did not accept (Req 1.5).
 *
 * Rules:
 * - An accepted proposal that shares a `_key` with a current leg REPLACES that
 *   current leg (the user accepted a change to it).
 * - An accepted proposal with a new `_key` (or no matching current leg) is
 *   ADDED.
 * - Every current leg NOT replaced by an accepted proposal is PRESERVED.
 * - The result is a NEW array (inputs are never mutated), ordered via the
 *   existing `orderLegs`.
 * - Empty/undefined inputs are treated as `[]`.
 *
 * When two accepted proposals share the same `_key`, the later one wins (last
 * write), keeping the merge deterministic.
 */
export function mergeProposedLegs(
  current: ItineraryLeg[],
  accepted: ItineraryLeg[]
): ItineraryLeg[] {
  const currentArr = Array.isArray(current) ? current : []
  const acceptedArr = Array.isArray(accepted) ? accepted : []

  // Index accepted proposals by _key (later proposals override earlier ones).
  const acceptedByKey = new Map<string, ItineraryLeg>()
  const acceptedNoKey: ItineraryLeg[] = []
  for (const leg of acceptedArr) {
    if (!leg) continue
    if (leg._key !== undefined && leg._key !== null && leg._key !== '') {
      acceptedByKey.set(leg._key, leg)
    } else {
      acceptedNoKey.push(leg)
    }
  }

  const merged: ItineraryLeg[] = []
  const usedAcceptedKeys = new Set<string>()

  // Walk current legs, replacing any that an accepted proposal targets by _key.
  for (const leg of currentArr) {
    if (!leg) continue
    if (leg._key !== undefined && acceptedByKey.has(leg._key)) {
      merged.push(acceptedByKey.get(leg._key) as ItineraryLeg)
      usedAcceptedKeys.add(leg._key)
    } else {
      merged.push(leg)
    }
  }

  // Add accepted proposals whose _key did not match any current leg.
  for (const [key, leg] of acceptedByKey) {
    if (!usedAcceptedKeys.has(key)) merged.push(leg)
  }

  // Add keyless accepted proposals (always treated as additions).
  for (const leg of acceptedNoKey) merged.push(leg)

  return orderLegs(merged)
}

// ── AI → schema mappers + "Search for:" prefix helper (Req 2.2–2.4, 2.7, 3.3, 4.4, 4.5, 5.3, 5.6) ──
//
// These helpers are the PURE, network-free transform layer between a fail-soft
// AI finder/safety result and the Sanity-shaped records the client persists.
//
// Hard invariants (verified by Properties 6, 8, 9):
//  - Every AI-sourced place/opportunity is flagged `aiSuggested: true`, and
//    every safety record carries a NON-EMPTY `verifyNote` — an AI guess is
//    never presentable as confirmed fact (Req 2.7, 3.3, 4.5, 5.3, 5.6).
//  - Coordinates are set ONLY from an explicitly passed, already-server-geocoded
//    `{ lat, lng }` value. These mappers NEVER read lat/lng from the raw AI
//    result object, even if the model stuffed stray coordinate fields into it
//    (Req 2.2, 4.4 — no invented coordinates).
//  - `markSearchFor` is idempotent: it never double-prefixes (Req 2.3).
//
// No `_key` / `uid` is generated here — the client adds `_key` via its
// `addItem`/`uid` helper — so these functions stay pure and trivially testable.

/** The low-confidence lead prefix, matching the existing finder convention. */
export const SEARCH_FOR_PREFIX = 'Search for: '

/** Default verify note used when a safety result omits one; always non-empty. */
export const DEFAULT_VERIFY_NOTE =
  'AI guidance only — no live road-status source. Verify before you travel.'

/** A server-geocoded coordinate pair. Only ever supplied explicitly. */
export interface GeoPoint {
  lat: number
  lng: number
}

/** Raw scenic-road result shape returned by the `ai-find-scenic-roads` action. */
export interface ScenicRoadResult {
  name: string
  location: string
  roadType?: string
  why?: string
  bestMonths?: string
  scenicRating?: string
  seasonalNote?: string
  confident?: boolean
}

/** The mapped `place`-shaped record for a scenic road (no `_key`). */
export interface ScenicRoadPlace {
  _type: 'place'
  name: string
  placeType: string
  location: string
  why?: string
  scenicRating?: string
  seasonalNote?: string
  priority: 'High'
  legKey?: string
  aiSuggested: true
  visited: false
  coordinates?: GeoPoint
}

/** Raw park-up result shape returned by the `ai-find-scenic-parkups` action. */
export interface ParkupResult {
  name: string
  location: string
  description?: string
  facilities?: string
  cost?: string
  rating?: string
  scenicNote?: string
  bestMonths?: string
  confident?: boolean
}

/** The mapped `opportunity`-shaped record for a park-up (no `_key`). */
export interface ParkupOpportunity {
  _type: 'opportunity'
  name: string
  oppType: 'free_parkup'
  platform: 'Park4Night'
  location: string
  description?: string
  facilities?: string
  cost?: string
  rating?: string
  bestMonths?: string
  legKey?: string
  priorityLevel: 'Medium'
  aiSuggested: true
  status: 'to_research'
  coordinates?: GeoPoint
}

/** Raw seasonal-safety result shape returned by the `ai-road-safety` action. */
export interface AiSafety {
  summary?: string
  closures?: string[]
  winterRisks?: string[]
  verifyNote?: string
}

/** The stored seasonal-safety record (always a non-empty `verifyNote`). */
export interface SafetyRecord {
  seasonalNote: string
  safetyCheckedMonth: string
  verifyNote: string
}

/**
 * Prefix `name` with `Search for: ` when `lowConfidence` is true, exactly once
 * (Req 2.3). Idempotent: a name that already starts with the prefix is returned
 * unchanged. When `lowConfidence` is false the name is returned as-is (an
 * already-prefixed name is left alone, never stripped). Deterministic and total.
 */
export function markSearchFor(name: string, lowConfidence: boolean): string {
  const safeName = typeof name === 'string' ? name : ''
  if (!lowConfidence) return safeName
  if (safeName.startsWith(SEARCH_FOR_PREFIX)) return safeName
  return `${SEARCH_FOR_PREFIX}${safeName}`
}

/**
 * Map a scenic-road AI result to a `place`-shaped record (Req 2.2, 2.4, 2.7).
 *
 * - `name` is low-confidence-prefixed when `result.confident === false`.
 * - `placeType` runs through `ensureRoadType` so it always classifies to the
 *   `road` map category.
 * - `aiSuggested` is always `true` (Verify flag) and `visited` is `false`.
 * - `coordinates` is set ONLY from the passed `coordinates` arg, never from
 *   `result`; omitted entirely when the arg is absent.
 * - No `_key` is generated here (the client assigns it).
 *
 * Undefined optional fields (`why`, `scenicRating`, `seasonalNote`) are omitted
 * so the stored shape stays clean. Pure and deterministic.
 */
export function scenicRoadToPlace(
  result: ScenicRoadResult,
  legKey?: string,
  coordinates?: GeoPoint
): ScenicRoadPlace {
  const place: ScenicRoadPlace = {
    _type: 'place',
    name: markSearchFor(result.name, result.confident === false),
    placeType: ensureRoadType(result.roadType || ''),
    location: result.location,
    priority: 'High',
    aiSuggested: true,
    visited: false,
  }
  if (result.why !== undefined) place.why = result.why
  if (result.scenicRating !== undefined) place.scenicRating = result.scenicRating
  if (result.seasonalNote !== undefined) place.seasonalNote = result.seasonalNote
  if (legKey !== undefined && legKey !== '') place.legKey = legKey
  // Coordinates ONLY from the explicitly passed, server-geocoded value.
  if (coordinates) place.coordinates = { lat: coordinates.lat, lng: coordinates.lng }
  return place
}

/**
 * Map a park-up AI result to an `opportunity`-shaped record (Req 4.4, 4.5).
 *
 * - `name` is low-confidence-prefixed when `result.confident === false`.
 * - `platform` is always `'Park4Night'`, `oppType` is `'free_parkup'`,
 *   `priorityLevel` is `'Medium'`, `status` is `'to_research'`.
 * - `aiSuggested` is always `true` (Verify flag — confirm with a real listing).
 * - `description` is the given `description`, falling back to `scenicNote` when
 *   `description` is absent.
 * - `coordinates` is set ONLY from the passed `coordinates` arg, never from
 *   `result`; omitted when the arg is absent.
 * - No `_key` is generated here (the client assigns it).
 *
 * Undefined optional fields are omitted. Pure and deterministic.
 */
export function parkupToOpportunity(
  result: ParkupResult,
  legKey?: string,
  coordinates?: GeoPoint
): ParkupOpportunity {
  const opp: ParkupOpportunity = {
    _type: 'opportunity',
    name: markSearchFor(result.name, result.confident === false),
    oppType: 'free_parkup',
    platform: 'Park4Night',
    location: result.location,
    priorityLevel: 'Medium',
    aiSuggested: true,
    status: 'to_research',
  }
  // Prefer an explicit description; otherwise carry scenicNote into description.
  const description =
    result.description !== undefined ? result.description : result.scenicNote
  if (description !== undefined) opp.description = description
  if (result.facilities !== undefined) opp.facilities = result.facilities
  if (result.cost !== undefined) opp.cost = result.cost
  if (result.rating !== undefined) opp.rating = result.rating
  if (result.bestMonths !== undefined) opp.bestMonths = result.bestMonths
  if (legKey !== undefined && legKey !== '') opp.legKey = legKey
  // Coordinates ONLY from the explicitly passed, server-geocoded value.
  if (coordinates) opp.coordinates = { lat: coordinates.lat, lng: coordinates.lng }
  return opp
}

/**
 * Build the stored seasonal-safety record from an AI safety result and the
 * relevant travel month (Req 3.3, 5.3).
 *
 * - `seasonalNote` composes the summary with any closures and winter-risk
 *   lines so the stored note is self-contained.
 * - `safetyCheckedMonth` is the stringified `month`.
 * - `verifyNote` is GUARANTEED non-empty: it uses the AI-provided note when
 *   present and non-blank, otherwise a safe default. This is the Verify flag
 *   for safety guidance (an AI guess is never shown as confirmed fact).
 *
 * Pure, total, and deterministic.
 */
export function safetyRecord(aiSafety: AiSafety, month: string | number): SafetyRecord {
  const safety = aiSafety || {}
  const parts: string[] = []

  const summary = typeof safety.summary === 'string' ? safety.summary.trim() : ''
  if (summary !== '') parts.push(summary)

  const closures = Array.isArray(safety.closures)
    ? safety.closures.filter((c) => typeof c === 'string' && c.trim() !== '')
    : []
  if (closures.length > 0) parts.push(`Closures: ${closures.join('; ')}`)

  const winterRisks = Array.isArray(safety.winterRisks)
    ? safety.winterRisks.filter((r) => typeof r === 'string' && r.trim() !== '')
    : []
  if (winterRisks.length > 0) parts.push(`Winter risks: ${winterRisks.join('; ')}`)

  const seasonalNote = parts.join('\n')

  const providedVerify =
    typeof safety.verifyNote === 'string' ? safety.verifyNote.trim() : ''
  const verifyNote = providedVerify !== '' ? providedVerify : DEFAULT_VERIFY_NOTE

  return {
    seasonalNote,
    safetyCheckedMonth: String(month),
    verifyNote,
  }
}
