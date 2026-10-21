import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/thailand'

export default function ThailandTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides" backLabel="Back to Travel Guides" />
}
