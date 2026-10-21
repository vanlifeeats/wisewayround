import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'france',
  name: 'France',
  tagline:
    'Paris pairs a concentrated historic centre with a dining scene that reaches well beyond the main monuments.',
  intro: [
    'A good visit mixes formal restaurant bookings with market shopping, cafes and smaller neighbourhood addresses. The directory leans on two useful clusters — the Palais Royal area and the eastern districts around rue de Charonne, rue Saint-Maur and rue Saint-Bernard — which work best treated as separate outings rather than one packed day.',
    'The metro covers journeys within the city, while the RER reaches further out; buses, trams and airport transfers run on different ticket products, so it is worth checking the official visitor transport guide before settling on a pass.',
    'Fix the most important restaurant booking first, then build nearby shops and a flexible meal around it. Worth confirming in advance whether a venue takes reservations or walk-ins, since cafes, wine bars and restaurants sometimes share similar names.',
  ],
  planningLinks: [
    { label: 'Paris visitor transport guide', href: 'https://parisjetaime.com/eng/article/public-transport-a555' },
  ],
  sections: [
    {
      heading: 'Venue directory',
      venues: [
        {
          name: 'Alleosse',
          location: 'Paris',
          description: 'Cheesemonger and cheese maturer.',
          links: [{ label: 'Website', href: 'https://fromage-alleosse.com/' }],
        },
        {
          name: 'Bistrot Paul Bert',
          location: '18 rue Paul Bert, Paris 11',
          description: 'Classic Parisian bistro on rue Paul Bert.',
          links: [{ label: 'Website', href: 'https://bistrotpaulbert.fr/en' }],
        },
        {
          name: 'Boot Cafe',
          location: 'Paris',
          description: 'Small coffee shop with its own online page.',
          links: [{ label: 'Website', href: 'https://cargocollective.com/bootcafe' }],
        },
        {
          name: 'Breizh Cafe',
          location: 'Paris',
          description: 'Crêpe and galette business with several branches.',
          links: [{ label: 'Website', href: 'https://www.breizhcafe.com/' }],
        },
        {
          name: 'Brutos',
          location: '5 rue du Général Renault, Paris 75011',
          description: 'Restaurant on rue du Général Renault.',
          links: [{ label: 'Website', href: 'https://www.brutosparis.com/' }],
        },
        {
          name: 'Clamato',
          location: '80 rue de Charonne, Paris 11',
          description: 'Dining address on rue de Charonne with a menu that changes regularly.',
          links: [{ label: 'Website', href: 'https://www.clamato-charonne.fr/' }],
        },
        {
          name: 'Clown Bar',
          location: 'Paris',
          description: 'Restaurant with a natural-wine programme inside a protected historic interior.',
          links: [{ label: 'Website', href: 'https://www.clownbar.fr/' }],
        },
        {
          name: 'Jacques Genin',
          location: 'Paris',
          description: 'Chocolate and confectionery maker.',
          links: [{ label: 'Website', href: 'https://jacquesgenin.fr/' }],
        },
        {
          name: 'Kunitoraya',
          location: 'Paris',
          description: 'Japanese udon restaurant near Palais Royal.',
          links: [{ label: 'Website', href: 'https://www.kunitoraya.com/' }],
        },
        {
          name: "L'Ami Jean",
          location: 'Paris',
          description: 'Restaurant run by chef Stéphane Jégo.',
          links: [{ label: 'Website', href: 'https://lamijean.fr/' }],
        },
        {
          name: "L'Avant Comptoir",
          location: 'Paris',
          description: 'Standing-counter dining with small hot and cold dishes.',
          links: [{ label: 'Website', href: 'https://camdeborde.com/en/restaurants/avant-comptoir-de-la-terre' }],
        },
        {
          name: 'La Buvette',
          location: 'Paris',
          description: 'Wine shop and bar specialising in natural wines.',
          links: [{ label: 'Website', href: 'https://www.labuvette.paris/' }],
        },
        {
          name: 'Laurent Dubois',
          location: 'Paris',
          description: 'Cheesemonger with several shops across the city.',
          links: [{ label: 'Website', href: 'https://fromageslaurentdubois.fr/fr/' }],
        },
        {
          name: 'Le Chocolat Alain Ducasse',
          location: 'Paris',
          description: 'Chocolate maker and retailer.',
          links: [{ label: 'Website', href: 'https://www.lechocolat-alainducasse.com/fr/' }],
        },
        {
          name: 'Le Servan',
          location: '32 rue Saint-Maur, Paris 75011',
          description: 'Dining address on rue Saint-Maur.',
          links: [{ label: 'Website', href: 'https://www.leservan.fr/' }],
        },
        {
          name: 'Maison Verot',
          location: 'Paris',
          description: 'Charcuterie retailer.',
          links: [{ label: 'Website', href: 'https://www.maisonverot.fr/' }],
        },
        {
          name: 'Mokonuts',
          location: '5 rue Saint-Bernard, Paris',
          description: 'Lunch restaurant on rue Saint-Bernard.',
          note: 'Its related cafe and evening restaurant sit at different addresses — check which one you are booking.',
          links: [{ label: 'Website', href: 'https://www.mokonuts.com/' }],
        },
        {
          name: 'Septime',
          location: 'Paris',
          description: 'Restaurant known for its tasting menus.',
          links: [{ label: 'Website', href: 'https://www.septime-charonne.fr/en' }],
        },
        {
          name: 'Septime La Cave',
          location: '3 rue Basfroi, Paris 11',
          description: "Septime's wine bar and shop on rue Basfroi.",
          links: [{ label: 'Website', href: 'https://www.septime-lacave.fr/' }],
        },
        {
          name: 'Verjus',
          location: '52 rue de Richelieu, Paris 75001',
          description: 'Restaurant on rue de Richelieu.',
          links: [{ label: 'Website', href: 'https://www.verjusparis.com/' }],
        },
        {
          name: 'Vivant',
          location: 'Paris',
          description: 'Dining address with direct booking details on its own website.',
          links: [{ label: 'Website', href: 'https://www.vivantparis.com/' }],
        },
      ],
    },
  ],
}
