import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'greece',
  name: 'Greece',
  tagline: 'This guide covers Athens, Iraklia and Sifnos rather than claiming to cover the whole of Greece.',
  intro: [
    'The city and the islands need different kinds of planning: Athens works well by neighbourhood, while island visits depend on ferry schedules and seasonal services. In Athens, Plaka, Koukaki and Monastiraki form useful historic-centre areas, while Exarchia offers cafes and bookshops and Pangrati and other residential districts provide alternatives beyond the main monument circuit.',
    'On Sifnos, Kamares is the ferry port and Apollonia the island capital, with Artemonas, Kastro, Faros and Chrysopigi each worth a separate village or coastal outing. Fast Ferries lists connections involving Piraeus and several Cycladic islands, but not every connection runs every day — worth confirming the actual sailing and arrival port before booking accommodation, and leaving a buffer before a flight rather than assuming an island-to-mainland transfer is immune to disruption.',
    'Beach access, a marked trail and an informal rock-swimming spot are all different things, so it is worth confirming local access conditions, taking water and sun protection, and checking transport and seasonal restaurant opening for the actual travel dates rather than relying on an old account.',
  ],
  planningLinks: [
    { label: 'Athens neighbourhood guide', href: 'https://www.thisisathens.org/' },
    { label: 'Athens national visitor information', href: 'https://www.visitgreece.gr/en/mainland/attica/athens' },
    { label: 'Sifnos municipal guide', href: 'https://sifnos.gr/en/sifnos/' },
    { label: 'Sifnos ferry connections', href: 'https://fastferries.com.gr/en/destinations/sifnos/' },
    { label: 'Iraklia municipal visitor guide', href: 'https://iraklia.com.gr/' },
  ],
  sections: [
    {
      heading: 'Athens',
      venues: [
        {
          name: 'Katsourbos',
          location: 'Athens',
          description: 'Restaurant specialising in Cretan cooking.',
          links: [{ label: 'Website', href: 'https://www.katsourbos.gr/home/' }],
        },
        {
          name: 'Kriti',
          location: 'Athens',
          description: "Cretan restaurant listed by the official Athens visitor guide.",
          links: [{ label: 'Website', href: 'https://www.thisisathens.org/restaurants/i-kriti' }],
        },
        {
          name: 'Stani',
          location: '10 M. Kotopouli Street, Omonia, Athens',
          description: 'Dairy shop and patisserie near Omonia.',
          links: [{ label: 'Website', href: 'https://www.stani1931.gr/en_index.html' }],
        },
      ],
    },
    {
      heading: 'Iraklia',
      venues: [
        {
          name: 'Villa Zografos',
          location: 'Iraklia',
          description: 'Accommodation on Iraklia.',
          note: 'Confirm room type and transfer arrangements directly with the host.',
          links: [{ label: 'Website', href: 'https://www.villazografos.com/en/' }],
        },
      ],
    },
    {
      heading: 'Sifnos',
      venues: [
        {
          name: 'Gerontopoulos',
          location: 'Sifnos',
          description: 'Patisserie and catering business on Sifnos.',
          links: [{ label: 'Website', href: 'https://gerontopoulossifnos.gr/en/' }],
        },
        {
          name: 'Omega 3',
          location: 'Platis Gialos, Sifnos',
          description: 'Fish and wine bar in Platis Gialos with outdoor seating.',
          links: [{ label: 'Website', href: 'https://www.omega3sifnos.com/' }],
        },
        {
          name: 'Tsikali',
          location: 'Vathi, Sifnos',
          description: 'Traditional taverna in Vathi.',
          links: [{ label: 'Website', href: 'https://tsikali.com/' }],
        },
      ],
    },
  ],
}
