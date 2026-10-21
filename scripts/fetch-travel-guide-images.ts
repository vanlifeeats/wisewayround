// One-off (re-runnable) tool to populate Travel Guides hero images from the Unsplash API.
//
// Usage: node scripts/fetch-travel-guide-images.ts   (run from the repo root)
//
// For each of the 37 entries below it searches Unsplash for a destination-relevant photo,
// pings the photo's download_location endpoint once (Unsplash's required usage trigger),
// and writes heroImage/heroImageAlt/heroImageCredit either directly into the matching
// lib/travel-guides/<slug>.ts file (33 leaf destinations) or into the generated
// lib/travel-guides/hub-hero-images.ts lookup (the 3 hubs + the top-level index).
//
// Reads UNSPLASH_ACCESS_KEY from .env.local itself (no dotenv dependency) and never logs
// its value. Requires outbound network access to api.unsplash.com.

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const REPO_ROOT = join(import.meta.dirname, '..')
const TRAVEL_GUIDES_DIR = join(REPO_ROOT, 'lib', 'travel-guides')

interface LeafEntry {
  kind: 'leaf'
  slug: string
  name: string
  tagline: string
  query: string
  /** Tried only if `query` returns zero results. */
  fallbackQuery?: string
}

interface HubEntry {
  kind: 'hub'
  key: 'italy' | 'usa' | 'turkey' | 'travel-guides-index'
  name: string
  tagline: string
  query: string
  fallbackQuery?: string
}

type Entry = LeafEntry | HubEntry

