import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'italy-umbria',
  name: 'Umbria',
  tagline: 'Perugia, Todi and the road between the hill towns, with cellars and oil mills.',
  intro: [
    'A good visit is built around driving the hill towns — Montefalco, Spello, Trevi, Bevagna, Cannara, Orvieto and the Lake Trasimeno area — stopping for truffle-led meals, wineries and oil mills along the way, before settling into Todi and Perugia for a few days each.',
  ],
  sections: [
    {
      heading: 'Montefalco',
      venues: [
        {
          name: "L'Alchimista",
          location: 'Piazza del Comune 14, Montefalco',
          description:
            'Located on one of the prettiest piazzas in Umbria, with an excellent wine list; the truffle pasta is the dish to choose, and the made-to-order tiramisu should not be skipped.',
          links: [
            { label: 'Website', href: 'https://www.ristorantealchimista.it' },
            { label: 'Instagram', href: 'https://instagram.com/enotecalalchimista' },
          ],
        },
        {
          name: 'Il Coccorone',
          location: 'Via Tempestivi 11, Montefalco',
          description: 'The place for an Umbrian meat feast, where the wood grill smells wonderful in the cooler months; the Chianina steak is recommended, with truffles when in season.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/ristoranteilcoccorone' }],
        },
      ],
    },
    {
      heading: 'Spello, Trevi and Bevagna',
      venues: [
        {
          name: 'Antiche Sere',
          location: 'Piazza Garibaldi 11/12, Bevagna',
          description: 'Just inside the town gates, this restaurant describes its approach as honest, with ingredients taking priority; the daily menu may include truffle pasta or gnocchi with Sagrantino.',
          links: [{ label: 'Facebook', href: 'https://www.facebook.com/osteriaantichesere' }],
        },
        {
          name: 'La Cantina di Spello',
          location: 'Via Cavour 2, Spello',
          description: 'A rustic vaulted cellar with stone arches and fine ceramics; the menu includes truffle omelettes, rich pasta and slow-cooked wild boar.',
          links: [{ label: 'Website', href: 'https://www.lacantinadispello.com' }],
        },
        {
          name: 'La Cucina di San Pietro a Pettine',
          location: 'San Pietro a Pettine 10, Trevi',
          description: 'A historic estate with stone walls and countryside views, and a paradise for truffle lovers; truffle hunts are offered.',
          links: [
            { label: 'Website', href: 'https://www.tenutasanpietroapettine.it' },
            { label: 'Instagram', href: 'https://instagram.com/sanpietroapettine' },
          ],
        },
        {
          name: 'Il Pinturicchio',
          location: 'Largo Mazzini 8, Spello',
          description: 'A classic, family-run restaurant serving unfussy local food, including pappardelle with wild boar ragù and ravioli.',
          links: [{ label: 'Website', href: 'https://www.ristoranteilpinturicchio.it' }],
        },
      ],
    },
    {
      heading: 'Cannara',
      venues: [
        {
          name: 'Agriturismo Il Cerreto',
          location: 'Via San Nicola 9, Cannara',
          description:
            'A family farm-to-table restaurant just outside town, using its own produce, including the sweet onions of Cannara; the homemade pasta and the onion parmigiana are recommended.',
          links: [
            { label: 'Website', href: 'https://www.agricer.it' },
            { label: 'Instagram', href: 'https://instagram.com/agriturismoilcerreto' },
          ],
        },
      ],
    },
    {
      heading: 'Orvieto',
      venues: [
        {
          name: 'Trattoria del Moro Aronne',
          location: 'Via San Leonardo 7, Orvieto',
          description: "A cozy restaurant on a quiet side street near the Duomo with warm service; the lasagna shaped like a bird's nest and the wild boar are memorable.",
          links: [{ label: 'Website', href: 'https://www.trattoriadelmoro.info' }],
        },
        {
          name: 'Trattoria La Palomba',
          location: 'Via Cipriano Manente 16, Orvieto',
          description:
            "Traditional and generous with truffles, known for game, especially its signature wild dove; the pasta all'ascaro, thick umbricelli in a truffled sauce of egg yolk, pancetta and parmesan, should not be missed.",
          links: [{ label: 'Instagram', href: 'https://instagram.com/trattorialapalomba' }],
        },
      ],
    },
    {
      heading: 'Lake Trasimeno Area',
      venues: [
        {
          name: 'Evo Bistrot Centumbrie',
          location: 'Via Osteria San Martino 31C, Agello',
          description: 'A modern bistrot that uses produce from its own estate, including olive oil and freshly milled organic flour for its bread.',
          links: [
            { label: 'Website', href: 'https://www.centumbrie.com/it/ristorazione/evo-bistrot' },
            { label: 'Instagram', href: 'https://instagram.com/evo_bistrot' },
          ],
        },
        {
          name: "Faliero Torta d'la Maria",
          location: 'Via di Montebuono 2, Montebuono',
          description:
            'A lively, slightly chaotic roadside restaurant run by the third generation, with views over the lake, serving torta al testo sandwiches, grilled meat and fried food at great value.',
          note: 'Arriving early or off-peak is advised.',
          links: [{ label: 'Website', href: 'https://www.faliero.it' }],
        },
      ],
    },
    {
      heading: 'Hills and Spoleto',
      venues: [
        {
          name: 'Il Capanno',
          location: 'Località Torre Cola 6, Torrecola',
          description: 'Hidden in the hills and found mainly by word of mouth, with a quiet garden ideal for long lunches; the menu features wild game, mushrooms, truffles and local wine.',
          links: [{ label: 'Website', href: 'https://www.ilcapannoristorante.net' }],
        },
        {
          name: 'Osteria Al Palazzaccio da Piero',
          location: 'Loc. Palazzaccio 33, near Spoleto',
          description: 'Run by the same family since 1966 in an old farmhouse, with a large fireplace in winter and a flower garden in summer.',
          links: [
            { label: 'Website', href: 'https://www.alpalazzaccio.it' },
            { label: 'Instagram', href: 'https://instagram.com/alpalazzaccio' },
          ],
        },
      ],
    },
    {
      heading: 'Wineries and Olive Oil',
      venues: [
        {
          name: 'Cantina Antonelli',
          location: 'Località S. Marco 60, Montefalco',
          description:
            'Held by the Antonelli family since 1883 and organic since 2009, producing Sagrantino, Sangiovese and Grechetto; visitors can join truffle hunts, tastings, and even lunch or a cooking class.',
          note: 'Booking ahead is advised, and a full day is worthwhile.',
          links: [
            { label: 'Website', href: 'https://www.antonellisanmarco.it' },
            { label: 'Instagram', href: 'https://instagram.com/antonellisanmarco' },
          ],
        },
        {
          name: 'Frantoio Gaudenzi',
          location: 'Camporeale 6, Trevi',
          description: 'One of the finest Umbrian oil producers; guided tastings cover several oils and artisanal honey is also sold.',
          links: [
            { label: 'Website', href: 'https://www.frantoiogaudenzi.it/en' },
            { label: 'Instagram', href: 'https://instagram.com/frantoio_gaudenzi' },
          ],
        },
        {
          name: 'Madonna del Latte',
          location: 'Località Sugano 11, Orvieto',
          description: 'A small organic winery founded by two food and wine journalists, which also produces lovely olive oil; tastings are held outdoors among the vines in warm months.',
          note: 'Booking ahead is advised.',
          links: [
            { label: 'Website', href: 'https://madonnadellatte.it/index.php/en' },
            { label: 'Instagram', href: 'https://instagram.com/madonna_del_latte' },
          ],
        },
        {
          name: 'Montioni Frantoio e Cantina',
          location: 'Viale della Vittoria 34, Montefalco',
          description: 'Producing wine and olive oil since the 1970s, with the oil grown from a small mill; visits are structured but personal, with generous tastings and an optional lunch.',
          links: [
            { label: 'Website', href: 'https://www.gabrielemontioni.it' },
            { label: 'Instagram', href: 'https://instagram.com/montioni.top' },
          ],
        },
        {
          name: 'Paolo Bea',
          location: 'Vocabolo Cerrete 8, Montefalco',
          description: 'A historic estate producing bold, natural Sagrantino with minimal intervention.',
          note: 'Visits are by appointment only.',
          links: [{ label: 'Website', href: 'https://www.paolobea.com/eng/azienda.aspx' }],
        },
      ],
    },
    {
      heading: 'Where to Stay',
      venues: [
        {
          name: 'Reschio',
          location: 'Lisciano Niccone',
          description:
            'A world of its own in northern Umbria, built around a historic castle and restored farmhouses and shaped by the Bolza family, suiting either a busy stay or doing nothing at all.',
          links: [{ label: 'Website', href: 'https://www.reschio.com' }],
        },
        {
          name: 'Tenuta di Murlo',
          location: 'Perugia countryside',
          description: 'A fairytale setting of villas spread across forest, valleys and olive groves, offering privacy and stillness.',
          links: [
            { label: 'Website', href: 'https://www.murlo.com' },
            { label: 'Instagram', href: 'https://instagram.com/tenutadimurlo' },
          ],
        },
      ],
    },
    {
      heading: 'Todi: Accommodation',
      venues: [
        {
          name: 'Il Ghiottone Umbro',
          location: 'Fraz. San Giorgio 45, just outside Todi',
          description:
            'A stylish bed and breakfast in a restored mill, managed by Danish hosts Lisbeth and Thomas; meals are served to guests only, and the property is known for its breakfasts, cooking classes and food experiences.',
          links: [
            { label: 'Website', href: 'https://ilghiottoneumbro.com' },
            { label: 'Instagram', href: 'https://instagram.com/ilghiottoneumbro' },
          ],
        },
        {
          name: 'Hotel Fonte Cesia',
          location: 'Via Lorenzo Leoni 3, Todi',
          description: 'A family-run three-star hotel in the town centre, with certain rooms overlooking the countryside.',
          links: [
            { label: 'Website', href: 'https://www.fontecesia.it/en' },
            { label: 'Instagram', href: 'https://instagram.com/hotelfontecesia_todi' },
          ],
        },
      ],
    },
    {
      heading: 'Todi: Coffee and Gelato',
      venues: [
        {
          name: 'Bar Pianegiani',
          location: 'Corso Cavour 40, Todi',
          description: 'The essential stop for anyone with time for only one; gelato has been made here since the early 1800s, using ingredients such as Bronte pistachios and Avola almonds.',
          links: [{ label: 'Website', href: 'https://www.barpianegiani.it' }],
        },
        {
          name: 'Gran Caffè Todi',
          location: 'Piazza del Popolo 47, Todi',
          description: 'A café on the main square offering coffee with a front-row view of daily town life.',
          links: [],
        },
      ],
    },
    {
      heading: 'Todi: Wine Bars and Aperitivo',
      venues: [
        {
          name: 'Pane e Vino',
          location: 'Via Augusto Ciuffelli 33, Todi',
          description: 'An informal enoteca suited to a snack or a full meal, with a small seasonal menu and friendly service.',
          links: [
            { label: 'Facebook', href: 'https://www.facebook.com/people/Pane-e-vino-Todi/100063771632116' },
            { label: 'Instagram', href: 'https://instagram.com/paneevinotodi' },
          ],
        },
        {
          name: 'Vineria San Fortunato',
          location: 'Piazza Umberto I, 5, Todi',
          description: 'A very small enoteca at the foot of the steps of San Fortunato church, with local wine, cheese and cured meats, plus a few more substantial dishes and desserts.',
          links: [
            { label: 'Facebook', href: 'https://www.facebook.com/vineria.san.fortunato' },
            { label: 'Instagram', href: 'https://instagram.com/vineriasanfortunato' },
          ],
        },
      ],
    },
    {
      heading: 'Todi: Restaurants',
      venues: [
        {
          name: 'Jacopone',
          location: 'Piazza Jacopone 3, Todi',
          description: 'A traditional trattoria best known for its Pasticcio di Jacopone, a meat-filled pasta not encountered elsewhere.',
          links: [
            { label: 'Website', href: 'https://www.ristorantejacopone.it' },
            { label: 'Instagram', href: 'https://instagram.com/ristorante.jacopone' },
          ],
        },
        {
          name: 'Le Scalette',
          location: 'Via delle Scalette 1, Todi',
          description: 'Set on a quiet street with a panoramic terrace, liked locally for its pizza; the wider menu includes several gluten-free dishes.',
          links: [
            { label: 'Website', href: 'http://www.lescaletteristorante.com' },
            { label: 'Instagram', href: 'https://instagram.com/lescalettetodi' },
          ],
        },
        {
          name: 'Osteria Novecento',
          location: 'Strada Comunale del Poggio 20, Todi',
          description: 'A cozy restaurant 15 minutes from Todi, serving a slightly more modern interpretation of local cooking.',
          note: 'Reservations are advised.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/osterianovecentotodi' }],
        },
        {
          name: 'Ristorante La Mulinella',
          location: 'Località Pontenaia 29, Todi',
          description: 'Located just below Todi, serving Umbrian classics such as boar and rabbit stew, with notable house bread.',
          links: [{ label: 'Website', href: 'https://lamulinella.it' }],
        },
        {
          name: 'Ristorante Pizzeria Cavour',
          location: 'Corso Cavour 21, Todi',
          description: 'A central pizzeria serving thin, crisp pizzas, with a panoramic terrace in summer and a full menu alongside the pizza.',
          links: [
            { label: 'Website', href: 'https://www.ristorantecavourtodi.com' },
            { label: 'Instagram', href: 'https://instagram.com/cavourristorantepizzeria' },
          ],
        },
        {
          name: 'Ristorante Umbria',
          location: 'Via S. Bonaventura 13, Todi',
          description:
            'One of the oldest restaurants in Todi and still among the best; a terrace with valley views is used in summer, winter brings a fireplace, and specialties include farro soup and rich meat dishes.',
          links: [{ label: 'Website', href: 'https://www.ristoranteumbria.it/en' }],
        },
        {
          name: 'Trattoria Cibocchi',
          location: 'Località Pontemartino 67, Todi',
          description: 'A roadside trattoria that is easy to overlook, long established among local diners; the truffle pasta and the rabbit are the dishes most often ordered.',
          links: [{ label: 'Website', href: 'https://www.trattoriacibocchi.it' }],
        },
        {
          name: 'Trattoria Da Piero e Silvana',
          location: 'Via Matteotti 91, Todi',
          description: 'A homely, family-run trattoria with outdoor seating facing an ancient arch that frames the valley.',
          links: [{ label: 'Facebook', href: 'https://www.facebook.com/TrattoriaDaPieroESilvana' }],
        },
      ],
    },
    {
      heading: 'Todi: Food Shops',
      venues: [
        {
          name: 'Frantoio La Casella',
          location: 'Piazza del Popolo 8, Todi',
          description: 'An olive oil producer with an excellent reputation, also selling a selection of other local products.',
          links: [{ label: 'Website', href: 'https://www.frantoiolacasella.it' }],
        },
        {
          name: 'Giovenali',
          location: 'Corso Cavour, Todi',
          description: 'A well-stocked shop for Umbrian specialties, including truffles, with easy gifts to carry home.',
          links: [],
        },
        {
          name: 'Principi Floro',
          location: 'Piazza del Popolo 1/2, Todi',
          description: 'One of the oldest specialty shops in Todi, which sold balsamic vinegar well before it became widely known.',
          links: [],
        },
      ],
    },
    {
      heading: 'Perugia: Local Recommendations',
      venues: [
        {
          name: 'Civico 25',
          location: 'Via della Viola 25, Perugia',
          description: 'A cozy wine bar popular with locals, suitable for a full meal or simply a glass and a few nibbles.',
          links: [
            { label: 'Website', href: 'https://civico25.com' },
            { label: 'Instagram', href: 'https://instagram.com/civico25' },
          ],
        },
        {
          name: 'Osteria A Priori',
          location: 'Via dei Priori 39, Perugia',
          description:
            'The restaurant most residents name first when asked, following Slow Food principles with local seasonal ingredients, with a small shop below selling local legumes and wines.',
          links: [
            { label: 'Website', href: 'https://osteriaapriori.it' },
            { label: 'Instagram', href: 'https://instagram.com/osteriaaprioriperugia' },
          ],
        },
      ],
    },
    {
      heading: 'Perugia: Hearty Umbrian Cooking',
      venues: [
        {
          name: 'Al Mangiar Bene',
          location: 'Via della Luna 21, Perugia',
          description: 'Reached through a small alley, with a wood oven for bread and pizza; good dishes include the tagliata and scamorza melted in a terracotta pot, topped with truffles.',
          links: [
            { label: 'Website', href: 'https://almangiarbene.it' },
            { label: 'Instagram', href: 'https://instagram.com/al_mangiar_bene' },
          ],
        },
        {
          name: 'Ristorante Da Cesarino',
          location: 'Piazza IV Novembre 4, Perugia',
          description: 'One of the oldest restaurants in the city, facing the Duomo and its fountain; the crostini and the stracchino-stuffed gnocchi in pesto were excellent.',
          links: [
            { label: 'Facebook', href: 'https://www.facebook.com/p/Ristorante-Da-Cesarino-1936-61555978453860' },
            { label: 'Instagram', href: 'https://instagram.com/dacesarino1936' },
          ],
        },
        {
          name: 'Ristorante Il Cantinone',
          location: 'Via Ritorta 6, Perugia',
          description: 'Just off the main square, with a terrace facing an attractive archway; the Umbrian pesto, made with thyme, marjoram, savory and walnuts, is worth ordering.',
          links: [
            { label: 'Website', href: 'https://www.ristoranteilcantinoneperugia.com' },
            { label: 'Instagram', href: 'https://instagram.com/ilcantinoneperugia' },
          ],
        },
        {
          name: 'Ristorante Il Giurista',
          location: 'Via Bartolo 30, Perugia',
          description: 'Located steps from the Duomo beneath vaulted brick ceilings; the menu includes umbrichelli with wild boar ragù, chickpea soup, beef braised in Sagrantino and an entire section devoted to truffles.',
          links: [{ label: 'Website', href: 'https://www.ristoranteilgiurista.it' }],
        },
        {
          name: 'Ristorante La Taverna',
          location: 'Via delle Streghe 8, Perugia',
          description: 'A rustic restaurant serving torta di testo flatbreads, local prosciutto, lentil soup and homemade pasta, with a warm atmosphere and generous portions.',
          links: [{ label: 'Website', href: 'https://www.ristorantelataverna.com' }],
        },
      ],
    },
    {
      heading: 'Perugia: A Quick Bite',
      venues: [
        {
          name: 'Antica Porchetteria Granieri 1916',
          location: 'Piazza Matteotti, Perugia',
          description: 'Four generations of the family have raised pigs and made porchetta; a large roll filled with it is sold from their kiosk.',
          links: [
            { label: 'Website', href: 'https://anticaporchetteriagranieri.it' },
            { label: 'Instagram', href: 'https://instagram.com/anticaporchetteriagranieri1916' },
          ],
        },
      ],
    },
    {
      heading: 'Perugia: Chocolate and Pastries',
      venues: [
        {
          name: 'Antica Latteria',
          location: 'Via Baglioni 5, Perugia',
          description: 'A pastry shop dating from 1925 and a top choice for maritozzi, soft buns filled with whipped cream, surrounded by colourful majolica tiles.',
          links: [
            { label: 'Facebook', href: 'https://www.facebook.com/anticalatteriadiperugia' },
            { label: 'Instagram', href: 'https://instagram.com/anticalatteriaperugia' },
          ],
        },
        {
          name: 'Augusta Perusia',
          location: 'Via Pinturicchio 2, Perugia',
          description:
            'Artisan chocolates, truffles and bars, with seating limited but worth finding for the thick hot chocolate; a boutique operates on Corso Vannucci, and a large café outside the city allows visitors to watch chocolate being made.',
          links: [
            { label: 'Website', href: 'https://www.cioccolatoaugustaperusia.it' },
            { label: 'Instagram', href: 'https://instagram.com/cioccolatoaugustaperusia' },
          ],
        },
        {
          name: 'Sandri dal 1880',
          location: 'Corso Vannucci 32, Perugia',
          description: 'Frescoed ceilings, carved wood counters and chandeliers set the scene; the shop is known for snake-shaped almond cookies and its own version of baci.',
          links: [
            { label: 'Website', href: 'https://sandridal1860.it' },
            { label: 'Instagram', href: 'https://instagram.com/sandri1880perugia' },
          ],
        },
      ],
    },
  ],
}
