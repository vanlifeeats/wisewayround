import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/puerto-rico'

export default function PuertoRicoTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides" backLabel="Back to Travel Guides" />
}
