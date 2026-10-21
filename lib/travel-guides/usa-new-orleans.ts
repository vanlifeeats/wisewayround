import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'usa-new-orleans',
  name: 'New Orleans',
  heroImage: 'https://images.unsplash.com/photo-1583477716463-9c485c89f6e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTA5MjUyfDB8MXxzZWFyY2h8MXx8TmV3JTIwT3JsZWFucyUyMEZyZW5jaCUyMFF1YXJ0ZXJ8ZW58MHwwfHx8MTc5MjU5NzYzNXww&ixlib=rb-4.1.0&q=80&w=1080',
  heroImageAlt: 'A street in the French Quarter of New Orleans',
  heroImageCredit: { name: 'Aya Salman', profileUrl: 'https://unsplash.com/@ayasn?utm_source=wisewayround&utm_medium=referral' },
  tagline: 'A food-focused visit that can also take in music, neighbourhood walking and river travel.',
  intro: [
    'The French Quarter, Downtown and the Arts/Warehouse District support walkable outings, while Gretna sits across the river and is worth planning as a separate destination rather than a central New Orleans stop. The directory pairs Southern and Creole cooking with a Vietnamese and Chinese restaurant in Gretna, separating Cajun-influenced, Creole, contemporary Southern and Vietnamese/Chinese businesses so a varied programme can pair a meal with music or a cultural visit rather than spending every outing in a dining room.',
    "The tourism authority lists streetcars, buses, ferries and taxis — worth checking the current route and hours before using a streetcar as a connection to a reservation. Dooky Chase's operator recommends reservations, and at every venue it's worth confirming meal periods rather than inferring lunch or dinner service from the day of the week; for weather-dependent walking and outdoor seating, keep an indoor alternative in mind.",
  ],
  planningLinks: [{ label: 'New Orleans transport guide', href: 'https://www.neworleans.com/plan/transportation/' }],
  sections: [
    {
      heading: 'Venue directory',
      venues: [
        {
          name: 'Boucherie',
          location: 'New Orleans',
          description: 'Restaurant serving contemporary Southern cooking.',
          links: [{ label: 'Website', href: 'https://www.boucherie-neworleans.com/' }],
        },
        {
          name: 'Cochon',
          location: '930 Tchoupitoulas, New Orleans',
          description: 'Restaurant serving Cajun-influenced Southern cooking.',
          links: [{ label: 'Website', href: 'https://cochonrestaurant.com/' }],
        },
        {
          name: "Dooky Chase's",
          location: '2301 Orleans Avenue, New Orleans',
          description: 'Family-owned Creole restaurant in Tremé.',
          note: 'Reservations are recommended by the operator.',
          links: [{ label: 'Website', href: 'https://www.dookychaserestaurants.com/' }],
        },
        {
          name: 'Nine Roses',
          location: '1100 Stephens Street, Gretna, Louisiana',
          description: 'Vietnamese and Chinese restaurant in Gretna, across the river from central New Orleans.',
          links: [{ label: 'Website', href: 'https://ninerosesrestaurant.com/' }],
        },
      ],
    },
  ],
}
