/**
 * Elsewhere — the journey data.
 * Every chapter is a coordinate on earth plus the camera language
 * (zoom / bearing / pitch) used to fly there.
 */

export interface Chapter {
  id: string
  coordinates: [number, number] // [lng, lat]
  zoom: number
  bearing: number
  pitch: number
  title: string
  subtitle: string
  quote: string
  description: string
  tags: string[]
  /** TODO: replace with real image paths, e.g. "/images/drift/amsterdam-01.jpg" */
  photos: string[]
  /** How many placeholder photo slots to render (0 for context/overview chapters) */
  photoSlots: number
  /** Overview chapters highlight an arc of countries + draw constellation lines */
  isOverview?: boolean
  /** ISO 3166-1 alpha-2 codes emphasized while this chapter is active */
  arcCountries?: string[]
  /** Points ([lng, lat]) connected by animated constellation lines */
  constellation?: [number, number][]
}

export const CHAPTERS: Chapter[] = [
  {
    id: 'hyderabad',
    coordinates: [78.4867, 17.385],
    zoom: 10,
    bearing: 0,
    pitch: 45,
    title: 'Hyderabad',
    subtitle: 'HOME BASE · INDIA',
    quote: 'Every departure starts here. Every return makes more sense.',
    description:
      'This is where it started. Not travel for the sake of travel — but the need to understand what exists beyond the only world I knew. Hyderabad will always be the coordinate everything else is measured against.',
    tags: ['HOME', 'WHERE IT BEGINS'],
    photos: [],
    photoSlots: 3,
  },
  {
    id: 'europe',
    coordinates: [10.0, 50.0],
    zoom: 3.8,
    bearing: 0,
    pitch: 20,
    title: 'Europe',
    subtitle: 'FIRST SOLO ARC · 2024',
    quote: 'I went alone and came back someone else.',
    description:
      'Four countries. Amsterdam, Berlin, Prague, then down to Spain. The first time I was fully alone in the world with nowhere to be and no one to answer to. Europe cracked something open that I’m still figuring out.',
    tags: ['SOLO TRAVEL', 'EUROPE ARC', '2024'],
    photos: [],
    photoSlots: 0,
    isOverview: true,
    arcCountries: ['NL', 'DE', 'CZ', 'ES'],
    constellation: [
      [4.9041, 52.3676], // Amsterdam
      [13.405, 52.52], // Berlin
      [14.4378, 50.0755], // Prague
      [1.5, 40.5], // Spain
    ],
  },
  {
    id: 'amsterdam',
    coordinates: [4.9041, 52.3676],
    zoom: 12,
    bearing: -15,
    pitch: 50,
    title: 'Amsterdam',
    subtitle: 'NETHERLANDS · 2024',
    quote: 'Something cracked open here.',
    description:
      'The first stop. Canals, chaos, freedom. The feeling of being entirely responsible for yourself in a foreign city for the first time. Amsterdam didn’t ease me in — it threw me.',
    tags: ['AMSTERDAM', 'NETHERLANDS', 'FIRST STOP'],
    photos: [],
    photoSlots: 3,
  },
  {
    id: 'berlin',
    coordinates: [13.405, 52.52],
    zoom: 11.5,
    bearing: 10,
    pitch: 40,
    title: 'Berlin',
    subtitle: 'GERMANY · 2024',
    quote: 'Music as philosophy.',
    description:
      'Berlin operates on its own frequency. The underground, the history, the way the city holds both darkness and radical freedom at the same time. Everything here is intentional.',
    tags: ['BERLIN', 'GERMANY', 'UNDERGROUND'],
    photos: [],
    photoSlots: 3,
  },
  {
    id: 'prague',
    coordinates: [14.4378, 50.0755],
    zoom: 12,
    bearing: -10,
    pitch: 45,
    title: 'Prague',
    subtitle: 'CZECH REPUBLIC · 2024',
    quote: 'Old and strange and beautiful.',
    description:
      'A city that feels like it exists slightly outside of time. Walking Prague at night felt like moving through someone else’s dream — the architecture, the stillness, the weight of it all.',
    tags: ['PRAGUE', 'CZECH REPUBLIC'],
    photos: [],
    photoSlots: 3,
  },
  {
    id: 'spain',
    coordinates: [1.5, 40.5],
    zoom: 6,
    bearing: 0,
    pitch: 30,
    title: 'Mallorca → Barcelona',
    subtitle: 'SPAIN · 2024',
    quote: 'Sun, clarity, and the feeling of becoming.',
    description:
      'Island first, then city. Mallorca was the exhale — ocean, warmth, nothing urgent. Barcelona was the energy surge at the end of an arc that had already changed me completely.',
    tags: ['MALLORCA', 'BARCELONA', 'SPAIN'],
    photos: [],
    photoSlots: 3,
  },
  {
    id: 'southeast-asia',
    coordinates: [112.0, 2.0],
    zoom: 4,
    bearing: 0,
    pitch: 20,
    title: 'Southeast Asia',
    subtitle: 'SECOND ARC · 2024',
    quote: 'The magic was always inside you all along.',
    description:
      'Indonesia, Philippines, Australia. Three countries, each completely different. This arc was less about adventure and more about presence — learning to just be somewhere fully.',
    tags: ['SOUTH EAST ASIA', 'PACIFIC', '2024'],
    photos: [],
    photoSlots: 0,
    isOverview: true,
    arcCountries: ['ID', 'PH', 'AU'],
    constellation: [
      [115.5, -8.5], // Bali · Gili T
      [124.1535, 9.65], // Bohol
      [152.0, -26.5], // Noosa → Sydney
    ],
  },
  {
    id: 'bali-gili-t',
    coordinates: [115.5, -8.5],
    zoom: 9,
    bearing: 20,
    pitch: 50,
    title: 'Bali · Gili T',
    subtitle: 'INDONESIA · 2024',
    quote: 'The magic was always inside you all along.',
    description:
      'Bali was the depth. Gili T was the release. Between the two islands — a boat party, a club with a pen drive, temple runs at dawn, and the slow realisation that what I was searching for had been here the whole time.',
    tags: ['BALI', 'GILI T', 'INDONESIA'],
    photos: [],
    photoSlots: 3,
  },
  {
    id: 'bohol',
    coordinates: [124.1535, 9.65],
    zoom: 10.5,
    bearing: -5,
    pitch: 45,
    title: 'Bohol',
    subtitle: 'PHILIPPINES · 2024',
    quote: 'Ocean. Presence. Nothing else needed.',
    description:
      'Bohol is forested, quiet, reserved in the most beautiful way. I recorded a DJ set here while exploring the island because I kept wanting to share what it actually felt like to be there. That set became a conversation.',
    tags: ['BOHOL', 'PHILIPPINES', 'BOHOL SESSIONS'],
    photos: [],
    photoSlots: 3,
  },
  {
    id: 'australia',
    coordinates: [152.0, -26.5],
    zoom: 7,
    bearing: 0,
    pitch: 30,
    title: 'Noosa · Sydney',
    subtitle: 'AUSTRALIA · 2024',
    quote: 'Returned different.',
    description:
      'The last stop of the arc. Noosa was pure nature — national parks, empty beaches, mornings that felt infinite. Sydney was the city punctuation at the end. I flew home knowing the person who had left couldn’t come back because they didn’t exist anymore.',
    tags: ['NOOSA', 'SYDNEY', 'AUSTRALIA'],
    photos: [],
    photoSlots: 3,
  },
  {
    id: 'himalayas',
    coordinates: [77.1892, 32.2396],
    zoom: 9,
    bearing: 15,
    pitch: 60, // pitch 60 to show the terrain dramatically
    title: 'Himalayas',
    subtitle: 'KASOL · MANALI · BRIGHU LAKE · 2024',
    quote: 'At 4300 metres, there is nothing left to pretend.',
    description:
      'Kasol first, then up to Tosh, then Kullu rafting, then the Brighu Lake trek at 4300m — the highest I have ever been, in every sense. The Manali leg ended with the most visually beautiful experience of my life. The mountains don’t care who you think you are.',
    tags: ['HIMALAYAS', 'BRIGHU LAKE', '4300M', 'KASOL', 'MANALI'],
    photos: [],
    photoSlots: 3,
  },
  {
    id: 'uttarakhand',
    coordinates: [79.2193, 30.48],
    zoom: 10,
    bearing: 20,
    pitch: 55,
    title: 'Chandrashila',
    subtitle: 'UTTARAKHAND · CHOPTA · 2024',
    quote: 'The kind of silence that resets everything.',
    description:
      'Chopta to Chandrashila. The Uttarakhand range is quieter than the Himalayas but no less powerful. This trek gave a different kind of clarity — not the dramatic kind, just a long, clean silence that stayed with me.',
    tags: ['CHANDRASHILA', 'CHOPTA', 'UTTARAKHAND', 'TREK'],
    photos: [],
    photoSlots: 3,
  },
]

