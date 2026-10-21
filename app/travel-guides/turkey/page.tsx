import { HubPage } from '@/components/HubPage'
import { TURKEY_CITIES } from '@/lib/travel-guides'
import { HUB_HERO_IMAGES } from '@/lib/travel-guides/hub-hero-images'

export default function TurkeyTravelGuidePage() {
  return (
    <HubPage
      eyebrow="Turkey"
      title="Turkey"
      blurb="Istanbul and Gaziantep — two very different tables, both worth the detour."
      items={TURKEY_CITIES}
      backHref="/travel-guides"
      backLabel="Back to Travel Guides"
      heroImage={HUB_HERO_IMAGES.turkey.url}
      heroImageAlt={HUB_HERO_IMAGES.turkey.alt}
      heroImageCredit={HUB_HERO_IMAGES.turkey.credit}
    />
  )
}
