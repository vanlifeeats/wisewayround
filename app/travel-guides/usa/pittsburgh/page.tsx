import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/usa-pittsburgh'

export default function UsaPittsburghTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides/usa" backLabel="Back to USA" />
}
