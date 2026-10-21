import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'usa-austin',
  name: 'Austin',
  heroImage: 'https://images.unsplash.com/photo-1557335200-a65f7f032602?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTA5MjUyfDB8MXxzZWFyY2h8MXx8QXVzdGluJTIwVGV4YXMlMjBza3lsaW5lfGVufDB8MHx8fDE3OTI1OTg3MDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
  heroImageAlt: 'The downtown skyline of Austin, Texas',
  heroImageCredit: { name: 'MJ Tangonan', profileUrl: 'https://unsplash.com/@mjtangonan?utm_source=wisewayround&utm_medium=referral' },
  tagline: 'Pizza, barbecue and Mexican food alongside a wider city visit.',
  intro: [
    'Official visitor maps separate Downtown, South Congress, Lady Bird Lake, Zilker Park and the wider region — choosing one area as the day\'s anchor and adding food nearby works better than planning unrelated cross-city stops. Bufalina and Bufalina Due sit at different addresses, so it is worth selecting the intended location before booking or travelling.',
    'Franklin Barbecue serves lunch until sold out and advises planning for the queue, so it is worth leaving another meal flexible rather than linking a queue-dependent stop to a tight onward reservation. The visitor authority lists buses, rail, taxis, ride-hailing and bike options through current CapMetro information, and a park, trail or live-music visit can add variety around a meal depending on current weather and event information.',
  ],
  planningLinks: [
    { label: 'Austin visitor maps', href: 'https://www.austintexas.org/plan-a-trip/getting-here/maps/' },
    { label: 'Austin transport information', href: 'https://www.austintexas.org/plan-a-trip/getting-here/transportation/' },
  ],
  sections: [
    {
      heading: 'Venue directory',
      venues: [
        {
          name: 'Bufalina',
          location: 'Bufalina: 2215 E Cesar Chavez Street; Bufalina Due: 6555 Burnet Road, Austin',
          description: 'Pizzeria with a natural-wine programme and two Austin addresses.',
          links: [{ label: 'Website', href: 'https://www.bufalinapizza.com/' }],
        },
        {
          name: 'Franklin Barbecue',
          location: '900 E 11th Street, Austin',
          description: 'Barbecue restaurant serving lunch until sold out.',
          note: 'Its operator warns visitors to plan for the queue.',
          links: [{ label: 'Website', href: 'https://franklinbbq.com/' }],
        },
        {
          name: 'Veracruz All Natural',
          location: 'Several Austin-area locations',
          description: "Mexican food business with several Austin-area locations; use the live branch directory to choose the right address.",
          links: [{ label: 'Website', href: 'https://www.veracruzallnatural.com/locations' }],
        },
      ],
    },
  ],
}
