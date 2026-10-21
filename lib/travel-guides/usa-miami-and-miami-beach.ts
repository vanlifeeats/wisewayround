import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'usa-miami-and-miami-beach',
  name: 'Miami and Miami Beach',
  heroImage: 'https://images.unsplash.com/photo-1589083130544-0d6a2926e519?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTA5MjUyfDB8MXxzZWFyY2h8MXx8TWlhbWklMjBCZWFjaCUyMEZsb3JpZGF8ZW58MHwwfHx8MTc5MjU5ODcwNnww&ixlib=rb-4.1.0&q=80&w=1080',
  heroImageAlt: 'The beachfront in Miami Beach, Florida',
  heroImageCredit: { name: 'Antonio Cuellar', profileUrl: 'https://unsplash.com/@antoniocphoto?utm_source=wisewayround&utm_medium=referral' },
  tagline: 'Two distinct planning areas — mainland dining and a deliberately scheduled beach outing.',
  intro: [
    "Miami and Miami Beach work best treated as separate areas rather than one walkable centre. The directory contains a seafood and fish-market business, Cuban cooking on Southwest 8th Street and a Miami Beach seafood restaurant — different food experiences best organised by location rather than assumed to sit near one another.",
    "Downtown's Metromover is a free elevated system serving Downtown and Brickell, Metrorail is a separate network, and Miami Beach needs its own route planning — worth checking current operations on the official transport page before relying on a particular connection. One day for mainland food stops and another for Miami Beach is a workable structure, with the correct branch, parking or transport stop and any seasonal menu confirmed directly rather than assuming a stone-crab season date or price.",
  ],
  planningLinks: [
    {
      label: 'Downtown and Miami Beach transport',
      href: 'https://www.miamiandbeaches.com/plan-your-trip/transportation/getting-to-and-around-downtown-and-miami-beach',
    },
  ],
  sections: [
    {
      heading: 'Venue directory',
      venues: [
        {
          name: "Joe's Stone Crab",
          location: 'Miami Beach',
          description: 'Seafood restaurant in Miami Beach.',
          note: 'Confirm current service periods and seasonal menu details.',
          links: [{ label: 'Website', href: 'https://www.joesstonecrab.com/' }],
        },
        {
          name: 'La Camaronera',
          location: 'Miami',
          description: 'Seafood restaurant and fish market.',
          links: [{ label: 'Website', href: 'https://www.lacamaronera.com/' }],
        },
        {
          name: 'Versailles',
          location: '3555 SW 8th Street, Miami',
          description: 'Cuban restaurant on Southwest 8th Street with a cafe window and bakery-related offerings.',
          links: [{ label: 'Website', href: 'https://versaillesrestaurant.com/' }],
        },
      ],
    },
  ],
}
