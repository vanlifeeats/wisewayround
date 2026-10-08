// Pure helper module for the Trip Diary feature.
// React-free — importable from both the client page and test files.

// ── Types ────────────────────────────────────────────────────────────

export interface DiaryPhoto {
  _type: 'diaryPhoto'
  _key: string
  asset: { _type: 'reference'; _ref: string }
  url?: string
  caption?: string
  isHero?: boolean
}

export interface DiscoveryLog {
  placeName?: string
  placeType?: string
  location?: string
  recommendation?: 'yes' | 'no' | 'mixed'
  practicalTips?: string
  externalLink?: string
}

export interface DiaryEntry {
  _type: 'diaryEntry'
  _key: string
  date: string
  locationLabel?: string
  legKey?: string
  placeKey?: string
  narrative?: string
  weatherTemp?: number
  weatherConditions?: string
  rating?: number
  highlights?: string
  lowlights?: string
  tags?: string[]
  mood?: string
  costSummary?: string
  coordinates?: { _type: 'geopoint'; lat: number; lng: number }
  shareable: boolean
  aboutPlace?: boolean
  photos?: DiaryPhoto[]
  discovery?: DiscoveryLog
}

export interface PlaceFields {
  name: string
  placeType: string
  location: string
  coordinates?: { _type: 'geopoint'; lat: number; lng: number }
  why: string
  priority: string
  visited: boolean
}

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Filter + sort diary entries, preserving each entry's ORIGINAL array index
 * so callers can target the correct slot with updateItem/removeItem.
 *
 * - tagFilter (R5.7): non-empty string → keep entries whose tags include it.
 * - fromDate/toDate (R5.8): inclusive date range on 'YYYY-MM-DD' strings.
 * - Both filters applied as intersection (R5.10).
 * - sortNewestFirst (R5.3): true → descending, false → ascending. Stable.
 */
export function filterAndSortDiary(
  entries: DiaryEntry[],
  opts: {
    tagFilter?: string | null
    fromDate?: string
    toDate?: string
    sortNewestFirst?: boolean
  }
): { entry: DiaryEntry; idx: number }[] {
  const { tagFilter, fromDate, toDate, sortNewestFirst = true } = opts
  let items = entries.map((entry, idx) => ({ entry, idx }))

  if (tagFilter && tagFilter.trim()) {
    const t = tagFilter.trim()
    items = items.filter(({ entry }) => Array.isArray(entry.tags) && entry.tags.includes(t))
  }
  if (fromDate && fromDate.trim()) {
    const f = fromDate.trim()
    items = items.filter(({ entry }) => (entry.date || '') >= f)
  }
  if (toDate && toDate.trim()) {
    const t = toDate.trim()
    items = items.filter(({ entry }) => (entry.date || '') <= t)
  }

  // Stable sort by date (preserve relative order of equal dates).
  items.sort((a, b) => {
    const cmp = (a.entry.date || '').localeCompare(b.entry.date || '')
    if (cmp !== 0) return sortNewestFirst ? -cmp : cmp
    return a.idx - b.idx // stable tie-break
  })

  return items
}

/** The hero photo (isHero), else the first photo, else undefined (R5.4). */
export function heroPhoto(entry: DiaryEntry): DiaryPhoto | undefined {
  const photos = entry.photos
  if (!Array.isArray(photos) || photos.length === 0) return undefined
  return photos.find((p) => p.isHero) || photos[0]
}

/** Set exactly one hero photo by _key (R3.4, R3.5). */
export function setHero(photos: DiaryPhoto[], key: string): DiaryPhoto[] {
  return photos.map((p) => ({ ...p, isHero: p._key === key }))
}

/** Remove a photo by _key, preserving order of the rest (R3.6, R3.7). */
export function removePhoto(photos: DiaryPhoto[], key: string): DiaryPhoto[] {
  return photos.filter((p) => p._key !== key)
}

/** Clamp a rating to 1–5 integer; return prev if invalid (R2.8). */
export function clampRating(next: unknown, prev?: number): number | undefined {
  const n = Number(next)
  if (!Number.isInteger(n) || n < 1 || n > 5) return prev
  return n
}

/** Map a discovery log + entry coordinates into place fields (R4.6). */
export function placeFromDiscovery(entry: DiaryEntry): PlaceFields {
  const d = entry.discovery || {}
  return {
    name: d.placeName || '',
    placeType: d.placeType || '',
    location: d.location || '',
    coordinates: entry.coordinates,
    why: d.practicalTips || '',
    priority: 'High',
    visited: true,
  }
}
