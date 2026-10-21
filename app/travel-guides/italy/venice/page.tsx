import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/italy-venice'

export default function ItalyVeniceTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides/italy" backLabel="Back to Italy" />
}
