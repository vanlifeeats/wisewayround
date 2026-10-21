import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'italy-venice',
  name: 'Venice',
  heroImage: 'https://images.unsplash.com/photo-1504843812413-16480b674871?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTA5MjUyfDB8MXxzZWFyY2h8MXx8VmVuaWNlJTIwSXRhbHklMjBjYW5hbHN8ZW58MHwwfHx8MTc5MjU5NzYwOXww&ixlib=rb-4.1.0&q=80&w=1080',
  heroImageAlt: 'Canals and bridges across Venice, Italy',
  heroImageCredit: { name: 'Elisha Terada', profileUrl: 'https://unsplash.com/@elishaterada?utm_source=wisewayround&utm_medium=referral' },
  tagline: 'Restaurants, bacari, cafés and sweets across the lagoon city and its islands.',
  intro: [
    'A good visit mixes a bacaro crawl of small bites and wine with a few proper sit-down meals, leaving room for a side trip to Burano or Mazzorbo and a stop for something cold along the way.',
  ],
  sections: [
    {
      heading: 'Venetian Bacari: A Small-Bites and Wine Crawl',
      venues: [
        {
          name: 'Adriatico Mar',
          location: 'Calle Crosera 3771, Venice',
          description:
            'Modern bacaro near the Frari, with a reading corner, soft music and a wooden dock on the canal, serving cicchetti, panini, charcuterie, salads and wines from small producers.',
          links: [{ label: 'Facebook', href: 'https://www.facebook.com/MalvasiaAdriaticoMar' }],
        },
        {
          name: "All'Arco",
          location: 'San Polo 436, Venice',
          description:
            'Hole-in-the-wall near the Rialto run by a father and son, with ingredients from the nearby market; the baccalà mantecato is among the best in the city.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/allarcovenezia' }],
        },
        {
          name: 'Bacareto da Lele',
          location: 'Fondamenta dei Tolentini 183, Venice',
          description: 'Tiny bacaro with cheap panini eaten by the canal five minutes from the station, a good first or last stop.',
          links: [{ label: 'Website', href: 'https://bacaretodalele.it/' }],
        },
        {
          name: 'Bar alla Toletta',
          location: 'Dorsoduro 1191, Venice',
          description: 'More than 25 types of tramezzini, the crustless sandwiches; popular fillings are spinach and cheese, gorgonzola and porchetta, and salmon and egg.',
          links: [{ label: 'Facebook', href: 'https://www.facebook.com/100064162054399' }],
        },
        {
          name: 'Cantina Do Mori',
          location: 'Calle Do Mori 429, Venice',
          description:
            'Said to be the oldest bacaro, open since 1462, with a wood interior, copper pots overhead and excellent octopus cicchetti, with wines ranging from budget to premium.',
          links: [],
        },
        {
          name: "Cà D'Oro alla Vedova",
          location: "Ramo Ca' d'Oro 3912, Venice",
          description: 'Praised for its polpette, crunchy fried meatballs of beef and potato.',
          note: 'A seat in the restaurant needs a reservation, but wine and meatballs can be had at the counter without one.',
          links: [{ label: 'Facebook', href: 'https://www.facebook.com/allavedova' }],
        },
        {
          name: 'Vino Vero',
          location: 'Fondamenta de la Misericordia 2497, Cannaregio, Venice',
          description:
            'Open since 2014 in a less touristy district, with an exceptional wine list heavy on natural options and cicchetti that change regularly, including fried calamari, stuffed zucchini flowers and anchovies with butter.',
          links: [{ label: 'Website', href: 'https://vinovero.wine/luoghi/venezia' }],
        },
      ],
    },
    {
      heading: 'Venice, Bite by Bite: Dinner in the City',
      venues: [
        {
          name: 'Antiche Carampane',
          location: 'Rio Terà de le Carampane 1911, San Polo, Venice',
          description:
            "Favoured by locals and insiders, this restaurant is all about fish, as fresh as possible, with a menu that changes daily according to the catch; a sign outside rules out pizza, lasagna and tourist menus.",
          links: [
            { label: 'Website', href: 'https://www.antichecarampane.com/en' },
            { label: 'Instagram', href: 'https://instagram.com/antichecarampane' },
          ],
        },
        {
          name: 'Al Bacareto',
          location: 'Campo San Samuele 3447, Venice',
          description:
            'Plain trattoria since 1971 that also offers a few dishes for those avoiding seafood, such as lasagna and cotoletta, alongside sarde in saor, baccalà mantecato, bigoli in salsa, seafood risotto, seppie with polenta or soft-shell crabs.',
          links: [{ label: 'Website', href: 'https://bacareto.it/en' }],
        },
        {
          name: 'Corte Sconta',
          location: 'Calle del Pestrin 3886, Castello, Venice',
          description:
            'Traditional, family-run restaurant for more than 40 years, with a vine-covered courtyard; a good order is the antipasto veneziano bollito of slipper lobster, tiny octopus and baccalà mantecato, followed by squid ink spaghetti or mixed fried fish.',
          links: [
            { label: 'Website', href: 'https://www.cortescontave.com' },
            { label: 'Instagram', href: 'https://instagram.com/corte_sconta_venezia' },
          ],
        },
        {
          name: 'Al Covo',
          location: 'Campiello de la Pescaria 3968, Castello, Venice',
          description:
            'Low wood-beamed rooms and yellow walls, with owners Diane, originally from Texas, and Cesare treating guests like family; the Venetian cooking is careful and ingredient-led.',
          links: [
            { label: 'Website', href: 'https://ristorantealcovo.com' },
            { label: 'Instagram', href: 'https://instagram.com/ristorantealcovo' },
          ],
        },
        {
          name: 'Osteria Anice Stellato',
          location: 'Fondamenta de la Sensa 3272, Cannaregio, Venice',
          description: 'Set away from the crowds on a canal-side quay, turning fish into creative versions of Venetian classics.',
          links: [
            { label: 'Website', href: 'https://www.osterianicestellato.com' },
            { label: 'Instagram', href: 'https://instagram.com/osterianicestellato' },
          ],
        },
        {
          name: 'Al Vecio Marangon',
          location: 'Calle della Toletta, Dorsoduro, Venice',
          description:
            'Tiny wood-panelled bistro near the Accademia and the Peggy Guggenheim Collection, serving cicchetti and pastas, with good vegetarian options such as eggplant parmigiana and gorgonzola-walnut gnocchi.',
          links: [
            { label: 'Website', href: 'https://alveciomarangon.com' },
            { label: 'Instagram', href: 'https://instagram.com/alveciomarangon' },
          ],
        },
      ],
    },
    {
      heading: 'On the Islands',
      venues: [
        {
          name: 'Trattoria al Gatto Nero',
          location: 'Via Giudecca 88, Burano',
          description:
            "The best-liked restaurant on Burano for its lightly grilled scallops, tiny shrimp on white polenta, razor clams and crab; the signature is risotto di gò, made with a delicate broth of small local fish.",
          note: 'Room should be left for the tiramisu.',
          links: [
            { label: 'Website', href: 'https://www.gattonero.com' },
            { label: 'Instagram', href: 'https://instagram.com/gattoneroburano' },
          ],
        },
        {
          name: 'Venissa',
          location: 'Fondamenta S. Caterina 3, Mazzorbo',
          description:
            'Reached by vaporetto to Mazzorbo, beside Burano, one of the few vineyards in the lagoon, where the Dorona di Venezia grape was revived; the estate has a Michelin-starred restaurant and a casual Osteria.',
          links: [
            { label: 'Website', href: 'https://www.venissa.it/en' },
            { label: 'Instagram', href: 'https://instagram.com/venissa_tenuta' },
          ],
        },
      ],
    },
    {
      heading: 'Coffee, Drinks and Sweets',
      venues: [
        {
          name: 'Caffè Florian',
          location: 'Piazza San Marco 57, Venice',
          description:
            "Italy's oldest operating coffee house, founded in 1720, with velvet, gilded mirrors and marble tables; the draw is espresso or a spritz in the setting.",
          links: [
            { label: 'Website', href: 'https://caffeflorian.com/en' },
            { label: 'Instagram', href: 'https://instagram.com/caffeflorian1720' },
          ],
        },
        {
          name: 'Gelateria Nico',
          location: 'Zattere 922, Venice',
          description: 'Gelateria dating from 1937, where gelato or a spritz can be enjoyed in the sun on the Zattere promenade.',
          links: [
            { label: 'Website', href: 'https://www.gelaterianico.com' },
            { label: 'Instagram', href: 'https://instagram.com/gelaterianico' },
          ],
        },
        {
          name: "Harry's Bar",
          location: 'Calle Vallaresso 1323, Venice',
          description:
            'Opened by Harry Cipriani in 1931 and visited by Hemingway, Katharine Hepburn and Peggy Guggenheim; the Bellini was invented here.',
          links: [{ label: 'Website', href: 'https://www.cipriani.com/harrys-bar' }],
        },
        {
          name: 'Tonolo',
          location: 'Calle S. Pantalon 3764, Dorsoduro, Venice',
          description: 'Historic pasticceria with cookies, pastries and mini cakes, convenient between museum visits.',
          note: 'Its frittelle at Carnevale are among the best.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/pasticceriatonolo_venezia' }],
        },
      ],
    },
  ],
}
