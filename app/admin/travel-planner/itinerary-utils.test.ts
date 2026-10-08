// Property-based tests for the pure helper module `itinerary-utils.ts`.
//
// Each property test corresponds 1:1 to a Correctness Property in
// .kiro/specs/travel-itinerary-calendar/design.md and is tagged with the exact
// property text. Every property runs a minimum of 100 iterations.

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

import {
  parseYmd,
  isValidDate,
  inclusiveDayCount,
  eachDayOfMonth,
  monthGridDays,
  legsCovering,
  isOverlap,
  dateInRange,
  gapDays,
  timelineBounds,
  sumHopTotals,
  metersToMiles1dp,
  metersToKm1dp,
  secondsToHm,
  orderLegs,
  departureCountryFor,
  buildShareableSummary,
  compareDates,
  ymdToOrdinal,
  isOverDriveLimit,
  splitPlan,
  travelMonthsOf,
  isWinterMonth,
  legKeyForPlace,
  associateParkupsToLeg,
  ensureRoadType,
  mergeProposedLegs,
  markSearchFor,
  scenicRoadToPlace,
  parkupToOpportunity,
  safetyRecord,
  SEARCH_FOR_PREFIX,
  type ItineraryLeg,
  type Associable,
  type ScenicRoadResult,
  type ParkupResult,
  type AiSafety,
} from './itinerary-utils'

import {
  ymd,
  orderedPair,
  boundedPair,
  invalidDate,
  legList,
  clusteredLegList,
  meters,
  seconds,
  hopResultList,
  refDaysFromEpoch,
  daysInMonth,
  fmt,
  uniqueKey,
} from './itinerary-test-helpers'

const RUNS = { numRuns: 100 }

