import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/usa-new-orleans'

export default function UsaNewOrleansTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides/usa" backLabel="Back to USA" />
}
