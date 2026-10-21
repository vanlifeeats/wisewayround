import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'italy-campania-and-the-bay-of-naples',
  name: 'Campania and the Bay of Naples',
  tagline: 'Pizza in Naples, the Amalfi Coast table and Procida.',
  intro: [
    'Naples itself is worth treating as a pizza-first destination, with everything else — delis, old-school osterias and a champagne surprise — fitted in around it, before heading out to the Amalfi Coast, Cetara, Praiano and Procida for seafood, and inland to Cilento and Irpinia for farms and wine.',
  ],
  sections: [
    {
      heading: 'Naples: Pizza',
      venues: [
        {
          name: '50 Kalò',
          location: 'Piazza Sannazaro 201/c, Mergellina, Naples',
          description: "More modern and popular with the city's upper crust; the name means good dough, made with low-protein flour for easier digestion.",
          links: [
            { label: 'Website', href: 'https://www.50kalo.it/' },
            { label: 'Instagram', href: 'https://instagram.com/50kalo' },
            { label: 'Facebook', href: 'https://www.facebook.com/50Kalo' },
          ],
        },
        {
          name: 'Da Attilio',
          location: 'Via Pignasecca 17, Naples',
          description: "A cozy, family-run pizzeria in the Pignasecca market, with no frills, famous for Pizza Carnevale, a star-shaped pie with a ricotta-filled crust.",
          links: [
            { label: 'Website', href: 'https://www.pizzeriadattilio.it/' },
            { label: 'Instagram', href: 'https://instagram.com/pizzeriadaattilio' },
            { label: 'Facebook', href: 'https://www.facebook.com/pizzeriadaattilio' },
          ],
        },
        {
          name: 'Concettina ai Tre Santi',
          location: 'Via Arena della Sanità 7 Bis, Naples',
          description: 'Located in Rione Sanità and offering more than pizza, with owner Ciro often greeting guests; one of few places with a pizza tasting menu paired with wine.',
          links: [
            { label: 'Website', href: 'https://www.concettinaaitresanti.com/' },
            { label: 'Instagram', href: 'https://instagram.com/concettina3santi' },
            { label: 'Facebook', href: 'https://www.facebook.com/PizzeriaDaConcettinaAiTreSanti' },
          ],
        },
        {
          name: 'La Figlia del Presidente',
          location: 'Via del Grande Archivio 24, Naples',
          description:
            'Known mostly to locals and run by Maria Cacialli, daughter of the founder of Pizzeria del Presidente, with a warm atmosphere and excellent pizza; frittatine di pasta make a good start.',
          links: [
            { label: 'Website', href: 'https://figliadelpresidente.com/' },
            { label: 'Instagram', href: 'https://instagram.com/lafigliadelpresidente_official' },
            { label: 'Facebook', href: 'https://www.facebook.com/lafigliadelpresidente' },
          ],
        },
        {
          name: 'Isabella De Cham',
          location: 'Via Arena della Sanità 27, Naples',
          description: 'Famous for pizza fritta and an almost all-female kitchen, with creative flours and toppings.',
          links: [
            { label: 'Website', href: 'https://isabelladecham.com/' },
            { label: 'Instagram', href: 'https://instagram.com/isabelladechampizzafritta' },
          ],
        },
        {
          name: 'Pizzaria La Notizia',
          location: 'Via Caravaggio 53, Naples',
          description: 'In a residential area, so a taxi is advisable; many Neapolitans consider it the best pizza in Naples.',
          links: [
            { label: 'Website', href: 'https://www.pizzarialanotizia.com/' },
            { label: 'Instagram', href: 'https://instagram.com/enzococcia_lanotizia' },
            { label: 'Facebook', href: 'https://www.facebook.com/enzococcia.Lanotizia' },
          ],
        },
        {
          name: 'Sorbillo',
          location: 'Via dei Tribunali 32, Naples',
          description: 'One of the best-known pizzerias, with long lines; the pizza is excellent, but visitors short on time may prefer to skip the wait.',
          links: [
            { label: 'Website', href: 'https://www.sorbillo.it/' },
            { label: 'Instagram', href: 'https://instagram.com/sorbillo' },
            { label: 'Facebook', href: 'https://www.facebook.com/PizzeriaGinoSorbillo' },
          ],
        },
      ],
    },
    {
      heading: 'Naples: Beyond Pizza',
      venues: [
        {
          name: 'Antica Salumeria Malinconico',
          location: 'Corso Vittorio Emanuele 453, Naples',
          description: 'A family deli known for sandwiches, a local favourite since 1890.',
          links: [{ label: 'Instagram', href: 'https://instagram.com/salumeria_malinconico' }],
        },
        {
          name: 'Mimì alla Ferrovia',
          location: "Via Alfonso D'Aragona 19/21, Naples",
          description: 'A city institution near the train station, serving comforting traditional dishes.',
          links: [
            { label: 'Website', href: 'https://www.mimiallaferrovia.it/' },
            { label: 'Instagram', href: 'https://instagram.com/mimiallaferrovia' },
            { label: 'Facebook', href: 'https://www.facebook.com/mimiallaferrovia' },
          ],
        },
        {
          name: 'Osteria della Mattonella',
          location: 'Via Giovanni Nicotera 13, Naples',
          description: 'Traditional Neapolitan cooking between the Quartieri Spagnoli and Monte di Dio; its pasta, potatoes and provola rank among the best in the city.',
          links: [
            { label: 'Website', href: 'https://www.osteriadellamattonella.com/' },
            { label: 'Instagram', href: 'https://instagram.com/osteriadellamattonella' },
            { label: 'Facebook', href: 'https://www.facebook.com/100058858073072' },
          ],
        },
        {
          name: 'Salvatore Cautero Champagne',
          location: 'Via Salvator Rosa 297, Naples',
          description: 'A surprising but excellent champagne stop, with small bites from local producers.',
          links: [
            { label: 'Instagram', href: 'https://instagram.com/le_charcutier_salvatorecautero' },
            { label: 'Facebook', href: 'https://www.facebook.com/salvatore.cautero' },
          ],
        },
      ],
    },
    {
      heading: 'More Addresses: Restaurants and Trattorie',
      venues: [
        {
          name: 'Acquapazza',
          location: 'Corso Garibaldi 36, Cetara',
          description: 'Seafood restaurant in the fishing village of Cetara, known for anchovies and fresh fish.',
          links: [{ label: 'Website', href: 'https://www.acquapazza.it/' }],
        },
        {
          name: 'Da Armandino',
          location: 'Via Marina di Praia - Praiano 840, Praiano',
          description: 'Seafood restaurant on the Praiano waterfront, serving the day\u2019s catch.',
          links: [{ label: 'Website', href: 'https://www.daarmandino.it/' }],
        },
        {
          name: 'La Conchiglia',
          location: 'Procida',
          description: 'Seafood restaurant on Procida, a short distance above the harbour.',
          links: [{ label: 'Website', href: 'https://www.laconchigliaprocida.it/home/' }],
        },
        {
          name: 'I Decumani',
          location: 'Corso Umberto I 191, Naples',
          description: 'Pizzeria and fritti counter on Via dei Tribunali, open on Sundays when many others are closed.',
          links: [{ label: 'Website', href: 'https://www.idecumani.com/it/' }],
        },
        {
          name: 'Mimì Pizzeria',
          location: 'Ravello',
          description: "Pizzeria in Ravello, a practical stop after visiting the town's gardens and villas.",
          links: [{ label: 'Website', href: 'https://www.mimiravello.it/' }],
        },
        {
          name: 'Osteria Donna Teresa',
          location: 'Naples',
          description: 'Small Neapolitan osteria serving home-style dishes.',
          links: [{ label: 'Website', href: 'https://osteriadonnateresa.eatbu.com/?lang=it' }],
        },
        {
          name: 'Osteria Reale',
          location: 'Tramonti',
          description: 'Agriturismo and winery in the hills of Tramonti, serving the inland cooking of the Amalfi Coast.',
          links: [{ label: 'Website', href: 'https://realexperienceamalficoast.it/home/' }],
        },
        {
          name: 'Persika',
          location: 'Naples',
          description: 'Contemporary restaurant built around Campanian produce.',
          links: [{ label: 'Website', href: 'https://persika.it/' }],
        },
        {
          name: 'Lo Stuzzichino',
          location: "Via Deserto 1, Sant'Agata sui Due Golfi",
          description: 'Long-established restaurant in the hills above Sorrento, serving local dishes and pizza.',
          links: [{ label: 'Website', href: 'https://www.ristorantelostuzzichino.it/' }],
        },
        {
          name: 'Taverna del Leone',
          location: 'Via Laurito 43, Positano',
          description: 'Restaurant above Positano serving local and creative dishes in a ceramic-decorated dining room.',
          links: [{ label: 'Website', href: 'https://latavernadelleone.com/' }],
        },
      ],
    },
    {
      heading: 'More Addresses: Coffee, Pastry and Gelato',
      venues: [
        {
          name: 'Caffè Gambrinus',
          location: 'Naples',
          description: 'Grand historic café on Piazza Trieste e Trento, with pastries and coffee in a Belle Époque setting.',
          links: [{ label: 'Website', href: 'https://grancaffegambrinus.com/' }],
        },
      ],
    },
    {
      heading: 'More Addresses: Food Shops, Producers and Markets',
      venues: [
        {
          name: 'Cantine Marisa Cuomo',
          location: 'Via G.B. Lama 16/18, Furore',
          description: "Winery cut into the cliffs at Furore, producing white and red wines of the Costa d'Amalfi.",
          links: [{ label: 'Website', href: 'https://www.marisacuomo.com/' }],
        },
        {
          name: 'Ceramica Solimene',
          location: 'Via Madonna degli Angeli 7, Vietri sul Mare',
          description: 'Ceramics workshop and shop in Vietri sul Mare, the traditional centre of Amalfi Coast pottery.',
          links: [{ label: 'Website', href: 'https://www.ceramicasolimene.it/' }],
        },
      ],
    },
    {
      heading: 'Cilento and Irpinia',
      venues: [
        {
          name: 'Alici di Menaica',
          location: 'Cilento',
          description: 'Producer and retailer of anchovy and other fish products.',
          links: [{ label: 'Website', href: 'https://www.alicidimenaica.it/home/' }],
        },
        {
          name: 'Angiolina Pisciotta',
          location: 'Via Passariello 2, Pisciotta',
          description: 'Restaurant in Pisciotta.',
          links: [{ label: 'Website', href: 'https://www.ristoranteangiolina.it/' }],
        },
        {
          name: 'Tenuta Vannulo',
          location: 'Via Galileo Galilei 101, Contrada Vannulo, Capaccio Paestum',
          description: 'Farm and dairy business in Capaccio Paestum, with tasting and retail facilities.',
          links: [{ label: 'Website', href: 'https://www.tenutavannulo.com/' }],
        },
        {
          name: 'Regio Tratturo',
          location: 'Irpinia',
          description: 'Farm offering food and accommodation.',
          links: [{ label: 'Website', href: 'https://www.regiotratturo.it/en/home-en/' }],
        },
        {
          name: 'The Authentic Irpinia',
          location: 'Irpinia',
          description: 'Operator of wine and culinary experiences in Irpinia.',
          links: [{ label: 'Website', href: 'https://www.theauthenticirpinia.com/' }],
        },
      ],
    },
  ],
}
