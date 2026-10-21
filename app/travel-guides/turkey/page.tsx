import { HubPage } from '@/components/HubPage'
import { TURKEY_CITIES } from '@/lib/travel-guides'

export default function TurkeyTravelGuidePage() {
  return (
    <HubPage
      eyebrow="Turkey"
      title="Turkey"
      blurb="Istanbul and Gaziantep — two very different tables, both worth the detour."
      items={TURKEY_CITIES}
      backHref="/travel-guides"
      backLabel="Back to Travel Guides"
    />
  )
}
