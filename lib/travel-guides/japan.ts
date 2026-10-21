import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'japan',
  name: 'Japan',
  tagline: "Tokyo's dining addresses cover ramen, tonkatsu, coffee, cocktails, department stores and several styles of restaurant.",
  intro: [
    'The directory works best as a starting point for district-based planning rather than a checklist for a single short stay. Shibuya food shopping, Shinjuku department-store browsing, Azabu-Juban pizza and a Nishi-Azabu meal each make a different outing — set the main reservation first, then choose supporting stops in the same district, since the full street address and building floor can matter more than the nearest broad area name.',
    'JR trains, Tokyo Metro, Toei lines, local railways and buses provide extensive public transport, and IC cards, passes and individual tickets each have different uses — a car is generally unnecessary for a central-city stay according to the official visitor guide.',
    'Small bars, tea services and tasting-format meals may need advance booking and sometimes carry strict cancellation terms, so it is worth asking about dietary restrictions before committing to a set menu. Department-store food halls and convenience stores offer a different way to explore food outside full-service restaurants, though branch services vary.',
  ],
  planningLinks: [
    { label: 'Tokyo official transport guide', href: 'https://www.gotokyo.org/en/plan/getting-around/index.html' },
  ],
  sections: [
    {
      heading: 'Venue directory',
      venues: [
        {
          name: 'Afuri',
          location: 'Tokyo',
          description: 'Ramen business with a directory of Tokyo branches.',
          links: [{ label: 'Website', href: 'https://afuri.com/' }],
        },
        {
          name: 'Bar Benfiddich',
          location: '9F Yamatoya Building, 1-13-7 Nishishinjuku, Tokyo',
          description: 'Cocktail bar in Nishishinjuku.',
          note: 'Its website lists reservations and access details.',
          links: [{ label: 'Website', href: 'https://benfiddich.tokyo/' }],
        },
        {
          name: 'Bunon',
          location: 'Tokyo',
          description: 'Japanese restaurant and wine address in Nishi-Azabu.',
          links: [{ label: 'Website', href: 'https://www.bunon.jp/' }],
        },
        {
          name: 'Butagumi',
          location: 'Tokyo',
          description: 'Pork-focused restaurant group with tonkatsu and other formats.',
          links: [{ label: 'Website', href: 'https://www.butagumi.com/' }],
        },
        {
          name: 'FamilyMart',
          location: 'Tokyo',
          description: 'Convenience-store chain.',
          note: 'Branch facilities and services vary.',
          links: [{ label: 'Website', href: 'https://www.family.co.jp/english' }],
        },
        {
          name: 'Gen Yamamoto',
          location: 'Tokyo',
          description: 'Bar offering a seasonal cocktail-tasting format.',
          links: [{ label: 'Website', href: 'http://www.genyamamoto.jp/' }],
        },
        {
          name: 'Isetan',
          location: 'Tokyo',
          description: 'Department store in Shinjuku.',
          links: [{ label: 'Website', href: 'https://isetan.mistore.jp/store/shinjuku/foreign_customer/index.html' }],
        },
        {
          name: 'Kaikaya by the Sea',
          location: 'Tokyo',
          description: 'Shibuya restaurant centred on fish and Japanese-influenced cooking.',
          links: [{ label: 'Website', href: 'https://www.kaikaya.com/top.html' }],
        },
        {
          name: 'Maisen',
          location: 'Tokyo',
          description: 'Tonkatsu business with restaurants and retail outlets.',
          links: [{ label: 'Website', href: 'https://mai-sen.com/' }],
        },
        {
          name: 'Mitsukoshi',
          location: 'Tokyo',
          description: 'Department-store group with Nihombashi and Ginza stores.',
          links: [{ label: 'Website', href: 'https://cp.mistore.jp/global/en.html' }],
        },
        {
          name: 'Onibus',
          location: 'Tokyo',
          description: 'Specialty-coffee roaster and retailer.',
          links: [{ label: 'Website', href: 'https://onibuscoffee.com/en' }],
        },
        {
          name: 'Savoy pizza',
          location: 'Tokyo',
          description: 'Wood-fired pizza business in Azabu-Juban with several locations.',
          links: [{ label: 'Website', href: 'https://savoy-pizza.com/en' }],
        },
        {
          name: 'Tokyu Food Show',
          location: 'Tokyo',
          description: 'Food hall operated by Tokyu in Shibuya.',
          links: [{ label: 'Website', href: 'https://www.tokyu-dept.co.jp/shibuya_foodshow/' }],
        },
        {
          name: 'Yakumo Saryo',
          location: 'Tokyo',
          description: 'Dining and tea establishment.',
          note: 'Its different services have separate reservation arrangements.',
          links: [{ label: 'Website', href: 'https://www.yakumosaryo.jp/e/' }],
        },
      ],
    },
  ],
}
