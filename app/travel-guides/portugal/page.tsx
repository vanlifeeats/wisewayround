import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/portugal'

export default function PortugalTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides" backLabel="Back to Travel Guides" />
}
