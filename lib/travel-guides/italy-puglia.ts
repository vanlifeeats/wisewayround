import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'italy-puglia',
  name: 'Puglia',
  heroImage: 'https://images.unsplash.com/photo-1583395838204-5edc945b2194?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTA5MjUyfDB8MXxzZWFyY2h8MXx8UHVnbGlhJTIwSXRhbHklMjB0cmF2ZWx8ZW58MHwwfHx8MTc5MjU5NzYyMnww&ixlib=rb-4.1.0&q=80&w=1080',
  heroImageAlt: 'The whitewashed streets of Puglia, southern Italy',
  heroImageCredit: { name: 'Mattia Bericchia', profileUrl: 'https://unsplash.com/@mattiabericchia?utm_source=wisewayround&utm_medium=referral' },
  tagline: 'Bari, the Itria Valley and Salento, from street snacks to seaside dining.',
  intro: [
    'A good visit moves through three distinct areas — Salento in the far south, central Puglia around the Itria Valley and Bari itself — each with its own pace, from leisurely coastal lunches to a weekend of street food and quick restaurant stops in the city.',
  ],
  sections: [
    {
      heading: 'Salento: Lecce',
      venues: [
        {
          name: 'Caffè Alvino',
          location: 'Piazza Sant\u2019Oronzo 30, Lecce',
          description:
            "A classic meeting point on the main square, good for sampling Lecce's signature snacks: the rustico leccese, a pastry of tomato and béchamel, custard-filled pasticciotti, and caffè leccese, an iced espresso with almond syrup.",
          links: [
            { label: 'Website', href: 'https://catamo.shop/caffe-alvino' },
            { label: 'Instagram', href: 'https://instagram.com/alvino.catamo' },
          ],
        },
        {
          name: 'Le Zie Trattoria Casereccia',
          location: 'Via Costadura 19, Lecce',
          description:
            "Dining here resembles eating at someone's home: visitors ring the bell and are seated, often with a view of the kitchen, serving old farmhouse fare such as fave e cicorie and pezzetti di cavaddhru, a horse meat stew.",
          links: [{ label: 'Website', href: 'http://www.trattorialezie.axeleroweb.it' }],
        },
        {
          name: 'Osteria da Angiulino',
          location: 'Via Principi di Savoia 24, Lecce',
          description:
            'A rustic restaurant from the 1970s in a former wine shop, busy most evenings, with quick service and large portions; the eggplant Parmigiana is excellent, and room should be kept for toasted figs stuffed with almonds.',
          links: [{ label: 'Website', href: 'https://semplice.menu/menu/osteria-angiulino' }],
        },
      ],
    },
    {
      heading: 'Salento: On the Coast',
      venues: [
        {
          name: 'Ristorante La Vinaigrette',
          location: 'Riviera Armando Diaz 75, Gallipoli',
          description:
            'Directly above the Ionian Sea, lovely at lunch or sunset, with a kitchen serving fresh seafood with a modern touch, including red prawn carpaccio, and a beautiful terrace.',
          links: [
            { label: 'Website', href: 'https://lavinaigrette.it' },
            { label: 'Instagram', href: 'https://instagram.com/lavinaigrettegallipoli' },
          ],
        },
        {
          name: 'Taverna del Porto',
          location: 'Lungomare Cristoforo Colombo 121, Tricase Porto',
          description: "Located on the small harbour, so the waves are audible; the menu follows the day's catch, and the fried fish and spaghetti con le cicale stand out.",
          links: [
            { label: 'Website', href: 'https://www.tavernadelporto.com' },
            { label: 'Instagram', href: 'https://instagram.com/tavernadelportotricase' },
          ],
        },
        {
          name: 'Trattoria La Puritate',
          location: "Via Sant'Elia 18, Gallipoli",
          description: 'Set on the sea walls with water views, this is a safe choice; raw shellfish, seafood pasta and local fish are all excellent in a relaxed atmosphere.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/lapuritategallipoli' }],
        },
      ],
    },
    {
      heading: 'Salento: Towns and Countryside',
      venues: [
        {
          name: 'Antica Trattoria Salandra',
          location: 'Via G. B. de Michele 4, Nardò',
          description:
            'A hidden gem in a small alley behind the main square, with comforting food — ciceri e tria, maritati with fresh tomato and fine meatballs — at honest prices.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/anticatrattoriasalandra' }],
        },
        {
          name: 'Le Stanzie',
          location: 'SP362 Km 32.900, Supersano',
          description:
            'A historic masseria among olive groves, with stone rooms and fireplaces; a fixed menu begins with endless antipasti, followed by homemade pasta, meat and desserts, much of it from the estate.',
          note: 'Booking well in advance is essential.',
          links: [
            { label: 'Website', href: 'https://www.lestanzie.com' },
            { label: 'Instagram', href: 'https://instagram.com/masserialestanzie' },
          ],
        },
        {
          name: 'Osteria del Tempo Perso',
          location: 'Via Tanzarella Vitale 47, Ostuni',
          description: 'The top recommendation in Ostuni, where diners eat in old stone caves with food served on local ceramics, in a town that has become quite touristy.',
          links: [
            { label: 'Website', href: 'https://www.osteriadeltempoperso.com' },
            { label: 'Instagram', href: 'https://instagram.com/osteriadeltempopersostuni' },
          ],
        },
        {
          name: 'Piccola Osteria',
          location: 'Via Cola di Rienzo 22, Campi Salentina',
          description:
            'Small and understated; chef Paolo Metrangolo prepares lighter, more modern Salento cooking with attention to seasonal ingredients, and the tasting menu is the recommended choice.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/paolo_metrangolo' }],
        },
        {
          name: 'Trattoria Iolanda',
          location: 'Via Montanara 2, Lucugnano',
          description:
            "The experience resembles a grandmother's kitchen; open since 1970 and still run by the family of Mrs Iolanda, it makes fresh pasta by hand every day. Tables are set in the alley in good weather.",
          links: [
            { label: 'Website', href: 'https://www.trattoriaiolanda.com' },
            { label: 'Instagram', href: 'https://instagram.com/trattoriaiolanda' },
          ],
        },
        {
          name: 'Trattoria La Luna nel Pozzo',
          location: 'Via L. da Vinci 4, Grottaglie',
          description:
            'A tiny osteria run by Maria Carmela and Manolo, well placed for a meal after shopping for ceramics; the tagliolini with lemon and red prawn should not be missed.',
          links: [
            { label: 'Facebook', href: 'https://www.facebook.com/lalunanelpozzotrattoria' },
            { label: 'Instagram', href: 'https://instagram.com/lalunanelpozzogrottaglie' },
          ],
        },
      ],
    },
    {
      heading: 'Central Puglia: Ruvo di Puglia and Castellana Grotte',
      venues: [
        {
          name: 'Cucina Villana',
          location: 'SP 86 Ruvo-Bisceglie, Ruvo di Puglia',
          description:
            'Brothers Francesco and Vincenzo built this restaurant around foraged herbs, seasonal vegetables and the small producers of the Murgia; roasted artichokes and fusilloni with wild herbs are recommended.',
          links: [
            { label: 'Website', href: 'https://www.villafenicia.com/cucina-villana.html' },
            { label: 'Instagram', href: 'https://instagram.com/cucinavillana_' },
          ],
        },
        {
          name: 'Osteria del Caroseno',
          location: 'Via Santomagno 18, Castellana Grotte',
          description:
            'The leading choice in the area: family-run, traditional with a creative touch, seasonal and relaxed, with a small B&B upstairs for lingering over dinner.',
          links: [
            { label: 'Website', href: 'https://www.ilcaroseno.com/it' },
            { label: 'Instagram', href: 'https://instagram.com/osteriacaroseno' },
          ],
        },
        {
          name: 'Pinto Carlo',
          location: 'Via Mater Domini 51, Castellana Grotte',
          description: 'A classic butcher-shop restaurant where diners choose their meat at the counter and then take a seat.',
          links: [],
        },
      ],
    },
    {
      heading: 'Central Puglia: Polignano a Mare, Monopoli and Savelletri',
      venues: [
        {
          name: 'La Locanda di Felisiano',
          location: 'SP 163, Contrada Losciale 111, Monopoli',
          description: 'Guests can swim first and then lunch among ancient olive trees, away from the crowds, with rustic food cooked to order.',
          links: [{ label: 'Facebook', href: 'https://www.facebook.com/lalocandadifelisiano' }],
        },
        {
          name: 'My Wine - Il Piacere del Palato',
          location: 'Via Cavaliere 9, Monopoli',
          description: 'So small that dining here feels like eating at home, with owner Gianni attending every table; simple Pugliese flavours with a refined touch and a curated wine list.',
          links: [
            { label: 'Website', href: 'https://www.mywineitaly.it' },
            { label: 'Instagram', href: 'https://instagram.com/my_wine_monopoli' },
          ],
        },
        {
          name: "L'Osteria di Chichibio",
          location: 'Largo Gelso 6, Polignano a Mare',
          description: 'A more refined seafood restaurant using wild-caught fish, polished without being stiff; notable dishes include gamberoni rossi and fusilloni with oven-roasted tomato.',
          links: [
            { label: 'Website', href: 'https://www.osteriadichichibio.it' },
            { label: 'Instagram', href: 'https://instagram.com/osteriadichichibio' },
          ],
        },
        {
          name: 'Il Principe del Mare',
          location: 'SP90, 25, Savelletri',
          description: 'Relaxed yet polished, with white tablecloths and quick, friendly service beside the sea; crudi and fritti to share are the recommended orders.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/il_principe_del_mare_' }],
        },
        {
          name: 'Da Tuccino',
          location: 'Contrada Santa Caterina 69/f, Polignano a Mare',
          description: 'Opened in 1968 as a seaside shack, it remains a dependable seafood classic in a heavily touristed town, with grilled fish and seafood pasta.',
          links: [
            { label: 'Website', href: 'https://www.tuccino.it' },
            { label: 'Instagram', href: 'https://instagram.com/ristorantedatuccino' },
          ],
        },
      ],
    },
    {
      heading: 'Central Puglia: Inland Towns',
      venues: [
        {
          name: 'Cibus',
          location: 'Via Chianche di Scarano 7, Ceglie Messapica',
          description:
            'Long considered one of the best restaurants in Puglia, occupying a 15th-century convent with vaulted stone rooms, serving house-cured meats and cheeses and old farmers\u2019 recipes.',
          links: [
            { label: 'Website', href: 'https://ristorantecibus.it' },
            { label: 'Instagram', href: 'https://instagram.com/cibus_restaurant' },
          ],
        },
        {
          name: 'Osteria da Giuseppe',
          location: 'Via Malta 12, Ceglie Messapica',
          description: 'Giuseppe runs this cozy osteria in a quiet alley; the menu changes daily, typically a couple of pastas and a couple of meat dishes, with mixed starters the dish to order.',
          links: [{ label: 'Website', href: 'https://www.osteriadagiuseppe.it' }],
        },
        {
          name: 'Pizzeria Casa Pinto',
          location: 'Via Aprile 23, Locorotondo',
          description: 'Wood-fired pizza in the heart of Locorotondo, a welcome change after several days of seafood.',
          links: [
            { label: 'Facebook', href: 'https://www.facebook.com/pizzeriacasapinto' },
            { label: 'Instagram', href: 'https://instagram.com/pizzeriacasapinto' },
          ],
        },
        {
          name: 'Ristorante Garibaldi',
          location: 'Piazza Plebiscito 13, Martina Franca',
          description: 'A small bistrot on the main square facing the Duomo, serving seasonal Pugliese dishes amid Baroque streets.',
          links: [
            { label: 'Facebook', href: 'https://www.facebook.com/garibaldibistrot' },
            { label: 'Instagram', href: 'https://instagram.com/garibaldibistrot' },
          ],
        },
        {
          name: 'Trattoria Bère Vecchie',
          location: 'Via Regina Elena 8, Cisternino',
          description: 'Cisternino has more butchers than any nearby town, and many have become restaurants; diners select cuts at the counter and should try the bombette.',
          links: [
            { label: 'Facebook', href: 'https://www.facebook.com/trattoriaberevecchie' },
            { label: 'Instagram', href: 'https://instagram.com/trattoriaberevecchie' },
          ],
        },
        {
          name: 'Trattoria delle Ruote',
          location: 'Strada Monticello 1, Martina Franca',
          description: "A small restaurant above the Itria Valley, now run by the third generation; the menu has changed little since the grandfather opened it.",
          links: [],
        },
        {
          name: 'Trattoria Terra Madre',
          location: 'Piazza Sacramento 17, Alberobello',
          description: 'A rare good find in a very touristy town, set in a cluster of trulli overlooking the vegetable garden, with seasonal vegetables and fine antipasti.',
          links: [{ label: 'Website', href: 'https://www.trattoriaterramadre.it' }],
        },
      ],
    },
    {
      heading: 'Central Puglia: Sandwiches and Takeaway',
      venues: [
        {
          name: "Panificio L'Assunta",
          location: "Contrada Sant'Antonio D'Ascula 169, Monopoli",
          description: 'A convenient stop on the way to the beach; customers take a number and choose from a large display of pasta, seafood, vegetables and meat, to eat in or take away.',
          links: [
            { label: 'Website', href: 'https://www.panificiolassunta.com' },
            { label: 'Instagram', href: 'https://instagram.com/panificiolassunta' },
          ],
        },
        {
          name: "Il Panino di Marino - Na Dogghia D'Aneme",
          location: 'Via Cavour 86, Noci',
          description: 'Visitors come for the sandwiches and for Marino, who makes ordering enjoyable and explains the breads, flours and combinations.',
          note: 'Patience is needed, and is rewarded.',
          links: [
            { label: 'Facebook', href: 'https://www.facebook.com/paninodimarino' },
            { label: 'Instagram', href: 'https://instagram.com/ilpaninodimarino' },
          ],
        },
      ],
    },
    {
      heading: 'Bari: Street Snacks First',
      venues: [
        {
          name: 'Antica Gelateria Gentile',
          location: 'Piazza Federico II di Svevia 33, Bari',
          description:
            'Regarded as the best gelato in Bari, open since 1880 and run by five generations of the Gentile family, making gelato and pastries in the middle of town.',
          links: [{ label: 'Website', href: 'https://www.gelateriagentile.com' }],
        },
        {
          name: 'El Focacciaro',
          location: 'Via Salvatore Cognetti 43, Bari',
          description:
            'Two specialties define this stop: focaccia barese and fried panzerotti, the classic with tomato and mozzarella and the version with cime di rapa both recommended.',
          note: 'It becomes crowded, but customers take a number and the queue moves quickly.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/panificioelfocacciaro' }],
        },
        {
          name: 'Le Sgagliozze di Donna Carmela',
          location: 'Largo Albicocca, Bari Vecchia',
          description:
            'Carmela and her family fry squares of polenta, known as sgagliozze, throughout the day, sold in a paper cone and eaten hot, crisp outside and soft within.',
          links: [{ label: 'Facebook', href: 'https://www.facebook.com/100090149737108' }],
        },
      ],
    },
    {
      heading: 'Bari: Restaurants',
      venues: [
        {
          name: 'Ai 2 Ghiottoni',
          location: 'Via Nicolò Putignani 11, Bari',
          description: "One of the best-loved restaurants in Bari; worthwhile for a special evening or a short stay, with excellent seafood and outstanding orecchiette con le cime di rapa.",
          links: [
            { label: 'Website', href: 'https://ai2ghiottoni.it' },
            { label: 'Instagram', href: 'https://instagram.com/ai2ghiottoni' },
          ],
        },
        {
          name: 'PerBacco',
          location: 'Via Francesco Saverio Abbrescia 99, Bari',
          description: 'Located just off the Lungomare, celebrating the cooking of Puglia with fresh seafood, local produce and a good wine list.',
          links: [
            { label: 'Instagram', href: 'https://instagram.com/ristorante_perbacco_bari' },
            { label: 'Facebook', href: 'https://www.facebook.com/100054587404073' },
          ],
        },
        {
          name: 'Al Pescatore',
          location: 'Piazza Federico II di Svevia 6/8, Bari',
          description: 'The standard choice for seafood, where diners order a mixed selection of starters, including crudi such as mussels, squid, oysters and sea urchin.',
          links: [
            { label: 'Website', href: 'https://www.alpescatorebari.com' },
            { label: 'Instagram', href: 'https://instagram.com/alpescatore_ristorante' },
          ],
        },
        {
          name: 'Al Sorso Preferito',
          location: 'Via Vito Nicola De Nicolò 40, Bari',
          description:
            'A traditional restaurant that has changed very little, credited with inventing spaghetti all\u2019assassina; the mixed starters, which appear to go on indefinitely, are the dish to order.',
          links: [
            { label: 'Website', href: 'https://www.alsorsopreferito.it' },
            { label: 'Instagram', href: 'https://instagram.com/al_sorso_preferito_' },
          ],
        },
        {
          name: "Urban L'Assassineria Urbana",
          location: 'Via Domenico Nicolai 10, Bari',
          description: "A restaurant devoted to spaghetti all'assassina, the spicy Bari pasta, served classically with tomato and chili as well as newer versions with burrata or cime di rapa.",
          links: [
            { label: 'Website', href: 'https://www.urban.bio' },
            { label: 'Instagram', href: 'https://instagram.com/urban.assassineriaurbana' },
          ],
        },
      ],
    },
    {
      heading: 'Bari: Bars and Drinks',
      venues: [
        {
          name: 'Ciclatera Sotto il Mare',
          location: 'Viale Venezia 16, Bari',
          description: 'Set on the old city wall with a view of the harbour, this bar is at its best around sunset, with good spritzes and generous snacks.',
          links: [
            { label: 'Facebook', href: 'https://www.facebook.com/ciclaterasottoilmare' },
            { label: 'Instagram', href: 'https://instagram.com/ciclatera_sotto_il_mare' },
          ],
        },
        {
          name: 'El Chiringuito',
          location: 'Molo S. Nicola, Bari',
          description: 'A spot favoured by residents: a cold Peroni and focaccia by the water in the old port.',
          links: [{ label: 'Website', href: 'https://elchiringuito.shop' }],
        },
        {
          name: 'Mostofiore Bar à Vin',
          location: 'Via Roberto da Bari 128, Bari',
          description: 'A small, lively wine bar with an extensive list of natural wines from small producers; small plates or a tagliere are the usual orders.',
          links: [
            { label: 'Website', href: 'https://www.mostofiore.net' },
            { label: 'Instagram', href: 'https://instagram.com/mostofiorevineria' },
          ],
        },
      ],
    },
    {
      heading: 'More Addresses: Restaurants and Trattorie',
      venues: [
        {
          name: "L'Antica Locanda",
          location: 'Noci',
          description: 'Seasonal restaurant in Noci led by chef Pasquale Fatalino.',
          links: [{ label: 'Website', href: 'http://www.pasqualefatalino.it/antica-locanda/' }],
        },
        {
          name: "L'Aratro",
          location: 'Via Monte S.Michele 25, Alberobello',
          description: "Restaurant in Alberobello that avoids the town's tourist-menu pattern.",
          links: [{ label: 'Website', href: 'https://www.ristorantearatro.it/' }],
        },
        {
          name: 'Di Cosimo',
          location: 'Bari',
          description: 'Bari institution for pizza and panzerotti.',
          links: [{ label: 'Website', href: 'http://www.dicosimo.it/' }],
        },
        {
          name: 'Farmacia dei Sani',
          location: 'Ruffano',
          description: 'Inventive restaurant in the interior of Salento, built on regional ingredients.',
          links: [{ label: 'Website', href: 'https://www.farmaciadeisani.eu/' }],
        },
        {
          name: 'Le Macàre',
          location: 'Lecce',
          description: 'Trattoria serving land and sea dishes of Salento.',
          links: [{ label: 'Website', href: 'https://www.lemacare.it/' }],
        },
        {
          name: 'Lido Bianco',
          location: 'Monopoli',
          description: 'Restaurant above a cove in Monopoli, with a seafood menu.',
          links: [{ label: 'Website', href: 'https://www.ristorantelidobianco.com/' }],
        },
        {
          name: "L'Orecchietta",
          location: 'Guagnano',
          description: 'Fresh pasta shop and trattoria in Guagnano, selling pasta to take away or eat on site.',
          links: [{ label: 'Website', href: 'https://www.lorecchietta.com/' }],
        },
        {
          name: 'La Rotonda',
          location: 'Viale Virgilio 1, Monopoli',
          description: 'Seaside restaurant south of Monopoli serving raw shellfish, sea urchin in season, and fried seafood.',
          links: [{ label: 'Website', href: 'https://la-rotonda.it/' }],
        },
        {
          name: 'La Succursale',
          location: 'Viale degli Studenti 15, Lecce',
          description: "Pizzeria near Lecce's university serving thick-crust pizza, craft beer and vegetable dishes.",
          links: [{ label: 'Website', href: 'https://lasuccursale.it/' }],
        },
      ],
    },
    {
      heading: 'More Addresses: Coffee, Pastry and Gelato',
      venues: [
        {
          name: 'Caffè Parisi',
          location: 'Piazza Salandra 38, Nardò',
          description: "Traditional café on Nardò's main square, with an aperitivo buffet.",
          links: [{ label: 'Website', href: 'https://www.caffeparisinardo.it/' }],
        },
        {
          name: 'Pasticceria Natale',
          location: 'Lecce',
          description: "Pastry shop and gelateria near Piazza Sant'Oronzo in Lecce.",
          links: [{ label: 'Website', href: 'https://natalepasticceria.it/' }],
        },
        {
          name: 'Super Mago del Gelo',
          location: 'Piazza Garibaldi 22, Lecce',
          description: 'Gelateria in Lecce known for granita and its eccentric interior.',
          links: [{ label: 'Website', href: 'https://www.ilsupermagodelgelo.it/' }],
        },
      ],
    },
    {
      heading: 'More Addresses: Wine, Beer and Cocktails',
      venues: [
        {
          name: 'Quanto Basta',
          location: 'Lecce',
          description: 'Award-winning cocktail bar in central Lecce.',
          links: [{ label: 'Website', href: 'https://www.quantobastalecce.com/home-quantobasta/' }],
        },
      ],
    },
    {
      heading: 'Matera (Basilicata)',
      venues: [
        {
          name: 'Il Forno di Gennaro',
          location: 'Matera',
          description: 'Bakery producing Matera bread and other baked goods.',
          links: [{ label: 'Website', href: 'https://www.ilfornodigennaro.com/' }],
        },
        {
          name: 'Stano',
          location: 'Via Santa Cesarea 67/69, Matera',
          description: 'Restaurant serving Lucanian cooking in Matera.',
          links: [{ label: 'Website', href: 'https://www.stanoristorazione.it/' }],
        },
      ],
    },
  ],
}
