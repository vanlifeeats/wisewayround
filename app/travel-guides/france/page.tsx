import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/france'

export default function FranceTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides" backLabel="Back to Travel Guides" />
}
