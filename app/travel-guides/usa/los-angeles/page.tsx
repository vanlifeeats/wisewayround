import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/usa-los-angeles'

export default function UsaLosAngelesTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides/usa" backLabel="Back to USA" />
}
