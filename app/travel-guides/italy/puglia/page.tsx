import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/italy-puglia'

export default function ItalyPugliaTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides/italy" backLabel="Back to Italy" />
}
