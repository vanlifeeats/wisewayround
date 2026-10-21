import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'italy-turin',
  name: 'Turin',
  heroImage: 'https://images.unsplash.com/photo-1610651219730-6b580d616e72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTA5MjUyfDB8MXxzZWFyY2h8MXx8VHVyaW4lMjBJdGFseSUyMHRyYXZlbHxlbnwwfDB8fHwxNzkyNTk3NjA0fDA&ixlib=rb-4.1.0&q=80&w=1080',
  heroImageAlt: 'Arcaded streets in Turin, Piedmont\'s capital',
  heroImageCredit: { name: 'Fabio Fistarol', profileUrl: 'https://unsplash.com/@fabiofistarol?utm_source=wisewayround&utm_medium=referral' },
  tagline: "Piedmont's capital, covered through its traditional dining rooms, modern kitchens, cafés and gelaterie.",
  intro: [
    'A good visit mixes long-standing piole and classic Piedmontese dining rooms with newer creative kitchens, cafes and gelaterie, rather than sticking to one style of meal for the whole trip.',
  ],
  sections: [
    {
      heading: 'Classic Piedmontese Cooking',
      venues: [
        {
          name: 'Antiche Sere',
          location: 'Via Cenischia 9, Turin',
          description:
            'Long-standing favourite outside the centre: plain, family-run and always full, with handwritten menus and famous agnolotti.',
          note: 'Booking is necessary.',
          links: [{ label: 'Facebook', href: 'https://www.facebook.com/osteriaantichesere' }],
        },
        {
          name: 'Le Vitel Etonné',
          location: 'Via S. Francesco da Paola 4, Turin',
          description:
            'A 19th-century cellar with brick arches and good wines, where vitello tonnato is the highlight. Convenient after a visit to the Egyptian Museum.',
          links: [
            { label: 'Website', href: 'https://leviteletonne.com' },
            { label: 'Instagram', href: 'https://instagram.com/leviteletonne' },
          ],
        },
        {
          name: 'Porto di Savona',
          location: 'Piazza Vittorio Veneto 2, Turin',
          description:
            'Historic dining room with a fine view, serving local staples, with long lunches and outdoor tables on sunny days.',
          links: [
            { label: 'Website', href: 'https://www.foodandcompany.com/ristorante-portodisavona' },
            { label: 'Instagram', href: 'https://instagram.com/porto_di_savona' },
          ],
        },
        {
          name: 'Ristorante Solferino',
          location: 'Piazza Solferino 3/B, Turin',
          description:
            'Traditional restaurant favoured by residents, serving agnolotti del plin and raw Fassona beef in an elegant but relaxed room.',
          links: [
            { label: 'Website', href: 'https://www.ristorantesolferino.com' },
            { label: 'Instagram', href: 'https://instagram.com/ristorantesolferino' },
          ],
        },
        {
          name: 'Scannabue',
          location: 'Largo Saluzzo 25/h, San Salvario, Turin',
          description:
            'Neighbourhood favourite for vitello tonnato, tajarin and veal cheek.',
          note: 'Advance planning is advised.',
          links: [
            { label: 'Website', href: 'https://www.scannabue.it' },
            { label: 'Instagram', href: 'https://instagram.com/scannabuecaffe' },
          ],
        },
      ],
    },
    {
      heading: 'Piola Style',
      venues: [
        {
          name: 'Madama Piola',
          location: 'Via Ormea 6bis, Turin',
          description: 'Retains the spirit of a piola with a slightly more polished feel, cozy and lively, suited to an intimate dinner.',
          links: [
            { label: 'Website', href: 'https://www.madamapiolatorino.it' },
            { label: 'Instagram', href: 'https://instagram.com/madama_piola' },
          ],
        },
        {
          name: 'Piola Da Cianci',
          location: 'Largo IV Marzo 9/b, Turin',
          description: 'Loud and crowded in the best sense, with a simple menu, huge portions and free-flowing wine.',
          links: [
            { label: 'Website', href: 'https://www.ciancipiola.it' },
            { label: 'Instagram', href: 'https://instagram.com/ciancipiola' },
          ],
        },
      ],
    },
    {
      heading: 'Creative Cooking',
      venues: [
        {
          name: 'Ristorante Consorzio',
          location: 'Via Monte di Pietà 23, Turin',
          description:
            'Creative Piedmontese food using regional ingredients, with skilfully handled offal and an outstanding wine list, in a modern setting.',
          links: [
            { label: 'Website', href: 'https://www.ristoranteconsorzio.it' },
            { label: 'Instagram', href: 'https://instagram.com/ristoranteconsorzio' },
          ],
        },
      ],
    },
    {
      heading: 'Café',
      venues: [
        {
          name: 'Farmacia del Cambio',
          location: 'Piazza Carignano 2, Turin',
          description:
            "One of the best-known cafés in Turin, popular at breakfast for the cubic croissant and also serving a classic Bicerin or a light lunch, with outdoor tables suited to watching passers-by.",
          links: [
            { label: 'Website', href: 'https://delcambio.it/settori/farmacia-del-cambio' },
            { label: 'Instagram', href: 'https://instagram.com/farmaciadelcambio' },
          ],
        },
      ],
    },
    {
      heading: 'Restaurants and Trattorie',
      venues: [
        {
          name: 'Contesto Alimentare',
          location: 'Via Accademia Albertina 21, Turin',
          description: 'Restaurant with a changing menu based on local, sustainable produce.',
          links: [{ label: 'Website', href: 'https://www.contestoalimentare.it/' }],
        },
        {
          name: 'Grande Muraglia',
          location: 'Turin',
          description: "Chinese restaurant with local touches, part of Turin's international food scene.",
          links: [{ label: 'Website', href: 'https://lagrandemuraglia.com/' }],
        },
        {
          name: 'La Limonaia',
          location: 'Via Mario Ponzio 10, Turin',
          description: 'Garden restaurant serving modern, Mediterranean-leaning dishes, with a tasting menu and à la carte options.',
          links: [{ label: 'Website', href: 'https://www.lalimonaia.org/' }],
        },
        {
          name: 'M**BUN',
          location: 'Via Artigianelli 71/7, Turin',
          description: 'Burger restaurant that also serves vegetarian burgers and fresh pasta cooked to order.',
          links: [{ label: 'Website', href: 'https://mbun.it/' }],
        },
      ],
    },
    {
      heading: 'Coffee, Pastry and Gelato',
      venues: [
        {
          name: 'Caffè Platti',
          location: 'Corso Vittorio Emanuele II 72, Turin',
          description: 'Elegant historic café for pastries and coffee on Corso Vittorio Emanuele II.',
          links: [{ label: 'Website', href: 'https://www.platti1875.com/' }],
        },
        {
          name: 'Gelateria Alberto Marchetti',
          location: "Via Principi d'Acaja 65, Turin",
          description: 'Traditional-method gelato made with local ingredients, with more than one shop in Turin.',
          links: [{ label: 'Website', href: 'https://www.albertomarchetti.it/' }],
        },
        {
          name: 'Gelateria Popolare',
          location: 'Turin',
          description: 'Artisanal gelateria sharing premises with the Vasté bistro in San Salvario.',
          links: [{ label: 'Website', href: 'https://www.gelateriapopolare.com/' }],
        },
        {
          name: 'Orso Laboratorio Caffè',
          location: 'Turin',
          description: 'Specialty coffee roaster and café in Turin.',
          links: [{ label: 'Website', href: 'https://www.orsolaboratoriocaffe.it/en/' }],
        },
      ],
    },
    {
      heading: 'Wine, Beer and Cocktails',
      venues: [
        {
          name: 'Banco Vini e Vinili',
          location: 'Via Giovanni Botero 11, Turin',
          description: 'Wine bar with small plates and a record collection.',
          links: [{ label: 'Website', href: 'https://bancoviniealimenti.it/' }],
        },
        {
          name: 'The Mad Dog Social Club',
          location: 'Turin',
          description: 'Cocktail bar with a jazz focus and a speakeasy atmosphere.',
          links: [{ label: 'Website', href: 'https://www.themaddogsocialclub.com/' }],
        },
        {
          name: 'Open Baladin Torino',
          location: 'Piazzale Valdo Fusi 1, Turin',
          description: 'Branch of the Baladin craft beer pub, on Piazzale Valdo Fusi.',
          links: [
            {
              label: 'Website',
              href: 'https://pubs.baladin.it/en/restaurant-craft-beer-hamburger/piazzale-valdo-fusi-torino/',
            },
          ],
        },
      ],
    },
  ],
}
