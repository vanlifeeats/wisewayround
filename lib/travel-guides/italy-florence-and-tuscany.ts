import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'italy-florence-and-tuscany',
  name: 'Florence and Tuscany',
  heroImage: 'https://images.unsplash.com/photo-1611953769882-234c1e8e459c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTA5MjUyfDB8MXxzZWFyY2h8MXx8RmxvcmVuY2UlMjBUdXNjYW55JTIwSXRhbHl8ZW58MHwwfHx8MTc5MjU5NzYxM3ww&ixlib=rb-4.1.0&q=80&w=1080',
  heroImageAlt: 'The rooftops of Florence above the Tuscan countryside',
  heroImageCredit: { name: 'Joshua Kettle', profileUrl: 'https://unsplash.com/@joshuakettle?utm_source=wisewayround&utm_medium=referral' },
  tagline: 'Steak, trattorie, sandwiches, cafés and wine in Florence, with places to eat and stay in the Sienese countryside.',
  intro: [
    "A good visit starts with Florence's panino tradition, then works through its steak houses, traditional trattorie and coffee shops before venturing out towards Siena and the Val d'Orcia countryside.",
  ],
  sections: [
    {
      heading: 'A Sandwich Crawl Through Florence',
      venues: [
        {
          name: "'Ino",
          location: 'Via dei Georgofili 3r/7r, Florence',
          description:
            "Started Florence's panino revival about 20 years ago and still leads it, using top-quality ingredients including San Daniele prosciutto, Piedmont robiola and sun-dried Pachino tomatoes, with specially ordered bread and daily specials written on butcher paper.",
          links: [
            { label: 'Website', href: 'https://www.inofirenze.com' },
            { label: 'Instagram', href: 'https://instagram.com/inopanino' },
          ],
        },
        {
          name: 'Casa Del Vino',
          location: "Via dell'Ariento 16r, Florence",
          description: 'A dreamy wine bar with a dozen open bottles by the glass and tiny, soft brioche panini.',
          note: 'Butter with marinated anchovies is the one to try.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/casa_del_vino_firenze' }],
        },
        {
          name: 'Il Cernacchio',
          location: 'Via della Condotta 38R, Florence',
          description:
            'City branch of a Chianti trattoria that turns its dishes into panini: peposo, acquacotta, stewed boar or chicken served in a hollowed crusty roll.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/ilceranacchiofoodandwine' }],
        },
        {
          name: 'I Fratellini',
          location: 'Via dei Cimatori 38/r, Florence',
          description: "Possibly the smallest, and a wine bar since 1875; customers choose a glass from the day's bottles and eat outside.",
          links: [{ label: 'Instagram', href: 'https://instagram.com/ifratellini_1875' }],
        },
        {
          name: 'Mariano',
          location: 'Via del Parione 19, Florence',
          description:
            'Tiny alimentari below street level, with no sign and mostly local customers; the galantina di pollo with baby artichokes is famous.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/barmarianolaninoteca' }],
        },
        {
          name: 'Semel',
          location: 'Piazza Ghiberti 44/r, Florence',
          description:
            'Barely bigger than a closet and open only from 11:30am to 2:30pm; owner Marco Paparozzi makes six sandwiches a day filled with stews of donkey, pheasant, beef or deer.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/semel.firenze' }],
        },
        {
          name: "Da' Vinattieri",
          location: 'Via Santa Margherita 4/6r, Florence',
          description:
            'Hole in the wall under an archway in a narrow alley, with a long line; focaccia is filled to order, coccoli are sold, and a roll piled with tripe and salsa verde is a specialty.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/davinattieri' }],
        },
      ],
    },
    {
      heading: 'Florence at the Table: Steak and Meat',
      venues: [
        {
          name: "All'Antico Ristoro di Cambi",
          location: 'Via S. Onofrio 1/R, Florence',
          description:
            'Renowned for meat, with giant hams hanging from the ceiling; a meal might begin with Tuscan salami, followed by wild boar pappardelle, tripe, meatballs or steak.',
          links: [
            { label: 'Website', href: 'https://www.anticoristorodicambi.it/en' },
            { label: 'Instagram', href: 'https://instagram.com/anticoristorodicambi' },
          ],
        },
        {
          name: 'Regina Bistecca',
          location: 'Via Ricasoli 14r, Florence',
          description:
            'A shrine to bistecca fiorentina in a former antiquarian bookshop; top-quality Chianina beef is grilled over an open flame and served with classic Tuscan sides.',
          links: [
            { label: 'Website', href: 'https://www.reginabistecca.com/en' },
            { label: 'Instagram', href: 'https://instagram.com/reginabistecca' },
          ],
        },
        {
          name: 'Trattoria Sostanza',
          location: 'Via del Porcellana 25/R, Florence',
          description: 'Historic gem near Santa Maria Novella with a rustic dining room and a short menu; the butter chicken and the bistecca are the dishes to order.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/trattoriasostanzafirenze' }],
        },
      ],
    },
    {
      heading: 'Florence at the Table: Traditional Trattorie',
      venues: [
        {
          name: 'Alla Vecchia Bettola',
          location: 'Viale Vasco Pratolini 3/5/7, Oltrarno, Florence',
          description:
            'A throwback to old Florence: noisy and friendly, with marble tables set close together, old photographs and copper pans on the walls, and wine in straw-wrapped bottles.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/alla_vecchia_bettola' }],
        },
        {
          name: 'Buca Lapi',
          location: 'Via del Trebbio 1r, Florence',
          description: 'Claims to be the oldest restaurant in the city.',
          note: 'Groups are not accepted, which keeps the atmosphere intimate.',
          links: [{ label: 'Website', href: 'https://www.bucalapi.com/en/index.php' }],
        },
        {
          name: 'Trattoria Cammillo',
          location: 'Borgo San Iacopo 57/r, Florence',
          description: 'A traditional, family-run trattoria.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/trattoriacammillo' }],
        },
      ],
    },
    {
      heading: 'Florence at the Table: Modern and Elegant',
      venues: [
        {
          name: 'Cantinetta Antinori',
          location: 'Piazza degli Antinori 3, Florence',
          description: 'Housed in the Antinori family palazzo, a more formal and romantic setting with excellent wines.',
          links: [
            { label: 'Website', href: 'https://cantinetta-antinori.com/en' },
            { label: 'Instagram', href: 'https://instagram.com/cantinettaantinori_firenze' },
          ],
        },
        {
          name: 'Cibrèo Caffè',
          location: "Via Andrea del Verocchio 5R, Sant'Ambrogio, Florence",
          description:
            'Part of a much-loved restaurant group, which also operates a venue in the Helvetia & Bristol Hotel; the casual Caffè Cibrèo has vintage posters and comfort dishes such as tagliolini cacio e burro.',
          links: [
            { label: 'Website', href: 'https://cibreo.com' },
            { label: 'Instagram', href: 'https://instagram.com/cibreo_firenze' },
          ],
        },
        {
          name: 'Locale Firenze',
          location: 'Via delle Seggiole 12r, Florence',
          description: 'A Renaissance palazzo containing an award-winning cocktail bar in a glass-roofed room, with a creative restaurant behind it.',
          links: [
            { label: 'Website', href: 'https://www.localefirenze.it' },
            { label: 'Instagram', href: 'https://instagram.com/localefirenze' },
          ],
        },
        {
          name: 'Il Santo Bevitore',
          location: 'Via Santo Spirito 64r, Florence',
          description: 'Has the feel of a classic Florentine restaurant but is a contemporary favourite, using seasonal local ingredients in inventive dishes.',
          links: [
            { label: 'Website', href: 'https://www.ilsantobevitore.com' },
            { label: 'Instagram', href: 'https://instagram.com/ilsantobevitorefi' },
          ],
        },
      ],
    },
    {
      heading: 'Florence at the Table: Coffee, Pastries and Gelato',
      venues: [
        {
          name: 'Caffè Gilli',
          location: 'Via Roma 1r, Florence',
          description: "Florence's oldest café, dating from 1733, on Piazza della Repubblica, open all day for cappuccino, a quick pick-me-up or aperitivo.",
          links: [
            { label: 'Website', href: 'https://www.caffegilli.com/en' },
            { label: 'Instagram', href: 'https://instagram.com/gilli_1733' },
          ],
        },
        {
          name: 'Ditta Artigianale',
          location: 'Via dello Sprone 5/R, Oltrarno, Florence',
          description: "Florence's first third-wave coffee shop, with a drinks list wider than at a typical Italian café, including chai and matcha lattes.",
          links: [
            { label: 'Website', href: 'https://dittaartigianale.com/en' },
            { label: 'Instagram', href: 'https://instagram.com/dittaartigianale' },
          ],
        },
        {
          name: 'Gelateria Badiani',
          location: 'Via dei Tosinghi 12r, Florence',
          description: 'Open since 1932 and credited with inventing the Buontalenti flavour in the 1960s.',
          links: [
            { label: 'Website', href: 'http://www.gelateriabadiani.it/en/home-en' },
            { label: 'Instagram', href: 'https://instagram.com/badiani1932_it' },
          ],
        },
        {
          name: 'Giacosa 1815',
          location: 'Via della Spada 15 R, Florence',
          description:
            'Stylish bar with blue velvet seating, wood panelling and a black marble counter, close to Via Tornabuoni, in the former Caffè Casoni, where the Negroni was invented.',
          links: [
            { label: 'Website', href: 'https://www.giacosafirenze.com/en' },
            { label: 'Instagram', href: 'https://instagram.com/giacosa_1815' },
          ],
        },
        {
          name: 'Robiglio',
          location: 'Via Tosinghi 11, Florence',
          description: 'Among the best pastries in the city, popular with residents, with a concealed back room for a larger meal.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/robiglio_tosinghi' }],
        },
        {
          name: 'Vivoli Gelateria',
          location: 'Via Isola delle Stinche 7r, Florence',
          description: 'Known for its affogato and regarded by many as serving the best gelato in the city.',
          links: [
            { label: 'Website', href: 'https://vivoli.it/en' },
            { label: 'Instagram', href: 'https://instagram.com/vivoli_il_gelato' },
          ],
        },
      ],
    },
    {
      heading: 'Florence at the Table: Wine Bars',
      venues: [
        {
          name: 'Enoteca Alessi',
          location: "Via dell'Oche 27/red, Florence",
          description: 'Historic wine shop and bar with a wide range of Tuscan and Italian wines, cheeses, cured meats and specialty foods.',
          links: [
            { label: 'Website', href: 'https://www.enotecaalessi.it/index.php' },
            { label: 'Instagram', href: 'https://instagram.com/enotecaalessi' },
          ],
        },
        {
          name: 'Procacci 1885',
          location: "Via de' Tornabuoni 64R, Florence",
          description: 'Historic wine bar now owned by the Antinori family, known for tiny sandwiches, of which the truffle version is the best known.',
          links: [
            { label: 'Website', href: 'https://procacci1885.it/en/florence-wine-and-truffles' },
            { label: 'Instagram', href: 'https://instagram.com/procacci1885_firenze' },
          ],
        },
        {
          name: 'Vineria Sonora',
          location: 'Via degli Alfani 39r, Florence',
          description: 'Neighbourhood favourite for natural wines, with a record bar, in a former milk shop.',
          links: [
            { label: 'Website', href: 'https://www.vineriasonora.it' },
            { label: 'Instagram', href: 'https://instagram.com/vineriasonora' },
          ],
        },
      ],
    },
    {
      heading: 'More Addresses: Restaurants and Trattorie',
      venues: [
        {
          name: "Buca dell'Orafo",
          location: 'Florence',
          description: 'Basement trattoria close to the Ponte Vecchio serving Florentine dishes.',
          links: [{ label: 'Website', href: 'https://bucadellorafo.it/' }],
        },
        {
          name: 'Dopolavoro La Foce',
          location: "Strada della Vittoria 90, Chianciano Terme",
          description: "Restaurant on the La Foce estate in the Val d'Orcia, serving traditional Tuscan dishes, with gardens to visit.",
          links: [{ label: 'Website', href: 'https://www.dopolavorolafoce.it/it/' }],
        },
        {
          name: "Ora d'Aria",
          location: 'Via dei Georgofili 11R, Florence',
          description: 'Michelin-starred restaurant between the Uffizi and the Ponte Vecchio.',
          links: [{ label: 'Website', href: 'https://www.oradariaristorante.com/' }],
        },
        {
          name: 'Osteria del Gatto',
          location: 'Via San Marco 8, Siena',
          description: 'Traditional Sienese osteria.',
          links: [{ label: 'Website', href: 'https://osteria-del-gatto.eatbu.com/?lang=it' }],
        },
        {
          name: 'Salefino',
          location: 'Siena',
          description: 'Modern restaurant and wine bar in Siena, with a list of natural and organic wines.',
          links: [{ label: 'Website', href: 'https://www.salefino-siena.com/' }],
        },
        {
          name: 'Trattoria Marione',
          location: 'Florence',
          description: 'Central Florentine trattoria offering a classic Tuscan menu.',
          links: [{ label: 'Website', href: 'https://www.trattoriamarione.it/' }],
        },
        {
          name: 'Trattoria Ruggero',
          location: 'Via Senese 89R, Florence',
          description: 'Neighbourhood trattoria outside the centre of Florence serving Tuscan home cooking.',
          links: [{ label: 'Website', href: 'https://www.trattoriaruggero.it/' }],
        },
      ],
    },
    {
      heading: 'More Addresses: Coffee, Pastry and Gelato',
      venues: [
        {
          name: 'Gelateria della Passera',
          location: 'Via Toscanella 15, Florence',
          description: 'Artisanal gelateria on a small piazza in the Oltrarno.',
          links: [{ label: 'Website', href: 'https://gelateriadellapassera.it/' }],
        },
        {
          name: 'Nannini',
          location: 'Strada delle Frigge 5, Siena',
          description: 'Historic Sienese pastry shop for ricciarelli and cavallucci.',
          links: [{ label: 'Website', href: 'https://nanninidolciecaffe.com/' }],
        },
        {
          name: 'Pasticceria Nencioni',
          location: 'Florence',
          description: "Busy pastry shop near the Sant'Ambrogio market, with one of the central city's better pastry counters.",
          links: [{ label: 'Website', href: 'https://www.pasticcerianencioni.com/' }],
        },
        {
          name: 'Sbrino',
          location: 'Florence',
          description: 'Artisanal gelato with several locations, including Santo Spirito.',
          links: [{ label: 'Website', href: 'https://www.sbrino.com/' }],
        },
        {
          name: 'La Sorbettiera',
          location: 'Florence',
          description: 'Artisanal gelato with a more classic flavour list, in more than one location.',
          links: [{ label: 'Website', href: 'https://www.lasorbettiera.it/' }],
        },
      ],
    },
    {
      heading: 'More Addresses: Food Shops, Producers and Markets',
      venues: [
        {
          name: 'Formaggioteca Terroir',
          location: 'Via dei Renai 19, Florence',
          description: 'Cheese shop and wine bar on the Oltrarno side of the river.',
          links: [{ label: 'Website', href: 'https://www.formaggiotecaterroir.it/' }],
        },
        {
          name: 'Mercato di Sant\u2019Ambrogio',
          location: 'Piazza Lorenzo Ghiberti 501, Florence',
          description: 'Neighbourhood market selling produce outdoors and meat, fish and prepared food inside.',
          links: [{ label: 'Website', href: 'https://mercatosantambrogio.it/' }],
        },
      ],
    },
    {
      heading: 'Where to Stay',
      venues: [
        {
          name: 'Pacina',
          location: 'Località Pacina 7, Castelnuovo Berardenga',
          description: 'Family winery near Siena with apartment-style accommodation on the estate.',
          links: [{ label: 'Website', href: 'https://www.pacina.it/' }],
        },
      ],
    },
  ],
}
