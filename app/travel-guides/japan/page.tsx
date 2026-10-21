import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/japan'

export default function JapanTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides" backLabel="Back to Travel Guides" />
}
