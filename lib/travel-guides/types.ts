export interface VenueLink {
  label: 'Website' | 'Instagram' | 'Facebook' | 'Bookings'
  href: string
}

export interface Venue {
  name: string
  /** Street address or town/area when no street address was given in the source. */
  location?: string
  description: string
  links: VenueLink[]
  /** Set when a chapter's own text calls out something not fact-checked beyond the standard disclaimer
   *  (e.g. a seasonal format or temporary closure). Rendered as a small note under the venue instead of
   *  invented hours/prices. */
  note?: string
}

export interface VenueSection {
  /** Source sub-heading, e.g. "Pizza", "Venue directory", "Restaurants and Trattorie". */
  heading: string
  venues: Venue[]
}

export interface DestinationData {
  slug: string
  name: string
  /** Short strap line under the destination name, adapted from the chapter's opening paragraph. */
  tagline: string
  /** 1-3 short paragraphs introducing the destination, adapted from the chapter's orientation/planning text. */
  intro: string[]
  heroImage?: string
  /** Human-written alt text for `heroImage`, authored alongside it (never derived from the image path/filename). */
  heroImageAlt?: string
  /** Populated by scripts/fetch-travel-guide-images.ts; profileUrl already carries Unsplash's required utm_source/utm_medium params. */
  heroImageCredit?: { name: string; profileUrl: string }
  /** Chapter-level "Planning links" block (near-universal across chapters), distinct from venue links: these
   *  are practical/official links, not tied to a single venue. */
  planningLinks?: { label: string; href: string }[]
  sections: VenueSection[]
}
