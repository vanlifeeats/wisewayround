import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'italy-emilia-romagna',
  name: 'Emilia-Romagna',
  heroImage: 'https://images.unsplash.com/photo-1635469019177-7264fc1e013c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTA5MjUyfDB8MXxzZWFyY2h8MXx8Qm9sb2duYSUyMEl0YWx5JTIwdHJhdmVsfGVufDB8MHx8fDE3OTI1OTc2MTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
  heroImageAlt: 'A street in Bologna, Emilia-Romagna',
  heroImageCredit: { name: 'Petr Slováček', profileUrl: 'https://unsplash.com/@grwood?utm_source=wisewayround&utm_medium=referral' },
  tagline: "Bologna, Modena and Parma: the cooking of Italy's richest food region.",
  intro: [
    'A good visit splits time between Parma for ham, tortelli and wine, and Bologna for its classic trattorie, delis and markets, with a short detour to Modena for Lambrusco, balsamic vinegar and a tasting-menu splurge.',
  ],
  sections: [
    {
      heading: 'Parma: Restaurants and Trattorie',
      venues: [
        {
          name: 'Antica Osteria della Ghiaia',
          location: 'Via Angelo Mazza 11, Parma',
          description: 'Rustic, traditional Parma dishes and regional wine, served since 1950.',
          links: [
            { label: 'Website', href: 'https://www.osteriadellaghiaia.com/' },
            { label: 'Facebook', href: 'https://www.facebook.com/anticaosteriadellaghiaia' },
          ],
        },
        {
          name: 'Officina Alimentare Dedicata',
          location: "Via Ferdinando Maestri 11/A, Parma",
          description:
            "Casual trattoria run by three women, serving heavy classics on a changing menu; a large prosciutto board is a good start, and the homemade giardiniera, served in its own jar, shouldn't be skipped.",
          links: [
            { label: 'Website', href: 'https://www.oadparma.it/' },
            { label: 'Instagram', href: 'https://instagram.com/officina_alimentare_dedicata' },
            { label: 'Facebook', href: 'https://www.facebook.com/officinaalimentarededicata' },
          ],
        },
        {
          name: 'Osteria del 36',
          location: 'Strada Aurelio Saffi 26/A, Parma',
          description: 'One of the oldest in Parma, on a charming side street, serving classic dishes in a cosy room.',
          links: [
            { label: 'Website', href: 'https://osteriadel36.it/' },
            { label: 'Instagram', href: 'https://instagram.com/osteria_del_36' },
            { label: 'Facebook', href: 'https://www.facebook.com/osteriadel36' },
          ],
        },
        {
          name: 'Osteria Virgilio',
          location: 'Str. Giovanni Inzani 3, Parma',
          description: 'Small trattoria offering high-quality classics and pleasant seating on the piazza.',
          links: [
            { label: 'Website', href: 'https://osteriavirgilioparma.wordpress.com/' },
            { label: 'Facebook', href: 'https://www.facebook.com/osteriavirgilio' },
          ],
        },
        {
          name: "Ristorante Angelo D'Or",
          location: 'Via Scutellari 1, Parma',
          description: 'Elegant restaurant facing the Duomo, using quality local ingredients in well-made traditional recipes.',
          links: [
            { label: 'Website', href: 'https://www.angioldor.it/' },
            { label: 'Instagram', href: 'https://instagram.com/angioldor' },
            { label: 'Facebook', href: 'https://www.facebook.com/angioldor' },
          ],
        },
        {
          name: 'Ristorante Cocchi',
          location: 'Viale Gramsci 16/A, Parma',
          description:
            'An institution since 1925; the menu includes gnocchi fritti, stuffed tortelli, agnolotti and an excellent bollito misto, with homemade zabaione and amaretti to finish.',
          links: [
            { label: 'Website', href: 'https://www.ristorantecocchi.it/' },
            { label: 'Instagram', href: 'https://instagram.com/ristorantecocchi' },
            { label: 'Facebook', href: 'https://www.facebook.com/ristorantecocchi' },
          ],
        },
        {
          name: 'Ristorante La Greppia',
          location: 'Via Garibaldi 39, Parma',
          description:
            'A 16-table favourite with seasonal, inventive takes on regional recipes, such as pumpkin, chestnut and truffle in handmade pasta; the Rosa di Parma, beef fillet stuffed with prosciutto and parmigiano, is also recommended.',
          links: [
            { label: 'Website', href: 'https://www.lagreppiaparma.com/' },
            { label: 'Instagram', href: 'https://instagram.com/ristorantelagreppia' },
            { label: 'Facebook', href: 'https://www.facebook.com/lagreppiaparma' },
          ],
        },
        {
          name: 'Ristorante Parma Rotta',
          location: 'Strada Langhirano 158, Parma',
          description: 'Rustic yet elegant, with grilled meats and a pergola for dining outdoors.',
          links: [
            { label: 'Website', href: 'https://www.parmarotta.it/' },
            { label: 'Instagram', href: 'https://instagram.com/parma_rotta' },
            { label: 'Facebook', href: 'https://www.facebook.com/parmarotta' },
          ],
        },
        {
          name: "Tra L'Uss e L'Asa",
          location: 'Borgo S. Biagio 6/C, Parma',
          description: 'Tiny osteria run by a couple, with a seasonal menu and outstanding natural wines.',
          links: [
            { label: 'Instagram', href: 'https://instagram.com/tralusselasa' },
            { label: 'Facebook', href: 'https://www.facebook.com/tralusselasa' },
          ],
        },
      ],
    },
    {
      heading: 'Parma: Light Bites and Delis',
      venues: [
        {
          name: 'Degusteria Romani',
          location: 'Borgo Palmia 2/C, Parma',
          description: 'Good for a light meal or takeaway, run by the family behind Prosciutteria Romani.',
          links: [
            { label: 'Website', href: 'https://www.silvanoromaniparma.it/degusteria-romani/' },
            { label: 'Facebook', href: 'https://www.facebook.com/degusteriaromani' },
          ],
        },
        {
          name: 'Frank Focaccia',
          location: 'Piazzale S. Lorenzo 19/A, Parma',
          description: 'Round focaccia baked fresh and stuffed with a wide choice of fillings.',
          links: [
            { label: 'Instagram', href: 'https://instagram.com/frank_focaccia' },
            { label: 'Facebook', href: 'https://www.facebook.com/frankfocacciaparma' },
          ],
        },
        {
          name: 'Da Pepèn',
          location: "Vicolo Sant'Ambrogio 2/C, Parma",
          description: 'Takeaway panini, a local favourite since the 1940s, known for the horse meat tartare sandwich.',
          links: [{ label: 'Facebook', href: 'https://www.facebook.com/Pepèn-Official-1394613000797861' }],
        },
        {
          name: 'Salumeria Garibaldi',
          location: 'Strada Garibaldi 42, Parma',
          description: 'One of the best delis, selling cured meats, cheeses and ready dishes for a hotel room or a picnic.',
          links: [
            { label: 'Website', href: 'https://salumeriagaribaldi.com/' },
            { label: 'Instagram', href: 'https://instagram.com/salumeriagaribaldi' },
            { label: 'Facebook', href: 'https://www.facebook.com/salumeriagaribaldi' },
          ],
        },
      ],
    },
    {
      heading: 'Parma: Wine Bars',
      venues: [
        {
          name: 'Enoteca Fontana',
          location: 'Str. Farini 24, Parma',
          description: 'Relaxed wine bar serving panini, cheese and cured meats.',
          links: [],
        },
        {
          name: 'Enoteca Tabarro',
          location: 'Str. Farini 5/B, Parma',
          description: "Diego Sorba's tiny natural wine bar, where an evening often begins and ends.",
          links: [
            { label: 'Instagram', href: 'https://instagram.com/enotecatabarro' },
            { label: 'Facebook', href: 'https://www.facebook.com/EnotecaTabarro' },
          ],
        },
      ],
    },
    {
      heading: 'Parma: Coffee, Pastry and Gelato',
      venues: [
        {
          name: 'Caffè Cavour',
          location: 'Strada Cavour 30/B, Parma',
          description: 'Elegant coffee beneath frescoed ceilings, with a terrace for people-watching and fresh pastries.',
          links: [
            { label: 'Website', href: 'https://www.caffecavourparma.it/' },
            { label: 'Instagram', href: 'https://instagram.com/caffecavourparma' },
            { label: 'Facebook', href: 'https://www.facebook.com/caffecavourparma' },
          ],
        },
        {
          name: 'Ciacco Gelato',
          location: 'Piazza della Steccata, Parma',
          description: 'Among the best gelato in Parma, with inventive seasonal flavours such as persimmon or ricotta.',
          note: 'The zabaione is a must.',
          links: [
            { label: 'Website', href: 'https://www.ciaccogelato.it/' },
            { label: 'Instagram', href: 'https://instagram.com/ciaccogelato' },
          ],
        },
        {
          name: 'Pasticceria Cocconi',
          location: 'Strada della Repubblica 22, Parma',
          description: 'Old-fashioned pastry shop with more than 80 varieties.',
          links: [{ label: 'Facebook', href: 'https://www.facebook.com/PasticceriaCocconi' }],
        },
      ],
    },
    {
      heading: 'Bologna: Classic Bolognese Dining',
      venues: [
        {
          name: 'Grassilli',
          location: 'Via dal Luzzo 3/d, Bologna',
          description:
            'Small, family-run restaurant on a quiet central street, with a calm, unhurried pace, classic Bolognese food and regulars greeted by name.',
          note: 'Seating is limited, so booking is advised.',
          links: [
            { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=100049500026371' },
            { label: 'Instagram', href: 'https://instagram.com/ristorantegrassilli' },
          ],
        },
        {
          name: 'Le Golosità di Nonna Aurora',
          location: 'Via Aristotile Fioravanti 45/b, Bologna',
          description: "Dining like someone's own dining room, with a warm welcome, a traditional menu, rich flavours and large portions.",
          links: [{ label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=100063526271491' }],
        },
        {
          name: "All'Osteria Bottega",
          location: 'Via Santa Caterina 51, Bologna',
          description:
            'The restaurant locals mention first, under the portico near Porta Saragozza and busy in the evening; the cotoletta alla Petroniana is the dish to order.',
          links: [
            { label: 'Website', href: 'https://www.osteriabottega.it' },
            { label: 'Instagram', href: 'https://instagram.com/osteriabottega' },
          ],
        },
        {
          name: 'Ristorante Diana',
          location: 'Via Volturno 5, Bologna',
          description:
            'Open since the early 1900s, serving the classics correctly: tagliatelle al ragù, gramigna with sausage and tortellini in brodo, in a grand room with polished wood and crisp linen.',
          links: [
            { label: 'Website', href: 'https://www.ristorante-diana.it' },
            { label: 'Instagram', href: 'https://instagram.com/ristorante_diana_bologna' },
          ],
        },
        {
          name: 'Trattoria di Via Serra',
          location: 'Via Luigi Serra 9b, Bologna',
          description: 'Straightforward and slightly away from the busy streets, with a short menu and handmade pasta.',
          note: 'Reservations are by phone only, otherwise arrive early and queue.',
          links: [
            { label: 'Website', href: 'https://www.trattoriadiviaserra.it' },
            { label: 'Instagram', href: 'https://instagram.com/trattoriadiviaserra' },
          ],
        },
      ],
    },
    {
      heading: 'Bologna: A Lighter, Newer Approach',
      venues: [
        {
          name: 'Ahimè',
          location: 'Via S. Gervasio 6e, Bologna',
          description: 'A newer face of Bologna, curious and understated, with seasonal, vegetable-focused cooking and carefully prepared seafood and meat.',
          links: [
            { label: 'Website', href: 'https://www.ahime.it' },
            { label: 'Instagram', href: 'https://instagram.com/ahime_bologna' },
          ],
        },
        {
          name: 'Trattoria Da Me',
          location: 'Via S. Felice 50a, Bologna',
          description: 'Classic trattoria with a lighter touch: tortellini, ragù and cotoletta with small updates.',
          note: 'The Sunday lasagna alla bolognese should not be missed.',
          links: [
            { label: 'Website', href: 'https://www.trattoriadame.it' },
            { label: 'Instagram', href: 'https://instagram.com/trattoriadame' },
          ],
        },
      ],
    },
    {
      heading: 'Bologna: Wine',
      venues: [
        {
          name: 'Enoteca Storica Faccioli',
          location: 'Via Altabella 15b, Bologna',
          description: 'Small producers and natural wines, with good cured meats, cheeses and inventive small plates and focacce.',
          links: [
            { label: 'Website', href: 'https://www.enotecastoricafaccioli.it' },
            { label: 'Instagram', href: 'https://instagram.com/enoteca_storica_faccioli' },
          ],
        },
        {
          name: 'Osteria del Sole',
          location: 'Vicolo Ranocchi 1/d, Bologna',
          description:
            'Possibly the oldest osteria in Bologna, dating from 1465; only wine is served, with customers bringing food from nearby delis or the market.',
          links: [
            { label: 'Website', href: 'https://www.osteriadelsole.it' },
            { label: 'Instagram', href: 'https://instagram.com/osteriadelsole1465' },
          ],
        },
      ],
    },
    {
      heading: 'Bologna: Takeaway and Sweets',
      venues: [
        {
          name: 'Caffè Terzi',
          location: 'Via Oberdan 10d, Bologna',
          description: 'Serious espresso, served standing only, with no space for lingering laptops.',
          links: [{ label: 'Website', href: 'https://www.caffeterzi.it' }],
        },
        {
          name: 'Cremeria Santo Stefano',
          location: 'Via Santo Stefano 70c, Bologna',
          description: 'Proper gelato: intensely nutty pistachio, rich crema and seasonal fruit.',
          note: 'A line usually forms and is worth joining.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/cremeriasantostefano' }],
        },
        {
          name: 'Forno Brisa',
          location: 'Bologna (several locations)',
          description: 'Bakery and coffee shop with naturally leavened bread, croissants and focaccia, good for breakfast or a quick lunch.',
          links: [
            { label: 'Website', href: 'https://www.fornobrisa.it/en' },
            { label: 'Instagram', href: 'https://instagram.com/fornobrisa' },
          ],
        },
        {
          name: 'Indegno - La Crescentina 2.0',
          location: 'Bologna (several locations)',
          description: 'Warm fried crescentine folded around mortadella, squacquerone, prosciutto or ragù; fast, casual and lively at lunch.',
          links: [
            { label: 'Website', href: 'https://www.indegno.eu/en-gb' },
            { label: 'Instagram', href: 'https://instagram.com/indegno_crescentine2.0' },
          ],
        },
        {
          name: 'Mercato delle Erbe',
          location: 'Via Ugo Bassi 25, Bologna',
          description:
            'Covered market dating from 1910 showing daily Bolognese life: produce, fish, pasta and cured meats, with counters and wine bars for a quick plate or aperitivo.',
          links: [{ label: 'Website', href: 'https://www.mercatodelleerbe.eu' }],
        },
      ],
    },
    {
      heading: 'Where to Stay',
      venues: [
        {
          name: 'Grand Hotel Majestic già Baglioni',
          location: "Via dell'Indipendenza 8, Bologna",
          description:
            'Old-world grandeur in the historic centre, once home to royalty and film stars, with heavy drapes and marble bathrooms.',
          links: [
            { label: 'Website', href: 'https://grandhotelmajestic.duetorrihotels.com' },
            { label: 'Instagram', href: 'https://instagram.com/grandhotelmajestic' },
          ],
        },
        {
          name: 'Gregorini Bingham Art Luxury Suites',
          location: 'Via Barberia 32, Bologna',
          description: 'Small, design-minded hotel with original floors, frescoes and stuccos, central yet calm, feeling more like a stylish private home.',
          links: [
            { label: 'Website', href: 'https://www.gregorinibingham.com/en/home-en' },
            { label: 'Instagram', href: 'https://instagram.com/gregorini_bingham' },
          ],
        },
      ],
    },
    {
      heading: 'More Addresses: Restaurants and Trattorie',
      venues: [
        {
          name: 'Franceschetta 58',
          location: 'Via Vignolese 58, Modena',
          description: 'Relaxed brasserie linked to Osteria Francescana, serving cured meats, tortellini and other Emilian dishes at moderate prices.',
          links: [{ label: 'Website', href: 'https://franceschetta.it/' }],
        },
        {
          name: 'Hosteria Giusti',
          location: 'Via Farini 75, Modena',
          description: 'Very small, long-established Modenese restaurant down an alley off Via Emilia, serving tagliatelle, tortellini and boiled and braised meats.',
          links: [{ label: 'Website', href: 'https://hosteriagiusti.it/' }],
        },
        {
          name: 'La Lanterna di Diogene',
          location: 'Modena',
          description: 'Working farm and agriturismo outside Modena with a restaurant and an extensive Lambrusco list.',
          links: [{ label: 'Website', href: 'https://www.lalanternadidiogene.org/' }],
        },
        {
          name: 'Osteria Francescana',
          location: 'Modena',
          description: "Modena's three-Michelin-star restaurant led by Massimo Bottura, tasting menus only.",
          note: 'Book well in advance.',
          links: [{ label: 'Website', href: 'https://osteriafrancescana.it/it/' }],
        },
        {
          name: 'Ristorante Da Enzo',
          location: 'Via Coltellini 17, Modena',
          description: 'Neighbourhood restaurant serving traditional Modenese cooking.',
          links: [{ label: 'Website', href: 'https://ristorantedaenzo.it/' }],
        },
      ],
    },
    {
      heading: 'More Addresses: Coffee, Pastry and Gelato',
      venues: [
        {
          name: 'Allegra',
          location: 'Bologna',
          description: 'Café and bakery in Bologna offering sweet and savoury pastry, coffee and natural wine.',
          links: [{ label: 'Website', href: 'https://www.allegrabologna.it/' }],
        },
        {
          name: 'Antica Pasticceria San Biagio',
          location: 'Via Emilia Centro 77, Modena',
          description: 'Historic pastry shop on the Via Emilia, selling cakes, biscuits and traditional Modenese sweets.',
          links: [{ label: 'Website', href: 'https://pasticceriasanbiagio.it/it/' }],
        },
        {
          name: 'Bloom Gelateria',
          location: 'Modena',
          description: 'Natural gelato shop in central Modena, with several branches.',
          links: [{ label: 'Website', href: 'https://bloomgelateria.it/' }],
        },
        {
          name: 'Mon Café',
          location: 'Corso Canalchiaro 128, Modena',
          description: 'Café for breakfast and light lunches that also keeps a strong wine list, open into the evening.',
          links: [{ label: 'Website', href: 'https://mon-cafe.it/' }],
        },
      ],
    },
    {
      heading: 'More Addresses: Wine, Beer and Cocktails',
      venues: [
        {
          name: 'Archer',
          location: 'Via Cesare Battisti 54, Modena',
          description: 'Wine bar and kitchen in central Modena, pouring Italian and international wines with cured meats, cheese and small plates.',
          links: [{ label: 'Website', href: 'https://www.archermodena.it/' }],
        },
        {
          name: 'La Bicicletta',
          location: 'Modena',
          description: 'Casual bar in Modena suited to an early-evening aperitivo.',
          links: [{ label: 'Website', href: 'https://labicicletta.mo.it/' }],
        },
      ],
    },
    {
      heading: 'More Addresses: Food Shops, Producers and Markets',
      venues: [
        {
          name: 'Acetaia di San Giacomo',
          location: 'Strada Pennella 1, Modena',
          description: 'Producer of traditional balsamic vinegar in the Modena countryside.',
          note: 'Visits are by appointment.',
          links: [{ label: 'Website', href: 'https://acetaiasangiacomo.com/' }],
        },
        {
          name: 'Antica Aguzzeria del Cavallo',
          location: 'Via drapperie 12, Bologna',
          description: 'Kitchenware shop trading since 1783, known for brass pasta tools and utensils.',
          links: [{ label: 'Website', href: 'https://aguzzeriadelcavallo.it/' }],
        },
        {
          name: 'Paolo Atti & Figli',
          location: 'Bologna',
          description: 'Historic fresh pasta and food shop in the old centre of Bologna, near the Quadrilatero.',
          links: [{ label: 'Website', href: 'https://www.paoloatti.com/' }],
        },
      ],
    },
  ],
}
