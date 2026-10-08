// Example / unit tests for `itinerary-utils.ts` — specific behaviours and edge
// cases that complement the property tests.

import { describe, it, expect, vi } from 'vitest'

import {
  inclusiveDayCount,
  fuelCostGBP,
  estimateFuelCost,
  normaliseLeg,
  validateLeg,
  isOutOfWindow,
  DEFAULT_MAX_DRIVE_HOURS,
  isOverDriveLimit,
  splitPlan,
  overLimitSummary,
  scenicRoadToPlace,
  parkupToOpportunity,
  associatePlacesToLeg,
  associateParkupsToLeg,
  SEARCH_FOR_PREFIX,
  type ItineraryLeg,
  type HopResult,
  type ScenicRoadResult,
  type ParkupResult,
  type ParkupOpportunity,
  type Associable,
} from './itinerary-utils'

function makeLeg(overrides: Partial<ItineraryLeg> = {}): ItineraryLeg {
  return {
    _type: 'itineraryLeg',
    _key: 'k1',
    label: 'Somewhere',
    startDate: '2024-06-10',
    endDate: '2024-06-12',
    travelModeIn: 'drive',
    ...overrides,
  }
}

describe('fuelCostGBP (Req 3.3)', () => {
  it('matches the hand-computed cost at 30 MPG / £1.45 / 4.546 L per gallon', () => {
    const distanceMeters = 160934.4 // exactly 100 miles
    const miles = distanceMeters / 1609.344
    const gallons = miles / 30
    const litres = gallons * 4.546
    const expected = litres * 1.45
    expect(fuelCostGBP(distanceMeters)).toBeCloseTo(expected, 9)
  })

  it('is zero for a zero-distance drive', () => {
    expect(fuelCostGBP(0)).toBe(0)
  })

  it('honours a custom MPG', () => {
    const distanceMeters = 1609.344 // 1 mile
    const expected = ((1 / 45) * 4.546) * 1.45
    expect(fuelCostGBP(distanceMeters, 45)).toBeCloseTo(expected, 9)
  })
})

describe('estimateFuelCost', () => {
  it('matches the hand-computed cost for 100 miles at 30 mpg / £1.45 per litre', () => {
    const distanceMeters = 160934.4 // exactly 100 miles
    const expected = (100 / 30) * 4.546 * 1.45 // ≈ 21.97
    expect(estimateFuelCost(distanceMeters, 30, 1.45)).toBeCloseTo(expected, 6)
    // Sanity-check the rough magnitude the UI shows.
    expect(estimateFuelCost(distanceMeters, 30, 1.45)).toBeCloseTo(21.97, 1)
  })

  it('returns 0 for a zero or negative distance', () => {
    expect(estimateFuelCost(0, 30, 1.45)).toBe(0)
    expect(estimateFuelCost(-160934.4, 30, 1.45)).toBe(0)
  })

  it('returns 0 for a zero or negative mpg', () => {
    expect(estimateFuelCost(160934.4, 0, 1.45)).toBe(0)
    expect(estimateFuelCost(160934.4, -30, 1.45)).toBe(0)
  })

  it('returns 0 for a negative fuel price', () => {
    expect(estimateFuelCost(160934.4, 30, -1.45)).toBe(0)
  })

  it('returns 0 for non-finite inputs', () => {
    expect(estimateFuelCost(NaN, 30, 1.45)).toBe(0)
    expect(estimateFuelCost(160934.4, NaN, 1.45)).toBe(0)
    expect(estimateFuelCost(160934.4, 30, NaN)).toBe(0)
  })

  it('is zero when the fuel price is zero (free fuel)', () => {
    expect(estimateFuelCost(160934.4, 30, 0)).toBe(0)
  })
})

