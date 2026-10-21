import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/greece'

export default function GreeceTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides" backLabel="Back to Travel Guides" />
}
