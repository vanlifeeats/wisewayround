import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'usa-los-angeles',
  name: 'Los Angeles',
  tagline: 'Sandwiches, Thai and Sichuan cooking, pizza, tacos and a Japanese grocery store, well beyond downtown.',
  intro: [
    "Addresses here extend beyond a compact downtown area and include Arcadia — Chengdu Impression is in Arcadia, and Mitsuwa's linked Santa Monica-labelled branch is actually on South Centinela Avenue, distinctions worth keeping in mind since broad city labels can conceal a significant transfer.",
    'LA Metro provides bus and rail routes along with live trip-planning tools, alerts and accessibility information, and it is worth checking the actual connection for each address rather than assuming a venue being in Los Angeles County means a short journey from a central hotel. Choosing one geographical cluster per outing, leaving room for traffic or transit changes, and confirming the current Tamix truck or branch location rather than an old roadside position all help the day hold together.',
  ],
  planningLinks: [
    { label: 'LA Metro rider information', href: 'https://www.metro.net/riding/' },
    { label: 'Los Angeles visitor information', href: 'https://www.discoverlosangeles.com/' },
  ],
  sections: [
    {
      heading: 'Venue directory',
      venues: [
        {
          name: 'Chengdu Impression',
          location: '21 E Huntington Drive, Arcadia, California',
          description: 'Sichuan restaurant in Arcadia, rather than central Los Angeles.',
          links: [{ label: 'Website', href: 'https://www.chengduimpressionla.com/' }],
        },
        {
          name: 'Grá',
          location: '1524 Pizarro Street, Los Angeles',
          description: 'Pizzeria serving sourdough pizza and natural wines.',
          links: [{ label: 'Website', href: 'https://xn--gr-nia.com/' }],
        },
        {
          name: 'Luv2Eat Thai Bistro',
          location: 'Los Angeles',
          description: 'Thai restaurant with a published menu.',
          links: [{ label: 'Website', href: 'https://luv2eatthaibistro.com/' }],
        },
        {
          name: 'Mitsuwa Marketplace',
          location: '3760 S Centinela Avenue, Los Angeles',
          description: 'Japanese grocery store with food offerings; the linked branch is the Santa Monica-labelled location on South Centinela Avenue.',
          links: [{ label: 'Website', href: 'https://mitsuwa.com/sm/' }],
        },
        {
          name: 'Philippe the Original',
          location: '1001 N. Alameda Street, Los Angeles',
          description: 'Sandwich shop specialising in French dips.',
          links: [{ label: 'Website', href: 'https://philippes.com/' }],
        },
        {
          name: 'Tamix',
          location: 'Los Angeles',
          description: 'Taco business with several Los Angeles locations.',
          links: [{ label: 'Website', href: 'https://www.tacostamix.com/' }],
        },
      ],
    },
  ],
}