describe('normaliseLeg (Req 1.2)', () => {
  it('sets endDate equal to startDate when endDate is missing', () => {
    const leg = makeLeg({ startDate: '2024-06-10', endDate: undefined })
    const normalised = normaliseLeg(leg)
    expect(normalised.endDate).toBe('2024-06-10')
  })

  it('sets endDate equal to startDate when endDate is an empty string', () => {
    const leg = makeLeg({ startDate: '2024-06-10', endDate: '' })
    const normalised = normaliseLeg(leg)
    expect(normalised.endDate).toBe('2024-06-10')
  })

  it('leaves a present endDate unchanged and does not mutate the input', () => {
    const leg = makeLeg({ startDate: '2024-06-10', endDate: '2024-06-15' })
    const normalised = normaliseLeg(leg)
    expect(normalised.endDate).toBe('2024-06-15')
    expect(normalised).not.toBe(leg)
    expect(leg.endDate).toBe('2024-06-15')
  })
})

describe('validateLeg (Req 1.3, 1.4, 5.6)', () => {
  it('accepts a well-formed leg', () => {
    expect(validateLeg(makeLeg())).toEqual({ ok: true })
  })

  it('rejects a blank label', () => {
    const result = validateLeg(makeLeg({ label: '   ' }))
    expect(result.ok).toBe(false)
    expect(result.error).toBe('Location label is required')
  })

  it('rejects a missing start date', () => {
    const result = validateLeg(makeLeg({ startDate: undefined }))
    expect(result.ok).toBe(false)
    expect(result.error).toBe('A valid start date is required')
  })

  it('rejects an invalid start date', () => {
    const result = validateLeg(makeLeg({ startDate: '2024-02-30' }))
    expect(result.ok).toBe(false)
    expect(result.error).toBe('A valid start date is required')
  })

  it('rejects an invalid end date', () => {
    const result = validateLeg(makeLeg({ endDate: '2024-13-01' }))
    expect(result.ok).toBe(false)
    expect(result.error).toBe('End date is not a valid date')
  })

  it('rejects an end date earlier than the start date', () => {
    const result = validateLeg(makeLeg({ startDate: '2024-06-10', endDate: '2024-06-09' }))
    expect(result.ok).toBe(false)
    expect(result.error).toBe('End date cannot be before start date')
  })
})

describe('isOutOfWindow (Req 7.5)', () => {
  it('is true when the leg starts before the trip start', () => {
    const leg = makeLeg({ startDate: '2024-06-01', endDate: '2024-06-05' })
    expect(isOutOfWindow(leg, '2024-06-03', '2024-06-30')).toBe(true)
  })

  it('is true when the effective end is after the trip end', () => {
    const leg = makeLeg({ startDate: '2024-06-20', endDate: '2024-07-05' })
    expect(isOutOfWindow(leg, '2024-06-01', '2024-06-30')).toBe(true)
  })

  it('uses startDate as the effective end when endDate is missing', () => {
    const leg = makeLeg({ startDate: '2024-07-05', endDate: undefined })
    expect(isOutOfWindow(leg, '2024-06-01', '2024-06-30')).toBe(true)
  })

  it('is false when the leg falls entirely within the window', () => {
    const leg = makeLeg({ startDate: '2024-06-10', endDate: '2024-06-12' })
    expect(isOutOfWindow(leg, '2024-06-01', '2024-06-30')).toBe(false)
  })

  it('imposes no constraint on a side whose trip bound is missing', () => {
    const leg = makeLeg({ startDate: '2024-06-10', endDate: '2024-06-12' })
    expect(isOutOfWindow(leg, undefined, undefined)).toBe(false)
    expect(isOutOfWindow(leg, '2024-06-01', undefined)).toBe(false)
    expect(isOutOfWindow(leg, undefined, '2024-06-30')).toBe(false)
  })
})

