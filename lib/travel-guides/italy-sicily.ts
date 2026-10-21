import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'italy-sicily',
  name: 'Sicily',
  tagline: 'Palermo, Ortigia and the south-east, with sweets, street food and island stays.',
  intro: [
    "A good visit splits time between Ortigia's dinner-and-drinks scene, Palermo's street food and pastry traditions, and a wider loop through the south-east and the islands for places to stay.",
  ],
  sections: [
    {
      heading: 'Ortigia: Dinner',
      venues: [
        {
          name: "L'Ancora",
          location: 'Via Guglielmo Perno 7, Ortigia',
          description: 'An old-fashioned seafood restaurant loved by locals, known for classic busiate with shrimp and pistachio, with a pleasant terrace.',
          links: [
            { label: 'Website', href: 'https://ristoranteancora.com' },
            { label: 'Instagram', href: 'https://instagram.com/ancorasiracusa' },
          ],
        },
        {
          name: 'Apollonion Osteria da Carlo',
          location: 'Via Carmelo Campisi 18, Ortigia',
          description:
            'A leading fish restaurant; locals set the menu aside and simply ask for antipasti — raw and cooked seafood and piles of toasted, seasoned bread. The mussels steamed with almonds are excellent.',
          links: [{ label: 'Facebook', href: 'https://www.facebook.com/osteriapollonion' }],
        },
        {
          name: 'Chiodo',
          location: 'Via Roma 15, Ortigia',
          description: 'A casual courtyard showroom-cucina with a small area selling clothing and accessories by local artisans and vintage furniture, with creative pastas and large salads.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/chiodo_showroomconcucina' }],
        },
        {
          name: 'Davè',
          location: 'Via della Giudecca 75, Ortigia',
          description: 'A little more elegant without being fancy, with excellent traditional Sicilian food and a lovely patio on a small piazza.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/daveortigia' }],
        },
        {
          name: 'Macallè',
          location: 'Via dei Santi Coronati 42, Ortigia',
          description: 'Among the most sophisticated, offering modern twists on traditional dishes; chef-owner Maurizio guides diners to the day\u2019s specials.',
          links: [
            { label: 'Website', href: 'https://www.ristorantemacalle.com' },
            { label: 'Instagram', href: 'https://instagram.com/macalleortigia' },
          ],
        },
        {
          name: 'Piano B',
          location: 'Via Cairoli 18, Ortigia',
          description: 'Considered one of the best pizzerias in Siracusa and in Italy, using long-rising dough and excellent toppings.',
          links: [
            { label: 'Website', href: 'https://www.pianobsiracusa.com' },
            { label: 'Instagram', href: 'https://instagram.com/piano__b_friedrichschmuck' },
          ],
        },
        {
          name: 'Ristorante Gutkowskino',
          location: 'Lungomare di Levante Elio Vittorini 10, Ortigia',
          description: 'A modern bistrot in a much-loved hotel, with a short, market-driven weekly menu that is mostly vegetarian with many vegan options; a roof terrace serves drinks and dinner.',
          links: [
            { label: 'Website', href: 'https://guthotel.it/en/gutkowskino-eng' },
            { label: 'Instagram', href: 'https://instagram.com/gutkowskino_' },
          ],
        },
        {
          name: 'Trattoria La Foglia',
          location: 'Via Capodieci 29, Ortigia',
          description:
            "The most eccentric place on the island, resembling an eccentric aunt's attic with mismatched furniture, doilies and antique dolls; recommended are lemon-ricotta pasta, pasta alla Norma and the signature mussels cooked in lemon leaves.",
          links: [
            { label: 'Website', href: 'https://lafoglia.it/' },
            { label: 'Instagram', href: 'https://instagram.com/lafoglia84_ortigia' },
          ],
        },
      ],
    },
    {
      heading: 'Ortigia: Quick Bites',
      venues: [
        {
          name: 'Antica Giudecca',
          location: 'Via della Giudecca 26, Ortigia',
          description: "Ortigia's fast food, and the best arancini in town; no atmosphere to speak of, just a few tables, beer and an arancino.",
          links: [
            { label: 'Instagram', href: 'https://instagram.com/antica_giudecca' },
            { label: 'Facebook', href: 'https://www.facebook.com/anticagiudecca26' },
          ],
        },
        {
          name: 'Caseificio Bordieri',
          location: 'Via De Benedictis 6, Ortigia',
          description: "Home to some of Sicily's most famous panini, built on homemade cheese, with the filling left to the staff.",
          note: 'Hours: Monday to Saturday, 7am to 4pm. Very crowded.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/caseificioborderiofficial' }],
        },
        {
          name: 'Fratelli Burgio',
          location: 'Piazza Cesare Battisti 4, Ortigia',
          description: 'It began as a shop and grew into a sit-down venue known for platters of nibbles and salads, making an excellent light lunch.',
          note: 'It closes at 3pm.',
          links: [
            { label: 'Website', href: 'https://fratelliburgio.com' },
            { label: 'Instagram', href: 'https://instagram.com/lasalumeriafratelliburgio' },
          ],
        },
      ],
    },
    {
      heading: 'Ortigia: Sweets and Granita',
      venues: [
        {
          name: "CCA' e DDA Graniteria",
          location: 'Via Dione 24, Ortigia',
          description: 'A tiny bar with outdoor seating and granita flavours that change daily.',
          links: [
            { label: 'Website', href: 'https://www.ccaedda.it/' },
            { label: 'Facebook', href: 'https://www.facebook.com/CAAeDDA' },
          ],
        },
        {
          name: 'Pasticceria Artale',
          location: 'Via Saverio Landolina 32, Ortigia',
          description: 'One of the oldest pastry shops, with cannoli, cassata, frutta martorana, candied fruit and the best granita in town.',
          links: [
            { label: 'Website', href: 'https://www.pasticceriaartale.it' },
            { label: 'Instagram', href: 'https://instagram.com/pasticceriaartale' },
          ],
        },
      ],
    },
    {
      heading: 'Ortigia: Drinks',
      venues: [
        {
          name: 'Caffè Minerva',
          location: 'Via Roma 58, Ortigia',
          description: 'Beside the Duomo, with a lovely outdoor view and a cozy interior for cold days, good for a Spritz or a Negroni.',
          links: [],
        },
        {
          name: 'Cortile Verga',
          location: 'Via della Maestranza 33, Ortigia',
          description: 'One of the most romantic spots in Ortigia, set in the courtyard of a crumbling baroque palazzo, serving well-made cocktails, wine and nibbles.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/cortile_verga_ortigia' }],
        },
        {
          name: 'Enoteca Solaria',
          location: 'Via Roma 86, Ortigia',
          description: 'Best for natural wines and plates of creative crostini.',
          links: [
            { label: 'Website', href: 'https://enotecasolaria.com' },
            { label: 'Instagram', href: 'https://instagram.com/enoteca_solaria' },
          ],
        },
      ],
    },
    {
      heading: 'Palermo: Restaurants',
      venues: [
        {
          name: 'Aja Mola',
          location: 'Via dei Cassari 39, Palermo',
          description: 'A small seafood restaurant balancing creativity and tradition; the raw starters and inventive pastas stand out.',
          links: [{ label: 'Website', href: 'https://ajamolapalermo.it' }],
        },
        {
          name: 'Altri Tempi',
          location: 'Via Sammartino 65, Palermo',
          description: 'A simple, traditional trattoria serving homely dishes.',
          links: [{ label: 'Bookings', href: 'https://www.quandoo.it/en/place/altri-tempi-102085' }],
        },
        {
          name: 'Corona Trattoria',
          location: 'Via Marconi 9, Palermo',
          description: 'A family favourite with a bright, airy room and a daily seafood menu.',
          links: [{ label: 'Website', href: 'https://www.coronatrattoria.com' }],
        },
        {
          name: 'Osteria Alivàru',
          location: 'Via della Vetriera 1, Kalsa, Palermo',
          description: 'Modern Sicilian food made with seasonal local ingredients, natural wines and handwritten daily specials.',
          links: [{ label: 'Website', href: 'https://www.alivaru.com' }],
        },
        {
          name: 'Osteria dei Vespri',
          location: 'Piazza Croce dei Vespri 6, Palermo',
          description: 'Holds one Michelin star, in the historic Palazzo Gangi; an elegant choice for special occasions.',
          links: [{ label: 'Website', href: 'https://www.osteriadeivespri.it/en' }],
        },
        {
          name: 'Osteria Mercede',
          location: 'Via Sammartino 1, Palermo',
          description: 'Nautical decor, fresh seafood and good antipasti and pasta.',
          links: [
            { label: 'Instagram', href: 'https://instagram.com/osteria_mercede_palermo' },
            { label: 'Facebook', href: 'https://www.facebook.com/osteriamercede' },
          ],
        },
        {
          name: 'Pizzo e Pizzo',
          location: 'Via XII Gennaio 1, Palermo',
          description: 'In the upscale part of town, half deli and half restaurant, with top cheeses, cured meats and wines from around Italy as well as daily pasta and vegetables.',
          links: [{ label: 'Bookings', href: 'https://www.quandoo.it/en/place/pizzo-e-pizzo-52498' }],
        },
        {
          name: 'Sardina PastaBar',
          location: 'Via dei Cassari 41/43, Palermo',
          description: 'Focused on seafood, with traditional dishes given a modern twist, outdoor seating and great service.',
          links: [{ label: 'Bookings', href: 'https://sardinapastabar.plateform.app' }],
        },
      ],
    },
    {
      heading: 'Palermo: Street Food',
      venues: [
        {
          name: 'Bar Touring',
          location: 'Via Lincoln 15, Palermo',
          description: 'Locals recommend it for the best arancina, as well as coffee and pastries.',
          links: [],
        },
        {
          name: 'Focacceria Basile',
          location: 'Piazza Nascè 5, Palermo',
          description: 'A bakery, deli and restaurant serving local street food and pasta, to eat in or take away.',
          links: [{ label: 'Facebook', href: 'https://www.facebook.com/TrattoriaBasile' }],
        },
        {
          name: 'Nino U Ballerino',
          location: 'Corso Finocchiaro Aprile 76/78, Palermo',
          description: 'Another favourite for pane ca meusa, which also serves other sandwiches and arancine.',
          links: [
            { label: 'Website', href: 'https://ninouballerino.it/' },
            { label: 'Instagram', href: 'https://instagram.com/ninouballerino' },
            { label: 'Facebook', href: 'https://www.facebook.com/NinouBallerino.StreetFood' },
          ],
        },
        {
          name: 'Nni Franco U Vastiddaru',
          location: 'Via Vittorio Emanuele 102, Palermo',
          description: 'Sandwiches, fried food and salads, with a patio; adventurous diners can try pane ca meusa, the spleen sandwich.',
          links: [{ label: 'Facebook', href: 'https://www.facebook.com/nnifrancouvastiddaru' }],
        },
        {
          name: 'Panificio Graziano',
          location: 'Via del Granatiere 11/13, Palermo',
          description: 'A bakery with street food, baked goods and pizza, handy before a day trip or a beach visit.',
          links: [],
        },
      ],
    },
    {
      heading: 'Palermo: Sweets and Coffee',
      venues: [
        {
          name: 'Bar Marocco',
          location: 'Via Vittorio Emanuele 494, Palermo',
          description: 'Known for fried iris, a ricotta-filled breakfast doughnut.',
          links: [
            { label: 'Website', href: 'https://barmarocco.it/' },
            { label: 'Instagram', href: 'https://instagram.com/bar_marocco' },
            { label: 'Facebook', href: 'https://www.facebook.com/barmarocco' },
          ],
        },
        {
          name: 'Cappadonia Gelati',
          location: 'Via Vittorio Emanuele 401, Palermo',
          description: 'Artisanal gelato in many flavours.',
          links: [
            { label: 'Website', href: 'https://www.cappadonia.it/' },
            { label: 'Instagram', href: 'https://instagram.com/cappadonia_gelati' },
            { label: 'Facebook', href: 'https://www.facebook.com/cappadonia.gelati' },
          ],
        },
        {
          name: 'Casa Stagnitta',
          location: 'Discesa dei Giudici 46, Palermo',
          description: 'A coffee bar with pastries and granita, roasting its own beans.',
          links: [
            { label: 'Website', href: 'https://www.casastagnitta.it/' },
            { label: 'Instagram', href: 'https://instagram.com/casastagnitta' },
            { label: 'Facebook', href: 'https://www.facebook.com/casa.stagnitta' },
          ],
        },
        {
          name: 'I Segreti del Chiostro',
          location: 'Piazza Bellini 33, Palermo',
          description:
            'Located in a convent that housed cloistered nuns from 1311 to 2014, it has been a bakery run by professional women bakers since 2017; cassate, cannoli and cookies are on offer.',
          links: [
            { label: 'Website', href: 'https://www.isegretidelchiostro.com/' },
            { label: 'Instagram', href: 'https://instagram.com/isegretidelchiostro' },
            { label: 'Facebook', href: 'https://www.facebook.com/ISegretidelChiostro.17' },
          ],
        },
        {
          name: 'Pasticceria Costa',
          location: 'Discesa dei Giudici 46, Palermo',
          description: 'Coffee, pastries and granita, with limited seating; the cookies make good gifts.',
          links: [
            { label: 'Website', href: 'https://www.pasticceriacosta.com/' },
            { label: 'Facebook', href: 'https://www.facebook.com/234655243340830' },
          ],
        },
      ],
    },
    {
      heading: 'More Addresses: Restaurants and Trattorie',
      venues: [
        {
          name: 'FUD Bottega Siciliana',
          location: 'Piazza Olivella 4, Palermo',
          description: 'Casual restaurant serving Sicilian street-style burgers with a good wine and beer list.',
          links: [{ label: 'Website', href: 'https://www.fud.it/palermo/' }],
        },
        {
          name: 'Giannavì',
          location: 'Palazzolo Acreide',
          description: 'Farm near Palazzolo Acreide that makes its own cheese and cured meats and serves lunch, especially on Sundays.',
          links: [{ label: 'Website', href: 'https://www.giannavi.it/' }],
        },
        {
          name: 'Quattro Mani',
          location: 'Via Francesco Riso 3, Palermo',
          description: 'Restaurant in the Kalsa district serving traditional Palermitan dishes.',
          links: [{ label: 'Website', href: 'https://quattromaniristorante.it/' }],
        },
        {
          name: 'Trattoria Maria Fidone',
          location: 'Ragusa',
          description: 'Trattoria just outside Ragusa.',
          note: 'Opening hours vary, so a call ahead is advisable.',
          links: [{ label: 'Website', href: 'https://www.mariafidone.com/' }],
        },
      ],
    },
    {
      heading: 'More Addresses: Coffee, Pastry and Gelato',
      venues: [
        {
          name: 'Caffè Adamo',
          location: 'Modica',
          description: 'Café in Modica known for granita and sweets.',
          links: [{ label: 'Website', href: 'https://caffeadamo.it/' }],
        },
        {
          name: 'Convento di Santa Caterina',
          location: 'Piazza Bellini 1, Palermo',
          description: 'Former convent in Palermo that now sells traditional sweets and pastries, near Piazza Bellini.',
          links: [{ label: 'Website', href: 'https://www.monasterosantacaterina.com/' }],
        },
        {
          name: 'Pasticceria Cappello',
          location: 'Palermo',
          description: 'Old-fashioned Palermo pastry shop, known for its sette veli cake.',
          links: [{ label: 'Website', href: 'https://www.pasticceriacappello.it/' }],
        },
        {
          name: 'Pasticceria Massaro',
          location: 'Via Ernesto Basile 24/26, Monreale',
          description: 'Pastry shop in Monreale selling Sicilian pastries.',
          links: [{ label: 'Website', href: 'https://www.pasticceriamassaro.it/' }],
        },
        {
          name: 'Rorò Gelateria',
          location: 'Piazza Marina 13, Palermo',
          description: 'Gelateria in Palermo, on Piazza Marina.',
          links: [{ label: 'Website', href: 'https://rorogelateria.it/contatti/' }],
        },
      ],
    },
    {
      heading: 'More Addresses: Wine, Beer and Cocktails',
      venues: [
        {
          name: 'Bottega Monteleone',
          location: 'Palermo',
          description: 'Wine bar in Palermo pouring Sicilian wines.',
          links: [{ label: 'Website', href: 'https://www.bottegamonteleone.com/' }],
        },
        {
          name: 'Dal Barone',
          location: 'Via A. Paternostro 87, Palermo',
          description: 'Wine bar in Palermo with a Sicilian focus.',
          links: [{ label: 'Website', href: 'https://dalbaronevino.it/' }],
        },
        {
          name: 'Enoteca Rappa',
          location: 'Via S. Teresa 97/99, Modica',
          description: 'Wine shop and wine bar in Modica with a broad regional list.',
          links: [{ label: 'Website', href: 'https://rappaenoteca.it/' }],
        },
      ],
    },
    {
      heading: 'Where to Stay',
      venues: [
        {
          name: 'Le Case del Principe',
          location: 'Contrada Kattibuale 910, Pantelleria',
          description: 'Traditional dammuso accommodation on the island of Pantelleria.',
          links: [{ label: 'Website', href: 'https://lecasedelprincipepantelleria.com/' }],
        },
      ],
    },
    {
      heading: 'Places to Visit',
      venues: [
        {
          name: 'Tonnara di Scopello',
          location: 'Via Francesco Mistretta 8, Scopello',
          description: 'Former tuna-processing station on the coast near Scopello, with sea access and a base for visiting the nearby Zingaro reserve.',
          links: [{ label: 'Website', href: 'https://www.tonnaradiscopello.it/' }],
        },
      ],
    },
  ],
}
