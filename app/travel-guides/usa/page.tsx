import { HubPage } from '@/components/HubPage'
import { USA_CITIES } from '@/lib/travel-guides'

export default function UsaTravelGuidePage() {
  return (
    <HubPage
      eyebrow="USA"
      title="USA"
      blurb="Eight cities we've eaten and travelled our way through, coast to coast."
      items={USA_CITIES}
      backHref="/travel-guides"
      backLabel="Back to Travel Guides"
    />
  )
}
