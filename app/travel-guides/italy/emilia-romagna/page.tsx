import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/italy-emilia-romagna'

export default function ItalyEmiliaRomagnaTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides/italy" backLabel="Back to Italy" />
}