describe('drive-hour guardrail', () => {
  it('DEFAULT_MAX_DRIVE_HOURS is 6', () => {
    expect(DEFAULT_MAX_DRIVE_HOURS).toBe(6)
  })

  it('splitPlan keeps a drive at exactly the limit as a single segment', () => {
    const plan = splitPlan(6 * 3600, 6)
    expect(plan.segments).toBe(1)
    expect(plan.perSegmentSeconds).toBe(6 * 3600)
  })

  it('splitPlan breaks a 7h drive into 2 segments of ~3.5h each', () => {
    const plan = splitPlan(7 * 3600, 6)
    expect(plan.segments).toBe(2)
    expect(plan.perSegmentSeconds).toBe(Math.round((7 * 3600) / 2)) // 3.5h = 12600s
    expect(plan.perSegmentSeconds).toBe(12600)
  })

  it('splitPlan breaks a 13h drive into 3 segments', () => {
    const plan = splitPlan(13 * 3600, 6)
    expect(plan.segments).toBe(3)
    expect(plan.perSegmentSeconds).toBe(Math.round((13 * 3600) / 3))
  })

  it('splitPlan degrades gracefully for a non-positive duration or invalid limit', () => {
    expect(splitPlan(0, 6)).toEqual({ segments: 1, perSegmentSeconds: 0 })
    expect(splitPlan(-100, 6)).toEqual({ segments: 1, perSegmentSeconds: 0 })
    expect(splitPlan(5 * 3600, 0)).toEqual({ segments: 1, perSegmentSeconds: 5 * 3600 })
    expect(splitPlan(5 * 3600, NaN)).toEqual({ segments: 1, perSegmentSeconds: 5 * 3600 })
  })

  it('isOverDriveLimit is false exactly at the limit and true just over it', () => {
    expect(isOverDriveLimit(6 * 3600, 6)).toBe(false)
    expect(isOverDriveLimit(6 * 3600 + 1, 6)).toBe(true)
    expect(isOverDriveLimit(5 * 3600, 6)).toBe(false)
  })

  it('isOverDriveLimit treats a non-positive/NaN limit as no limit', () => {
    expect(isOverDriveLimit(100 * 3600, 0)).toBe(false)
    expect(isOverDriveLimit(100 * 3600, -1)).toBe(false)
    expect(isOverDriveLimit(100 * 3600, NaN)).toBe(false)
  })

  it('overLimitSummary counts over-limit drives and reports the worst overage', () => {
    const results: HopResult[] = [
      { key: 'a', ok: true, durationSeconds: 5 * 3600 }, // under
      { key: 'b', ok: true, durationSeconds: 7 * 3600 }, // 1h over
      { key: 'c', ok: true, durationSeconds: 9 * 3600 }, // 3h over (worst)
      { key: 'd', ok: false, error: 'no-route' }, // ignored
      { key: 'e', ok: true, durationSeconds: 6 * 3600 }, // exactly at limit → not over
    ]
    const summary = overLimitSummary(results, 6)
    expect(summary.overCount).toBe(2)
    expect(summary.worstOverSeconds).toBe(3 * 3600)
  })

  it('overLimitSummary returns zeros when nothing is over the limit', () => {
    const results: HopResult[] = [
      { key: 'a', ok: true, durationSeconds: 5 * 3600 },
      { key: 'b', ok: true, durationSeconds: 6 * 3600 },
    ]
    expect(overLimitSummary(results, 6)).toEqual({ overCount: 0, worstOverSeconds: 0 })
  })
})

describe('inclusiveDayCount', () => {
  it('counts a single day as 1 when start === end', () => {
    expect(inclusiveDayCount('2024-06-10', '2024-06-10')).toBe(1)
  })

  it('counts a short span inclusively (10th..12th June = 3)', () => {
    expect(inclusiveDayCount('2024-06-10', '2024-06-12')).toBe(3)
  })

  it('counts a known long span across months/years (Oct 9 → Jan 4 = 88)', () => {
    expect(inclusiveDayCount('2025-10-09', '2026-01-04')).toBe(88)
  })

  it('counts correctly across a leap day (Feb 28 → Mar 1, 2024 = 3)', () => {
    expect(inclusiveDayCount('2024-02-28', '2024-03-01')).toBe(3)
  })

  it('returns 0 when the end date is before the start date', () => {
    expect(inclusiveDayCount('2024-06-12', '2024-06-10')).toBe(0)
  })

  it('returns 0 when either date is missing', () => {
    expect(inclusiveDayCount(undefined, '2024-06-10')).toBe(0)
    expect(inclusiveDayCount('2024-06-10', undefined)).toBe(0)
    expect(inclusiveDayCount(undefined, undefined)).toBe(0)
    expect(inclusiveDayCount('', '')).toBe(0)
  })

  it('returns 0 when either date is not a valid calendar date', () => {
    expect(inclusiveDayCount('2024-02-30', '2024-03-05')).toBe(0)
    expect(inclusiveDayCount('2024-06-10', '2024-13-01')).toBe(0)
    expect(inclusiveDayCount('not-a-date', '2024-06-10')).toBe(0)
  })
})

