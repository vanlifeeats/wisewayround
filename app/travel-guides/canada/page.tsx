import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/canada'

export default function CanadaTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides" backLabel="Back to Travel Guides" />
}
