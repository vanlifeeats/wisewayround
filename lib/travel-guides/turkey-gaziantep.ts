import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'turkey-gaziantep',
  name: 'Gaziantep',
  heroImage: 'https://images.unsplash.com/photo-1662047159388-f5954f2dc592?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTA5MjUyfDB8MXxzZWFyY2h8MXx8R2F6aWFudGVwJTIwVHVya2V5JTIwYmF6YWFyfGVufDB8MHx8fDE3OTI1OTg3MjB8MA&ixlib=rb-4.1.0&q=80&w=1080',
  heroImageAlt: 'A bazaar street in Gaziantep, Turkey',
  heroImageCredit: { name: 'Ozkan Guner', profileUrl: 'https://unsplash.com/@dentistozkanguner?utm_source=wisewayround&utm_medium=referral' },
  tagline: 'Food traditions, bazaars and the Zeugma Mosaic Museum — a deliberately short, operator-confirmed directory.',
  intro: [
    "The city's visitor information highlights bazaars, historic streets and the Zeugma mosaics, and a museum visit offers a useful counterbalance to a food-focused programme — museum admission, opening hours and access are worth reading from the official museum page before arrival.",
    'The national tourism authority describes a cuisine built on pistachios, peppers, sour flavourings, vegetables, meat and yoghurt, with beyran, kebabs, baklava and katmer each representing a different part of it, so planning several smaller tastings works better than assuming every specialty belongs in one meal.',
    'The UK travel advisory currently advises against all travel within 10 km of the Türkiye-Syria border and warns of possible regional disruption — a specific boundary, not a description of the whole city, but worth reading in full, along with confirming the intended route and insurance coverage, before travel.',
  ],
  planningLinks: [
    { label: 'Gaziantep visitor overview', href: 'https://goturkiye.com/gaziantep' },
    { label: 'Gaziantep food traditions', href: 'https://goturkiye.com/gaziantep/taste' },
    { label: 'Current regional travel advice', href: 'https://www.gov.uk/foreign-travel-advice/turkey/regional-risks' },
  ],
  sections: [
    {
      heading: 'Venue directory',
      venues: [
        {
          name: 'Katmerci Zekeriya Usta',
          location: 'Gaziantep',
          description: 'Katmer bakery using a stone oven.',
          links: [{ label: 'Website', href: 'https://katmercizekeriya.com/' }],
        },
        {
          name: 'Metanet',
          location: 'Gaziantep',
          description: 'Restaurant serving beyran and kebabs.',
          links: [{ label: 'Website', href: 'http://metanetlokantasi.com/' }],
        },
        {
          name: 'Zeugma Mosaic Museum',
          location: 'Mithatpaşa Mahallesi, Hacı Sani Konukoğlu Bulvarı, Tekel Caddesi 2, Gaziantep',
          description: 'Museum displaying mosaics and archaeological material from Zeugma.',
          links: [{ label: 'Website', href: 'https://muze.gov.tr/muze-detay?DistId=GZN&SectionId=GZN01' }],
        },
      ],
    },
  ],
}