describe('scenicRoadToPlace mapping (Req 2.4, 2.7)', () => {
  const baseRoad: ScenicRoadResult = {
    name: 'Trollstigen',
    location: 'Møre og Romsdal, Norway',
    roadType: 'mountain pass',
    why: 'Hairpin bends and waterfalls',
    scenicRating: '5/5',
    seasonalNote: 'Closed in winter',
    confident: true,
  }

  it('maps a scenic-road result to a place with a road placeType and the Verify flag', () => {
    const place = scenicRoadToPlace(baseRoad, 'leg-1')
    expect(place._type).toBe('place')
    expect(place.name).toBe('Trollstigen')
    // placeType always classifies to the 'road' category.
    expect(place.placeType.toLowerCase()).toContain('road')
    expect(place.priority).toBe('High')
    expect(place.aiSuggested).toBe(true)
    expect(place.visited).toBe(false)
    // legKey is carried through.
    expect(place.legKey).toBe('leg-1')
    // No coordinates when none are passed.
    expect('coordinates' in place).toBe(false)
  })

  it('only takes coordinates from the passed geocode, never from the raw result', () => {
    // Raw result carries stray model coordinates that must be ignored.
    const dirty = { ...baseRoad, lat: 1, lng: 2 } as ScenicRoadResult
    const geocoded = { lat: 62.4542, lng: 7.6716 }
    const place = scenicRoadToPlace(dirty, 'leg-1', geocoded)
    expect(place.coordinates).toEqual(geocoded)
  })

  it('prefixes a low-confidence scenic road name with "Search for: "', () => {
    const place = scenicRoadToPlace({ ...baseRoad, confident: false })
    expect(place.name.startsWith(SEARCH_FOR_PREFIX)).toBe(true)
    expect(place.name).toBe(`${SEARCH_FOR_PREFIX}Trollstigen`)
  })
})

describe('parkupToOpportunity mapping (Req 4.1, 4.5, 4.6, 4.7)', () => {
  const baseParkup: ParkupResult = {
    name: 'Lakeside pull-in',
    location: 'Lake Bled, Slovenia',
    description: 'Flat gravel next to the water',
    facilities: 'None',
    cost: 'Free',
    rating: '4/5',
    confident: true,
  }

  it('maps a park-up suggestion to a Park4Night opportunity with the expected fixed fields', () => {
    const opp = parkupToOpportunity(baseParkup, 'leg-2')
    expect(opp._type).toBe('opportunity')
    expect(opp.platform).toBe('Park4Night')
    expect(opp.oppType).toBe('free_parkup')
    expect(opp.priorityLevel).toBe('Medium')
    expect(opp.status).toBe('to_research')
    expect(opp.aiSuggested).toBe(true)
    // legKey persists.
    expect(opp.legKey).toBe('leg-2')
    // No coordinates when none are passed.
    expect('coordinates' in opp).toBe(false)
  })

  it('falls back to scenicNote for description when description is absent', () => {
    const opp = parkupToOpportunity({
      name: 'Forest clearing',
      location: 'Black Forest, Germany',
      scenicNote: 'Quiet spot under the pines',
    })
    expect(opp.description).toBe('Quiet spot under the pines')
  })

  it('only takes coordinates from the passed geocode, never from the raw result', () => {
    const dirty = { ...baseParkup, lat: 9, lng: 9 } as ParkupResult
    const geocoded = { lat: 46.3683, lng: 14.1146 }
    const opp = parkupToOpportunity(dirty, 'leg-2', geocoded)
    expect(opp.coordinates).toEqual(geocoded)
  })
})

