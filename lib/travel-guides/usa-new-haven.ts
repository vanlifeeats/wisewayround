import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'usa-new-haven',
  name: 'New Haven',
  tagline: 'Yale, the Green and apizza make a compact city visit.',
  intro: [
    "A campus visit and one principal pizza meal make a workable day, with a second stop on another neighbourhood or a downtown drink rather than a repeated full meal. Apizza is the local pizza format — select the New Haven branch when using a chain's own location directory, and leave room for queueing rather than ordering more than practical just to compare several places in one afternoon.",
    "Yale's Visitor Center sits on Elm Street opposite the Green, and guided tours need reservations, so it's worth checking the university's current visitor page for access and holiday closures. Union Station is the useful transport anchor, with the regional visitor guide covering buses and other connections; a downtown parking plan and station-to-centre transfer are worth sorting before a short visit. BAR's age policy is worth particular attention for a family visit.",
  ],
  planningLinks: [
    { label: 'Yale visitor planning', href: 'https://visitorcenter.yale.edu/plan-your-visit' },
    { label: 'New Haven transport information', href: 'https://visitnewhaven.com/visitor-info/transportation/' },
  ],
  sections: [
    {
      heading: 'Venue directory',
      venues: [
        {
          name: 'BAR pizza',
          location: 'New Haven',
          description: 'Pizza, beer and nightlife venue.',
          note: 'Age restrictions differ from a conventional family restaurant and should be checked.',
          links: [{ label: 'Website', href: 'https://barnightclub.com/' }],
        },
        {
          name: 'Frank Pepe',
          location: 'New Haven',
          description: 'New Haven-style coal-fired pizzeria.',
          links: [{ label: 'Website', href: 'https://pepespizzeria.com/' }],
        },
        {
          name: 'Modern Apizza',
          location: '874 State Street, New Haven',
          description: 'New Haven pizzeria using brick ovens.',
          links: [{ label: 'Website', href: 'https://www.modernapizza.com/' }],
        },
        {
          name: 'Prime 16',
          location: '172 Temple Street, New Haven',
          description: 'Downtown tap house serving burgers and craft beer.',
          links: [{ label: 'Website', href: 'https://prime16.com/about-new-haven/' }],
        },
        {
          name: "Sally's Apizza",
          location: 'New Haven',
          description: "Apizza business; select the New Haven branch in its location directory.",
          links: [{ label: 'Website', href: 'https://sallysapizza.com/' }],
        },
      ],
    },
  ],
}
