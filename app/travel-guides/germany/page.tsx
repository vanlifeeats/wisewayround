import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/germany'

export default function GermanyTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides" backLabel="Back to Travel Guides" />
}
