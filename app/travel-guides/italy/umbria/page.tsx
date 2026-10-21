import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/italy-umbria'

export default function ItalyUmbriaTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides/italy" backLabel="Back to Italy" />
}
