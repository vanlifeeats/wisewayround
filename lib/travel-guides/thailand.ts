import type { DestinationData } from '@/lib/travel-guides/types'

export const data: DestinationData = {
  slug: 'thailand',
  name: 'Thailand',
  heroImage: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTA5MjUyfDB8MXxzZWFyY2h8MXx8QmFuZ2tvayUyMFRoYWlsYW5kJTIwdHJhdmVsfGVufDB8MHx8fDE3OTI1OTc2MDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
  heroImageAlt: 'A street scene in Bangkok, Thailand',
  heroImageCredit: { name: 'Alejandro Cartagena 🇲🇽🏳‍🌈', profileUrl: 'https://unsplash.com/@cartayen?utm_source=wisewayround&utm_medium=referral' },
  tagline: 'Bangkok adds a Southeast Asian section with operator-confirmed restaurant options, from a multi-branch Thai dining business to booked tasting-menu restaurants.',
  intro: [
    "The Thai government's transport overview distinguishes BTS Skytrain, MRT, buses, taxis and other modes, though the overview itself is older, so its quoted fares and operating hours are not carried into this guide — worth using current operator information for the journey.",
    'A formal restaurant booking makes a reliable anchor for the day; it is worth leaving another meal flexible for a locally confirmed market or street-food stop, and verifying a stall\'s current location and service period rather than relying on an old early-morning instruction.',
    'It helps to allow spare time between neighbourhoods, confirm the full address in its original local spelling where possible, and carry water for outdoor outings — asking directly about ingredients, heat levels and dietary restrictions. The directory below covers a range of verified additions, not a full survey of Bangkok dining.',
  ],
  planningLinks: [
    { label: 'Bangkok municipal visitor information', href: 'https://visit.bangkok.go.th/' },
    { label: 'Thai government transport overview', href: 'https://www.thailand.go.th/visit-thailand-detail/002_001' },
  ],
  sections: [
    {
      heading: 'Venue directory',
      venues: [
        {
          name: 'Bo.lan',
          location: 'Bangkok',
          description: 'Thai dining business with current format and booking information on its operator page.',
          links: [{ label: 'Website', href: 'https://www.bolan.co.th/?lang=en' }],
        },
        {
          name: 'Nahm',
          location: 'COMO Metropolitan Bangkok',
          description: 'Thai restaurant with a menu of curries, salads, relishes, soups and stir-fries.',
          links: [{ label: 'Website', href: 'https://www.comohotels.com/thailand/como-metropolitan-bangkok/nahm-bangkok' }],
        },
        {
          name: 'Sorn',
          location: '56 Soi Sukhumvit 26, Khlong Tan, Khlong Toei, Bangkok',
          description: 'Restaurant specialising in Southern Thai cooking.',
          note: 'Reservation availability and conditions should be checked directly.',
          links: [{ label: 'Website', href: 'https://sornfinesouthern.com/' }],
        },
        {
          name: 'Sra Bua by Kiin Kiin',
          location: 'Siam Kempinski Hotel, Bangkok',
          description: 'Modern Thai restaurant offering seasonal tasting menus.',
          note: 'Check dress and age policies before booking.',
          links: [{ label: 'Website', href: 'https://www.kempinski.com/en/siam-hotel/restaurants-bars/sra-bua-by-kiin-kiin' }],
        },
        {
          name: 'Supanniga Eating Room',
          location: 'Thonglor, Sathorn 10 and Tha Tien, Bangkok',
          description: 'Thai restaurant business with branches at Thonglor, Sathorn 10 and Tha Tien.',
          note: 'Select the intended branch when booking.',
          links: [{ label: 'Website', href: 'https://www.supannigaeatingroom.com/' }],
        },
      ],
    },
  ],
}
