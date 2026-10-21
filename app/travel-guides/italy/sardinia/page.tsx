import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/italy-sardinia'

export default function ItalySardiniaTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides/italy" backLabel="Back to Italy" />
}
