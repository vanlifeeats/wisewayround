import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'denmark',
  name: 'Denmark',
  heroImage: 'https://images.unsplash.com/photo-1551651767-d5ffbdd04b83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTA5MjUyfDB8MXxzZWFyY2h8MXx8Q29wZW5oYWdlbiUyMERlbm1hcmslMjB0cmF2ZWx8ZW58MHwwfHx8MTc5MjU5NzU4M3ww&ixlib=rb-4.1.0&q=80&w=1080',
  heroImageAlt: 'Colourful waterfront buildings in Copenhagen, Denmark',
  heroImageCredit: { name: 'Ava Coploff', profileUrl: 'https://unsplash.com/@avaluria?utm_source=wisewayround&utm_medium=referral' },
  tagline: "Copenhagen's directory is compact enough to build a trip around a few distinct experiences: a bakery visit, Danish open sandwiches, wine shopping and a separately planned destination meal.",
  intro: [
    'Metro, trains, buses and harbour buses form the public-transport network; the metro runs through the night, although maintenance can affect service. The official journey planner and transport guide are more reliable than a fixed timetable printed anywhere else.',
    'The wine bar, sandwich restaurant, bakery business and destination restaurant listed here are not interchangeable neighbourhood stops — check the branch and route before deciding the order, since a bakery chain\'s nearest branch may be more practical than one mentioned in an older account.',
    "Seasonal restaurant projects can change format and location, so it's worth keeping an alternative meal available and checking the actual programme before building travel plans around any one of them. Cycling is one way to explore, but a visitor unfamiliar with local road use can stick to public transport and short walks instead.",
  ],
  planningLinks: [
    {
      label: 'Copenhagen transport guide',
      href: 'https://www.visitcopenhagen.com/copenhagen/planning/transportation/public-transport-copenhagen',
    },
  ],
  sections: [
    {
      heading: 'Venue directory',
      venues: [
        {
          name: 'Hart Bageri',
          location: 'Refshalevej 159A, Copenhagen; other branches listed online',
          description: 'Bakery business with several branches; the operator lists a Refshalevej location.',
          links: [{ label: 'Website', href: 'https://hartbageri.com/locations/' }],
        },
        {
          name: 'Noma',
          location: 'Copenhagen',
          description: 'Seasonal dining project.',
          note: "Copenhagen service is announced on the operator's website, but dates and format should be checked before planning a visit.",
          links: [{ label: 'Website', href: 'https://noma.dk/' }],
        },
        {
          name: 'Surt',
          location: 'Bag Elefanterne 2, Copenhagen V',
          description: 'Dining address in Copenhagen.',
          note: 'Consult the operator for the current menu.',
          links: [{ label: 'Website', href: 'https://surtcph.dk/index.php/need-to-know/' }],
        },
        {
          name: 'Told & Snaps',
          location: 'Copenhagen',
          description: 'Restaurant specialising in Danish open sandwiches.',
          links: [{ label: 'Website', href: 'https://www.toldogsnaps.dk/?lang=en' }],
        },
        {
          name: 'Ved Stranden 10',
          location: 'Copenhagen',
          description: 'Wine shop and bar.',
          links: [{ label: 'Website', href: 'https://www.vedstranden10.dk/' }],
        },
      ],
    },
  ],
}