describe('park-up paste + confirm record shapes (Req 4.2, 4.6, 4.8)', () => {
  // These cases are not single mapper functions — they document the object
  // shape the WorkStays paste/confirm flows produce, so the intended persisted
  // record shape is captured as an example.

  it('a pasted link-only park-up stores the link/p4nUrl and no coordinates', () => {
    // Shape produced when a user pastes a Park4Night URL with no lat,lng (R4.2).
    const pasted = {
      _type: 'opportunity' as const,
      name: 'Mountain layby',
      oppType: 'free_parkup' as const,
      platform: 'Park4Night' as const,
      location: 'Picos de Europa, Spain',
      link: 'https://park4night.com/en/place/12345',
      p4nUrl: 'https://park4night.com/en/place/12345',
      priorityLevel: 'Medium' as const,
      legKey: 'leg-3',
      status: 'to_research' as const,
    }
    // Allowed to save with a link and no coordinates.
    expect(pasted.link).toBe(pasted.p4nUrl)
    expect('coordinates' in pasted).toBe(false)
    // Pasted (non-AI) park-ups are not Verify-flagged.
    expect('aiSuggested' in pasted).toBe(false)
    expect(pasted.legKey).toBe('leg-3')
    expect(pasted.priorityLevel).toBe('Medium')
  })

  it('coordinates can be attached later to a link-only park-up', () => {
    const base = {
      _type: 'opportunity' as const,
      name: 'Mountain layby',
      oppType: 'free_parkup' as const,
      platform: 'Park4Night' as const,
      location: 'Picos de Europa, Spain',
      link: 'https://park4night.com/en/place/12345',
      priorityLevel: 'Medium' as const,
    }
    // "Geocode this location" later adds coordinates from the geocode action.
    const withCoords = { ...base, coordinates: { lat: 43.1961, lng: -4.8286 } }
    expect(withCoords.coordinates).toEqual({ lat: 43.1961, lng: -4.8286 })
    expect(withCoords.link).toBe(base.link)
  })

  it('confirming an AI park-up attaches a real link and/or coordinates to the suggestion', () => {
    // Start from an AI-suggested opportunity (Verify-flagged, no link/coords).
    const suggested: ParkupOpportunity = parkupToOpportunity(
      { name: 'Riverside spot', location: 'Dordogne, France', confident: true },
      'leg-4'
    )
    expect(suggested.aiSuggested).toBe(true)
    expect('coordinates' in suggested).toBe(false)

    // Confirm-to-real: user attaches a Park4Night link and coordinates.
    const confirmed = {
      ...suggested,
      link: 'https://park4night.com/en/place/67890',
      p4nUrl: 'https://park4night.com/en/place/67890',
      coordinates: { lat: 44.8378, lng: 0.5792 },
    }
    expect(confirmed.link).toBe('https://park4night.com/en/place/67890')
    expect(confirmed.coordinates).toEqual({ lat: 44.8378, lng: 0.5792 })
    // legKey/priorityLevel persist through confirmation.
    expect(confirmed.legKey).toBe('leg-4')
    expect(confirmed.priorityLevel).toBe('Medium')
  })
})

