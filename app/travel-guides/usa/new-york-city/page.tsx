import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/usa-new-york-city'

export default function UsaNewYorkCityTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides/usa" backLabel="Back to USA" />
}
