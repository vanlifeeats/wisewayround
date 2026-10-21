import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'usa-philadelphia',
  name: 'Philadelphia',
  heroImage: 'https://images.unsplash.com/photo-1569761316261-9a8696fa2ca3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTA5MjUyfDB8MXxzZWFyY2h8MXx8UGhpbGFkZWxwaGlhJTIwc2t5bGluZXxlbnwwfDB8fHwxNzkyNTk4NzEzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  heroImageAlt: 'The city skyline of Philadelphia',
  heroImageCredit: { name: 'ActionVance', profileUrl: 'https://unsplash.com/@actionvance?utm_source=wisewayround&utm_medium=referral' },
  tagline: 'From a sandwich shop to supper-club dining and pasta, with access rules worth checking first.',
  intro: [
    "Center City's street grid supports walking, with SEPTA and other transport choices covering longer trips — worth settling on a main dining area and using the current visitor transport guide for the connection.",
    "Access rules matter here: Palizzi Social Club's own site says new membership applications are currently suspended, so it is retained with that explicit restriction rather than offered as an accessible reservation. Supper-club, omakase and ordinary restaurant bookings are each worth checking on their own terms, and balancing a sandwich lunch with one planned evening meal, with a walking or cultural outing in between, makes a workable structure.",
  ],
  planningLinks: [
    { label: 'Philadelphia transport and walking guide', href: 'https://www.visitphilly.com/getting-around/' },
    { label: 'Philadelphia visitor information', href: 'https://www.visitphilly.com/' },
  ],
  sections: [
    {
      heading: 'Venue directory',
      venues: [
        {
          name: 'Fiorella',
          location: 'Philadelphia',
          description: 'Pasta bar operated by Marc Vetri.',
          links: [{ label: 'Website', href: 'https://fiorellaphilly.com/' }],
        },
        {
          name: 'Friday Saturday Sunday',
          location: '261 South 21st Street, Philadelphia',
          description: 'Restaurant on South 21st Street.',
          links: [{ label: 'Website', href: 'https://www.fridaysaturdaysunday.com/' }],
        },
        {
          name: 'Her Place',
          location: '1740 Sansom Street, Philadelphia',
          description: 'Supper-club restaurant on Sansom Street.',
          links: [{ label: 'Website', href: 'https://www.herplacephilly.com/' }],
        },
        {
          name: "John's Roast Pork",
          location: 'Philadelphia',
          description: 'Sandwich shop serving roast pork and cheesesteaks.',
          links: [{ label: 'Website', href: 'https://johnsroastpork.com/' }],
        },
        {
          name: 'Palizzi Social Club',
          location: '1408 South 12th Street, Philadelphia',
          description: 'Italian-American members\u2019 club.',
          note: 'Its website says new membership applications are currently suspended; this is not a general walk-in recommendation.',
          links: [{ label: 'Website', href: 'https://palizzisocial.com/' }],
        },
        {
          name: 'Royal Izakaya',
          location: 'Philadelphia',
          description: 'Japanese dining business with an izakaya and an omakase service.',
          links: [{ label: 'Website', href: 'https://royalizakaya.com/' }],
        },
        {
          name: 'Vetri',
          location: '1312 Spruce Street, Philadelphia',
          description: 'Restaurant on Spruce Street offering dinner reservations.',
          links: [{ label: 'Website', href: 'https://vetricucina.com/' }],
        },
        {
          name: 'Zahav',
          location: 'Philadelphia',
          description: 'Restaurant with booking and current information on its own site.',
          links: [{ label: 'Website', href: 'https://www.zahavrestaurant.com/' }],
        },
      ],
    },
  ],
}
