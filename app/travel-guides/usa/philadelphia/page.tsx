import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/usa-philadelphia'

export default function UsaPhiladelphiaTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides/usa" backLabel="Back to USA" />
}
