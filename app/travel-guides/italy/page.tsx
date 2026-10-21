import { HubPage } from '@/components/HubPage'
import { ITALY_REGIONS } from '@/lib/travel-guides'

export default function ItalyTravelGuidePage() {
  return (
    <HubPage
      eyebrow="Italy"
      title="Italy"
      blurb="Twelve regions, one plate at a time — pick where you're headed."
      items={ITALY_REGIONS}
      backHref="/travel-guides"
      backLabel="Back to Travel Guides"
    />
  )
}
