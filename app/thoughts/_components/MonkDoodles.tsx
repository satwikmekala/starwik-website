'use client'

import { Sketch, ThoughtDoodles, type DoodlePlacement } from './ThoughtDoodles'
import styles from './superpositionDoodles.module.css'

const CHAPTERS = [
  'on-being-chosen',
  'the-psychology-of-frequencies',
  'what-the-monk-knows',
  'the-lesson-hidden-in-the-ordinary',
] as const

function CuriousKitten() {
  return <Sketch>
    <path d="M65 117 61 68l32 23q21-9 41 0l28-24 1 48c15 37-13 61-48 60-37 0-62-23-50-58Z" />
    <path d="m70 83 15 12m66-11-11 13M85 122q5-10 10 0m34 0q5-10 10 0" />
    <path d="m108 134 8 1-4 5-4-6m4 6v5m0-1q-8 9-14 2m14-2q8 9 15 1" />
    <path d="m79 138-24-5m26 13-26 3m90-11 24-5m-26 13 27 3" />
    <path d="M91 175q-11 10-9 30m52-30q12 11 9 30M99 205v-12m24 12v-12" />
    <path className={styles.warm} d="M46 51v13m-6-6h12m130 14 5-7m4 20 9-1" />
  </Sketch>
}

function LittleBowl() {
  return <Sketch>
    <path d="M51 126q4 46 59 44 51 0 58-44ZM57 126q48 11 105 0M72 177q34 5 78-1" />
    <path d="M91 104q-13-13-4-23m25 24q-11-17 0-29m23 29q-9-9-2-18" />
    <path className={styles.warm} d="M107 150q-17-11-13-17 6-7 14 2 7-11 14-4 5 8-15 19Z" />
  </Sketch>
}

function WatchfulCat() {
  return <Sketch>
    <path d="M66 148 62 99l26 19q21-10 40-1l25-21 4 51q5 37-45 37-46 0-46-36Z" />
    <path d="M81 146q7-10 14 0m28 0q7-10 14 0m-31 13 8 1-4 5-4-6" />
    <path d="m79 160-24-4m87 4 21-4M98 185l-3 22m26-22 4 22" />
    <path d="M54 201q-8-72-14-120m9 44q-28 2-31-30 26 0 31 30Zm-6-25q25-8 22-36-27 9-22 36Z" />
    <path className={styles.warm} d="M91 82q21-17 42 0M83 65q30-25 59 0" />
  </Sketch>
}

function MotherAndKitten() {
  return <Sketch>
    <path d="M37 105 35 70l23 16q16-7 30 0l21-16 1 38q8 32-36 32-39-1-37-35Z" />
    <path d="M49 106q5 7 11 0m25 0q5 7 10 0m-26 10 7 1-4 5m0-1q-5 7-11 1m11-1q5 7 11 1" />
    <path d="M51 139q-18 31-2 58h64m-8-54q27-6 44 17m-101 36q-25-2-24-22 1-13 14-11" />
    <path d="M116 166 114 141l19 12q12-5 23 0l17-13 1 29q2 25-28 25-29 0-30-28Z" />
    <path d="m127 169 5 2m23-2 5 1m-18 10 5 1m-30 14-5 8m53-10 5 9" />
    <path className={styles.warm} d="M142 84q-18-12-13-19 7-7 14 3 7-10 14-3 6 8-15 19Z" />
  </Sketch>
}

function NoseGreeting() {
  return <Sketch>
    <path d="M58 168q-13-22-1-46l-3-38 26 20q27-4 44 14l16 18-15 5q-4 22-26 24l-1 35" />
    <path d="m66 101 10 11m22 16q5-8 11 0m-3 19-18-2m19 9-18 4" />
    <path d="M192 150q-13-1-24-8l-15-7q-9-5-12 1-1 6 10 12l9 5q-14-3-14 5 1 5 16 7l29 10" />
    <path className={styles.warm} d="M138 94q-18-12-13-19 7-7 14 3 7-10 14-3 6 8-15 19ZM129 122l2-5m14 7 4-3" />
  </Sketch>
}