/** ISO 3166-1 alpha-2 codes of every country visited — filled amber on the map */
export const VISITED_COUNTRIES = ['IN', 'NL', 'DE', 'CZ', 'ES', 'ID', 'PH', 'AU']

export interface LocationDot {
  name: string
  coordinates: [number, number]
}

/** Specific places visited within countries — brighter amber dots at 1.2x size */
export const LOCATION_DOTS: LocationDot[] = [
  { name: 'Hyderabad', coordinates: [78.4867, 17.385] },
  { name: 'Amsterdam', coordinates: [4.9041, 52.3676] },
  { name: 'Berlin', coordinates: [13.405, 52.52] },
  { name: 'Prague', coordinates: [14.4378, 50.0755] },
  { name: 'Mallorca', coordinates: [2.9, 39.61] },
  { name: 'Barcelona', coordinates: [2.1734, 41.3851] },
  { name: 'Bali', coordinates: [115.1889, -8.4095] },
  { name: 'Gili T', coordinates: [116.0339, -8.3505] },
  { name: 'Bohol', coordinates: [124.1535, 9.65] },
  { name: 'Noosa', coordinates: [153.0901, -26.396] },
  { name: 'Sydney', coordinates: [151.2093, -33.8688] },
  { name: 'Kasol', coordinates: [77.3151, 32.01] },
  { name: 'Manali', coordinates: [77.1892, 32.2432] },
  { name: 'Brighu Lake', coordinates: [77.2438, 32.3244] },
  { name: 'Chandrashila', coordinates: [79.2193, 30.48] },
]
