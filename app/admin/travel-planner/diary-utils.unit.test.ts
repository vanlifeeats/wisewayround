// Example-based unit tests for the Trip Diary pure helpers.

import { describe, it, expect } from 'vitest'
import {
  filterAndSortDiary,
  heroPhoto,
  setHero,
  removePhoto,
  clampRating,
  placeFromDiscovery,
  type DiaryEntry,
  type DiaryPhoto,
} from './diary-utils'

const entry = (over: Partial<DiaryEntry> = {}): DiaryEntry => ({
  _type: 'diaryEntry',
  _key: Math.random().toString(36).slice(2),
  date: '2025-10-10',
  shareable: false,
  ...over,
})

const photo = (over: Partial<DiaryPhoto> = {}): DiaryPhoto => ({
  _type: 'diaryPhoto',
  _key: Math.random().toString(36).slice(2),
  asset: { _type: 'reference', _ref: 'image-abc' },
  ...over,
})

describe('filterAndSortDiary', () => {
  const e1 = entry({ _key: 'a', date: '2025-10-09', tags: ['food', 'scenic'] })
  const e2 = entry({ _key: 'b', date: '2025-10-12', tags: ['driving'] })
  const e3 = entry({ _key: 'c', date: '2025-10-15', tags: ['food'] })
  const all = [e1, e2, e3]

  it('returns all entries when no filters, preserving original indices', () => {
    const out = filterAndSortDiary(all, { sortNewestFirst: false })
    expect(out.map((x) => x.entry._key)).toEqual(['a', 'b', 'c'])
    expect(out.map((x) => x.idx)).toEqual([0, 1, 2])
  })

  it('tag filter returns only entries containing the tag (R5.7)', () => {
    const out = filterAndSortDiary(all, { tagFilter: 'food', sortNewestFirst: false })
    expect(out.map((x) => x.entry._key)).toEqual(['a', 'c'])
    // Original indices preserved for correct updateItem targeting.
    expect(out.map((x) => x.idx)).toEqual([0, 2])
  })

  it('null/empty tag filter returns all', () => {
    expect(filterAndSortDiary(all, { tagFilter: null }).length).toBe(3)
    expect(filterAndSortDiary(all, { tagFilter: '' }).length).toBe(3)
  })

  it('date-range filter is inclusive on both boundaries (R5.8)', () => {
    const out = filterAndSortDiary(all, { fromDate: '2025-10-09', toDate: '2025-10-12', sortNewestFirst: false })
    expect(out.map((x) => x.entry._key)).toEqual(['a', 'b']) // boundary dates included
  })

  it('applies tag and date filters as an intersection (R5.10)', () => {
    const out = filterAndSortDiary(all, { tagFilter: 'food', fromDate: '2025-10-13', toDate: '2025-10-31' })
    expect(out.map((x) => x.entry._key)).toEqual(['c']) // only e3 is food AND in range
  })

  it('sorts newest-first and oldest-first (R5.3)', () => {
    expect(filterAndSortDiary(all, { sortNewestFirst: true }).map((x) => x.entry._key)).toEqual(['c', 'b', 'a'])
    expect(filterAndSortDiary(all, { sortNewestFirst: false }).map((x) => x.entry._key)).toEqual(['a', 'b', 'c'])
  })

  it('is a stable sort for equal dates', () => {
    const d1 = entry({ _key: 'x', date: '2025-11-01' })
    const d2 = entry({ _key: 'y', date: '2025-11-01' })
    const out = filterAndSortDiary([d1, d2], { sortNewestFirst: true })
    expect(out.map((x) => x.entry._key)).toEqual(['x', 'y'])
  })
})

describe('clampRating (R2.8)', () => {
  it('accepts integers 1–5', () => {
    for (const n of [1, 2, 3, 4, 5]) expect(clampRating(n, 2)).toBe(n)
  })
  it('rejects out-of-range, non-integer, NaN, strings → returns prev', () => {
    expect(clampRating(0, 3)).toBe(3)
    expect(clampRating(6, 3)).toBe(3)
    expect(clampRating(3.5, 3)).toBe(3)
    expect(clampRating(NaN, 3)).toBe(3)
    expect(clampRating('x', 3)).toBe(3)
    expect(clampRating(undefined, undefined)).toBeUndefined()
  })
})

describe('setHero (R3.4, R3.5)', () => {
  it('sets exactly one hero and clears the previous', () => {
    const photos = [photo({ _key: 'p1', isHero: true }), photo({ _key: 'p2' }), photo({ _key: 'p3' })]
    const out = setHero(photos, 'p2')
    expect(out.filter((p) => p.isHero).map((p) => p._key)).toEqual(['p2'])
    expect(out.find((p) => p._key === 'p1')!.isHero).toBe(false)
  })
})

describe('removePhoto (R3.6, R3.7)', () => {
  it('drops the target photo and keeps the rest in order', () => {
    const photos = [photo({ _key: 'p1' }), photo({ _key: 'p2' }), photo({ _key: 'p3' })]
    expect(removePhoto(photos, 'p2').map((p) => p._key)).toEqual(['p1', 'p3'])
  })
  it('removing the hero leaves no hero set', () => {
    const photos = [photo({ _key: 'p1', isHero: true }), photo({ _key: 'p2' })]
    const out = removePhoto(photos, 'p1')
    expect(out.some((p) => p.isHero)).toBe(false)
  })
})

describe('heroPhoto', () => {
  it('returns the flagged hero', () => {
    const e = entry({ photos: [photo({ _key: 'p1' }), photo({ _key: 'p2', isHero: true })] })
    expect(heroPhoto(e)!._key).toBe('p2')
  })
  it('falls back to the first photo when none flagged', () => {
    const e = entry({ photos: [photo({ _key: 'p1' }), photo({ _key: 'p2' })] })
    expect(heroPhoto(e)!._key).toBe('p1')
  })
  it('returns undefined when there are no photos', () => {
    expect(heroPhoto(entry())).toBeUndefined()
    expect(heroPhoto(entry({ photos: [] }))).toBeUndefined()
  })
})

describe('placeFromDiscovery (R4.6)', () => {
  it('maps discovery fields and the entry coordinate into place fields', () => {
    const e = entry({
      coordinates: { _type: 'geopoint', lat: 51.2, lng: 3.2 },
      discovery: { placeName: 'Great Cafe', placeType: 'restaurant', location: 'Bruges', practicalTips: 'Open 9–5' },
    })
    const pf = placeFromDiscovery(e)
    expect(pf.name).toBe('Great Cafe')
    expect(pf.placeType).toBe('restaurant')
    expect(pf.location).toBe('Bruges')
    expect(pf.coordinates).toEqual({ _type: 'geopoint', lat: 51.2, lng: 3.2 })
    expect(pf.why).toBe('Open 9–5')
    expect(pf.priority).toBe('High')
    expect(pf.visited).toBe(true)
  })
})
