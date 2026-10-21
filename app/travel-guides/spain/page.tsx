import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/spain'

export default function SpainTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides" backLabel="Back to Travel Guides" />
}
