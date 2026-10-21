import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/italy-rome'

export default function ItalyRomeTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides/italy" backLabel="Back to Italy" />
}