// 33 leaf destinations. `tagline` is each file's own existing tagline/one-line description,
// used only as grounding for writing a human heroImageAlt below -- never sent to Unsplash and
// never copied verbatim from Unsplash's own description field.
const LEAF_ENTRIES: LeafEntry[] = [
  { kind: 'leaf', slug: 'canada', name: 'Canada', tagline: 'Montreal', query: 'Montreal Canada travel' },
  { kind: 'leaf', slug: 'denmark', name: 'Denmark', tagline: 'Copenhagen', query: 'Copenhagen Denmark travel' },
  { kind: 'leaf', slug: 'france', name: 'France', tagline: 'Paris', query: 'Paris France Eiffel Tower' },
  { kind: 'leaf', slug: 'germany', name: 'Germany', tagline: 'Berlin', query: 'Berlin Germany travel' },
  { kind: 'leaf', slug: 'greece', name: 'Greece', tagline: 'Athens', query: 'Athens Acropolis Greece' },
  { kind: 'leaf', slug: 'japan', name: 'Japan', tagline: 'Tokyo', query: 'Tokyo Japan travel' },
  { kind: 'leaf', slug: 'portugal', name: 'Portugal', tagline: 'Lisbon', query: 'Lisbon Portugal travel' },
  { kind: 'leaf', slug: 'puerto-rico', name: 'Puerto Rico', tagline: 'Vieques', query: 'Vieques Puerto Rico beach' },
  { kind: 'leaf', slug: 'spain', name: 'Spain', tagline: 'Barcelona', query: 'Barcelona Spain travel' },
  { kind: 'leaf', slug: 'thailand', name: 'Thailand', tagline: 'Bangkok', query: 'Bangkok Thailand travel' },
  { kind: 'leaf', slug: 'united-kingdom', name: 'United Kingdom', tagline: 'London', query: 'London England travel' },
  { kind: 'leaf', slug: 'italy-turin', name: 'Turin', tagline: "Piedmont's capital", query: 'Turin Italy travel' },
  { kind: 'leaf', slug: 'italy-milan-and-the-lakes', name: 'Milan and the Lakes', tagline: 'Lake Como', query: 'Lake Como Italy' },
  { kind: 'leaf', slug: 'italy-venice', name: 'Venice', tagline: 'the lagoon city', query: 'Venice Italy canals' },
  { kind: 'leaf', slug: 'italy-emilia-romagna', name: 'Emilia-Romagna', tagline: 'Bologna, Modena and Parma', query: 'Bologna Italy travel' },
  { kind: 'leaf', slug: 'italy-florence-and-tuscany', name: 'Florence and Tuscany', tagline: 'Florence, with the Sienese countryside', query: 'Florence Tuscany Italy' },
  { kind: 'leaf', slug: 'italy-umbria', name: 'Umbria', tagline: 'Perugia, Todi and the hill towns', query: 'Umbria Italy hill town', fallbackQuery: 'Assisi Umbria Italy' },
  { kind: 'leaf', slug: 'italy-rome', name: 'Rome', tagline: 'the capital, neighbourhood by neighbourhood', query: 'Rome Italy Colosseum' },
  { kind: 'leaf', slug: 'italy-campania-and-the-bay-of-naples', name: 'Campania and the Bay of Naples', tagline: 'Naples, the Amalfi Coast and Procida', query: 'Amalfi Coast Naples Italy' },
  { kind: 'leaf', slug: 'italy-puglia', name: 'Puglia', tagline: 'Bari, the Itria Valley and Salento', query: 'Puglia Italy travel' },
  { kind: 'leaf', slug: 'italy-sicily', name: 'Sicily', tagline: 'Palermo, Ortigia and the south-east', query: 'Palermo Sicily Italy' },
  { kind: 'leaf', slug: 'italy-sardinia', name: 'Sardinia', tagline: 'Cagliari and the south of the island', query: 'Cagliari Sardinia Italy' },
  { kind: 'leaf', slug: 'italy-lakes-and-beaches', name: 'Lakes and Beaches', tagline: 'day-trip lakes near Rome and ten beaches', query: 'Italian lake landscape' },
  { kind: 'leaf', slug: 'usa-new-york-city', name: 'New York City', tagline: 'Manhattan, Brooklyn, Queens', query: 'New York City skyline' },
  { kind: 'leaf', slug: 'usa-new-haven', name: 'New Haven', tagline: 'Yale and the Green', query: 'New Haven Yale Connecticut' },
  { kind: 'leaf', slug: 'usa-new-orleans', name: 'New Orleans', tagline: 'a food-focused visit', query: 'New Orleans French Quarter' },
  { kind: 'leaf', slug: 'usa-miami-and-miami-beach', name: 'Miami and Miami Beach', tagline: 'mainland dining and a beach outing', query: 'Miami Beach Florida' },
  { kind: 'leaf', slug: 'usa-austin', name: 'Austin', tagline: 'pizza, barbecue and Mexican food', query: 'Austin Texas skyline' },
  { kind: 'leaf', slug: 'usa-los-angeles', name: 'Los Angeles', tagline: 'well beyond downtown', query: 'Los Angeles California travel' },
  { kind: 'leaf', slug: 'usa-philadelphia', name: 'Philadelphia', tagline: 'from a sandwich shop to supper-club dining', query: 'Philadelphia skyline' },
  { kind: 'leaf', slug: 'usa-pittsburgh', name: 'Pittsburgh', tagline: 'across different neighbourhoods', query: 'Pittsburgh skyline' },
  { kind: 'leaf', slug: 'turkey-istanbul', name: 'Istanbul', tagline: 'both sides of the Bosphorus', query: 'Istanbul Turkey travel' },
  { kind: 'leaf', slug: 'turkey-gaziantep', name: 'Gaziantep', tagline: 'bazaars and the Zeugma Mosaic Museum', query: 'Gaziantep Turkey bazaar' },
]

// 3 hubs + the top-level index.
const HUB_ENTRIES: HubEntry[] = [
  { kind: 'hub', key: 'italy', name: 'Italy', tagline: 'twelve regions', query: 'Italy travel landscape' },
  { kind: 'hub', key: 'usa', name: 'USA', tagline: 'eight cities, coast to coast', query: 'USA road trip landscape' },
  { kind: 'hub', key: 'turkey', name: 'Turkey', tagline: 'Istanbul and Gaziantep', query: 'Turkey travel landscape' },
  { kind: 'hub', key: 'travel-guides-index', name: 'Travel Guides', tagline: 'pick a country to dive into our guides', query: 'world travel map adventure' },
]

const ENTRIES: Entry[] = [...LEAF_ENTRIES, ...HUB_ENTRIES]

const UTM_SUFFIX = '?utm_source=wisewayround&utm_medium=referral'
const DELAY_MS = 1500

