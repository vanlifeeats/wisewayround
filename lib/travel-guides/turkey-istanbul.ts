import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'turkey-istanbul',
  name: 'Istanbul',
  heroImage: 'https://images.unsplash.com/photo-1589561454226-796a8aa89b05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTA5MjUyfDB8MXxzZWFyY2h8MXx8SXN0YW5idWwlMjBUdXJrZXklMjB0cmF2ZWx8ZW58MHwwfHx8MTc5MjU5ODcxOHww&ixlib=rb-4.1.0&q=80&w=1080',
  heroImageAlt: 'The Bosphorus skyline of Istanbul, Turkey',
  heroImageCredit: { name: 'Engin Yapici', profileUrl: 'https://unsplash.com/@yapici?utm_source=wisewayround&utm_medium=referral' },
  tagline: 'Grill restaurants, pide and mantı specialists and regional Turkish cooking across both sides of the Bosphorus.',
  intro: [
    'Karaköy, Fatih, Ulus, Tarabya and Kadıköy are not one compact walking circuit, so a practical schedule groups meals by side of the city and avoids crossing the Bosphorus merely to tick off another restaurant. Şehir Hatları publishes inner-city ferry routes, including connections between Kadıköy and the European-side piers — worth confirming the correct pier and current sailing rather than relying on an old crossing estimate, since the ferry network can be part of the visit itself as well as a means of transport.',
    "The directory below identifies pide, mantı and kebab businesses separately, and it's worth consulting a venue's own menu for ingredients, portion sizes and dietary questions rather than assuming a familiar dish name meets every requirement. One European-side food outing plus a separate Kadıköy visit works well, with Tarabya kept as a deliberate longer excursion rather than an impulsive extra stop, and current government travel advice checked before departure.",
  ],
  planningLinks: [
    { label: 'Istanbul visitor overview', href: 'https://goturkiye.com/istanbul' },
    { label: 'Istanbul ferry timetables', href: 'https://sehirhatlari.istanbul/en/timetables' },
    { label: 'Current Türkiye travel advice', href: 'https://www.gov.uk/foreign-travel-advice/turkey' },
  ],
  sections: [
    {
      heading: 'Venue directory',
      venues: [
        {
          name: 'Adana Ocakbaşı',
          location: 'Istanbul',
          description: 'Ocakbaşı restaurant preparing kebabs over a wood-fired grill.',
          links: [{ label: 'Website', href: 'http://adanaocakbasi.com.tr/' }],
        },
        {
          name: 'Aşkana Mantı',
          location: 'Istanbul',
          description: 'Mantı specialist with an Ulus branch and further locations.',
          links: [{ label: 'Website', href: 'https://askanamanti.com.tr/' }],
        },
        {
          name: 'Çiya',
          location: 'Istanbul',
          description: 'Restaurant group serving kebabs, lahmacun and regional Turkish dishes.',
          links: [{ label: 'Website', href: 'http://ciya.com.tr/' }],
        },
        {
          name: 'Fatih Karadeniz Pidecisi',
          location: 'Istanbul',
          description: 'Pide business with several Istanbul branches; select the intended branch before travelling.',
          links: [{ label: 'Website', href: 'https://www.fatihkaradenizpidecisi.com/beylikduzu-subemiz-hizmete-acilmistir/' }],
        },
        {
          name: 'Kıyı',
          location: 'Haydar Aliyev Caddesi 186/A, Tarabya, Istanbul',
          description: 'Restaurant in Tarabya; the operator confirms its address on Haydar Aliyev Caddesi.',
          links: [{ label: 'Website', href: 'https://www.kiyi.com.tr/' }],
        },
        {
          name: 'Tarihi Karaköy Balıkçısı',
          location: 'Istanbul',
          description: 'Fish restaurant trading as Grifin in Karaköy.',
          links: [{ label: 'Website', href: 'https://karakoybalikcisi.com/' }],
        },
      ],
    },
  ],
}
