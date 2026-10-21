import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'portugal',
  name: 'Portugal',
  heroImage: 'https://images.unsplash.com/photo-1501927023255-9063be98970c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTA5MjUyfDB8MXxzZWFyY2h8MXx8TGlzYm9uJTIwUG9ydHVnYWwlMjB0cmF2ZWx8ZW58MHwwfHx8MTc5MjU5NzU5NHww&ixlib=rb-4.1.0&q=80&w=1080',
  heroImageAlt: 'Tiled rooftops along the Tagus estuary in Lisbon, Portugal',
  heroImageCredit: { name: 'Liam McKay', profileUrl: 'https://unsplash.com/@liammckay?utm_source=wisewayround&utm_medium=referral' },
  tagline: 'Lisbon sits on the Tagus estuary, with a food scene that spans everyday restaurants, pastry shops, bars and one more formal dining option.',
  intro: [
    "Meal planning here doesn't need to rely on a single style of place. Belém is a separate excursion from the central restaurant addresses, and Campo de Ourique offers another distinct dining area — it works best to build the day around one area, then keep the second meal flexible rather than crossing the city repeatedly.",
    'The city is served by its international airport and the Santa Apolónia and Oriente railway stations; the official visitor-information page explains arrival choices and regional access, so it is worth confirming the exact station or terminal before booking an onward service.',
    'Spring and autumn tend to be mild and sunny, winters mild and summers hot, though actual weather and individual venue holidays still need checking closer to the date. Select the intended branch of any restaurant group, confirm the current menu, and ask about unrequested table items before they land in front of you.',
  ],
  planningLinks: [
    { label: 'Lisbon visitor information', href: 'https://www.visitlisboa.com/en/traveller-information' },
  ],
  sections: [
    {
      heading: 'Venue directory',
      venues: [
        {
          name: 'A Ginjinha',
          location: 'Lisbon',
          description: 'Ginjinha producer and bar.',
          links: [{ label: 'Website', href: 'https://ginjinhaespinheira.com/' }],
        },
        {
          name: 'Beira Gare',
          location: 'Lisbon',
          description: 'Restaurant with a takeaway service.',
          links: [{ label: 'Website', href: 'https://beiragarelisboa.eatbu.com/?lang=pt' }],
        },
        {
          name: 'Belcanto',
          location: 'Lisbon',
          description: 'José Avillez restaurant serving contemporary Portuguese cuisine.',
          links: [{ label: 'Website', href: 'https://www.belcanto.pt/en/' }],
        },
        {
          name: 'Bonjardim',
          location: 'Lisbon',
          description: "Restaurant listed by Lisbon's historic-shop programme.",
          links: [{ label: 'Website', href: 'https://lojascomhistoria.pt/lojas/bonjardim?lang=pt' }],
        },
        {
          name: 'Cantinho do Avillez',
          location: 'Lisbon',
          description: 'Restaurant operated under the José Avillez name.',
          links: [{ label: 'Website', href: 'https://cantinhodoavillez.pt/en/' }],
        },
        {
          name: 'Pastéis de Belém',
          location: 'Lisbon',
          description: 'Bakery producing custard tarts in Belém.',
          links: [{ label: 'Website', href: 'https://pasteisdebelem.pt/en/' }],
        },
        {
          name: 'Tasca da Esquina',
          location: 'Lisbon',
          description: 'Portuguese restaurant in Campo de Ourique.',
          links: [{ label: 'Website', href: 'https://tascadaesquina.com/pt-pt/' }],
        },
      ],
    },
  ],
}
