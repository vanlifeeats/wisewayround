import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/italy-florence-and-tuscany'

export default function ItalyFlorenceAndTuscanyTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides/italy" backLabel="Back to Italy" />
}
