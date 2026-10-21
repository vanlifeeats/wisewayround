import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'italy-sardinia',
  name: 'Sardinia',
  heroImage: 'https://images.unsplash.com/photo-1593075356257-252c29b02ce8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTA5MjUyfDB8MXxzZWFyY2h8MXx8Q2FnbGlhcmklMjBTYXJkaW5pYSUyMEl0YWx5fGVufDB8MHx8fDE3OTI1OTc2MjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  heroImageAlt: 'The coastline near Cagliari, Sardinia',
  heroImageCredit: { name: 'Laura Lugaresi', profileUrl: 'https://unsplash.com/@lauralugaresi?utm_source=wisewayround&utm_medium=referral' },
  tagline: 'Dining in Cagliari and the south of the island.',
  intro: [
    'A good visit centres on Cagliari for special-occasion dinners and modern Sardinian cooking, with short drives out to seafood restaurants and an agriturismo along the coast.',
  ],
  sections: [
    {
      heading: 'Special-Occasion Dinners',
      venues: [
        {
          name: 'Casa Clàt',
          location: 'Viale Regina Margherita 55/57, Cagliari',
          description:
            'A nine-room boutique hotel with murals by a Sardinian artist and a gourmet restaurant popular with locals; the owners operate Sardinia\u2019s leading mussel farm, so seafood is a highlight.',
          note: 'Dinner in the garden is worth booking.',
          links: [
            { label: 'Website', href: 'https://www.casaclat.it/en/restaurant' },
            { label: 'Instagram', href: 'https://instagram.com/casaclat' },
          ],
        },
        {
          name: 'Luigi Pomata',
          location: 'Viale Regina Margherita 18, Cagliari',
          description:
            'Chef Luigi Pomata comes from Carloforte, a tuna-fishing island off Sardinia, and trained in New York and London; the menu offers à la carte dishes and tasting menus, including one centred on tuna.',
          links: [
            { label: 'Website', href: 'https://luigipomata.com/en' },
            { label: 'Instagram', href: 'https://instagram.com/luigipomata' },
          ],
        },
        {
          name: 'Ristorante Calamosca',
          location: 'Viale Calamosca 50, Cagliari',
          description:
            'A family-run restaurant on a scenic bay ten minutes from the centre, popular for anniversaries and birthdays; an aperitivo at the neighbouring Terrazze Calamosca makes a good prelude to seafood with a twist.',
          note: 'Reservations are advised.',
          links: [
            { label: 'Website', href: 'https://calamosca.it' },
            { label: 'Instagram', href: 'https://instagram.com/ristorantecalamosca' },
          ],
        },
      ],
    },
    {
      heading: 'Modern Sardinian Cooking',
      venues: [
        {
          name: 'Josto',
          location: 'Via Sassari 25, Cagliari',
          description: 'Sleek and modern, with vinyl records playing, reinventing Sardinian cuisine.',
          links: [
            { label: 'Bookings', href: 'https://josto.superbexperience.com' },
            { label: 'Instagram', href: 'https://instagram.com/josto.ristorante' },
          ],
        },
        {
          name: 'Old Friend',
          location: 'Via Giuseppe Abba 51, Cagliari',
          description: 'Intimate and contemporary, with organic wine or craft beer; diners are encouraged to trust the chef and choose a tasting menu.',
          links: [
            { label: 'Bookings', href: 'https://oldfriend.superbexperience.com' },
            { label: 'Instagram', href: 'https://instagram.com/oldfriendcagliari' },
          ],
        },
        {
          name: 'Sabores Vino e Cucina',
          location: 'Via Lodovico Baylle 6, Cagliari',
          description: "A central bistro whose daily menu is shaped by chef-owner Samuele and by ingredients from the market.",
          links: [
            { label: 'Bookings', href: 'https://sabores.superbexperience.com' },
            { label: 'Instagram', href: 'https://instagram.com/saborescagliari' },
          ],
        },
      ],
    },
    {
      heading: 'Short Drives from the City',
      venues: [
        {
          name: 'Agriturismo La Biada',
          location: 'Via S. Francesco 62, Santa Margherita di Pula (about 40 minutes from Cagliari)',
          description:
            'A family-run agriturismo with a few simple rooms and honest home cooking; there is no menu — for €50 per person, guests receive antipasti, two pastas including delicate ravioli, porceddu, fruit, dessert, water and wine.',
          links: [
            { label: 'Website', href: 'https://www.agriturismolabiada.it/en/home-english' },
            { label: 'Instagram', href: 'https://instagram.com/agriturismo_la_biada' },
          ],
        },
        {
          name: 'Fradis Minoris',
          location: 'Laguna di Nora, Pula (about 45 minutes from Cagliari)',
          description:
            'A Michelin-starred restaurant on an isthmus near a Roman archaeological site; chef Francesco Stara turns lagoon fish and local vegetables into artful dishes, with a large wine list drawn from native Sardinian grapes.',
          links: [
            { label: 'Website', href: 'https://www.fradisminoris.it/en/home-3' },
            { label: 'Instagram', href: 'https://instagram.com/fradisminoris' },
          ],
        },
        {
          name: 'Sa Cardiga e Su Schironi',
          location: 'Maddalena Spiaggia',
          description:
            'Worth the short drive; a display case shows the catch of the day — shrimp, sea urchin, lobster, eel and Carloforte tuna — and it is known for grilled seafood.',
          links: [
            { label: 'Website', href: 'https://www.sacardigaesuschironi.it' },
            { label: 'Instagram', href: 'https://instagram.com/sacardigaesuschironi' },
          ],
        },
      ],
    },
    {
      heading: 'Cafés',
      venues: [
        {
          name: 'Antico Caffè',
          location: 'Piazza Costituzione 10, Cagliari',
          description: 'Open since 1855 at the foot of the Bastion of Saint Remy; espresso or a light bite can be had on the terrace or inside.',
          links: [
            { label: 'Website', href: 'https://anticocaffe1855.it/en/home-2' },
            { label: 'Instagram', href: 'https://instagram.com/antico_caffe_1855' },
          ],
        },
        {
          name: 'Coccodi Dolce e Salato',
          location: 'Via Santa Margherita 9, Cagliari',
          description: 'A casual bakery-café near Piazza Yenne offering salads, savoury cornetti and cakes by the slice.',
          links: [
            { label: 'Website', href: 'https://coccodi.com' },
            { label: 'Instagram', href: 'https://instagram.com/coccodibakery' },
          ],
        },
      ],
    },
    {
      heading: 'More Addresses: Restaurants and Trattorie',
      venues: [
        {
          name: 'La Terrazza',
          location: 'Capoterra',
          description: 'Wine bar and bistro in Capoterra, serving classic and creative dishes.',
          links: [{ label: 'Website', href: 'https://laterrazzavineria.it/' }],
        },
      ],
    },
  ],
}