interface FetchedPhoto {
  url: string
  photographerName: string
  profileUrl: string
  downloadLocation: string
}

interface HubHeroData {
  url: string
  alt: string
  credit: { name: string; profileUrl: string }
}

function readUnsplashAccessKey(): string {
  const envPath = join(REPO_ROOT, '.env.local')
  const raw = readFileSync(envPath, 'utf8')
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    if (key === 'UNSPLASH_ACCESS_KEY') {
      let value = trimmed.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      return value
    }
  }
  throw new Error('UNSPLASH_ACCESS_KEY not found in .env.local')
}

async function searchPhoto(query: string, accessKey: string): Promise<FetchedPhoto | null> {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${accessKey}` },
  })
  if (!res.ok) {
    throw new Error(`Unsplash search failed with status ${res.status} ${res.statusText}`)
  }
  const body = await res.json()
  const result = body?.results?.[0]
  if (!result) return null
  return {
    url: result.urls.regular,
    photographerName: result.user.name,
    profileUrl: `${result.user.links.html}${UTM_SUFFIX}`,
    downloadLocation: result.links.download_location,
  }
}

/** Tries `entry.query` first, then `entry.fallbackQuery` (if set) when the first returns no results. */
async function searchPhotoWithFallback(
  entry: Entry,
  accessKey: string,
): Promise<{ photo: FetchedPhoto | null; queryUsed: string }> {
  const photo = await searchPhoto(entry.query, accessKey)
  if (photo) return { photo, queryUsed: entry.query }
  if (entry.fallbackQuery) {
    await sleep(DELAY_MS)
    const fallbackPhoto = await searchPhoto(entry.fallbackQuery, accessKey)
    if (fallbackPhoto) return { photo: fallbackPhoto, queryUsed: entry.fallbackQuery }
  }
  return { photo: null, queryUsed: entry.query }
}

/** True if the leaf file at lib/travel-guides/<slug>.ts already has a non-empty heroImage field. */
function leafAlreadyHasHeroImage(slug: string): boolean {
  const filePath = join(TRAVEL_GUIDES_DIR, `${slug}.ts`)
  const contents = readFileSync(filePath, 'utf8')
  return /heroImage: '[^']+'/.test(contents)
}

async function pingDownloadLocation(downloadLocation: string, accessKey: string): Promise<void> {
  const res = await fetch(downloadLocation, {
    headers: { Authorization: `Client-ID ${accessKey}` },
  })
  if (!res.ok) {
    throw new Error(`Unsplash download ping failed with status ${res.status} ${res.statusText}`)
  }
}

// Human-written, destination-grounded alt text -- deliberately not derived from Unsplash's own
// description/alt_description field or from the image URL/path. Grounded in each destination's
// own name/tagline already present in its file.
function buildAltText(entry: Entry): string {
  if (entry.kind === 'leaf') {
    switch (entry.slug) {
      case 'canada': return 'A street scene in Montreal, Canada'
      case 'denmark': return 'Colourful waterfront buildings in Copenhagen, Denmark'
      case 'france': return 'The Eiffel Tower rising over the rooftops of Paris, France'
      case 'germany': return 'A city street in Berlin, Germany'
      case 'greece': return 'The Acropolis overlooking Athens, Greece'
      case 'japan': return 'A busy street scene in Tokyo, Japan'
      case 'portugal': return 'Tiled rooftops along the Tagus estuary in Lisbon, Portugal'
      case 'puerto-rico': return 'A beach on the island of Vieques, Puerto Rico'
      case 'spain': return 'A market street in Barcelona, Spain'
      case 'thailand': return 'A street scene in Bangkok, Thailand'
      case 'united-kingdom': return 'A London street scene in the United Kingdom'
      case 'italy-turin': return "Arcaded streets in Turin, Piedmont's capital"
      case 'italy-milan-and-the-lakes': return 'Lake Como, near Milan in northern Italy'
      case 'italy-venice': return 'Canals and bridges across Venice, Italy'
      case 'italy-emilia-romagna': return 'A street in Bologna, Emilia-Romagna'
      case 'italy-florence-and-tuscany': return 'The rooftops of Florence above the Tuscan countryside'
      case 'italy-umbria': return 'A hill town in the Umbrian countryside'
      case 'italy-rome': return 'Rooftops and streets in Rome, Italy'
      case 'italy-campania-and-the-bay-of-naples': return 'The Amalfi Coast overlooking the Bay of Naples'
      case 'italy-puglia': return 'The whitewashed streets of Puglia, southern Italy'
      case 'italy-sicily': return 'A street in Palermo, Sicily'
      case 'italy-sardinia': return 'The coastline near Cagliari, Sardinia'
      case 'italy-lakes-and-beaches': return 'A lake in the Italian countryside near Rome'
      case 'usa-new-york-city': return 'The Manhattan skyline in New York City'
      case 'usa-new-haven': return "Yale University's campus in New Haven, Connecticut"
      case 'usa-new-orleans': return 'A street in the French Quarter of New Orleans'
      case 'usa-miami-and-miami-beach': return 'The beachfront in Miami Beach, Florida'
      case 'usa-austin': return 'The downtown skyline of Austin, Texas'
      case 'usa-los-angeles': return 'A view across Los Angeles, California'
      case 'usa-philadelphia': return 'The city skyline of Philadelphia'
      case 'usa-pittsburgh': return 'The skyline of Pittsburgh at the meeting of its rivers'
      case 'turkey-istanbul': return 'The Bosphorus skyline of Istanbul, Turkey'
      case 'turkey-gaziantep': return 'A bazaar street in Gaziantep, Turkey'
      default: return `A photo of ${entry.name}`
    }
  }
  switch (entry.key) {
    case 'italy': return "A landscape view across one of Italy's regions"
    case 'usa': return 'An open road scene from a USA road trip'
    case 'turkey': return 'A landscape view across Turkey'
    case 'travel-guides-index': return 'A map and travel gear laid out for planning a trip'
  }
}

function insertFieldsIntoLeafFile(entry: LeafEntry, photo: FetchedPhoto): void {
  const filePath = join(TRAVEL_GUIDES_DIR, `${entry.slug}.ts`)
  const contents = readFileSync(filePath, 'utf8')
  const nameLinePattern = /^(\s*name: '[^']*',)\s*$/m
  if (!nameLinePattern.test(contents)) {
    throw new Error(`Could not find a 'name:' line to anchor on in ${filePath}`)
  }
  const alt = buildAltText(entry).replace(/'/g, "\\'")
  const safeName = photo.photographerName.replace(/'/g, "\\'")
  const insertion =
    `$1\n` +
    `  heroImage: '${photo.url}',\n` +
    `  heroImageAlt: '${alt}',\n` +
    `  heroImageCredit: { name: '${safeName}', profileUrl: '${photo.profileUrl}' },`
  const updated = contents.replace(nameLinePattern, insertion)
  writeFileSync(filePath, updated)
}

function writeHubHeroImagesFile(hubData: Record<HubEntry['key'], HubHeroData>): void {
  const filePath = join(TRAVEL_GUIDES_DIR, 'hub-hero-images.ts')
  const entries = (Object.keys(hubData) as HubEntry['key'][])
    .map((key) => {
      const d = hubData[key]
      const safeName = d.credit.name.replace(/'/g, "\\'")
      const safeAlt = d.alt.replace(/'/g, "\\'")
      return `  '${key}': {\n    url: '${d.url}',\n    alt: '${safeAlt}',\n    credit: { name: '${safeName}', profileUrl: '${d.credit.profileUrl}' },\n  },`
    })
    .join('\n')
  const contents =
    `// Generated by scripts/fetch-travel-guide-images.ts -- hero image data for the 3 hub pages\n` +
    `// (Italy/USA/Turkey) and the top-level /travel-guides index, none of which have a\n` +
    `// DestinationData object of their own to attach heroImage fields to.\n\n` +
    `export const HUB_HERO_IMAGES: Record<\n` +
    `  'italy' | 'usa' | 'turkey' | 'travel-guides-index',\n` +
    `  { url: string; alt: string; credit: { name: string; profileUrl: string } }\n` +
    `> = {\n${entries}\n}\n`
  writeFileSync(filePath, contents)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Loads any hub entries a previous run already fetched, so a re-run doesn't refetch them. */
function loadExistingHubData(): Partial<Record<HubEntry['key'], HubHeroData>> {
  const filePath = join(TRAVEL_GUIDES_DIR, 'hub-hero-images.ts')
  try {
    const contents = readFileSync(filePath, 'utf8')
    const data: Partial<Record<HubEntry['key'], HubHeroData>> = {}
    const blockPattern = /'(italy|usa|turkey|travel-guides-index)':\s*\{\s*url:\s*'([^']*)',\s*alt:\s*'((?:[^'\\]|\\.)*)',\s*credit:\s*\{\s*name:\s*'((?:[^'\\]|\\.)*)',\s*profileUrl:\s*'([^']*)',\s*\},\s*\}/g
    let match: RegExpExecArray | null
    while ((match = blockPattern.exec(contents))) {
      const [, key, url, alt, name, profileUrl] = match
      data[key as HubEntry['key']] = {
        url,
        alt: alt.replace(/\\'/g, "'"),
        credit: { name: name.replace(/\\'/g, "'"), profileUrl },
      }
    }
    return data
  } catch {
    return {}
  }
}

async function main(): Promise<void> {
  const accessKey = readUnsplashAccessKey()
  const hubData: Partial<Record<HubEntry['key'], HubHeroData>> = loadExistingHubData()
  let successCount = 0
  let skippedCount = 0
  const failures: string[] = []

  for (let i = 0; i < ENTRIES.length; i++) {
    const entry = ENTRIES[i]
    const label = entry.kind === 'leaf' ? entry.slug : entry.key

    // Idempotent re-run: skip entries a previous run already populated, so re-running after
    // hitting the rate limit only spends budget on what's still missing.
    const alreadyDone =
      entry.kind === 'leaf' ? leafAlreadyHasHeroImage(entry.slug) : Boolean(hubData[entry.key])
    if (alreadyDone) {
      console.log(`[${label}] already has a hero image, skipping`)
      successCount++
      skippedCount++
      continue
    }

    try {
      const { photo, queryUsed } = await searchPhotoWithFallback(entry, accessKey)
      if (!photo) {
        console.warn(`[${label}] query "${entry.query}" -- no results, leaving fields unset`)
        failures.push(`${label}: no search results for "${entry.query}"${entry.fallbackQuery ? ` or fallback "${entry.fallbackQuery}"` : ''}`)
      } else {
        await pingDownloadLocation(photo.downloadLocation, accessKey)
        if (entry.kind === 'leaf') {
          insertFieldsIntoLeafFile(entry, photo)
        } else {
          hubData[entry.key] = {
            url: photo.url,
            alt: buildAltText(entry),
            credit: { name: photo.photographerName, profileUrl: photo.profileUrl },
          }
        }
        successCount++
        const fallbackNote = queryUsed !== entry.query ? ` (fallback query "${queryUsed}")` : ''
        console.log(`[${label}] query "${entry.query}"${fallbackNote} -- success (photo by ${photo.photographerName})`)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.warn(`[${label}] query "${entry.query}" -- failed: ${message}`)
      failures.push(`${label}: ${message}`)
    }

    if (i < ENTRIES.length - 1) {
      await sleep(DELAY_MS)
    }
  }

  // Only (re)write hub-hero-images.ts if we have all 4 hub entries, so a partial run never
  // overwrites previously-fetched hub data with gaps.
  const hubKeys: HubEntry['key'][] = ['italy', 'usa', 'turkey', 'travel-guides-index']
  if (hubKeys.every((key) => hubData[key])) {
    writeHubHeroImagesFile(hubData as Record<HubEntry['key'], HubHeroData>)
  } else {
    console.warn('Not writing hub-hero-images.ts: one or more hub entries failed to fetch.')
  }

  console.log(`\n${successCount}/${ENTRIES.length} successful fetches (${skippedCount} already done from a previous run).`)
  if (failures.length > 0) {
    console.log('Failures:')
    for (const f of failures) console.log(`  - ${f}`)
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error('Fatal error running fetch-travel-guide-images script:', err instanceof Error ? err.message : err)
  process.exitCode = 1
})
