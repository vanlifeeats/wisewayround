import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'puerto-rico',
  name: 'Puerto Rico',
  tagline: "Vieques is an island municipality off Puerto Rico's eastern coast.",
  intro: [
    'Beach visits, nature and dining in Esperanza can be combined into a stay that leaves enough time for the island transfer and local transport. Current visitor guidance identifies flights from San Juan and ferries from Ceiba — the mainland ferry port should not be confused with Fajardo, and it is worth confirming the actual sailing, baggage rules and onward transfer before booking.',
    'The north-side town of Isabel II and the south-side settlement of Esperanza offer different bases. The directory below includes hotels and a rental-car operator alongside dining addresses, though room availability and rental terms have not been checked and no booking is implied.',
    'The visitor authority highlights Sun Bay, Playa Negra, Mosquito Bay and the wildlife refuge, and a guided boat or kayak trip can be a structured way to visit the bioluminescent bay — worth using authorised access information and local operators rather than an unmarked route. December to April is generally described as the dry season, with hurricane-season risk from June to November, so a flexible transfer buffer before an international flight is worth building in.',
  ],
  planningLinks: [
    { label: 'Vieques arrival guide', href: 'https://www.discoverpuertorico.com/article/how-to-get-to-vieques-culebra' },
    { label: 'Vieques visitor overview', href: 'https://www.discoverpuertorico.com/regions/culebra-vieques/vieques' },
  ],
  sections: [
    {
      heading: 'Venue directory',
      venues: [
        {
          name: 'Bili restaurant',
          location: 'Vieques',
          description: 'Restaurant offering Puerto Rican and internationally influenced cooking.',
          links: [{ label: 'Website', href: 'https://www.restaurantebili.com/' }],
        },
        {
          name: 'Bravo Beach Hotel',
          location: 'Vieques',
          description: 'Oceanfront hotel offering rooms, suites and apartment-style units.',
          links: [{ label: 'Website', href: 'https://www.bravobeachhotel.com/' }],
        },
        {
          name: "Duffy's",
          location: 'Vieques',
          description: 'Esperanza restaurant serving seafood, burgers and cocktails.',
          links: [{ label: 'Website', href: 'https://www.duffysesperanza.com/' }],
        },
        {
          name: 'El Quenepo',
          location: 'Vieques',
          description: 'Restaurant on the Malecón in Esperanza.',
          links: [{ label: 'Website', href: 'http://www.elquenepovieques.com/' }],
        },
        {
          name: 'Hix Island House',
          location: 'Vieques',
          description: 'Open-air lodging retreat on Vieques.',
          links: [{ label: 'Website', href: 'https://hixislandhouse.com/' }],
        },
        {
          name: "Lazy Jacks",
          location: 'Vieques',
          description: 'Bar and restaurant on Vieques.',
          links: [{ label: 'Website', href: 'https://www.lazyjacksvieques.com/' }],
        },
        {
          name: "Maritza's Car Rental",
          location: 'Route 201, Barrio Florida; also 358 Calle Antonio G. Mellado, Isabel II',
          description: 'Car-rental operator on Vieques with more than one collection location.',
          links: [{ label: 'Website', href: 'https://maritzascarrental.com/' }],
        },
      ],
    },
  ],
}
