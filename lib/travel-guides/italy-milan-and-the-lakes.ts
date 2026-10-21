import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'italy-milan-and-the-lakes',
  name: 'Milan and the Lakes',
  heroImage: 'https://images.unsplash.com/photo-1586974726316-c6302de6a160?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTA5MjUyfDB8MXxzZWFyY2h8MXx8TGFrZSUyMENvbW8lMjBJdGFseXxlbnwwfDB8fHwxNzkyNTk3NjA3fDA&ixlib=rb-4.1.0&q=80&w=1080',
  heroImageAlt: 'Lake Como, near Milan in northern Italy',
  heroImageCredit: { name: 'Lewis J Goetz', profileUrl: 'https://unsplash.com/@lgoetz?utm_source=wisewayround&utm_medium=referral' },
  tagline: "Lombardy's capital and the lakeside restaurants of Lake Como.",
  intro: [
    'A good visit pairs a few of Milan\'s own addresses with a day or two by the lake, where fish fresh from the water and mountain-style cooking are the draw.',
  ],
  sections: [
    {
      heading: 'Restaurants and Trattorie',
      venues: [
        {
          name: 'Antica Trattoria della Pesa',
          location: 'Viale Pasubio 10, Milan',
          description: 'Traditional Milanese restaurant of the old school, serving risotto, cotoletta and other regional dishes.',
          links: [{ label: 'Website', href: 'https://www.anticatrattoriadellapesa.com/' }],
        },
        {
          name: 'Crotto del Misto',
          location: 'Lezzeno',
          description: 'Lakeside restaurant specialising in freshwater fish, with views across the water.',
          links: [{ label: 'Website', href: 'https://www.crottodelmisto.com/' }],
        },
        {
          name: 'Feel',
          location: 'Via Armando Diaz 54, Como',
          description: 'Contemporary restaurant in Como using ingredients from the lake, woods and mountains.',
          links: [{ label: 'Website', href: 'https://www.feelcomo.com/' }],
        },
        {
          name: 'Il Luogo di Aimo e Nadia',
          location: 'Via Privata Raimondo Montecuccoli 6/8, Milan',
          description: 'Long-running restaurant known for its spring onion spaghetti.',
          links: [{ label: 'Website', href: 'https://www.aimoenadia.com/' }],
        },
        {
          name: 'Materia',
          location: 'Via Trieste 1, Cernobbio',
          description: 'Restaurant that blends Lake Como cooking with international technique.',
          links: [{ label: 'Website', href: 'https://www.ristorantemateria.it/' }],
        },
        {
          name: 'Ratanà',
          location: 'Via Gaetano de Castillia 28, Milan',
          description: 'Restaurant in the Isola district that modernises Milanese cooking, including a well-known risotto.',
          links: [{ label: 'Website', href: 'https://www.ratana.it/' }],
        },
        {
          name: 'Rifugio Martina',
          location: 'Lezzeno',
          description: 'Mountain-style restaurant above Lake Como serving polenta-based dishes of northern Lombardy.',
          links: [{ label: 'Website', href: 'https://www.rifugiomartina.com/' }],
        },
        {
          name: 'Ristorante Mella',
          location: 'Bellagio',
          description: 'Family-run fish restaurant that has served the town since 1958.',
          links: [{ label: 'Website', href: 'https://www.ristorantemella.it/' }],
        },
        {
          name: 'Un Posto a Milano',
          location: 'Via Cuccagna 2, Milan',
          description: 'Cascina-style venue with a large garden, best for coffee or a drink, with a seasonal kitchen.',
          links: [{ label: 'Website', href: 'https://www.unpostoamilano.it/' }],
        },
      ],
    },
    {
      heading: 'Coffee, Pastry and Gelato',
      venues: [
        {
          name: 'Gelato Giusto',
          location: 'Via S. Gregorio 172, Milan',
          description: 'Established Milan gelateria that makes its ice cream with simple ingredients.',
          links: [{ label: 'Website', href: 'https://www.gelatogiusto.it/' }],
        },
        {
          name: 'Pavé',
          location: 'Milan',
          description: 'Bakery, pastry shop and café with several Milan locations, open for breakfast and lunch.',
          links: [{ label: 'Website', href: 'https://pavemilano.com/' }],
        },
      ],
    },
    {
      heading: 'Wine, Beer and Cocktails',
      venues: [
        {
          name: 'Birrificio Lambrate',
          location: 'Milan',
          description: "Brewpub from one of Italy's early craft breweries, with its own beers on tap.",
          links: [{ label: 'Website', href: 'https://birrificiolambrate.com/' }],
        },
      ],
    },
  ],
}
