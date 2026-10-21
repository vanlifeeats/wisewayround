import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/usa-miami-and-miami-beach'

export default function UsaMiamiAndMiamiBeachTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides/usa" backLabel="Back to USA" />
}
