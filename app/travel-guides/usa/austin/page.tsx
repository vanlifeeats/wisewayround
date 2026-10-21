import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/usa-austin'

export default function UsaAustinTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides/usa" backLabel="Back to USA" />
}