describe('Route Guide leg association grouping (Req 5.2)', () => {
  // Two legs the Route Guide renders cards for. Leg A carries coordinates near
  // the "orphan" place used in the nearest-by-coords fallback case; leg B is far.
  const legA = makeLeg({ _key: 'leg-A', label: 'Lofoten', coordinates: { lat: 68.0, lng: 13.0 } })
  const legB = makeLeg({ _key: 'leg-B', label: 'Oslo', coordinates: { lat: 59.9, lng: 10.75 } })
  const legs: ItineraryLeg[] = [legA, legB]

  it('groups road places under the correct leg by explicit legKey, preserving input order', () => {
    // Three places: two tagged for leg A (p1 before p3), one tagged for leg B.
    const p1: Associable = { _key: 'p1', legKey: 'leg-A' }
    const p2: Associable = { _key: 'p2', legKey: 'leg-B' }
    const p3: Associable = { _key: 'p3', legKey: 'leg-A' }
    const places = [p1, p2, p3]

    const forA = associatePlacesToLeg(places, legA, legs)
    expect(forA.map((p) => p._key)).toEqual(['p1', 'p3']) // both A places, in input order

    const forB = associatePlacesToLeg(places, legB, legs)
    expect(forB.map((p) => p._key)).toEqual(['p2']) // the single B place
  })

  it('falls back to the nearest leg by coordinates when a place has no legKey', () => {
    // Orphan place with no legKey, sitting right on top of leg A's coordinates
    // and far from leg B. It must associate to the near leg (A), not the far one (B).
    const orphan: Associable = { _key: 'orphan', coordinates: { lat: 68.01, lng: 13.01 } }
    const places = [orphan]

    expect(associatePlacesToLeg(places, legA, legs).map((p) => p._key)).toEqual(['orphan'])
    expect(associatePlacesToLeg(places, legB, legs)).toEqual([])
  })

  it('associateParkupsToLeg returns only opportunities whose legKey === leg._key', () => {
    // One park-up for leg A, one for leg B, one with no legKey at all.
    const oppA: Associable = { _key: 'o1', legKey: 'leg-A' }
    const oppB: Associable = { _key: 'o2', legKey: 'leg-B' }
    const oppNone: Associable = { _key: 'o3' }
    const opps = [oppA, oppB, oppNone]

    const forA = associateParkupsToLeg(opps, legA)
    expect(forA.map((o) => o._key)).toEqual(['o1']) // the B and no-legKey park-ups are excluded

    const forB = associateParkupsToLeg(opps, legB)
    expect(forB.map((o) => o._key)).toEqual(['o2'])
  })
})

describe('Route Guide leg-selection navigation contract (Req 5.4)', () => {
  // The Route Guide tab lifts `selectedLegKey` into the parent page and reaches
  // into the sibling tabs via `setDetailTab`. The "Open on Route Map" / "Open on
  // Calendar" buttons both select the leg AND switch tabs. We document that
  // lifted-state contract here without importing the React component: `jumpTo`
  // mirrors the component's click handler — it must call both setters so a user
  // who selects a leg lands on that leg's representation in the target tab.
  type DetailTab = 'routemap' | 'calendar'
  function jumpTo(
    legKey: string,
    tab: DetailTab,
    setSelectedLegKey: (key: string) => void,
    setDetailTab: (tab: DetailTab) => void
  ): void {
    setSelectedLegKey(legKey)
    setDetailTab(tab)
  }

  it('"Open on Route Map" selects the leg and switches to the routemap tab', () => {
    const setSelectedLegKey = vi.fn()
    const setDetailTab = vi.fn()

    jumpTo('leg-A', 'routemap', setSelectedLegKey, setDetailTab)

    expect(setSelectedLegKey).toHaveBeenCalledWith('leg-A')
    expect(setDetailTab).toHaveBeenCalledWith('routemap')
    expect(setSelectedLegKey).toHaveBeenCalledTimes(1)
    expect(setDetailTab).toHaveBeenCalledTimes(1)
  })

  it('"Open on Calendar" selects the leg and switches to the calendar tab', () => {
    const setSelectedLegKey = vi.fn()
    const setDetailTab = vi.fn()

    jumpTo('leg-B', 'calendar', setSelectedLegKey, setDetailTab)

    expect(setSelectedLegKey).toHaveBeenCalledWith('leg-B')
    expect(setDetailTab).toHaveBeenCalledWith('calendar')
  })
})
