import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/italy-turin'

export default function ItalyTurinTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides/italy" backLabel="Back to Italy" />
}
