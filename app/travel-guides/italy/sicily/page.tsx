import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/italy-sicily'

export default function ItalySicilyTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides/italy" backLabel="Back to Italy" />
}
