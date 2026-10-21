import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'canada',
  name: 'Canada',
  heroImage: 'https://images.unsplash.com/photo-1677791267383-df800fe824f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTA5MjUyfDB8MXxzZWFyY2h8MXx8TW9udHJlYWwlMjBDYW5hZGElMjB0cmF2ZWx8ZW58MHwwfHx8MTc5MjU5NzU4MHww&ixlib=rb-4.1.0&q=80&w=1080',
  heroImageAlt: 'A street scene in Montreal, Canada',
  heroImageCredit: { name: 'Asael Peña', profileUrl: 'https://unsplash.com/@asaelamaury?utm_source=wisewayround&utm_medium=referral' },
  tagline: 'Montréal adds a Canadian section built around a small, operator-confirmed directory.',
  intro: [
    'Food shopping, a restaurant meal and neighbourhood walking can be combined here without treating the city as a list of tasting-menu reservations. The official visitor guide describes a metro and bus network, walking routes and seasonal cycling choices, and the Old Port, Little Italy and Plateau each offer a different area to explore — worth checking current service and the weather before committing to a long walking or cycling day.',
    'Summer is festival season, autumn brings the changing colours, winter is for snow, and spring sees terrace activity returning; the right time to visit depends on the activities planned, since a dining-focused trip does not need every outdoor option available.',
  ],
  planningLinks: [
    { label: 'Montréal visitor information', href: 'https://www.mtl.org/en' },
    { label: 'Montréal transport and walking guide', href: 'https://www.mtl.org/en/city/visitor-information/getting-around' },
  ],
  sections: [
    {
      heading: 'Venue directory',
      venues: [
        {
          name: 'Elena',
          location: '5090 Notre-Dame Ouest, Montréal',
          description: 'Restaurant serving coffee, pizza and wine.',
          links: [{ label: 'Website', href: 'https://coffeepizzawine.com/' }],
        },
        {
          name: "J'ai Feng",
          location: '43 rue Beaubien Est, Montréal',
          description: 'Grocery and lunch business.',
          note: 'The operator currently announces a temporary closure — reopening should be confirmed before any visit.',
          links: [{ label: 'Website', href: 'https://www.jaifengmtl.com/' }],
        },
        {
          name: 'Joe Beef',
          location: 'Montreal',
          description: 'Restaurant with table-booking details on its own website.',
          links: [{ label: 'Website', href: 'https://joebeef.com/' }],
        },
      ],
    },
  ],
}
