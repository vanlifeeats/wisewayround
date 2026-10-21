import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'germany',
  name: 'Germany',
  heroImage: 'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTA5MjUyfDB8MXxzZWFyY2h8MXx8QmVybGluJTIwR2VybWFueSUyMHRyYXZlbHxlbnwwfDB8fHwxNzkyNTk3NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080',
  heroImageAlt: 'A city street in Berlin, Germany',
  heroImageCredit: { name: 'Florian Wehde', profileUrl: 'https://unsplash.com/@florianwehde?utm_source=wisewayround&utm_medium=referral' },
  tagline: "Berlin's added directory covers market shopping, Turkish food, wine and specialty coffee.",
  intro: [
    'Kreuzberg provides a useful food-market anchor, while other shops and cafes are worth a separate route check. Markthalle Neun sits in Kreuzberg; the directory also includes confectionery shops with several branches and a couple of coffee roasters, so it is worth selecting the actual branch before combining places into a walking outing.',
    "Berlin's public network includes U-Bahn, S-Bahn, buses and trams — check fare zones and night services for the intended route rather than assuming every ticket covers every destination. A good plan combines a food-market stop with one nearby meal, saving another district for a later outing, since market trading days and individual stall hours differ.",
  ],
  planningLinks: [
    { label: 'Berlin city transport guide', href: 'https://www.berlin.de/en/public-transportation/' },
    { label: 'Berlin visitor information', href: 'https://www.visitberlin.de/en' },
  ],
  sections: [
    {
      heading: 'Venue directory',
      venues: [
        {
          name: 'Ben Rahim',
          location: 'Berlin',
          description: 'Specialty-coffee company with Berlin boutiques.',
          links: [{ label: 'Website', href: 'https://benrahim.com/' }],
        },
        {
          name: 'Doyum',
          location: 'Berlin',
          description: 'Turkish restaurant in Kreuzberg.',
          links: [{ label: 'Website', href: 'http://www.doyum-restaurant.de/' }],
        },
        {
          name: 'Five Elephant',
          location: 'Berlin',
          description: 'Berlin specialty-coffee roaster.',
          links: [{ label: 'Website', href: 'https://www.fiveelephant.com/' }],
        },
        {
          name: 'Jaja',
          location: 'Berlin',
          description: 'Wine address publishing contact and service information online.',
          links: [{ label: 'Website', href: 'https://www.jajaberlin.com/' }],
        },
        {
          name: 'Konditorei Damaskus',
          location: 'Berlin',
          description: 'Confectionery business with several Berlin shops.',
          links: [{ label: 'Website', href: 'https://damaskus-konditorei-emissa.com/' }],
        },
        {
          name: 'Markthalle Neun',
          location: 'Eisenbahnstrasse 42/43, Berlin-Kreuzberg',
          description: 'Market hall in Kreuzberg with food stalls and producers.',
          links: [{ label: 'Website', href: 'https://markthalleneun.de/' }],
        },
        {
          name: 'Tadim Ocakbasi',
          location: 'Berlin',
          description: 'Turkish restaurant in Berlin.',
          links: [{ label: 'Website', href: 'https://tadim-ocakbasi.eatbu.com/?lang=en' }],
        },
      ],
    },
  ],
}
