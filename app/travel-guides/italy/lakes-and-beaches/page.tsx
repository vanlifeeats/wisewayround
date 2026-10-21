import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/italy-lakes-and-beaches'

export default function ItalyLakesAndBeachesTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides/italy" backLabel="Back to Italy" />
}