function SharedSpace() {
  return <Sketch>
    <path d="M86 77c-46-2-65 81-29 104 31 20 60-6 66-36 8-39-7-66-37-68Z" />
    <path d="M141 69c-45 0-69 81-32 107 28 22 66-3 70-34 6-39-10-71-38-73Z" />
    <path className={styles.warm} d="M113 136q-23-17-16-26 8-8 17 4 9-13 18-4 7 10-19 26Z" />
    <path d="m49 61-5-9m136 142 7 6M82 209q28-7 55-1" />
  </Sketch>
}

function CatLoaf() {
  return <Sketch>
    <path d="M47 161q-3-28 27-44l-2-33 23 18q17-5 33 0l23-20-1 36q32 15 28 46-5 27-63 27-62 1-68-30Z" />
    <path d="m80 96 10 11m50-11-8 11M88 128q6 8 13 0m22 0q7 8 13 0" />
    <path d="m108 140 7 1-3 5m0-1q-6 8-12 2m12-2q6 8 12 2" />
    <path d="m88 143-19-3m64 3 20-3M72 176q21-13 37 0m8 0q19-13 35 0" />
    <path d="M174 171q27 1 26-19-2-14-13-11" />
    <path className={styles.warm} d="M101 57q11-9 23-1m-31-14q19-12 37-1" />
  </Sketch>
}

function GroomingCat() {
  return <Sketch>
    <path d="M60 120 58 84l25 18q17-7 35 0l22-19 1 39q-1 33-40 34-38 0-41-36Z" />
    <path d="M73 125q6 7 12 0m25-1q6 7 12 0m-28 13 7 1-4 5" />
    <path d="M74 154q-16 23-9 53h77q13-22-8-54M142 207q41 2 43-19 1-15-13-15" />
    <path d="M97 197q-7-18 1-41l9-16q4-6 8-2 3 3-2 10l-6 18q-2 18 8 24m-9-45 6 2" />
    <path className={styles.warm} d="M166 101v16m-8-8h16m-22-33v9m-5-4h10" />
  </Sketch>
}

function SleepingCat() {
  return <Sketch>
    <path d="M55 172q-17-41 17-65 26-19 69-5 34 12 39 41 7 42-47 48-44 6-78-19Z" />
    <path d="m61 140-1-29 23 13q13-2 26 5l23-9-6 26q-5 29-36 27-28 0-29-33Z" />
    <path d="m73 144 12 5m16 1 12-4m-27 10 7 1m-16 1-18-2m49 4 18 1" />
    <path d="M175 150q-9-20-30-15-17 6-9 20 4 8 15 3M55 195q62 9 133-1" />
    <path className={styles.warm} d="M97 77q-22-13-16-21 8-7 16 4 9-12 16-4 7 8-16 21Z" />
  </Sketch>
}

function Paw() {
  return <Sketch>
    <path d="M87 134q-12 10-12 25 3 15 19 8 14-6 28 0 18 6 22-8 2-16-15-28-21-22-42 3Z" />
    <ellipse cx="71" cy="114" rx="10" ry="15" transform="rotate(-27 71 114)" />
    <ellipse cx="96" cy="94" rx="10" ry="16" transform="rotate(-10 96 94)" />
    <ellipse cx="124" cy="94" rx="10" ry="16" transform="rotate(12 124 94)" />
    <ellipse cx="149" cy="115" rx="10" ry="15" transform="rotate(29 149 115)" />
  </Sketch>
}

function Heart() {
  return <Sketch><path className={styles.warm} d="M108 168c-65-38-63-75-38-76 19-2 32 12 40 27 12-26 35-34 48-15 18 26-16 51-50 64Z" /></Sketch>
}

function Leaf() {
  return <Sketch>
    <path d="M65 182q16-52 88-109 16 80-29 102-29 13-49-4M65 182l66-86m-41 54 2-26m14 6 27-4" />
  </Sketch>
}

function Sun() {
  return <Sketch>
    <circle cx="111" cy="122" r="30" />
    <path d="M111 65v13m0 88v13m-56-57h13m88 0h13M71 82l10 10m60 60 10 10m0-80-10 10m-60 60-10 10" />
  </Sketch>
}

function Stars() {
  return <Sketch>
    <path d="M69 105q27-3 29-32 3 29 29 32-27 4-29 33-3-29-29-33Z" />
    <path className={styles.warm} d="M143 161v19m-9-9h19M55 165v10m-5-5h10" />
  </Sketch>
}

