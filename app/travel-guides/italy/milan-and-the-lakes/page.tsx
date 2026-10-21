import { DestinationPage } from '@/components/DestinationPage'
import { data } from '@/lib/travel-guides/italy-milan-and-the-lakes'

export default function ItalyMilanAndTheLakesTravelGuidePage() {
  return <DestinationPage data={data} backHref="/travel-guides/italy" backLabel="Back to Italy" />
}
