import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'italy-lakes-and-beaches',
  name: 'Lakes and Beaches',
  tagline: 'Day-trip lakes near Rome and ten beaches worth the journey.',
  intro: [
    'This chapter steps away from restaurant directories to cover ten beaches across the country worth a special trip, plus five lakes close enough to Rome for a day out, each with its own suggested accommodation or practical travel notes.',
  ],
  sections: [
    {
      heading: 'Ten Beaches Worth the Trip',
      venues: [
        {
          name: 'La Feniglia',
          location: 'Monte Argentario, Tuscany',
          description:
            'A long sandy strip with a lagoon on one side and open sea on the other, spacious and uncrowded; bicycles can be hired for rides through the pine forest behind the beach.',
          note: 'Suggested accommodation: La Roqqa, a boutique hotel overlooking the harbour at Porto Ercole.',
          links: [{ label: 'Website', href: 'https://www.laroqqa.com/it' }],
        },
        {
          name: 'Mondello',
          location: 'Palermo, Sicily',
          description: "Palermo's own beach lies a short drive from the centre, with golden sand, bright umbrellas and lively beach clubs, busy at weekends.",
          note: 'Suggested accommodation: Grand Hotel et Des Palmes in Palermo, or Domìa Boutique Hotel in Mondello.',
          links: [{ label: 'Website', href: 'https://despalmes.mangias.com/it' }],
        },
        {
          name: 'Palinuro',
          location: 'Cilento Coast, Campania',
          description:
            'A relaxed and scenic stretch of the Cilento Coast, about two hours south of Naples, with long sandy beaches, sea caves and green hills; the Greek temples at Paestum, a UNESCO World Heritage site, lie nearby.',
          links: [{ label: 'Website', href: 'https://www.italia.it/en/campania/salerno/palinuro' }],
        },
        {
          name: 'Rena Bianca',
          location: 'Santa Teresa Gallura, Sardinia',
          description:
            'Fine white sand flecked with pink from fragments of coral, with shallow, clear water suited to families and snorkelling; bars, umbrellas and parking are available.',
          note: "Suggested accommodation: Mangia's Santa Teresa, a recently renovated five-star resort.",
          links: [{ label: 'Website', href: 'https://www.hilton.com/en/hotels/olbccqq-mangias-santa-teresa-sardinia' }],
        },
        {
          name: 'Riviera del Conero',
          location: 'Le Marche',
          description:
            'The Adriatic coast here features wooded cliffs, secluded bays, bright water and small, unspoiled beaches, somewhat rustic and strikingly beautiful.',
          note: 'Suggested accommodation: Locanda Rocco da Francesco, a cozy hotel in a historic building in Sirolo.',
          links: [{ label: 'Website', href: 'https://www.locandarocco.it' }],
        },
        {
          name: 'Santa Marinella',
          location: 'Lazio',
          description:
            'Located only an hour north of Rome by train or car, suiting a city break without time for a full seaside holiday; the water is very clean and the atmosphere unhurried.',
          note: 'Popular with families from the area, so umbrellas and chairs should be reserved in advance at a stabilimento.',
          links: [{ label: 'Website', href: 'https://comune.santamarinella.rm.it/' }],
        },
        {
          name: 'Sperlonga',
          location: 'Lazio',
          description:
            'A little-known gem of whitewashed houses and an attractive old town directly behind the beach, with crystal-clear water; fills with families from Rome and Naples in July and August.',
          note: 'Suggested accommodation: Casolare Country House, a family-run property set in a citrus grove.',
          links: [{ label: 'Website', href: 'https://casolaresperlonga.com' }],
        },
        {
          name: "Torre dell'Orso",
          location: 'Puglia',
          description: 'Golden sand, steep cliffs and water shading from pale turquoise to deep blue; well known but retains a relaxed feel with sufficient facilities.',
          note: 'Suggested accommodation: Posia Retreat and Spa, which provides quiet luxury and sea views.',
          links: [{ label: 'Website', href: 'https://posia.it/it' }],
        },
        {
          name: 'Tropea',
          location: 'Calabria',
          description:
            "Close to the toe of Italy's boot, a cliffside town with a church above the sea and a sandy beach framed by rocks; local specialties include the sweet red onion and tartufo calabrese, a chocolate and hazelnut gelato with a molten centre.",
          links: [{ label: 'Website', href: 'https://www.italia.it/en/calabria/things-to-do/tropea' }],
        },
      ],
    },
    {
      heading: 'Five Lakes Within Reach of Rome for a Day Trip',
      venues: [
        {
          name: 'Lake Albano',
          location: 'Castel Gandolfo, Lazio',
          description:
            'Set beneath the hilltop town of Castel Gandolfo and surrounded by wooded hills, among the closest lakes to Rome; kayaks, pedal boats and stand-up paddleboards can be hired, and the Papal Palace gardens can be visited.',
          note: 'By car: about 45 minutes. By public transport: direct regional trains run to Castel Gandolfo.',
          links: [
            {
              label: 'Website',
              href: 'https://www.parchilazio.it/castelliromani-schede-17879-laghi_del_parco_dei_castelli_romani_il_lago_albano',
            },
          ],
        },
        {
          name: 'Lake Bolsena',
          location: 'Lazio',
          description:
            "Europe's largest volcanic lake, with very clean water and small beaches; Capodimonte is a good base for pedal boats, swimming and a long lunch with a view.",
          note: 'By car: about 2 hours on the A1. By public transport: a train to Orvieto followed by a Cotral bus toward Bolsena, though a car is more convenient.',
          links: [{ label: 'Website', href: 'https://visitbolsena.it/lago/' }],
        },
        {
          name: 'Lake Bracciano',
          location: 'Lazio',
          description:
            'The simplest lake outing from the capital, offering clean water, lakeside restaurants and space to swim, walk and lunch at leisure, with the castle in Bracciano town or the waterfront at Trevignano Romano.',
          note: 'By car: about 45 minutes. By public transport: regional trains to Anguillara Sabazia take around an hour.',
          links: [{ label: 'Website', href: 'https://parcobracciano.it/' }],
        },
        {
          name: 'Lake Martignano',
          location: 'Lazio',
          description:
            'A small, tranquil lake surrounded by farmland, near Bracciano but considerably quieter, with clean water, relaxed beaches and canoes for rent.',
          note: 'By car: about an hour, with a seasonal shuttle to the shore. By public transport: difficult without a car, and driving is advised.',
          links: [{ label: 'Website', href: 'https://parcobracciano.it/' }],
        },
        {
          name: 'Lake Vico',
          location: 'Lazio',
          description:
            'Wild and green, lying inside an ancient volcanic crater among forests and hazelnut groves; activities include swimming, hiking and visits to Bau Beach, which admits dogs.',
          note: 'By car: about 90 minutes. By public transport: a train to Capranica-Sutri or a Cotral bus toward Ronciglione, though connections are limited.',
          links: [{ label: 'Website', href: 'https://www.parks.it/riserva.lago.vico/index.html' }],
        },
      ],
    },
  ],
}