function Yarn() {
  return <Sketch>
    <circle cx="109" cy="119" r="39" />
    <path d="M78 95q43 6 60 44m-69-24q38 4 59 38m-29-72q-8 38 33 72m-6-70q-10 23 21 45M90 154q-13 21 7 27 24 9 34-1 9-10 27 3" />
  </Sketch>
}

const DRAWINGS = {
  kitten: CuriousKitten, bowl: LittleBowl, watchful: WatchfulCat, family: MotherAndKitten,
  greeting: NoseGreeting, overlap: SharedSpace, loaf: CatLoaf, grooming: GroomingCat,
  sleeping: SleepingCat, paw: Paw, heart: Heart, leaf: Leaf, sun: Sun, stars: Stars, yarn: Yarn,
} as const

// Each section has a different, loose arrangement; small marks drift above and below the cats.
const COMPOSITIONS: readonly (readonly DoodlePlacement<keyof typeof DRAWINGS>[])[] = [
  [
    { drawing: 'kitten', side: 'left', x: 41, y: 32, size: 170, rotation: -9 },
    { drawing: 'bowl', side: 'right', x: 59, y: 71, size: 133, rotation: 8 },
    { drawing: 'stars', side: 'right', x: 30, y: 13, size: 46, rotation: -18 },
    { drawing: 'paw', side: 'left', x: 73, y: 75, size: 50, rotation: 22 },
    { drawing: 'yarn', side: 'left', x: 26, y: 90, size: 58, rotation: -12 },
    { drawing: 'heart', side: 'right', x: 76, y: 39, size: 36, rotation: 18 },
  ],
  [
    { drawing: 'watchful', side: 'right', x: 55, y: 29, size: 172, rotation: 8 },
    { drawing: 'family', side: 'left', x: 46, y: 73, size: 179, rotation: -6 },
    { drawing: 'paw', side: 'left', x: 72, y: 15, size: 45, rotation: -25 },
    { drawing: 'leaf', side: 'right', x: 27, y: 86, size: 54, rotation: 21 },
    { drawing: 'stars', side: 'left', x: 27, y: 37, size: 47, rotation: 16 },
    { drawing: 'heart', side: 'right', x: 75, y: 63, size: 38, rotation: -17 },
  ],
  [
    { drawing: 'greeting', side: 'left', x: 54, y: 29, size: 181, rotation: -8 },
    { drawing: 'overlap', side: 'right', x: 43, y: 67, size: 157, rotation: 11 },
    { drawing: 'heart', side: 'right', x: 72, y: 14, size: 42, rotation: -21 },
    { drawing: 'paw', side: 'left', x: 26, y: 85, size: 48, rotation: 17 },
    { drawing: 'stars', side: 'right', x: 76, y: 90, size: 43, rotation: 22 },
    { drawing: 'leaf', side: 'left', x: 70, y: 61, size: 52, rotation: -16 },
  ],
  [
    { drawing: 'loaf', side: 'right', x: 61, y: 32, size: 178, rotation: -7 },
    { drawing: 'grooming', side: 'left', x: 40, y: 74, size: 168, rotation: 8 },
    { drawing: 'sun', side: 'left', x: 55, y: 13, size: 62, rotation: 12 },
    { drawing: 'stars', side: 'right', x: 24, y: 73, size: 44, rotation: -23 },
    { drawing: 'paw', side: 'left', x: 78, y: 43, size: 42, rotation: -20 },
    { drawing: 'heart', side: 'right', x: 79, y: 91, size: 36, rotation: 16 },
  ],
  [
    { drawing: 'greeting', side: 'left', x: 49, y: 39, size: 178, rotation: 8 },
    { drawing: 'sleeping', side: 'right', x: 54, y: 75, size: 179, rotation: -8 },
    { drawing: 'heart', side: 'right', x: 28, y: 14, size: 49, rotation: -16 },
    { drawing: 'paw', side: 'left', x: 78, y: 87, size: 44, rotation: 22 },
    { drawing: 'sun', side: 'right', x: 78, y: 41, size: 48, rotation: 12 },
    { drawing: 'stars', side: 'left', x: 24, y: 12, size: 50, rotation: -19 },
  ],
]

export function MonkDoodles() {
  return <ThoughtDoodles chapters={CHAPTERS} drawings={DRAWINGS} compositions={COMPOSITIONS} pencil="#ffe7cc" highlight="#f8c59a" />
}
