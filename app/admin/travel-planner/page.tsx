'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useTheme } from '@/components/ThemeContext'
import Link from 'next/link'
import {
  ArrowLeft, Plus, Sparkles, Loader2, Check, X, Trash2, Mail, MapPin,
  Utensils, Ticket, ListChecks, Users, FileText, Send, Globe, ChevronRight, Link2 as LinkIcon, Wallet, ExternalLink, Copy, Tent, Navigation, CalendarDays, Pencil, Search, Route, BookOpen,
} from 'lucide-react'
import {
  orderLegs, monthGridDays, legsCovering, gapDays, timelineBounds, dateInRange,
  parseYmd, inclusiveDayCount, metersToMiles1dp, metersToKm1dp, secondsToHm, fuelCostGBP, estimateFuelCost, buildDriveHops,
  departureCountryFor, buildShareableSummary, validateLeg, normaliseLeg, isOutOfWindow,
  DEFAULT_MAX_DRIVE_HOURS, isOverDriveLimit, splitPlan, overLimitSummary,
  scenicRoadToPlace, parkupToOpportunity, mergeProposedLegs,
  travelMonthsOf, isWinterMonth, safetyRecord,
  associatePlacesToLeg, associateParkupsToLeg,
} from './itinerary-utils'
import type { ItineraryLeg, HopResult } from './itinerary-utils'
import { filterAndSortDiary, heroPhoto, setHero as setHeroPhoto, removePhoto, clampRating, placeFromDiscovery } from './diary-utils'
import type { DiaryEntry, DiaryPhoto } from './diary-utils'

// Public Mapbox token — needed for the interactive map tiles and client-side
// reverse geocoding in the Drive Range panel. The isochrone/ring API uses the
// server token; the browser map needs this public one.
const MAPBOX_PUBLIC_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

// ── Option lists (mirror the Sanity schema) ──────────────────────────
const INTENTIONS = [
  { value: 'cookbook', label: 'Cookbook content' },
  { value: 'travel_inspiration', label: 'Travel inspiration' },
  { value: 'recipe_dev', label: 'Recipe development' },
  { value: 'features', label: 'Restaurant / producer features' },
  { value: 'sponsored', label: 'Sponsored / brand trip' },
  { value: 'personal', label: 'Personal trip' },
  { value: 'scouting', label: 'Scouting / recce' },
  { value: 'event_coverage', label: 'Event / festival coverage' },
  { value: 'collaboration', label: 'Collaboration / partnership' },
]
const STATUSES = [
  { value: 'idea', label: 'Idea' }, { value: 'planning', label: 'Planning' },
  { value: 'booked', label: 'Booked' }, { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' }, { value: 'archived', label: 'Archived' },
]
const CONTACT_ROLES = [
  { value: 'chef', label: 'Chef' }, { value: 'producer', label: 'Producer / farmer' },
  { value: 'restaurant', label: 'Restaurant' }, { value: 'pr', label: 'PR / agency' },
  { value: 'creator', label: 'Fellow creator' }, { value: 'brand', label: 'Brand' },
  { value: 'fixer', label: 'Fixer / guide' }, { value: 'tourism_board', label: 'Tourism board' },
  { value: 'other', label: 'Other' },
]
const CONTACT_STATUSES = [
  { value: 'to_contact', label: 'To contact' }, { value: 'contacted', label: 'Contacted' },
  { value: 'replied', label: 'Replied' }, { value: 'confirmed', label: 'Confirmed' },
  { value: 'declined', label: 'Declined' },
]
// Collab-opportunity fields: for brands/creators who've shown interest and are
// being worked toward a deal. These live ON the contact (contactCategory
// 'opportunity' + isOpportunity flag) so there's no duplicate data entry.
const COLLAB_INTEREST = [
  { value: 'cold', label: 'Cold', color: '#64748b' },
  { value: 'warm', label: 'Warm', color: '#d97706' },
  { value: 'hot', label: 'Hot', color: '#dc2626' },
]
const COLLAB_STAGES = [
  { value: 'interested', label: 'Interested', color: '#8b5cf6' },
  { value: 'in_discussion', label: 'In discussion', color: '#0ea5e9' },
  { value: 'agreed', label: 'Agreed', color: '#16a34a' },
  { value: 'live', label: 'Live', color: '#0d9488' },
  { value: 'done', label: 'Done', color: '#64748b' },
  { value: 'lost', label: 'Lost', color: '#ef4444' },
]
const COLLAB_DEAL_TYPES = [
  { value: 'gifted', label: 'Gifted / in-kind' }, { value: 'paid', label: 'Paid' },
  { value: 'ugc', label: 'UGC' }, { value: 'affiliate', label: 'Affiliate' },
  { value: 'ambassador', label: 'Ambassador' }, { value: 'event', label: 'Event / trip' },
  { value: 'other', label: 'Other' },
]
// The four "what are you adding?" choices for the Add-entry popup. Each seeds a
// contact with the right category; opportunities also start at stage 'interested'.
const CONTACT_ENTRY_TYPES = [
  { value: 'opportunity', label: 'Collab opportunity', hint: 'A brand or creator who has shown interest', seed: { contactCategory: 'opportunity', isOpportunity: true, role: 'brand', dealStage: 'interested', interestLevel: 'warm', status: 'replied' } },
  { value: 'company', label: 'Company', hint: 'A travel / experience brand to approach', seed: { contactCategory: 'company', role: 'brand', worksWithInfluencers: 'unknown', status: 'to_contact' } },
  { value: 'collab', label: 'Social collab', hint: 'A creator or account to collaborate with', seed: { contactCategory: 'collab', role: 'creator', status: 'to_contact' } },
  { value: 'general', label: 'General contact', hint: 'Anyone else — a person or venue', seed: { contactCategory: 'general', status: 'to_contact' } },
]
const CONTENT_FORMATS = [
  { value: 'short_form', label: 'Short-form (Reel/TikTok)' }, { value: 'long_form', label: 'Long-form (Article/Video)' },
  { value: 'travel_guide', label: 'Travel guide (blog)' },
  { value: 'cookbook_chapter', label: 'Cookbook chapter' }, { value: 'newsletter', label: 'Newsletter' },
  { value: 'photo_set', label: 'Photo set' },
]
const CONTENT_STATUSES = [
  { value: 'idea', label: 'Idea' }, { value: 'drafting', label: 'Drafting' },
  { value: 'shot', label: 'Shot' }, { value: 'published', label: 'Published' },
]
const EMAIL_GOALS = [
  'Introduce myself & open a conversation', 'Collaboration pitch', 'Interview request',
  'Visit / feature request', 'Thank you', 'Follow-up',
]
const EMAIL_TONES = ['Warm & professional', 'Friendly & casual', 'Formal', 'Enthusiastic']
const OPPORTUNITY_TYPES = [
  { value: 'work_exchange', label: 'Work exchange' }, { value: 'volunteering', label: 'Volunteering' },
  { value: 'farm_stay', label: 'Farm stay (WWOOF)' }, { value: 'free_parkup', label: 'Free park-up' },
  { value: 'paid_stopover', label: 'Paid stopover / aire' }, { value: 'host_stay', label: 'Host / driveway' },
  { value: 'other', label: 'Other' },
]
const OPPORTUNITY_STATUSES = [
  { value: 'to_research', label: 'To research' }, { value: 'applied', label: 'Contacted / applied' },
  { value: 'confirmed', label: 'Confirmed' }, { value: 'declined', label: 'Declined' },
]
const EVENT_TYPES = [
  { value: 'departure', label: 'Departure' }, { value: 'arrival', label: 'Arrival' },
]
const EVENT_MODES = [
  { value: 'flight', label: 'Flight' }, { value: 'ferry', label: 'Ferry' },
  { value: 'train', label: 'Train' }, { value: 'drive', label: 'Drive' },
  { value: 'other', label: 'Other' },
]
const BUDGET_CATEGORIES = [
  { value: 'fuel', label: 'Fuel' }, { value: 'ferry_tolls', label: 'Ferry / tolls' },
  { value: 'flights', label: 'Flights' }, { value: 'accommodation', label: 'Accommodation / campsites' },
  { value: 'food_drink', label: 'Food & drink' }, { value: 'activities', label: 'Activities / experiences' },
  { value: 'ingredients', label: 'Ingredients / props' }, { value: 'equipment', label: 'Equipment / gear' },
  { value: 'fees', label: 'Fees / permits' }, { value: 'insurance', label: 'Insurance' },
  { value: 'other', label: 'Other' },
]

// Format a number as currency; falls back to a plain number if the code is unusual
const fmtMoney = (n: number, currency = 'GBP') => {
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: (currency || 'GBP').toUpperCase(), maximumFractionDigits: 2 }).format(n || 0)
  } catch {
    return `${currency || ''} ${(n || 0).toFixed(2)}`.trim()
  }
}

const labelFor = (list: { value: string; label: string }[], v?: string) => list.find((x) => x.value === v)?.label || v || ''
const uid = (p: string) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

// Map common country names → flag emoji. Scans a free-text string (title,
// country, region) and returns the first match, else a globe. Emoji flags need
// no assets and render cross-platform.
const COUNTRY_FLAGS: Record<string, string> = {
  'united kingdom': '🇬🇧', uk: '🇬🇧', england: '🇬🇧', britain: '🇬🇧',
  france: '🇫🇷', belgium: '🇧🇪', luxembourg: '🇱🇺', netherlands: '🇳🇱', holland: '🇳🇱',
  germany: '🇩🇪', bavaria: '🇩🇪', switzerland: '🇨🇭', italy: '🇮🇹', 'san marino': '🇸🇲',
  greece: '🇬🇷', albania: '🇦🇱', montenegro: '🇲🇪', croatia: '🇭🇷', bosnia: '🇧🇦',
  slovenia: '🇸🇮', austria: '🇦🇹', spain: '🇪🇸', portugal: '🇵🇹', ireland: '🇮🇪',
  norway: '🇳🇴', sweden: '🇸🇪', denmark: '🇩🇰', poland: '🇵🇱', czech: '🇨🇿',
  hungary: '🇭🇺', turkey: '🇹🇷', morocco: '🇲🇦',
}
// Selectable trip icons: country flags + region globes + travel-style icons.
const TRIP_ICON_GROUPS: { label: string; icons: string[] }[] = [
  { label: 'Flags', icons: ['🇬🇧','🇫🇷','🇮🇹','🇬🇷','🇪🇸','🇵🇹','🇩🇪','🇨🇭','🇦🇹','🇳🇱','🇧🇪','🇱🇺','🇭🇷','🇸🇮','🇦🇱','🇲🇪','🇧🇦','🇲🇦','🇮🇪','🇳🇴','🇸🇪','🇩🇰','🇵🇱','🇨🇿','🇭🇺','🇹🇷','🇺🇸','🇯🇵','🇹🇭','🇮🇳','🇦🇺','🇳🇿'] },
  { label: 'Regions', icons: ['🌍','🌏','🌎','🗺️'] },
  { label: 'Travel', icons: ['🚐','⛰️','🏖️','⛵','🏝️','🌋','🏛️','🍇','🍽️','🎒','🧭','🛣️','🏕️','📸'] },
]

function tripFlag(t: any): string {
  if (t?.flagIcon && typeof t.flagIcon === 'string' && t.flagIcon.trim()) return t.flagIcon
  const hay = [t?.title, t?.country, t?.region].filter(Boolean).join(' ').toLowerCase()
  for (const [name, flag] of Object.entries(COUNTRY_FLAGS)) {
    if (hay.includes(name)) return flag
  }
  return '🌍'
}

// Map a place's free-text placeType into a coloured map category.
const PLACE_CATEGORIES: { key: string; label: string; color: string; icon: string }[] = [
  { key: 'food',     label: 'Food & drink',     color: '#d86213', icon: '🍽️' },
  { key: 'vineyard', label: 'Vineyards',        color: '#8b5cf6', icon: '🍇' },
  { key: 'landmark', label: 'Landmarks & castles', color: '#ef4444', icon: '🏛️' },
  { key: 'road',     label: 'Iconic roads',     color: '#f59e0b', icon: '🛣️' },
  { key: 'sea',      label: 'Sea / dive / snorkel', color: '#0ea5e9', icon: '🤿' },
  { key: 'scenic',   label: 'Scenic & nature',  color: '#16a34a', icon: '⛰️' },
  { key: 'activity', label: 'Activities',       color: '#ec4899', icon: '🎒' },
  { key: 'parkup',   label: 'Park-ups',         color: '#14b8a6', icon: '🅿️' },
  { key: 'workstay', label: 'Work-stays',       color: '#a16207', icon: '🧑\u200d🌾' },
  { key: 'diary',    label: 'Diary entries',    color: '#ec4899', icon: '📓' },
  { key: 'other',    label: 'Other',            color: '#6b7280', icon: '📍' },
]
const PLACE_CAT_COLOR: Record<string, string> = Object.fromEntries(PLACE_CATEGORIES.map((c) => [c.key, c.color]))

// ── Diary option sets ────────────────────────────────────────────────
const DIARY_TAGS = [
  { value: 'food', label: 'Food' },
  { value: 'scenic', label: 'Scenic' },
  { value: 'culture', label: 'Culture' },
  { value: 'driving', label: 'Driving' },
  { value: 'parkup', label: 'Park-up' },
  { value: 'wild_camping', label: 'Wild camping' },
  { value: 'local_experience', label: 'Local experience' },
]
const DIARY_MOODS = [
  { value: 'great', label: '😄 Great' },
  { value: 'good', label: '🙂 Good' },
  { value: 'ok', label: '😐 OK' },
  { value: 'tired', label: '😴 Tired' },
  { value: 'rough', label: '😣 Rough' },
]
const DISCOVERY_RECS = [
  { value: 'yes', label: '👍 Recommend' },
  { value: 'no', label: '👎 Skip it' },
  { value: 'mixed', label: '🤷 Mixed' },
]

// Classify a placeType string into one of the category keys above.
function placeCategory(placeType?: string): string {
  const t = (placeType || '').toLowerCase()
  // Order matters — check most specific first.
  // Work & stays win before the generic food/farm check below so a farm-stay
  // doesn't fall into 'food'. Note: match the multiword 'farm stay'/'farm-stay'
  // for workstay, leaving a bare 'farm' producer to the food category.
  if (t.includes('park-up') || t.includes('parkup') || t.includes('aire') || t.includes('stopover')) return 'parkup'
  if (t.includes('work-stay') || t.includes('workstay') || t.includes('work exchange') || t.includes('wwoof') || t.includes('farm stay') || t.includes('farm-stay') || t.includes('host stay')) return 'workstay'
  if (t.includes('vineyard') || t.includes('wine')) return 'vineyard'
  if (t.includes('dive') || t.includes('diving') || t.includes('snorkel') || t.includes('sea') || t.includes('beach') || t.includes('coast')) return 'sea'
  if (t.includes('road')) return 'road'
  if (t.includes('castle') || t.includes('landmark') || t.includes('fort') || t.includes('monument') || t.includes('ruin')) return 'landmark'
  if (t.includes('food') || t.includes('market') || t.includes('restaurant') || t.includes('producer') || t.includes('farm') || t.includes('drink') || t.includes('cookbook')) return 'food'
  if (t.includes('activity') || t.includes('experience') || t.includes('adventure')) return 'activity'
  if (t.includes('scenic') || t.includes('nature') || t.includes('gorge') || t.includes('lake') || t.includes('mountain') || t.includes('waterfall') || t.includes('town') || t.includes('village') || t.includes('park')) return 'scenic'
  return 'other'
}

// A soft deterministic gradient from the trip id/title, for the card's flag tile.
function tripHue(t: any): number {
  const s = (t?._id || t?.title || '').toString()
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360
  return h
}

// Status → pill colour for the trip list cards.
const TRIP_STATUS_COLORS: Record<string, string> = {
  idea: '#8a8a8a', planning: '#d86213', booked: '#0ea5e9',
  active: '#16a34a', completed: '#16a34a', archived: '#9ca3af',
}

// Map a travel-event mode to the closest budget category (train has no dedicated one).
const eventModeToBudgetCategory = (mode?: string): string => {
  switch (mode) {
    case 'flight': return 'flights'
    case 'ferry': return 'ferry_tolls'
    case 'drive': return 'fuel'
    case 'train': return 'other'
    default: return 'other'
  }
}

// Ensure a URL has a protocol so it opens correctly in a new tab
const normaliseUrl = (url: string) => (/^https?:\/\//i.test(url) ? url : `https://${url}`)

// Small badge describing a link's verification state
const LINK_STATUS_META: Record<string, { label: string; color: string }> = {
  verified: { label: '✓ Verified', color: '#16a34a' },
  homepage: { label: '↪ Main page', color: '#d97706' },
  unreachable: { label: '✕ Unreachable', color: '#ef4444' },
}

// Map an AI opportunity/park-up result into a schema opportunity item
const mapOpp = (x: any) => ({
  _type: 'opportunity', _key: uid('opp'), name: x.name, oppType: x.oppType || 'other',
  platform: x.platform, location: x.location, description: x.description,
  exchange: x.exchange || undefined, cost: x.cost || undefined, facilities: x.facilities || undefined,
  maxStay: x.maxStay || undefined, rating: x.rating || undefined, bestMonths: x.bestMonths || undefined,
  contact: x.contact || undefined, nearMe: x.nearMe || undefined,
  link: x.link || undefined, linkStatus: x.linkStatus || undefined, status: 'to_research',
})

// Normalise hashtags from AI (or a comma/space string) into clean #tags
const cleanHashtags = (raw: any): string[] => {
  let list: string[] = []
  if (Array.isArray(raw)) list = raw.map((t) => String(t))
  else if (typeof raw === 'string') list = raw.split(/[\s,]+/)
  return list
    .map((t) => t.trim().replace(/^#+/, ''))
    .filter(Boolean)
    .map((t) => `#${t.replace(/\s+/g, '')}`)
}

// Responsive helper — tracks a max-width breakpoint via matchMedia
function useIsMobile(maxWidth = 720) {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`)
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [maxWidth])
  return isMobile
}

type Trip = any

export default function TravelPlannerPage() {
  const { dark } = useTheme()
  const { data: session, status } = useSession()
  const isAdmin = (session?.user as any)?.isAdmin || (session?.user as any)?.role === 'admin'
  const isMobile = useIsMobile()

  const bg = dark ? '#0f0f0f' : '#F8F4EE'
  const card = dark ? '#1c1c1c' : '#ffffff'
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const text = dark ? '#f0f0f0' : '#111'
  const textSub = dark ? '#aaa' : '#555'
  const textMuted = dark ? '#777' : '#888'
  const inputBg = dark ? '#111' : '#fff'
  const inputBorder = dark ? 'rgba(255,255,255,0.12)' : '#ddd'
  const accent = '#d86213'

  // 16px font on inputs prevents iOS Safari from zooming on focus
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 12px', borderRadius: 10, border: `1px solid ${inputBorder}`,
    background: inputBg, color: text, fontSize: 16, outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: textSub, display: 'block', marginBottom: 6 }
  const btn = (bgc: string): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px', borderRadius: 10,
    border: 'none', background: bgc, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', minHeight: 44,
  })
  const ghostBtn: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 12px', borderRadius: 10,
    border: `1px solid ${inputBorder}`, background: 'transparent', color: text, fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 40,
  }
  const cardStyle: React.CSSProperties = { background: card, border: `1px solid ${border}`, borderRadius: 18, padding: isMobile ? 16 : 20 }
  // Responsive grid: single column on mobile
  const grid = (cols: number): React.CSSProperties => ({ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : `repeat(${cols}, 1fr)`, gap: 12 })
  const pagePad = isMobile ? '20px 14px 100px' : '32px 24px 80px'

  const [view, setView] = useState<'list' | 'detail' | 'dashboard'>('list')
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [activeId, setActiveId] = useState<string | null>(null)
  const [trip, setTrip] = useState<Trip | null>(null)
  const [detailTab, setDetailTab] = useState<'overview' | 'contacts' | 'itinerary' | 'calendar' | 'routemap' | 'routeguide' | 'workstays' | 'content' | 'budget' | 'checklist' | 'emails'>('overview')
  // Shared leg selection, lifted so the Route Guide can jump to a leg on the
  // Route Map / Calendar (R5.4). null = no leg selected.
  const [selectedLegKey, setSelectedLegKey] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState('')
  // Progressive disclosure: Overview "Generate a full plan with AI" starts collapsed.
  const [overviewAiOpen, setOverviewAiOpen] = useState(false)

  // New trip form
  const [showNew, setShowNew] = useState(false)
  const [ntTitle, setNtTitle] = useState('')
  const [ntCountry, setNtCountry] = useState('')
  const [ntRegion, setNtRegion] = useState('')
  const [ntIntentions, setNtIntentions] = useState<string[]>([])

  const flash = (msg: string) => { setNotice(msg); setTimeout(() => setNotice(''), 3500) }

  // ── Data loading ───────────────────────────────────────────────────
  const loadTrips = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/travel-planner')
      const data = await res.json()
      if (res.ok) setTrips(data.trips || []); else setError(data.error || 'Failed to load trips')
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!isAdmin) return
    let active = true
    // Defer so we don't call setState synchronously inside the effect body
    void Promise.resolve().then(() => { if (active) loadTrips() })
    return () => { active = false }
  }, [isAdmin, loadTrips])

  const openTrip = async (id: string) => {
    setActiveId(id); setView('detail'); setDetailTab('overview'); setTrip(null); setError('')
    try {
      const res = await fetch(`/api/admin/travel-planner?id=${encodeURIComponent(id)}`)
      const data = await res.json()
      if (res.ok) setTrip(data.trip); else setError(data.error || 'Failed to load trip')
    } catch (e: any) { setError(e.message) }
  }

  // ── Mutations ──────────────────────────────────────────────────────
  const createTrip = async () => {
    if (!ntTitle || !ntCountry) { setError('Title and country are required'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', trip: { title: ntTitle, country: ntCountry, region: ntRegion, intentions: ntIntentions } }),
      })
      const data = await res.json()
      if (res.ok) {
        setShowNew(false); setNtTitle(''); setNtCountry(''); setNtRegion(''); setNtIntentions([])
        await loadTrips()
        if (data.trip?._id) openTrip(data.trip._id)
      } else setError(data.error || 'Failed to create trip')
    } catch (e: any) { setError(e.message) }
    setSaving(false)
  }

  // Persist a set of fields on the current trip
  const patchTrip = async (patch: Record<string, any>, silent = false) => {
    if (!activeId) return
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', id: activeId, patch }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Save failed'); else if (!silent) flash('Saved')
    } catch (e: any) { setError(e.message) }
    setSaving(false)
  }

  // Update local trip state + persist a single field / array
  const setField = (key: string, value: any) => setTrip((t: Trip) => ({ ...t, [key]: value }))
  const saveField = (key: string, value: any) => { setField(key, value); patchTrip({ [key]: value }, true) }

  const deleteTrip = async (id: string) => {
    if (!confirm('Delete this trip and its email logs? This cannot be undone.')) return
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      })
      const data = await res.json()
      if (res.ok) { setView('list'); setActiveId(null); setTrip(null); loadTrips() }
      else setError(data.error || 'Delete failed')
    } catch (e: any) { setError(e.message) }
  }

  // Generic array item helpers on the current trip
  const arr = (key: string): any[] => (Array.isArray(trip?.[key]) ? trip[key] : [])
  const addItem = (key: string, itemType: string, fields: Record<string, any>) => {
    const next = [...arr(key), { _type: itemType, _key: uid(itemType), ...fields }]
    saveField(key, next)
  }
  const updateItem = (key: string, idx: number, fields: Record<string, any>) => {
    const next = arr(key).map((it, i) => (i === idx ? { ...it, ...fields } : it))
    saveField(key, next)
  }
  const removeItem = (key: string, idx: number) => saveField(key, arr(key).filter((_, i) => i !== idx))

  // ── AI actions ─────────────────────────────────────────────────────
  const aiGeneratePlan = async () => {
    if (!trip) return
    const existingCount = (arr('places').length + arr('food').length + arr('activities').length)
    if (existingCount > 0) {
      const ok = window.confirm(
        `This will ADD around 25 new AI suggestions (places, food, activities and content ideas) to your existing plans.\n\nIt will NOT overwrite or delete anything you already have (${existingCount} items). Continue?`
      )
      if (!ok) return
    }
    setAiLoading('plan'); setError('')
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ai-generate-plan', country: trip.country, region: trip.region, intentions: trip.intentions, trip }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'AI failed'); setAiLoading(''); return }
      const p = data.plan || {}
      const next = { ...trip }
      next.places = [...arr('places'), ...(p.places || []).map((x: any) => ({ _type: 'place', _key: uid('place'), name: x.name, placeType: x.placeType, location: x.location, why: x.why, priority: x.priority || 'High', link: x.link || undefined, linkStatus: x.linkStatus || undefined, visited: false }))]
      next.food = [...arr('food'), ...(p.food || []).map((x: any) => ({ _type: 'food', _key: uid('food'), name: x.name, where: x.where, notes: x.notes, tried: false }))]
      next.activities = [...arr('activities'), ...(p.activities || []).map((x: any) => ({ _type: 'activity', _key: uid('activity'), name: x.name, notes: x.notes, booked: false }))]
      next.contentIdeas = [...arr('contentIdeas'), ...(p.contentIdeas || []).map((x: any) => ({ _type: 'contentIdea', _key: uid('content'), title: x.title, format: x.format, platform: x.platform, notes: x.notes, hashtags: cleanHashtags(x.hashtags), status: 'idea' }))]
      setTrip(next)
      await patchTrip({ places: next.places, food: next.food, activities: next.activities, contentIdeas: next.contentIdeas }, true)
      flash('AI plan added')
    } catch (e: any) { setError(e.message) }
    setAiLoading('')
  }

  const aiContentIdeas = async () => {
    if (!trip) return
    setAiLoading('content'); setError('')
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ai-content-ideas', country: trip.country, region: trip.region, intentions: trip.intentions, trip }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'AI failed'); setAiLoading(''); return }
      const next = [...arr('contentIdeas'), ...(data.ideas || []).map((x: any) => ({ _type: 'contentIdea', _key: uid('content'), title: x.title, format: x.format, platform: x.platform, notes: x.notes, hashtags: cleanHashtags(x.hashtags), status: 'idea' }))]
      saveField('contentIdeas', next)
      flash('Content ideas added')
    } catch (e: any) { setError(e.message) }
    setAiLoading('')
  }

  const aiFindOpportunities = async () => {
    if (!trip) return
    setAiLoading('opps'); setError('')
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ai-find-opportunities', country: trip.country, region: trip.region, trip }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'AI failed'); setAiLoading(''); return }
      const combined = [...(data.opportunities || []), ...(data.parkups || [])].map(mapOpp)
      const next = [...arr('opportunities'), ...combined]
      saveField('opportunities', next)
      flash(`Added ${combined.length} opportunities`)
    } catch (e: any) { setError(e.message) }
    setAiLoading('')
  }

  // Find overnight PARK-UPS along the route (aires, coastal spots, camper
  // stops). Each result carries geocoded lat/lng, so it becomes an opportunity
  // with real coordinates — ready to pin on the Route Map. Always appends,
  // never overwrites.
  const aiFindParkups = async () => {
    if (!trip) return
    setAiLoading('parkups'); setError('')
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ai-find-parkups', country: trip.country, region: trip.region, trip }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'AI failed'); setAiLoading(''); return }
      const mapped = (data.parkups || []).map((x: any) => ({
        _type: 'opportunity', _key: uid('opp'),
        name: x.name, oppType: x.oppType || 'free_parkup', platform: x.platform || undefined,
        location: x.location || undefined,
        description: x.facilities ? `Facilities: ${x.facilities}` : undefined,
        cost: x.cost || undefined, facilities: x.facilities || undefined, maxStay: x.maxStay || undefined,
        rating: x.rating || undefined, bestMonths: x.bestMonths || undefined, link: x.link || undefined,
        coordinates: (Number.isFinite(x.lat) && Number.isFinite(x.lng)) ? { _type: 'geopoint', lat: x.lat, lng: x.lng } : undefined,
        status: 'to_research',
      }))
      const next = [...arr('opportunities'), ...mapped]
      saveField('opportunities', next)
      flash(`Added ${mapped.length} park-ups`)
    } catch (e: any) { setError(e.message) }
    setAiLoading('')
  }

  // Find WORK-FOR-STAY opportunities along the route (WWOOF, Workaway hosts,
  // volunteering, farm stays). Each result carries geocoded lat/lng so it can
  // be pinned on the Route Map. Always appends, never overwrites.
  const aiFindWorkstays = async () => {
    if (!trip) return
    setAiLoading('workstays'); setError('')
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ai-find-workstays', country: trip.country, region: trip.region, trip }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'AI failed'); setAiLoading(''); return }
      const mapped = (data.workstays || []).map((x: any) => ({
        _type: 'opportunity', _key: uid('opp'),
        name: x.name, oppType: x.oppType || 'work_exchange', platform: x.platform || undefined,
        location: x.location || undefined,
        description: x.exchange || undefined, exchange: x.exchange || undefined,
        bestMonths: x.bestMonths || undefined, link: x.link || undefined,
        coordinates: (Number.isFinite(x.lat) && Number.isFinite(x.lng)) ? { _type: 'geopoint', lat: x.lat, lng: x.lng } : undefined,
        status: 'to_research',
      }))
      const next = [...arr('opportunities'), ...mapped]
      saveField('opportunities', next)
      flash(`Added ${mapped.length} work-stays`)
    } catch (e: any) { setError(e.message) }
    setAiLoading('')
  }

  // Find social accounts (creators/venues) in the itinerary's regions to approach
  // for collabs. Always appends to contacts — never overwrites — and flags each
  // result as AI-suggested so its provenance is clear.
  const aiFindCollabs = async () => {
    if (!trip) return
    setAiLoading('collabs'); setError('')
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ai-find-collabs', country: trip.country, region: trip.region, trip }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'AI failed'); setAiLoading(''); return }
      const mapped = (data.contacts || []).map((x: any) => ({
        _type: 'contact', _key: uid('contact'),
        name: x.name || 'Suggested account', role: x.role || 'creator',
        contactCategory: 'collab', country: x.country || trip.country || '',
        instagram: x.instagram || '', tiktok: x.tiktok || '', youtube: x.youtube || '',
        website: x.website || '', notes: x.notes || '',
        aiSuggested: true, status: 'to_contact', conversations: [],
      }))
      const next = [...arr('contacts'), ...mapped]
      saveField('contacts', next)
      flash(`Added ${mapped.length} collab leads`)
    } catch (e: any) { setError(e.message) }
    setAiLoading('')
  }

  // Find travel/experience companies for UGC & paid work, flagging any known to
  // work with influencers. Always appends to contacts — never overwrites.
  const aiFindCompanies = async () => {
    if (!trip) return
    setAiLoading('companies'); setError('')
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ai-find-companies', country: trip.country, region: trip.region, trip }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'AI failed'); setAiLoading(''); return }
      const mapped = (data.contacts || []).map((x: any) => ({
        _type: 'contact', _key: uid('contact'),
        name: x.name || 'Company', role: 'brand', company: x.name || '',
        contactCategory: 'company', country: x.country || trip.country || '',
        website: x.website || '', worksWithInfluencers: x.worksWithInfluencers || 'unknown',
        notes: x.notes || '', aiSuggested: true, status: 'to_contact', conversations: [],
      }))
      const next = [...arr('contacts'), ...mapped]
      saveField('contacts', next)
      flash(`Added ${mapped.length} companies`)
    } catch (e: any) { setError(e.message) }
    setAiLoading('')
  }

  // Generate route-aware content ideas for a specific account and save them,
  // tagged with the account + format so you can see who each idea is for.
  const aiAccountContent = async (acctObj: { key: string; label?: string; niche?: string; isFood?: boolean }) => {
    if (!trip) return
    const acctKey = acctObj?.key
    setAiLoading('account-' + acctKey); setError('')
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ai-account-content',
          account: acctKey,
          accountLabel: acctObj?.label,
          accountNiche: acctObj?.niche,
          accountIsFood: !!acctObj?.isFood,
          country: trip.country, region: trip.region, intentions: trip.intentions, trip,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'AI failed'); setAiLoading(''); return }
      const ideas = (data.ideas || []).map((x: any) => ({
        _type: 'contentIdea', _key: uid('content'), title: x.title, format: x.format, platform: x.platform,
        notes: x.notes, location: x.location, account: acctKey, hashtags: cleanHashtags(x.hashtags), status: 'idea',
      }))
      const next = [...arr('contentIdeas'), ...ideas]
      saveField('contentIdeas', next)
      flash(`Added ${ideas.length} ideas for ${acctObj?.label || acctKey}`)
    } catch (e: any) { setError(e.message) }
    setAiLoading('')
  }

  // Generate a must-try list of local dishes, delicacies & produce from the route.
  const aiFindMustTry = async () => {
    if (!trip) return
    setAiLoading('musttry'); setError('')
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ai-find-musttry', country: trip.country, region: trip.region, trip }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'AI failed'); setAiLoading(''); return }
      const items = (data.items || []).map((x: any) => ({
        _type: 'mustTryItem', _key: uid('musttry'), name: x.name, region: x.region, kind: x.kind,
        why: x.why, whereToFind: x.whereToFind, tried: false,
      }))
      const next = [...arr('mustTryList'), ...items]
      saveField('mustTryList', next)
      flash(`Added ${items.length} must-try picks`)
    } catch (e: any) { setError(e.message) }
    setAiLoading('')
  }

  // Find work + park-ups near the user's live GPS location
  const aiFindNearby = async () => {
    if (!trip) return
    if (!('geolocation' in navigator)) { setError('Geolocation is not available on this device'); return }
    setAiLoading('nearby'); setError('')
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords
        const res = await fetch('/api/admin/travel-planner', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'ai-find-nearby', lat: latitude, lng: longitude }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error || 'AI failed'); setAiLoading(''); return }
        const combined = [...(data.opportunities || []), ...(data.parkups || [])].map(mapOpp)
        const next = [...arr('opportunities'), ...combined]
        saveField('opportunities', next)
        flash(`Found ${combined.length} near ${data.placeName || 'you'}`)
      } catch (e: any) { setError(e.message) }
      setAiLoading('')
    }, (err) => {
      setError(err.code === err.PERMISSION_DENIED ? 'Location permission denied — enable it to find spots near you.' : 'Could not get your location.')
      setAiLoading('')
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 })
  }

  // Re-check every link in an array field, replacing dead/deep links with the platform main page
  const verifyArrayLinks = async (key: 'opportunities' | 'places', platformField: string) => {
    if (!trip) return
    setAiLoading(`verify-${key}`); setError('')
    try {
      const items = arr(key)
        .map((it: any) => ({ key: it._key, link: it.link, platform: it[platformField] }))
        .filter((it: any) => it.link || it.platform)
      if (items.length === 0) { flash('Nothing to check — add a platform or link first'); setAiLoading(''); return }
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-links', items }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Verification failed'); setAiLoading(''); return }
      const byKey: Record<string, any> = {}
      ;(data.results || []).forEach((r: any) => { if (r.key) byKey[r.key] = r })
      const next = arr(key).map((it: any) => byKey[it._key] ? { ...it, link: byKey[it._key].link || undefined, linkStatus: byKey[it._key].linkStatus } : it)
      saveField(key, next)
      const fixed = (data.results || []).filter((r: any) => r.linkStatus === 'homepage').length
      const dead = (data.results || []).filter((r: any) => r.linkStatus === 'unreachable').length
      flash(`Links checked${fixed ? ` · ${fixed} platform link${fixed === 1 ? '' : 's'} added/fixed` : ''}${dead ? ` · ${dead} unreachable` : ''}`)
    } catch (e: any) { setError(e.message) }
    setAiLoading('')
  }

  // ── Email composer modal state ─────────────────────────────────────
  const [emailContact, setEmailContact] = useState<any | null>(null)
  const [emGoal, setEmGoal] = useState(EMAIL_GOALS[0])
  const [emTone, setEmTone] = useState(EMAIL_TONES[0])
  const [emSubject, setEmSubject] = useState('')
  const [emBody, setEmBody] = useState('')
  const [emComposing, setEmComposing] = useState(false)
  const [emSending, setEmSending] = useState(false)

  const openEmail = (c: any) => { setEmailContact(c); setEmSubject(''); setEmBody(''); setEmGoal(EMAIL_GOALS[0]); setEmTone(EMAIL_TONES[0]); setError('') }

  const aiComposeEmail = async () => {
    if (!emailContact) return
    setEmComposing(true); setError('')
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ai-compose-email', contact: emailContact, goal: emGoal, tone: emTone,
          tripContext: { title: trip?.title, country: trip?.country, region: trip?.region, intentions: trip?.intentions, startDate: trip?.startDate, endDate: trip?.endDate },
        }),
      })
      const data = await res.json()
      if (res.ok) { setEmSubject(data.subject || ''); setEmBody(data.body || '') } else setError(data.error || 'AI compose failed')
    } catch (e: any) { setError(e.message) }
    setEmComposing(false)
  }

  const sendEmail = async () => {
    if (!emailContact?.email) { setError('This contact has no email address'); return }
    if (!emSubject) { setError('Subject is required'); return }
    setEmSending(true); setError('')
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-email', tripId: activeId, contactName: emailContact.name, contactKey: emailContact?._key, to: emailContact.email, subject: emSubject, body: emBody, goal: emGoal }),
      })
      const data = await res.json()
      if (res.ok) { setEmailContact(null); flash(data.message || 'Email sent'); if (activeId) openTrip(activeId) }
      else setError(data.error || 'Send failed')
    } catch (e: any) { setError(e.message) }
    setEmSending(false)
  }

  // ── Email log ──────────────────────────────────────────────────────
  const [emailLog, setEmailLog] = useState<any[]>([])
  useEffect(() => {
    if (detailTab === 'emails' && activeId) {
      fetch(`/api/admin/travel-planner?mode=emailLog&id=${encodeURIComponent(activeId)}`)
        .then((r) => r.json()).then((d) => setEmailLog(d.logs || [])).catch(() => {})
    }
  }, [detailTab, activeId])

  // ── Next actions dashboard ─────────────────────────────────────────
  const [dashData, setDashData] = useState<any[]>([])
  const [dashLoading, setDashLoading] = useState(false)
  const loadDashboard = useCallback(async () => {
    setDashLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/travel-planner?mode=nextActions')
      const data = await res.json()
      if (res.ok) setDashData(data.trips || []); else setError(data.error || 'Failed to load dashboard')
    } catch (e: any) { setError(e.message) }
    setDashLoading(false)
  }, [])
  const openDashboard = () => { setView('dashboard'); loadDashboard() }

  // ── Linked content picker ──────────────────────────────────────────
  const [contentQuery, setContentQuery] = useState('')
  const [contentResults, setContentResults] = useState<any[]>([])
  const [contentSearching, setContentSearching] = useState(false)
  const searchContent = async (q: string) => {
    setContentQuery(q)
    if (q.trim().length < 2) { setContentResults([]); return }
    setContentSearching(true)
    try {
      const res = await fetch(`/api/admin/travel-planner?mode=searchContent&q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setContentResults(data.results || [])
    } catch { /* ignore */ }
    setContentSearching(false)
  }
  const linkContent = (item: any) => {
    const current = Array.isArray(trip?.linkedContent) ? trip.linkedContent : []
    if (current.some((r: any) => r._ref === item._id)) return
    const nextRefs = [...current, { _type: 'reference', _ref: item._id, _key: uid('ref') }]
    const nextResolved = [...(trip?.linkedContentResolved || []), item]
    setTrip((t: Trip) => ({ ...t, linkedContent: nextRefs, linkedContentResolved: nextResolved }))
    patchTrip({ linkedContent: nextRefs }, true)
    setContentQuery(''); setContentResults([])
  }
  const unlinkContent = (id: string) => {
    const nextRefs = (trip?.linkedContent || []).filter((r: any) => r._ref !== id)
    const nextResolved = (trip?.linkedContentResolved || []).filter((r: any) => r._id !== id)
    setTrip((t: Trip) => ({ ...t, linkedContent: nextRefs, linkedContentResolved: nextResolved }))
    patchTrip({ linkedContent: nextRefs }, true)
  }

  // ── Guards ─────────────────────────────────────────────────────────
  if (status === 'loading') return <div style={{ background: bg, minHeight: '100vh' }} />
  if (!isAdmin) return <div style={{ background: bg, minHeight: '100vh', padding: '100px 24px', textAlign: 'center', color: text }}>Admin only.</div>

  // ── Small presentational helpers ───────────────────────────────────
  const renderBanner = () => (
    <>
      {error && <div style={{ ...cardStyle, padding: '12px 16px', borderColor: '#ef4444', color: '#ef4444', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}><X size={16} /> {error}</div>}
      {notice && <div style={{ ...cardStyle, padding: '12px 16px', borderColor: '#16a34a', color: '#16a34a', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}><Check size={16} /> {notice}</div>}
    </>
  )

  // Bind Toggle styling deps for this render's palette
  const toggle = (on: boolean, onClick: () => void, labelOn: string, labelOff: string) => (
    <Toggle on={on} onClick={onClick} labelOn={labelOn} labelOff={labelOff} ghostBtn={ghostBtn} inputBorder={inputBorder} textMuted={textMuted} />
  )

  // ── LIST VIEW ──────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div style={{ background: bg, minHeight: '100vh', color: text }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: pagePad }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: textMuted, textDecoration: 'none', fontSize: 14, marginBottom: 20 }}>
            <ArrowLeft size={16} /> Back to Wise Way Round
          </Link>

          <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: 16, marginBottom: 8, flexDirection: isMobile ? 'column' : 'row' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🧭</div>
              <div>
                <h1 style={{ margin: 0, fontSize: isMobile ? 22 : 26, fontWeight: 800 }}>Travel Planner CRM</h1>
                <p style={{ margin: '2px 0 0', color: textMuted, fontSize: 13 }}>Plan trips, log contacts, generate content & email.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, width: isMobile ? '100%' : 'auto' }}>
              <button onClick={openDashboard} style={{ ...ghostBtn, flex: isMobile ? 1 : undefined }}><ListChecks size={16} /> Next actions</button>
              <button onClick={() => { setShowNew(true); setError('') }} style={{ ...btn(accent), flex: isMobile ? 1 : undefined }}><Plus size={16} /> New trip</button>
            </div>
          </div>

          <div style={{ height: 20 }} />
          {renderBanner()}

          {showNew && (
            <div style={{ ...cardStyle, marginBottom: 24 }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>New trip</h3>
              <div style={grid(2)}>
                <div><label style={labelStyle}>Trip title *</label><input style={inputStyle} value={ntTitle} onChange={(e) => setNtTitle(e.target.value)} placeholder="e.g. Basque Country food tour" /></div>
                <div><label style={labelStyle}>Country *</label><input style={inputStyle} value={ntCountry} onChange={(e) => setNtCountry(e.target.value)} placeholder="e.g. Spain" /></div>
                <div style={{ gridColumn: isMobile ? 'auto' : '1 / -1' }}><label style={labelStyle}>Region / cities</label><input style={inputStyle} value={ntRegion} onChange={(e) => setNtRegion(e.target.value)} placeholder="e.g. San Sebastián, Bilbao" /></div>
              </div>
              <label style={{ ...labelStyle, marginTop: 14 }}>Trip intentions</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {INTENTIONS.map((i) => {
                  const on = ntIntentions.includes(i.value)
                  return <button key={i.value} onClick={() => setNtIntentions((p) => on ? p.filter((v) => v !== i.value) : [...p, i.value])}
                    style={{ ...ghostBtn, borderColor: on ? accent : inputBorder, color: on ? accent : textSub, background: on ? `${accent}18` : 'transparent' }}>{i.label}</button>
                })}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 18, flexDirection: isMobile ? 'column' : 'row' }}>
                <button onClick={createTrip} disabled={saving} style={btn(accent)}>{saving ? <Loader2 size={16} className="spin" /> : <Check size={16} />} Create trip</button>
                <button onClick={() => setShowNew(false)} style={ghostBtn}>Cancel</button>
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: textMuted }}><Loader2 size={28} className="spin" /></div>
          ) : trips.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: 48, color: textMuted }}>
              <Globe size={32} style={{ marginBottom: 12, opacity: 0.6 }} />
              <p style={{ margin: 0 }}>No trips yet. Create your first one to start planning.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {trips.map((t) => {
                const hue = tripHue(t)
                const statusColor = TRIP_STATUS_COLORS[t.status] || accent
                const location = [t.region, t.country].filter(Boolean).join(', ')
                const chip: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(127,127,127,0.1)', color: textSub, padding: '3px 8px', borderRadius: 8, fontSize: 12, fontWeight: 600 }
                const firstIntention = (t.intentions || [])[0]
                return (
                  <button key={t._id} className="trip-card" onClick={() => openTrip(t._id)} style={{ ...cardStyle, padding: 0, overflow: 'hidden', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'stretch' }}>
                    {/* Flag tile */}
                    <div style={{ width: isMobile ? 64 : 84, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? 30 : 40, background: `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 40) % 360} 70% 45%))` }}>
                      <span aria-hidden>{tripFlag(t)}</span>
                    </div>
                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0, padding: isMobile ? 14 : 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                          <span style={{ fontSize: isMobile ? 16 : 18, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{t.title}</span>
                          <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: `${statusColor}22`, color: statusColor }}>{labelFor(STATUSES, t.status)}</span>
                        </div>
                        {location && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: textSub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                            <MapPin size={13} style={{ flexShrink: 0 }} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{location}</span>
                          </div>
                        )}
                        <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={chip}><Users size={12} /> {t.contactCount || 0}</span>
                          <span style={chip}><MapPin size={12} /> {t.placeCount || 0}</span>
                          <span style={chip}><Sparkles size={12} /> {t.contentCount || 0}</span>
                          {!isMobile && firstIntention && (
                            <span style={{ ...chip, background: `${accent}14`, color: accent }}>{labelFor(INTENTIONS, firstIntention)}</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={20} color={textMuted} style={{ flexShrink: 0 }} />
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
        <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.trip-card{transition:transform .12s ease, box-shadow .12s ease}.trip-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.10)}`}</style>
      </div>
    )
  }

  // ── NEXT ACTIONS DASHBOARD ─────────────────────────────────────────
  if (view === 'dashboard') {
    const allOutreach = dashData.flatMap((t: any) => (t.outreach || []).map((c: any) => ({ ...c, tripId: t._id, tripTitle: t.title, country: t.country })))
    const pipelineTrips = dashData.filter((t: any) => (t.pipeline || []).length > 0)
    const oppTrips = dashData.filter((t: any) => (t.opps || []).length > 0)
    return (
      <div style={{ background: bg, minHeight: '100vh', color: text }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: pagePad }}>
          <button onClick={() => { setView('list'); loadTrips() }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: textMuted, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, marginBottom: 20 }}>
            <ArrowLeft size={16} /> All trips
          </button>
          <h1 style={{ margin: '0 0 4px', fontSize: isMobile ? 22 : 26, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}><ListChecks size={24} color={accent} /> Next actions</h1>
          <p style={{ margin: '0 0 20px', color: textMuted, fontSize: 14 }}>Outreach still waiting and content still to finish, across all active trips.</p>
          {renderBanner()}

          {dashLoading ? (
            <div style={{ textAlign: 'center', padding: 60, color: textMuted }}><Loader2 size={28} className="spin" /></div>
          ) : (
            <div style={{ display: 'grid', gap: 20 }}>
              {/* Outreach todo */}
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 14px', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Users size={16} color={accent} /> Contacts to chase ({allOutreach.length})</h3>
                {allOutreach.length === 0 ? (
                  <div style={{ color: textMuted, fontSize: 14 }}>Nobody waiting — you're all caught up. 🎉</div>
                ) : (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {allOutreach.map((c: any, i: number) => (
                      <div key={`${c.tripId}-${c.name}-${i}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(127,127,127,0.06)' }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name} {c.role && <span style={{ color: textMuted, fontWeight: 400 }}>· {labelFor(CONTACT_ROLES, c.role)}</span>}</div>
                          <div style={{ fontSize: 12, color: textSub }}>{c.tripTitle} · {c.country}</div>
                        </div>
                        <button onClick={() => openTrip(c.tripId)} style={{ ...ghostBtn, borderColor: c.status === 'to_contact' ? '#ef4444' : accent, color: c.status === 'to_contact' ? '#ef4444' : accent, whiteSpace: 'nowrap' }}>
                          {labelFor(CONTACT_STATUSES, c.status)} <ChevronRight size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Content pipeline */}
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 14px', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Sparkles size={16} color={accent} /> Content pipeline</h3>
                {pipelineTrips.length === 0 ? (
                  <div style={{ color: textMuted, fontSize: 14 }}>No unfinished content ideas.</div>
                ) : (
                  <div style={{ display: 'grid', gap: 14 }}>
                    {pipelineTrips.map((t: any) => (
                      <div key={t._id}>
                        <button onClick={() => openTrip(t._id)} style={{ background: 'none', border: 'none', color: accent, fontWeight: 700, fontSize: 14, cursor: 'pointer', padding: 0, marginBottom: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>{t.title} <ChevronRight size={13} /></button>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {t.pipeline.map((p: any, i: number) => (
                            <span key={i} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: 'rgba(127,127,127,0.1)', color: textSub }}>
                              {p.title} <span style={{ color: textMuted }}>· {labelFor(CONTENT_STATUSES, p.status)}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Work & stays to sort */}
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 14px', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Tent size={16} color={accent} /> Work &amp; stays to sort</h3>
                {oppTrips.length === 0 ? (
                  <div style={{ color: textMuted, fontSize: 14 }}>Nothing outstanding to research or apply for.</div>
                ) : (
                  <div style={{ display: 'grid', gap: 14 }}>
                    {oppTrips.map((t: any) => (
                      <div key={t._id}>
                        <button onClick={() => openTrip(t._id)} style={{ background: 'none', border: 'none', color: accent, fontWeight: 700, fontSize: 14, cursor: 'pointer', padding: 0, marginBottom: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>{t.title} <ChevronRight size={13} /></button>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {t.opps.map((o: any, i: number) => (
                            <span key={i} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: 'rgba(127,127,127,0.1)', color: textSub, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              {o.name} <span style={{ color: textMuted }}>· {labelFor(OPPORTUNITY_STATUSES, o.status)}</span>
                              {o.link && <a href={normaliseUrl(o.link)} target="_blank" rel="noreferrer" style={{ color: accent, display: 'inline-flex' }} title="Open link"><ExternalLink size={12} /></a>}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  // ── DETAIL VIEW ────────────────────────────────────────────────────
  const tabs: { id: typeof detailTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <FileText size={15} /> },
    { id: 'contacts', label: 'Contacts', icon: <Users size={15} /> },
    { id: 'itinerary', label: 'Itinerary', icon: <MapPin size={15} /> },
    { id: 'workstays', label: 'Work & stays', icon: <Tent size={15} /> },
    { id: 'calendar', label: 'Calendar', icon: <CalendarDays size={15} /> },
    { id: 'routemap', label: 'Route Map', icon: <Globe size={15} /> },
    { id: 'routeguide', label: 'Route Guide', icon: <Route size={15} /> },
    { id: 'content', label: 'Content', icon: <Sparkles size={15} /> },
    { id: 'budget', label: 'Budget', icon: <Wallet size={15} /> },
    { id: 'checklist', label: 'Checklist', icon: <ListChecks size={15} /> },
    { id: 'emails', label: 'Email log', icon: <Mail size={15} /> },
  ]

  return (
    <div style={{ background: bg, minHeight: '100vh', color: text }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: pagePad }}>
        <button onClick={() => { setView('list'); setActiveId(null); setTrip(null); loadTrips() }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: textMuted, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, marginBottom: 20 }}>
          <ArrowLeft size={16} /> All trips
        </button>

        {!trip ? (
          <div style={{ textAlign: 'center', padding: 60, color: textMuted }}><Loader2 size={28} className="spin" /></div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
              <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, background: `linear-gradient(135deg, hsl(${tripHue(trip)} 70% 55%), hsl(${(tripHue(trip) + 40) % 360} 70% 45%))` }}>
                  <span aria-hidden>{tripFlag(trip)}</span>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <input
                    aria-label="Trip name"
                    value={trip.title || ''}
                    onChange={(e) => setField('title', e.target.value)}
                    onBlur={(e) => patchTrip({ title: e.target.value.trim() || 'Untitled trip' }, true)}
                    placeholder="Untitled trip"
                    title="Click to rename this trip"
                    style={{
                      margin: 0, width: '100%', fontSize: isMobile ? 21 : 26, fontWeight: 800,
                      border: '1px solid transparent', borderRadius: 8, padding: '2px 6px', marginLeft: -6,
                      background: 'transparent', color: 'inherit', fontFamily: 'inherit', outline: 'none',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = inputBorder; e.currentTarget.style.background = inputBg }}
                    onMouseLeave={(e) => { if (document.activeElement !== e.currentTarget) { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent' } }}
                    onBlurCapture={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent' }}
                  />
                  <p style={{ margin: '4px 0 0', color: textSub, fontSize: 14 }}>📍 {[trip.region, trip.country].filter(Boolean).join(', ')}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                {saving && <span style={{ fontSize: 12, color: textMuted, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Loader2 size={13} className="spin" /> {!isMobile && 'saving'}</span>}
                <button onClick={() => deleteTrip(activeId!)} style={{ ...ghostBtn, color: '#ef4444', borderColor: '#ef444455', padding: isMobile ? 10 : undefined }}><Trash2 size={14} /> {!isMobile && 'Delete'}</button>
              </div>
            </div>

            {renderBanner()}

            {/* Tabs — sticky + horizontally scrollable on mobile */}
            <div style={{ position: 'sticky', top: 0, zIndex: 20, background: bg, marginBottom: 20, borderBottom: `1px solid ${border}` }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: isMobile ? 'nowrap' : 'wrap', overflowX: isMobile ? 'auto' : 'visible', paddingBottom: 12, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
                {tabs.map((t) => (
                  <button key={t.id} onClick={() => setDetailTab(t.id)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, background: detailTab === t.id ? accent : 'transparent', color: detailTab === t.id ? '#fff' : textSub, whiteSpace: 'nowrap', flexShrink: 0, minHeight: 40 }}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── OVERVIEW ── */}
            {detailTab === 'overview' && (
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={cardStyle}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Trip icon</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, background: `linear-gradient(135deg, hsl(${tripHue(trip)} 70% 55%), hsl(${(tripHue(trip) + 40) % 360} 70% 45%))` }}>
                        <span aria-hidden>{tripFlag(trip)}</span>
                      </div>
                      <div style={{ fontSize: 13, color: textSub }}>Pick an icon for this trip</div>
                    </div>
                    <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                        <button
                          onClick={() => saveField('flagIcon', '')}
                          title="Auto-detect from title/country"
                          style={{ width: 40, height: 40, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0, borderRadius: 10, cursor: 'pointer', fontSize: 16, background: !trip.flagIcon ? `${accent}18` : 'transparent', border: !trip.flagIcon ? `2px solid ${accent}` : `1px solid ${inputBorder}` }}>
                          <span aria-hidden>🌍</span>
                          <span style={{ fontSize: 8, color: textMuted, fontWeight: 700 }}>Auto</span>
                        </button>
                      </div>
                      {TRIP_ICON_GROUPS.map((g) => (
                        <div key={g.label} style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 11, color: textMuted, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6, letterSpacing: 0.5 }}>{g.label}</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {g.icons.map((icon) => {
                              const sel = trip.flagIcon === icon
                              return (
                                <button key={icon} onClick={() => saveField('flagIcon', icon)}
                                  style={{ width: 40, height: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, cursor: 'pointer', fontSize: 22, background: sel ? `${accent}18` : 'transparent', border: sel ? `2px solid ${accent}` : `1px solid ${inputBorder}` }}>
                                  <span aria-hidden>{icon}</span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ ...grid(2), gap: 14 }}>
                    <div><label style={labelStyle}>Status</label>
                      <select style={inputStyle} value={trip.status || 'idea'} onChange={(e) => saveField('status', e.target.value)}>
                        {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                    <div><label style={labelStyle}>Travel method</label>
                      <select style={inputStyle} value={trip.travelMethod || ''} onChange={(e) => saveField('travelMethod', e.target.value)}>
                        <option value="">—</option>
                        {['Van', 'Flight', 'Ferry', 'Train', 'Mixed', 'Other'].map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div><label style={labelStyle}>Region / cities</label><input style={inputStyle} value={trip.region || ''} onChange={(e) => setField('region', e.target.value)} onBlur={(e) => patchTrip({ region: e.target.value }, true)} /></div>
                    <div><label style={labelStyle}>Country</label><input style={inputStyle} value={trip.country || ''} onChange={(e) => setField('country', e.target.value)} onBlur={(e) => patchTrip({ country: e.target.value }, true)} /></div>
                    <div><label style={labelStyle}>Start date</label><input type="date" style={inputStyle} value={trip.startDate || ''} onChange={(e) => saveField('startDate', e.target.value)} /></div>
                    <div><label style={labelStyle}>End date</label><input type="date" style={inputStyle} value={trip.endDate || ''} onChange={(e) => saveField('endDate', e.target.value)} /></div>
                  </div>
                  <label style={{ ...labelStyle, marginTop: 14 }}>Trip intentions</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {INTENTIONS.map((i) => {
                      const on = (trip.intentions || []).includes(i.value)
                      return <button key={i.value} onClick={() => saveField('intentions', on ? (trip.intentions || []).filter((v: string) => v !== i.value) : [...(trip.intentions || []), i.value])}
                        style={{ ...ghostBtn, borderColor: on ? accent : inputBorder, color: on ? accent : textSub, background: on ? `${accent}18` : 'transparent' }}>{i.label}</button>
                    })}
                  </div>
                </div>

                <div style={cardStyle}>
                  <label style={labelStyle}>Trip brief / notes</label>
                  <textarea style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }} value={trip.overview || ''} onChange={(e) => setField('overview', e.target.value)} onBlur={(e) => patchTrip({ overview: e.target.value }, true)} placeholder="What's the story of this trip? Goals, angle, who's involved..." />
                </div>

                <AdvancedSection
                  title="AI: generate a full plan"
                  icon={<Sparkles size={16} color={accent} />}
                  open={overviewAiOpen}
                  onToggle={() => setOverviewAiOpen((o) => !o)}
                  cardStyle={cardStyle}
                  ghostBtn={ghostBtn}
                >
                  <div style={{ display: 'flex', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between', gap: 12, flexDirection: isMobile ? 'column' : 'row' }}>
                    <div><div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><Sparkles size={16} color={accent} /> Generate a full plan with AI</div>
                      <div style={{ fontSize: 13, color: textSub, marginTop: 4 }}>Suggests places, food, activities & content ideas for {trip.country} based on your intentions.</div></div>
                    <button onClick={aiGeneratePlan} disabled={aiLoading === 'plan'} style={{ ...btn(accent), width: isMobile ? '100%' : undefined, flexShrink: 0 }}>{aiLoading === 'plan' ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />} Generate plan</button>
                  </div>
                  <div style={{ fontSize: 12, color: textMuted, marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Check size={12} /> Adds new suggestions to your plans — never overwrites what you already have.</div>
                  {aiLoading === 'plan' && <AiProgress label="Generating your plan…" />}
                </AdvancedSection>
              </div>
            )}

            {/* ── CONTACTS ── */}
            {detailTab === 'contacts' && (
              <ContactsTab
                trip={trip} arr={arr} addItem={addItem} updateItem={updateItem} removeItem={removeItem}
                cardStyle={cardStyle} inputStyle={inputStyle} labelStyle={labelStyle} ghostBtn={ghostBtn} btn={btn}
                accent={accent} textSub={textSub} textMuted={textMuted} border={border} text={text} inputBorder={inputBorder}
                openEmail={openEmail} grid={grid} isMobile={isMobile}
                activeId={activeId} flash={flash} inputBg={inputBg} dark={dark}
                aiFindCollabs={aiFindCollabs} aiFindCompanies={aiFindCompanies} aiLoading={aiLoading}
              />
            )}

            {/* ── ITINERARY ── */}
            {detailTab === 'itinerary' && (
              <ItineraryTab
                trip={trip} arr={arr} addItem={addItem} updateItem={updateItem} removeItem={removeItem}
                cardStyle={cardStyle} inputStyle={inputStyle} labelStyle={labelStyle} ghostBtn={ghostBtn} btn={btn}
                accent={accent} textSub={textSub} textMuted={textMuted} text={text} toggle={toggle}
                verifyArrayLinks={verifyArrayLinks} aiLoading={aiLoading}
              />
            )}

            {/* ── WORK & STAYS ── */}
            {detailTab === 'workstays' && (
              <WorkStaysTab
                trip={trip} arr={arr} addItem={addItem} updateItem={updateItem} removeItem={removeItem}
                cardStyle={cardStyle} inputStyle={inputStyle} labelStyle={labelStyle} ghostBtn={ghostBtn} btn={btn}
                accent={accent} textSub={textSub} textMuted={textMuted} text={text} dark={dark} inputBorder={inputBorder}
                grid={grid} isMobile={isMobile} aiFindOpportunities={aiFindOpportunities} aiFindNearby={aiFindNearby} aiLoading={aiLoading}
                aiFindParkups={aiFindParkups} aiFindWorkstays={aiFindWorkstays} flash={flash}
                verifyArrayLinks={verifyArrayLinks}
              />
            )}

            {/* ── CALENDAR ── */}
            {detailTab === 'calendar' && (
              <CalendarTab
                trip={trip} arr={arr} addItem={addItem} updateItem={updateItem} removeItem={removeItem}
                saveField={saveField} patchTrip={patchTrip}
                cardStyle={cardStyle} inputStyle={inputStyle} labelStyle={labelStyle} ghostBtn={ghostBtn} btn={btn}
                accent={accent} textSub={textSub} textMuted={textMuted} text={text} dark={dark} border={border} inputBorder={inputBorder}
                grid={grid} isMobile={isMobile} aiLoading={aiLoading} setAiLoading={setAiLoading} setError={setError} flash={flash}
              />
            )}

            {/* ── ROUTE MAP ── */}
            {detailTab === 'routemap' && (
              <RouteMapTab
                trip={trip} arr={arr} addItem={addItem} flash={flash}
                cardStyle={cardStyle} ghostBtn={ghostBtn} btn={btn}
                accent={accent} textSub={textSub} textMuted={textMuted} text={text} dark={dark} inputBorder={inputBorder} isMobile={isMobile}
              />
            )}

            {/* ── ROUTE GUIDE ── */}
            {detailTab === 'routeguide' && (
              <RouteGuideTab
                trip={trip} arr={arr} addItem={addItem} updateItem={updateItem} removeItem={removeItem} saveField={saveField} flash={flash}
                cardStyle={cardStyle} inputStyle={inputStyle} labelStyle={labelStyle} ghostBtn={ghostBtn} btn={btn}
                accent={accent} textSub={textSub} textMuted={textMuted} text={text} dark={dark} inputBorder={inputBorder}
                grid={grid} isMobile={isMobile}
                setDetailTab={setDetailTab} selectedLegKey={selectedLegKey} setSelectedLegKey={setSelectedLegKey}
              />
            )}

            {/* ── CONTENT ── */}
            {detailTab === 'content' && (
              <ContentTab
                trip={trip} arr={arr} addItem={addItem} updateItem={updateItem} removeItem={removeItem} saveField={saveField}
                cardStyle={cardStyle} inputStyle={inputStyle} labelStyle={labelStyle} ghostBtn={ghostBtn} btn={btn}
                accent={accent} textSub={textSub} textMuted={textMuted} text={text} dark={dark}
                aiContentIdeas={aiContentIdeas} aiAccountContent={aiAccountContent} aiFindMustTry={aiFindMustTry} aiLoading={aiLoading} grid={grid}
                contentQuery={contentQuery} contentResults={contentResults} contentSearching={contentSearching}
                searchContent={searchContent} linkContent={linkContent} unlinkContent={unlinkContent} inputBorder={inputBorder}
                flash={flash} isMobile={isMobile}
              />
            )}

            {/* ── BUDGET ── */}
            {detailTab === 'budget' && (
              <BudgetTab
                trip={trip} arr={arr} addItem={addItem} updateItem={updateItem} removeItem={removeItem}
                setField={setField} saveField={saveField} patchTrip={patchTrip}
                cardStyle={cardStyle} inputStyle={inputStyle} labelStyle={labelStyle} ghostBtn={ghostBtn} btn={btn}
                accent={accent} textSub={textSub} textMuted={textMuted} text={text} border={border} dark={dark}
                grid={grid} isMobile={isMobile}
              />
            )}

            {/* ── CHECKLIST ── */}
            {detailTab === 'checklist' && (
              <ChecklistTab
                arr={arr} addItem={addItem} updateItem={updateItem} removeItem={removeItem}
                cardStyle={cardStyle} inputStyle={inputStyle} ghostBtn={ghostBtn} btn={btn}
                accent={accent} textSub={textSub} textMuted={textMuted} toggle={toggle}
              />
            )}

            {/* ── EMAIL LOG ── */}
            {detailTab === 'emails' && (
              <div style={{ display: 'grid', gap: 10 }}>
                {emailLog.length === 0 ? (
                  <div style={{ ...cardStyle, textAlign: 'center', color: textMuted, padding: 40 }}><Mail size={26} style={{ opacity: 0.5, marginBottom: 8 }} /><p style={{ margin: 0 }}>No emails sent for this trip yet. Send one from the Contacts tab.</p></div>
                ) : emailLog.map((l) => (
                  <div key={l._id} style={{ ...cardStyle, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ fontWeight: 700 }}>{l.subject}</div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: l.status === 'sent' ? '#16a34a22' : '#ef444422', color: l.status === 'sent' ? '#16a34a' : '#ef4444' }}>{l.status}</span>
                    </div>
                    <div style={{ fontSize: 13, color: textSub, marginTop: 4 }}>To {l.contactName ? `${l.contactName} · ` : ''}{l.to} · {l.sentAt ? new Date(l.sentAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : ''}</div>
                    {l.goal && <div style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>Goal: {l.goal}</div>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── EMAIL COMPOSER MODAL ── */}
      {emailContact && (
        <div onClick={() => setEmailContact(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? 0 : 20, zIndex: 100 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ ...cardStyle, width: '100%', maxWidth: 620, maxHeight: isMobile ? '92vh' : '90vh', overflowY: 'auto', borderRadius: isMobile ? '18px 18px 0 0' : 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>Email {emailContact.name}</h3>
              <button onClick={() => setEmailContact(null)} style={{ ...ghostBtn, padding: 8 }}><X size={16} /></button>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: emailContact.email ? textSub : '#ef4444' }}>
              {emailContact.email ? `To: ${emailContact.email}` : 'No email address on file — add one in the Contacts tab first.'}
            </p>
            {error && <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</div>}
            <div style={{ ...grid(2), marginBottom: 12 }}>
              <div><label style={labelStyle}>Goal</label><select style={inputStyle} value={emGoal} onChange={(e) => setEmGoal(e.target.value)}>{EMAIL_GOALS.map((g) => <option key={g}>{g}</option>)}</select></div>
              <div><label style={labelStyle}>Tone</label><select style={inputStyle} value={emTone} onChange={(e) => setEmTone(e.target.value)}>{EMAIL_TONES.map((t) => <option key={t}>{t}</option>)}</select></div>
            </div>
            <button onClick={aiComposeEmail} disabled={emComposing} style={{ ...btn('#8b5cf6'), marginBottom: 16, width: isMobile ? '100%' : undefined }}>{emComposing ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />} {emSubject ? 'Regenerate with AI' : 'Draft with AI'}</button>
            {emComposing && <AiProgress label="Drafting email…" />}
            <div style={{ marginBottom: 12 }}><label style={labelStyle}>Subject</label><input style={inputStyle} value={emSubject} onChange={(e) => setEmSubject(e.target.value)} placeholder="Subject line" /></div>
            <div style={{ marginBottom: 16 }}><label style={labelStyle}>Body</label><textarea style={{ ...inputStyle, minHeight: 200, resize: 'vertical', fontFamily: 'inherit' }} value={emBody} onChange={(e) => setEmBody(e.target.value)} placeholder="Write or generate the email body..." /></div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexDirection: isMobile ? 'column-reverse' : 'row' }}>
              <button onClick={() => setEmailContact(null)} style={ghostBtn}>Cancel</button>
              <button onClick={sendEmail} disabled={emSending || !emailContact.email} style={{ ...btn(accent), opacity: emailContact.email ? 1 : 0.5 }}>{emSending ? <Loader2 size={16} className="spin" /> : <Send size={16} />} Send email</button>
            </div>
          </div>
        </div>
      )}

      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
.aiprog{position:relative;height:4px;border-radius:3px;background:rgba(127,127,127,0.18);overflow:hidden}
.aiprog::before{content:'';position:absolute;left:0;top:0;height:100%;width:40%;border-radius:3px;background:#d86213;animation:aiprog 1.1s ease-in-out infinite}
@keyframes aiprog{0%{left:-40%}100%{left:100%}}`}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Sub-tab components
// ─────────────────────────────────────────────────────────────────────

function ContactsTab(p: any) {
  const { trip, arr, addItem, updateItem, removeItem, cardStyle, inputStyle, labelStyle, ghostBtn, btn, accent, textSub, textMuted, border, text, inputBorder, openEmail, grid, isMobile, activeId, flash, inputBg, dark, aiFindCollabs, aiFindCompanies, aiLoading } = p
  const [open, setOpen] = useState<number | null>(null)
  const [convDraft, setConvDraft] = useState<Record<number, { channel: string; note: string }>>({})
  const [catFilter, setCatFilter] = useState<'all' | 'collab' | 'company' | 'general' | 'opportunity'>('all')
  // "What are you adding?" popup for the Add-entry button.
  const [addEntryOpen, setAddEntryOpen] = useState(false)
  const [countryFilter, setCountryFilter] = useState<string>('all')
  const contacts = arr('contacts')

  // ── Multi-select + bulk email ──────────────────────────────────────
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkSubject, setBulkSubject] = useState('')
  const [bulkDrafting, setBulkDrafting] = useState(false)
  const [bulkSending, setBulkSending] = useState(false)
  const [bulkResult, setBulkResult] = useState<{ sent: number; failed: number } | null>(null)
  const bulkBodyRef = useRef<HTMLDivElement | null>(null)
  const [findingEmails, setFindingEmails] = useState(false)

  const toggleSelected = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  // Normalise a contact's category — treat missing/empty as 'general'.
  const catOf = (c: any) => {
    if (c.isOpportunity || c.contactCategory === 'opportunity') return 'opportunity'
    if (c.contactCategory === 'collab' || c.contactCategory === 'company') return c.contactCategory
    return 'general'
  }

  // Create a new entry from the Add-entry popup. The chosen type seeds the right
  // category (and, for opportunities, the first deal stage), then the card opens.
  const createEntry = (entryType: string) => {
    const def = CONTACT_ENTRY_TYPES.find((t) => t.value === entryType) || CONTACT_ENTRY_TYPES[CONTACT_ENTRY_TYPES.length - 1]
    const name = entryType === 'opportunity' ? 'New opportunity' : 'New contact'
    addItem('contacts', 'contact', { name, conversations: [], ...def.seed })
    setAddEntryOpen(false)
    setOpen(contacts.length) // open the newly-appended card for editing
  }

  // Ask the AI to find a PUBLISHED contact email for selected contacts that have
  // no email yet. Honest by design: the API only returns an address when it's
  // confident it's real, format-validates it, and verifies any contact-page URL.
  // Found emails are flagged (emailAiFound) so their provenance stays clear, and
  // a contact page is dropped into notes when no email could be confirmed.
  const aiFindEmails = async () => {
    // Target selected contacts missing an email (prefer those with a website).
    const targets = contacts
      .map((c: any, idx: number) => ({ c, idx }))
      .filter(({ c }: any) => c._key && selected.has(c._key) && !(c.email || '').includes('@'))
    if (targets.length === 0) { flash?.('No selected contacts are missing an email'); return }
    setFindingEmails(true)
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'find-emails',
          contacts: targets.map(({ c }: any) => ({ key: c._key, name: c.name, company: c.company, website: c.website, country: c.country, role: c.role })),
        }),
      })
      const data = await res.json()
      if (!res.ok) { flash?.(data.error || 'Could not find emails'); setFindingEmails(false); return }
      const byKey = new Map<string, any>((data.results || []).map((r: any) => [r.key, r]))
      let found = 0, leads = 0
      targets.forEach(({ c, idx }: any) => {
        const r = byKey.get(c._key)
        if (!r) return
        if (r.email) {
          updateItem('contacts', idx, { email: r.email, emailAiFound: true })
          found++
        } else if (r.contactUrl) {
          // No confident email — record the contact page as a lead in notes.
          const lead = `Contact page (find email here): ${r.contactUrl}`
          const notes = (c.notes || '').includes(r.contactUrl) ? c.notes : [c.notes, lead].filter(Boolean).join('\n')
          updateItem('contacts', idx, { notes })
          leads++
        }
      })
      const parts = []
      if (found) parts.push(`${found} email${found === 1 ? '' : 's'} found on their website — verify before sending`)
      if (leads) parts.push(`${leads} contact page${leads === 1 ? '' : 's'} added to notes`)
      flash?.(parts.length ? parts.join(' · ') : 'No public emails found on the selected websites')
    } catch (e: any) {
      flash?.(e?.message || 'Could not find emails')
    }
    setFindingEmails(false)
  }

  // Distinct, sorted list of country values across all contacts (for the filter select).
  const countries = Array.from(new Set(contacts.map((c: any) => (c.country || '').trim()).filter(Boolean))).sort() as string[]

  // Category filter pills — matches the content-idea pill styling.
  const catPill = (on: boolean) => ({
    padding: '7px 13px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
    border: `1px solid ${on ? accent : inputBorder}`,
    background: on ? accent : 'transparent',
    color: on ? '#fff' : text,
  })

  // Small chip helper for a link (instagram/tiktok/youtube/website).
  const linkChip = (href: string, label: string) => (
    <a href={href} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: `${accent}18`, color: accent, textDecoration: 'none' }}>
      {label} <ExternalLink size={11} />
    </a>
  )

  const addConversation = (idx: number) => {
    const d = convDraft[idx]
    if (!d?.note) return
    const c = contacts[idx]
    const entry = { _type: 'conversationEntry', _key: `conv-${Date.now()}`, date: new Date().toISOString(), channel: d.channel || 'Email', note: d.note }
    updateItem('contacts', idx, { conversations: [entry, ...(c.conversations || [])] })
    setConvDraft((prev) => ({ ...prev, [idx]: { channel: 'Email', note: '' } }))
  }

  const filteredContacts = contacts
    .map((c: any, idx: number) => ({ c, idx }))
    .filter(({ c }: any) => (catFilter === 'all' ? true : catOf(c) === catFilter))
    .filter(({ c }: any) => (countryFilter === 'all' ? true : (c.country || '') === countryFilter))

  // Keys of the currently-visible (filtered) contacts, for "select all visible".
  const visibleKeys: string[] = filteredContacts.map(({ c }: any) => c._key).filter(Boolean)
  const allVisibleSelected = visibleKeys.length > 0 && visibleKeys.every((k) => selected.has(k))
  const toggleSelectAllVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allVisibleSelected) visibleKeys.forEach((k) => next.delete(k))
      else visibleKeys.forEach((k) => next.add(k))
      return next
    })
  }

  // Selected contacts (across the whole list, not just visible) + email split.
  const selectedContacts = contacts.filter((c: any) => c._key && selected.has(c._key))
  const withEmail = selectedContacts.filter((c: any) => (c.email || '').includes('@'))
  const withoutEmailCount = selectedContacts.length - withEmail.length

  const openBulk = () => {
    setBulkSubject('')
    setBulkResult(null)
    setBulkOpen(true)
    // Reset the editor after it mounts.
    setTimeout(() => { if (bulkBodyRef.current) bulkBodyRef.current.innerHTML = '' }, 0)
  }

  const exec = (cmd: string, value?: string) => {
    bulkBodyRef.current?.focus()
    try { document.execCommand(cmd, false, value) } catch {}
  }
  const execLink = () => {
    const url = window.prompt('Link URL (https://…)')
    if (url) exec('createLink', url)
  }
  // Insert the literal {{name}} token at the caret.
  const insertNameToken = () => {
    bulkBodyRef.current?.focus()
    try {
      if (!document.execCommand('insertText', false, '{{name}}')) {
        if (bulkBodyRef.current) bulkBodyRef.current.innerHTML += '{{name}}'
      }
    } catch {
      if (bulkBodyRef.current) bulkBodyRef.current.innerHTML += '{{name}}'
    }
  }

  const draftBulkWithAI = async () => {
    if (!trip || withEmail.length === 0) return
    setBulkDrafting(true)
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ai-compose-email', contact: withEmail[0], goal: 'Bulk outreach', tone: 'warm and professional',
          tripContext: { title: trip?.title, country: trip?.country, region: trip?.region, intentions: trip?.intentions, startDate: trip?.startDate, endDate: trip?.endDate },
          trip,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        if (data.subject) setBulkSubject(data.subject)
        if (bulkBodyRef.current) bulkBodyRef.current.innerHTML = String(data.body || '').replace(/\n/g, '<br/>')
      }
    } catch { /* fail-soft — leave the composer as-is */ }
    setBulkDrafting(false)
  }

  const sendBulk = async () => {
    const htmlContent = bulkBodyRef.current?.innerHTML || ''
    const recipients = withEmail.map((c: any) => ({ name: c.name || '', email: c.email, contactKey: c._key }))
    if (recipients.length === 0) return
    setBulkSending(true); setBulkResult(null)
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-bulk-email', tripId: activeId, recipients, subject: bulkSubject, body: htmlContent, goal: 'Bulk outreach' }),
      })
      const data = await res.json()
      if (res.ok) {
        setBulkResult({ sent: data.sent || 0, failed: data.failed || 0 })
        flash?.(`Sent to ${data.sent || 0}, failed ${data.failed || 0}`)
        if ((data.sent || 0) > 0) setSelected(new Set())
      }
    } catch { /* fail-soft */ }
    setBulkSending(false)
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {/* ── Opportunity pipeline board ── */}
      {(() => {
        const opps = contacts
          .map((c: any, idx: number) => ({ c, idx }))
          .filter(({ c }: any) => catOf(c) === 'opportunity')
        if (opps.length === 0) return null
        // Open a board card's full editor: reveal it (filter permitting) and expand it.
        const openOpp = (idx: number) => {
          if (catFilter !== 'all' && catFilter !== 'opportunity') setCatFilter('opportunity')
          setOpen(idx)
          // Scroll the matching list card into view after it renders.
          setTimeout(() => { document.getElementById('contact-' + idx)?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }, 60)
        }
        // Active stages only (hide empty columns to keep it tight), always keeping order.
        const stagesWithCards = COLLAB_STAGES
          .map((st) => ({ st, cards: opps.filter(({ c }: any) => (c.dealStage || 'interested') === st.value) }))
          .filter((col) => col.cards.length > 0)
        const pipelineValue = opps.reduce((sum: number, { c }: any) => sum + (typeof c.dealValue === 'number' ? c.dealValue : 0), 0)
        return (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <div style={{ fontWeight: 700, fontSize: 16, display: 'inline-flex', alignItems: 'center', gap: 8 }}><Sparkles size={16} color={accent} /> Opportunity pipeline <span style={{ fontSize: 12, fontWeight: 700, color: textMuted }}>{opps.length}</span></div>
              {pipelineValue > 0 && <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a' }}>{fmtMoney(pipelineValue, trip?.currency || 'GBP')} in play</div>}
            </div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, WebkitOverflowScrolling: 'touch' }}>
              {stagesWithCards.map(({ st, cards }) => (
                <div key={st.value} style={{ flex: isMobile ? '0 0 220px' : '1 1 0', minWidth: isMobile ? 220 : 160, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: st.color }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: st.color }} />
                    {st.label}
                    <span style={{ color: textMuted }}>{cards.length}</span>
                  </div>
                  {cards.map(({ c, idx }: any) => {
                    const interest = COLLAB_INTEREST.find((x) => x.value === c.interestLevel)
                    const dealType = COLLAB_DEAL_TYPES.find((x) => x.value === c.dealType)
                    return (
                      <button
                        key={c._key || idx}
                        onClick={() => openOpp(idx)}
                        style={{ textAlign: 'left', width: '100%', padding: '10px 12px', borderRadius: 10, cursor: 'pointer', color: text, border: `1px solid ${inputBorder}`, borderLeft: `3px solid ${st.color}`, background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)', display: 'grid', gap: 4 }}
                      >
                        <span style={{ fontWeight: 700, fontSize: 13.5, wordBreak: 'break-word' }}>{c.name || 'Untitled'}</span>
                        {(c.company && c.company !== c.name) && <span style={{ fontSize: 11.5, color: textSub }}>{c.company}</span>}
                        <span style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 1 }}>
                          {interest && <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: `${interest.color}22`, color: interest.color }}>{interest.value === 'hot' ? '🔥 ' : ''}{interest.label}</span>}
                          {typeof c.dealValue === 'number' && c.dealValue > 0 && <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: 'rgba(22,163,74,0.16)', color: '#16a34a' }}>{fmtMoney(c.dealValue, trip?.currency || 'GBP')}</span>}
                          {dealType && <span style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: 'rgba(127,127,127,0.12)', color: textSub }}>{dealType.label}</span>}
                        </span>
                        {c.nextStep && <span style={{ fontSize: 11, color: textMuted, display: 'inline-flex', gap: 4, alignItems: 'baseline' }}>→ {c.nextStep}{c.nextStepDate ? ` · ${fmtLegDate(c.nextStepDate)}` : ''}</span>}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* AI finder cards */}
      <div style={{ display: 'flex', gap: 12, flexDirection: isMobile ? 'column' : 'row' }}>
        <div style={{ ...cardStyle, flex: 1 }}>
          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><Users size={16} color={accent} /> Find social collabs</div>
          <div style={{ fontSize: 13, color: textSub, margin: '4px 0 12px' }}>AI finds social accounts in your itinerary&apos;s regions to approach for collabs.</div>
          <button onClick={aiFindCollabs} disabled={aiLoading === 'collabs'} style={{ ...btn(accent), width: '100%' }}>{aiLoading === 'collabs' ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />} Generate</button>
          <div style={{ fontSize: 12, color: textMuted, marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Check size={12} /> Adds to your contacts — never overwrites.</div>
          {aiLoading === 'collabs' && <AiProgress label="Finding collab accounts…" />}
        </div>
        <div style={{ ...cardStyle, flex: 1 }}>
          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><Globe size={16} color={accent} /> Find travel &amp; experience companies</div>
          <div style={{ fontSize: 13, color: textSub, margin: '4px 0 12px' }}>AI finds travel/experience companies for UGC &amp; paid work (flagged if known to work with influencers).</div>
          <button onClick={aiFindCompanies} disabled={aiLoading === 'companies'} style={{ ...btn('#0ea5e9'), width: '100%' }}>{aiLoading === 'companies' ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />} Generate</button>
          <div style={{ fontSize: 12, color: textMuted, marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Check size={12} /> Adds to your contacts — never overwrites.</div>
          {aiLoading === 'companies' && <AiProgress label="Finding companies…" />}
        </div>
      </div>

      <button onClick={() => setAddEntryOpen(true)} style={{ ...btn(accent), width: 'fit-content' }}><Plus size={16} /> Add entry</button>

      {/* ── ADD-ENTRY TYPE PICKER ── */}
      {addEntryOpen && (
        <div onClick={() => setAddEntryOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? 0 : 20, zIndex: 100 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ ...cardStyle, width: '100%', maxWidth: 460, borderRadius: isMobile ? '18px 18px 0 0' : 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>What are you adding?</h3>
              <button onClick={() => setAddEntryOpen(false)} style={{ ...ghostBtn, padding: 8 }}><X size={16} /></button>
            </div>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: textSub }}>Pick a type — a collab opportunity starts in your pipeline at &ldquo;Interested&rdquo;.</p>
            <div style={{ display: 'grid', gap: 10 }}>
              {CONTACT_ENTRY_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => createEntry(t.value)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', width: '100%', padding: '14px 16px', borderRadius: 12, cursor: 'pointer', background: 'transparent', color: text, border: `1px solid ${t.value === 'opportunity' ? accent : inputBorder}` }}
                >
                  <span style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.value === 'opportunity' ? `${accent}1f` : 'rgba(127,127,127,0.1)' }}>
                    {t.value === 'opportunity' ? <Sparkles size={17} color={accent} /> : t.value === 'company' ? <Globe size={17} color={textSub} /> : t.value === 'collab' ? <Users size={17} color={textSub} /> : <Plus size={17} color={textSub} />}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontWeight: 700, fontSize: 15 }}>{t.label}</span>
                    <span style={{ display: 'block', fontSize: 12.5, color: textMuted }}>{t.hint}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter bar */}
      {contacts.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { value: 'all', label: 'All' },
              { value: 'opportunity', label: 'Opportunities' },
              { value: 'collab', label: 'Social collabs' },
              { value: 'company', label: 'Companies' },
              { value: 'general', label: 'General/manual' },
            ].map((f) => (
              <button key={f.value} onClick={() => setCatFilter(f.value as any)} style={catPill(catFilter === f.value)}>{f.label}</button>
            ))}
          </div>
          {countries.length > 0 && (
            <select style={{ ...inputStyle, width: isMobile ? '100%' : 200 }} value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
              <option value="all">All countries</option>
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>
      )}

      {/* Multi-select toolbar */}
      {contacts.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={toggleSelectAllVisible} disabled={visibleKeys.length === 0} style={ghostBtn}>
              {allVisibleSelected ? 'Deselect all' : 'Select all visible'}
            </button>
            {selected.size > 0 && (
              <span style={{ fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 20, background: `${accent}22`, color: accent }}>{selected.size} selected · {withEmail.length} emailable</span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {withoutEmailCount > 0 && (
                <button
                  onClick={aiFindEmails}
                  disabled={findingEmails}
                  style={{ ...btn('#8b5cf6'), opacity: findingEmails ? 0.6 : 1 }}
                  title={`Scan the website of the ${withoutEmailCount} selected contact${withoutEmailCount === 1 ? '' : 's'} without an email to find a public address`}
                >
                  {findingEmails ? <Loader2 size={16} className="spin" /> : <Search size={16} />} Find emails ({withoutEmailCount})
                </button>
              )}
              <button
                onClick={openBulk}
                disabled={selected.size === 0 || withEmail.length === 0}
                style={{ ...btn(accent), opacity: (selected.size === 0 || withEmail.length === 0) ? 0.5 : 1 }}
                title={selected.size === 0 ? 'Select some contacts first' : withEmail.length === 0 ? 'None of the selected contacts have an email address yet' : `Email ${withEmail.length} contact${withEmail.length === 1 ? '' : 's'}`}
              >
                <Mail size={16} /> Email selected{withEmail.length > 0 ? ` (${withEmail.length})` : ''}
              </button>
            </div>
            {findingEmails && (
              <span style={{ fontSize: 12, color: '#8b5cf6', fontWeight: 600, textAlign: 'right' }}>
                Scanning websites for public emails…
              </span>
            )}
            {selected.size > 0 && withEmail.length === 0 && (
              <span style={{ fontSize: 12, color: '#d97706', fontWeight: 600, textAlign: 'right', maxWidth: 260 }}>
                None of these have an email yet — open a contact to add one.
              </span>
            )}
            {selected.size > 0 && withEmail.length > 0 && withoutEmailCount > 0 && (
              <span style={{ fontSize: 12, color: textMuted, textAlign: 'right' }}>
                {withoutEmailCount} selected {withoutEmailCount === 1 ? 'has' : 'have'} no email and will be skipped.
              </span>
            )}
          </div>
        </div>
      )}

      {contacts.length === 0 && <div style={{ ...cardStyle, textAlign: 'center', color: textMuted, padding: 40 }}><Users size={26} style={{ opacity: 0.5, marginBottom: 8 }} /><p style={{ margin: 0 }}>No contacts yet.</p></div>}
      {contacts.length > 0 && filteredContacts.length === 0 && (
        <div style={{ ...cardStyle, textAlign: 'center', color: textMuted, padding: 24 }}><p style={{ margin: 0, fontSize: 13 }}>No contacts match this filter.</p></div>
      )}
      {filteredContacts.map(({ c, idx }: any) => (
        <div key={c._key || idx} id={'contact-' + idx} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
              {c._key && (
                <input
                  type="checkbox"
                  checked={selected.has(c._key)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => { e.stopPropagation(); toggleSelected(c._key) }}
                  style={{ width: 18, height: 18, flexShrink: 0, accentColor: accent, cursor: 'pointer' }}
                  title="Select for bulk email"
                />
              )}
              <div style={{ cursor: 'pointer', flex: 1, minWidth: 0 }} onClick={() => setOpen(open === idx ? null : idx)}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{c.name || 'Unnamed'}</div>
              <div style={{ fontSize: 13, color: textSub }}>{[labelForRole(c.role), c.company].filter(Boolean).join(' · ')}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {catOf(c) === 'opportunity' && (() => {
                  const stage = COLLAB_STAGES.find((x) => x.value === (c.dealStage || 'interested')) || COLLAB_STAGES[0]
                  const interest = COLLAB_INTEREST.find((x) => x.value === c.interestLevel)
                  return (<>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: `${stage.color}22`, color: stage.color }}>{stage.label}</span>
                    {interest && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: `${interest.color}22`, color: interest.color }}>{interest.value === 'hot' ? '🔥 ' : ''}{interest.label}</span>}
                    {typeof c.dealValue === 'number' && c.dealValue > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: 'rgba(22,163,74,0.16)', color: '#16a34a' }}>{fmtMoney(c.dealValue, trip?.currency || 'GBP')}</span>}
                  </>)
                })()}
                {c.aiSuggested && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: 'rgba(245,158,11,0.18)', color: '#d97706' }}>AI suggested — verify</span>}
                {catOf(c) === 'company' && c.worksWithInfluencers === 'yes' && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: 'rgba(34,197,94,0.18)', color: '#16a34a' }}>Works with influencers</span>}
                {catOf(c) === 'company' && c.worksWithInfluencers === 'unknown' && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: 'rgba(127,127,127,0.14)', color: textSub }}>Influencer work: unknown</span>}
                {catOf(c) === 'company' && c.worksWithInfluencers === 'no' && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: 'rgba(127,127,127,0.1)', color: textMuted }}>No influencer programme</span>}
                {c.country && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: 'rgba(127,127,127,0.12)', color: textSub }}><MapPin size={11} /> {c.country}</span>}
                {!(c.email || '').includes('@') && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: 'rgba(217,119,6,0.14)', color: '#d97706' }} title="No email address yet — can't be bulk-emailed">No email</span>}
                {(c.email || '').includes('@') && c.emailAiFound && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: 'rgba(139,92,246,0.16)', color: '#8b5cf6' }} title="This email was scraped from their website — verify it before sending">Email: found — verify</span>}
                {c.instagram && linkChip(`https://instagram.com/${String(c.instagram).replace(/^@/, '')}`, 'Instagram')}
                {c.tiktok && linkChip(`https://tiktok.com/@${String(c.tiktok).replace(/^@/, '')}`, 'TikTok')}
                {c.youtube && linkChip(normaliseUrl(c.youtube), 'YouTube')}
                {c.website && linkChip(normaliseUrl(c.website), 'Website')}
              </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: `${accent}22`, color: accent }}>{labelForStatus(c.status)}</span>
              {(c.email || '').includes('@') ? (
                <button onClick={(e) => { e.stopPropagation(); openEmail(c) }} style={{ ...ghostBtn, padding: 8 }} title="Email this contact"><Mail size={15} /></button>
              ) : (
                <button onClick={(e) => { e.stopPropagation(); setOpen(idx) }} style={{ ...ghostBtn, padding: '8px 10px', fontSize: 12, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 5, color: '#d97706', borderColor: '#d97706' }} title="Add an email address so you can contact them"><Mail size={14} /> Add email</button>
              )}
              <button onClick={(e) => { e.stopPropagation(); if (confirm('Remove this contact?')) removeItem('contacts', idx) }} style={{ ...ghostBtn, padding: 8, color: '#ef4444' }}><Trash2 size={15} /></button>
            </div>
          </div>

          {open === idx && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${border}`, display: 'grid', gap: 12 }}>
              <div style={grid(2)}>
                <Field label="Name" value={c.name} onSave={(v) => updateItem('contacts', idx, { name: v })} inputStyle={inputStyle} labelStyle={labelStyle} />
                <div><label style={labelStyle}>Role</label><select style={inputStyle} value={c.role || ''} onChange={(e) => updateItem('contacts', idx, { role: e.target.value })}><option value="">—</option>{CONTACT_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select></div>
                <Field label="Company / venue" value={c.company} onSave={(v) => updateItem('contacts', idx, { company: v })} inputStyle={inputStyle} labelStyle={labelStyle} />
                <div><label style={labelStyle}>Status</label><select style={inputStyle} value={c.status || 'to_contact'} onChange={(e) => updateItem('contacts', idx, { status: e.target.value })}>{CONTACT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
                <Field label="Email" value={c.email} onSave={(v) => updateItem('contacts', idx, { email: v, emailAiFound: false })} inputStyle={inputStyle} labelStyle={labelStyle} />
                <Field label="Phone" value={c.phone} onSave={(v) => updateItem('contacts', idx, { phone: v })} inputStyle={inputStyle} labelStyle={labelStyle} />
                <Field label="Instagram" value={c.instagram} onSave={(v) => updateItem('contacts', idx, { instagram: v })} inputStyle={inputStyle} labelStyle={labelStyle} placeholder="@handle" />
                <Field label="TikTok" value={c.tiktok} onSave={(v) => updateItem('contacts', idx, { tiktok: v })} inputStyle={inputStyle} labelStyle={labelStyle} placeholder="@handle" />
                <Field label="YouTube" value={c.youtube} onSave={(v) => updateItem('contacts', idx, { youtube: v })} inputStyle={inputStyle} labelStyle={labelStyle} />
                <Field label="Website" value={c.website} onSave={(v) => updateItem('contacts', idx, { website: v })} inputStyle={inputStyle} labelStyle={labelStyle} />
                <Field label="Country" value={c.country} onSave={(v) => updateItem('contacts', idx, { country: v })} inputStyle={inputStyle} labelStyle={labelStyle} />
                {catOf(c) === 'company' && (
                  <div><label style={labelStyle}>Works with influencers</label><select style={inputStyle} value={c.worksWithInfluencers || 'unknown'} onChange={(e) => updateItem('contacts', idx, { worksWithInfluencers: e.target.value })}><option value="yes">Yes</option><option value="no">No</option><option value="unknown">Unknown</option></select></div>
                )}
              </div>

              {/* Collaboration / opportunity pipeline */}
              {catOf(c) === 'opportunity' ? (
                <div style={{ border: `1px solid ${accent}55`, borderRadius: 12, padding: 14, background: `${accent}0d` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Sparkles size={15} color={accent} /> Collaboration</div>
                    <button onClick={() => updateItem('contacts', idx, { isOpportunity: false, contactCategory: 'general' })} style={{ ...ghostBtn, padding: '6px 10px', fontSize: 12 }} title="Remove from the opportunities pipeline">Not an opportunity</button>
                  </div>
                  <div style={grid(2)}>
                    <div><label style={labelStyle}>Stage</label><select style={inputStyle} value={c.dealStage || 'interested'} onChange={(e) => updateItem('contacts', idx, { dealStage: e.target.value })}>{COLLAB_STAGES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                    <div><label style={labelStyle}>Interest</label><select style={inputStyle} value={c.interestLevel || 'warm'} onChange={(e) => updateItem('contacts', idx, { interestLevel: e.target.value })}>{COLLAB_INTEREST.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                    <div><label style={labelStyle}>Deal type</label><select style={inputStyle} value={c.dealType || ''} onChange={(e) => updateItem('contacts', idx, { dealType: e.target.value })}><option value="">—</option>{COLLAB_DEAL_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                    <div><label style={labelStyle}>Value ({trip?.currency || 'GBP'})</label><input type="number" inputMode="decimal" style={inputStyle} defaultValue={c.dealValue ?? ''} placeholder="e.g. 500" onBlur={(e) => updateItem('contacts', idx, { dealValue: e.target.value === '' ? undefined : Number(e.target.value) })} /></div>
                    <div><label style={labelStyle}>Next step</label><input style={inputStyle} defaultValue={c.nextStep || ''} placeholder="e.g. Send proposal" onBlur={(e) => updateItem('contacts', idx, { nextStep: e.target.value })} /></div>
                    <div><label style={labelStyle}>Next-step date</label><input type="date" style={inputStyle} value={c.nextStepDate || ''} onChange={(e) => updateItem('contacts', idx, { nextStepDate: e.target.value })} /></div>
                  </div>
                </div>
              ) : (
                <button onClick={() => updateItem('contacts', idx, { isOpportunity: true, contactCategory: 'opportunity', dealStage: c.dealStage || 'interested', interestLevel: c.interestLevel || 'warm' })} style={{ ...ghostBtn, width: 'fit-content', borderColor: accent, color: accent }}><Sparkles size={14} /> Mark as opportunity</button>
              )}

              <div><label style={labelStyle}>Notes</label><textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} defaultValue={c.notes || ''} onBlur={(e) => updateItem('contacts', idx, { notes: e.target.value })} /></div>

              {/* Conversation log */}
              <div>
                <label style={labelStyle}>Conversation log</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <select style={{ ...inputStyle, width: 130 }} value={convDraft[idx]?.channel || 'Email'} onChange={(e) => setConvDraft((prev) => ({ ...prev, [idx]: { ...(prev[idx] || { note: '' }), channel: e.target.value } }))}>
                    {['Email', 'Instagram', 'TikTok', 'WhatsApp', 'Phone', 'In person', 'Other'].map((ch) => <option key={ch}>{ch}</option>)}
                  </select>
                  <input style={inputStyle} placeholder="Log a note..." value={convDraft[idx]?.note || ''} onChange={(e) => setConvDraft((prev) => ({ ...prev, [idx]: { ...(prev[idx] || { channel: 'Email' }), note: e.target.value } }))} onKeyDown={(e) => { if (e.key === 'Enter') addConversation(idx) }} />
                  <button onClick={() => addConversation(idx)} style={{ ...btn(accent), padding: '10px 14px' }}><Plus size={15} /></button>
                </div>
                <div style={{ display: 'grid', gap: 6 }}>
                  {(c.conversations || []).map((cv: any, i: number) => (
                    <div key={cv._key || i} style={{ fontSize: 13, color: textSub, padding: '8px 12px', background: 'rgba(127,127,127,0.08)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                      <span><strong style={{ color: text }}>{cv.channel}</strong> — {cv.note}</span>
                      <span style={{ color: textMuted, whiteSpace: 'nowrap', fontSize: 11 }}>{cv.date ? new Date(cv.date).toLocaleDateString('en-GB') : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* ── BULK EMAIL COMPOSE (WYSIWYG) ── */}
      {bulkOpen && (
        <div onClick={() => setBulkOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? 0 : 20, zIndex: 100 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ ...cardStyle, width: '100%', maxWidth: 640, maxHeight: isMobile ? '92vh' : '90vh', overflowY: 'auto', borderRadius: isMobile ? '18px 18px 0 0' : 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>Email {withEmail.length} contact{withEmail.length === 1 ? '' : 's'}</h3>
              <button onClick={() => setBulkOpen(false)} style={{ ...ghostBtn, padding: 8 }}><X size={16} /></button>
            </div>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: textSub }}>
              Personalise with the <code style={{ background: 'rgba(127,127,127,0.15)', padding: '1px 5px', borderRadius: 5 }}>{'{{name}}'}</code> token — it&apos;s replaced with each recipient&apos;s name (or &quot;there&quot;).
            </p>

            {/* Recipient summary */}
            <div style={{ marginBottom: 14, padding: 12, borderRadius: 10, background: 'rgba(127,127,127,0.08)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: textSub, marginBottom: 6 }}>Will send to {withEmail.length}:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 90, overflowY: 'auto' }}>
                {withEmail.map((c: any) => (
                  <span key={c._key} style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: `${accent}18`, color: accent }}>{c.name || 'Unnamed'} · {c.email}</span>
                ))}
              </div>
              {withoutEmailCount > 0 && (
                <div style={{ fontSize: 12, color: '#d97706', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check size={12} /> {withoutEmailCount} selected contact{withoutEmailCount === 1 ? ' has' : 's have'} no email and will be skipped.
                </div>
              )}
            </div>

            {/* AI draft */}
            <button onClick={draftBulkWithAI} disabled={bulkDrafting || withEmail.length === 0} style={{ ...btn('#8b5cf6'), marginBottom: 14, width: isMobile ? '100%' : undefined }}>{bulkDrafting ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />} Draft with AI</button>
            {bulkDrafting && <AiProgress label="Drafting email…" />}

            <div style={{ marginBottom: 12 }}><label style={labelStyle}>Subject</label><input style={inputStyle} value={bulkSubject} onChange={(e) => setBulkSubject(e.target.value)} placeholder="Subject line" /></div>

            {/* Formatting toolbar */}
            <label style={labelStyle}>Body</label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('bold')} style={{ ...ghostBtn, padding: '8px 12px', fontWeight: 800 }} title="Bold">B</button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('italic')} style={{ ...ghostBtn, padding: '8px 12px', fontStyle: 'italic' }} title="Italic">I</button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={execLink} style={{ ...ghostBtn, padding: '8px 12px' }} title="Insert link"><LinkIcon size={15} /></button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={insertNameToken} style={{ ...ghostBtn, padding: '8px 12px', fontWeight: 700 }} title="Insert name token">{'{{name}}'}</button>
            </div>
            <div
              ref={bulkBodyRef}
              contentEditable
              suppressContentEditableWarning
              style={{
                minHeight: 200, maxHeight: 320, overflowY: 'auto',
                padding: '12px 12px', borderRadius: 10, border: `1px solid ${inputBorder}`,
                background: inputBg, color: text, fontSize: 16, outline: 'none', boxSizing: 'border-box',
                lineHeight: 1.5, marginBottom: 16,
              }}
            />

            {bulkResult && (
              <div style={{ fontSize: 13, marginBottom: 12, color: bulkResult.failed > 0 ? '#d97706' : '#16a34a', fontWeight: 700 }}>
                Sent to {bulkResult.sent}{bulkResult.failed > 0 ? `, failed ${bulkResult.failed}` : ''}.
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexDirection: isMobile ? 'column-reverse' : 'row' }}>
              <button onClick={() => setBulkOpen(false)} style={ghostBtn}>Close</button>
              <button onClick={sendBulk} disabled={bulkSending || withEmail.length === 0 || !bulkSubject} style={{ ...btn(accent), opacity: (withEmail.length === 0 || !bulkSubject) ? 0.5 : 1 }}>{bulkSending ? <Loader2 size={16} className="spin" /> : <Send size={16} />} Send to {withEmail.length} contact{withEmail.length === 1 ? '' : 's'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ItineraryTab(p: any) {
  const { arr, addItem, updateItem, removeItem, cardStyle, inputStyle, ghostBtn, accent, textMuted, textSub, toggle, verifyArrayLinks, aiLoading } = p
  const renderSection = (title: string, icon: React.ReactNode, itemKey: string, itemType: string, defaults: Record<string, any>, fields: string[], toggleKey: string, toggleLabels: [string, string], linkKey?: string) => {
    const items = arr(itemKey)
    const canVerify = linkKey && items.some((it: any) => it[linkKey])
    const verifying = aiLoading === `verify-${itemKey}`
    return (
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 16 }}>{icon} {title} <span style={{ color: textMuted, fontWeight: 400 }}>({items.length})</span></div>
          <div style={{ display: 'flex', gap: 8 }}>
            {canVerify && <button onClick={() => verifyArrayLinks(itemKey, 'name')} disabled={verifying} style={ghostBtn}>{verifying ? <Loader2 size={14} className="spin" /> : <LinkIcon size={14} />} Verify links</button>}
            <button onClick={() => addItem(itemKey, itemType, defaults)} style={ghostBtn}><Plus size={14} /> Add</button>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          {items.map((it: any, idx: number) => (
            <div key={it._key || idx} style={{ padding: 12, borderRadius: 10, background: 'rgba(127,127,127,0.06)', display: 'grid', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input style={{ ...inputStyle, fontWeight: 700 }} defaultValue={it[fields[0]] || ''} placeholder={title} onBlur={(e) => updateItem(itemKey, idx, { [fields[0]]: e.target.value })} />
                <button onClick={() => removeItem(itemKey, idx)} style={{ ...ghostBtn, padding: 8, color: '#ef4444' }}><Trash2 size={14} /></button>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {fields.slice(1).map((f: string) => (
                  <input key={f} style={{ ...inputStyle, flex: '1 1 160px' }} defaultValue={it[f] || ''} placeholder={fieldPlaceholder(f)} onBlur={(e) => updateItem(itemKey, idx, { [f]: e.target.value })} />
                ))}
              </div>
              {linkKey && (
                <div style={{ display: 'grid', gap: 4 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input style={{ ...inputStyle, flex: 1 }} defaultValue={it[linkKey] || ''} placeholder="Website (https://…)" onBlur={(e) => updateItem(itemKey, idx, { [linkKey]: e.target.value.trim(), linkStatus: undefined })} />
                    {it[linkKey] && (
                      <a href={normaliseUrl(it[linkKey])} target="_blank" rel="noreferrer" style={{ ...ghostBtn, padding: 10, color: accent, textDecoration: 'none', flexShrink: 0 }} title="Open website"><ExternalLink size={15} /></a>
                    )}
                  </div>
                  {it.linkStatus && LINK_STATUS_META[it.linkStatus] && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: LINK_STATUS_META[it.linkStatus].color }}>{LINK_STATUS_META[it.linkStatus].label}</span>
                  )}
                </div>
              )}
              {toggleKey && toggle(!!it[toggleKey], () => updateItem(itemKey, idx, { [toggleKey]: !it[toggleKey] }), toggleLabels[0], toggleLabels[1])}
            </div>
          ))}
          {items.length === 0 && <div style={{ color: textMuted, fontSize: 13 }}>Nothing added yet.</div>}
        </div>
      </div>
    )
  }
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {renderSection('Places to visit', <MapPin size={16} color={accent} />, 'places', 'place', { name: '', priority: 'High', visited: false }, ['name', 'placeType', 'location', 'why'], 'visited', ['Visited', 'Mark visited'], 'link')}
      {renderSection('Food to try', <Utensils size={16} color={accent} />, 'food', 'food', { name: '', tried: false }, ['name', 'where', 'notes'], 'tried', ['Tried', 'Mark tried'])}
      {renderSection('Activities', <Ticket size={16} color={accent} />, 'activities', 'activity', { name: '', booked: false }, ['name', 'notes'], 'booked', ['Booked', 'Mark booked'])}
    </div>
  )
}

function WorkStaysTab(p: any) {
  const { trip, arr, addItem, updateItem, removeItem, cardStyle, inputStyle, labelStyle, ghostBtn, btn, accent, textSub, textMuted, text, dark, grid, inputBorder, isMobile, aiFindNearby, aiFindParkups, aiFindWorkstays, aiLoading, verifyArrayLinks, flash } = p
  const allItems: any[] = arr('opportunities')
  const verifying = aiLoading === 'verify-opportunities'

  const PARKUP_TYPES = ['free_parkup', 'paid_stopover']
  const [section, setSection] = useState<'parkups' | 'work'>('parkups')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  // Ordered legs (if any) so a park-up can optionally be tied to a leg.
  const legs: ItineraryLeg[] = orderLegs(arr('itinerary'))
  const legLabel = (key?: string) => legs.find((l) => l._key === key)?.label || ''

  // ── Task 13.1 — Add-a-Park4Night paste form (R4.1, 4.2, 4.7, 4.8) ──
  // User-entered (NOT AI) → no Verify flag. Optimised for pasting a Park4Night
  // URL plus an optional "lat,lng" and a few optional fields. Saves via addItem
  // (which assigns the _key); link mirrors into both link + p4nUrl. Coordinates
  // are only attached when BOTH halves of the "lat,lng" parse as finite numbers
  // — a park-up saves fine with a link and no coords.
  const emptyPaste = { name: '', url: '', coords: '', rating: '', facilities: '', cost: '', notes: '', priorityLevel: 'Medium', legKey: '' }
  const [paste, setPaste] = useState<typeof emptyPaste>({ ...emptyPaste })
  const setPasteField = (patch: Partial<typeof emptyPaste>) => setPaste((p0) => ({ ...p0, ...patch }))

  const addPastedParkup = () => {
    const url = paste.url.trim()
    const name = paste.name.trim() || 'Park4Night spot'
    // Parse an optional "lat,lng" — attach coordinates only when both are finite.
    let coordinates: any = undefined
    const parts = paste.coords.split(',').map((s) => parseFloat(s.trim()))
    if (parts.length === 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
      coordinates = { _type: 'geopoint', lat: parts[0], lng: parts[1] }
    }
    const opp: any = {
      name,
      oppType: 'free_parkup',
      platform: 'Park4Night',
      priorityLevel: paste.priorityLevel || 'Medium',
      status: 'to_research',
    }
    if (url) { opp.link = normaliseUrl(url); opp.p4nUrl = normaliseUrl(url) }
    if (paste.rating.trim()) opp.rating = paste.rating.trim()
    if (paste.facilities.trim()) opp.facilities = paste.facilities.trim()
    if (paste.cost.trim()) opp.cost = paste.cost.trim()
    if (paste.notes.trim()) opp.description = paste.notes.trim()
    if (paste.legKey) opp.legKey = paste.legKey
    if (coordinates) opp.coordinates = coordinates
    addItem('opportunities', 'opportunity', opp)
    setPaste({ ...emptyPaste })
    flash?.(coordinates ? 'Park-up added with location' : 'Park-up added')
  }

  // ── Task 13.2 — Scenic park-up suggester (R4.3, 4.5, 4.6, 4.7, 4.8) ──
  // Local fetch mirroring how CalendarTab calls its scenic action. Results live
  // in local state until the user clicks Add, which maps via parkupToOpportunity
  // (aiSuggested:true, platform 'Park4Night') and inserts via addItem. Coords
  // only come from the server geocode (lat/lng on the result).
  const [parkupLoading, setParkupLoading] = useState(false)
  const [scenicParkups, setScenicParkups] = useState<any[]>([])
  const findScenicParkups = async () => {
    if (!trip) return
    setParkupLoading(true)
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ai-find-scenic-parkups', country: trip.country, region: trip.region, trip }),
      })
      const data = await res.json()
      const parkups = Array.isArray(data.parkups) ? data.parkups : []
      setScenicParkups(parkups)
      if (parkups.length === 0) flash?.(data.error || 'No scenic park-ups found')
    } catch (e: any) {
      flash?.(e?.message || 'AI failed')
    } finally {
      setParkupLoading(false)
    }
  }

  const addScenicParkup = (result: any) => {
    const coords = (Number.isFinite(result.lat) && Number.isFinite(result.lng))
      ? { lat: result.lat, lng: result.lng }
      : undefined
    const mapped = parkupToOpportunity(result, undefined, coords)
    const opp: any = { ...mapped }
    if (coords) opp.coordinates = { _type: 'geopoint', lat: coords.lat, lng: coords.lng }
    addItem('opportunities', 'opportunity', opp)
    flash?.(`Added ${mapped.name}`)
  }

  // Confirm-to-real: attach a real Park4Night link to an AI-suggested park-up,
  // setting link + p4nUrl and clearing the aiSuggested flag (now verified).
  const confirmWithLink = (idx: number, raw: string) => {
    const v = raw.trim()
    if (!v) return
    updateItem('opportunities', idx, { link: normaliseUrl(v), p4nUrl: normaliseUrl(v), aiSuggested: false })
    flash?.('Confirmed with Park4Night link')
  }

  // Shared "AI · verify" provenance badge for AI-suggested park-ups.
  const verifyBadge = (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#d9770622', color: '#d97706' }}>AI · verify</span>
  )

  // Add an opportunity to the trip's places array so it appears on the Route
  // Map with the right category (Park-up → teal, Work-stay → brown). Only
  // called when the item has finite coordinates.
  const addToMap = (it: any) => {
    const c = coordsOf(it.coordinates)
    if (!c) return
    addItem('places', 'place', {
      name: it.name,
      placeType: PARKUP_TYPES.includes(it.oppType) ? 'Park-up' : 'Work-stay',
      location: it.location || '',
      why: it.description || it.exchange || '',
      link: it.link || undefined,
      coordinates: it.coordinates,
      priority: 'High',
      visited: false,
    })
    flash?.('Added to map')
  }

  const statusColor = (s: string) => (s === 'confirmed' ? '#16a34a' : s === 'applied' ? '#d97706' : s === 'declined' ? '#ef4444' : accent)
  // Map an item to its real index in the full array (so edits/removes target the right row)
  const realIndex = (item: any) => allItems.findIndex((x) => x._key === item._key)

  const inSection = allItems.filter((it) => section === 'parkups' ? PARKUP_TYPES.includes(it.oppType) : !PARKUP_TYPES.includes(it.oppType))
  const filtered = inSection.filter((it) => statusFilter === 'all' || (it.status || 'to_research') === statusFilter)
  const parkupCount = allItems.filter((it) => PARKUP_TYPES.includes(it.oppType)).length
  const workCount = allItems.length - parkupCount

  const chip = (active: boolean): React.CSSProperties => ({
    ...ghostBtn, padding: '6px 12px', minHeight: 34, fontSize: 13,
    borderColor: active ? accent : inputBorder, color: active ? accent : textSub, background: active ? `${accent}18` : 'transparent',
  })

  const fmtDate = (d?: string) => {
    if (!d) return ''
    const v = parseYmd(d)
    if (!v) return ''
    const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${v.d} ${MON[v.m - 1]}`
  }
  const dateRange = (it: any) => {
    if (it.startDate && it.endDate) return `${fmtDate(it.startDate)} – ${fmtDate(it.endDate)}`
    if (it.startDate) return `From ${fmtDate(it.startDate)}`
    if (it.bestMonths) return it.bestMonths
    return ''
  }

  const defaults = section === 'parkups'
    ? { name: '', oppType: 'free_parkup', status: 'to_research' }
    : { name: '', oppType: 'work_exchange', status: 'to_research' }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Two focused AI finders — park-ups vs work-stays (stack on mobile) */}
      <div style={{ display: 'flex', gap: 12, flexDirection: isMobile ? 'column' : 'row' }}>
        {/* Park-ups finder */}
        <div style={{ ...cardStyle, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 20 }}>🅿️</span> Find park-ups</div>
          <div style={{ fontSize: 13, color: textSub, margin: '6px 0 14px', flex: 1 }}>Overnight spots for the van — free aires, paid stopovers, coastal park-ups. Added spots can be pinned to the map.</div>
          <button onClick={aiFindParkups} disabled={aiLoading === 'parkups'} style={{ ...btn('#14b8a6'), width: '100%' }}>{aiLoading === 'parkups' ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />} Find park-ups</button>
          <button onClick={aiFindNearby} disabled={aiLoading === 'nearby'} style={{ ...ghostBtn, width: '100%', marginTop: 8 }}>{aiLoading === 'nearby' ? <Loader2 size={14} className="spin" /> : <Navigation size={14} />} Find near me</button>
          <div style={{ fontSize: 12, color: textMuted, marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}><Check size={12} /> Adds to your list — never overwrites.</div>
          {aiLoading === 'parkups' && <AiProgress label="Finding park-ups…" />}
        </div>
        {/* Work-stays finder */}
        <div style={{ ...cardStyle, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 20 }}>🧑‍🌾</span> Find work-stays</div>
          <div style={{ fontSize: 13, color: textSub, margin: '6px 0 14px', flex: 1 }}>Work in exchange for a free pitch &amp;/or meals — WWOOF farms, Workaway hosts, volunteering.</div>
          <button onClick={aiFindWorkstays} disabled={aiLoading === 'workstays'} style={{ ...btn('#a16207'), width: '100%' }}>{aiLoading === 'workstays' ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />} Find work-stays</button>
          <div style={{ fontSize: 12, color: textMuted, marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}><Check size={12} /> Adds to your list — never overwrites.</div>
          {aiLoading === 'workstays' && <AiProgress label="Finding work-stays…" />}
        </div>
      </div>

      {/* ── Task 13.1 — Add a Park4Night park-up (paste form) ── */}
      <div style={cardStyle}>
        <div style={{ fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 20 }}>🅿️</span> Add a Park4Night park-up</div>
        <div style={{ fontSize: 13, color: textSub, margin: '6px 0 14px' }}>Paste a Park4Night link and (optionally) coordinates. A park-up saves fine with just a link — add the location later if you like.</div>
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={grid(2)}>
            <div><label style={labelStyle}>Name</label><input style={inputStyle} value={paste.name} placeholder="Park4Night spot" onChange={(e) => setPasteField({ name: e.target.value })} /></div>
            <div><label style={labelStyle}>Park4Night link</label><input style={inputStyle} value={paste.url} placeholder="https://park4night.com/…" onChange={(e) => setPasteField({ url: e.target.value })} /></div>
          </div>
          <div><label style={labelStyle}>Coordinates (optional — &ldquo;lat,lng&rdquo;)</label><input style={inputStyle} value={paste.coords} placeholder="43.1234, 5.6789" onChange={(e) => setPasteField({ coords: e.target.value })} /></div>
          <div style={grid(3)}>
            <div><label style={labelStyle}>Rating</label><input style={inputStyle} value={paste.rating} placeholder="4.5" onChange={(e) => setPasteField({ rating: e.target.value })} /></div>
            <div><label style={labelStyle}>Facilities</label><input style={inputStyle} value={paste.facilities} placeholder="Water, toilets" onChange={(e) => setPasteField({ facilities: e.target.value })} /></div>
            <div><label style={labelStyle}>Cost</label><input style={inputStyle} value={paste.cost} placeholder="Free, €12/night" onChange={(e) => setPasteField({ cost: e.target.value })} /></div>
          </div>
          <div><label style={labelStyle}>Scenic notes</label><textarea style={{ ...inputStyle, minHeight: 44, resize: 'vertical', fontFamily: 'inherit' }} value={paste.notes} placeholder="Why it's worth a stop" onChange={(e) => setPasteField({ notes: e.target.value })} /></div>
          <div style={grid(2)}>
            <div>
              <label style={labelStyle}>Priority</label>
              <select style={inputStyle} value={paste.priorityLevel} onChange={(e) => setPasteField({ priorityLevel: e.target.value })}>
                <option value="Must-do">Must-do</option>
                <option value="Medium">Medium</option>
                <option value="Optional">Optional</option>
              </select>
            </div>
            {legs.length > 0 && (
              <div>
                <label style={labelStyle}>Tie to leg (optional)</label>
                <select style={inputStyle} value={paste.legKey} onChange={(e) => setPasteField({ legKey: e.target.value })}>
                  <option value="">— None —</option>
                  {legs.map((l) => <option key={l._key} value={l._key}>{l.label || 'Untitled leg'}</option>)}
                </select>
              </div>
            )}
          </div>
          <button onClick={addPastedParkup} style={{ ...btn('#14b8a6'), width: isMobile ? '100%' : undefined }}><Plus size={16} /> Add park-up</button>
        </div>
      </div>

      {/* ── Task 13.2 — Find scenic park-ups (AI) ── */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
          <div style={{ fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Sparkles size={16} color={accent} /> Find scenic park-ups (AI)</div>
          {verifyBadge}
        </div>
        <div style={{ fontSize: 13, color: textSub, margin: '0 0 12px' }}>Suggested scenic overnight spots for this trip. Add one to your list, then confirm it with a real Park4Night entry.</div>
        <button onClick={findScenicParkups} disabled={parkupLoading || !trip} style={{ ...btn('#14b8a6'), width: isMobile ? '100%' : undefined }}>
          {parkupLoading ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />} Find scenic park-ups
        </button>
        {parkupLoading && <AiProgress label="Finding scenic park-ups…" />}
        {scenicParkups.length > 0 && (
          <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
            {scenicParkups.map((r, i) => {
              const isLead = typeof r.name === 'string' && r.name.startsWith('Search for: ')
              return (
                <div key={`${r.name}-${i}`} style={{ border: `1px solid ${inputBorder}`, borderRadius: 12, padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: isLead ? textMuted : text, fontStyle: isLead ? 'italic' : 'normal' }}>{r.name}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#d9770622', color: '#d97706' }}>AI · verify — confirm with a real Park4Night entry</span>
                        {isLead && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: 'rgba(127,127,127,0.15)', color: textMuted }}>lead</span>}
                      </div>
                      {r.location && <div style={{ fontSize: 12, color: textSub, marginTop: 3 }}>{r.location}</div>}
                      {(r.description || r.scenicNote) && <div style={{ fontSize: 12, color: textSub, marginTop: 4 }}>{r.description || r.scenicNote}</div>}
                      <div style={{ fontSize: 12, color: textMuted, marginTop: 4, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {r.cost && <span>💷 {r.cost}</span>}
                        {r.rating && <span>⭐ {r.rating}</span>}
                        {r.facilities && <span>🚿 {r.facilities}</span>}
                        {r.bestMonths && <span>📅 {r.bestMonths}</span>}
                      </div>
                    </div>
                    <button onClick={() => addScenicParkup(r)} style={{ ...btn('#14b8a6'), minHeight: 36, padding: '7px 12px', fontSize: 13 }}><Plus size={14} /> Add</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Sub-header: park-ups vs work */}
      <div style={{ display: 'flex', gap: 8, background: dark ? '#141414' : '#efe9e1', padding: 4, borderRadius: 12 }}>
        <button onClick={() => { setSection('parkups'); setStatusFilter('all') }} style={{ flex: 1, padding: '10px 12px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, background: section === 'parkups' ? accent : 'transparent', color: section === 'parkups' ? '#fff' : textSub, minHeight: 42 }}>🅿️ Park-ups ({parkupCount})</button>
        <button onClick={() => { setSection('work'); setStatusFilter('all') }} style={{ flex: 1, padding: '10px 12px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, background: section === 'work' ? accent : 'transparent', color: section === 'work' ? '#fff' : textSub, minHeight: 42 }}>🧑‍🌾 Work &amp; stays ({workCount})</button>
      </div>

      {/* Filters + actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={() => setStatusFilter('all')} style={chip(statusFilter === 'all')}>All</button>
          {OPPORTUNITY_STATUSES.map((s) => <button key={s.value} onClick={() => setStatusFilter(s.value)} style={chip(statusFilter === s.value)}>{s.label}</button>)}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {inSection.some((it) => it.link || it.platform) && <button onClick={() => verifyArrayLinks('opportunities', 'platform')} disabled={verifying} style={ghostBtn} title="Verify links and fill in missing platform links">{verifying ? <Loader2 size={14} className="spin" /> : <LinkIcon size={14} />} Fix links</button>}
          <button onClick={() => { const i = allItems.length; addItem('opportunities', 'opportunity', defaults); setExpanded(`new-${i}`) }} style={ghostBtn}><Plus size={14} /> Add</button>
        </div>
      </div>

      {/* List */}
      <div style={{ display: 'grid', gap: 10 }}>
        {filtered.length === 0 && (
          <div style={{ ...cardStyle, textAlign: 'center', color: textMuted, padding: 36 }}>
            <Tent size={26} style={{ opacity: 0.5, marginBottom: 8 }} />
            <p style={{ margin: 0 }}>{allItems.length === 0 ? 'Nothing yet — use Find in region or Find near me.' : 'None match this filter.'}</p>
          </div>
        )}
        {filtered.map((it: any) => {
          const idx = realIndex(it)
          const isOpen = expanded === it._key
          const range = dateRange(it)
          return (
            <div key={it._key} style={cardStyle}>
              {/* Compact header — tap to expand */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, cursor: 'pointer', alignItems: 'flex-start' }} onClick={() => setExpanded(isOpen ? null : it._key)}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{it.name || 'Untitled'}</span>
                    {it.aiSuggested && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#d9770622', color: '#d97706' }}>AI · verify</span>}
                    {it.nearMe && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#0ea5e922', color: '#0ea5e9', display: 'inline-flex', alignItems: 'center', gap: 3 }}><Navigation size={9} /> Near me</span>}
                  </div>
                  <div style={{ fontSize: 12, color: textSub, marginTop: 3 }}>{[labelFor(OPPORTUNITY_TYPES, it.oppType), it.location].filter(Boolean).join(' · ')}</div>
                  {/* Quick facts */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6, fontSize: 12, color: textMuted }}>
                    {it.cost && <span>💷 {it.cost}</span>}
                    {it.maxStay && <span>⏱ {it.maxStay}</span>}
                    {it.rating && <span>⭐ {it.rating}</span>}
                    {range && <span>📅 {range}</span>}
                    {it.facilities && <span>🚿 {it.facilities}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: `${statusColor(it.status)}22`, color: statusColor(it.status) }}>{labelFor(OPPORTUNITY_STATUSES, it.status)}</span>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {coordsOf(it.coordinates) ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); addToMap(it) }}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8,
                          border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, minHeight: 34,
                          background: PARKUP_TYPES.includes(it.oppType) ? '#14b8a6' : '#a16207', color: '#fff',
                        }}
                        title="Add this to the Route Map"
                      ><MapPin size={14} /> Add to map</button>
                    ) : (
                      <span style={{ fontSize: 11, color: textMuted }}>No location</span>
                    )}
                    {it.link && <a onClick={(e) => e.stopPropagation()} href={normaliseUrl(it.link)} target="_blank" rel="noreferrer" style={{ ...ghostBtn, padding: 8, color: accent, textDecoration: 'none' }} title="Open link"><ExternalLink size={15} /></a>}
                  </div>
                </div>
              </div>

              {/* Expanded editor */}
              {isOpen && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${inputBorder}`, display: 'grid', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input style={{ ...inputStyle, fontWeight: 700 }} defaultValue={it.name || ''} placeholder="Name" onBlur={(e) => updateItem('opportunities', idx, { name: e.target.value })} />
                    <button onClick={() => { if (confirm('Remove this?')) removeItem('opportunities', idx) }} style={{ ...ghostBtn, padding: 8, color: '#ef4444' }}><Trash2 size={14} /></button>
                  </div>
                  <div style={grid(2)}>
                    <div><label style={labelStyle}>Type</label><select style={inputStyle} value={it.oppType || 'work_exchange'} onChange={(e) => updateItem('opportunities', idx, { oppType: e.target.value })}>{OPPORTUNITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
                    <div><label style={labelStyle}>Status</label><select style={inputStyle} value={it.status || 'to_research'} onChange={(e) => updateItem('opportunities', idx, { status: e.target.value })}>{OPPORTUNITY_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
                    <div><label style={labelStyle}>Platform / source</label><input style={inputStyle} defaultValue={it.platform || ''} placeholder="Workaway, Park4Night..." onBlur={(e) => updateItem('opportunities', idx, { platform: e.target.value })} /></div>
                    <div><label style={labelStyle}>Location / area</label><input style={inputStyle} defaultValue={it.location || ''} placeholder="Area" onBlur={(e) => updateItem('opportunities', idx, { location: e.target.value })} /></div>
                  </div>
                  <label style={labelStyle}>Description</label>
                  <textarea style={{ ...inputStyle, minHeight: 44, resize: 'vertical' }} defaultValue={it.description || ''} onBlur={(e) => updateItem('opportunities', idx, { description: e.target.value })} />

                  {section === 'parkups' ? (
                    <div style={grid(2)}>
                      <div><label style={labelStyle}>Cost</label><input style={inputStyle} defaultValue={it.cost || ''} placeholder="Free, €12/night..." onBlur={(e) => updateItem('opportunities', idx, { cost: e.target.value })} /></div>
                      <div><label style={labelStyle}>Max stay</label><input style={inputStyle} defaultValue={it.maxStay || ''} placeholder="48 hrs, 3 nights" onBlur={(e) => updateItem('opportunities', idx, { maxStay: e.target.value })} /></div>
                      <div><label style={labelStyle}>Facilities</label><input style={inputStyle} defaultValue={it.facilities || ''} placeholder="Water, toilets, waste" onBlur={(e) => updateItem('opportunities', idx, { facilities: e.target.value })} /></div>
                      <div><label style={labelStyle}>Rating</label><input style={inputStyle} defaultValue={it.rating || ''} placeholder="4.5 on Park4Night" onBlur={(e) => updateItem('opportunities', idx, { rating: e.target.value })} /></div>
                    </div>
                  ) : (
                    <>
                      <label style={labelStyle}>What you give / get</label>
                      <textarea style={{ ...inputStyle, minHeight: 44, resize: 'vertical' }} defaultValue={it.exchange || ''} placeholder="e.g. 4 hrs/day help for a free pitch + evening meal" onBlur={(e) => updateItem('opportunities', idx, { exchange: e.target.value })} />
                    </>
                  )}

                  <div style={grid(3)}>
                    <div><label style={labelStyle}>From</label><input type="date" style={inputStyle} defaultValue={it.startDate || ''} onBlur={(e) => updateItem('opportunities', idx, { startDate: e.target.value })} /></div>
                    <div><label style={labelStyle}>To</label><input type="date" style={inputStyle} defaultValue={it.endDate || ''} onBlur={(e) => updateItem('opportunities', idx, { endDate: e.target.value })} /></div>
                    <div><label style={labelStyle}>Best time</label><input style={inputStyle} defaultValue={it.bestMonths || ''} placeholder="Apr–Oct" onBlur={(e) => updateItem('opportunities', idx, { bestMonths: e.target.value })} /></div>
                  </div>

                  <label style={labelStyle}>Contact (email / phone)</label>
                  <input style={inputStyle} defaultValue={it.contact || ''} placeholder="Optional" onBlur={(e) => updateItem('opportunities', idx, { contact: e.target.value })} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={labelStyle}>Link</label>
                    {it.linkStatus && LINK_STATUS_META[it.linkStatus] && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: LINK_STATUS_META[it.linkStatus].color }}>{LINK_STATUS_META[it.linkStatus].label}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input style={{ ...inputStyle, flex: 1 }} defaultValue={it.link || ''} placeholder="https://…" onBlur={(e) => updateItem('opportunities', idx, { link: e.target.value.trim(), linkStatus: undefined })} />
                    {it.link && <a href={normaliseUrl(it.link)} target="_blank" rel="noreferrer" style={{ ...ghostBtn, padding: 10, color: accent, textDecoration: 'none', flexShrink: 0 }} title="Open link"><ExternalLink size={15} /></a>}
                  </div>

                  {/* Confirm-to-real: AI-suggested park-ups get an inline way to
                      attach a real Park4Night link, which sets link + p4nUrl and
                      clears the Verify flag (R4.5, R4.6). */}
                  {it.aiSuggested && (
                    <div style={{ marginTop: 4, padding: 10, borderRadius: 10, border: `1px dashed ${inputBorder}`, background: dark ? '#1a1510' : '#fbf6ee' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#d9770622', color: '#d97706' }}>AI · verify</span>
                        <span style={{ fontSize: 12, color: textSub }}>Confirm with a real Park4Night entry</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                          id={`confirm-${it._key}`}
                          style={{ ...inputStyle, flex: 1, minWidth: 180 }}
                          placeholder="Paste the real Park4Night link…"
                          onKeyDown={(e) => { if (e.key === 'Enter') { confirmWithLink(idx, (e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = '' } }}
                        />
                        <button
                          onClick={() => { const el = document.getElementById(`confirm-${it._key}`) as HTMLInputElement | null; if (el) { confirmWithLink(idx, el.value); el.value = '' } }}
                          style={{ ...btn('#16a34a'), minHeight: 40, padding: '8px 12px', fontSize: 13, flexShrink: 0 }}
                        ><Check size={14} /> Confirm</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Format a 'YYYY-MM-DD' string for display without timezone drift (parse arithmetically)
const fmtLegDate = (d?: string) => {
  if (!d) return ''
  const v = parseYmd(d)
  if (!v) return d
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${v.d} ${MONTHS[v.m - 1]} ${v.y}`
}
const fmtLegRange = (leg: ItineraryLeg) => {
  const start = leg.startDate ? fmtLegDate(leg.startDate) : ''
  const end = leg.endDate && leg.endDate !== leg.startDate ? fmtLegDate(leg.endDate) : ''
  if (start && end) return `${start} – ${end}`
  return start
}
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const TRAVEL_MODES_LIST = [
  { value: 'drive', label: 'Drive' }, { value: 'ferry', label: 'Ferry' },
  { value: 'flight', label: 'Flight' }, { value: 'train', label: 'Train' },
  { value: 'other', label: 'Other' },
]

// Leg priority: distinguishes must-do stops from optional ones (R1.2, R1.10).
// Unset = unspecified (no badge, no forced default — never reorders anything).
const LEG_PRIORITIES = [
  { value: '', label: 'Unspecified' },
  { value: 'Must-do', label: 'Must-do' },
  { value: 'Optional', label: 'Optional' },
]
// A small badge for a leg's priority. Must-do uses a subtle accent tint;
// Optional is visually de-emphasised (muted, lower opacity) so optional stops
// read as clearly distinct. Returns null when no priority is set.
const legPriorityBadge = (priorityLevel: string | undefined, accent: string, textMuted: string): React.ReactNode => {
  const v = (priorityLevel || '').trim()
  if (!v) return null
  const isOptional = v.toLowerCase() === 'optional'
  const style: React.CSSProperties = isOptional
    ? { fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: `${textMuted}1f`, color: textMuted, opacity: 0.75 }
    : { fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: `${accent}22`, color: accent }
  return <span style={style}>{v}</span>
}

// Pull a { lat, lng } out of a Sanity geopoint-ish object, or undefined
const coordsOf = (c: any): { lat: number; lng: number } | undefined =>
  c && Number.isFinite(c.lat) && Number.isFinite(c.lng) ? { lat: c.lat, lng: c.lng } : undefined

// ── Route Map: a full-trip interactive Mapbox view ───────────────────
// Draws the ordered itinerary as a route line with numbered leg pins, plus
// smaller pins for saved "best" places. Reuses the CDN loader + draw-scheduling
// patterns from the Calendar tab's drive-range map.
function RouteMapTab(p: any) {
  const {
    trip, arr, addItem, flash,
    cardStyle, ghostBtn, btn,
    accent, textSub, textMuted, text, dark, inputBorder, isMobile,
  } = p

  // Ordered legs that have usable coordinates, and saved places with coords.
  const legs = orderLegs(arr('itinerary')).filter((l: ItineraryLeg) => coordsOf(l.coordinates))
  const places = arr('places').filter((pl: any) => coordsOf(pl.coordinates))

  const [mapLoaded, setMapLoaded] = useState(false)
  const [showPlaces, setShowPlaces] = useState(true)
  const [activeCats, setActiveCats] = useState<Set<string>>(() => new Set(PLACE_CATEGORIES.map((c) => c.key)))
  const mapContainer = useRef<any>(null)
  const mapRef = useRef<any>(null)

  // ── AI place search (free-text) ──────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  // Suggestion chips derived from the itinerary's countries (deduped) plus a
  // few generic prompts. Capped so the row stays tidy.
  const suggestionChips = (() => {
    const countries = Array.from(
      new Set(arr('itinerary').map((l: any) => (l?.country || '').toString().trim()).filter(Boolean))
    ) as string[]
    const chips: string[] = []
    countries.forEach((c) => {
      chips.push(`Food in ${c}`, `Diving in ${c}`, `Hidden gems in ${c}`)
    })
    chips.push('Best sunset viewpoints', 'Free park-ups nearby', 'Historical ruins')
    return chips.slice(0, 12)
  })()

  const runSearch = async (q?: string) => {
    const query = (q ?? searchQuery).trim()
    if (!query) return
    setSearching(true)
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ai-search-places', query, trip }),
      })
      const data = await res.json()
      setSearchResults(Array.isArray(data.places) ? data.places : [])
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const addSearchResult = (r: any) => {
    addItem('places', 'place', {
      name: r.name,
      placeType: r.placeType,
      location: r.location,
      why: r.why,
      link: r.link,
      coordinates: { _type: 'geopoint', lat: r.lat, lng: r.lng },
      priority: 'High',
      visited: false,
    })
    flash(`Added "${r.name}" to the map`)
  }

  // Stable signature of the active category filter so the draw effect re-runs
  // (with a fresh closure + `done` flag) whenever the filter changes.
  const catSig = Array.from(activeCats).sort().join(',')

  // A compact signature of the leg coordinates so the draw effect re-runs when
  // legs are reordered / moved without depending on the array identity.
  const legSig = legs.map((l: ItineraryLeg) => { const c = coordsOf(l.coordinates)!; return `${c.lng},${c.lat}` }).join('|')
  const placeSig = places.map((pl: any) => { const c = coordsOf(pl.coordinates)!; return `${c.lng},${c.lat}` }).join('|')
  const diarySig = arr('diary').map((dd: any) => { const c = coordsOf(dd.coordinates); return c ? `${c.lng},${c.lat}` : '' }).join('|')

  // Lazy-load Mapbox GL JS + CSS from CDN (keeps the tab light until opened).
  useEffect(() => {
    if (!MAPBOX_PUBLIC_TOKEN) return
    if ((window as any).mapboxgl) { setMapLoaded(true); return }
    if (document.getElementById('mapbox-gl-css')) { setMapLoaded(true); return }
    const link = document.createElement('link'); link.id = 'mapbox-gl-css'; link.rel = 'stylesheet'; link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.css'; document.head.appendChild(link)
    const script = document.createElement('script'); script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.js'; script.onload = () => setMapLoaded(true); document.head.appendChild(script)
  }, [])

  // Create the map once the library is ready. Re-creates on dark toggle so the
  // base style matches the theme.
  useEffect(() => {
    if (!mapLoaded || !mapContainer.current || mapRef.current || !MAPBOX_PUBLIC_TOKEN) return
    const mapboxgl = (window as any).mapboxgl; if (!mapboxgl) return
    mapboxgl.accessToken = MAPBOX_PUBLIC_TOKEN
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: dark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11',
      center: [-1.5, 52.5],
      zoom: 4.5,
    })
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [mapLoaded, dark])

  // Draw the route line + pins and fit the view to everything on screen.
  useEffect(() => {
    const map = mapRef.current
    const mapboxgl = (window as any).mapboxgl
    if (!map || !mapboxgl || !mapLoaded) return

    const draw = () => {
      // Clear the previous route layers + any pins we added.
      if (map.getLayer('route-road')) map.removeLayer('route-road')
      if (map.getLayer('route-sea')) map.removeLayer('route-sea')
      // Guard against a leftover single-layer route from the old build.
      if (map.getLayer('route-line')) map.removeLayer('route-line')
      if (map.getSource('route-line')) map.removeSource('route-line')
      document.querySelectorAll('.route-marker').forEach((el: any) => el.remove())

      // ROUTE LINE — one segment per consecutive pair of legs, tagged 'sea' when
      // you ARRIVE at the next leg by ferry, otherwise 'road'. Drives render as a
      // solid orange line; ferry crossings as a dashed blue line.
      if (legs.length >= 2) {
        const segments = {
          type: 'FeatureCollection' as const,
          features: [] as any[],
        }
        for (let i = 0; i < legs.length - 1; i++) {
          const a = coordsOf(legs[i].coordinates)
          const b = coordsOf(legs[i + 1].coordinates)
          if (!a || !b) continue
          segments.features.push({
            type: 'Feature',
            properties: { mode: legs[i + 1].travelModeIn === 'ferry' ? 'sea' : 'road' },
            geometry: { type: 'LineString', coordinates: [[a.lng, a.lat], [b.lng, b.lat]] },
          })
        }
        if (segments.features.length > 0) {
          map.addSource('route-line', { type: 'geojson', data: segments })
          map.addLayer({
            id: 'route-road', type: 'line', source: 'route-line',
            filter: ['==', ['get', 'mode'], 'road'],
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#d86213', 'line-width': 3, 'line-opacity': 0.85 },
          })
          map.addLayer({
            id: 'route-sea', type: 'line', source: 'route-line',
            filter: ['==', ['get', 'mode'], 'sea'],
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#0ea5e9', 'line-width': 3, 'line-opacity': 0.9, 'line-dasharray': [1, 1.5] },
          })
        }
      }

      // LEG PINS — numbered circular markers in travel order.
      legs.forEach((leg: ItineraryLeg, i: number) => {
        const c = coordsOf(leg.coordinates); if (!c) return
        const el = document.createElement('div'); el.className = 'route-marker'
        el.style.cssText = 'width:26px;height:26px;border-radius:50%;background:#d86213;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:12px;cursor:pointer;'
        el.textContent = String(i + 1)
        const details = [fmtLegRange(leg), leg.country].filter(Boolean).join(' · ')
        const popup = new mapboxgl.Popup({ offset: 16, closeButton: false }).setHTML(
          `<div style="font-family:system-ui;font-size:13px;"><strong>${i + 1}. ${escapeHtml(leg.label || 'Untitled')}</strong>${details ? `<div style="color:#666;margin-top:2px;">${escapeHtml(details)}</div>` : ''}</div>`,
        )
        new mapboxgl.Marker({ element: el }).setLngLat([c.lng, c.lat]).setPopup(popup).addTo(map)
      })

      // PLACE PINS — smaller dots for saved "best" places, colour-coded by
      // category and filtered by the active category set.
      if (showPlaces) {
        places.forEach((pl: any) => {
          const c = coordsOf(pl.coordinates); if (!c) return
          const cat = placeCategory(pl.placeType)
          if (!activeCats.has(cat)) return
          const color = PLACE_CAT_COLOR[cat] || '#6b7280'
          const catLabel = PLACE_CATEGORIES.find((k) => k.key === cat)?.label || 'Other'
          const el = document.createElement('div'); el.className = 'route-marker'
          el.style.cssText = `width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);cursor:pointer;`
          const meta = [catLabel, pl.placeType, pl.why].filter(Boolean).join(' · ')
          const rawLink = typeof pl.link === 'string' ? pl.link.trim() : ''
          const safeLink = /^https?:\/\//i.test(rawLink) ? rawLink : (rawLink && !/^[a-z]+:/i.test(rawLink) ? `https://${rawLink}` : '')
          const linkLine = safeLink
            ? `<div style="margin-top:6px;"><a href="${escapeHtml(safeLink)}" target="_blank" rel="noopener noreferrer" style="color:${color};font-weight:600;text-decoration:none;">Learn more ↗</a></div>`
            : ''
          const popup = new mapboxgl.Popup({ offset: 12, closeButton: false }).setHTML(
            `<div style="font-family:system-ui;font-size:13px;"><strong>${escapeHtml(pl.name || 'Saved place')}</strong>${meta ? `<div style="color:#666;margin-top:2px;">${escapeHtml(meta)}</div>` : ''}${linkLine}</div>`,
          )
          new mapboxgl.Marker({ element: el }).setLngLat([c.lng, c.lat]).setPopup(popup).addTo(map)
        })
      }

      // DIARY PINS — journalled entries that carry a coordinate, pink 📓 markers,
      // gated on the 'diary' category filter.
      if (activeCats.has('diary')) {
        const diaryPins = arr('diary').filter((dd: any) => coordsOf(dd.coordinates))
        diaryPins.forEach((dd: any) => {
          const c = coordsOf(dd.coordinates); if (!c) return
          const color = PLACE_CAT_COLOR['diary'] || '#ec4899'
          const el = document.createElement('div'); el.className = 'route-marker'
          el.style.cssText = `width:13px;height:13px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);cursor:pointer;`
          const dstr = (dd.date || '').toString()
          const meta = [dstr, dd.locationLabel].filter(Boolean).join(' · ')
          const popup = new mapboxgl.Popup({ offset: 12, closeButton: false }).setHTML(
            `<div style="font-family:system-ui;font-size:13px;"><strong>📓 ${escapeHtml(dd.locationLabel || 'Diary entry')}</strong>${meta ? `<div style="color:#666;margin-top:2px;">${escapeHtml(meta)}</div>` : ''}</div>`,
          )
          new mapboxgl.Marker({ element: el }).setLngLat([c.lng, c.lat]).setPopup(popup).addTo(map)
        })
      }
    }

    // Fit the camera to every leg + (shown) place so the whole trip is visible.
    // Split out of draw() so it only fires on the initial ready pass / real data
    // changes — never on plain idle/manual-zoom (which would snap the view back).
    const fitView = () => {
      const allPoints: [number, number][] = legs
        .map((l: ItineraryLeg) => { const c = coordsOf(l.coordinates); return c ? [c.lng, c.lat] as [number, number] : null })
        .filter(Boolean) as [number, number][]
      if (showPlaces) {
        places.forEach((pl: any) => { const c = coordsOf(pl.coordinates); if (c) allPoints.push([c.lng, c.lat]) })
      }
      if (activeCats.has('diary')) {
        arr('diary').forEach((dd: any) => { const c = coordsOf(dd.coordinates); if (c) allPoints.push([c.lng, c.lat]) })
      }
      if (allPoints.length >= 2) {
        const lngs = allPoints.map((c) => c[0]); const lats = allPoints.map((c) => c[1])
        map.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], { padding: isMobile ? 40 : 80, duration: 600 })
      } else if (allPoints.length === 1) {
        map.flyTo({ center: allPoints[0], zoom: 6 })
      }
    }

    // Resilient scheduling. The style loads asynchronously; on a freshly created
    // map `style.load` can be missed, leaving nothing drawn. Draw + fit exactly
    // ONCE the style is ready, then remove the listeners immediately. The `done`
    // flag + listener removal means later 'idle' events (from the fitBounds
    // animation settling, or a manual zoom/pan) never re-trigger draw/fit — which
    // is what caused the view to snap back out of a manual zoom.
    let done = false
    const ready = () => {
      if (done || !mapRef.current || !map.isStyleLoaded()) return
      done = true
      try { draw(); fitView() } catch {}
      map.off('load', ready)
      map.off('idle', ready)
    }
    if (map.isStyleLoaded()) {
      ready()
    } else {
      map.on('load', ready)
      map.on('idle', ready)
    }
    return () => { map.off('load', ready); map.off('idle', ready) }
  }, [legSig, placeSig, diarySig, showPlaces, catSig, mapLoaded, dark, isMobile]) // eslint-disable-line react-hooks/exhaustive-deps

  const legendDot = (color: string, size: number): React.CSSProperties => ({
    display: 'inline-block', width: size, height: size, borderRadius: '50%', background: color,
    border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', verticalAlign: 'middle', marginRight: 6,
  })

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={cardStyle}>
        {/* Header: title + places toggle + legend */}
        <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14, flexDirection: isMobile ? 'column' : 'row' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe size={18} color={accent} />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Route Map</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: textSub }}>
              <span><span style={legendDot(accent, 12)} /> Itinerary stops</span>
              <span><span style={{ display: 'inline-block', width: 16, height: 0, borderTop: '2px solid #d86213', verticalAlign: 'middle', marginRight: 6 }} /> Drive</span>
              <span><span style={{ display: 'inline-block', width: 16, height: 0, borderTop: '2px dashed #0ea5e9', verticalAlign: 'middle', marginRight: 6 }} /> Ferry crossing</span>
            </div>
            {places.length > 0 && (
              <button onClick={() => setShowPlaces((v: boolean) => !v)} style={ghostBtn}>
                {showPlaces ? 'Hide stops' : 'Show stops'}
              </button>
            )}
          </div>
        </div>

        {/* Category filter chips — colour-coded, one per PLACE_CATEGORIES entry. */}
        {places.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {PLACE_CATEGORIES.map((cat) => {
              const active = activeCats.has(cat.key)
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCats((prev: Set<string>) => {
                    const n = new Set(prev)
                    n.has(cat.key) ? n.delete(cat.key) : n.add(cat.key)
                    return n
                  })}
                  title={active ? `Hide ${cat.label}` : `Show ${cat.label}`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '4px 10px', borderRadius: 999, cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, lineHeight: 1,
                    border: `1px solid ${active ? cat.color : inputBorder}`,
                    background: active ? `${cat.color}1a` : 'transparent',
                    color: active ? text : textMuted,
                    opacity: active ? 1 : 0.55,
                    transition: 'opacity 120ms, background 120ms',
                  }}
                >
                  <span style={{ ...legendDot(cat.color, 10), marginRight: 0 }} />
                  <span aria-hidden>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              )
            })}
            <button onClick={() => setActiveCats(new Set(PLACE_CATEGORIES.map((c) => c.key)))} style={{ ...ghostBtn, fontSize: 12, padding: '4px 10px' }}>All</button>
            <button onClick={() => setActiveCats(new Set())} style={{ ...ghostBtn, fontSize: 12, padding: '4px 10px' }}>None</button>
          </div>
        )}

        {/* AI place search — find real places by free-text and pin them to the map. */}
        {MAPBOX_PUBLIC_TOKEN && (legs.length > 0 || places.length > 0) && (
          <div style={{ marginBottom: 14 }}>
            {/* A) Search bar */}
            <div style={{ display: 'flex', gap: 8, flexDirection: isMobile ? 'column' : 'row' }}>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') runSearch() }}
                placeholder="Search for places… e.g. 'hidden beaches in Crete'"
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: 10, minHeight: 40,
                  border: `1px solid ${inputBorder}`, background: 'transparent', color: text, fontSize: 14,
                }}
              />
              <button onClick={() => runSearch()} disabled={searching || !searchQuery.trim()} style={{ ...btn(accent), opacity: searching || !searchQuery.trim() ? 0.6 : 1 }}>
                <Search size={16} /> Search
              </button>
            </div>

            {/* B) Suggestion chips */}
            {suggestionChips.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {suggestionChips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => { setSearchQuery(chip); runSearch(chip) }}
                    disabled={searching}
                    style={{ ...ghostBtn, fontSize: 12, padding: '4px 10px', minHeight: 0 }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {searching && <AiProgress label="Searching…" />}

            {/* C) Results */}
            {searchResults.length > 0 && (
              <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: text }}>{searchResults.length} result{searchResults.length === 1 ? '' : 's'} found</span>
                  <button onClick={() => setSearchResults([])} style={{ ...ghostBtn, fontSize: 12, padding: '4px 10px', minHeight: 0 }}>Clear</button>
                </div>
                {searchResults.map((r, i) => (
                  <div key={i} style={{ border: `1px solid ${inputBorder}`, borderRadius: 12, padding: 12, display: 'flex', gap: 12, alignItems: 'flex-start', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: text }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>
                        {[r.placeType, r.location].filter(Boolean).join(' · ')}
                      </div>
                      {r.why && <div style={{ fontSize: 13, color: textSub, marginTop: 6 }}>{r.why}</div>}
                      {r.link && (
                        <a href={r.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: accent, marginTop: 6, display: 'inline-block', fontWeight: 600 }}>
                          Learn more ↗
                        </a>
                      )}
                    </div>
                    <button onClick={() => addSearchResult(r)} style={{ ...ghostBtn, borderColor: accent, color: accent, whiteSpace: 'nowrap' }}>
                      <Plus size={14} /> Add to map
                    </button>
                  </div>
                ))}
                <div style={{ fontSize: 11, color: textMuted }}>Added places appear on the map next time it redraws.</div>
              </div>
            )}
          </div>
        )}

        {!MAPBOX_PUBLIC_TOKEN ? (
          <div style={{ borderRadius: 10, padding: 12, background: '#d977061a', border: '1px solid #d97706', color: '#b45309', fontSize: 13, fontWeight: 600 }}>
            Interactive map needs NEXT_PUBLIC_MAPBOX_TOKEN
          </div>
        ) : legs.length === 0 && places.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: textMuted, fontSize: 14 }}>
            Add itinerary legs (or saved places) with coordinates to see them on the map.
          </div>
        ) : (
          <>
            <div style={{ position: 'relative' }}>
              <div ref={mapContainer} style={{ width: '100%', height: isMobile ? 420 : 640, borderRadius: 16, overflow: 'hidden', border: `1px solid ${inputBorder}` }} />
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: textMuted }}>
              {legs.length} stop{legs.length === 1 ? '' : 's'} · {places.length} saved place{places.length === 1 ? '' : 's'} · numbered in travel order.
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Escape a string for safe interpolation into Mapbox popup HTML.
function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

// ── Reusable pinned-locations map ────────────────────────────────────
// A self-contained Mapbox map of the trip's itinerary legs (numbered, with the
// drive/ferry route line) plus the saved `place` pins, colour-coded by category
// with a filter. Encapsulates its own map lifecycle so it can be embedded in
// multiple tabs (the full Route Map tab keeps its own copy with AI search; this
// is used to surface the same map inside the Itinerary view). Faithful to the
// RouteMapTab draw/fit logic, minus the search UI.
function RoutePinsMap(p: {
  trip: any
  arr: (key: string) => any[]
  cardStyle: React.CSSProperties
  ghostBtn: React.CSSProperties
  accent: string; textSub: string; textMuted: string; text: string
  dark: boolean; inputBorder: string; isMobile: boolean
  height?: number
}) {
  const { arr, cardStyle, ghostBtn, accent, textSub, textMuted, text, dark, inputBorder, isMobile, height } = p

  const legs = orderLegs(arr('itinerary')).filter((l: ItineraryLeg) => coordsOf(l.coordinates))
  const places = arr('places').filter((pl: any) => coordsOf(pl.coordinates))

  const [mapLoaded, setMapLoaded] = useState(false)
  const [showPlaces, setShowPlaces] = useState(true)
  const [activeCats, setActiveCats] = useState<Set<string>>(() => new Set(PLACE_CATEGORIES.map((c) => c.key)))
  const mapContainer = useRef<any>(null)
  const mapRef = useRef<any>(null)

  const catSig = Array.from(activeCats).sort().join(',')
  const legSig = legs.map((l: ItineraryLeg) => { const c = coordsOf(l.coordinates)!; return `${c.lng},${c.lat}` }).join('|')
  const placeSig = places.map((pl: any) => { const c = coordsOf(pl.coordinates)!; return `${c.lng},${c.lat}` }).join('|')
  const diarySig = arr('diary').map((dd: any) => { const c = coordsOf(dd.coordinates); return c ? `${c.lng},${c.lat}` : '' }).join('|')

  // Lazy-load Mapbox GL JS + CSS from CDN.
  useEffect(() => {
    if (!MAPBOX_PUBLIC_TOKEN) return
    if ((window as any).mapboxgl) { setMapLoaded(true); return }
    if (document.getElementById('mapbox-gl-css')) { setMapLoaded(true); return }
    const link = document.createElement('link'); link.id = 'mapbox-gl-css'; link.rel = 'stylesheet'; link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.css'; document.head.appendChild(link)
    const script = document.createElement('script'); script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.js'; script.onload = () => setMapLoaded(true); document.head.appendChild(script)
  }, [])

  // Create the map once the library is ready (re-create on dark toggle).
  useEffect(() => {
    if (!mapLoaded || !mapContainer.current || mapRef.current || !MAPBOX_PUBLIC_TOKEN) return
    const mapboxgl = (window as any).mapboxgl; if (!mapboxgl) return
    mapboxgl.accessToken = MAPBOX_PUBLIC_TOKEN
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: dark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11',
      center: [-1.5, 52.5],
      zoom: 4.5,
    })
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [mapLoaded, dark])

  // Draw the route line + pins and fit the view.
  useEffect(() => {
    const map = mapRef.current
    const mapboxgl = (window as any).mapboxgl
    if (!map || !mapboxgl || !mapLoaded) return

    const draw = () => {
      if (map.getLayer('route-road')) map.removeLayer('route-road')
      if (map.getLayer('route-sea')) map.removeLayer('route-sea')
      if (map.getLayer('route-line')) map.removeLayer('route-line')
      if (map.getSource('route-line')) map.removeSource('route-line')
      document.querySelectorAll('.route-pins-marker').forEach((el: any) => el.remove())

      if (legs.length >= 2) {
        const segments = { type: 'FeatureCollection' as const, features: [] as any[] }
        for (let i = 0; i < legs.length - 1; i++) {
          const a = coordsOf(legs[i].coordinates)
          const b = coordsOf(legs[i + 1].coordinates)
          if (!a || !b) continue
          segments.features.push({
            type: 'Feature',
            properties: { mode: legs[i + 1].travelModeIn === 'ferry' ? 'sea' : 'road' },
            geometry: { type: 'LineString', coordinates: [[a.lng, a.lat], [b.lng, b.lat]] },
          })
        }
        if (segments.features.length > 0) {
          map.addSource('route-line', { type: 'geojson', data: segments })
          map.addLayer({ id: 'route-road', type: 'line', source: 'route-line', filter: ['==', ['get', 'mode'], 'road'], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#d86213', 'line-width': 3, 'line-opacity': 0.85 } })
          map.addLayer({ id: 'route-sea', type: 'line', source: 'route-line', filter: ['==', ['get', 'mode'], 'sea'], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#0ea5e9', 'line-width': 3, 'line-opacity': 0.9, 'line-dasharray': [1, 1.5] } })
        }
      }

      legs.forEach((leg: ItineraryLeg, i: number) => {
        const c = coordsOf(leg.coordinates); if (!c) return
        const el = document.createElement('div'); el.className = 'route-pins-marker'
        el.style.cssText = 'width:26px;height:26px;border-radius:50%;background:#d86213;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:12px;cursor:pointer;'
        el.textContent = String(i + 1)
        const details = [fmtLegRange(leg), leg.country].filter(Boolean).join(' · ')
        const popup = new mapboxgl.Popup({ offset: 16, closeButton: false }).setHTML(
          `<div style="font-family:system-ui;font-size:13px;"><strong>${i + 1}. ${escapeHtml(leg.label || 'Untitled')}</strong>${details ? `<div style="color:#666;margin-top:2px;">${escapeHtml(details)}</div>` : ''}</div>`,
        )
        new mapboxgl.Marker({ element: el }).setLngLat([c.lng, c.lat]).setPopup(popup).addTo(map)
      })

      if (showPlaces) {
        places.forEach((pl: any) => {
          const c = coordsOf(pl.coordinates); if (!c) return
          const cat = placeCategory(pl.placeType)
          if (!activeCats.has(cat)) return
          const color = PLACE_CAT_COLOR[cat] || '#6b7280'
          const catLabel = PLACE_CATEGORIES.find((k) => k.key === cat)?.label || 'Other'
          const el = document.createElement('div'); el.className = 'route-pins-marker'
          el.style.cssText = `width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);cursor:pointer;`
          const meta = [catLabel, pl.placeType, pl.why].filter(Boolean).join(' · ')
          const popup = new mapboxgl.Popup({ offset: 12, closeButton: false }).setHTML(
            `<div style="font-family:system-ui;font-size:13px;"><strong>${escapeHtml(pl.name || 'Saved place')}</strong>${meta ? `<div style="color:#666;margin-top:2px;">${escapeHtml(meta)}</div>` : ''}</div>`,
          )
          new mapboxgl.Marker({ element: el }).setLngLat([c.lng, c.lat]).setPopup(popup).addTo(map)
        })
      }

      // DIARY PINS — journalled entries that carry a coordinate, pink 📓 markers,
      // gated on the 'diary' category filter.
      if (activeCats.has('diary')) {
        const diaryPins = arr('diary').filter((dd: any) => coordsOf(dd.coordinates))
        diaryPins.forEach((dd: any) => {
          const c = coordsOf(dd.coordinates); if (!c) return
          const color = PLACE_CAT_COLOR['diary'] || '#ec4899'
          const el = document.createElement('div'); el.className = 'route-marker'
          el.style.cssText = `width:13px;height:13px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);cursor:pointer;`
          const dstr = (dd.date || '').toString()
          const meta = [dstr, dd.locationLabel].filter(Boolean).join(' · ')
          const popup = new mapboxgl.Popup({ offset: 12, closeButton: false }).setHTML(
            `<div style="font-family:system-ui;font-size:13px;"><strong>📓 ${escapeHtml(dd.locationLabel || 'Diary entry')}</strong>${meta ? `<div style="color:#666;margin-top:2px;">${escapeHtml(meta)}</div>` : ''}</div>`,
          )
          new mapboxgl.Marker({ element: el }).setLngLat([c.lng, c.lat]).setPopup(popup).addTo(map)
        })
      }
    }

    const fitView = () => {
      const allPoints: [number, number][] = legs
        .map((l: ItineraryLeg) => { const c = coordsOf(l.coordinates); return c ? [c.lng, c.lat] as [number, number] : null })
        .filter(Boolean) as [number, number][]
      if (showPlaces) places.forEach((pl: any) => { const c = coordsOf(pl.coordinates); if (c) allPoints.push([c.lng, c.lat]) })
      if (activeCats.has('diary')) arr('diary').forEach((dd: any) => { const c = coordsOf(dd.coordinates); if (c) allPoints.push([c.lng, c.lat]) })
      if (allPoints.length >= 2) {
        const lngs = allPoints.map((c) => c[0]); const lats = allPoints.map((c) => c[1])
        map.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], { padding: isMobile ? 40 : 80, duration: 600 })
      } else if (allPoints.length === 1) {
        map.flyTo({ center: allPoints[0], zoom: 6 })
      }
    }

    let done = false
    const ready = () => {
      if (done || !mapRef.current || !map.isStyleLoaded()) return
      done = true
      try { draw(); fitView() } catch {}
      map.off('load', ready); map.off('idle', ready)
    }
    if (map.isStyleLoaded()) ready()
    else { map.on('load', ready); map.on('idle', ready) }
    return () => { map.off('load', ready); map.off('idle', ready) }
  }, [legSig, placeSig, diarySig, showPlaces, catSig, mapLoaded, dark, isMobile]) // eslint-disable-line react-hooks/exhaustive-deps

  const legendDot = (color: string, size: number): React.CSSProperties => ({
    display: 'inline-block', width: size, height: size, borderRadius: '50%', background: color,
    border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', verticalAlign: 'middle', marginRight: 6,
  })

  if (!MAPBOX_PUBLIC_TOKEN) {
    return (
      <div style={{ borderRadius: 10, padding: 12, background: '#d977061a', border: '1px solid #d97706', color: '#b45309', fontSize: 13, fontWeight: 600 }}>
        Interactive map needs NEXT_PUBLIC_MAPBOX_TOKEN
      </div>
    )
  }
  if (legs.length === 0 && places.length === 0) {
    return (
      <div style={{ padding: '28px 16px', textAlign: 'center', color: textMuted, fontSize: 14 }}>
        Add itinerary legs (or saved places) with coordinates to see them on the map.
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 12, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: textSub, flexWrap: 'wrap' }}>
          <span><span style={legendDot(accent, 12)} /> Itinerary stops</span>
          <span><span style={{ display: 'inline-block', width: 16, height: 0, borderTop: '2px solid #d86213', verticalAlign: 'middle', marginRight: 6 }} /> Drive</span>
          <span><span style={{ display: 'inline-block', width: 16, height: 0, borderTop: '2px dashed #0ea5e9', verticalAlign: 'middle', marginRight: 6 }} /> Ferry</span>
        </div>
        {places.length > 0 && (
          <button onClick={() => setShowPlaces((v) => !v)} style={{ ...ghostBtn, fontSize: 12, padding: '4px 10px', minHeight: 0 }}>
            {showPlaces ? 'Hide pins' : 'Show pins'}
          </button>
        )}
      </div>

      {showPlaces && places.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {PLACE_CATEGORIES.map((cat) => {
            const active = activeCats.has(cat.key)
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCats((prev) => { const n = new Set(prev); n.has(cat.key) ? n.delete(cat.key) : n.add(cat.key); return n })}
                title={active ? `Hide ${cat.label}` : `Show ${cat.label}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, cursor: 'pointer', fontSize: 12, fontWeight: 600, lineHeight: 1, border: `1px solid ${active ? cat.color : inputBorder}`, background: active ? `${cat.color}1a` : 'transparent', color: active ? text : textMuted, opacity: active ? 1 : 0.55 }}
              >
                <span aria-hidden>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            )
          })}
          <button onClick={() => setActiveCats(new Set(PLACE_CATEGORIES.map((c) => c.key)))} style={{ ...ghostBtn, fontSize: 12, padding: '4px 10px', minHeight: 0 }}>All</button>
          <button onClick={() => setActiveCats(new Set())} style={{ ...ghostBtn, fontSize: 12, padding: '4px 10px', minHeight: 0 }}>None</button>
        </div>
      )}

      <div ref={mapContainer} style={{ width: '100%', height: height ?? (isMobile ? 360 : 480), borderRadius: 16, overflow: 'hidden', border: `1px solid ${inputBorder}` }} />
    </div>
  )
}

// ── Route Guide: a guided, per-leg backbone of the trip ──────────────
// A read-mostly, stop-by-stop assembly of what's already stored on the trip:
// per leg we surface its scenic-road `place` rows, any seasonal warning, and
// its park-up `opportunity` rows — each AI-sourced item flagged "verify" — plus
// jump-to-map / jump-to-calendar buttons that select the leg (R5.1–5.7, 1.10).
function RouteGuideTab(p: any) {
  const {
    arr, cardStyle, ghostBtn,
    accent, textSub, textMuted, text, dark, inputBorder, isMobile,
    setDetailTab, setSelectedLegKey,
  } = p

  const legs: ItineraryLeg[] = orderLegs(arr('itinerary'))
  const allPlaces: any[] = arr('places')
  const allOpps: any[] = arr('opportunities')

  // Park-ups: oppType free/paid stopover OR hosted stays OR a Park4Night entry.
  const PARKUP_TYPES = ['free_parkup', 'paid_stopover', 'host_stay']
  const parkups = allOpps.filter(
    (o: any) => o && (PARKUP_TYPES.includes(o.oppType) || o.platform === 'Park4Night')
  )
  // Scenic roads = places that classify to the 'road' map category.
  const roads = allPlaces.filter((pl: any) => pl && placeCategory(pl.placeType) === 'road')

  // Shared "AI · verify" provenance badge — every AI-sourced item carries it.
  const verifyBadge = (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#d9770622', color: '#d97706' }}>Unverified · confirm before travel</span>
  )

  // Jump to another tab focused on this leg (R5.4).
  const jumpTo = (legKey: string, tab: 'routemap' | 'calendar') => {
    setSelectedLegKey?.(legKey)
    setDetailTab?.(tab)
  }

  // Small section-empty line.
  const emptyLine = (txt: string) => (
    <div style={{ fontSize: 12.5, color: textMuted, fontStyle: 'italic' }}>{txt}</div>
  )

  // Section heading inside a leg card.
  const sectionHead = (icon: React.ReactNode, label: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase', color: textMuted, marginBottom: 6 }}>
      {icon} {label}
    </div>
  )

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Header */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 18 }}>
          <Route size={18} color={accent} /> Route Guide
        </div>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: textSub }}>
          A guided, stop-by-stop view of your trip — scenic roads, seasonal road-safety and park-ups per leg.
        </p>
      </div>

      {legs.length === 0 && (
        <div style={{ ...cardStyle, textAlign: 'center', color: textMuted, padding: 40 }}>
          <Route size={26} style={{ opacity: 0.5, marginBottom: 8 }} />
          <p style={{ margin: 0 }}>No itinerary legs yet — add stops in the Calendar tab to build your route guide.</p>
        </div>
      )}

      {legs.map((leg) => {
        const isOptional = (leg.priorityLevel || '').toLowerCase() === 'optional'
        const months = travelMonthsOf(leg)
        const monthNames = months.map((m) => MONTH_NAMES[m - 1]).filter(Boolean)
        const winter = months.length > 0 && isWinterMonth(months[0])
        const dateLabel = fmtLegRange(leg)

        const legRoads = associatePlacesToLeg(roads, leg, legs)
        const legParkups = associateParkupsToLeg(parkups, leg)
        // The leg's seasonal warning = any associated road carrying a seasonalNote.
        const seasonalRoads = legRoads.filter((r: any) => typeof r.seasonalNote === 'string' && r.seasonalNote.trim() !== '')

        return (
          <div key={leg._key} style={{ ...cardStyle, opacity: isOptional ? 0.82 : 1, borderColor: isOptional ? inputBorder : (cardStyle?.borderColor || inputBorder) }}>
            {/* Leg header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 16, opacity: isOptional ? 0.75 : 1 }}>
                    <MapPin size={15} color={accent} /> {leg.label || 'Untitled'}
                  </span>
                  {legPriorityBadge(leg.priorityLevel, accent, textMuted)}
                </div>
                <div style={{ fontSize: 12.5, color: textSub, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  {leg.country && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Globe size={12} /> {leg.country}</span>}
                  {dateLabel && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><CalendarDays size={12} /> {dateLabel}</span>}
                </div>
                {monthNames.length > 0 && (
                  <div style={{ fontSize: 11.5, color: winter ? '#b45309' : textMuted, marginTop: 3, fontWeight: winter ? 700 : 400 }}>
                    Travel month{monthNames.length > 1 ? 's' : ''}: {monthNames.join(', ')}{winter ? ' · winter — check road safety' : ''}
                  </div>
                )}
              </div>
            </div>

            {/* Sections */}
            <div style={{ display: 'grid', gap: 14, marginTop: 14 }}>
              {/* Scenic roads */}
              <div>
                {sectionHead(<Route size={13} />, 'Scenic roads')}
                {legRoads.length === 0 ? emptyLine('No scenic roads yet') : (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {legRoads.map((road: any, i: number) => {
                      const note = typeof road.seasonalNote === 'string' ? road.seasonalNote.trim() : ''
                      return (
                        <div key={road._key || i} style={{ border: `1px solid ${inputBorder}`, borderRadius: 10, padding: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: 14, color: text }}>{road.name || 'Untitled road'}</span>
                            {road.aiSuggested && verifyBadge}
                          </div>
                          {(road.roadType || road.scenicRating) && (
                            <div style={{ fontSize: 12, color: textSub, marginTop: 3 }}>
                              {[road.roadType, road.scenicRating && `Scenic: ${road.scenicRating}`].filter(Boolean).join(' · ')}
                            </div>
                          )}
                          {note && (
                            <div style={{ marginTop: 6, padding: 8, borderRadius: 8, border: `1px solid ${winter ? '#d97706' : inputBorder}`, background: winter ? '#d9770618' : (dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)') }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
                                <span style={{ fontSize: 10.5, fontWeight: 700, color: winter ? '#b45309' : '#d97706' }}>⚠️ verify before travel</span>
                                {road.safetyCheckedMonth && <span style={{ fontSize: 10.5, color: textMuted }}>(checked for {road.safetyCheckedMonth})</span>}
                              </div>
                              <div style={{ fontSize: 12, color: winter ? text : textSub, whiteSpace: 'pre-line', lineHeight: 1.5, fontWeight: winter ? 600 : 400 }}>{note}</div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Seasonal warning summary */}
              <div>
                {sectionHead(<Sparkles size={13} />, 'Seasonal warning')}
                {seasonalRoads.length === 0
                  ? emptyLine('No seasonal warning yet — use the Calendar tab’s “Check safety” to fetch one')
                  : (
                    <div style={{ fontSize: 12.5, color: winter ? text : textSub }}>
                      {seasonalRoads.length === 1
                        ? `Seasonal note stored for ${seasonalRoads[0].name || 'a road'} on this leg — see above.`
                        : `Seasonal notes stored for ${seasonalRoads.length} roads on this leg — see above.`}
                      {winter && <span style={{ color: '#b45309', fontWeight: 700 }}> Winter travel — confirm closures before you go.</span>}
                    </div>
                  )}
              </div>

              {/* Park-ups */}
              <div>
                {sectionHead(<MapPin size={13} />, 'Park-ups')}
                {legParkups.length === 0 ? emptyLine('No park-ups yet') : (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {legParkups.map((pk: any, i: number) => (
                      <div key={pk._key || i} style={{ border: `1px solid ${inputBorder}`, borderRadius: 10, padding: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: text }}>{pk.name || 'Untitled park-up'}</span>
                          {pk.priorityLevel && legPriorityBadge(pk.priorityLevel, accent, textMuted)}
                          {pk.aiSuggested && verifyBadge}
                        </div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 5, fontSize: 12, color: textMuted }}>
                          {pk.cost && <span>💷 {pk.cost}</span>}
                          {pk.rating && <span>⭐ {pk.rating}</span>}
                          {pk.facilities && <span>🚿 {pk.facilities}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cross-navigation */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14, flexDirection: isMobile ? 'column' : 'row' }}>
              <button onClick={() => jumpTo(leg._key, 'routemap')} style={{ ...ghostBtn, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13 }}>
                <MapPin size={14} /> Open on Route Map <ChevronRight size={13} />
              </button>
              <button onClick={() => jumpTo(leg._key, 'calendar')} style={{ ...ghostBtn, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13 }}>
                <CalendarDays size={14} /> Open on Calendar <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Diary: date-stamped journal of places visited ───────────────────
// A chronological feed of EntryCards + an inline EntryEditor. CRUD rides the
// generic arr/addItem/updateItem/removeItem/saveField helpers; photos upload
// via the upload-image API action and store a Sanity asset ref + cached url.
const todayYmd = () => new Date().toISOString().slice(0, 10)
const fmtDiaryDate = (d?: string) => {
  if (!d) return ''
  const parts = String(d).split('-').map(Number)
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return d
  const [y, m, day] = parts
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${day} ${MON[m - 1]} ${y}`
}

function Stars(p: { value?: number; onChange?: (n: number) => void; size?: number; color: string; muted: string }) {
  const { value = 0, onChange, size = 18, color, muted } = p
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={onChange ? (e) => { e.stopPropagation(); onChange(n) } : undefined}
          style={{ fontSize: size, lineHeight: 1, color: n <= value ? '#f59e0b' : muted, cursor: onChange ? 'pointer' : 'default' }}
          aria-label={onChange ? `Rate ${n}` : undefined}
        >★</span>
      ))}
    </span>
  )
}

function DiaryTab(p: any) {
  const {
    trip, arr, addItem, updateItem, removeItem, flash,
    cardStyle, inputStyle, labelStyle, ghostBtn, btn,
    accent, textSub, textMuted, text, dark, inputBorder, grid, isMobile,
  } = p

  const entries: DiaryEntry[] = arr('diary')
  const legs: any[] = arr('itinerary')
  const places: any[] = arr('places')

  const [sortNewestFirst, setSortNewestFirst] = useState(true)
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const visible = filterAndSortDiary(entries, { tagFilter, fromDate, toDate, sortNewestFirst })

  // Upload a photo file to Sanity via the upload-image action; resolves asset ref + url.
  const uploadPhoto = async (file: File): Promise<{ assetId: string; url: string } | null> => {
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/admin/travel-planner', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok || !data.assetId) { flash?.(data.error || 'Upload failed'); return null }
      return { assetId: data.assetId, url: data.url }
    } catch {
      flash?.('Upload failed — try again'); return null
    }
  }

  const addEntry = (draft: Partial<DiaryEntry>) => {
    addItem('diary', 'diaryEntry', { date: draft.date || todayYmd(), shareable: false, ...draft })
    setCreating(false)
    flash?.('Diary entry added')
  }
  const saveEntry = (idx: number, patch: Partial<DiaryEntry>) => {
    updateItem('diary', idx, patch)
    flash?.('Diary entry saved')
  }
  const deleteEntry = (idx: number) => {
    if (!confirm('Delete this diary entry?')) return
    removeItem('diary', idx)
    setOpenKey(null)
    flash?.('Diary entry deleted')
  }

  const sharedTokens = { cardStyle, inputStyle, labelStyle, ghostBtn, btn, accent, textSub, textMuted, text, dark, inputBorder, grid, isMobile }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Header + controls */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ fontWeight: 800, fontSize: 18, display: 'inline-flex', alignItems: 'center', gap: 8 }}><BookOpen size={18} color={accent} /> Diary</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => setSortNewestFirst((v) => !v)} style={ghostBtn}>{sortNewestFirst ? 'Newest first' : 'Oldest first'}</button>
            <button onClick={() => { setCreating(true); setOpenKey(null) }} style={btn(accent)}><Plus size={16} /> Add entry</button>
          </div>
        </div>
        {/* Filters */}
        {entries.length > 0 && (
          <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button onClick={() => setTagFilter(null)} style={{ ...ghostBtn, fontSize: 12, padding: '4px 10px', minHeight: 0, borderColor: tagFilter === null ? accent : inputBorder, color: tagFilter === null ? accent : textSub }}>All tags</button>
              {DIARY_TAGS.map((t) => (
                <button key={t.value} onClick={() => setTagFilter(t.value)} style={{ ...ghostBtn, fontSize: 12, padding: '4px 10px', minHeight: 0, borderColor: tagFilter === t.value ? accent : inputBorder, color: tagFilter === t.value ? accent : textSub }}>{t.label}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: textMuted }}>From</span>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ ...inputStyle, width: 'auto', fontSize: 14, padding: '6px 10px' }} />
              <span style={{ fontSize: 12, color: textMuted }}>to</span>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ ...inputStyle, width: 'auto', fontSize: 14, padding: '6px 10px' }} />
              {(fromDate || toDate) && <button onClick={() => { setFromDate(''); setToDate('') }} style={{ ...ghostBtn, fontSize: 12, padding: '4px 10px', minHeight: 0 }}>Clear dates</button>}
            </div>
          </div>
        )}
      </div>

      {/* Create editor */}
      {creating && (
        <EntryEditor mode="create" entry={{ _type: 'diaryEntry', _key: 'new', date: todayYmd(), shareable: false }} idx={-1}
          legs={legs} places={places} upload={uploadPhoto}
          onSave={(draft: any) => addEntry(draft)} onCancel={() => setCreating(false)}
          addItem={addItem} flash={flash} tokens={sharedTokens} />
      )}

      {/* Empty state */}
      {entries.length === 0 && !creating && (
        <div style={{ ...cardStyle, textAlign: 'center', color: textMuted, padding: 44 }}>
          <BookOpen size={28} style={{ opacity: 0.5, marginBottom: 10 }} />
          <p style={{ margin: '0 0 14px', fontSize: 15 }}>Start your diary — log your first day on the road.</p>
          <button onClick={() => setCreating(true)} style={{ ...btn(accent), margin: '0 auto' }}><Plus size={16} /> Add your first entry</button>
        </div>
      )}

      {/* No-match state */}
      {entries.length > 0 && visible.length === 0 && (
        <div style={{ ...cardStyle, textAlign: 'center', color: textMuted, padding: 24 }}><p style={{ margin: 0, fontSize: 13 }}>No entries match these filters.</p></div>
      )}

      {/* Feed */}
      {visible.map(({ entry, idx }) => {
        const isOpen = openKey === entry._key
        if (isOpen) {
          return (
            <EntryEditor key={entry._key} mode="edit" entry={entry} idx={idx}
              legs={legs} places={places} upload={uploadPhoto}
              onSave={(draft: any) => { saveEntry(idx, draft); setOpenKey(null) }}
              onCancel={() => setOpenKey(null)} onDelete={() => deleteEntry(idx)}
              addItem={addItem} flash={flash} tokens={sharedTokens} />
          )
        }
        return <EntryCard key={entry._key} entry={entry} onOpen={() => { setOpenKey(entry._key); setCreating(false) }} tokens={sharedTokens} />
      })}
    </div>
  )
}

function EntryCard(p: { entry: DiaryEntry; onOpen: () => void; tokens: any }) {
  const { entry, onOpen, tokens } = p
  const { cardStyle, accent, textSub, textMuted, text, inputBorder } = tokens
  const hero = heroPhoto(entry)
  const firstLine = (entry.narrative || '').split('\n')[0]
  const tagChips = (entry.tags || []).map((t) => DIARY_TAGS.find((x) => x.value === t)?.label || t)
  return (
    <button onClick={onOpen} style={{ ...cardStyle, textAlign: 'left', cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'flex-start', width: '100%' }}>
      {hero?.url ? (
        <img src={hero.url} alt="" style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover', flexShrink: 0, border: `1px solid ${inputBorder}` }} />
      ) : (
        <div style={{ width: 72, height: 72, borderRadius: 12, flexShrink: 0, background: 'rgba(236,72,153,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>📓</div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>{entry.locationLabel || 'Untitled stop'}</span>
          <span style={{ fontSize: 12, color: textMuted }}>{fmtDiaryDate(entry.date)}</span>
        </div>
        {entry.rating ? <div style={{ marginTop: 3 }}><Stars value={entry.rating} color={accent} muted={textMuted} size={14} /></div> : null}
        {firstLine ? <div style={{ fontSize: 13, color: textSub, marginTop: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{firstLine}</div> : null}
        {tagChips.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 7 }}>
            {tagChips.map((t, i) => <span key={i} style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(236,72,153,0.14)', color: '#db2777' }}>{t}</span>)}
          </div>
        )}
        {entry.shareable ? <span style={{ display: 'inline-block', marginTop: 7, fontSize: 11, fontWeight: 700, color: '#16a34a' }}>● Ready to share</span> : null}
      </div>
    </button>
  )
}

function EntryEditor(p: any) {
  const { mode, entry, idx, legs, places, upload, onSave, onCancel, onDelete, addItem, flash, tokens } = p
  const { cardStyle, inputStyle, labelStyle, ghostBtn, btn, accent, textSub, textMuted, text, dark, inputBorder, grid, isMobile } = tokens
  const [d, setD] = useState<any>(() => ({ ...entry }))
  const [uploading, setUploading] = useState(false)
  const set = (patch: any) => setD((cur: any) => ({ ...cur, ...patch }))
  const photos: DiaryPhoto[] = Array.isArray(d.photos) ? d.photos : []

  const toggleTag = (val: string) => {
    const cur: string[] = Array.isArray(d.tags) ? d.tags : []
    set({ tags: cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val] })
  }

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    const r = await upload(file)
    setUploading(false)
    e.target.value = ''
    if (!r) return
    const newPhoto: DiaryPhoto = { _type: 'diaryPhoto', _key: uid('photo'), asset: { _type: 'reference', _ref: r.assetId }, url: r.url, caption: '', isHero: photos.length === 0 }
    set({ photos: [...photos, newPhoto] })
  }

  // Discovery: add to saved places via the shared helper.
  const addDiscoveryToPlaces = () => {
    if (!d.discovery?.placeName) { flash?.('Add a place name first'); return }
    addItem('places', 'place', placeFromDiscovery(d))
    flash?.('Added to saved places')
  }

  const useLegCoords = (legKey: string) => {
    const leg = legs.find((l: any) => l._key === legKey)
    const patch: any = { legKey }
    if (leg?.coordinates && Number.isFinite(leg.coordinates.lat) && Number.isFinite(leg.coordinates.lng)) {
      patch.coordinates = { _type: 'geopoint', lat: leg.coordinates.lat, lng: leg.coordinates.lng }
      if (!d.locationLabel && leg.label) patch.locationLabel = leg.label
    }
    set(patch)
  }

  const linkOk = (url: string) => !url || (/^https?:\/\//i.test(url) && url.length <= 2048)

  const save = () => {
    const draft = { ...d, date: d.date || todayYmd() }
    if (draft.discovery?.externalLink && !linkOk(draft.discovery.externalLink)) { flash?.('External link must be a valid http(s) URL'); return }
    onSave(draft)
  }

  const latLng = d.coordinates && Number.isFinite(d.coordinates.lat) ? d.coordinates : null

  return (
    <div style={{ ...cardStyle, border: `1px solid ${accent}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontWeight: 800, fontSize: 16 }}>{mode === 'create' ? 'New diary entry' : 'Edit entry'}</div>
        <button onClick={onCancel} style={{ ...ghostBtn, padding: 8 }}><X size={16} /></button>
      </div>

      <div style={{ ...grid(2), marginBottom: 12 }}>
        <div><label style={labelStyle}>Date</label><input type="date" style={inputStyle} value={d.date || ''} onChange={(e) => set({ date: e.target.value })} /></div>
        <div><label style={labelStyle}>Location</label><input style={inputStyle} value={d.locationLabel || ''} onChange={(e) => set({ locationLabel: e.target.value })} placeholder="e.g. Bruges" /></div>
      </div>

      {legs.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Tie to itinerary leg</label>
          <select style={inputStyle} value={d.legKey || ''} onChange={(e) => useLegCoords(e.target.value)}>
            <option value="">— none —</option>
            {legs.map((l: any) => <option key={l._key} value={l._key}>{l.label || 'Leg'}</option>)}
          </select>
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Notes</label>
        <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} value={d.narrative || ''} onChange={(e) => set({ narrative: e.target.value })} placeholder="What happened, what you found, honest impressions…" />
      </div>

      <div style={{ ...grid(3), marginBottom: 12 }}>
        <div><label style={labelStyle}>Temp (°C)</label><input type="number" inputMode="numeric" style={inputStyle} value={d.weatherTemp ?? ''} onChange={(e) => set({ weatherTemp: e.target.value === '' ? undefined : Number(e.target.value) })} /></div>
        <div><label style={labelStyle}>Weather</label><input style={inputStyle} value={d.weatherConditions || ''} onChange={(e) => set({ weatherConditions: e.target.value })} placeholder="Sunny, windy…" /></div>
        <div><label style={labelStyle}>Cost for the day</label><input style={inputStyle} value={d.costSummary || ''} onChange={(e) => set({ costSummary: e.target.value })} placeholder="€40" /></div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Your rating</label>
        <div><Stars value={d.rating} onChange={(n) => set({ rating: clampRating(n, d.rating) })} color={accent} muted={textMuted} size={24} /></div>
      </div>

      <div style={{ ...grid(2), marginBottom: 12 }}>
        <div><label style={labelStyle}>Highlights</label><textarea style={{ ...inputStyle, minHeight: 54, resize: 'vertical' }} value={d.highlights || ''} onChange={(e) => set({ highlights: e.target.value })} /></div>
        <div><label style={labelStyle}>Lowlights &amp; tips for others</label><textarea style={{ ...inputStyle, minHeight: 54, resize: 'vertical' }} value={d.lowlights || ''} onChange={(e) => set({ lowlights: e.target.value })} /></div>
      </div>

      {/* Tags */}
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Tags</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {DIARY_TAGS.map((t) => {
            const on = (d.tags || []).includes(t.value)
            return <button key={t.value} onClick={() => toggleTag(t.value)} style={{ ...ghostBtn, fontSize: 12, padding: '5px 11px', minHeight: 0, borderColor: on ? accent : inputBorder, background: on ? `${accent}18` : 'transparent', color: on ? accent : textSub }}>{t.label}</button>
          })}
        </div>
      </div>

      {/* Mood */}
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Mood</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {DIARY_MOODS.map((m) => {
            const on = d.mood === m.value
            return <button key={m.value} onClick={() => set({ mood: on ? undefined : m.value })} style={{ ...ghostBtn, fontSize: 13, padding: '5px 11px', minHeight: 0, borderColor: on ? accent : inputBorder, background: on ? `${accent}18` : 'transparent', color: on ? accent : text }}>{m.label}</button>
          })}
        </div>
      </div>

      {/* Coordinates */}
      <div style={{ ...grid(2), marginBottom: 12 }}>
        <div><label style={labelStyle}>Latitude</label><input type="number" inputMode="decimal" style={inputStyle} value={latLng ? latLng.lat : ''} onChange={(e) => { const lat = Number(e.target.value); set({ coordinates: { _type: 'geopoint', lat, lng: latLng ? latLng.lng : 0 } }) }} placeholder="51.2093" /></div>
        <div><label style={labelStyle}>Longitude</label><input type="number" inputMode="decimal" style={inputStyle} value={latLng ? latLng.lng : ''} onChange={(e) => { const lng = Number(e.target.value); set({ coordinates: { _type: 'geopoint', lat: latLng ? latLng.lat : 0, lng } }) }} placeholder="3.2247" /></div>
      </div>

      {/* Photos */}
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Photos</label>
        {photos.length > 0 && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
            {photos.map((ph) => (
              <div key={ph._key} style={{ width: 120, border: `1px solid ${inputBorder}`, borderRadius: 10, overflow: 'hidden' }}>
                {ph.url ? <img src={ph.url} alt="" style={{ width: '100%', height: 84, objectFit: 'cover', display: 'block' }} /> : <div style={{ height: 84, background: 'rgba(127,127,127,0.1)' }} />}
                <input style={{ ...inputStyle, fontSize: 12, borderRadius: 0, border: 'none', borderTop: `1px solid ${inputBorder}` }} value={ph.caption || ''} placeholder="Caption" onChange={(e) => set({ photos: photos.map((x) => x._key === ph._key ? { ...x, caption: e.target.value } : x) })} />
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 7px', gap: 6 }}>
                  <button onClick={() => set({ photos: setHeroPhoto(photos, ph._key) })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: ph.isHero ? '#f59e0b' : textMuted }}>{ph.isHero ? '★ Cover' : 'Set cover'}</button>
                  <button onClick={() => set({ photos: removePhoto(photos, ph._key) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex' }}><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
        <label style={{ ...ghostBtn, cursor: 'pointer', display: 'inline-flex' }}>
          {uploading ? <Loader2 size={14} className="spin" /> : <Plus size={14} />} {uploading ? 'Uploading…' : 'Add photo'}
          <input type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} disabled={uploading} />
        </label>
      </div>

      {/* Shareable */}
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: textSub, cursor: 'pointer', marginBottom: 12 }}>
        <input type="checkbox" checked={!!d.shareable} onChange={(e) => set({ shareable: e.target.checked })} /> Ready to share with followers
      </label>

      {/* Discovery log */}
      <div style={{ border: `1px solid ${inputBorder}`, borderRadius: 12, padding: 12, marginBottom: 14 }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: text, cursor: 'pointer' }}>
          <input type="checkbox" checked={!!d.aboutPlace} onChange={(e) => set({ aboutPlace: e.target.checked })} /> This entry is about a specific place
        </label>
        {d.aboutPlace && (
          <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            <div style={grid(2)}>
              <div><label style={labelStyle}>Place name</label><input style={inputStyle} value={d.discovery?.placeName || ''} onChange={(e) => set({ discovery: { ...(d.discovery || {}), placeName: e.target.value } })} /></div>
              <div><label style={labelStyle}>Place type</label><input style={inputStyle} value={d.discovery?.placeType || ''} onChange={(e) => set({ discovery: { ...(d.discovery || {}), placeType: e.target.value } })} placeholder="restaurant, viewpoint…" /></div>
            </div>
            <div><label style={labelStyle}>Location</label><input style={inputStyle} value={d.discovery?.location || ''} onChange={(e) => set({ discovery: { ...(d.discovery || {}), location: e.target.value } })} /></div>
            <div>
              <label style={labelStyle}>Would you recommend it?</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {DISCOVERY_RECS.map((r) => {
                  const on = d.discovery?.recommendation === r.value
                  return <button key={r.value} onClick={() => set({ discovery: { ...(d.discovery || {}), recommendation: on ? undefined : r.value } })} style={{ ...ghostBtn, fontSize: 13, padding: '5px 11px', minHeight: 0, borderColor: on ? accent : inputBorder, background: on ? `${accent}18` : 'transparent', color: on ? accent : text }}>{r.label}</button>
                })}
              </div>
            </div>
            <div><label style={labelStyle}>Practical tips (hours, parking, accessibility, best time)</label><textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={d.discovery?.practicalTips || ''} onChange={(e) => set({ discovery: { ...(d.discovery || {}), practicalTips: e.target.value } })} /></div>
            <div><label style={labelStyle}>Link (Google Maps, Park4Night, website)</label><input style={inputStyle} value={d.discovery?.externalLink || ''} onChange={(e) => set({ discovery: { ...(d.discovery || {}), externalLink: e.target.value } })} placeholder="https://…" /></div>
            <button onClick={addDiscoveryToPlaces} disabled={!d.discovery?.placeName} style={{ ...ghostBtn, borderColor: accent, color: accent, opacity: d.discovery?.placeName ? 1 : 0.5, width: 'fit-content' }}><MapPin size={14} /> Add to saved places</button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        {mode === 'edit' ? <button onClick={onDelete} style={{ ...ghostBtn, color: '#ef4444', borderColor: '#ef444455' }}><Trash2 size={14} /> Delete</button> : <span />}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={ghostBtn}>Cancel</button>
          <button onClick={save} style={btn(accent)}><Check size={16} /> {mode === 'create' ? 'Add entry' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}

function CalendarTab(p: any) {
  const {
    trip, arr, addItem, updateItem, removeItem, saveField,
    cardStyle, inputStyle, labelStyle, ghostBtn, btn,
    accent, textSub, textMuted, text, dark, inputBorder, grid, isMobile,
    aiLoading, setAiLoading, setError, flash,
  } = p

  const legsRaw: ItineraryLeg[] = arr('itinerary')
  const legs = orderLegs(legsRaw)

  const tripStart: string | undefined = trip?.startDate || undefined
  const tripEnd: string | undefined = trip?.endDate || undefined
  const currency = trip?.currency || 'GBP'

  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  // Mobile grid: the day whose details show in the inline panel below the grid.
  // Separate from selectedDate (which opens the full day modal) so tapping a day
  // on mobile previews it inline without popping the modal.
  const [focusedDay, setFocusedDay] = useState<string | null>(null)
  // Collapsible map of pinned locations shown at the top of the itinerary view.
  const [itinMapOpen, setItinMapOpen] = useState(true)

  // Event editor works on a LOCAL DRAFT so in-progress edits never touch trip.events
  // until the user hits Save. This is what fixes the "entry cancels itself" bug that
  // the old inline editor had (every onBlur replaced the whole events array + remounted).
  const [eventDraft, setEventDraft] = useState<any | null>(null)
  const [eventDraftIsNew, setEventDraftIsNew] = useState(false)
  // Merge a partial patch into the draft. Nothing here persists to Sanity.
  const setD = (patch: Record<string, any>) => setEventDraft((d: any) => ({ ...(d || {}), ...patch }))

  // Visible month: default to trip.startDate's month, else the current month.
  const [visibleMonth, setVisibleMonth] = useState<{ year: number; month: number }>(() => {
    const v = tripStart ? parseYmd(tripStart) : null
    if (v) return { year: v.y, month: v.m }
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() + 1 }
  })

  // Today's date as 'YYYY-MM-DD' (local) — for the "today" highlight only.
  const today = (() => {
    const n = new Date()
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
  })()

  // Default the mobile inline day panel to today (if it falls in the trip) or
  // the trip's start date, so there's something to see without tapping first.
  useEffect(() => {
    if (focusedDay) return
    const inTrip = tripStart && tripEnd ? (today >= tripStart && today <= tripEnd) : false
    setFocusedDay(inTrip ? today : (tripStart || today))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripStart, tripEnd])

  // Drive-calculator local state, keyed by hop key.
  const [driveResults, setDriveResults] = useState<Record<string, HopResult>>({})
  const [driveTotals, setDriveTotals] = useState<{ distanceMeters: number; durationSeconds: number } | null>(null)
  const [driveWarning, setDriveWarning] = useState<string>('')
  // Fuel-estimate inputs for the Drives card. mpg = imperial van economy,
  // fuelPrice = price per litre in the trip currency.
  const [mpg, setMpg] = useState(30)
  const [fuelPrice, setFuelPrice] = useState(1.45)
  // AI stopover suggestions to break an over-long drive, keyed by hop key.
  const [stopSuggestions, setStopSuggestions] = useState<Record<string, Array<{ name: string; why: string; approxLocation: string }>>>({})

  // Geocode-by-name local state, keyed per leg (many legs render at once).
  const [geoQuery, setGeoQuery] = useState<Record<string, string>>({})
  const [geoResults, setGeoResults] = useState<Record<string, Array<{ label: string; lat: number; lng: number }>>>({})
  const [geoLoading, setGeoLoading] = useState<string>('')

  // Nearest-airport lookup local state, keyed per event.
  const [airportLoading, setAirportLoading] = useState<string>('')
  const [airportResults, setAirportResults] = useState<Record<string, any[]>>({})

  // Exact drive-time lookup local state (declared at the CalendarTab level so it
  // survives Event_Editor modal re-renders).
  const [driveTimeLoading, setDriveTimeLoading] = useState(false)
  const [driveTimeMsg, setDriveTimeMsg] = useState('')

  // ── Drive-range map local state ──────────────────────────────────────
  const [rangeOpen, setRangeOpen] = useState(false)
  const [rangeCenter, setRangeCenter] = useState<{ lat: number; lng: number; label: string } | null>(null)
  const [rangeData, setRangeData] = useState<{ isochrone: any; rings: Array<{ hours: number; km: number; geojson: any }>; centerName?: string } | null>(null)
  const [rangeLoading, setRangeLoading] = useState(false)
  // On-demand accurate drive-time boundary (real routing, 16 spokes).
  const [boundaryData, setBoundaryData] = useState<any | null>(null)
  const [boundaryLoading, setBoundaryLoading] = useState(false)
  const [rangeStartLeg, setRangeStartLeg] = useState<string>('')
  const [rangeQuery, setRangeQuery] = useState('')
  const [rangeSearching, setRangeSearching] = useState(false)
  const [clickedPoint, setClickedPoint] = useState<{ lat: number; lng: number; name: string } | null>(null)
  const [rangeMapLoaded, setRangeMapLoaded] = useState(false)
  const rangeMapContainer = useRef<HTMLDivElement | null>(null)
  const rangeMapRef = useRef<any>(null)

  // Forward-geocode a place name → coordinate suggestions for one leg.
  const geocodeLeg = async (key: string) => {
    const query = (geoQuery[key] ?? '').trim()
    if (!query) return
    setGeoLoading(key)
    setError('')
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'geocode', query }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Geocoding failed'); setGeoLoading(''); return }
      const results = Array.isArray(data.results) ? data.results : []
      setGeoResults((m) => ({ ...m, [key]: results }))
      if (results.length === 0) flash('No matches found')
    } catch (e: any) {
      setError(e.message || 'Geocoding failed')
    }
    setGeoLoading('')
  }

  // Apply a chosen suggestion to the leg, then clear its search box + results.
  const applyGeoResult = (key: string, r: { label: string; lat: number; lng: number }) => {
    editLeg(key, { coordinates: { lat: r.lat, lng: r.lng } })
    setGeoQuery((m) => { const n = { ...m }; delete n[key]; return n })
    setGeoResults((m) => { const n = { ...m }; delete n[key]; return n })
    flash('Coordinates set')
  }

  // Find the nearest major airports for an event. Prefers the event's own place text,
  // otherwise falls back to coordinates from a leg covering the selected day.
  const findAirports = async (ev: any) => {
    const body: any = { action: 'ai-nearest-airports' }
    if (ev.place || ev.fromLocation) {
      body.query = ev.place || ev.fromLocation
    } else {
      const coords = selectedDate ? legsCovering(selectedDate, legsRaw)[0]?.coordinates : undefined
      if (coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng)) {
        body.lat = coords.lat
        body.lng = coords.lng
      }
    }
    if (!body.query && typeof body.lat !== 'number') {
      flash("Add a place first, or set coordinates on the day's leg")
      return
    }
    setAirportLoading(ev._key)
    setError('')
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Airport lookup failed'); return }
      const airports = Array.isArray(data.airports) ? data.airports : []
      setAirportResults((m) => ({ ...m, [ev._key]: airports }))
      if (airports.length === 0) flash('No airports found')
    } catch (e: any) {
      setError(e.message || 'Airport lookup failed')
    } finally {
      setAirportLoading('')
    }
  }

  // Draft-only variant: write the chosen airport into the local draft, not Sanity.
  // airportResults is keyed by the draft _key so findAirports(eventDraft) still works.
  const applyAirportToDraft = (a: any) => {
    if (!eventDraft) return
    setD({ place: `${a.name}${a.iata ? ` (${a.iata})` : ''}` })
    const key = eventDraft._key
    setAirportResults((m) => { const n = { ...m }; delete n[key]; return n })
    flash('Airport set')
  }

  // Format a drive-time result the same way as the drives list ("≈ 5h 20m, 430 km").
  const driveTimeText = (durationSeconds: number, distanceMeters: number) => {
    const { h, m } = secondsToHm(durationSeconds)
    return `≈ ${h}h ${m}m, ${metersToKm1dp(distanceMeters)} km`
  }

  // Exact drive-time lookup between the draft's From and To locations. Fail-soft:
  // the server always returns 200 with { ok, ... }; on failure we surface message
  // and write nothing to the draft.
  const lookupDriveTime = async () => {
    if (!eventDraft) return
    setDriveTimeLoading(true)
    setDriveTimeMsg('')
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'event-drive-time',
          fromLocation: eventDraft.fromLocation,
          toLocation: eventDraft.toLocation,
        }),
      })
      const data = await res.json()
      if (data?.ok === true) {
        setD({
          driveDurationSeconds: data.durationSeconds,
          driveDistanceMeters: data.distanceMeters,
        })
        setDriveTimeMsg('')
      } else {
        setDriveTimeMsg(data?.message || 'Drive-time lookup failed')
      }
    } catch {
      setDriveTimeMsg('Drive-time lookup failed — please try again')
    } finally {
      setDriveTimeLoading(false)
    }
  }

  const realIndex = (key: string) => legsRaw.findIndex((x) => x._key === key)

  // ── Travel events (departures & arrivals) — a separate layer from legs ──
  const removeEvent = (key: string) => {
    // Also remove any budget line linked to this event so the two stay consistent.
    const linked = arr('budgetItems').filter((b: any) => b.sourceEventKey === key)
    if (linked.length) saveField('budgetItems', arr('budgetItems').filter((b: any) => b.sourceEventKey !== key))
    saveField('events', arr('events').filter((e: any) => e._key !== key))
  }

  // ── Travel event ↔ budget syncing ──
  // The budget line (if any) that this event created.
  const budgetItemForEvent = (evKey: string) => arr('budgetItems').find((b: any) => b.sourceEventKey === evKey)

  // Create or update a budget line matching an event's cost. Guards against no cost.
  // A booked/confirmed event is an ACTUAL (paid) cost; an unbooked event is an ESTIMATE.
  const syncEventToBudget = (ev: any) => {
    const amount = Number(ev.cost)
    if (!amount || Number.isNaN(amount)) { flash('Add a cost first'); return }
    const routeLabel = ev.place || [ev.fromLocation, ev.toLocation].filter(Boolean).join(' → ') || 'travel'
    const description = `${labelFor(EVENT_MODES, ev.mode)} — ${routeLabel} (${ev.eventType === 'arrival' ? 'arrival' : 'departure'})`
    const category = eventModeToBudgetCategory(ev.mode)
    const isBooked = !!ev.booked
    const budgetFields = isBooked
      ? { description, category, actual: amount, estimated: undefined, paid: true, date: ev.date }
      : { description, category, estimated: amount, actual: undefined, paid: false, date: ev.date }
    const existing = budgetItemForEvent(ev._key)
    if (existing) {
      const idx = arr('budgetItems').findIndex((b: any) => b._key === existing._key)
      if (idx >= 0) {
        updateItem('budgetItems', idx, { ...budgetFields })
        flash('Budget updated')
      }
    } else {
      addItem('budgetItems', 'budgetItem', { sourceEventKey: ev._key, ...budgetFields })
      flash(isBooked ? 'Added to budget (actual)' : 'Added to budget (estimate)')
    }
  }

  // Drop just the linked budget line, leaving the event intact.
  const removeEventFromBudget = (evKey: string) => {
    saveField('budgetItems', arr('budgetItems').filter((b: any) => b.sourceEventKey !== evKey))
    flash('Removed from budget')
  }

  // ── Event-draft persistence ──
  // Normalise the draft (cost → number|undefined) and write it back to trip.events in a
  // SINGLE saveField call. Used by Save and by the budget buttons (which need the event
  // to already exist on the trip before syncEventToBudget can link to it).
  const persistDraft = (): any | null => {
    if (!eventDraft) return null
    const cost = eventDraft.cost === '' || eventDraft.cost == null ? undefined : Number(eventDraft.cost)
    const draft = { ...eventDraft, cost: cost != null && !Number.isNaN(cost) ? cost : undefined }
    if (eventDraftIsNew) {
      saveField('events', [...arr('events'), draft])
    } else {
      saveField('events', arr('events').map((e: any) => (e._key === draft._key ? draft : e)))
    }
    // After the first persist the draft exists on the trip, so treat further writes as edits.
    setEventDraftIsNew(false)
    setEventDraft(draft)
    return draft
  }

  // Save + close the modal.
  const saveDraftAndClose = () => {
    persistDraft()
    setEventDraft(null)
    flash('Saved')
  }

  // Budget actions from inside the modal: persist first (so the event is on the trip and
  // syncEventToBudget can key off it), then sync/remove. Keeps the modal open so the user
  // sees the linked chip.
  const draftAddOrUpdateBudget = () => {
    const draft = persistDraft()
    if (draft) syncEventToBudget(draft)
  }
  const draftRemoveBudget = () => {
    const draft = persistDraft()
    if (draft) removeEventFromBudget(draft._key)
  }
  // Delete an existing event (and its linked budget line) from within the modal.
  const deleteDraftEvent = () => {
    if (!eventDraft || eventDraftIsNew) return
    if (!confirm('Delete this event?')) return
    removeEvent(eventDraft._key)
    setEventDraft(null)
  }

  // Persist a single leg field, running validation when a validated field changes.
  const editLeg = (key: string, fields: Partial<ItineraryLeg>, validated = false) => {
    const idx = realIndex(key)
    if (idx < 0) return
    const current = legsRaw[idx]
    const candidate = { ...current, ...fields }
    if (validated) {
      const result = validateLeg(candidate)
      if (!result.ok) {
        setError(result.error || 'Invalid leg')
        return false
      }
      const normalised = normaliseLeg(candidate as ItineraryLeg)
      updateItem('itinerary', idx, normalised)
      return true
    }
    updateItem('itinerary', idx, fields)
    return true
  }

  // Add a fresh leg, prefilled from the trip window, appended and expanded.
  const addLeg = (extra: Partial<ItineraryLeg> = {}) => {
    const key = uid('leg')
    const newLeg: ItineraryLeg = {
      _type: 'itineraryLeg',
      _key: key,
      label: extra.label || '',
      travelModeIn: 'drive',
      startDate: tripStart || '',
      endDate: tripEnd || '',
      ...extra,
    }
    saveField('itinerary', [...legsRaw, newLeg])
    setExpandedKey(key)
    return key
  }

  // Add from a saved place/opportunity — copy label + coords, set provenance, never mutate source.
  const addFromSource = (kind: 'place' | 'opportunity', item: any) => {
    const name = item.name || item.label || 'Untitled'
    addLeg({
      label: name,
      coordinates: coordsOf(item.coordinates),
      sourceRef: `${kind}: ${name}`,
    })
    setPickerOpen(false)
  }

  const savedPlaces: any[] = (Array.isArray(trip?.places) ? trip.places : []).filter((x: any) => coordsOf(x.coordinates))
  const savedOpps: any[] = (Array.isArray(trip?.opportunities) ? trip.opportunities : []).filter((x: any) => coordsOf(x.coordinates))
  const hasSaved = savedPlaces.length > 0 || savedOpps.length > 0

  // ── Drive calculator ──────────────────────────────────────────────
  const hops = buildDriveHops(legsRaw)
  // Invalidate stale drive results when the set of hops changes (legs added/removed/reordered).
  const hopKeysSig = hops.map((h) => h.key).join('|')
  useEffect(() => { setDriveResults({}); setDriveTotals(null); setDriveWarning('') }, [hopKeysSig])
  const legLabel = (key: string) => legs.find((l) => l._key === key)?.label || 'Untitled'
  const legByKey = (key: string) => legsRaw.find((l) => l._key === key)

  const calculateDrives = async () => {
    const drivable = hops.filter((h) => h.needsCoords === false && h.mode === 'drive' && h.from && h.to)
    const request = drivable.map((h) => ({ key: h.key, from: h.from!, to: h.to! }))
    setAiLoading('drive')
    setError('')
    setDriveWarning('')
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'drive-legs', hops: request }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Drive calculation failed'); setAiLoading(''); return }
      const byKey: Record<string, HopResult> = {}
      ;(data.results || []).forEach((r: HopResult) => { if (r.key) byKey[r.key] = r })
      setDriveResults(byKey)
      setDriveTotals(data.totals || { distanceMeters: 0, durationSeconds: 0 })
      if (data.warning || (data.results || []).some((r: HopResult) => r.error === 'no-token')) {
        setDriveWarning('Routing unavailable — Mapbox not configured')
      }
    } catch (e: any) {
      setError(e.message || 'Drive calculation failed')
    }
    setAiLoading('')
  }

  const hmText = (secs: number) => { const { h, m } = secondsToHm(secs); return `${h}h ${m}m` }

  // The per-day drive-hour limit for this trip (falls back to the default).
  const maxDriveHours = Number(trip?.maxDriveHours) > 0 ? Number(trip.maxDriveHours) : DEFAULT_MAX_DRIVE_HOURS

  // ── Drive-range map: legs that have coordinates (for the start picker + context dots) ──
  const legsWithCoords = legs.filter((l) => coordsOf(l.coordinates))

  // Fetch the isochrone + range rings for the current centre from the server.
  const fetchRange = useCallback(async (lat: number, lng: number) => {
    setRangeLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'isochrone', lat, lng, maxHours: maxDriveHours }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Range lookup failed'); setRangeData(null); return }
      setRangeData({ isochrone: data.isochrone || null, rings: Array.isArray(data.rings) ? data.rings : [], centerName: data.centerName })
      if (data.error) flash(data.error)
    } catch (e: any) {
      setError(e.message || 'Range lookup failed')
      setRangeData(null)
    } finally {
      setRangeLoading(false)
    }
  }, [maxDriveHours, setError, flash])

  // On-demand: compute the accurate drive-time boundary from real routing.
  const fetchBoundary = useCallback(async () => {
    if (!rangeCenter) return
    setBoundaryLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'drive-boundary', lat: rangeCenter.lat, lng: rangeCenter.lng, maxHours: maxDriveHours }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Boundary lookup failed'); return }
      setBoundaryData(data.boundary || null)
      flash(data.boundary ? 'Accurate drive-time boundary ready' : (data.error || 'No boundary'))
    } catch (e: any) {
      setError(e.message || 'Boundary lookup failed')
    } finally {
      setBoundaryLoading(false)
    }
  }, [rangeCenter, maxDriveHours, setError, flash])

  // Start-point pickers → set rangeCenter (which triggers the fetch effect below).
  const pickLegAsCenter = (key: string) => {
    setRangeStartLeg(key)
    const leg = legsRaw.find((l) => l._key === key)
    const c = coordsOf(leg?.coordinates)
    if (c) { setBoundaryData(null); setRangeCenter({ lat: c.lat, lng: c.lng, label: leg?.label || 'Start' }) }
  }
  const useMyLocation = () => {
    if (!navigator.geolocation) { flash('Geolocation not available'); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setRangeStartLeg(''); setBoundaryData(null); setRangeCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: 'My location' }) },
      () => flash('Could not get your location'),
    )
  }
  const searchRangeCenter = async () => {
    const q = rangeQuery.trim()
    if (!q) return
    setRangeSearching(true)
    setError('')
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'geocode', query: q }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Search failed'); return }
      const first = (Array.isArray(data.results) ? data.results : [])[0]
      if (!first) { flash('No matches found'); return }
      setRangeStartLeg('')
      setBoundaryData(null)
      setRangeCenter({ lat: first.lat, lng: first.lng, label: first.label })
    } catch (e: any) {
      setError(e.message || 'Search failed')
    } finally {
      setRangeSearching(false)
    }
  }

  // Client-side reverse geocode using the PUBLIC token (forward geocode action is one-way).
  const reverseGeocodeClient = useCallback(async (lng: number, lat: number): Promise<string> => {
    if (!MAPBOX_PUBLIC_TOKEN) return 'Dropped pin'
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=place,locality,region&limit=1&access_token=${MAPBOX_PUBLIC_TOKEN}`
      const res = await fetch(url)
      const data = await res.json()
      return data?.features?.[0]?.place_name || 'Dropped pin'
    } catch {
      return 'Dropped pin'
    }
  }, [])

  // Load Mapbox GL JS + CSS from CDN once the panel is opened (lazy — keeps the tab light).
  useEffect(() => {
    if (!rangeOpen || !MAPBOX_PUBLIC_TOKEN) return
    if ((window as any).mapboxgl) { setRangeMapLoaded(true); return }
    if (document.getElementById('mapbox-gl-css')) { setRangeMapLoaded(true); return }
    const link = document.createElement('link'); link.id = 'mapbox-gl-css'; link.rel = 'stylesheet'; link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.css'; document.head.appendChild(link)
    const script = document.createElement('script'); script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.js'; script.onload = () => setRangeMapLoaded(true); document.head.appendChild(script)
  }, [rangeOpen])

  // Create the map once loaded + open. Wire the click handler for dropping pins.
  useEffect(() => {
    if (!rangeOpen || !rangeMapLoaded || !rangeMapContainer.current || rangeMapRef.current || !MAPBOX_PUBLIC_TOKEN) return
    const mapboxgl = (window as any).mapboxgl; if (!mapboxgl) return
    mapboxgl.accessToken = MAPBOX_PUBLIC_TOKEN
    const map = new mapboxgl.Map({
      container: rangeMapContainer.current,
      style: dark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11',
      center: rangeCenter ? [rangeCenter.lng, rangeCenter.lat] : [-1.5, 52.5],
      zoom: 5.5,
    })
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.on('click', async (e: any) => {
      const { lng, lat } = e.lngLat
      setClickedPoint({ lat, lng, name: 'Locating…' })
      const name = await reverseGeocodeClient(lng, lat)
      setClickedPoint({ lat, lng, name })
    })
    rangeMapRef.current = map
    return () => { map.remove(); rangeMapRef.current = null }
  }, [rangeOpen, rangeMapLoaded, dark, reverseGeocodeClient]) // eslint-disable-line react-hooks/exhaustive-deps

  // When the centre changes (and panel open), fetch the range data.
  useEffect(() => {
    if (!rangeOpen || !rangeCenter) return
    fetchRange(rangeCenter.lat, rangeCenter.lng)
  }, [rangeOpen, rangeCenter, fetchRange])

  // A stale boundary from a different limit shouldn't linger — clear it when
  // the per-day drive-hour limit changes.
  useEffect(() => {
    setBoundaryData(null)
  }, [maxDriveHours])

  // Draw isochrone + rings + markers whenever data/center changes.
  useEffect(() => {
    const map = rangeMapRef.current
    const mapboxgl = (window as any).mapboxgl
    if (!map || !mapboxgl || !rangeMapLoaded) return

    const draw = () => {
      // Remove previous range layers/sources.
      ;['range-iso-fill', 'range-iso-line'].forEach((id) => { if (map.getLayer(id)) map.removeLayer(id) })
      if (map.getSource('range-iso')) map.removeSource('range-iso')
      ;[0, 1, 2, 3, 4].forEach((i) => {
        if (map.getLayer(`range-ring-line-${i}`)) map.removeLayer(`range-ring-line-${i}`)
        if (map.getSource(`range-ring-${i}`)) map.removeSource(`range-ring-${i}`)
      })
      ;['range-boundary-fill', 'range-boundary-line'].forEach((id) => { if (map.getLayer(id)) map.removeLayer(id) })
      if (map.getSource('range-boundary')) map.removeSource('range-boundary')
      document.querySelectorAll('.range-marker').forEach((el: any) => el.remove())

      if (!rangeCenter) return

      // Precise isochrone (up to 1 hour) as a filled accent zone.
      if (rangeData?.isochrone && Array.isArray(rangeData.isochrone.features) && rangeData.isochrone.features.length > 0) {
        map.addSource('range-iso', { type: 'geojson', data: rangeData.isochrone })
        map.addLayer({ id: 'range-iso-fill', type: 'fill', source: 'range-iso', paint: { 'fill-color': '#d86213', 'fill-opacity': 0.18 } })
        map.addLayer({ id: 'range-iso-line', type: 'line', source: 'range-iso', paint: { 'line-color': '#d86213', 'line-width': 1.5, 'line-opacity': 0.5 } })
      }

      // Approximate range rings (half / two-thirds / full of maxHours).
      const rings = rangeData?.rings || []
      rings.forEach((ring, i) => {
        map.addSource(`range-ring-${i}`, { type: 'geojson', data: ring.geojson })
        map.addLayer({ id: `range-ring-line-${i}`, type: 'line', source: `range-ring-${i}`, paint: { 'line-color': '#d86213', 'line-width': 2, 'line-opacity': 0.35 + i * 0.15, 'line-dasharray': [2, 2] } })
      })

      // Accurate drive-time boundary (real routing) — the prominent solid layer,
      // drawn on top of the dashed estimate rings.
      if (boundaryData?.geometry?.coordinates?.[0]?.length) {
        map.addSource('range-boundary', { type: 'geojson', data: boundaryData })
        map.addLayer({ id: 'range-boundary-fill', type: 'fill', source: 'range-boundary', paint: { 'fill-color': '#d86213', 'fill-opacity': 0.22 } })
        map.addLayer({ id: 'range-boundary-line', type: 'line', source: 'range-boundary', paint: { 'line-color': '#d86213', 'line-width': 2.5, 'line-opacity': 0.95 } })
      }

      // Centre marker.
      const centerEl = document.createElement('div'); centerEl.className = 'range-marker'
      centerEl.style.cssText = 'width:18px;height:18px;border-radius:50%;background:#d86213;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);'
      new mapboxgl.Marker({ element: centerEl }).setLngLat([rangeCenter.lng, rangeCenter.lat]).addTo(map)

      // Small context dots for existing legs with coordinates.
      legsWithCoords.forEach((l) => {
        const c = coordsOf(l.coordinates); if (!c) return
        const el = document.createElement('div'); el.className = 'range-marker'
        el.style.cssText = 'width:10px;height:10px;border-radius:50%;background:#3b82f6;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);'
        new mapboxgl.Marker({ element: el }).setLngLat([c.lng, c.lat]).addTo(map)
      })

      // Fit to the accurate boundary if present, else the largest ring, else centre.
      const boundaryCoords: [number, number][] | undefined = boundaryData?.geometry?.coordinates?.[0]
      const largest = rings[rings.length - 1]
      const fitCoords = boundaryCoords?.length ? boundaryCoords : largest?.geojson?.geometry?.coordinates?.[0]
      if (fitCoords?.length) {
        const lngs = fitCoords.map((c: [number, number]) => c[0]); const lats = fitCoords.map((c: [number, number]) => c[1])
        map.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], { padding: 40, duration: 800 })
      } else {
        map.flyTo({ center: [rangeCenter.lng, rangeCenter.lat], zoom: 8 })
      }
    }

    // Resilient scheduling: the map often goes idle BEFORE the async range fetch
    // populates rangeData, so a one-shot 'idle' listener would fire an empty draw
    // and get consumed. Instead, guard on the style being loaded and re-wait if not.
    const runDraw = () => {
      if (!rangeMapRef.current) return
      if (map.isStyleLoaded()) {
        try {
          draw()
        } catch {
          // Mapbox can throw "style is not done loading" if we raced it — retry once.
          map.once('style.load', runDraw)
        }
        return
      }
      // Style not ready yet — wait for it, then draw.
      map.once('style.load', runDraw)
    }

    runDraw()

    return () => {
      // Avoid leaving a pending one-shot listener across effect re-runs / unmount.
      map.off('style.load', runDraw)
    }
  }, [rangeData, boundaryData, rangeCenter, rangeMapLoaded, legsWithCoords])

  // Add the clicked point as an itinerary leg.
  const addClickedAsLeg = () => {
    if (!clickedPoint) return
    addLeg({ label: clickedPoint.name || 'Dropped pin', coordinates: { lat: clickedPoint.lat, lng: clickedPoint.lng } })
    flash(`Added ${clickedPoint.name || 'pin'} as a leg`)
    setClickedPoint(null)
  }

  // Ask the AI for a good midway stopover to break a single over-long drive.
  const suggestStopover = async (hop: typeof hops[number]) => {
    if (!hop.from || !hop.to) return
    setAiLoading(`stop-${hop.key}`)
    setError('')
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ai-suggest-stopover',
          from: { ...hop.from, label: legLabel(hop.fromKey) },
          to: { ...hop.to, label: legLabel(hop.toKey) },
          maxHours: maxDriveHours,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Could not suggest a stopover'); setAiLoading(''); return }
      const suggestions = Array.isArray(data.suggestions) ? data.suggestions : []
      setStopSuggestions((m) => ({ ...m, [hop.key]: suggestions }))
      if (suggestions.length === 0) flash(data.error || 'No stopover suggestions found')
    } catch (e: any) {
      setError(e.message || 'Could not suggest a stopover')
    }
    setAiLoading('')
  }

  // ── Scenic-road finder (Task 12.2 — R2) ─────────────────────────────
  // Trip-wide search for iconic/scenic driving roads. Results live in local
  // state until the user adds one; adding maps the result → a `place` row via
  // the pure `scenicRoadToPlace` mapper and appends to arr('places') (never
  // overwrites). The mapper sets placeType to always contain 'road' so pins
  // land in the existing Iconic-roads map category, and flags aiSuggested:true.
  const [scenicRoads, setScenicRoads] = useState<any[]>([])
  const findScenicRoads = async () => {
    if (!trip) return
    setAiLoading('scenic-roads'); setError('')
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ai-find-scenic-roads', country: trip.country, region: trip.region, trip }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'AI failed'); setAiLoading(''); return }
      const roads = Array.isArray(data.roads) ? data.roads : []
      setScenicRoads(roads)
      if (roads.length === 0) flash(data.error || 'No scenic roads found')
    } catch (e: any) { setError(e.message || 'AI failed') }
    setAiLoading('')
  }

  // Map one scenic-road result → a place row and append to arr('places').
  // Coordinates only come from the server geocode (lat/lng on the result);
  // scenicRoadToPlace returns NO _key, so we add _type/_key when inserting.
  const addScenicRoad = (road: any) => {
    const coords = (Number.isFinite(road.lat) && Number.isFinite(road.lng))
      ? { _type: 'geopoint' as const, lat: road.lat, lng: road.lng }
      : undefined
    const mapped = scenicRoadToPlace(road, undefined, coords ? { lat: road.lat, lng: road.lng } : undefined)
    const place: any = { ...mapped, _key: uid('place') }
    // Preserve the Sanity geopoint _type on the stored coordinates.
    if (coords) place.coordinates = coords
    saveField('places', [...arr('places'), place])
    flash(`Added ${mapped.name}`)
  }

  // ── Seasonal road-safety: Check-safety action (Task 14 — R3.1–3.5) ──
  // For a scenic-road `place`, decide the Travel_Month, call `ai-road-safety`,
  // then persist the composed `seasonalNote` + `safetyCheckedMonth` verbatim
  // onto that place via `safetyRecord` + `updateItem`. Fail-soft: a null/error
  // result flashes a gentle message and leaves the place unchanged. Loading is
  // keyed per place `_key` so each row has its own spinner.
  const [safetyLoading, setSafetyLoading] = useState<string>('')

  // Resolve the 1–12 Travel_Month for a place: use its tied leg's first month
  // when it has a `legKey`, else fall back to the trip start month (via a
  // pseudo-leg), else undefined.
  const monthForPlace = (place: any): number | undefined => {
    if (place?.legKey) {
      const leg = legByKey(place.legKey)
      if (leg) {
        const months = travelMonthsOf(leg)
        if (months.length > 0) return months[0]
      }
    }
    if (tripStart) {
      const months = travelMonthsOf({ _type: 'itineraryLeg', _key: 'trip', label: '', travelModeIn: 'drive', startDate: tripStart } as ItineraryLeg)
      if (months.length > 0) return months[0]
    }
    return undefined
  }

  const checkSafety = async (place: any) => {
    if (!place?._key) return
    const idx = arr('places').findIndex((x: any) => x._key === place._key)
    if (idx < 0) return
    const month = monthForPlace(place)
    const monthName = month ? MONTH_NAMES[month - 1] : ''
    setSafetyLoading(place._key)
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ai-road-safety',
          roadOrLegName: place.name,
          month: monthName || (month ? String(month) : ''),
          country: trip?.country,
          region: trip?.region,
        }),
      })
      const data = await res.json()
      if (!data || !data.safety) {
        flash(data?.error || 'Could not fetch road safety — try again')
        setSafetyLoading('')
        return
      }
      const rec = safetyRecord(data.safety, monthName || (month ?? ''))
      updateItem('places', idx, { seasonalNote: rec.seasonalNote, safetyCheckedMonth: rec.safetyCheckedMonth })
      flash(`Updated road safety${monthName ? ` for ${monthName}` : ''}`)
    } catch (e: any) {
      flash('Could not fetch road safety — try again')
    }
    setSafetyLoading('')
  }

  // Reusable inline renderer for a stored seasonal warning on a scenic-road
  // place. Always shows the Verify badge (R3.3). When the relevant month is a
  // winter month, the note is surfaced in a prominent amber box (R3.5).
  const renderSeasonalWarning = (place: any) => {
    const note = typeof place?.seasonalNote === 'string' ? place.seasonalNote.trim() : ''
    if (note === '') return null
    const month = monthForPlace(place)
    const winter = typeof month === 'number' && isWinterMonth(month)
    const checkedMonth = (place.safetyCheckedMonth || '').toString().trim()
    const boxStyle: React.CSSProperties = winter
      ? { border: '1px solid #d97706', background: '#d9770618', borderRadius: 10, padding: 10, marginTop: 8 }
      : { border: `1px solid ${inputBorder}`, borderRadius: 10, padding: 10, marginTop: 8 }
    return (
      <div style={boxStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: winter ? '#b45309' : '#d97706' }}>⚠️ Seasonal guidance — verify before travel</span>
          {verifyBadge}
          {checkedMonth && <span style={{ fontSize: 11, color: textMuted }}>(checked for {checkedMonth})</span>}
        </div>
        <div style={{ fontSize: 12.5, color: winter ? text : textSub, whiteSpace: 'pre-line', lineHeight: 1.5, fontWeight: winter ? 600 : 400 }}>{note}</div>
      </div>
    )
  }

  // ── AI re-plan with editable proposals (Task 12.3 — R1.4/1.5/1.7/1.9) ─
  // Proposals are held in LOCAL state only — nothing is written to the trip
  // until the user clicks "Apply accepted", which merges accepted rows into the
  // itinerary via mergeProposedLegs + saveField. A failed/empty response leaves
  // the itinerary untouched.
  const [replanInstruction, setReplanInstruction] = useState('')
  const [proposals, setProposals] = useState<any[]>([])
  const suggestReplan = async () => {
    if (!trip) return
    const instruction = replanInstruction.trim()
    if (!instruction) { flash('Add an instruction first'); return }
    setAiLoading('replan'); setError('')
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ai-replan-route', instruction, trip }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'AI failed'); setAiLoading(''); return }
      const legs = Array.isArray(data.proposedLegs) ? data.proposedLegs : []
      // Editable drafts — accepted defaults to true.
      setProposals(legs.map((l: any) => ({
        accepted: true,
        label: l.label || '',
        startDate: l.startDate || '',
        endDate: l.endDate || '',
        priorityLevel: l.priorityLevel || '',
        country: l.country || '',
        notes: l.notes || '',
      })))
      if (legs.length === 0) flash(data.error || 'No re-plan suggestions returned')
    } catch (e: any) { setError(e.message || 'AI failed') }
    setAiLoading('')
  }

  // Patch one proposal draft row in local state (no persistence).
  const setProposal = (i: number, patch: Record<string, any>) =>
    setProposals((rows) => rows.map((r, idx) => idx === i ? { ...r, ...patch } : r))

  // Build accepted legs → merge into the itinerary → persist. Clears drafts.
  const applyProposals = () => {
    const accepted = proposals.filter((r) => r.accepted && (r.label || '').trim() !== '')
    if (accepted.length === 0) { flash('No accepted proposals to apply'); return }
    const legs: ItineraryLeg[] = accepted.map((r) => {
      // Reuse an existing leg key when a proposal matches a current leg by label.
      const existing = legsRaw.find((l) => (l.label || '').trim().toLowerCase() === (r.label || '').trim().toLowerCase())
      const leg: ItineraryLeg = {
        _type: 'itineraryLeg',
        _key: existing?._key || uid('itineraryLeg'),
        label: r.label.trim(),
        country: r.country || undefined,
        startDate: r.startDate || undefined,
        endDate: r.endDate || undefined,
        priorityLevel: r.priorityLevel || undefined,
        notes: r.notes || undefined,
        travelModeIn: existing?.travelModeIn || 'drive',
      }
      return leg
    })
    const merged = mergeProposedLegs(arr('itinerary'), legs)
    saveField('itinerary', merged)
    setProposals([])
    setReplanInstruction('')
    flash(`Applied ${accepted.length} ${accepted.length === 1 ? 'proposal' : 'proposals'}`)
  }

  // ── Empty state ───────────────────────────────────────────────────
  if (legsRaw.length === 0) {
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        <div style={{ ...cardStyle, textAlign: 'center', color: textMuted, padding: 36 }}>
          <CalendarDays size={26} style={{ opacity: 0.5, marginBottom: 8 }} />
          <p style={{ margin: 0, fontWeight: 700, color: textSub }}>No itinerary legs yet</p>
          <p style={{ margin: '6px auto 14px', maxWidth: 420, lineHeight: 1.5 }}>
            Add your first leg to start building the calendar — either enter one manually, or add it from a
            saved place or work/stay so the location and coordinates come across automatically.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => addLeg()} style={btn(accent)}><Plus size={16} /> Add leg</button>
            {hasSaved && <button onClick={() => setPickerOpen(true)} style={ghostBtn}><MapPin size={14} /> Add from saved</button>}
          </div>
          {pickerOpen && hasSaved && (
            <SavedPicker
              places={savedPlaces} opps={savedOpps} onPick={addFromSource} onClose={() => setPickerOpen(false)}
              cardStyle={cardStyle} inputBorder={inputBorder} text={text} textSub={textSub} textMuted={textMuted} accent={accent} dark={dark}
            />
          )}
        </div>
      </div>
    )
  }

  const gaps = new Set(gapDays(legsRaw))
  const bounds = timelineBounds(legsRaw)
  const gridDays = monthGridDays(visibleMonth.year, visibleMonth.month, 1) // week starts Monday
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const prevMonth = () => setVisibleMonth((v) => v.month === 1 ? { year: v.year - 1, month: 12 } : { year: v.year, month: v.month - 1 })
  const nextMonth = () => setVisibleMonth((v) => v.month === 12 ? { year: v.year + 1, month: 1 } : { year: v.year, month: v.month + 1 })

  const openLegEditor = (key: string) => {
    const v = legByKey(key)
    if (v?.startDate) { const pv = parseYmd(v.startDate); if (pv) setVisibleMonth({ year: pv.y, month: pv.m }) }
    setExpandedKey(key)
  }

  // Small shared "AI · verify" provenance badge for AI-suggested content.
  const verifyBadge = (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#d9770622', color: '#d97706' }}>AI · verify</span>
  )

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* ── Scenic-road finder (Task 12.2 — R2) ── */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
          <div style={{ fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Route size={16} color={accent} /> Find iconic &amp; scenic roads</div>
          {verifyBadge}
        </div>
        <div style={{ fontSize: 13, color: textSub, margin: '0 0 12px' }}>Discover famous drives and scenic routes for this trip. Add one to pin it on the Route Map (Iconic roads).</div>
        <button onClick={findScenicRoads} disabled={aiLoading === 'scenic-roads'} style={{ ...btn('#f59e0b'), width: isMobile ? '100%' : undefined }}>
          {aiLoading === 'scenic-roads' ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />} Find scenic roads
        </button>
        {aiLoading === 'scenic-roads' && <AiProgress label="Finding scenic roads…" />}
        {scenicRoads.length > 0 && (
          <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
            {scenicRoads.map((road, i) => {
              const isLead = typeof road.name === 'string' && road.name.startsWith('Search for: ')
              return (
                <div key={`${road.name}-${i}`} style={{ border: `1px solid ${inputBorder}`, borderRadius: 12, padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: isLead ? textMuted : text, fontStyle: isLead ? 'italic' : 'normal' }}>{road.name}</span>
                        {verifyBadge}
                        {isLead && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: 'rgba(127,127,127,0.15)', color: textMuted }}>lead</span>}
                      </div>
                      <div style={{ fontSize: 12, color: textSub, marginTop: 3 }}>{[road.roadType, road.location].filter(Boolean).join(' · ')}</div>
                      {road.why && <div style={{ fontSize: 12, color: textSub, marginTop: 4 }}>{road.why}</div>}
                      <div style={{ fontSize: 12, color: textMuted, marginTop: 4, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {road.bestMonths && <span>Best: {road.bestMonths}</span>}
                        {road.scenicRating && <span>Scenic: {road.scenicRating}</span>}
                      </div>
                      {road.seasonalNote && <div style={{ fontSize: 12, color: textMuted, marginTop: 4 }}>{road.seasonalNote}</div>}
                    </div>
                    <button onClick={() => addScenicRoad(road)} style={{ ...btn(accent), minHeight: 36, padding: '7px 12px', fontSize: 13 }}><Plus size={14} /> Add to map</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Scenic roads on this trip + seasonal road-safety (Task 14 — R3) ── */}
      {(() => {
        const roadPlaces = arr('places').filter((pl: any) => placeCategory(pl.placeType) === 'road')
        if (roadPlaces.length === 0) return null
        return (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
              <div style={{ fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Route size={16} color={accent} /> Scenic roads on this trip</div>
            </div>
            <div style={{ fontSize: 13, color: textSub, margin: '0 0 12px' }}>Check knowledge-based seasonal road-safety for each road, keyed to its travel month. Always verify closures and winter conditions before you travel.</div>
            <div style={{ display: 'grid', gap: 10 }}>
              {roadPlaces.map((place: any) => {
                const month = monthForPlace(place)
                const monthName = month ? MONTH_NAMES[month - 1] : ''
                const loading = safetyLoading === place._key
                return (
                  <div key={place._key} style={{ border: `1px solid ${inputBorder}`, borderRadius: 12, padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: text }}>{place.name}</div>
                        <div style={{ fontSize: 12, color: textSub, marginTop: 3 }}>{[place.roadType || place.placeType, place.location].filter(Boolean).join(' · ')}</div>
                        {monthName && <div style={{ fontSize: 11, color: textMuted, marginTop: 3 }}>Travel month: {monthName}</div>}
                      </div>
                      <button
                        onClick={() => checkSafety(place)}
                        disabled={loading}
                        style={{ ...btn('#d97706'), minHeight: 36, padding: '7px 12px', fontSize: 13, width: isMobile ? '100%' : undefined }}
                      >
                        {loading ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />} Check safety
                      </button>
                    </div>
                    {renderSeasonalWarning(place)}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* ── AI re-plan with editable proposals (Task 12.3 — R1.4/1.5/1.7/1.9) ── */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
          <div style={{ fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Sparkles size={16} color={accent} /> Re-plan with AI</div>
          {verifyBadge}
        </div>
        <div style={{ fontSize: 13, color: textSub, margin: '0 0 12px' }}>Describe a change (e.g. &ldquo;tighten the Greek leg, add 2 nights in the Dolomites&rdquo;). Proposals are drafts — nothing is saved until you Apply.</div>
        <textarea
          style={{ ...inputStyle, minHeight: 72, resize: 'vertical', fontFamily: 'inherit' }}
          value={replanInstruction}
          onChange={(e) => setReplanInstruction(e.target.value)}
          placeholder="What should the AI change about this route?"
        />
        <button onClick={suggestReplan} disabled={aiLoading === 'replan'} style={{ ...btn('#8b5cf6'), width: isMobile ? '100%' : undefined, marginTop: 10 }}>
          {aiLoading === 'replan' ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />} Suggest re-plan
        </button>
        {aiLoading === 'replan' && <AiProgress label="Thinking about your route…" />}
        {proposals.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, color: textMuted, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><Check size={12} /> Drafts only — nothing is saved until you Apply.</div>
            <div style={{ display: 'grid', gap: 10 }}>
              {proposals.map((row, i) => (
                <div key={i} style={{ border: `1px solid ${inputBorder}`, borderRadius: 12, padding: 12, opacity: row.accepted ? 1 : 0.55 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14, marginBottom: 10, cursor: 'pointer' }}>
                    <input type="checkbox" checked={row.accepted} onChange={(e) => setProposal(i, { accepted: e.target.checked })} />
                    Accept this leg
                  </label>
                  <div style={grid(2)}>
                    <div>
                      <label style={labelStyle}>Label</label>
                      <input style={inputStyle} value={row.label} onChange={(e) => setProposal(i, { label: e.target.value })} placeholder="Stop name" />
                    </div>
                    <div>
                      <label style={labelStyle}>Country</label>
                      <input style={inputStyle} value={row.country} onChange={(e) => setProposal(i, { country: e.target.value })} placeholder="Country" />
                    </div>
                    <div>
                      <label style={labelStyle}>Start date</label>
                      <input style={inputStyle} type="date" value={row.startDate} onChange={(e) => setProposal(i, { startDate: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>End date</label>
                      <input style={inputStyle} type="date" value={row.endDate} onChange={(e) => setProposal(i, { endDate: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Priority</label>
                      <select style={inputStyle} value={row.priorityLevel} onChange={(e) => setProposal(i, { priorityLevel: e.target.value })}>
                        <option value="">—</option>
                        <option value="Must-do">Must-do</option>
                        <option value="Optional">Optional</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <label style={labelStyle}>Notes</label>
                    <textarea style={{ ...inputStyle, minHeight: 48, resize: 'vertical', fontFamily: 'inherit' }} value={row.notes} onChange={(e) => setProposal(i, { notes: e.target.value })} placeholder="Optional notes" />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <button onClick={applyProposals} style={btn(accent)}><Check size={16} /> Apply accepted</button>
              <button onClick={() => { setProposals([]) }} style={ghostBtn}><X size={14} /> Discard</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Map of pinned locations ── */}
      <div style={cardStyle}>
        <button
          onClick={() => setItinMapOpen((o) => !o)}
          aria-expanded={itinMapOpen}
          style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%', marginBottom: itinMapOpen ? 14 : 0 }}
        >
          <span style={{ fontWeight: 700, fontSize: 16, display: 'inline-flex', alignItems: 'center', gap: 8 }}><Globe size={16} color={accent} /> Map of pinned locations</span>
          <ChevronRight size={16} style={{ flexShrink: 0, transform: itinMapOpen ? 'rotate(90deg)' : 'none', transition: 'transform .15s', color: textMuted }} />
        </button>
        {itinMapOpen && (
          <RoutePinsMap
            trip={trip} arr={arr}
            cardStyle={cardStyle} ghostBtn={ghostBtn}
            accent={accent} textSub={textSub} textMuted={textMuted} text={text}
            dark={dark} inputBorder={inputBorder} isMobile={isMobile}
          />
        )}
      </div>

      {/* ── Legs list + editor ── */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}><CalendarDays size={16} color={accent} /> Itinerary</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {hasSaved && <button onClick={() => setPickerOpen((o) => !o)} style={ghostBtn}><MapPin size={14} /> Add from saved</button>}
            <button onClick={() => addLeg()} style={btn(accent)}><Plus size={16} /> Add leg</button>
          </div>
        </div>

        {pickerOpen && hasSaved && (
          <SavedPicker
            places={savedPlaces} opps={savedOpps} onPick={addFromSource} onClose={() => setPickerOpen(false)}
            cardStyle={cardStyle} inputBorder={inputBorder} text={text} textSub={textSub} textMuted={textMuted} accent={accent} dark={dark}
          />
        )}

        <div style={{ display: 'grid', gap: 10 }}>
          {legs.map((leg) => {
            const isOpen = expandedKey === leg._key
            const outOfWindow = isOutOfWindow(leg, tripStart, tripEnd)
            return (
              <div key={leg._key} style={{ border: `1px solid ${inputBorder}`, borderRadius: 12, padding: 12, background: isOpen ? (dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)') : 'transparent' }}>
                {/* Collapsed header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, cursor: 'pointer', alignItems: 'flex-start' }} onClick={() => setExpandedKey(isOpen ? null : leg._key)}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 15, opacity: (leg.priorityLevel || '').toLowerCase() === 'optional' ? 0.7 : 1 }}>{leg.label || 'Untitled'}</span>
                      {legPriorityBadge(leg.priorityLevel, accent, textMuted)}
                      {outOfWindow && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#d9770622', color: '#d97706' }}>Out of window</span>}
                    </div>
                    <div style={{ fontSize: 12, color: textSub, marginTop: 3 }}>{[leg.country, fmtLegRange(leg)].filter(Boolean).join(' · ')}</div>
                    <div style={{ fontSize: 12, color: textMuted, marginTop: 3 }}>Arrive by {labelFor(TRAVEL_MODES_LIST, leg.travelModeIn)}</div>
                  </div>
                  <ChevronRight size={16} style={{ flexShrink: 0, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s', color: textMuted }} />
                </div>

                {/* Expanded editor */}
                {isOpen && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${inputBorder}`, display: 'grid', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input style={{ ...inputStyle, fontWeight: 700 }} defaultValue={leg.label || ''} placeholder="Location label (required)"
                        onBlur={(e) => { if (!editLeg(leg._key, { label: e.target.value }, true)) e.target.value = leg.label || '' }} />
                      <button onClick={() => { if (confirm('Delete this leg?')) { const i = realIndex(leg._key); if (i >= 0) removeItem('itinerary', i); if (expandedKey === leg._key) setExpandedKey(null) } }} style={{ ...ghostBtn, padding: 8, color: '#ef4444' }}><Trash2 size={14} /></button>
                    </div>

                    <div style={grid(2)}>
                      <div><label style={labelStyle}>Country</label><input style={inputStyle} defaultValue={leg.country || ''} placeholder="e.g. France" onBlur={(e) => editLeg(leg._key, { country: e.target.value })} /></div>
                      <div><label style={labelStyle}>Arrive by</label><select style={inputStyle} value={leg.travelModeIn || 'drive'} onChange={(e) => editLeg(leg._key, { travelModeIn: e.target.value as any })}>{TRAVEL_MODES_LIST.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}</select></div>
                    </div>

                    <div>
                      <label style={labelStyle}>Priority</label>
                      <select style={inputStyle} value={leg.priorityLevel || ''} onChange={(e) => editLeg(leg._key, { priorityLevel: e.target.value || undefined })}>
                        {LEG_PRIORITIES.map((pr) => <option key={pr.value || 'unset'} value={pr.value}>{pr.label}</option>)}
                      </select>
                    </div>

                    <div style={grid(2)}>
                      <div><label style={labelStyle}>Start date</label><input type="date" style={inputStyle} defaultValue={leg.startDate || ''}
                        onBlur={(e) => { if (!editLeg(leg._key, { startDate: e.target.value }, true)) e.target.value = leg.startDate || '' }} /></div>
                      <div><label style={labelStyle}>End date</label><input type="date" style={inputStyle} defaultValue={leg.endDate || ''}
                        onBlur={(e) => { if (!editLeg(leg._key, { endDate: e.target.value }, true)) e.target.value = leg.endDate || '' }} /></div>
                    </div>

                    <div>
                      <label style={labelStyle}>Departure country {leg.travelModeIn === 'flight' ? '(flying from)' : ''}</label>
                      <input style={inputStyle} defaultValue={leg.departureCountry || ''} placeholder="Country you set off from" onBlur={(e) => editLeg(leg._key, { departureCountry: e.target.value })} />
                    </div>

                    <div>
                      <label style={labelStyle}>Set coordinates by place name</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        <input
                          style={{ ...inputStyle, flex: '1 1 180px' }}
                          value={geoQuery[leg._key] ?? ''}
                          placeholder="e.g. Bordeaux, France"
                          onChange={(e) => { const v = e.target.value; setGeoQuery((m) => ({ ...m, [leg._key]: v })) }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); geocodeLeg(leg._key) } }}
                        />
                        <button
                          type="button"
                          style={{ ...ghostBtn, flex: '0 0 auto' }}
                          disabled={geoLoading === leg._key}
                          onClick={() => geocodeLeg(leg._key)}
                        >
                          {geoLoading === leg._key ? <Loader2 size={16} className="spin" /> : <MapPin size={16} />}
                          Find
                        </button>
                      </div>
                      {(geoResults[leg._key]?.length ?? 0) > 0 && (
                        <div style={{ display: 'grid', gap: 4, marginTop: 6 }}>
                          {geoResults[leg._key].map((r, i) => (
                            <button
                              key={`${leg._key}-geo-${i}`}
                              type="button"
                              onClick={() => applyGeoResult(leg._key, r)}
                              style={{ width: '100%', textAlign: 'left', minHeight: 40, padding: '8px 10px', border: `1px solid ${inputBorder}`, borderRadius: 8, background: 'rgba(127,127,127,0.06)', color: text, fontSize: 13, cursor: 'pointer' }}
                            >
                              {r.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={grid(2)}>
                      <div><label style={labelStyle}>Latitude</label><input key={`lat-${leg._key}-${leg.coordinates?.lat ?? 'x'}`} type="number" inputMode="decimal" style={inputStyle} defaultValue={leg.coordinates?.lat ?? ''} placeholder="e.g. 43.61"
                        onBlur={(e) => {
                          const cur = legsRaw.find((l) => l._key === leg._key)?.coordinates
                          const raw = e.target.value === '' ? undefined : Number(e.target.value)
                          const nextLat = raw != null && Number.isFinite(raw) ? raw : undefined
                          const nextLng = cur?.lng
                          editLeg(leg._key, { coordinates: (nextLat != null && nextLng != null) ? { lat: nextLat, lng: nextLng } : undefined })
                        }} /></div>
                      <div><label style={labelStyle}>Longitude</label><input key={`lng-${leg._key}-${leg.coordinates?.lng ?? 'x'}`} type="number" inputMode="decimal" style={inputStyle} defaultValue={leg.coordinates?.lng ?? ''} placeholder="e.g. 3.88"
                        onBlur={(e) => {
                          const cur = legsRaw.find((l) => l._key === leg._key)?.coordinates
                          const raw = e.target.value === '' ? undefined : Number(e.target.value)
                          const nextLng = raw != null && Number.isFinite(raw) ? raw : undefined
                          const nextLat = cur?.lat
                          editLeg(leg._key, { coordinates: (nextLat != null && nextLng != null) ? { lat: nextLat, lng: nextLng } : undefined })
                        }} /></div>
                    </div>

                    {leg.travelModeIn !== 'drive' && (
                      <div style={grid(2)}>
                        <div><label style={labelStyle}>Manual distance (km)</label><input type="number" inputMode="decimal" style={inputStyle} defaultValue={leg.manualDistanceKm ?? ''} onBlur={(e) => editLeg(leg._key, { manualDistanceKm: e.target.value === '' ? undefined : Number(e.target.value) })} /></div>
                        <div><label style={labelStyle}>Manual duration (mins)</label><input type="number" inputMode="numeric" style={inputStyle} defaultValue={leg.manualDurationMins ?? ''} onBlur={(e) => editLeg(leg._key, { manualDurationMins: e.target.value === '' ? undefined : Number(e.target.value) })} /></div>
                      </div>
                    )}

                    <div>
                      <label style={labelStyle}>Private notes</label>
                      <textarea style={{ ...inputStyle, minHeight: 44, resize: 'vertical' }} defaultValue={leg.notes || ''} placeholder="Only you see this — never shared in summaries" onBlur={(e) => editLeg(leg._key, { notes: e.target.value })} />
                    </div>
                    {leg.sourceRef && <div style={{ fontSize: 11, color: textMuted }}>From {leg.sourceRef}</div>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Calendar / MonthGrid ── */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <button onClick={prevMonth} style={{ ...ghostBtn, minWidth: 44 }} aria-label="Previous month"><ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /></button>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{MONTH_NAMES[visibleMonth.month - 1]} {visibleMonth.year}</div>
          <button onClick={nextMonth} style={{ ...ghostBtn, minWidth: 44 }} aria-label="Next month"><ChevronRight size={16} /></button>
        </div>

        {isMobile ? (
          /* Mobile: a real, recognisable month grid (compact cells with colour
             dots) PLUS a details panel for the selected day — the standard
             phone-calendar pattern (month overview up top, day detail below).
             This keeps the familiar calendar while staying readable. */
          (() => {
            const MWD = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
            const selCovering = focusedDay ? legsCovering(focusedDay, legsRaw) : []
            const selEvents = focusedDay ? arr('events').filter((e: any) => e.date === focusedDay) : []
            const selIsGap = focusedDay ? (gaps.has(focusedDay) && (bounds ? dateInRange(focusedDay, bounds.min, bounds.max) : false)) : false
            return (<>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {MWD.map((w, i) => <div key={i} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: textMuted, paddingBottom: 2 }}>{w}</div>)}
                {gridDays.map((day) => {
                  const dv = parseYmd(day)
                  const inMonth = dv && dv.m === visibleMonth.month && dv.y === visibleMonth.year
                  const covering = legsCovering(day, legsRaw)
                  const covered = covering.length > 0
                  const overlap = covering.length > 1
                  const inBounds = bounds ? dateInRange(day, bounds.min, bounds.max) : false
                  const isGap = gaps.has(day) && inBounds
                  const isToday = day === today
                  const isSelected = day === focusedDay
                  const dayEvents = arr('events').filter((e: any) => e.date === day)
                  return (
                    <button
                      key={day}
                      onClick={() => setFocusedDay(day)}
                      aria-label={day}
                      style={{
                        aspectRatio: '1 / 1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                        borderRadius: 10, cursor: 'pointer', padding: 0,
                        border: isSelected ? `2px solid ${accent}` : isToday ? `1px solid ${accent}` : '1px solid transparent',
                        background: isSelected ? `${accent}2e` : covered ? `${accent}1a` : isGap ? (dark ? 'rgba(217,119,6,0.12)' : 'rgba(217,119,6,0.10)') : 'transparent',
                        opacity: inMonth ? 1 : 0.3, color: text,
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: isToday || isSelected ? 800 : 600, lineHeight: 1 }}>{dv?.d}</span>
                      <span style={{ display: 'flex', gap: 2, alignItems: 'center', height: 5 }}>
                        {covered && <span style={{ width: 5, height: 5, borderRadius: '50%', background: accent, display: 'inline-block' }} />}
                        {dayEvents.length > 0 && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#0ea5e9', display: 'inline-block' }} />}
                        {overlap && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />}
                        {isGap && !covered && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#d97706', display: 'inline-block' }} />}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Selected-day detail panel */}
              <div style={{ marginTop: 14, borderTop: `1px solid ${inputBorder}`, paddingTop: 14 }}>
                {!focusedDay ? (
                  <p style={{ margin: 0, color: textMuted, fontSize: 13, textAlign: 'center' }}>Tap a day to see what&apos;s planned.</p>
                ) : (
                  <div style={{ display: 'grid', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>{fmtLegDate(focusedDay)}</div>
                      <button onClick={() => setSelectedDate(focusedDay)} style={{ ...btn(accent), padding: '8px 12px', fontSize: 13 }}>Open day</button>
                    </div>
                    {selCovering.length > 0 ? (
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{selCovering.map((c) => c.label).filter(Boolean).join('  +  ') || 'Untitled leg'}{selCovering[0].country ? <span style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: textSub, marginTop: 2 }}>{selCovering[0].country}</span> : null}</div>
                    ) : selIsGap ? (
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#d97706' }}>Gap — nothing planned for this day</div>
                    ) : (
                      <div style={{ fontSize: 13, color: textMuted }}>No plan recorded for this date.</div>
                    )}
                    {selEvents.map((ev: any, i: number) => (
                      <div key={ev._key || i} style={{ fontSize: 13, color: '#0ea5e9', fontWeight: 600, display: 'flex', gap: 6, alignItems: 'baseline', wordBreak: 'break-word' }}>
                        <span>{ev.eventType === 'arrival' ? '🛬' : '🛫'}</span>
                        <span>{[labelFor(EVENT_TYPES, ev.eventType || 'departure'), labelFor(EVENT_MODES, ev.mode), ev.time, ev.place || ev.carrier].filter(Boolean).join(' · ')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>)
          })()
        ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
          {weekdays.map((w) => <div key={w} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: textMuted, padding: '4px 0' }}>{w}</div>)}
          {gridDays.map((day) => {
            const dv = parseYmd(day)
            const inMonth = dv && dv.m === visibleMonth.month && dv.y === visibleMonth.year
            const covering = legsCovering(day, legsRaw)
            const covered = covering.length > 0
            const overlap = covering.length > 1
            const inBounds = bounds ? dateInRange(day, bounds.min, bounds.max) : false
            const isGap = gaps.has(day) && inBounds
            const isToday = day === today
            const isSelected = day === selectedDate
            const dayEvents = arr('events').filter((e: any) => e.date === day)
            return (
              <button
                key={day}
                onClick={() => setSelectedDate(day)}
                style={{
                  minHeight: isMobile ? 64 : 92, padding: isMobile ? '4px 3px' : '6px 6px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                  border: isSelected ? `2px solid ${accent}` : isToday ? `1px solid ${accent}` : `1px solid ${inputBorder}`,
                  background: covered ? `${accent}1f` : isGap ? (dark ? 'rgba(217,119,6,0.10)' : 'rgba(217,119,6,0.08)') : 'transparent',
                  opacity: inMonth ? 1 : 0.35, color: text, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: isToday ? 800 : 600 }}>{dv?.d}</span>
                  <span style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {dayEvents.length > 0 && <span title={dayEvents.map((e: any) => [labelFor(EVENT_TYPES, e.eventType), e.place || e.carrier, e.time].filter(Boolean).join(' · ')).join('\n')} style={{ fontSize: 9, lineHeight: 1, color: '#0ea5e9' }}>✈</span>}
                    {overlap && <span title="Overlap" style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />}
                    {isGap && <span title="Gap" style={{ width: 6, height: 6, borderRadius: '50%', background: '#d97706', display: 'inline-block' }} />}
                  </span>
                </div>
                {covered && (
                  <span
                    onClick={(e) => { e.stopPropagation(); openLegEditor(covering[0]._key) }}
                    style={{ fontSize: isMobile ? 10 : 12, display: '-webkit-box', WebkitLineClamp: isMobile ? 2 : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.2, color: text, fontWeight: 600, wordBreak: 'break-word', maxWidth: '100%' }}
                    title={covering.map((c) => c.label).join(', ')}
                  >{covering[0].label}</span>
                )}
              </button>
            )
          })}
        </div>
        )}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 12, fontSize: 11, color: textMuted }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: `${accent}1f`, verticalAlign: 'middle', marginRight: 4 }} /> Covered</span>
          <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#0ea5e9', verticalAlign: 'middle', marginRight: 4 }} /> Travel event</span>
          <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#ef4444', verticalAlign: 'middle', marginRight: 4 }} /> Overlap</span>
          <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#d97706', verticalAlign: 'middle', marginRight: 4 }} /> Gap</span>
        </div>
      </div>

      {/* ── Day Lookup ── */}
      {/* ── DAY MODAL ── */}
      {selectedDate && (() => {
        const covering = legsCovering(selectedDate, legsRaw)
        const departure = departureCountryFor(selectedDate, legsRaw)
        const copySummary = () => {
          const summary = buildShareableSummary(selectedDate, legsRaw)
          navigator.clipboard?.writeText(summary).then(() => flash('Copied')).catch(() => setError('Could not copy'))
        }
        return (
          <div onClick={() => setSelectedDate(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? 0 : 20, zIndex: 100 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ ...cardStyle, width: '100%', maxWidth: 560, maxHeight: isMobile ? '92vh' : '90vh', overflowY: 'auto', borderRadius: isMobile ? '18px 18px 0 0' : 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>On {fmtLegDate(selectedDate)}</div>
              <button onClick={() => setSelectedDate(null)} style={{ ...ghostBtn, padding: 8 }}><X size={16} /></button>
            </div>
            {covering.length === 0 ? (
              <p style={{ margin: 0, color: textMuted }}>No plan recorded for this date.</p>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {covering.map((leg) => (
                  <div key={leg._key} style={{ border: `1px solid ${inputBorder}`, borderRadius: 10, padding: 10 }}>
                    <div style={{ fontWeight: 700 }}>{leg.label || 'Untitled'}</div>
                    <div style={{ fontSize: 13, color: textSub, marginBottom: 8 }}>{leg.country || 'No country set'}</div>
                    <label style={labelStyle}>Flying from (departure country)</label>
                    <input style={inputStyle} defaultValue={leg.departureCountry || ''} placeholder="e.g. United Kingdom" onBlur={(e) => editLeg(leg._key, { departureCountry: e.target.value })} />
                  </div>
                ))}
                <div style={{ fontSize: 13, color: text, fontWeight: 600 }}>Flying from: {departure || '—'}</div>
              </div>
            )}
            <div style={{ marginTop: 12 }}>
              <button onClick={copySummary} style={ghostBtn}><Copy size={14} /> Copy summary</button>
            </div>

            {/* Departures & arrivals live in the day modal below (draft-based event editor) */}
            {(() => {
              const dayEvents = arr('events').filter((e: any) => e.date === selectedDate)
              const openNewEvent = () => {
                setDriveTimeMsg('')
                setEventDraft({ _key: uid('travelEvent'), date: selectedDate, eventType: 'departure', mode: 'drive' })
                setEventDraftIsNew(true)
              }
              return (
                <div style={{ marginTop: 16, borderTop: `1px solid ${inputBorder}`, paddingTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>Departures & arrivals</div>
                    <button onClick={openNewEvent} style={btn(accent)}><Plus size={14} /> Add departure/arrival</button>
                  </div>
                  {dayEvents.length === 0 ? (
                    <p style={{ margin: 0, color: textMuted, fontSize: 13 }}>No departures or arrivals on this date.</p>
                  ) : (
                    <div style={{ display: 'grid', gap: 8 }}>
                      {dayEvents.map((ev: any) => {
                        const icon = ev.eventType === 'arrival' ? '🛬' : '🛫'
                        const summary = [
                          labelFor(EVENT_TYPES, ev.eventType || 'departure'),
                          labelFor(EVENT_MODES, ev.mode),
                          ev.time, ev.place || ev.carrier,
                        ].filter(Boolean).join(' · ')
                        return (
                          <div key={ev._key} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', border: `1px solid ${inputBorder}`, borderRadius: 10, padding: '8px 10px' }}>
                            <button
                              onClick={() => { setDriveTimeMsg(''); setEventDraft({ ...ev }); setEventDraftIsNew(false) }}
                              style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: text, textAlign: 'left', minHeight: 40, padding: 0 }}
                            >
                              <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                              <span style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{summary || 'New event'}</span>
                            </button>
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                              <button onClick={() => { setDriveTimeMsg(''); setEventDraft({ ...ev }); setEventDraftIsNew(false) }} style={{ ...ghostBtn, padding: 8 }} title="Edit"><Pencil size={14} /></button>
                              <button onClick={() => { if (confirm('Delete this event?')) removeEvent(ev._key) }} style={{ ...ghostBtn, padding: 8, color: '#ef4444' }} title="Delete"><Trash2 size={14} /></button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
          </div>
        )
      })()}

      {/* ── EVENT MODAL (draft-based) ── */}
      {eventDraft && (() => {
        const draft = eventDraft
        const key = draft._key
        const linked = budgetItemForEvent(key)
        const costNum = Number(draft.cost)
        const hasCost = Number.isFinite(costNum) && costNum > 0
        const amountLabel = hasCost ? fmtMoney(costNum, currency) : ''
        return (
          <div onClick={() => setEventDraft(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? 0 : 20, zIndex: 110 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ ...cardStyle, width: '100%', maxWidth: 620, maxHeight: isMobile ? '92vh' : '90vh', overflowY: 'auto', borderRadius: isMobile ? '18px 18px 0 0' : 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 18 }}>{eventDraftIsNew ? 'Add departure / arrival' : 'Edit departure / arrival'}</h3>
                <button onClick={() => setEventDraft(null)} style={{ ...ghostBtn, padding: 8 }}><X size={16} /></button>
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={grid(2)}>
                  <div>
                    <label style={labelStyle}>Type</label>
                    <select style={{ ...inputStyle, fontSize: 16 }} value={draft.eventType || 'departure'} onChange={(e) => setD({ eventType: e.target.value })}>
                      {EVENT_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Mode</label>
                    <select style={{ ...inputStyle, fontSize: 16 }} value={draft.mode || 'drive'} onChange={(e) => setD({ mode: e.target.value })}>
                      {EVENT_MODES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
                <div style={grid(2)}>
                  <div>
                    <label style={labelStyle}>Date</label>
                    <input type="date" style={{ ...inputStyle, fontSize: 16 }} value={draft.date || ''} onChange={(e) => setD({ date: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Time</label>
                    <input style={{ ...inputStyle, fontSize: 16 }} value={draft.time || ''} placeholder="09:40" onChange={(e) => setD({ time: e.target.value })} />
                  </div>
                </div>
                <div style={grid(2)}>
                  <div>
                    <label style={labelStyle}>Check-in / boarding</label>
                    <input style={{ ...inputStyle, fontSize: 16 }} value={draft.checkInTime || ''} placeholder="08:00" onChange={(e) => setD({ checkInTime: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Place / terminal</label>
                    <input style={{ ...inputStyle, fontSize: 16 }} value={draft.place || ''} placeholder="e.g. Bilbao Airport, Terminal 1" onChange={(e) => setD({ place: e.target.value })} />
                    <button
                      onClick={() => findAirports(draft)}
                      disabled={airportLoading === key}
                      style={{ ...ghostBtn, width: '100%', marginTop: 8 }}
                    >
                      {airportLoading === key ? <Loader2 size={15} className="spin" /> : <Navigation size={15} />} Find nearest airports
                    </button>
                    {airportResults[key]?.length > 0 && (
                      <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
                        {airportResults[key].map((a: any, ai: number) => (
                          <button
                            key={`${a.iata || a.name}-${ai}`}
                            onClick={() => applyAirportToDraft(a)}
                            style={{
                              minHeight: 40, textAlign: 'left', padding: '8px 12px', borderRadius: 8,
                              border: `1px solid ${inputBorder}`, background: dark ? '#ffffff08' : '#00000006',
                              color: text, fontSize: 13, cursor: 'pointer',
                            }}
                          >
                            <span style={{ fontWeight: 700 }}>{a.name}{a.iata ? ` (${a.iata})` : ''}</span>
                            {[a.city, a.approxDistanceKm != null ? `~${a.approxDistanceKm} km` : null].filter(Boolean).length > 0 && (
                              <span style={{ color: textMuted }}> — {[a.city, a.approxDistanceKm != null ? `~${a.approxDistanceKm} km` : null].filter(Boolean).join(' · ')}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div style={grid(2)}>
                  <div>
                    <label style={labelStyle}>From</label>
                    <input style={{ ...inputStyle, fontSize: 16 }} value={draft.fromLocation || ''} onChange={(e) => setD({ fromLocation: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>To</label>
                    <input style={{ ...inputStyle, fontSize: 16 }} value={draft.toLocation || ''} onChange={(e) => setD({ toLocation: e.target.value })} />
                  </div>
                </div>
                {draft.fromLocation?.trim() && draft.toLocation?.trim() && (
                  <div>
                    <button
                      onClick={lookupDriveTime}
                      disabled={driveTimeLoading}
                      style={{ ...ghostBtn, width: '100%' }}
                    >
                      {driveTimeLoading ? <Loader2 size={15} className="spin" /> : <Navigation size={15} />} Look up drive time
                    </button>
                    {driveTimeMsg && (
                      <div style={{ marginTop: 6, fontSize: 13, color: '#ef4444' }}>{driveTimeMsg}</div>
                    )}
                    {Number.isFinite(draft.driveDurationSeconds) && Number.isFinite(draft.driveDistanceMeters) && (
                      <div style={{ marginTop: 6, fontSize: 12, color: textMuted }}>
                        Saved: {driveTimeText(draft.driveDurationSeconds, draft.driveDistanceMeters)}
                      </div>
                    )}
                  </div>
                )}
                <div style={grid(2)}>
                  <div>
                    <label style={labelStyle}>Carrier / operator</label>
                    <input style={{ ...inputStyle, fontSize: 16 }} value={draft.carrier || ''} placeholder="e.g. Brittany Ferries, Ryanair" onChange={(e) => setD({ carrier: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Booking reference</label>
                    <input style={{ ...inputStyle, fontSize: 16 }} value={draft.bookingRef || ''} onChange={(e) => setD({ bookingRef: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Booking / confirmation link</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input style={{ ...inputStyle, fontSize: 16, flex: 1 }} value={draft.bookingLink || ''} placeholder="https://…" onChange={(e) => setD({ bookingLink: e.target.value })} />
                    {draft.bookingLink && <a href={normaliseUrl(draft.bookingLink)} target="_blank" rel="noreferrer" style={{ ...ghostBtn, padding: 10, color: accent, textDecoration: 'none', flexShrink: 0 }} title="Open link"><ExternalLink size={15} /></a>}
                  </div>
                </div>
                <div style={grid(2)}>
                  <div>
                    <label style={labelStyle}>Cost</label>
                    <input type="number" style={{ ...inputStyle, fontSize: 16 }} value={draft.cost ?? ''} onChange={(e) => setD({ cost: e.target.value === '' ? undefined : Number(e.target.value) })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Booked / confirmed</label>
                    <button
                      onClick={() => setD({ booked: !draft.booked })}
                      style={{ ...ghostBtn, width: '100%', borderColor: draft.booked ? '#16a34a' : inputBorder, color: draft.booked ? '#16a34a' : textMuted }}
                    >
                      {draft.booked ? <Check size={15} /> : null} {draft.booked ? 'Booked ✓' : 'Mark booked'}
                    </button>
                  </div>
                </div>
                {hasCost && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                    {linked ? (
                      <>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 40, padding: '0 12px', borderRadius: 8, fontSize: 13, fontWeight: 700, background: '#16a34a22', color: '#16a34a' }}>
                          <Check size={15} /> {draft.booked ? `In budget (${amountLabel} actual)` : `In budget (est ${amountLabel})`}
                        </span>
                        <button onClick={draftAddOrUpdateBudget} style={{ ...ghostBtn, minHeight: 40 }}><Wallet size={15} /> Update</button>
                        <button onClick={draftRemoveBudget} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 13, cursor: 'pointer', padding: '0 4px', minHeight: 40 }}>Remove from budget</button>
                      </>
                    ) : (
                      <button onClick={draftAddOrUpdateBudget} style={{ ...ghostBtn, minHeight: 40 }}><Wallet size={15} /> Add {amountLabel} to budget</button>
                    )}
                  </div>
                )}
                <div>
                  <label style={labelStyle}>Notes</label>
                  <textarea rows={2} style={{ ...inputStyle, fontSize: 16 }} value={draft.notes || ''} onChange={(e) => setD({ notes: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center', marginTop: 18, flexDirection: isMobile ? 'column-reverse' : 'row' }}>
                {!eventDraftIsNew ? (
                  <button onClick={deleteDraftEvent} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 14, cursor: 'pointer', padding: '8px 4px', display: 'flex', alignItems: 'center', gap: 6, minHeight: 44, alignSelf: isMobile ? 'stretch' : 'auto', justifyContent: 'center' }}><Trash2 size={15} /> Delete</button>
                ) : <span />}
                <div style={{ display: 'flex', gap: 10, flexDirection: isMobile ? 'column-reverse' : 'row', width: isMobile ? '100%' : 'auto' }}>
                  <button onClick={() => setEventDraft(null)} style={ghostBtn}>Cancel</button>
                  <button onClick={saveDraftAndClose} style={btn(accent)}>Save</button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Drive Calculator ── */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{ fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Navigation size={16} color={accent} /> Drives</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: textSub }}>
              Max drive per day (hrs)
              <input
                type="number"
                min={1}
                step={0.5}
                value={trip?.maxDriveHours ?? DEFAULT_MAX_DRIVE_HOURS}
                onChange={(e) => saveField('maxDriveHours', Number(e.target.value))}
                onBlur={(e) => saveField('maxDriveHours', Number(e.target.value))}
                style={{ ...inputStyle, width: 72, padding: '8px 10px' }}
              />
            </label>
            {hops.length > 0 && <button onClick={calculateDrives} disabled={aiLoading === 'drive'} style={btn(accent)}>{aiLoading === 'drive' ? <Loader2 size={16} className="spin" /> : <Navigation size={16} />} Calculate drives</button>}
          </div>
        </div>
        {aiLoading === 'drive' && <AiProgress label="Calculating drives…" />}

        {hops.length === 0 ? (
          <p style={{ margin: 0, color: textMuted }}>Add at least two legs to calculate drives between stops.</p>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {driveWarning && <div style={{ fontSize: 13, color: '#d97706', fontWeight: 600 }}>{driveWarning}</div>}
            {hops.map((hop) => {
              const result = driveResults[hop.key]
              const fromLabel = legLabel(hop.fromKey)
              const toLabel = legLabel(hop.toKey)
              const destLeg = legByKey(hop.toKey)
              let body: React.ReactNode
              if (hop.mode !== 'drive') {
                const modeLabel = labelFor(TRAVEL_MODES_LIST, hop.mode)
                if (destLeg?.manualDistanceKm != null || destLeg?.manualDurationMins != null) {
                  const parts = [
                    destLeg?.manualDistanceKm != null ? `${destLeg.manualDistanceKm} km` : null,
                    destLeg?.manualDurationMins != null ? `${destLeg.manualDurationMins} min` : null,
                  ].filter(Boolean).join(' · ')
                  body = <span style={{ color: textSub }}>{modeLabel} — {parts}</span>
                } else {
                  body = <span style={{ color: textMuted }}>{modeLabel} — manual mode, add distance/time on the leg</span>
                }
              } else if (hop.needsCoords) {
                body = <span style={{ color: textMuted }}>Add coordinates to both stops to calculate</span>
              } else if (result?.ok && result.distanceMeters != null && result.durationSeconds != null) {
                body = <span style={{ color: text }}>{metersToMiles1dp(result.distanceMeters)} mi · {metersToKm1dp(result.distanceMeters)} km · {hmText(result.durationSeconds)} · {fmtMoney(fuelCostGBP(result.distanceMeters), currency)}</span>
              } else if (result && !result.ok) {
                body = <span style={{ color: '#ef4444' }}>{result.error === 'no-token' ? 'Routing unavailable — Mapbox not configured' : 'Route unavailable'}</span>
              } else {
                body = <span style={{ color: textMuted }}>Tap “Calculate drives”</span>
              }
              // Over-limit guardrail: only for drive hops with a successful result.
              const isDriveOk = hop.mode === 'drive' && result?.ok && result.durationSeconds != null
              const over = isDriveOk && isOverDriveLimit(result!.durationSeconds!, maxDriveHours)
              const overSeconds = over ? result!.durationSeconds! - maxDriveHours * 3600 : 0
              const split = over ? splitPlan(result!.durationSeconds!, maxDriveHours) : null
              const canSuggest = over && !!hop.from && !!hop.to
              const suggestions = stopSuggestions[hop.key] || []
              return (
                <div key={hop.key} style={{ border: `1px solid ${over ? '#d97706' : inputBorder}`, borderRadius: 10, padding: 10 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>From {fromLabel} → {toLabel}</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>{body}</div>
                  {over && split && (
                    <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
                      <div style={{ fontSize: 13, color: '#d97706', fontWeight: 700 }}>
                        ⚠ {hmText(result!.durationSeconds!)} — {hmText(overSeconds)} over your {maxDriveHours}h max
                      </div>
                      <div style={{ fontSize: 13, color: textSub }}>
                        Split into {split.segments} drives of ~{hmText(split.perSegmentSeconds)} each
                      </div>
                      {canSuggest && (
                        <div>
                          <button
                            onClick={() => suggestStopover(hop)}
                            disabled={aiLoading === `stop-${hop.key}`}
                            style={ghostBtn}
                          >
                            {aiLoading === `stop-${hop.key}` ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />} Suggest a stopover
                          </button>
                        </div>
                      )}
                      {suggestions.length > 0 && (
                        <div style={{ display: 'grid', gap: 6, marginTop: 2 }}>
                          {suggestions.map((s, si) => (
                            <div key={si} style={{ border: `1px solid ${inputBorder}`, borderRadius: 8, padding: 8 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <div style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</div>
                                <button
                                  onClick={() => { addLeg({ label: s.name, notes: s.approxLocation || undefined }); flash(`Added ${s.name} as a leg`) }}
                                  style={{ ...ghostBtn, minHeight: 32, padding: '6px 10px', fontSize: 12 }}
                                >
                                  <Plus size={12} /> Add as leg
                                </button>
                              </div>
                              {s.why && <div style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>{s.why}</div>}
                              {s.approxLocation && <div style={{ fontSize: 12, color: textSub, marginTop: 2 }}>{s.approxLocation}</div>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            {driveTotals && (driveTotals.distanceMeters > 0 || driveTotals.durationSeconds > 0) && (
              <div style={{ borderTop: `1px solid ${inputBorder}`, paddingTop: 10, fontWeight: 700 }}>
                Total: {metersToMiles1dp(driveTotals.distanceMeters)} mi · {metersToKm1dp(driveTotals.distanceMeters)} km · {hmText(driveTotals.durationSeconds)}
              </div>
            )}
            {/* ── Fuel estimate sub-panel ── */}
            {driveTotals && driveTotals.distanceMeters > 0 && (() => {
              const fuelCost = estimateFuelCost(driveTotals.distanceMeters, mpg, fuelPrice)
              const saveFuelToBudget = () => {
                const items = arr('budgetItems')
                const idx = items.findIndex(
                  (b: any) => b?.category === 'fuel' && typeof b?.description === 'string' && b.description.startsWith('Fuel (estimated'),
                )
                let next: any[]
                if (idx >= 0) {
                  next = items.map((b: any, i: number) => (i === idx ? { ...b, estimated: Math.round(fuelCost) } : b))
                } else {
                  next = [
                    ...items,
                    {
                      _type: 'budgetItem',
                      _key: uid('bud'),
                      description: 'Fuel (estimated) — whole route',
                      category: 'fuel',
                      estimated: Math.round(fuelCost),
                      paid: false,
                    },
                  ]
                }
                saveField('budgetItems', next)
                flash('Fuel estimate saved to budget')
              }
              return (
                <div style={{ border: `1px solid ${inputBorder}`, borderRadius: 10, padding: 10, display: 'grid', gap: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Fuel estimate</div>
                  <div style={grid(2)}>
                    <div>
                      <label style={labelStyle}>Van economy (mpg)</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        value={mpg}
                        onChange={(e) => setMpg(Number(e.target.value))}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Fuel price ({currency}/litre)</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step={0.01}
                        value={fuelPrice}
                        onChange={(e) => setFuelPrice(Number(e.target.value))}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: accent }}>{fmtMoney(fuelCost, trip?.currency || 'GBP')}</div>
                  <div style={{ fontSize: 12, color: textMuted }}>
                    for {metersToMiles1dp(driveTotals.distanceMeters)} mi of driving
                  </div>
                  <div>
                    <button onClick={saveFuelToBudget} style={ghostBtn}>Save fuel to budget</button>
                  </div>
                  <div style={{ fontSize: 12, color: textMuted }}>
                    Covers only the drive legs the calculator measured — ferries and manual legs are excluded.
                  </div>
                </div>
              )
            })()}
            {/* ── Road tolls & vignettes preset ── */}
            {(() => {
              const addTollPresets = () => {
                const presets = [
                  { description: 'Switzerland motorway vignette (annual)', category: 'ferry_tolls', estimated: 36 },
                  { description: 'Slovenia vignette (monthly)', category: 'ferry_tolls', estimated: 26 },
                  { description: 'Austria vignette (10-day/2-month)', category: 'ferry_tolls', estimated: 22 },
                  { description: 'France/Italy motorway tolls (estimate)', category: 'ferry_tolls', estimated: 120 },
                  { description: 'France Passion membership', category: 'fees', estimated: 30 },
                  { description: 'Agricamper Italia membership', category: 'fees', estimated: 35 },
                ]
                const items = arr('budgetItems')
                const existing = new Set(
                  items
                    .map((b: any) => (typeof b?.description === 'string' ? b.description.toLowerCase() : ''))
                    .filter(Boolean),
                )
                const toAdd = presets.filter((p2) => !existing.has(p2.description.toLowerCase()))
                if (toAdd.length === 0) {
                  flash('Already added')
                  return
                }
                const next = [
                  ...items,
                  ...toAdd.map((p2) => ({
                    _type: 'budgetItem',
                    _key: uid('bud'),
                    description: p2.description,
                    category: p2.category,
                    estimated: p2.estimated,
                    paid: false,
                  })),
                ]
                saveField('budgetItems', next)
                flash(`Added ${toAdd.length} toll/vignette estimate${toAdd.length === 1 ? '' : 's'}`)
              }
              return (
                <div style={{ display: 'grid', gap: 4 }}>
                  <div>
                    <button onClick={addTollPresets} style={ghostBtn}>Add road tolls &amp; vignettes</button>
                  </div>
                  <div style={{ fontSize: 12, color: textMuted }}>Rough estimates — verify current prices.</div>
                </div>
              )
            })()}
            {(() => {
              const okResults = Object.values(driveResults).filter((r) => r.ok && r.durationSeconds != null)
              if (okResults.length === 0) return null
              const summary = overLimitSummary(okResults, maxDriveHours)
              if (summary.overCount > 0) {
                return (
                  <div style={{ borderRadius: 10, padding: 10, background: '#d977061a', border: '1px solid #d97706', color: '#b45309', fontWeight: 700, fontSize: 13 }}>
                    {summary.overCount} drive{summary.overCount === 1 ? '' : 's'} exceed your {maxDriveHours}h limit — longest is {hmText(summary.worstOverSeconds)} over.
                  </div>
                )
              }
              return (
                <div style={{ borderRadius: 10, padding: 10, background: '#16a34a1a', border: '1px solid #16a34a', color: '#15803d', fontWeight: 700, fontSize: 13 }}>
                  All drives are within your {maxDriveHours}h limit ✓
                </div>
              )
            })()}
          </div>
        )}
      </div>

      {/* ── Drive range map ── */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Globe size={16} color={accent} /> Drive range — how far can I get?</div>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: textSub, lineHeight: 1.5 }}>
              See roughly how far you can drive from a start point within your {maxDriveHours}h limit. Shaded zone = up to 1 hour (precise); rings = approx {maxDriveHours}h range.
            </p>
          </div>
          <button onClick={() => setRangeOpen((o) => !o)} style={ghostBtn}>
            {rangeOpen ? <X size={14} /> : <MapPin size={14} />} {rangeOpen ? 'Hide map' : 'Show map'}
          </button>
        </div>

        {rangeOpen && (
          !MAPBOX_PUBLIC_TOKEN ? (
            <div style={{ marginTop: 14, borderRadius: 10, padding: 12, background: '#d977061a', border: '1px solid #d97706', color: '#b45309', fontSize: 13, fontWeight: 600 }}>
              Interactive map needs NEXT_PUBLIC_MAPBOX_TOKEN
            </div>
          ) : (
            <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
              {/* Start-point picker */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {legsWithCoords.length > 0 && (
                  <select
                    value={rangeStartLeg}
                    onChange={(e) => pickLegAsCenter(e.target.value)}
                    style={{ ...inputStyle, width: 'auto', minWidth: 160, flex: isMobile ? '1 1 100%' : '0 0 auto' }}
                  >
                    <option value="">Start from a leg…</option>
                    {legsWithCoords.map((l) => <option key={l._key} value={l._key}>{l.label || 'Untitled'}</option>)}
                  </select>
                )}
                <button onClick={useMyLocation} style={ghostBtn}><Navigation size={14} /> Near me</button>
                <div style={{ display: 'flex', gap: 6, flex: isMobile ? '1 1 100%' : '1 1 220px', minWidth: 180 }}>
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    placeholder="Search a place…"
                    value={rangeQuery}
                    onChange={(e) => setRangeQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') searchRangeCenter() }}
                  />
                  <button onClick={searchRangeCenter} disabled={rangeSearching} style={{ ...ghostBtn, flexShrink: 0 }}>
                    {rangeSearching ? <Loader2 size={14} className="spin" /> : <MapPin size={14} />} Search
                  </button>
                </div>
              </div>

              {/* Status line */}
              <div style={{ fontSize: 13, color: textSub, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {rangeLoading && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: textMuted }}><Loader2 size={13} className="spin" /> Working out your range…</span>}
                {!rangeLoading && rangeCenter && <span>From <strong style={{ color: text }}>{rangeData?.centerName || rangeCenter.label}</strong></span>}
                {!rangeLoading && !rangeCenter && <span style={{ color: textMuted }}>Pick a start point above to see your drive range.</span>}
                {rangeData?.rings?.map((r, i) => (
                  <span key={i} style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 50, background: `${accent}18`, color: accent }}>{r.hours}h ≈ {r.km} km</span>
                ))}
              </div>

              {/* Accurate (real routing) boundary — on demand */}
              {rangeCenter && (
                <div style={{ display: 'grid', gap: 6 }}>
                  <button
                    onClick={fetchBoundary}
                    disabled={boundaryLoading}
                    style={{ ...btn(accent), width: isMobile ? '100%' : 'auto', minHeight: 44, justifySelf: isMobile ? 'stretch' : 'start' }}
                  >
                    {boundaryLoading ? <Loader2 size={15} className="spin" /> : <Globe size={15} />} Get accurate boundary ({maxDriveHours}h)
                  </button>
                  <span style={{ fontSize: 12, color: textMuted, lineHeight: 1.4 }}>
                    Real drive-time boundary from routing (~16 directions, takes a few seconds).
                  </span>
                </div>
              )}

              {/* Map */}
              <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${inputBorder}`, position: 'relative' }}>
                <div ref={rangeMapContainer} style={{ width: '100%', height: isMobile ? 300 : 360 }} />
                {clickedPoint && (
                  <div style={{ position: 'absolute', left: 12, bottom: 12, right: 12, maxWidth: 320, background: dark ? '#1c1c1c' : '#fff', border: `1px solid ${inputBorder}`, borderRadius: 12, padding: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: text, marginBottom: 8 }}>{clickedPoint.name}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={addClickedAsLeg} style={{ ...btn(accent), minHeight: 36, padding: '8px 12px', fontSize: 13 }}><Plus size={14} /> Add as leg here</button>
                      <button onClick={() => setClickedPoint(null)} style={{ ...ghostBtn, minHeight: 36, padding: '8px 12px', fontSize: 13 }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 12, color: textMuted, lineHeight: 1.5 }}>
                Dashed rings are an approximate straight-line range (~80 km/h); the light shaded zone is a precise reachable area up to 1 hour. The bold solid shaded area{boundaryData ? '' : ', once fetched,'} is the real drive-time boundary from live routing. Tap the map to drop a pin and add it as a leg.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  )
}

// Inline picker listing saved places/opportunities that have coordinates.
function SavedPicker(props: {
  places: any[]; opps: any[]
  onPick: (kind: 'place' | 'opportunity', item: any) => void
  onClose: () => void
  cardStyle: React.CSSProperties; inputBorder: string; text: string; textSub: string; textMuted: string; accent: string; dark: boolean
}) {
  const { places, opps, onPick, onClose, inputBorder, text, textSub, textMuted, accent, dark } = props
  const row = (kind: 'place' | 'opportunity', item: any) => (
    <button key={item._key} onClick={() => onPick(kind, item)}
      style={{ display: 'flex', width: '100%', textAlign: 'left', gap: 10, alignItems: 'center', padding: '10px 12px', background: 'none', border: 'none', borderBottom: `1px solid ${inputBorder}`, cursor: 'pointer', color: text }}>
      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6, background: kind === 'place' ? '#0ea5e922' : '#16a34a22', color: kind === 'place' ? '#0ea5e9' : '#16a34a', flexShrink: 0 }}>{kind === 'place' ? 'place' : 'work/stay'}</span>
      <span style={{ fontSize: 14 }}>{item.name || item.label || 'Untitled'}</span>
    </button>
  )
  return (
    <div style={{ border: `1px solid ${inputBorder}`, borderRadius: 12, background: dark ? '#111' : '#fff', marginBottom: 12, maxHeight: 280, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: `1px solid ${inputBorder}` }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: textSub }}>Add a leg from a saved location</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textMuted, display: 'flex', padding: 0 }}><X size={14} /></button>
      </div>
      {places.length === 0 && opps.length === 0 && <div style={{ padding: 14, color: textMuted, fontSize: 13 }}>No saved locations with coordinates yet.</div>}
      {places.map((it) => row('place', it))}
      {opps.map((it) => row('opportunity', it))}
    </div>
  )
}

function ContentTab(p: any) {
  const { arr, addItem, updateItem, removeItem, saveField, cardStyle, inputStyle, labelStyle, ghostBtn, btn, accent, textSub, textMuted, text, dark, aiContentIdeas, aiAccountContent, aiFindMustTry, aiLoading, grid, contentQuery, contentResults, contentSearching, searchContent, linkContent, unlinkContent, inputBorder, trip, flash, isMobile } = p
  const items = arr('contentIdeas')
  const mustTry = arr('mustTryList')
  const linked = trip?.linkedContentResolved || []
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [mtGeo, setMtGeo] = useState<string>('')
  const [channelsOpen, setChannelsOpen] = useState<boolean>(false)

  // Geocode a must-try item's location and pin it on the Route Map as a Food place.
  const addMustTryToMap = async (m: any) => {
    const query = (m.whereToFind || m.region || m.name || '').toString().trim()
    if (!query) { flash?.('No location to map — add a "where to find" or region'); return }
    const already = (arr('places') || []).some((pl: any) => (pl?.name || '').toString().trim().toLowerCase() === (m.name || '').toString().trim().toLowerCase())
    if (already) { flash?.(`"${m.name}" is already on the map`); return }
    setMtGeo(m._key)
    try {
      const res = await fetch('/api/admin/travel-planner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'geocode', query }),
      })
      const data = await res.json()
      const first = (Array.isArray(data.results) ? data.results : [])[0]
      if (!first || !Number.isFinite(first.lat) || !Number.isFinite(first.lng)) {
        flash?.('Could not find that location on the map')
        setMtGeo(''); return
      }
      addItem('places', 'place', {
        name: m.name,
        placeType: 'Food',
        location: m.whereToFind || m.region || '',
        why: m.why || '',
        coordinates: { _type: 'geopoint', lat: first.lat, lng: first.lng },
        priority: 'High',
        visited: false,
      })
      flash?.(`Added "${m.name}" to the map`)
    } catch {
      flash?.('Could not add to map — try again')
    } finally {
      setMtGeo('')
    }
  }

  // Per-trip social accounts drive the generator sub-tabs and the filter chips.
  // Fall back to the three defaults when the trip has none saved yet.
  const DEFAULT_ACCOUNTS = [
    { key: 'vanlife_eats', label: 'Vanlife Eats', handle: '', niche: 'Food-led vanlife — recipes, regional produce, cooking from the road.', isFood: true },
    { key: 'from_van_to_sea', label: 'From Van to Sea', handle: '', niche: 'Coastal & ocean adventures — beaches, surf, seafood, waterside park-ups.', isFood: false },
    { key: 'wise_way_round', label: 'Wise Way Round', handle: '', niche: 'Slow, thoughtful travel — culture, people, the road less taken.', isFood: false },
  ]
  const accounts = (Array.isArray(trip?.socialAccounts) && trip.socialAccounts.length > 0) ? trip.socialAccounts : DEFAULT_ACCOUNTS
  const labelForAccount = (key?: string) => accounts.find((a: any) => a.key === key)?.label || key || ''

  // Seed the default channels into the trip once, so they become real editable
  // rows (removable, renamable) rather than a hardcoded fallback. This keeps the
  // feature fully data-driven — important if the planner becomes multi-user.
  useEffect(() => {
    if (!trip?._id) return
    if (Array.isArray(trip?.socialAccounts) && trip.socialAccounts.length > 0) return
    const seeded = DEFAULT_ACCOUNTS.map((a) => ({ _type: 'socialAccount', _key: uid('acct'), key: a.key, label: a.label, handle: a.handle, niche: a.niche, isFood: a.isFood }))
    saveField('socialAccounts', seeded)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip?._id])

  // Selected account sub-tab for the AI content-ideas generator.
  const [account, setAccount] = useState(accounts[0]?.key || 'vanlife_eats')
  const activeAccount = accounts.find((a: any) => a.key === account) || accounts[0]
  // Filter over the saved content-ideas list (separate from the generator sub-tab above).
  const [filterAccount, setFilterAccount] = useState<string>('all')
  // Which content panel is showing. Splits the tab into focused sections
  // (ideas / must-try food / linked content) instead of one long scroll.
  const [section, setSection] = useState<'ideas' | 'musttry' | 'linked' | 'diary'>('ideas')

  // ── Accounts manager ──
  // Editing writes back to trip.socialAccounts. If the trip has none yet, seed
  // from the defaults first so they become real editable rows (with keys).
  const seedAccounts = () => {
    return DEFAULT_ACCOUNTS.map((a) => ({ _type: 'socialAccount', _key: uid('acct'), key: a.key, label: a.label, handle: a.handle, niche: a.niche, isFood: a.isFood }))
  }
  const currentAccountRows = () => {
    if (Array.isArray(trip?.socialAccounts) && trip.socialAccounts.length > 0) return [...trip.socialAccounts]
    return seedAccounts()
  }
  const updateAccount = (idx: number, patch: Record<string, any>) => {
    const rows = currentAccountRows()
    if (!rows[idx]) return
    rows[idx] = { ...rows[idx], ...patch }
    saveField('socialAccounts', rows)
  }
  const removeAccount = (idx: number) => {
    const rows = currentAccountRows()
    rows.splice(idx, 1)
    saveField('socialAccounts', rows)
  }
  const addAccount = () => {
    const rows = currentAccountRows()
    rows.push({ _type: 'socialAccount', _key: uid('acct'), key: uid('acctk'), label: 'New channel', handle: '', niche: '', isFood: false })
    saveField('socialAccounts', rows)
  }

  const addTags = (idx: number, raw: string) => {
    const current: string[] = Array.isArray(items[idx].hashtags) ? items[idx].hashtags : []
    const merged = [...current, ...cleanHashtags(raw)]
    // de-dupe (case-insensitive), keep order
    const seen = new Set<string>()
    const deduped = merged.filter((t) => { const k = t.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true })
    updateItem('contentIdeas', idx, { hashtags: deduped })
  }
  const removeTag = (idx: number, tag: string) => {
    const current: string[] = Array.isArray(items[idx].hashtags) ? items[idx].hashtags : []
    updateItem('contentIdeas', idx, { hashtags: current.filter((t) => t !== tag) })
  }
  const copyTags = (idx: number, tags: string[]) => {
    navigator.clipboard?.writeText(tags.join(' ')).then(() => {
      setCopiedIdx(idx); setTimeout(() => setCopiedIdx((c) => (c === idx ? null : c)), 1500)
    }).catch(() => {})
  }
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Accounts manager — drives the generators and filter */}
      <div style={cardStyle}>
        <button
          onClick={() => setChannelsOpen((o) => !o)}
          aria-expanded={channelsOpen}
          style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%' }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 16, display: 'inline-flex', alignItems: 'center', gap: 8 }}><Users size={16} color={accent} /> Your channels</span>
            <span style={{ fontSize: 12, color: textMuted, fontWeight: 600 }}>{accounts.length}</span>
          </span>
          <ChevronRight size={16} style={{ flexShrink: 0, transform: channelsOpen ? 'rotate(90deg)' : 'none', transition: 'transform .15s', color: textMuted }} />
        </button>
        {channelsOpen && (<>
        <div style={{ fontSize: 13, color: textSub, margin: '8px 0 12px' }}>These drive the content generators and filter.</div>
        <div style={{ display: 'grid', gap: 10 }}>
          {accounts.map((a: any, idx: number) => (
            <div key={a._key || a.key || idx} style={{ border: `1px solid ${inputBorder}`, borderRadius: 12, padding: 12, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <input
                style={{ ...inputStyle, flex: '2 1 160px', fontWeight: 700 }}
                defaultValue={a.label || ''}
                placeholder="Channel name"
                onBlur={(e) => { if (e.target.value !== (a.label || '')) updateAccount(idx, { label: e.target.value }) }}
              />
              <input
                style={{ ...inputStyle, flex: '2 1 160px' }}
                defaultValue={a.handle || ''}
                placeholder="Handle / link"
                onBlur={(e) => { if (e.target.value !== (a.handle || '')) updateAccount(idx, { handle: e.target.value }) }}
              />
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: textSub, cursor: 'pointer', flexShrink: 0 }}>
                <input type="checkbox" checked={!!a.isFood} onChange={(e) => updateAccount(idx, { isFood: e.target.checked })} /> Food channel
              </label>
              <button onClick={() => removeAccount(idx)} style={{ ...ghostBtn, padding: 8, color: '#ef4444', flexShrink: 0 }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button onClick={addAccount} style={ghostBtn}><Plus size={14} /> Add channel</button>
        </div>
        </>)}
      </div>

      {/* Section sub-navigation — keeps each content type in its own focused panel */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {([
          { value: 'ideas', label: 'Content ideas', icon: <Sparkles size={15} />, count: items.length },
          { value: 'diary', label: 'Diary', icon: <BookOpen size={15} />, count: arr('diary').length },
          { value: 'musttry', label: 'Must-try food', icon: <Utensils size={15} />, count: mustTry.length },
          { value: 'linked', label: 'Linked content', icon: <LinkIcon size={15} />, count: linked.length },
        ] as const).map((t) => {
          const on = t.value === section
          return (
            <button
              key={t.value}
              onClick={() => setSection(t.value)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 15px', borderRadius: 12,
                fontSize: 14, fontWeight: 700, cursor: 'pointer', minHeight: 42,
                border: `1px solid ${on ? accent : inputBorder}`,
                background: on ? accent : 'transparent',
                color: on ? '#fff' : text,
              }}
            >{t.icon} {t.label}{t.count > 0 && <span style={{ fontSize: 12, fontWeight: 700, padding: '1px 8px', borderRadius: 20, background: on ? 'rgba(255,255,255,0.25)' : 'rgba(127,127,127,0.15)', color: on ? '#fff' : textSub }}>{t.count}</span>}</button>
          )
        })}
      </div>

      {/* ── DIARY SECTION ── */}
      {section === 'diary' && (
        <DiaryTab
          trip={trip} arr={arr} addItem={addItem} updateItem={updateItem} removeItem={removeItem} saveField={saveField} flash={flash}
          cardStyle={cardStyle} inputStyle={inputStyle} labelStyle={labelStyle} ghostBtn={ghostBtn} btn={btn}
          accent={accent} textSub={textSub} textMuted={textMuted} text={text} dark={dark} inputBorder={inputBorder}
          grid={grid} isMobile={isMobile}
        />
      )}

      {/* ── CONTENT IDEAS SECTION ── */}
      {section === 'ideas' && (
      <div style={{ display: 'grid', gap: 16 }}>

      {/* AI: content ideas by account */}
      <div style={cardStyle}>
        <div style={{ fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}><Sparkles size={16} color={accent} /> AI: content ideas by account</div>
        <div style={{ fontSize: 13, color: textSub, marginBottom: 12 }}>Route-aware ideas tailored to each account&apos;s niche, saved with the account &amp; format.</div>
        {/* Account sub-tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {accounts.map((a: any) => {
            const on = a.key === account
            return (
              <button
                key={a.key}
                onClick={() => setAccount(a.key)}
                style={{
                  padding: '7px 13px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  border: `1px solid ${on ? accent : inputBorder}`,
                  background: on ? accent : 'transparent',
                  color: on ? '#fff' : text,
                }}
              >{a.label}</button>
            )
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px', fontSize: 13, color: textSub }}>{activeAccount?.niche}</div>
          <button
            onClick={() => aiAccountContent(activeAccount)}
            disabled={aiLoading === 'account-' + account}
            style={{ ...btn(accent), flex: '1 1 auto', maxWidth: '100%' }}
          >{aiLoading === 'account-' + account ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />} Generate for {activeAccount?.label}</button>
        </div>
        <div style={{ fontSize: 12, color: textMuted, marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Check size={12} /> Adds ideas to your content list — never overwrites existing ideas.</div>
        {aiLoading === 'account-' + account && <AiProgress label={'Generating ideas for ' + activeAccount?.label + '…'} />}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => addItem('contentIdeas', 'contentIdea', { title: '', status: 'idea' })} style={ghostBtn}><Plus size={14} /> Add idea manually</button>
      </div>
      {items.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { value: 'all', label: 'All', count: items.length },
            ...accounts.map((a: any) => ({ value: a.key, label: a.label, count: items.filter((i: any) => i.account === a.key).length })),
            { value: 'unassigned', label: 'Unassigned', count: items.filter((i: any) => !i.account).length },
          ].map((f) => {
            const on = f.value === filterAccount
            return (
              <button
                key={f.value}
                onClick={() => setFilterAccount(f.value)}
                style={{
                  padding: '7px 13px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  border: `1px solid ${on ? accent : inputBorder}`,
                  background: on ? accent : 'transparent',
                  color: on ? '#fff' : text,
                }}
              >{f.label} ({f.count})</button>
            )
          })}
        </div>
      )}
      <div style={{ display: 'grid', gap: 10 }}>
        {items.length === 0 && <div style={{ ...cardStyle, textAlign: 'center', color: textMuted, padding: 40 }}><Sparkles size={26} style={{ opacity: 0.5, marginBottom: 8 }} /><p style={{ margin: 0 }}>No content ideas yet.</p></div>}
        {items.length > 0 && items.filter((it: any) => filterAccount === 'all' ? true : filterAccount === 'unassigned' ? !it.account : it.account === filterAccount).length === 0 && (
          <div style={{ ...cardStyle, textAlign: 'center', color: textMuted, padding: 24 }}><p style={{ margin: 0, fontSize: 13 }}>No ideas for this channel yet — generate some above.</p></div>
        )}
        {items
          .map((it: any, idx: number) => ({ it, idx }))
          .filter(({ it }: any) => filterAccount === 'all' ? true : filterAccount === 'unassigned' ? !it.account : it.account === filterAccount)
          .map(({ it, idx }: any) => (
          <div key={it._key || idx} style={cardStyle}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
              <input style={{ ...inputStyle, fontWeight: 700 }} defaultValue={it.title || ''} placeholder="Content title" onBlur={(e) => updateItem('contentIdeas', idx, { title: e.target.value })} />
              <button onClick={() => removeItem('contentIdeas', idx)} style={{ ...ghostBtn, padding: 8, color: '#ef4444' }}><Trash2 size={14} /></button>
            </div>
            {(it.account || it.location) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {it.account && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: `${accent}18`, color: accent }}>{labelForAccount(it.account)}</span>}
                {it.location && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: 'rgba(127,127,127,0.12)', color: textSub }}><MapPin size={11} /> {it.location}</span>}
              </div>
            )}
            <div style={{ ...grid(3), marginBottom: 10 }}>
              <div><label style={labelStyle}>Format</label><select style={inputStyle} value={it.format || ''} onChange={(e) => updateItem('contentIdeas', idx, { format: e.target.value })}><option value="">—</option>{CONTENT_FORMATS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}</select></div>
              <div><label style={labelStyle}>Platform</label><input style={inputStyle} defaultValue={it.platform || ''} placeholder="Instagram, YouTube..." onBlur={(e) => updateItem('contentIdeas', idx, { platform: e.target.value })} /></div>
              <div><label style={labelStyle}>Status</label><select style={inputStyle} value={it.status || 'idea'} onChange={(e) => updateItem('contentIdeas', idx, { status: e.target.value })}>{CONTENT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
            </div>
            <label style={labelStyle}>Notes / angle</label>
            <textarea style={{ ...inputStyle, minHeight: 50, resize: 'vertical', marginBottom: 8 }} defaultValue={it.notes || ''} onBlur={(e) => updateItem('contentIdeas', idx, { notes: e.target.value })} />

            {/* Hashtags */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={labelStyle}>Hashtags</label>
              {Array.isArray(it.hashtags) && it.hashtags.length > 0 && (
                <button onClick={() => copyTags(idx, it.hashtags)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedIdx === idx ? '#16a34a' : accent, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, padding: 0 }}>
                  {copiedIdx === idx ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy all</>}
                </button>
              )}
            </div>
            {Array.isArray(it.hashtags) && it.hashtags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {it.hashtags.map((tag: string) => (
                  <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '4px 9px', borderRadius: 20, background: `${accent}18`, color: accent, fontWeight: 600 }}>
                    {tag}
                    <button onClick={() => removeTag(idx, tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: accent, display: 'flex', padding: 0, opacity: 0.7 }}><X size={12} /></button>
                  </span>
                ))}
              </div>
            )}
            <input
              style={{ ...inputStyle, marginBottom: 8 }}
              placeholder="Add hashtags (space or comma to separate, Enter to add)"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault()
                  const v = (e.target as HTMLInputElement).value
                  if (v.trim()) { addTags(idx, v); (e.target as HTMLInputElement).value = '' }
                }
              }}
              onBlur={(e) => { if (e.target.value.trim()) { addTags(idx, e.target.value); e.target.value = '' } }}
            />

            <label style={labelStyle}>Outline / script</label>
            <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} defaultValue={it.outline || ''} onBlur={(e) => updateItem('contentIdeas', idx, { outline: e.target.value })} />
          </div>
        ))}
      </div>
      </div>
      )}

      {/* ── MUST-TRY FOOD SECTION ── */}
      {section === 'musttry' && (
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
          <div style={{ fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Utensils size={16} color={accent} /> Must-try dishes, delicacies &amp; produce</div>
          <button
            onClick={aiFindMustTry}
            disabled={aiLoading === 'musttry'}
            style={{ ...btn(accent), flexShrink: 0 }}
          >{aiLoading === 'musttry' ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />} Find must-tries</button>
        </div>
        {aiLoading === 'musttry' && <AiProgress label="Finding local specialities…" />}
        <div style={{ fontSize: 12, color: textMuted, marginTop: 8, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><Check size={12} /> Adds to your list — never overwrites.</div>
        <div style={{ fontSize: 13, color: textSub, marginBottom: mustTry.length ? 14 : 0 }}>Local specialities worth seeking out along your route — not recipes, just what to eat &amp; buy.</div>
        {mustTry.length === 0 ? (
          <div style={{ textAlign: 'center', color: textMuted, padding: 24, border: `1px dashed ${inputBorder}`, borderRadius: 10 }}>
            <Utensils size={22} style={{ opacity: 0.5, marginBottom: 6 }} />
            <p style={{ margin: 0, fontSize: 13 }}>No must-try picks yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {mustTry.map((m: any, idx: number) => {
              const kindMap: Record<string, { label: string; color: string }> = {
                dish: { label: 'Dish', color: '#f59e0b' },
                delicacy: { label: 'Delicacy', color: '#8b5cf6' },
                produce: { label: 'Produce', color: '#16a34a' },
              }
              const kind = kindMap[m.kind] || null
              return (
                <div key={m._key || idx} style={{ border: `1px solid ${inputBorder}`, borderRadius: 12, padding: 14 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{m.name || 'Untitled'}</div>
                    <button onClick={() => removeItem('mustTryList', idx)} style={{ ...ghostBtn, padding: 8, color: '#ef4444', flexShrink: 0 }}><Trash2 size={14} /></button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '6px 0' }}>
                    {kind && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: `${kind.color}22`, color: kind.color }}>{kind.label}</span>}
                    {m.region && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: 'rgba(127,127,127,0.12)', color: textSub }}><MapPin size={11} /> {m.region}</span>}
                  </div>
                  {m.why && <div style={{ fontSize: 13, color: textSub, marginBottom: 8 }}>{m.why}</div>}
                  {m.whereToFind && <div style={{ fontSize: 13, color: textMuted, display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 8 }}><MapPin size={13} style={{ marginTop: 2, flexShrink: 0 }} /> Where: {m.whereToFind}</div>}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: textSub, cursor: 'pointer' }}>
                      <input type="checkbox" checked={!!m.tried} onChange={(e) => updateItem('mustTryList', idx, { tried: e.target.checked })} /> Tried
                    </label>
                    <button
                      onClick={() => addMustTryToMap(m)}
                      disabled={mtGeo === m._key}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, minHeight: 34, background: '#d86213', color: '#fff' }}
                      title="Geocode this location and pin it on the Route Map"
                    >{mtGeo === m._key ? <Loader2 size={14} className="spin" /> : <MapPin size={14} />} Add to map</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      )}

      {/* ── LINKED CONTENT SECTION ── */}
      {section === 'linked' && (
      <div style={cardStyle}>
        <div style={{ fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}><LinkIcon size={16} color={accent} /> Linked recipes &amp; articles</div>
        <div style={{ fontSize: 13, color: textSub, marginBottom: 12 }}>Tie this trip to published content it produced or inspired.</div>
        <div style={{ position: 'relative', marginBottom: linked.length ? 14 : 0 }}>
          <input style={inputStyle} value={contentQuery} onChange={(e) => searchContent(e.target.value)} placeholder="Search recipes & articles by title..." />
          {(contentSearching || contentResults.length > 0) && contentQuery.trim().length >= 2 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: dark ? '#111' : '#fff', border: `1px solid ${inputBorder}`, borderRadius: 10, zIndex: 10, maxHeight: 260, overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
              {contentSearching ? (
                <div style={{ padding: 14, color: textMuted, fontSize: 13 }}><Loader2 size={14} className="spin" /> Searching…</div>
              ) : contentResults.map((r: any) => (
                <button key={r._id} onClick={() => linkContent(r)} style={{ display: 'flex', width: '100%', textAlign: 'left', gap: 10, alignItems: 'center', padding: '10px 12px', background: 'none', border: 'none', borderBottom: `1px solid ${inputBorder}`, cursor: 'pointer', color: text }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 6, background: r._type === 'recipe' ? '#16a34a22' : '#8b5cf622', color: r._type === 'recipe' ? '#16a34a' : '#8b5cf6', flexShrink: 0 }}>{r._type}</span>
                  <span style={{ fontSize: 14 }}>{r.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {linked.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {linked.map((r: any) => (
              <span key={r._id} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '6px 10px', borderRadius: 10, background: 'rgba(127,127,127,0.1)', color: text }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: r._type === 'recipe' ? '#16a34a' : '#8b5cf6' }}>{r._type}</span>
                {r.slug ? <a href={`https://vanlifeeats.com/${r._type === 'recipe' ? 'recipes' : 'articles'}/${r.slug}`} target="_blank" rel="noreferrer" style={{ color: text, textDecoration: 'none' }}>{r.title}</a> : r.title}
                <button onClick={() => unlinkContent(r._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textMuted, display: 'flex', padding: 0 }}><X size={14} /></button>
              </span>
            ))}
          </div>
        )}
      </div>
      )}
    </div>
  )
}

function BudgetTab(p: any) {
  const { trip, arr, addItem, updateItem, removeItem, setField, saveField, patchTrip, cardStyle, inputStyle, labelStyle, ghostBtn, btn, accent, textSub, textMuted, text, border, dark, grid, isMobile } = p
  const items: any[] = arr('budgetItems')
  const currency = trip?.currency || 'GBP'

  // ── Food & drink estimate ──
  // A rough per-day food & drink allowance across the whole trip. Days default
  // to the trip's inclusive length (timezone-safe) and re-sync when the trip
  // dates change; the per-day rate is a simple editable figure.
  const tripDays = inclusiveDayCount(trip?.startDate, trip?.endDate)
  const [foodDays, setFoodDays] = useState<number>(tripDays || 0)
  const [perDay, setPerDay] = useState<number>(20)
  useEffect(() => {
    setFoodDays(tripDays || 0)
  }, [tripDays])
  const foodTotal = Math.max(0, Math.round((Number(foodDays) || 0) * (Number(perDay) || 0)))
  const saveFoodToBudget = () => {
    const list = arr('budgetItems')
    const idx = list.findIndex(
      (b: any) =>
        b?.category === 'food_drink' &&
        typeof b?.description === 'string' &&
        b.description.startsWith('Food & drink (estimated'),
    )
    let next: any[]
    if (idx >= 0) {
      next = list.map((b: any, i: number) => (i === idx ? { ...b, estimated: foodTotal } : b))
    } else {
      next = [
        ...list,
        {
          _type: 'budgetItem',
          _key: uid('bud'),
          description: 'Food & drink (estimated) — whole trip',
          category: 'food_drink',
          estimated: foodTotal,
          paid: false,
        },
      ]
    }
    saveField('budgetItems', next)
  }
  // Progressive disclosure: the per-category Budget_Breakdown starts collapsed.
  // The Budget_Total/summary and the add-cost control stay visible. Breakdown
  // values derive from arr('budgetItems') on the trip, so collapsing loses no data.
  const [budgetBreakdownOpen, setBudgetBreakdownOpen] = useState(false)

  // Totals
  const num = (v: any) => (typeof v === 'number' ? v : Number(v) || 0)
  const hasActual = (it: any) => it.actual != null && it.actual !== '' && Number.isFinite(num(it.actual))
  // Simple, user-friendly model: Estimate (total forecast), Paid (money out), Remaining (still to pay).
  const totalEstimated = items.reduce((s, it) => s + num(it.estimated), 0)
  const totalPaid = items.reduce((s, it) => s + (it.paid ? (hasActual(it) ? num(it.actual) : num(it.estimated)) : 0), 0)
  const remaining = Math.max(0, totalEstimated - totalPaid)
  // Paid progress against the whole estimate (how much of the trip is settled).
  const pct = totalEstimated > 0 ? Math.min(100, Math.round((totalPaid / totalEstimated) * 100)) : 0

  // Category breakdown (by estimated cost)
  const byCat: Record<string, number> = {}
  items.forEach((it) => {
    const k = it.category || 'other'
    byCat[k] = (byCat[k] || 0) + num(it.estimated)
  })
  const catRows = Object.entries(byCat).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])

  const stat = (label: string, value: string, color?: string, hint?: string) => (
    <div style={{ flex: '1 1 120px', minWidth: 0 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, color: color || text, marginTop: 2 }}>{value}</div>
      {hint && <div style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>{hint}</div>}
    </div>
  )

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Summary */}
      <div style={cardStyle}>
        <div style={{ ...grid(2), gap: 14, marginBottom: 16 }}>
          <div><label style={labelStyle}>Currency</label><input style={inputStyle} value={trip.currency || 'GBP'} onChange={(e) => setField('currency', e.target.value)} onBlur={(e) => patchTrip({ currency: e.target.value }, true)} placeholder="GBP" /></div>
          <div><label style={labelStyle}>Overall budget (target)</label><input type="number" inputMode="decimal" style={inputStyle} value={trip.budgetEstimate ?? ''} onChange={(e) => setField('budgetEstimate', e.target.value === '' ? undefined : Number(e.target.value))} onBlur={(e) => patchTrip({ budgetEstimate: e.target.value === '' ? undefined : Number(e.target.value) }, true)} placeholder="e.g. 2000" /></div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: totalEstimated > 0 ? 16 : 0 }}>
          {stat('Estimate', fmtMoney(totalEstimated, currency), text)}
          {stat('Paid', fmtMoney(totalPaid, currency), '#16a34a')}
          {stat('Remaining', fmtMoney(remaining, currency), remaining > 0 ? '#d97706' : textMuted)}
        </div>

        {totalEstimated > 0 && (
          <>
            <div style={{ height: 10, borderRadius: 6, background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: '#16a34a', transition: 'width 0.3s' }} />
            </div>
            <div style={{ fontSize: 13, color: textSub, marginTop: 8, fontWeight: 600 }}>
              {fmtMoney(totalPaid, currency)} paid of {fmtMoney(totalEstimated, currency)} estimated · {fmtMoney(remaining, currency)} to go ({pct}% paid)
            </div>
          </>
        )}
      </div>

      {/* Food & drink estimate */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 16, marginBottom: 12 }}>
          <Utensils size={16} color={accent} /> Food &amp; drink estimate
        </div>
        <div style={{ ...grid(2), gap: 14, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Days</label>
            <input
              type="number"
              inputMode="numeric"
              style={inputStyle}
              value={foodDays}
              onChange={(e) => setFoodDays(e.target.value === '' ? 0 : Number(e.target.value))}
              placeholder="0"
            />
            {tripDays > 0 && (
              <div style={{ fontSize: 11, color: textMuted, marginTop: 4 }}>{tripDays} days from your trip dates</div>
            )}
          </div>
          <div>
            <label style={labelStyle}>Per day ({currency})</label>
            <input
              type="number"
              inputMode="decimal"
              style={inputStyle}
              value={perDay}
              onChange={(e) => setPerDay(e.target.value === '' ? 0 : Number(e.target.value))}
              placeholder="20"
            />
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
          <div style={{ fontSize: isMobile ? 22 : 26, fontWeight: 800, color: accent }}>{fmtMoney(foodTotal, currency)}</div>
          <div style={{ fontSize: 12, color: textMuted }}>{foodDays} days × {fmtMoney(Number(perDay) || 0, currency)}/day</div>
        </div>
        <button onClick={saveFoodToBudget} style={{ ...btn(accent), width: isMobile ? '100%' : undefined }}>
          <Wallet size={14} /> Save food estimate to budget
        </button>
        <div style={{ fontSize: 11, color: textMuted, marginTop: 10 }}>
          A rough per-day food &amp; drink allowance across the whole trip.
        </div>
      </div>

      {/* Category breakdown */}
      {catRows.length > 0 && (
        <AdvancedSection
          title="Budget breakdown"
          icon={<Wallet size={16} color={accent} />}
          open={budgetBreakdownOpen}
          onToggle={() => setBudgetBreakdownOpen((o) => !o)}
          cardStyle={cardStyle}
          ghostBtn={ghostBtn}
        >
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>By category</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {catRows.map(([cat, val]) => {
              const catPct = totalEstimated > 0 ? Math.round((val / totalEstimated) * 100) : 0
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: text }}>{labelFor(BUDGET_CATEGORIES, cat)}</span>
                    <span style={{ color: textSub, fontWeight: 600 }}>{fmtMoney(val, currency)} <span style={{ color: textMuted }}>· {catPct}%</span></span>
                  </div>
                  <div style={{ height: 6, borderRadius: 4, background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                    <div style={{ width: `${catPct}%`, height: '100%', background: accent }} />
                  </div>
                </div>
              )
            })}
          </div>
        </AdvancedSection>
      )}

      {/* Line items */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Costs ({items.length})</div>
          <button onClick={() => addItem('budgetItems', 'budgetItem', { description: '', category: 'other', paid: false })} style={ghostBtn}><Plus size={14} /> Add cost</button>
        </div>

        {items.length === 0 ? (
          <div style={{ color: textMuted, fontSize: 14, textAlign: 'center', padding: 24 }}>
            <Wallet size={26} style={{ opacity: 0.5, marginBottom: 8 }} />
            <p style={{ margin: 0 }}>No costs logged yet. Add your first expense to start tracking.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {items.map((it: any, idx: number) => (
              <div key={it._key || idx} style={{ padding: 12, borderRadius: 10, background: 'rgba(127,127,127,0.06)', display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input style={{ ...inputStyle, fontWeight: 700 }} defaultValue={it.description || ''} placeholder="What was it for?" onBlur={(e) => updateItem('budgetItems', idx, { description: e.target.value })} />
                  <button onClick={() => removeItem('budgetItems', idx)} style={{ ...ghostBtn, padding: 8, color: '#ef4444' }}><Trash2 size={14} /></button>
                </div>
                <div style={grid(2)}>
                  <div>
                    <label style={labelStyle}>Category</label>
                    <select style={inputStyle} value={it.category || 'other'} onChange={(e) => updateItem('budgetItems', idx, { category: e.target.value })}>
                      {BUDGET_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Date</label>
                    <input type="date" style={inputStyle} defaultValue={it.date || ''} onBlur={(e) => updateItem('budgetItems', idx, { date: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Estimated ({currency})</label>
                    <input type="number" inputMode="decimal" style={inputStyle} defaultValue={it.estimated ?? ''} placeholder="0" onBlur={(e) => updateItem('budgetItems', idx, { estimated: e.target.value === '' ? undefined : Number(e.target.value) })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Actual ({currency})</label>
                    <input type="number" inputMode="decimal" style={inputStyle} defaultValue={it.actual ?? ''} placeholder="0" onBlur={(e) => updateItem('budgetItems', idx, { actual: e.target.value === '' ? undefined : Number(e.target.value) })} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => updateItem('budgetItems', idx, { paid: !it.paid })} style={{ ...ghostBtn, width: 'fit-content', borderColor: it.paid ? '#16a34a' : undefined, color: it.paid ? '#16a34a' : textMuted }}>
                    {it.paid ? <Check size={13} /> : null} {it.paid ? 'Paid' : 'Mark paid'}
                  </button>
                  {hasActual(it)
                    ? <span style={{ fontSize: 11, color: textMuted }}>Actual: {fmtMoney(num(it.actual), currency)}</span>
                    : (it.estimated != null && it.estimated !== '' ? <span style={{ fontSize: 11, color: textMuted }}>Estimated: {fmtMoney(num(it.estimated), currency)}</span> : null)}
                </div>
              </div>
            ))}
          </div>
        )}
        {trip.budgetNotes !== undefined || items.length > 0 ? (
          <div style={{ marginTop: 14 }}>
            <label style={labelStyle}>Budget notes</label>
            <textarea style={{ ...inputStyle, minHeight: 50, resize: 'vertical' }} defaultValue={trip.budgetNotes || ''} onBlur={(e) => patchTrip({ budgetNotes: e.target.value }, true)} placeholder="Anything to remember — who's paying, what's reimbursed, etc." />
          </div>
        ) : null}
      </div>
    </div>
  )
}

function ChecklistTab(p: any) {
  const { arr, addItem, updateItem, removeItem, cardStyle, inputStyle, ghostBtn, textMuted } = p
  const items = arr('checklist')
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>Packing / essentials ({items.filter((i: any) => i.packed).length}/{items.length})</div>
        <button onClick={() => addItem('checklist', 'checklistItem', { item: '', packed: false })} style={ghostBtn}><Plus size={14} /> Add</button>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {items.length === 0 && <div style={{ color: textMuted, fontSize: 13 }}>No items yet.</div>}
        {items.map((it: any, idx: number) => (
          <div key={it._key || idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => updateItem('checklist', idx, { packed: !it.packed })} style={{ ...ghostBtn, padding: 9, color: it.packed ? '#16a34a' : textMuted, borderColor: it.packed ? '#16a34a' : undefined }}><Check size={14} /></button>
            <input style={{ ...inputStyle, textDecoration: it.packed ? 'line-through' : 'none', opacity: it.packed ? 0.6 : 1 }} defaultValue={it.item || ''} placeholder="Item" onBlur={(e) => updateItem('checklist', idx, { item: e.target.value })} />
            <input style={{ ...inputStyle, width: 150 }} defaultValue={it.category || ''} placeholder="Category" onBlur={(e) => updateItem('checklist', idx, { category: e.target.value })} />
            <button onClick={() => removeItem('checklist', idx)} style={{ ...ghostBtn, padding: 9, color: '#ef4444' }}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Toggle pill (module-level so it isn't re-created each render) ─────
function Toggle({ on, onClick, labelOn, labelOff, ghostBtn, inputBorder, textMuted }: {
  on: boolean; onClick: () => void; labelOn: string; labelOff: string
  ghostBtn: React.CSSProperties; inputBorder: string; textMuted: string
}) {
  return (
    <button onClick={onClick} style={{ ...ghostBtn, borderColor: on ? '#16a34a' : inputBorder, color: on ? '#16a34a' : textMuted }}>
      {on ? <Check size={13} /> : null} {on ? labelOn : labelOff}
    </button>
  )
}

// ── Indeterminate "working" progress bar for AI actions ─────────────
// AI calls are single requests with no real percentage, so this shows a
// moving stripe rather than a fake percentage. The keyframes live in the
// detail-view <style> block (the AI generators all render inside it).
function AiProgress({ label }: { label?: string }) {
  return (
    <div style={{ marginTop: 8 }} aria-live="polite">
      <div className="aiprog" />
      {label && <div style={{ fontSize: 12, color: '#888', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>{label}</div>}
    </div>
  )
}

// ── Reusable collapsible advanced section (progressive disclosure) ───
// Presentational only: holds no state of its own. The `open` boolean and
// all values inside `children` live in the parent tab component (above this
// body), so collapsing conditionally-renders the body without losing data.
function AdvancedSection({ title, icon, open, onToggle, children, cardStyle, ghostBtn }: any) {
  return (
    <div style={cardStyle}>
      <button onClick={onToggle} aria-expanded={open}
        style={{ ...ghostBtn, width: '100%', justifyContent: 'space-between', minHeight: 44 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>{icon}{title}</span>
        <ChevronRight size={16} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }} />
      </button>
      {open && <div style={{ marginTop: 12 }}>{children}</div>}
    </div>
  )
}

// ── Small shared field with local state + save on blur ───────────────
function Field({ label, value, onSave, inputStyle, labelStyle, placeholder }: {
  label: string; value?: string; onSave: (v: string) => void
  inputStyle: React.CSSProperties; labelStyle: React.CSSProperties; placeholder?: string
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input style={inputStyle} defaultValue={value || ''} placeholder={placeholder} onBlur={(e) => onSave(e.target.value)} />
    </div>
  )
}

const labelForRole = (v?: string) => CONTACT_ROLES.find((r) => r.value === v)?.label || v || ''
const labelForStatus = (v?: string) => CONTACT_STATUSES.find((s) => s.value === v)?.label || v || 'To contact'
const fieldPlaceholder = (f: string) => ({ placeType: 'Type', location: 'Location', why: 'Why visit', where: 'Where', notes: 'Notes' } as Record<string, string>)[f] || f
