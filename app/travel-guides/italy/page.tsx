import { HubPage } from '@/components/HubPage'
import { ITALY_REGIONS } from '@/lib/travel-guides'
import { HUB_HERO_IMAGES } from '@/lib/travel-guides/hub-hero-images'

export default function ItalyTravelGuidePage() {
  return (
    <HubPage
      eyebrow="Italy"
      title="Italy"
      blurb="Twelve regions, one plate at a time — pick where you're headed."
      items={ITALY_REGIONS}
      backHref="/travel-guides"
      backLabel="Back to Travel Guides"
      heroImage={HUB_HERO_IMAGES.italy.url}
      heroImageAlt={HUB_HERO_IMAGES.italy.alt}
      heroImageCredit={HUB_HERO_IMAGES.italy.credit}
    />
  )
}
