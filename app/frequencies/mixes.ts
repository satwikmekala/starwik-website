// The Frequencies catalog — the flat-file stand-in for a `mixes` table.
// Add a mix by appending an entry; the listening room picks it up everywhere.
//
// Audio: host the file anywhere that serves a public URL (R2, Supabase Storage,
// or /public for small files) and put it in `audio.src`. Then run
//   npm run mix:peaks -- <path-to-audio> <slug>
// which writes public/mixes/peaks/<slug>.json and prints the exact duration.
// Long sets need precomputed peaks — decoding 90 minutes in the browser isn't viable.

export type MixCue = {
  /** seconds from the start; cues without one are listed but not seekable */
  at?: number
  artist: string
  title: string
}

export type Mix = {
  slug: string
  title: string
  /** 1:1 art, shown inset in the vinyl */
  cover: string
  audio?: {
    src: string
    /** JSON produced by scripts/mix-peaks.mjs */
    peaks?: string
  }
  /** seconds */
  duration: number
  /** ISO date recorded or released */
  released: string
  /** free-form mood tags — the first one is the card's tag */
  moods: string[]
  venue?: string
  link?: { label: string; href: string }
  note?: string
  tracklist?: MixCue[]
}

const youtubeCover = (id: string) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`

const catalog: Mix[] = [
  {
    slug: 'too-bouncy-to-be-careless',
    title: 'Too Bouncy To Be Careless',
    cover: '/images/soundcloud.jpg',
    duration: 2175.4,
    released: '2026-07-09',
    moods: ['bass house', 'tech house'],
    link: {
      label: 'soundcloud',
      href: 'https://soundcloud.com/satwik-mekala/too-bouncy-to-be-careless',
    },
    note: 'play it while you train. play it while you run. play it in your room in the evening when you just want to dance a little.',
  },
  {
    slug: 'vol-04',
    title: 'Vol. 04',
    cover: youtubeCover('MtOWuSFrr9o'),
    duration: 1090,
    released: '2026-06-02',
    moods: ['house remixes'],
    venue: 'Hyderabad ORR',
    link: { label: 'youtube', href: 'https://youtu.be/MtOWuSFrr9o' },
    note: 'recorded in a moving car. two cameras, one didn’t record. we ended up on the orr with no real plan and drove all the way to the airport.',
  },
  {
    slug: 'vol-03',
    title: 'Vol. 03',
    cover: youtubeCover('9kuPPDcWT44'),
    duration: 1904,
    released: '2026-02-24',
    moods: ['deep house', 'melodic house'],
    venue: 'Bohol, Philippines',
    link: { label: 'youtube', href: 'https://youtu.be/9kuPPDcWT44' },
    note: 'recorded in a hammock hostel, surrounded by jungle. put it on and let me take you around the island.',
    tracklist: [
      { artist: 'Ben Böhmer', title: 'Once' },
      { artist: 'Affelaye', title: 'Circle' },
      { artist: 'Vernal', title: 'Extended Mix' },
      { artist: 'DOMPOON & Coastlines', title: 'Breathless (Rewoven)' },
      { artist: 'Ben Böhmer', title: 'Caught Up In The Fire' },
      { artist: 'Chris Savor', title: 'Driving Back Home' },
      { artist: 'Chris Savor', title: 'Waves' },
      { artist: 'PARIS', title: 'Stay' },
      { artist: 'San Mateo Drive', title: 'Hold On' },
      { artist: 'poolsideconvo', title: 'that feeling' },
      { artist: 'Ben Böhmer feat. Gordi', title: 'Slow Wave (The Blaze Remix)' },
    ],
  },
  {
    slug: 'vol-02',
    title: 'Vol. 02',
    cover: youtubeCover('uG1WS2lbQ7g'),
    duration: 2038,
    released: '2025-10-27',
    moods: ['deep house', 'afro house'],
    venue: 'a terrace, at sunrise',
    link: { label: 'youtube', href: 'https://youtu.be/uG1WS2lbQ7g' },
    note: 'rained out the night before, so i woke at 3:30 and played straight through sunrise.',
    tracklist: [
      { artist: 'Sultan + Shepard', title: 'Assassin (Extended Mix)' },
      { artist: 'Anton Khabbaz & Dylan Lee', title: 'Wilderness Girl (Extended Mix)' },
      { artist: 'Frank Ocean', title: 'Ivy (Anton Khabbaz & Dylan Lee Remix)' },
      { artist: 'Simon Doty', title: 'Tellin Me' },
      { artist: 'Lane 8', title: 'Counting Down The Days (Yotto Remix)' },
      { artist: 'Durante, HANA', title: 'Anthracite (Extended Mix)' },
      { artist: 'Marsh', title: 'Starglow (Extended Mix)' },
      { artist: 'Marsh', title: 'Lost In You (Extended Mix)' },
      { artist: 'The Weeknd', title: 'Take My Breath (Hugo Cantarra & Lazare Remix)' },
      { artist: 'Tinlicker', title: 'Nothing Without You (Extended Mix)' },
      { artist: 'Ahmetcan', title: 'Sign Of The Times (Keinemusik mashup)' },
      { artist: 'Keinemusik', title: 'Muye' },
      { artist: 'Mx Cartier & Lur', title: 'Oh Na Ri Na (Extended)' },
    ],
  },
]

// A synthetic 45-minute set for local development — generate it with
// `npm run mix:test-pressing`. Never shipped: production builds drop it.
const testPressing: Mix = {
  slug: 'test-pressing',
  title: 'Test Pressing',
  cover: '/mixes/covers/test-pressing.svg',
  audio: {
    src: '/mixes/audio/test-pressing.mp3',
    peaks: '/mixes/peaks/test-pressing.json',
  },
  duration: 2700,
  released: '2026-09-10',
  moods: ['test pressing'],
  venue: 'the studio',
  note: 'a synthetic set for checking the room — kicks, hats and a slow pad. replace with the real thing.',
  tracklist: [
    { at: 0, artist: 'side a', title: 'pad, alone' },
    { at: 32, artist: 'side a', title: 'kick comes in' },
    { at: 600, artist: 'side a', title: 'the long middle' },
    { at: 1200, artist: 'side b', title: 'breakdown' },
    { at: 1232, artist: 'side b', title: 'second wind' },
    { at: 2100, artist: 'side b', title: 'the walk home' },
  ],
}

export const mixes: Mix[] =
  process.env.NODE_ENV === 'production' ? catalog : [testPressing, ...catalog]

const preferredMoods = ['deep house', 'melodic house', 'afro house', 'vapoursoul']

/** Every mood in the catalog — the house moods first, the rest in order of appearance. */
export function moodsOf(list: Mix[]) {
  const seen = Array.from(new Set(list.flatMap((mix) => mix.moods)))
  return [
    ...preferredMoods.filter((mood) => seen.includes(mood)),
    ...seen.filter((mood) => !preferredMoods.includes(mood)),
  ]
}

export function formatTime(seconds: number) {
  const total = Math.max(0, Math.floor(seconds))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = String(total % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`
}

export function formatReleased(iso: string) {
  const date = new Date(`${iso}T00:00:00`)
  return date
    .toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    .toUpperCase()
}
