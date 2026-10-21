import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'italy-rome',
  name: 'Rome',
  tagline: 'Eating, drinking and shopping in the capital, neighbourhood by neighbourhood.',
  intro: [
    "Rome rewards treating vintage shopping, homeware and antiques, food shopping and markets, and eating by neighbourhood as separate outings rather than one packed day. A good visit also leaves room for a pizzeria crawl, a gelato tour and the city's granita, grattachecca and cremolato traditions.",
  ],
  sections: [
    {
      heading: 'Vintage Finds in Rome',
      venues: [
        {
          name: 'Blue Goose',
          location: 'Via del Boschetto 4, Rome',
          description: 'More designer resale and contemporary vintage than classic vintage: Prada, Miu Miu and lesser-known Italian labels, in clothes, bags and shoes.',
          links: [
            { label: 'Facebook', href: 'https://www.facebook.com/bluegooseromeofficial' },
            { label: 'Instagram', href: 'https://instagram.com/bluegooseroma' },
          ],
        },
        {
          name: 'Gonne al Vento Vintage Boutique',
          location: 'Via del Pellegrino 172, Rome',
          description: "A women's vintage shop selling clothes, handbags and leather goods, all in excellent condition and well displayed.",
          links: [{ label: 'Instagram', href: 'https://instagram.com/gonnealventovintage' }],
        },
        {
          name: 'Magda Violet',
          location: 'Monteverde / Gianicolense, Rome (by appointment)',
          description: 'Hand-picked vintage and designer pieces from Italy, with striking shapes, great materials and lesser-known Italian labels.',
          note: 'Visits are by appointment, arranged by email or Instagram DM.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/shopmagdaviolet' }],
        },
        {
          name: 'Malke Alpert Vintage',
          location: 'Via di Parione 11, Rome',
          description: 'Small but strong, with vintage clothes, accessories and homewares, and rare, very sweet vintage baby clothes.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/malke_alpert' }],
        },
        {
          name: 'Piccioni Fabio',
          location: 'Via del Boschetto 148, Rome',
          description: 'A tiny shop packed with vintage jewelry from costume to fine; the owner can describe the history, materials and age of almost every piece.',
          links: [],
        },
        {
          name: 'Pulp Vintage',
          location: 'Via del Boschetto 15A, Rome',
          description: 'A colourful shop with plenty of character, open since the late 1990s, ranging from everyday finds to designer pieces often restored or customised by the owner.',
          links: [
            { label: 'Facebook', href: 'https://www.facebook.com/pulpvintage.roma' },
            { label: 'Instagram', href: 'https://instagram.com/vintagepulp' },
          ],
        },
        {
          name: 'Twice Vintage Shop',
          location: 'Via di S. Francesco a Ripa 7, Rome',
          description: "Fun for men and women alike, with many vintage T-shirts, jeans and leather jackets, and one of the best men's selections in Rome.",
          links: [
            { label: 'Website', href: 'https://twicevintage.com/eshop/en' },
            { label: 'Instagram', href: 'https://instagram.com/twicevintageshop' },
          ],
        },
      ],
    },
    {
      heading: 'Rome Shopping: Homeware and Design',
      venues: [
        {
          name: 'Assemblea',
          location: 'Via Alessandro Volta 22, Rome',
          description: 'Part gallery and part shop, showing contemporary Italian makers; ceramics, textiles, jewelry and small objects change regularly.',
          links: [
            { label: 'Facebook', href: 'https://www.facebook.com/assemblea22' },
            { label: 'Instagram', href: 'https://instagram.com/assemblea_testaccio' },
          ],
        },
        {
          name: 'Celadon',
          location: 'Via del Boschetto 123, Rome',
          description: 'Ceramic artists Cecilia Ariaudo and Paola Cenciarelli make handmade pieces that sit between the functional and the sculptural, a departure from traditional Italian pottery.',
          links: [
            { label: 'Website', href: 'https://celadonroma.com' },
            { label: 'Instagram', href: 'https://instagram.com/celadon_roma' },
          ],
        },
        {
          name: 'Chez Dédé',
          location: 'Via di Monserrato 35, Rome',
          description: 'A stylish shop founded by a designer and an illustrator, selling their own creations alongside homewares, books, stationery, pajamas, bags and art.',
          links: [
            { label: 'Website', href: 'https://www.chezdede.com' },
            { label: 'Instagram', href: 'https://instagram.com/chezdede' },
          ],
        },
        {
          name: 'Emporio Centrale',
          location: 'Largo del Teatro Valle 1, Rome',
          description: 'Beautifully made Italian objects, well suited to gifts that avoid the tourist cliché.',
          links: [
            { label: 'Website', href: 'https://emporiocentrale.com' },
            { label: 'Instagram', href: 'https://instagram.com/emporio.centrale' },
          ],
        },
        {
          name: 'Furia Tappezzeria',
          location: 'Via della Scrofa 40, Rome',
          description: "Italian ceramics, table linens, lampshades and more, many made in the shop's own upholstery workshop.",
          links: [
            { label: 'Website', href: 'https://furialiving.it' },
            { label: 'Instagram', href: 'https://instagram.com/furialiving' },
          ],
        },
        {
          name: 'Giuncart',
          location: 'Via del Pellegrino 93, Rome',
          description: 'Handwoven baskets, placemats and bags made by the owner, who also accepts custom orders.',
          links: [
            { label: 'Website', href: 'https://www.giuncart.com' },
            { label: 'Instagram', href: 'https://instagram.com/giuncart' },
          ],
        },
        {
          name: 'Leone Limentani',
          location: "Via del Portico d'Ottavia 47, Rome",
          description: 'An old-fashioned shop overflowing with dishes, glassware and kitchenware, and for generations a place for Roman wedding registries.',
          links: [
            { label: 'Website', href: 'https://www.limentani.com/it' },
            { label: 'Instagram', href: 'https://instagram.com/leone.limentani' },
          ],
        },
        {
          name: 'Paralumi dal 1938',
          location: 'Via del Leoncino 29, Rome',
          description: 'A historic workshop that still makes lampshades entirely by hand, to order.',
          links: [
            { label: 'Website', href: 'https://www.paralumi.it/en/home-en' },
            { label: 'Instagram', href: 'https://instagram.com/lampshades.paralumi.1938' },
          ],
        },
      ],
    },
    {
      heading: 'Rome Shopping: Textiles',
      venues: [
        {
          name: 'Lisa Corti',
          location: 'Via dei Coronari 197, Rome',
          description: 'A well-known Italian textile designer; colour and pattern are everywhere across tablecloths, napkins, quilts, cushion covers and robes.',
          links: [
            { label: 'Website', href: 'https://lisacorti.com/en' },
            { label: 'Instagram', href: 'https://instagram.com/lisacorti_official' },
          ],
        },
        {
          name: 'Stay.',
          location: 'Via dei Falegnami 64, Rome',
          description: 'Italian linens in natural fibers and timeless colours that improve with age: sheets, towels and tablecloths.',
          links: [
            { label: 'Website', href: 'https://www.staystore.it' },
            { label: 'Instagram', href: 'https://instagram.com/staystoreroma' },
          ],
        },
      ],
    },
    {
      heading: 'Rome Shopping: Antiques and Books',
      venues: [
        {
          name: 'Almost Corner Bookshop',
          location: 'Via del Moro 45, Rome',
          description: "One of the best English-language bookshops in Rome, strong on Italy, Rome and translated Italian authors; a good stop before coffee in Trastevere.",
          links: [
            { label: 'Facebook', href: 'https://www.facebook.com/AlmostCornerBookshop' },
            { label: 'Instagram', href: 'https://instagram.com/almostcornerbookshop' },
          ],
        },
        {
          name: 'Antica Libreria Cascianelli',
          location: 'Largo Febo 15, Rome',
          description: 'An extraordinary antiquarian bookshop with books, prints, maps and small collectibles, worth entering even without a purchase.',
          links: [
            { label: 'Website', href: 'https://anticalibreriacascianelli.com' },
            { label: 'Instagram', href: 'https://instagram.com/libreriacascianelli' },
          ],
        },
        {
          name: 'Antiquariato Valligiano',
          location: 'Via Giulia 193, Rome',
          description: 'A curated mix of furniture, paintings and decorative objects, and a good starting point for antique hunting.',
          links: [
            { label: 'Website', href: 'https://www.antiquariatovalligiano.it/en/via-giulia' },
            { label: 'Instagram', href: 'https://instagram.com/antiquariato_valligiano_roma' },
          ],
        },
        {
          name: 'Hollywood',
          location: 'Via di Monserrato 107, Rome',
          description: 'A tiny, old-fashioned cinema shop open since 1983, with DVDs, posters, books and memorabilia, especially classic and auteur films.',
          links: [
            { label: 'Website', href: 'https://hollywood-video.it' },
            { label: 'Instagram', href: 'https://instagram.com/hollywoodroma' },
          ],
        },
        {
          name: 'Il Minotauro',
          location: 'Via del Pellegrino 110, Rome',
          description: "A magical children's bookshop and toy store packed from floor to ceiling, and the first stop for a child's gift.",
          links: [
            { label: 'Facebook', href: 'https://www.facebook.com/IlMinotauroLibreria' },
            { label: 'Instagram', href: 'https://instagram.com/ilminotaurolibreria' },
          ],
        },
      ],
    },
    {
      heading: 'Rome Shopping: A Sunday Excursion',
      venues: [
        {
          name: 'Porta Portese Flea Market',
          location: 'Via Portuense 70, Rome',
          description: "Rome's famous flea market for vintage clothes, antiques, records, books and oddities.",
          note: 'It can be overwhelming at first, so some preparation beforehand is useful.',
          links: [
            { label: 'Website', href: 'https://www.turismoroma.it/en/places/porta-portese-market' },
            { label: 'Instagram', href: 'https://instagram.com/portaporteseroma' },
          ],
        },
      ],
    },
    {
      heading: "Rome's Independent Shops: Clothing and Ateliers",
      venues: [
        {
          name: 'Atelier Bomba',
          location: "Via dell'Oca 39, Rome",
          description: 'Operating since 1980, this family business is part boutique and part working atelier, with many garments still made and tailored on the premises in natural fabrics and small runs.',
          links: [
            { label: 'Website', href: 'https://atelierbomba.com' },
            { label: 'Instagram', href: 'https://instagram.com/atelierbomba' },
          ],
        },
        {
          name: 'De Clercq & Clercq',
          location: 'Via dei Prefetti 10, Rome',
          description: 'Two sisters design colourful clothing, knitwear and scarves in limited quantities, working with Irish linen, Egyptian cotton and cashmere.',
          links: [
            { label: 'Website', href: 'http://www.declercqdeclercq.com' },
            { label: 'Instagram', href: 'https://instagram.com/dianedeclercq2019' },
          ],
        },
        {
          name: 'Lou Lou',
          location: 'Via dei Banchi Vecchi 113, Rome',
          description: 'A concept store for independent designers, stocking clothing, shoes, bags and fragrances, with a slightly dark and unconventional aesthetic.',
          links: [
            { label: 'Website', href: 'https://www.loulouroma.com' },
            { label: 'Instagram', href: 'https://instagram.com/annalisaloulou' },
          ],
        },
        {
          name: 'Spazioespanso',
          location: 'Via Monterone 2a, Rome',
          description: "Among the best women's clothing shops in the city, with carefully selected slow fashion and independent designers, attractive fabrics and timeless style.",
          links: [
            { label: 'Facebook', href: 'https://www.facebook.com/spazioespanso' },
            { label: 'Instagram', href: 'https://instagram.com/spazioespanso' },
          ],
        },
        {
          name: 'Trame Paola Palopoli',
          location: 'Via Panisperna 55, Rome',
          description: 'More workshop than shop, this studio is run by Paola, who makes timeless clothing in fine fabrics, much of it made to order and fitted individually.',
          links: [
            { label: 'Website', href: 'https://trameatelier.com' },
            { label: 'Instagram', href: 'https://instagram.com/tramepaolapalopoli' },
          ],
        },
      ],
    },
    {
      heading: "Rome's Independent Shops: Established Roman Names",
      venues: [
        {
          name: 'Gallo',
          location: 'Rome (several locations)',
          description: 'Founded in 1927 and best known for bright socks, though its swimwear, clothing, pajamas and scarves are equally good.',
          links: [
            { label: 'Website', href: 'https://www.gallo1927.com' },
            { label: 'Instagram', href: 'https://instagram.com/gallo' },
          ],
        },
        {
          name: 'Gammarelli',
          location: 'Via di S. Chiara 34, Rome',
          description: 'Tailors to the Pope for generations; the colourful men\u2019s socks make an amusing and distinctly Roman souvenir.',
          links: [
            { label: 'Website', href: 'https://gammarelli.com' },
            { label: 'Instagram', href: 'https://instagram.com/gammarelli.sartoria' },
          ],
        },
        {
          name: 'Schostal',
          location: 'Via della Fontanella di Borghese 29, Rome',
          description: 'A Roman institution, known for classic pajamas that attract buyers from far afield.',
          links: [
            { label: 'Website', href: 'https://schostaloriginals.com' },
            { label: 'Instagram', href: 'https://instagram.com/schostalroma_official' },
          ],
        },
      ],
    },
    {
      heading: "Rome's Independent Shops: Footwear",
      venues: [
        {
          name: 'Domus',
          location: 'Via Belsiana 52, Rome',
          description: 'A traditional shoe shop officially recognised as a historic Roman store, selling very well-made leather shoes that are comfortable and durable.',
          links: [],
        },
        {
          name: 'Footwear Campo Marzio',
          location: 'Via di Campo Marzio 29-31, Rome',
          description: 'Two neighbouring comfort-shoe shops; the look is somewhat orthopedic, but the everyday shoes are good, particularly sandals and summer styles.',
          links: [{ label: 'Website', href: 'https://www.campomarziocalzature.it' }],
        },
      ],
    },
    {
      heading: "Rome's Independent Shops: Bags, Eyewear and Fragrance",
      venues: [
        {
          name: 'HB Roma',
          location: 'Via dei Due Macelli 12, Rome',
          description: 'A niche perfumery near the Spanish Steps, set in a historic room with frescoes and a coffered ceiling; many of the rare scents are unavailable elsewhere.',
          links: [
            { label: 'Website', href: 'https://www.hbroma.com' },
            { label: 'Instagram', href: 'https://instagram.com/hb_roma' },
          ],
        },
        {
          name: 'Mondelliani',
          location: 'Via dei Prefetti 11, Rome (plus other shops)',
          description:
            'A family-run eyewear shop trading since 1961, with attractive frames by independent designers; it feels more like a design store, and a small range of bags and accessories is also sold.',
          links: [
            { label: 'Website', href: 'https://mondelliani.com/en' },
            { label: 'Instagram', href: 'https://instagram.com/mondelliani' },
          ],
        },
        {
          name: 'Pas Vu',
          location: 'Via del Pellegrino 88, Rome',
          description: "A very small atelier near Campo de' Fiori where the owner makes every leather handbag by hand.",
          note: 'Custom orders are accepted.',
          links: [
            { label: 'Facebook', href: 'https://www.facebook.com/pasvuhandbags' },
            { label: 'Instagram', href: 'https://instagram.com/pasvu_bags' },
          ],
        },
      ],
    },
    {
      heading: "Rome's Independent Shops: Jewelry",
      venues: [
        {
          name: 'Eleuteri',
          location: 'Via dei Condotti 69, Rome',
          description: 'A family business since 1960 and a leading dealer in vintage and antique jewelry, best known for vintage Bulgari, with pieces by Cartier, Van Cleef & Arpels and others.',
          links: [
            { label: 'Website', href: 'https://www.eleuteri.nyc' },
            { label: 'Instagram', href: 'https://instagram.com/eleuteri' },
          ],
        },
        {
          name: 'Massimo Maria Melis',
          location: "Via dell'Orso 57, Rome",
          description:
            'Handmade gold jewelry inspired by ancient Greek, Etruscan and Roman designs, often set with old coins, cameos or Roman glass, and a long-standing favourite among locals.',
          links: [
            { label: 'Website', href: 'https://www.massimomariamelis.com/en/maximum-maria-melis-goldsmith-in-rome-eng' },
            { label: 'Instagram', href: 'https://instagram.com/massi.mariamelis' },
          ],
        },
      ],
    },
    {
      heading: 'Shopping for Food: Cheese, Cured Meats and Delicatessens',
      venues: [
        {
          name: 'Antica Caciara Trasteverina',
          location: 'Via di San Francesco a Ripa 140A/B, Rome',
          description:
            'The same family has run it since 1900, selling Pecorino Romano, fresh ricotta, guanciale and salumi; the owner, Roberto, has worked here since the age of thirteen.',
          links: [
            { label: 'Facebook', href: 'https://www.facebook.com/anticacaciaratrasteverina' },
            { label: 'Instagram', href: 'https://instagram.com/anticacaciaratrasteverina' },
          ],
        },
        {
          name: 'Antica Pizzicheria Ruggeri',
          location: "Campo de' Fiori 1/2, Rome",
          description: 'Established on the square in 1919, with counters of cheese, salumi and specialty foods.',
          note: 'Purchases can be vacuum-packed for travel.',
          links: [
            { label: 'Website', href: 'https://ruggericampodefiori.com' },
            { label: 'Instagram', href: 'https://instagram.com/ruggericampodefiori_' },
          ],
        },
        {
          name: 'Ercoli 1928',
          location: 'Via Montello 26, Rome (plus Trastevere and Parioli)',
          description: 'A deli, café and restaurant in one, suited to cheese, salumi and wine purchases as well as breakfast, lunch or aperitivo.',
          links: [
            { label: 'Website', href: 'https://ercoli1928.com' },
            { label: 'Instagram', href: 'https://instagram.com/ercoli1928' },
          ],
        },
        {
          name: 'Salumeria Roscioli',
          location: 'Via dei Giubbonari 21, Rome',
          description: 'Though renowned for its restaurant, the business began as a salumeria, and the shop remains its core: cheese, salumi, pantry goods and one of the largest wine selections in Rome.',
          links: [
            { label: 'Website', href: 'https://salumeriaroscioli.com/en' },
            { label: 'Instagram', href: 'https://instagram.com/rosciolisalumeria' },
          ],
        },
        {
          name: 'Salumeria Volpetti',
          location: 'Via Marmorata 47, Rome',
          description: 'A Testaccio landmark since 1973, offering outstanding cheese and salumi along with wine, bread, honey and preserves.',
          links: [
            { label: 'Website', href: 'https://www.volpetti.com' },
            { label: 'Instagram', href: 'https://instagram.com/volpettisalumeria' },
          ],
        },
        {
          name: 'La Tradizione',
          location: 'Via Cipro 8/E, Rome',
          description: 'A neighbourhood favourite near the Vatican for more than 40 years, stocking hundreds of cheeses and excellent salumi.',
          links: [
            { label: 'Website', href: 'https://latradizione.it/index.html' },
            { label: 'Instagram', href: 'https://instagram.com/latradizionesalsamenteriaroma' },
          ],
        },
      ],
    },
    {
      heading: 'Shopping for Food: Pantry Staples and General Stores',
      venues: [
        {
          name: 'Castroni',
          location: 'Via Cola di Rienzo 196/198, Rome (and elsewhere)',
          description: 'Open since 1932, this store sells coffee, tea, spices, pasta, biscuits, jams and foreign foods.',
          links: [
            { label: 'Website', href: 'https://www.castronicoladirienzo.com' },
            { label: 'Instagram', href: 'https://instagram.com/castronicoladirienzo' },
          ],
        },
        {
          name: 'Delizie',
          location: 'Via dei Banchi Vecchi 33/34, Rome',
          description: 'A tiny, carefully curated shop for olive oil, pasta, preserves and sweets; a strong choice for taralli, crackers and gifts for a dinner host.',
          links: [{ label: 'Website', href: 'https://www.deliziesnc.it/shop' }],
        },
        {
          name: 'Fratelli Innocenzi',
          location: 'Via Natale del Grande 31, Rome',
          description: 'A classic Trastevere grocery selling dry goods, chocolates and specialties from across the country.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/drogheria_innocenzi_dal_1884' }],
        },
        {
          name: 'Magnifico Food Store',
          location: 'Viale di Trastevere 84, Rome',
          description: 'A modern shop in Trastevere that sells only Italian products, well suited to assembling a mixed box of regional goods.',
          links: [
            { label: 'Website', href: 'https://www.magnificofood.it' },
            { label: 'Instagram', href: 'https://instagram.com/magnificofoodstore' },
          ],
        },
        {
          name: 'Pigna Enoteca di Sardegna',
          location: 'Via della Pigna 3/3A, Rome',
          description: 'A small shop near the Pantheon devoted to Sardinian wine and food, stocked with products from the island.',
          links: [],
        },
      ],
    },
    {
      heading: 'Shopping for Food: Olive Oil, Wine and Spirits',
      venues: [
        {
          name: 'Bernabei',
          location: 'Via di S. Francesco a Ripa 48, Rome',
          description: 'A Roman classic for wine, Champagne and spirits, stocked from floor to ceiling.',
          links: [
            { label: 'Website', href: 'https://www.bernabei.it' },
            { label: 'Instagram', href: 'https://instagram.com/bernabei.it' },
          ],
        },
        {
          name: "Oleoteca Sapord'olio",
          location: 'Via Po 84, Rome',
          description: 'A destination for olive oil enthusiasts, with extra virgin oils from across Italy available to taste and knowledgeable staff on hand.',
          links: [
            { label: 'Website', href: 'https://www.sapordolio.com' },
            { label: 'Instagram', href: 'https://instagram.com/sapord.olio' },
          ],
        },
      ],
    },
    {
      heading: 'Shopping for Food: Chocolate and Confectionery',
      venues: [
        {
          name: 'Moriondo & Gariglio',
          location: 'Via del Piè di Marmo 21/22, Rome',
          description: 'With roots in Turin and a past as supplier to the House of Savoy, this firm has made chocolate in Rome for generations.',
          note: 'In winter, the thick hot chocolate is recommended.',
          links: [],
        },
        {
          name: 'Pasticceria Valzani',
          location: 'Via del Moro 37A/B, Rome',
          description: 'Roman sweets have been made here for over a century, including pangiallo, panpepato, candied orange in chocolate and the chili-spiced Diavoletti.',
          links: [
            { label: 'Website', href: 'https://www.pasticceriavalzani.it' },
            { label: 'Instagram', href: 'https://instagram.com/pasticceria_valzani_trastevere' },
          ],
        },
      ],
    },
    {
      heading: "Rome's Food Markets, Stall by Stall",
      venues: [
        {
          name: 'Mercato Centrale',
          location: 'Via Giovanni Giolitti 36, Rome',
          description:
            'Closer to a food hall than a traditional market, this venue occupies space inside Termini Station; more than a dozen counters offer pizza, pasta, supplì and gelato, alongside empanadas, dumplings and burgers.',
          note: 'Hours: daily, 7:30am to 11:30pm.',
          links: [
            { label: 'Website', href: 'https://www.mercatocentrale.com/rome' },
            { label: 'Instagram', href: 'https://instagram.com/ilmercatocentraleroma' },
          ],
        },
        {
          name: 'Mercato di Campagna Amica del Circo Massimo',
          location: 'Via di San Teodoro 74, Rome',
          description: 'An excellent choice for a weekly shop, this farmers\u2019 market sells only produce from Lazio: vegetables, bread, meat, eggs, pasta and bottled tomato sauce.',
          note: 'Hours: Saturday and Sunday, 8am to 3pm.',
          links: [
            { label: 'Website', href: 'https://mercatocircomassimo.campagnamica.it' },
            { label: 'Instagram', href: 'https://instagram.com/campagna_amica_circomassimo' },
          ],
        },
        {
          name: "Mercato di Campo de' Fiori",
          location: "Piazza Campo de' Fiori, Rome",
          description: 'Once a local favourite, this market now caters largely to tourists, though a handful of historic stalls survive and the square remains pleasant for a stroll.',
          note: 'Hours: Monday to Saturday, 7am to 2pm.',
          links: [{ label: 'Website', href: 'https://www.turismoroma.it/it/luoghi/mercato-rionale-regola-i-campo-de-fiori' }],
        },
        {
          name: 'Mercato di Testaccio',
          location: 'Via Aldo Manuzio 66B, Rome',
          description:
            'Housed in a spacious covered hall opposite the former slaughterhouse, roughly one hundred stalls sell produce, cheese and meat, with many more serving quick meals; Mordi e Vai specialises in quinto quarto, while CasaManco sells seasonal pizza al taglio.',
          note: 'Hours: Monday to Saturday, 7am to 3:30pm.',
          links: [
            { label: 'Website', href: 'https://www.mercatoditestaccio.it' },
            { label: 'Instagram', href: 'https://instagram.com/mercatoditestaccio' },
          ],
        },
        {
          name: 'Mercato Nuovo Esquilino',
          location: 'Via Principe Amedeo 184, Rome',
          description:
            'Shoppers seeking less common ingredients will find fresh coriander, Chinese and African vegetables and an extensive spice selection, with prices among the lowest in Rome.',
          note: 'Hours: Monday to Saturday, 5am to 3pm, extended to 5pm on Tuesday, Friday and Saturday.',
          links: [{ label: 'Website', href: 'https://060608.comune.roma.it/shopping/mercati-e-mercatini/mercato-rionale-nuovo-esquilino-14284' }],
        },
        {
          name: 'Mercato Rionale Monti',
          location: 'Via Baccina 36, Rome',
          description:
            'This neighbourhood market has seen mixed fortunes across its 35 years; three stalls merit a visit at present: the butcher, Pippo Tortellino for fresh pasta and a daily lunch menu, and a porchetta stand.',
          note: 'Hours: Monday to Saturday, 7am to 2pm, until 7pm on Tuesday and Friday.',
          links: [{ label: 'Website', href: 'https://www.turismoroma.it/it/luoghi/mercato-rionale-monti' }],
        },
        {
          name: 'Mercato Trionfale',
          location: 'Via Andrea Doria 41, Rome',
          description: 'A large, high-quality market where visitors can easily spend hours; a small coffee bar at the centre is noted for its fresh and inventive tramezzini.',
          note: 'Hours: Monday to Saturday, 7am to 2pm.',
          links: [
            { label: 'Website', href: 'https://www.mercatotrionfale.store/en' },
            { label: 'Instagram', href: 'https://instagram.com/mercatotrionfaleroma' },
          ],
        },
      ],
    },
    {
      heading: 'Cold Treats in Rome: Granita',
      venues: [
        {
          name: 'Ciampini',
          location: 'Piazza di S. Lorenzo in Lucina 29, Rome',
          description: 'During a heatwave, the homemade iced tea topped with lemon granita is the order of choice.',
          links: [
            { label: 'Website', href: 'https://ciampini.com' },
            { label: 'Instagram', href: 'https://instagram.com/ciampini_roma' },
          ],
        },
        {
          name: 'I Dolci di Nonna Vincenza',
          location: "Via dell'Arco del Monte 98, Rome",
          description: "Close to Campo de' Fiori, it sells Sicilian granita in the classic almond and pistachio flavours, as well as cannoli and cassatine.",
          links: [
            { label: 'Website', href: 'https://dolcinonnavincenza.com/prodotti' },
            { label: 'Instagram', href: 'https://instagram.com/nonnavincenzaroma' },
          ],
        },
        {
          name: 'I Pupi Siciliani',
          location: 'Via Edoardo Jenner 57a, Monteverde, Rome',
          description: 'A Sicilian pastry shop in a residential neighbourhood, with excellent pistachio granita and cannoli filled to order.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/ipupi.siciliani' }],
        },
        {
          name: "Tazza d'Oro",
          location: 'Via degli Orfani 84, Rome',
          description: 'Near the Pantheon, this café serves the benchmark coffee granita, topped with a swirl of fresh whipped cream.',
          links: [{ label: 'Website', href: 'https://www.tazzadorocoffeeshop.com' }],
        },
      ],
    },
    {
      heading: 'Cold Treats in Rome: Grattachecca (Shaved Ice)',
      venues: [
        {
          name: "Alla Fonte d'Oro",
          location: 'Lungotevere Raffaello Sanzio, Trastevere, Rome',
          description: 'A family-run stand operating since 1913; the Lemoncocco, invented here, combines shaved ice, lemon juice, homemade coconut syrup and fruit.',
          links: [
            { label: 'Facebook', href: 'https://www.facebook.com/allafontedoro' },
            { label: 'Instagram', href: 'https://instagram.com/allafontedoro' },
          ],
        },
        {
          name: 'Chiosco Testaccio',
          location: 'Via Giovanni Branca 122, Rome',
          description: 'A kiosk run by a husband and wife, where the ice is shaved by hand to a fine texture that absorbs the syrup.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/chioscotestaccio' }],
        },
        {
          name: 'La Sora Maria',
          location: 'Via Trionfale 37, Rome',
          description: 'One of the oldest kiosks in Rome, open since 1933; the Golosona, with syrups, fresh fruit and coconut, is the one to get.',
          links: [
            { label: 'Website', href: 'https://lagrattacheccadellasoramaria.it' },
            { label: 'Instagram', href: 'https://instagram.com/lasoramaria' },
          ],
        },
      ],
    },
    {
      heading: 'Cold Treats in Rome: Cremolato',
      venues: [
        {
          name: 'La Casa del Cremolato',
          location: 'Via di Priscilla 18, near Villa Ada, Rome',
          description: 'Run by one family since 1966; blackberry, raspberry or melon cremolato is served at a table in a glass bowl with panna.',
          links: [
            { label: 'Website', href: 'https://www.lacasadelcremolato.com' },
            { label: 'Instagram', href: 'https://instagram.com/la_casa_del_cremolato' },
          ],
        },
      ],
    },
    {
      heading: "Rome's Best Scoops: Inventive Flavors",
      venues: [
        {
          name: 'Gelateria La Gourmandise',
          location: 'Via Felice Cavallotti 36b, Monteverde, Rome',
          description: 'A small grab-and-go shop whose flavours change through the year, such as saffron with crunchy walnuts, Passito zabaglione and honey mango.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/gelaterialagourmandise' }],
        },
        {
          name: 'Gelateria Torcè',
          location: 'Rome (several locations)',
          description: 'Regularly named among the best in Italy; flavours include salted peanut, black sesame and caramel, mulberry, chocolate with sea salt, and ricotta and coconut.',
          links: [
            { label: 'Website', href: 'https://gelateriatorce.it' },
            { label: 'Instagram', href: 'https://instagram.com/gelateria_torce' },
          ],
        },
        {
          name: 'Gunther',
          location: 'Rome (several locations)',
          description: 'Ingredient-led, with hazelnut and extra-dark chocolate the top choices, alongside seasonal flavours such as panettone or buffalo milk with pink pepper.',
          links: [
            { label: 'Website', href: 'https://www.gunthergelatoitaliano.com' },
            { label: 'Instagram', href: 'https://instagram.com/gunthergelatoroma' },
          ],
        },
        {
          name: 'Otaleg',
          location: 'Via di S. Cosimato 14a, Trastevere, Rome (also Monteverde near Villa Pamphili)',
          description: 'Seasonal and inventive, with a fast-moving line; suggested combinations are ricotta, cinnamon and blackberry, or yogurt, hazelnut and orange.',
          links: [
            { label: 'Website', href: 'https://www.otaleg.com' },
            { label: 'Instagram', href: 'https://instagram.com/otaleg.radicioni' },
          ],
        },
      ],
    },
    {
      heading: "Rome's Best Scoops: Classics Done Well",
      venues: [
        {
          name: 'Bar Gelateria Alberto Pica',
          location: 'Via della Seggiola 12, Rome',
          description: 'Old-fashioned and serving residents since the 1970s, with nothing trendy; rice, or wild strawberry when available, are the flavours to choose.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/bar.pica' }],
        },
        {
          name: 'Gelateria dei Gracchi',
          location: 'Rome (several locations)',
          description: 'A childhood favourite from the original shop in Prati, with traditional flavours sometimes given a twist: strawberry grape, pistachio, peach and always the rice and honey.',
          links: [
            { label: 'Website', href: 'https://gelateriadeigracchi.it' },
            { label: 'Instagram', href: 'https://instagram.com/gelateriadeigracchi' },
          ],
        },
        {
          name: "Gelateria dell'Angeletto",
          location: "Via dell'Angeletto 15, Monti, Rome",
          description: 'A small selection, all made in-house from natural ingredients, including unusual flavours such as ginger or lemon and basil, with vegan and lactose-free options clearly marked.',
          links: [
            { label: 'Website', href: 'https://gelateriadellangeletto.com' },
            { label: 'Instagram', href: 'https://instagram.com/gelateriadellangeletto' },
          ],
        },
        {
          name: 'Gelateria Fiordiluna',
          location: 'Via della Lungaretta 96, Trastevere, Rome',
          description: 'Suited to the basics of strawberry, hazelnut and pistachio, full of flavour without being too rich or sweet, with excellent fruit sorbets.',
          links: [{ label: 'Website', href: 'https://fiordiluna.com' }],
        },
      ],
    },
    {
      heading: "Rome's Best Scoops: Fruit and Plant-Based",
      venues: [
        {
          name: 'Gelateria Fatamorgana',
          location: 'Rome (several locations)',
          description: 'The watermelon, pineapple and passion fruit sorbets are intensely fruity and refreshing, with a wide choice of chocolate too.',
          links: [
            { label: 'Website', href: 'https://www.gelateriafatamorgana.com/web/index.php' },
            { label: 'Instagram', href: 'https://instagram.com/gelateriafatamorgana' },
          ],
        },
        {
          name: 'Grezzo Raw Chocolate',
          location: 'Rome (several locations)',
          description: 'Entirely plant-based, with no dairy, gluten or refined sugar, yet creamy; raw chocolate bars, handmade chocolates from organic cacao and raw desserts are also sold.',
          links: [
            { label: 'Website', href: 'https://grezzorawchocolate.com' },
            { label: 'Instagram', href: 'https://instagram.com/grezzorawchocolate' },
          ],
        },
      ],
    },
    {
      heading: 'Seven Pizzerias in Rome',
      venues: [
        {
          name: 'A Rota',
          location: 'Via di Tor Pignattara 190, Rome',
          description: "Crunchy bases and seasonal, sometimes surprising toppings such as smoked ricotta, roasted pumpkin or 'nduja.",
          links: [{ label: 'Instagram', href: 'https://instagram.com/arotapizzeria' }],
        },
        {
          name: 'Alle Carrette',
          location: 'Via della Madonna dei Monti 95, Rome',
          description: 'Steps from the Colosseum and a dependable pizzeria since the 1980s, a fine place to land after the Forum.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/allecarrette1984' }],
        },
        {
          name: "L'Elementare",
          location: 'Trastevere, Testaccio and others, Rome',
          description: 'A modern newcomer with flawless dough, good for groups and with solid cocktails.',
          note: 'Reservations are a must.',
          links: [
            { label: 'Website', href: 'https://www.pizzerialelementare.it' },
            { label: 'Instagram', href: 'https://instagram.com/pizzerialelementare' },
          ],
        },
        {
          name: 'Emma',
          location: 'Via del Monte della Farina 28, Rome',
          description: 'Sleek and elegant, suited to a more refined sit-down pizza, with light dough, top-quality ingredients and a large wine list.',
          note: 'Booking ahead is advised.',
          links: [
            { label: 'Website', href: 'https://emmapizzeria.com' },
            { label: 'Instagram', href: 'https://instagram.com/emma_pizzeria_restaurant' },
          ],
        },
        {
          name: 'Ivo a Trastevere',
          location: 'Via di S. Francesco a Ripa 158, Rome',
          description: 'A Trastevere institution with a paper-thin, charred crust and a loud, chaotic atmosphere in a good way; the fried starters are the thing to order.',
          links: [
            { label: 'Website', href: 'https://ivoatrastevere.it' },
            { label: 'Instagram', href: 'https://instagram.com/ivoatrastevereroma' },
          ],
        },
        {
          name: 'Pizzeria Ostiense',
          location: 'Via Ostiense 56, Rome',
          description: 'A no-frills local favourite: affordable, pleasantly crunchy and relaxed.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/pizzeriaostiense' }],
        },
        {
          name: 'San Martino - Pizza & Bolle',
          location: 'Lungotevere di Pietra Papa 201, Rome',
          description: 'Stylish and laid-back, off the beaten path, with crisp pizzas, inventive toppings and bubbly wine; the anchovy-packed Super Mary is the one to try.',
          links: [
            { label: 'Website', href: 'https://menusanmartino.pizzaebolle.it' },
            { label: 'Instagram', href: 'https://instagram.com/_san_martino' },
          ],
        },
      ],
    },
    {
      heading: 'Near the Vatican: Restaurants',
      venues: [
        {
          name: 'Antico Falcone',
          location: 'Via Trionfale 60, Rome',
          description: 'Traditional and away from the tourist track; the carbonara is good, and rigatoni alla pajata is an option for the daring.',
          note: 'The Thursday gnocchi should not be missed. Outdoor tables should be reserved in good weather.',
          links: [{ label: 'Website', href: 'http://www.anticofalcone.it' }],
        },
        {
          name: 'Chorus Café',
          location: 'Via della Conciliazione 4, Rome',
          description:
            'Open evenings only, upstairs in the Auditorium della Conciliazione, with high ceilings, marble and low light setting the scene for some of the best cocktails in Rome.',
          links: [
            { label: 'Website', href: 'https://choruscafe.it' },
            { label: 'Instagram', href: 'https://instagram.com/choruscaferome' },
          ],
        },
        {
          name: 'Ristorante Arlù',
          location: 'Borgo Pio 135, Rome',
          description: "Run by one family since 1959 on the cobbled Borgo Pio, steps from St. Peter's, with a small dining room, outdoor tables in warm weather and Roman classics.",
          links: [
            { label: 'Website', href: 'https://www.ristorantearlu.it/en' },
            { label: 'Instagram', href: 'https://instagram.com/ristorantearlu' },
          ],
        },
        {
          name: 'La Soffitta Renovatio',
          location: 'Piazza del Risorgimento 46/a, Rome',
          description: 'A useful address for gluten-free diners, run by the third generation, casual and a member of the Italian Celiacs Association.',
          links: [
            { label: 'Website', href: 'https://lasoffittarenovatio.com/en' },
            { label: 'Instagram', href: 'https://instagram.com/lasoffittarenovatio' },
          ],
        },
        {
          name: 'Sorpasso',
          location: 'Via Properzio 31/33, Rome',
          description: 'A bit of everything: a morning coffee bar, a prosciutto and cheese counter, a cocktail bar and a skylit, shabby-chic dining room, with a seasonal daily menu.',
          links: [{ label: 'Website', href: 'https://sorpasso.info/index.html' }],
        },
        {
          name: 'La Zanzara',
          location: 'Via Crescenzio 84, Rome',
          description: 'A bistro with white tiled walls, busy at lunch and aperitivo and open all day; a good burger is available for a break from pasta.',
          links: [
            { label: 'Website', href: 'https://www.lazanzararoma.com' },
            { label: 'Instagram', href: 'https://instagram.com/lazanzararoma' },
          ],
        },
      ],
    },
    {
      heading: 'Near the Vatican: Cafés and Quick Bites',
      venues: [
        {
          name: 'Bonci Pizzarium',
          location: 'Via della Meloria 43, Rome',
          description: 'Widely regarded as the best pizza al taglio in Rome, made by Gabriele Bonci and recently renovated and expanded.',
          note: 'Lines are long at lunch, so going early or late is advised.',
          links: [
            { label: 'Website', href: 'https://bonci.it' },
            { label: 'Instagram', href: 'https://instagram.com/bonci_gabriele' },
          ],
        },
        {
          name: 'Gabrini',
          location: 'Via Cola di Rienzo 200, Rome',
          description: 'A modern tavola calda from the next generation of the Castroni family; customers point to what they want and receive a plate.',
          links: [
            { label: 'Website', href: 'https://www.gabrini.it' },
            { label: 'Instagram', href: 'https://instagram.com/gabrinicoladirienzo' },
          ],
        },
        {
          name: 'Hedera',
          location: 'Borgo Pio 179, Rome',
          description: "A small gelateria in an ivy-covered building, with traditional flavours made from organic farms' produce.",
          links: [
            { label: 'Website', href: 'https://www.hederaroma.it/index_en.html' },
            { label: 'Instagram', href: 'https://instagram.com/hederaroma' },
          ],
        },
        {
          name: 'Sciascia Caffè 1919',
          location: 'Via Fabio Massimo 80/a, Rome',
          description: 'A retro café in Prati since 1919, known for espresso with melted dark chocolate.',
          links: [
            { label: 'Website', href: 'https://www.sciasciacaffe1919.it' },
            { label: 'Instagram', href: 'https://instagram.com/sciasciacaffe1919' },
          ],
        },
      ],
    },
    {
      heading: 'Eating in Rome, Neighbourhood by Neighbourhood',
      venues: [
        {
          name: 'La Matriciana dal 1870',
          location: 'Via del Viminale 44, Esquilino, Rome',
          description: 'A step back in time; the menu offers amatriciana and seafood, with porcini and truffles in season, and a recommended poached pear with chocolate.',
          links: [{ label: 'Website', href: 'http://www.lamatriciana.it' }],
        },
        {
          name: 'Al Pompiere',
          location: 'Piazza delle Cinque Scole 28, Jewish Ghetto, Rome',
          description: 'One of the last traditional restaurants not geared to tourists; in season it serves carciofo alla giudia and puntarelle, along with tagliolini al limone.',
          links: [{ label: 'Website', href: 'http://alpompiereroma.com' }],
        },
        {
          name: 'Taverna dei Fori Imperiali',
          location: 'Via della Madonna dei Monti, Monti, Rome',
          description: 'A cozy, family-run restaurant behind the Roman Forum, covering traditional dishes, seasonal specials and creative variations.',
          links: [{ label: 'Website', href: 'https://latavernadeiforiimperiali.com' }],
        },
        {
          name: 'Trattoria Pennestri',
          location: 'Via Giovanni da Empoli 5, Ostiense, Rome',
          description: 'Located next to Testaccio, serving some of the best food in the city, mixing classics with unusual dishes such as rigatoni alla pajata with colatura di alici.',
          links: [{ label: 'Website', href: 'http://www.trattoriapennestri.it' }],
        },
        {
          name: 'Trecca',
          location: 'Via Alessandro Severo 220, Rome',
          description: 'An authentic residential Roman experience; this new-wave trattoria serves classics, offal cuts and high-quality seasonal ingredients, with a long natural wine list.',
          note: 'Booking ahead is advised.',
          links: [{ label: 'Bookings', href: 'http://trecca.superbexperience.com' }],
        },
        {
          name: 'Piatto Romano',
          location: 'Via Bodoni 19-53, Testaccio, Rome',
          description: 'A lesson in Roman cooking history, with seasonal vegetables, offal and old dishes such as minestra di broccoli e arzilla.',
          links: [{ label: 'Website', href: 'http://piattoromano.com' }],
        },
        {
          name: 'Checco Er Carettiere',
          location: 'Via Benedetta 10, Trastevere, Rome',
          description:
            'An old-fashioned restaurant serving Roman food since 1935, now run by third-generation owner Stefania; the menu features carbonara, stuffed zucchini flowers and, in season, artichokes alla romana.',
          links: [
            { label: 'Website', href: 'https://www.checcoercarettiere.it/en/checco-er-carettiere' },
            { label: 'Instagram', href: 'https://instagram.com/checcoercarettiere' },
          ],
        },
        {
          name: 'Baccano',
          location: 'Via delle Muratte 23, Trevi, Rome',
          description:
            'An alternative to the checkered-tablecloth restaurants: a bistro in the style of New York or Paris serving some of the best carbonara in Rome, made by chef Nabil Hadj Hassen.',
          links: [{ label: 'Website', href: 'http://baccanoroma.com' }],
        },
        {
          name: 'Il Localino',
          location: 'Via Lazio 22, Villa Borghese, Rome',
          description: 'A rare good option in an area of hotels and offices, loved by locals and set on a small street, with very fresh seafood and a blackboard menu that changes daily.',
          links: [{ label: 'Website', href: 'https://osteriaillocalino.it/' }],
        },
      ],
    },
    {
      heading: 'More Addresses: Restaurants and Trattorie',
      venues: [
        {
          name: 'Armando al Pantheon',
          location: "Salita de' Crescenzi 31, Rome",
          description: 'Family-run Roman trattoria beside the Pantheon, serving the classic repertoire.',
          note: 'Reservations open about a month ahead and fill quickly.',
          links: [{ label: 'Website', href: 'https://armandoalpantheon.it/' }],
        },
        {
          name: "C'è Pasta…e Pasta",
          location: 'Via Ettore Rolli 29/35, Rome',
          description: 'Self-service canteen specialising in Roman-Jewish dishes at modest prices.',
          links: [{ label: 'Website', href: 'https://cepastaepasta.it/' }],
        },
        {
          name: 'Casalino',
          location: "Via del portico d'Ottavia 1e, Rome",
          description: 'Kosher osteria in the Jewish Ghetto, offering fried specialties and pasta.',
          links: [{ label: 'Website', href: 'https://casalinoosteriakosher.it/' }],
        },
        {
          name: "Hosteria Grappolo d'Oro",
          location: 'Piazza della Cancelleria 80, Rome',
          description: "Traditional Roman cooking in the historic centre, a reliable choice for pasta and classic mains near Campo de' Fiori.",
          links: [{ label: 'Website', href: 'https://hosteriagrappolodoro.it/' }],
        },
        {
          name: 'Santo Palato',
          location: 'Via Gallia 28, Rome',
          description: 'Modern trattoria that reworks Roman staples, with particular attention to offal and pasta.',
          links: [{ label: 'Website', href: 'https://www.santopalatoroma.it/' }],
        },
        {
          name: 'Tavernaccia da Bruno',
          location: 'Via Giovanni da Castel Bolognese 63, Rome',
          description: 'Inexpensive, generous cooking from Rome, Umbria and Sardinia, with pizza on the menu as well.',
          links: [{ label: 'Website', href: 'https://www.latavernacciaroma.com/' }],
        },
      ],
    },
    {
      heading: 'More Addresses: Coffee, Pastry and Gelato',
      venues: [
        {
          name: 'Antico Forno Roscioli',
          location: 'Via dei Chiavari 34, Rome',
          description: 'Long-established bakery in the centre of Rome for pizza bianca, pizza rossa and pastries.',
          links: [{ label: 'Website', href: 'https://anticofornoroscioli.it/' }],
        },
        {
          name: 'Faro Caffè',
          location: 'Via Piave 55, Rome',
          description: 'Specialty coffee roastery and café with carefully sourced beans and filter brewing.',
          links: [{ label: 'Website', href: 'https://farorome.com/' }],
        },
        {
          name: 'Gelateria Gori',
          location: 'Rome',
          description: 'Gelato shop known for ice cream made with seasonal ingredients and a changing flavour list.',
          links: [{ label: 'Website', href: 'https://www.gorigelato.it/' }],
        },
        {
          name: 'Neve di Latte',
          location: 'Rome',
          description: 'Artisanal gelateria making ice cream from carefully selected ingredients, with several branches in Rome.',
          links: [{ label: 'Website', href: 'https://www.nevedilatte.it/' }],
        },
        {
          name: 'Panificio Bonci',
          location: 'Rome',
          description: 'Bakery and pizza al taglio shop from baker Gabriele Bonci, selling pizza bianca, pizza rossa and bread by weight.',
          links: [{ label: 'Website', href: 'https://bonci.it/' }],
        },
        {
          name: 'Pasticceria Regoli',
          location: 'Rome',
          description: 'Century-old pastry shop in Rome, known for traditional Roman pastries.',
          links: [{ label: 'Website', href: 'https://www.pasticceriaregoli.com/' }],
        },
        {
          name: 'Roscioli Caffè',
          location: 'Rome',
          description: 'Coffee bar and pastry counter turning out traditional Roman baking and a well-regarded espresso.',
          links: [{ label: 'Website', href: 'https://www.rosciolicaffe.com/' }],
        },
      ],
    },
    {
      heading: 'More Addresses: Wine, Beer and Cocktails',
      venues: [
        {
          name: 'Beppe e i Suoi Formaggi',
          location: 'Via Gallia 22/24, Rome',
          description: "Cheese shop and wine bar in Rome's Trieste district, serving cheese plates alongside a short wine list.",
          links: [{ label: 'Website', href: 'https://beppeeisuoiformaggi.it/' }],
        },
        {
          name: 'Enoteca Bulzoni',
          location: 'Rome',
          description: 'Wine bar and shop in Rome.',
          links: [{ label: 'Website', href: 'https://www.enotecabulzoni.it/' }],
        },
        {
          name: 'Ma Che Siete Venuti a Fà',
          location: 'Rome',
          description: 'Small, long-running pub in Trastevere devoted to Italian and European craft beer.',
          links: [{ label: 'Website', href: 'https://football-pub.com/' }],
        },
        {
          name: 'La Mescita',
          location: 'Rome',
          description: 'Neighbourhood wine bar in Trastevere pouring by the glass, with Italian wines and simple plates.',
          links: [{ label: 'Website', href: 'https://www.enotecalamescita.it/' }],
        },
        {
          name: 'Open Baladin',
          location: 'Via degli Specchi 6, Rome',
          description: 'Craft beer pub near Largo Argentina with a long tap and bottle list and a full kitchen.',
          links: [{ label: 'Website', href: 'https://pubs.baladin.it/en/restaurant-craft-beer-hamburger/via-degli-specchi-6-roma/' }],
        },
      ],
    },
  ],
}