describe('itinerary-utils property tests', () => {
  // Feature: travel-itinerary-calendar, Property 1: For any valid start date and any valid end date not earlier than the start, `inclusiveDayCount(start, end)` equals the number of calendar days from start to end counting both endpoints, and equals `1` when `start == end`.
  it('Property 1: inclusiveDayCount matches ordinal span (and is 1 for equal dates)', () => {
    fc.assert(
      fc.property(orderedPair, ([start, end]) => {
        const [ys, ms, ds] = start.split('-').map(Number)
        const [ye, me, de] = end.split('-').map(Number)
        const expected =
          refDaysFromEpoch(ye, me, de) - refDaysFromEpoch(ys, ms, ds) + 1
        expect(inclusiveDayCount(start, end)).toBe(expected)
      }),
      RUNS
    )
    fc.assert(
      fc.property(ymd, (s) => {
        expect(inclusiveDayCount(s, s)).toBe(1)
      }),
      RUNS
    )
  })

  // Feature: travel-itinerary-calendar, Property 2: For any valid `'YYYY-MM-DD'` string, parsing it and reformatting it (and mapping it through `eachDayOfMonth`/`monthGridDays` for its own month) yields the identical string, with no timezone-induced day shift.
  it('Property 2: calendar dates round-trip without shifting', () => {
    fc.assert(
      fc.property(ymd, (s) => {
        const parsed = parseYmd(s)
        expect(parsed).not.toBeNull()
        const p = parsed!
        // Reformat from parsed parts yields the identical string.
        expect(fmt(p.y, p.m, p.d)).toBe(s)

        // eachDayOfMonth: the (d-1)-th entry for the string's own month equals it.
        const monthDays = eachDayOfMonth(p.y, p.m)
        expect(monthDays[p.d - 1]).toBe(s)

        // monthGridDays for its own month contains the string exactly once,
        // for both week-start conventions, with no shift.
        for (const weekStart of [0, 1]) {
          const grid = monthGridDays(p.y, p.m, weekStart)
          const occurrences = grid.filter((g) => g === s)
          expect(occurrences.length).toBe(1)
        }
      }),
      RUNS
    )
  })

  // Feature: travel-itinerary-calendar, Property 3: For any string that is not a valid calendar date (bad format, month `00`/`13`, day `00`, `2 30`, non-leap `Feb 29`), `isValidDate` returns false and leg validation rejects the submission; for any valid calendar date it returns true.
  it('Property 3: isValidDate accepts valid dates and rejects invalid ones', () => {
    fc.assert(
      fc.property(ymd, (s) => {
        expect(isValidDate(s)).toBe(true)
      }),
      RUNS
    )
    fc.assert(
      fc.property(invalidDate, (s) => {
        expect(isValidDate(s)).toBe(false)
      }),
      RUNS
    )
  })

  // Feature: travel-itinerary-calendar, Property 4: For any set of legs and any date, `legsCovering(day)` returns exactly those legs whose inclusive `[startDate, endDate]` range contains the day; the day is an overlap iff that set has more than one leg, and not-covered iff the set is empty.
  it('Property 4: legsCovering matches dateInRange oracle; overlap iff >1; empty iff uncovered', () => {
    fc.assert(
      fc.property(legList, ymd, (legs, day) => {
        // Independent oracle: filter with dateInRange using each leg's effective range.
        const oracle = legs.filter((leg) => {
          const start = leg.startDate
          if (!start || !isValidDate(start)) return false
          const end = leg.endDate && isValidDate(leg.endDate) ? leg.endDate : start
          return dateInRange(day, start, end)
        })
        const covering = legsCovering(day, legs)
        expect(covering.map((l) => l._key).sort()).toEqual(
          oracle.map((l) => l._key).sort()
        )
        expect(isOverlap(day, legs)).toBe(covering.length > 1)
        expect(covering.length === 0).toBe(oracle.length === 0)
      }),
      RUNS
    )
  })

  // Feature: travel-itinerary-calendar, Property 5: For any non-empty set of legs, `gapDays(legs)` returns exactly the dates strictly between the earliest start and latest end that are covered by zero legs — every returned date is uncovered and in range, and no uncovered in-range date is omitted.
  it('Property 5: gapDays are exactly the in-range uncovered dates', () => {
    fc.assert(
      fc.property(clusteredLegList, (legs) => {
        const bounds = timelineBounds(legs)
        const gaps = gapDays(legs)
        const gapSet = new Set(gaps)

        if (!bounds) {
          expect(gaps).toEqual([])
          return
        }

        // Every returned gap is in range and covered by zero legs.
        for (const g of gaps) {
          expect(dateInRange(g, bounds.min, bounds.max)).toBe(true)
          expect(legsCovering(g, legs).length).toBe(0)
        }

        // No uncovered in-range date is omitted: iterate the bounds day-by-day.
        // Accumulate any mismatch and assert once at the end to keep the
        // per-iteration cost low across many generated inputs.
        let cursor = parseYmd(bounds.min)!
        const endOrd = ymdToOrdinal(parseYmd(bounds.max)!)
        let mismatch: string | null = null
        let guard = 0
        while (ymdToOrdinal(cursor) <= endOrd && guard < 100000) {
          const day = fmt(cursor.y, cursor.m, cursor.d)
          const uncovered = legsCovering(day, legs).length === 0
          if (uncovered !== gapSet.has(day)) {
            mismatch = day
            break
          }
          // advance one day using reference math
          const dim = daysInMonth(cursor.y, cursor.m)
          if (cursor.d < dim) {
            cursor = { ...cursor, d: cursor.d + 1 }
          } else if (cursor.m < 12) {
            cursor = { y: cursor.y, m: cursor.m + 1, d: 1 }
          } else {
            cursor = { y: cursor.y + 1, m: 1, d: 1 }
          }
          guard++
        }
        expect(mismatch).toBeNull()
      }),
      RUNS
    )
  })

  // Feature: travel-itinerary-calendar, Property 6: For any list of hop results, the reported trip-total distance equals the sum of `distanceMeters` over hops with `ok === true` (and likewise for duration), and hops that are failed or coords-needed contribute zero.
  it('Property 6: sumHopTotals equals the sum over successful hops', () => {
    fc.assert(
      fc.property(hopResultList, (results) => {
        let dist = 0
        let dur = 0
        for (const r of results) {
          if (r.ok) {
            dist += r.distanceMeters ?? 0
            dur += r.durationSeconds ?? 0
          }
        }
        const totals = sumHopTotals(results)
        expect(totals.distanceMeters).toBeCloseTo(dist, 6)
        expect(totals.durationSeconds).toBeCloseTo(dur, 6)
      }),
      RUNS
    )
  })

  // Feature: travel-itinerary-calendar, Property 7: For any non-negative distance in metres, `metersToMiles1dp` and `metersToKm1dp` equal the true conversion (`m / 1609.344`, `m / 1000`) within rounding tolerance and always carry at most one decimal place.
  it('Property 7: metre conversions are correct and rounded to one decimal place', () => {
    fc.assert(
      fc.property(meters, (m) => {
        const miles = metersToMiles1dp(m)
        const km = metersToKm1dp(m)
        expect(miles).toBe(Math.round((m / 1609.344) * 10) / 10)
        expect(km).toBe(Math.round((m / 1000) * 10) / 10)
        // At most one decimal place: value * 10 is an integer.
        expect(Number.isInteger(Math.round(miles * 10))).toBe(true)
        expect(Math.abs(miles * 10 - Math.round(miles * 10))).toBeLessThan(1e-6)
        expect(Math.abs(km * 10 - Math.round(km * 10))).toBeLessThan(1e-6)
      }),
      RUNS
    )
  })

  // Feature: travel-itinerary-calendar, Property 8: For any non-negative duration in seconds, `secondsToHm` yields non-negative integer `h` and `m` with `0 <= m < 60` and `h*3600 + m*60` equal to the input truncated to whole minutes.
  it('Property 8: secondsToHm yields whole hours and minutes summing to the input', () => {
    fc.assert(
      fc.property(seconds, (s) => {
        const { h, m } = secondsToHm(s)
        expect(Number.isInteger(h)).toBe(true)
        expect(Number.isInteger(m)).toBe(true)
        expect(h).toBeGreaterThanOrEqual(0)
        expect(m).toBeGreaterThanOrEqual(0)
        expect(m).toBeLessThan(60)
        expect(h * 3600 + m * 60).toBe(Math.floor(s / 60) * 60)
      }),
      RUNS
    )
  })

  // Feature: travel-itinerary-calendar, Property 9: For any set of legs, `orderLegs` returns a permutation of the input in non-decreasing `startDate` order.
  it('Property 9: orderLegs is a permutation and non-decreasing by start date', () => {
    fc.assert(
      fc.property(legList, (legs) => {
        const ordered = orderLegs(legs)
        // Permutation: same multiset of _key values.
        expect(ordered.map((l) => l._key).sort()).toEqual(
          legs.map((l) => l._key).sort()
        )
        expect(ordered.length).toBe(legs.length)
        // Non-decreasing by startDate for consecutive legs that both have valid starts.
        for (let i = 0; i + 1 < ordered.length; i++) {
          const a = ordered[i]
          const b = ordered[i + 1]
          const aValid = !!a.startDate && isValidDate(a.startDate)
          const bValid = !!b.startDate && isValidDate(b.startDate)
          if (aValid && bValid) {
            expect(compareDates(a.startDate!, b.startDate!)).toBeLessThanOrEqual(0)
          }
        }
      }),
      RUNS
    )
  })

  // Feature: travel-itinerary-calendar, Property 10: For any ordered timeline and any covered date, when a leg has no explicit `departureCountry`, `departureCountryFor` returns the country of the immediately preceding leg; when it has an explicit value, that value is returned unchanged.
  it('Property 10: departureCountryFor defaults to the previous leg country, else explicit value', () => {
    // Build a contiguous ordered timeline of non-overlapping consecutive legs so
    // that on a day covered by leg i, `covering[0]` is exactly leg i.
    const timeline = fc
      .array(
        fc.record({
          country: fc.string({ minLength: 1, maxLength: 8 }),
          span: fc.integer({ min: 0, max: 5 }),
          explicitDep: fc.option(fc.string({ minLength: 1, maxLength: 8 }), { nil: undefined }),
          key: uniqueKey,
        }),
        { minLength: 2, maxLength: 5 }
      )
      .map((specs) => {
        // Lay legs out contiguously starting 2000-01-01, each leg i occupying
        // [cursor, cursor+span], next leg starts the following day.
        let y = 2000
        let mo = 1
        let d = 1
        const advance = (n: number) => {
          for (let k = 0; k < n; k++) {
            const dim = daysInMonth(y, mo)
            if (d < dim) d += 1
            else if (mo < 12) { mo += 1; d = 1 }
            else { y += 1; mo = 1; d = 1 }
          }
        }
        const legs: ItineraryLeg[] = []
        for (const spec of specs) {
          const startDate = fmt(y, mo, d)
          advance(spec.span)
          const endDate = fmt(y, mo, d)
          const leg: ItineraryLeg = {
            _type: 'itineraryLeg',
            _key: spec.key,
            label: 'L',
            country: spec.country,
            startDate,
            endDate,
            travelModeIn: 'drive',
          }
          if (spec.explicitDep !== undefined) leg.departureCountry = spec.explicitDep
          legs.push(leg)
          advance(1) // gap-free: next leg starts the day after this one ends
        }
        return legs
      })

    fc.assert(
      fc.property(timeline, (legs) => {
        for (let i = 1; i < legs.length; i++) {
          const day = legs[i].startDate!
          const result = departureCountryFor(day, legs)
          const explicit = legs[i].departureCountry
          if (explicit && explicit.trim() !== '') {
            expect(result).toBe(explicit)
          } else {
            expect(result).toBe(legs[i - 1].country ?? '')
          }
        }
      }),
      RUNS
    )
  })

  // Feature: travel-itinerary-calendar, Property 11: For any leg with arbitrary `notes` text and any covered date, the string produced by `buildShareableSummary` does not contain that notes text, while it does contain the date, location label, country, and departure country.
  it('Property 11: buildShareableSummary excludes notes and includes date/label', () => {
    // Use distinctive notes tokens that cannot collide with label/country/date.
    const notesToken = fc.integer({ min: 0, max: 1_000_000 }).map((n) => `NOTE_${n}_X`)
    const covered = fc
      .record({
        key: uniqueKey,
        label: fc.string({ minLength: 1, maxLength: 12 }).filter((s) => s.trim() !== ''),
        country: fc.string({ minLength: 1, maxLength: 8 }).filter((s) => s.trim() !== ''),
        pair: orderedPair,
        notes: notesToken,
      })
      .map((r) => {
        const [startDate, endDate] = r.pair
        const leg: ItineraryLeg = {
          _type: 'itineraryLeg',
          _key: r.key,
          label: r.label,
          country: r.country,
          startDate,
          endDate,
          notes: r.notes,
          travelModeIn: 'drive',
        }
        return { leg, day: startDate }
      })

    fc.assert(
      fc.property(covered, ({ leg, day }) => {
        const summary = buildShareableSummary(day, [leg])
        // Never contains the notes token.
        expect(summary.includes(leg.notes!)).toBe(false)
        // Contains the date and the label.
        expect(summary.includes(day)).toBe(true)
        expect(summary.includes(leg.label)).toBe(true)
      }),
      RUNS
    )
  })

  // A positive drive-hour limit in a realistic range (0.5h .. 24h).
  const positiveHours = fc.double({ min: 0.5, max: 24, noNaN: true })

  // Feature: travel-itinerary-calendar, Property 12: Journey split produces segments within the drive-hour limit
  it('Property 12: Journey split produces segments within the drive-hour limit', () => {
    fc.assert(
      fc.property(seconds, positiveHours, (durationSeconds, maxHours) => {
        const { segments, perSegmentSeconds } = splitPlan(durationSeconds, maxHours)
        const limit = maxHours * 3600
        // At least one segment.
        expect(segments).toBeGreaterThanOrEqual(1)
        // Each segment fits within the limit (allow 1s of rounding slack).
        expect(perSegmentSeconds).toBeLessThanOrEqual(limit + 1)
        // The segments reconstruct the original duration within a few seconds
        // (rounding perSegmentSeconds can drift by up to ~segments/2 seconds).
        const reconstructed = segments * perSegmentSeconds
        expect(Math.abs(reconstructed - durationSeconds)).toBeLessThanOrEqual(segments)
      }),
      RUNS
    )
  })

  // Feature: travel-itinerary-calendar, Property 13: Over-limit detection matches the hour threshold
  it('Property 13: Over-limit detection matches the hour threshold', () => {
    fc.assert(
      fc.property(seconds, positiveHours, (durationSeconds, maxHours) => {
        expect(isOverDriveLimit(durationSeconds, maxHours)).toBe(
          durationSeconds > maxHours * 3600
        )
      }),
      RUNS
    )
    // Non-positive or NaN limits mean "no limit" → always false.
    fc.assert(
      fc.property(
        seconds,
        fc.oneof(fc.double({ min: -1000, max: 0, noNaN: true }), fc.constant(NaN)),
        (durationSeconds, badHours) => {
          expect(isOverDriveLimit(durationSeconds, badHours)).toBe(false)
        }
      ),
      RUNS
    )
  })

  // Feature: scenic-road-trip-planner, Property 2: For any itinerary leg with a valid startDate and (optional) endDate >= startDate, travelMonthsOf(leg) returns exactly the set of 1-12 month numbers spanned by [startDate, endDate] in ascending contiguous order; and returns [] when the dates are missing or invalid.
  it('Property 2: travelMonthsOf returns the contiguous month span in travel order, else []', () => {
    // A minimal leg wrapper for the function under test (only dates matter).
    const makeLeg = (startDate?: string, endDate?: string): ItineraryLeg => {
      const l: ItineraryLeg = {
        _type: 'itineraryLeg',
        _key: 'k',
        label: 'L',
        travelModeIn: 'drive',
      }
      if (startDate !== undefined) l.startDate = startDate
      if (endDate !== undefined) l.endDate = endDate
      return l
    }

    // Independent oracle: walk month-by-month from start month to end month in
    // calendar order (handles year-boundary spans like Dec->Jan -> [12, 1]).
    const expectedMonths = (start: string, end: string): number[] => {
      const [ys, ms] = start.split('-').map(Number)
      const [ye, me] = end.split('-').map(Number)
      const months: number[] = []
      let y = ys
      let m = ms
      while (y < ye || (y === ye && m <= me)) {
        months.push(m)
        m += 1
        if (m > 12) {
          m = 1
          y += 1
        }
      }
      return months
    }

    // Case A: valid start + valid end (end >= start) → contiguous month span.
    fc.assert(
      fc.property(boundedPair, ([start, end]) => {
        expect(travelMonthsOf(makeLeg(start, end))).toEqual(expectedMonths(start, end))
      }),
      RUNS
    )

    // Case B: valid start, no end date → single-month span at the start month.
    fc.assert(
      fc.property(ymd, (start) => {
        const [, m] = start.split('-').map(Number)
        expect(travelMonthsOf(makeLeg(start, undefined))).toEqual([m])
      }),
      RUNS
    )

    // Case C: missing/invalid start, or present-but-invalid end, or end < start → [].
    const emptyCases: fc.Arbitrary<ItineraryLeg> = fc.oneof(
      // Missing start.
      ymd.map((end) => makeLeg(undefined, end)),
      fc.constant(makeLeg(undefined, undefined)),
      // Invalid start (end optional).
      fc.tuple(invalidDate, fc.option(ymd, { nil: undefined })).map(([bad, end]) =>
        makeLeg(bad, end)
      ),
      // Valid start but invalid end present. Exclude the empty string: an empty
      // endDate is treated by travelMonthsOf as "no end date" (single-month
      // span), not as an invalid end, so it does not belong in this [] case.
      fc.tuple(ymd, invalidDate.filter((s) => s !== '')).map(([start, bad]) => makeLeg(start, bad)),
      // Valid start, valid end, but end strictly before start (swap an ordered pair
      // when the two days differ).
      boundedPair
        .filter(([a, b]) => a !== b)
        .map(([a, b]) => makeLeg(b, a))
    )
    fc.assert(
      fc.property(emptyCases, (l) => {
        expect(travelMonthsOf(l)).toEqual([])
      }),
      RUNS
    )
  })

  // Feature: scenic-road-trip-planner, Property 3: For any integer month, isWinterMonth(month) returns true if and only if the month is one of November, December, January, February, or March (11, 12, 1, 2, 3).
  it('Property 3: isWinterMonth is true iff the month is 11, 12, 1, 2, or 3', () => {
    const WINTER = [11, 12, 1, 2, 3]
    fc.assert(
      fc.property(fc.integer({ min: -24, max: 36 }), (month) => {
        expect(isWinterMonth(month)).toBe(WINTER.includes(month))
      }),
      RUNS
    )
  })

  // Feature: scenic-road-trip-planner, Property 1: For any array of itinerary legs, orderLegs returns a permutation of the input that is non-decreasing by start-date ordinal, places invalid/missing-date legs last preserving their relative order, and is idempotent.
  it('Property 1: orderLegs is a permutation, non-decreasing by date, invalid-last, idempotent', () => {
    // Legs with a mix of valid, missing, and invalid startDates so we exercise
    // the "invalid/missing sorts last preserving relative order" branch.
    const mixedLeg: fc.Arbitrary<ItineraryLeg> = fc
      .record({
        _key: uniqueKey,
        label: fc.string({ minLength: 1, maxLength: 8 }).filter((s) => s.trim() !== ''),
        start: fc.oneof(
          ymd, // valid
          invalidDate, // present but invalid
          fc.constant(undefined) // missing
        ),
      })
      .map((r) => {
        const l: ItineraryLeg = {
          _type: 'itineraryLeg',
          _key: r._key,
          label: r.label,
          travelModeIn: 'drive',
        }
        if (r.start !== undefined) l.startDate = r.start
        return l
      })
    const mixedLegList = fc.array(mixedLeg, { minLength: 0, maxLength: 8 })

    const hasValidStart = (l: ItineraryLeg): boolean =>
      !!l.startDate && parseYmd(l.startDate) !== null

    fc.assert(
      fc.property(mixedLegList, (legs) => {
        const ordered = orderLegs(legs)

        // 1) Permutation: same multiset of _key values and same length.
        expect(ordered.length).toBe(legs.length)
        expect(ordered.map((l) => l._key).sort()).toEqual(legs.map((l) => l._key).sort())

        // 2) Non-decreasing by start-date ordinal across the dated prefix.
        for (let i = 0; i + 1 < ordered.length; i++) {
          const a = ordered[i]
          const b = ordered[i + 1]
          if (hasValidStart(a) && hasValidStart(b)) {
            expect(compareDates(a.startDate!, b.startDate!)).toBeLessThanOrEqual(0)
          }
        }

        // 3) All dated legs precede all undated/invalid legs: once we see an
        // invalid/missing leg, every subsequent leg is also invalid/missing.
        let seenInvalid = false
        for (const l of ordered) {
          if (!hasValidStart(l)) seenInvalid = true
          else expect(seenInvalid).toBe(false)
        }

        // 4) Invalid/missing legs appear last in their ORIGINAL relative order.
        const invalidOrderedKeys = ordered.filter((l) => !hasValidStart(l)).map((l) => l._key)
        const invalidInputKeys = legs.filter((l) => !hasValidStart(l)).map((l) => l._key)
        expect(invalidOrderedKeys).toEqual(invalidInputKeys)

        // 5) Idempotence: ordering an already-ordered list is a no-op.
        const twice = orderLegs(ordered)
        expect(twice).toEqual(ordered)
      }),
      RUNS
    )
  })

  // Feature: scenic-road-trip-planner, Property 4: For any set of places and park-ups and any set of legs, association assigns each item to the leg named by its legKey when that leg exists, otherwise deterministically to the nearest-by-coordinates leg (or none), and never attributes an item to a leg other than its resolved one; stable and deterministic for identical input.
  it('Property 4: association resolves by legKey else nearest coordinates, deterministically', () => {
    // Coordinate generator (bounded, finite).
    const coord = fc.record({
      lat: fc.double({ min: -90, max: 90, noNaN: true }),
      lng: fc.double({ min: -180, max: 180, noNaN: true }),
    })

    // A leg carrying a unique _key and optional coordinates. Only the fields
    // used by the association helpers matter here.
    const assocLeg: fc.Arbitrary<ItineraryLeg> = fc
      .record({
        _key: uniqueKey,
        coordinates: fc.option(coord, { nil: undefined }),
      })
      .map((r) => {
        const l: ItineraryLeg = {
          _type: 'itineraryLeg',
          _key: r._key,
          label: 'L',
          travelModeIn: 'drive',
        }
        if (r.coordinates !== undefined) l.coordinates = r.coordinates
        return l
      })

    const assocLegList = fc.array(assocLeg, { minLength: 0, maxLength: 6 })

    // An associable item (place / park-up) with an optional legKey and
    // optional coordinates. The legKey may or may not match an existing leg.
    const makeItem = (legKey?: string, coordinates?: { lat: number; lng: number }): Associable => {
      const item: Associable = { _key: `item-${legKey ?? 'none'}` }
      if (legKey !== undefined) item.legKey = legKey
      if (coordinates !== undefined) item.coordinates = coordinates
      return item
    }

    // Independent oracle for the nearest-by-squared-distance leg with the same
    // tie-break the implementation uses (first-in-order wins, then smaller _key).
    const nearestLegKey = (
      pc: { lat: number; lng: number },
      legs: ItineraryLeg[]
    ): string | undefined => {
      let bestKey: string | undefined
      let bestDist = Infinity
      for (const leg of legs) {
        const c = leg.coordinates
        if (
          !c ||
          !Number.isFinite(c.lat) ||
          !Number.isFinite(c.lng)
        ) {
          continue
        }
        const dLat = pc.lat - c.lat
        const dLng = pc.lng - c.lng
        const dist = dLat * dLat + dLng * dLng
        if (dist < bestDist) {
          bestDist = dist
          bestKey = leg._key
        } else if (dist === bestDist && bestKey !== undefined && leg._key < bestKey) {
          bestKey = leg._key
        }
      }
      return bestKey
    }

    fc.assert(
      fc.property(
        assocLegList,
        // The item either references a real leg's key, a random (likely absent)
        // key, or no key at all; and may or may not carry coordinates.
        fc.oneof(
          fc.constant<{ useRealKey: boolean; key?: string }>({ useRealKey: true }),
          uniqueKey.map((k) => ({ useRealKey: false, key: k })),
          fc.constant<{ useRealKey: boolean; key?: string }>({ useRealKey: false })
        ),
        fc.option(coord, { nil: undefined }),
        fc.nat({ max: 5 }),
        (legs, keySpec, coords, pick) => {
          // Resolve the item's legKey: optionally point at an existing leg.
          let legKey: string | undefined
          if (keySpec.useRealKey && legs.length > 0) {
            legKey = legs[pick % legs.length]._key
          } else {
            legKey = keySpec.key
          }
          const item = makeItem(legKey, coords)

          const resolved = legKeyForPlace(item, legs)

          const matchingLeg =
            legKey !== undefined ? legs.find((l) => l._key === legKey) : undefined

          if (matchingLeg) {
            // 1) Explicit legKey matching an existing leg wins exactly.
            expect(resolved).toBe(legKey)
          } else if (
            coords &&
            legs.some(
              (l) => l.coordinates && Number.isFinite(l.coordinates.lat) && Number.isFinite(l.coordinates.lng)
            )
          ) {
            // 2) No legKey match but coordinates on item and >=1 leg → nearest.
            expect(resolved).toBe(nearestLegKey(coords, legs))
          } else {
            // 3) Neither a legKey match nor usable coordinates → undefined.
            expect(resolved).toBeUndefined()
          }

          // The resolved key is always either undefined or the _key of an
          // actual leg — never a leg other than its resolved one.
          if (resolved !== undefined) {
            expect(legs.some((l) => l._key === resolved)).toBe(true)
          }

          // Determinism: identical input yields identical results.
          expect(legKeyForPlace(item, legs)).toBe(resolved)

          // associateParkupsToLeg returns exactly those opps whose legKey ===
          // leg._key, and never includes an opp belonging to another leg.
          if (legs.length > 0) {
            const targetLeg = legs[pick % legs.length]
            const opps: Associable[] = legs.map((l, i) => ({
              _key: `opp-${i}`,
              legKey: l._key,
            }))
            // Add an opp with no legKey and one with a non-matching legKey.
            opps.push({ _key: 'opp-none' })
            opps.push({ _key: 'opp-foreign', legKey: 'definitely-not-a-leg-key' })

            const associated = associateParkupsToLeg(opps, targetLeg)
            for (const o of associated) {
              expect(o.legKey).toBe(targetLeg._key)
            }
            const expected = opps.filter((o) => o.legKey === targetLeg._key)
            expect(associated).toEqual(expected)

            // Deterministic for identical input.
            expect(associateParkupsToLeg(opps, targetLeg)).toEqual(associated)
          }
        }
      ),
      RUNS
    )
  })

  // Feature: scenic-road-trip-planner, Property 5: For any roadType string, placeCategory(ensureRoadType(roadType)) returns 'road'.
  it('Property 5: ensureRoadType always yields a type that classifies to the road category', () => {
    // `placeCategory` lives in page.tsx (a React client file) and is not
    // importable without pulling React. It returns 'road' when the lowercased
    // placeType contains the substring 'road'. We assert exactly the guarantee
    // that drives that classification: ensureRoadType(any string) always
    // produces a value whose lowercased form contains 'road' — which is
    // precisely what makes placeCategory(ensureRoadType(roadType)) === 'road'.
    fc.assert(
      fc.property(fc.string(), (roadType) => {
        const result = ensureRoadType(roadType)
        expect(typeof result).toBe('string')
        expect(result.toLowerCase().includes('road')).toBe(true)
      }),
      RUNS
    )
  })

  // Feature: scenic-road-trip-planner, Property 7: For any current itinerary and any subset of accepted proposed legs, mergeProposedLegs(current, accepted) yields a result that contains every current leg the user did not accept/replace, contains all accepted proposals, and is ordered by orderLegs.
  it('Property 7: mergeProposedLegs preserves unaccepted legs, applies all accepted, and orders', () => {
    // A current itinerary of legs with unique _keys and valid start dates.
    const currentArb: fc.Arbitrary<ItineraryLeg[]> = fc
      .array(
        fc.record({ _key: uniqueKey, start: ymd }),
        { minLength: 0, maxLength: 6 }
      )
      .map((specs) =>
        specs.map((s) => ({
          _type: 'itineraryLeg' as const,
          _key: s._key,
          label: 'L',
          startDate: s.start,
          travelModeIn: 'drive' as const,
        }))
      )

    fc.assert(
      fc.property(
        currentArb,
        // Which existing-leg indices get REPLACED by an accepted proposal.
        fc.array(fc.nat({ max: 5 }), { maxLength: 6 }),
        // How many brand-new accepted proposals to add.
        fc.array(fc.record({ _key: uniqueKey, start: ymd }), { maxLength: 4 }),
        (current, replaceIdxRaw, newSpecs) => {
          // Build the accepted set: (a) proposals that replace existing _keys,
          // (b) proposals with brand-new _keys.
          const replaceKeys = Array.from(
            new Set(
              replaceIdxRaw
                .filter((i) => current.length > 0 && i < current.length)
                .map((i) => current[i % current.length]._key)
            )
          )
          const replacements: ItineraryLeg[] = replaceKeys.map((key, n) => ({
            _type: 'itineraryLeg',
            _key: key, // same _key → replaces the current leg
            label: `REPLACED-${n}`,
            startDate: current.find((l) => l._key === key)!.startDate,
            travelModeIn: 'drive',
          }))
          const additions: ItineraryLeg[] = newSpecs.map((s) => ({
            _type: 'itineraryLeg',
            _key: s._key,
            label: 'NEW',
            startDate: s.start,
            travelModeIn: 'drive',
          }))
          const accepted = [...replacements, ...additions]

          const result = mergeProposedLegs(current, accepted)
          const resultByKey = new Map(result.map((l) => [l._key, l]))
          const replaceKeySet = new Set(replaceKeys)

          // 1) Every current leg the user did NOT accept/replace is preserved
          //    verbatim.
          for (const leg of current) {
            if (!replaceKeySet.has(leg._key)) {
              expect(resultByKey.get(leg._key)).toEqual(leg)
            }
          }

          // 2) Every accepted proposal appears, and a replacement overwrites the
          //    same-_key current leg (result holds the proposal, not the original).
          for (const prop of accepted) {
            expect(resultByKey.get(prop._key)).toEqual(prop)
          }

          // No duplicate _keys in the result.
          expect(result.length).toBe(resultByKey.size)

          // 3) Length == (current legs not replaced) + (accepted proposals).
          const preservedCount = current.filter((l) => !replaceKeySet.has(l._key)).length
          expect(result.length).toBe(preservedCount + accepted.length)

          // 4) The result is ordered by orderLegs (idempotent under re-order).
          expect(orderLegs(result)).toEqual(result)
        }
      ),
      RUNS
    )
  })

  // Feature: scenic-road-trip-planner, Property 6: For any AI finder result, when the result is low-confidence (confident === false or ungeocodable-but-kept), the mapped name begins with the 'Search for: ' prefix; and applying the prefixing rule again does not double-prefix an already-prefixed name.
  it('Property 6: markSearchFor prefixes low-confidence names exactly once (idempotent)', () => {
    fc.assert(
      fc.property(fc.string(), (name) => {
        // Low-confidence → prefixed.
        const prefixed = markSearchFor(name, true)
        expect(prefixed.startsWith(SEARCH_FOR_PREFIX)).toBe(true)

        // Idempotent: applying the rule again does not double-prefix.
        expect(markSearchFor(prefixed, true)).toBe(prefixed)

        // High-confidence names without the prefix are returned unchanged.
        if (!name.startsWith(SEARCH_FOR_PREFIX)) {
          expect(markSearchFor(name, false)).toBe(name)
        }
      }),
      RUNS
    )
  })

  // Generators for raw AI finder/safety results, deliberately including stray
  // lat/lng fields on the raw object to prove the mappers never copy them.
  const scenicRoadResultArb: fc.Arbitrary<ScenicRoadResult & { lat?: number; lng?: number }> = fc.record(
    {
      name: fc.string({ maxLength: 20 }),
      location: fc.string({ minLength: 1, maxLength: 20 }),
      roadType: fc.option(fc.string({ maxLength: 15 }), { nil: undefined }),
      why: fc.option(fc.string({ maxLength: 20 }), { nil: undefined }),
      bestMonths: fc.option(fc.string({ maxLength: 15 }), { nil: undefined }),
      scenicRating: fc.option(fc.string({ maxLength: 10 }), { nil: undefined }),
      seasonalNote: fc.option(fc.string({ maxLength: 20 }), { nil: undefined }),
      confident: fc.option(fc.boolean(), { nil: undefined }),
      // Stray model-supplied coordinates that MUST be ignored.
      lat: fc.option(fc.double({ min: -90, max: 90, noNaN: true }), { nil: undefined }),
      lng: fc.option(fc.double({ min: -180, max: 180, noNaN: true }), { nil: undefined }),
    },
    { requiredKeys: ['name', 'location'] }
  )

  const parkupResultArb: fc.Arbitrary<ParkupResult & { lat?: number; lng?: number }> = fc.record(
    {
      name: fc.string({ maxLength: 20 }),
      location: fc.string({ minLength: 1, maxLength: 20 }),
      description: fc.option(fc.string({ maxLength: 20 }), { nil: undefined }),
      facilities: fc.option(fc.string({ maxLength: 15 }), { nil: undefined }),
      cost: fc.option(fc.string({ maxLength: 10 }), { nil: undefined }),
      rating: fc.option(fc.string({ maxLength: 10 }), { nil: undefined }),
      scenicNote: fc.option(fc.string({ maxLength: 20 }), { nil: undefined }),
      bestMonths: fc.option(fc.string({ maxLength: 15 }), { nil: undefined }),
      confident: fc.option(fc.boolean(), { nil: undefined }),
      // Stray model-supplied coordinates that MUST be ignored.
      lat: fc.option(fc.double({ min: -90, max: 90, noNaN: true }), { nil: undefined }),
      lng: fc.option(fc.double({ min: -180, max: 180, noNaN: true }), { nil: undefined }),
    },
    { requiredKeys: ['name', 'location'] }
  )

  const aiSafetyArb: fc.Arbitrary<AiSafety> = fc.record({
    summary: fc.option(fc.string({ maxLength: 25 }), { nil: undefined }),
    closures: fc.option(fc.array(fc.string({ maxLength: 12 }), { maxLength: 3 }), { nil: undefined }),
    winterRisks: fc.option(fc.array(fc.string({ maxLength: 12 }), { maxLength: 3 }), { nil: undefined }),
    // Deliberately include blank/whitespace verifyNotes to exercise the default.
    verifyNote: fc.option(fc.oneof(fc.string({ maxLength: 20 }), fc.constant('   ')), { nil: undefined }),
  })

  // Feature: scenic-road-trip-planner, Property 8: For any AI-sourced record surfaced or stored by the system (scenic-road place, suggested park-up opportunity, or seasonal-safety guidance), the mapped/stored record is marked as unverified (aiSuggested === true, and safety records carry a non-empty verifyNote).
  it('Property 8: every AI-mapped record is flagged unverified (aiSuggested / non-empty verifyNote)', () => {
    fc.assert(
      fc.property(
        scenicRoadResultArb,
        parkupResultArb,
        aiSafetyArb,
        fc.oneof(fc.integer({ min: 1, max: 12 }), fc.string({ maxLength: 6 })),
        (road, parkup, safety, month) => {
          expect(scenicRoadToPlace(road).aiSuggested).toBe(true)
          expect(parkupToOpportunity(parkup).aiSuggested).toBe(true)
          const rec = safetyRecord(safety, month)
          expect(typeof rec.verifyNote).toBe('string')
          expect(rec.verifyNote.length).toBeGreaterThan(0)
        }
      ),
      RUNS
    )
  })

  // Feature: scenic-road-trip-planner, Property 9: For any AI finder result set (scenic roads or park-ups), no item carries model-supplied coordinates; every coordinate on a mapped record originates from the server-side geocode of the result's location string, or is absent.
  it('Property 9: mappers never copy stray result coordinates; only passed geocode is used', () => {
    const geoArb = fc.record({
      lat: fc.double({ min: -90, max: 90, noNaN: true }),
      lng: fc.double({ min: -180, max: 180, noNaN: true }),
    })

    fc.assert(
      fc.property(
        scenicRoadResultArb,
        parkupResultArb,
        fc.option(geoArb, { nil: undefined }),
        (road, parkup, coords) => {
          const place = scenicRoadToPlace(road, undefined, coords)
          const opp = parkupToOpportunity(parkup, undefined, coords)

          if (coords === undefined) {
            // No geocode passed → no coordinates on the mapped record, even
            // though the raw result carried stray lat/lng.
            expect('coordinates' in place).toBe(false)
            expect('coordinates' in opp).toBe(false)
          } else {
            // Coordinates come EXACTLY from the passed geocode, never the stray
            // values on the raw result.
            expect(place.coordinates).toEqual({ lat: coords.lat, lng: coords.lng })
            expect(opp.coordinates).toEqual({ lat: coords.lat, lng: coords.lng })
          }
        }
      ),
      RUNS
    )
  })
})
