import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/turkey-istanbul'

export default function TurkeyIstanbulTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides/turkey" backLabel="Back to Turkey" />
}
