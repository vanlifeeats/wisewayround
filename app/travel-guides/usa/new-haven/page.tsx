import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/usa-new-haven'

export default function UsaNewHavenTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides/usa" backLabel="Back to USA" />
}
