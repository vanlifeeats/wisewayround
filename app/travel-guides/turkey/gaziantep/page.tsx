import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/turkey-gaziantep'

export default function TurkeyGaziantepTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides/turkey" backLabel="Back to Turkey" />
}
