import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/denmark'

export default function DenmarkTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides" backLabel="Back to Travel Guides" />
}
