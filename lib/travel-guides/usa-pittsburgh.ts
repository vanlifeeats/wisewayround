import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'usa-pittsburgh',
  name: 'Pittsburgh',
  tagline: 'Chinese cooking, sourdough pizza and Italian-influenced restaurants across different neighbourhoods.',
  intro: [
    "Downtown is compact, but the Strip District and Lawrenceville addresses give separate anchors for food outings, and a Squirrel Hill restaurant is worth planning with its own transfer rather than assuming a single walking circuit covers everything.",
    'The official visitor guide covers public transport beyond Downtown, taxis, parking information and cycling options, so it is worth checking the intended route and the return journey before planning a later dinner. Combining a neighbourhood meal with local shopping or a river-focused outing, and choosing one pizza or bakery visit alongside one full restaurant meal, keeps the day manageable.',
  ],
  planningLinks: [
    { label: 'Pittsburgh transport guide', href: 'https://www.visitpittsburgh.com/plan-your-trip/transportation/around-town/' },
    { label: 'Pittsburgh visitor information', href: 'https://www.visitpittsburgh.com/' },
  ],
  sections: [
    {
      heading: 'Venue directory',
      venues: [
        {
          name: 'Bar Marco',
          location: 'Pittsburgh',
          description: 'Strip District restaurant serving Italian-influenced food, wine and cocktails.',
          links: [{ label: 'Website', href: 'https://www.barmarcopgh.com/' }],
        },
        {
          name: 'Chengdu Gourmet',
          location: '5840 Forward Avenue, Pittsburgh',
          description: 'Chinese restaurant in Pittsburgh.',
          links: [{ label: 'Website', href: 'https://www.chengdugourmetpa.com/' }],
        },
        {
          name: "DiAnoia's",
          location: '2549 Penn Avenue, Pittsburgh',
          description: 'Italian restaurant on Penn Avenue.',
          links: [{ label: 'Website', href: 'https://dianoiaseatery.com/' }],
        },
        {
          name: 'Driftwood Oven',
          location: '3615 Butler Street, Pittsburgh',
          description: 'Sourdough pizzeria and bakery in Lawrenceville.',
          links: [{ label: 'Website', href: 'https://www.driftwoodoven.com/' }],
        },
      ],
    },
  ],
}
