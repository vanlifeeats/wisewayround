import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'spain',
  name: 'Spain',
  tagline: "Barcelona's food addresses range from neighbourhood markets and bakeries to counter dining and seafront rice restaurants.",
  intro: [
    'Markets are especially useful here for combining food shopping with an informal meal. Barceloneta has a municipal market, tapas addresses and bread shopping; El Born provides a second dining cluster; and the food counters inside La Boqueria are worth distinguishing from stand-alone restaurants elsewhere in the city.',
    'TMB covers metro and bus information, airport-access guidance, network maps and accessibility details — worth reviewing a transport product\'s airport and journey coverage before committing to it, and checking for service changes before departure.',
    'A restaurant counter, market counter and table-service restaurant can each have different booking rules. It helps to build a bakery or market stop into the morning, leave room for an unhurried main meal, and check branch addresses before setting off — reserving a seafront rice meal around the restaurant\'s own menu and table policy rather than an assumed fixed serving time.',
  ],
  planningLinks: [
    { label: 'Barcelona public transport for visitors', href: 'https://fundacio.tmb.cat/en/web/tmb/visit-barcelona' },
  ],
  sections: [
    {
      heading: 'Venue directory',
      venues: [
        {
          name: 'Bar Brutal',
          location: 'Barcelona',
          description: 'Bar and dining address on Carrer de la Princesa.',
          links: [{ label: 'Website', href: 'https://barbrutal.com/' }],
        },
        {
          name: 'Bar Cañete',
          location: 'Barcelona',
          description: 'Restaurant serving traditional Catalan cooking.',
          links: [{ label: 'Website', href: 'https://barcanete.com/' }],
        },
        {
          name: 'Cal Pep',
          location: 'Barcelona',
          description: 'Restaurant centred on shared dishes and counter seating.',
          links: [{ label: 'Website', href: 'https://www.calpep.com/' }],
        },
        {
          name: 'Can Kenji',
          location: 'Rosselló 325, Barcelona',
          description: 'Restaurant serving Japanese tapas.',
          links: [{ label: 'Website', href: 'https://www.cankenji.com/' }],
        },
        {
          name: 'Dos Palillos',
          location: 'Barcelona',
          description: "Restaurant with current booking and closure information on its website.",
          links: [{ label: 'Website', href: 'https://www.dospalillos.com/en/' }],
        },
        {
          name: 'El Quim',
          location: 'Stall 606, Mercat de La Boqueria, La Rambla 91, Barcelona',
          description: 'Food counter inside La Boqueria, listed by its operator as stall 606.',
          links: [{ label: 'Website', href: 'http://elquimdelaboqueria.com/' }],
        },
        {
          name: 'Forn Baluard',
          location: 'Barcelona',
          description: 'Bakery associated with Barceloneta.',
          links: [{ label: 'Website', href: 'https://www.baluardbarceloneta.com/' }],
        },
        {
          name: 'La Cova Fumada',
          location: 'Barcelona',
          description: 'Tapas bar in Barceloneta.',
          links: [{ label: 'Website', href: 'https://lacovafumada.com/' }],
        },
        {
          name: 'Mercat de la Barceloneta',
          location: 'Barcelona',
          description: 'Municipal food market in Barceloneta.',
          links: [{ label: 'Website', href: 'https://ajuntament.barcelona.cat/mercats/en/mercat-de-la-barceloneta' }],
        },
        {
          name: 'Mercat de Santa Caterina',
          location: 'Barcelona',
          description: 'Covered food market with individual stalls.',
          links: [{ label: 'Website', href: 'https://mercatsantacaterina.com/' }],
        },
        {
          name: 'Passadis del Pep',
          location: 'Barcelona',
          description: 'Restaurant in El Born.',
          links: [{ label: 'Website', href: 'https://passadis.com/' }],
        },
        {
          name: 'Pastelería Hofmann',
          location: 'Barcelona',
          description: 'Patisserie selling cakes and breakfast pastries.',
          links: [{ label: 'Website', href: 'https://hofmannpasteleria.com/' }],
        },
        {
          name: 'Sirvent',
          location: 'Barcelona',
          description: 'Producer and retailer of turrón and horchata.',
          links: [{ label: 'Website', href: 'https://turronessirvent.com/' }],
        },
        {
          name: 'Turris',
          location: 'Barcelona',
          description: 'Bakery chain selling bread and pastries.',
          links: [{ label: 'Website', href: 'https://turris.es/' }],
        },
        {
          name: 'Xiringuito Escribà',
          location: 'Barcelona',
          description: 'Seafront restaurant specialising in rice dishes.',
          links: [{ label: 'Website', href: 'https://restaurantsescriba.com/en/xiringuito-escriba/' }],
        },
      ],
    },
  ],
}
