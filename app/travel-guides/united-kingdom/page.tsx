import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/united-kingdom'

export default function UnitedKingdomTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides" backLabel="Back to Travel Guides" />
}
