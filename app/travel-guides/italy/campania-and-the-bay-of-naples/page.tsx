import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/italy-campania-and-the-bay-of-naples'

export default function ItalyCampaniaAndTheBayOfNaplesTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides/italy" backLabel="Back to Italy" />
}
