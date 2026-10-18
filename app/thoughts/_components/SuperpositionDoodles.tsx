'use client'

import { Sketch, ThoughtDoodles, type DoodlePlacement } from './ThoughtDoodles'
import styles from './superpositionDoodles.module.css'

const CHAPTERS = [
  'the-physics-of-possibility',
  'but-heres-what-we-miss',
  'so-what-do-you-actually-do-with-this',
  'the-inevitable-moment',
] as const

function star(x: number, y: number, warm = false) {
  return <path className={warm ? styles.warm : undefined} d={`M${x - 5} ${y}q5-1 5-6q1 6 6 6q-6 1-6 6q-1-6-5-6Z`} />
}

/** Deliberately small, imperfect pencil marks, rather than scientific diagrams. */
function CosmicRock() {
  return <Sketch>
    <path d="M68 143c-8-37 12-65 45-66c31-2 55 26 48 59c-4 30-24 50-54 45c-24-3-34-17-39-38Z" />
    <path d="M77 104l18-2l9 11l-6 12l9 9l-13 10l-1 24M127 82l-4 15l16 10l-4 13l15 7M135 144l-10 7l-4 17" />
    <ellipse cx="111" cy="132" rx="90" ry="24" transform="rotate(-28 111 132)" strokeDasharray="3 8" />
    <circle cx="184" cy="94" r="3" className={styles.warm} />
    {star(43, 52)}{star(174, 45, true)}{star(188, 192)}
    <path d="m24 176 8-3m-4-4 1 9" />
  </Sketch>
}

function PossibilityCloud() {
  return <Sketch>
    <path d="M48 145c-21-9-23-34-6-46c-2-24 18-42 43-33c13-24 43-23 56-2c27-9 46 10 41 32c23 13 24 37 6 49c6 22-17 38-37 33c-13 20-40 22-55 7c-23 11-48-5-48-25" strokeDasharray="2 7" />
    <circle cx="71" cy="107" r="3" /><circle cx="147" cy="99" r="3" />
    <circle cx="127" cy="161" r="3" /><circle cx="58" cy="145" r="2" />
    <circle cx="164" cy="143" r="2" /><circle cx="102" cy="78" r="2" />
    <path d="M107 132c-23-15-22-29-11-31c9-2 14 4 16 11c5-10 14-13 20-6c8 9-5 21-25 26Z" className={styles.warm} />
    {star(178, 39)}{star(44, 200)}
  </Sketch>
}

function ForkingPaths() {
  return <Sketch>
    <circle cx="39" cy="121" r="4" className={styles.warm} />
    <path d="M48 121c30 0 34-43 67-49s37 3 59-21M48 121c29-1 48-11 72-8s34 17 60 10M48 122c27 7 34 48 62 52s41-9 65 21" />
    <path d="m166 49 11-1-2 11m-3 56 10 8-11 7m-3 58 10 8-12 4" />
    <circle cx="126" cy="115" r="8" strokeDasharray="1 5" />
    {star(43, 51)}{star(183, 165, true)}
  </Sketch>
}

function EntangledParticles() {
  return <Sketch>
    <ellipse cx="76" cy="108" rx="41" ry="55" transform="rotate(-24 76 108)" />
    <ellipse cx="146" cy="137" rx="40" ry="53" transform="rotate(25 146 137)" />
    <path d="M76 109c20-18 43 45 70 28M76 109c24 39 45-14 70 28" strokeDasharray="3 6" />
    <circle cx="76" cy="109" r="5" className={styles.particle} />
    <circle cx="146" cy="137" r="5" className={`${styles.particle} ${styles.warm}`} />
    <path d="m41 171-7 5m139-108 7-7" />
    {star(174, 43)}{star(42, 204, true)}
  </Sketch>
}

function ChangingFrequency() {
  return <Sketch>
    <path d="M22 84c18-34 33 34 51 0s33 34 51 0s33 34 51 0s17-4 25 3" />
    <path d="M22 126c11-28 20 28 31 0s20 28 31 0s20 28 31 0s20 28 31 0s20 28 31 0s15 18 24 0" className={styles.warm} />
    <path d="M22 169c25-26 40 27 68 0s45 27 70 0s29-9 41-5" strokeDasharray="3 7" />
    <path d="M21 201c48 3 112-3 179 0m-7-6 8 6-8 5" />
    {star(171, 38)}
  </Sketch>
}

function ChangingSelf() {
  return <Sketch>
    <path d="M110 59c-52-2-71 70-49 113c20 38 68 45 96 11c23-26 26-67 8-93c-13-20-31-29-55-31Z" strokeDasharray="3 6" />
    <path d="M110 78c-37-2-50 52-35 86c15 30 48 32 67 8c20-26 20-65 0-82c-10-8-20-11-32-12Z" />
    <path d="M93 119l1 7m38-7-1 7M95 146q15 16 33-1" />
    <path d="M109 36v9m-5-4h10" className={styles.warm} />
    {star(40, 176)}{star(184, 75)}
  </Sketch>
}

function Becoming() {
  return <Sketch>
    <path d="M107 198c3-38-5-74 10-116M108 153c-28 0-45-19-41-41c24 2 38 20 41 41ZM112 128c27-2 43-21 40-45c-25 3-38 22-40 45Z" />
    <path d="M116 90c-14-16-13-30-3-43c18 15 22 28 3 43ZM53 205c34-4 66 3 112-1" strokeDasharray="3 7" />
    {star(48, 83, true)}{star(178, 155)}
    <path d="m77 177-8 5m88-16 8 4" />
  </Sketch>
}

function Alive() {
  return <Sketch>
    <path d="M34 124c12-36 32-48 54-18c21 28 33 47 61 3c14-23 31-12 40 9" />
    <path d="M32 130c29 10 59-1 82-6c31-8 51 15 75 1" strokeDasharray="2 7" />
    <path d="M112 54v16m-38-1 8 10m63-10-9 10M110 174v15m-35-28-9 9m79-10 9 10" />
    <circle cx="110" cy="123" r="57" strokeDasharray="2 8" />
    {star(184, 51, true)}{star(34, 203)}
  </Sketch>
}

function ConvergingPaths() {
  return <Sketch>
    <path d="M35 49c83 4 24 99 74 122M187 48c-87 11-24 99-78 123" />
    <path d="M22 60c47 26 18 63 44 86M197 62c-49 27-25 58-42 81" strokeDasharray="2 7" />
    <circle cx="109" cy="175" r="5" className={styles.warm} />
    <path d="M109 184v24m-6-7 6 8 6-8" />
    {star(48, 197)}{star(170, 184, true)}
  </Sketch>
}

function Together() {
  return <Sketch>
    <path d="M64 128c-7-36 17-62 46-62c37 0 65 23 56 61c-7 31-29 48-60 43c-27-4-35-17-42-42Z" strokeDasharray="3 7" />
    <circle cx="92" cy="127" r="5" /><circle cx="130" cy="120" r="5" className={styles.warm} />
    <path d="m98 126 26-5M107 103c-17-12-17-24-8-24c7-1 11 4 12 9c5-7 12-9 17-3c6 8-6 16-21 18Z" />
    <path d="M31 190c57-15 103-11 160 0" />
    {star(37, 69)}{star(185, 60, true)}{star(158, 206)}
  </Sketch>
}

function LittleStars() {
  return <Sketch>
    <path d="M85 86q23-3 24-30q3 29 27 30q-25 4-27 30q-2-26-24-30Z" />
    <path className={styles.warm} d="M142 155q12-2 13-16q2 14 15 16q-14 2-15 16q-2-14-13-16Z" />
    <path d="M51 157v14m-7-7h14" />
  </Sketch>
}

function LittleOrbit() {
  return <Sketch>
    <ellipse cx="111" cy="118" rx="34" ry="69" transform="rotate(-44 111 118)" />
    <circle cx="111" cy="118" r="23" />
    <path className={styles.warm} d="M55 67q-12 6-7 16q8 9 16 0q8-10-9-16Z" />
  </Sketch>
}

function LittleHeart() {
  return <Sketch>
    <path className={styles.warm} d="M107 176c-63-40-69-71-45-86c22-14 42 6 48 24c13-27 34-41 51-18c22 29-11 56-54 80Z" />
    <path d="m173 67 12-10m-9 30 15-1" />
  </Sketch>
}

function LittleSpiral() {
  return <Sketch>
    <path d="M109 122c12-16 25 1 17 12c-14 19-45 0-35-22c16-37 67-8 54 25c-23 58-102 12-81-31c24-52 93-41 111 6" />
    <path className={styles.warm} d="m164 109 11 5 2-12" />
  </Sketch>
}

function ShootingStar() {
  return <Sketch>
    <path d="M36 173c32-7 54-34 87-47M48 193c31-8 51-29 71-48" />
    <path className={styles.warm} d="m146 66 6 32 32 2-27 18 9 32-28-21-28 20 10-31-25-20 32-1Z" />
  </Sketch>
}

function LittleMoon() {
  return <Sketch>
    <path d="M136 50c-60 1-86 68-51 111c26 33 72 29 96 0c-33 14-68-10-72-40c-5-33 9-55 27-71Z" />
    <path className={styles.warm} d="M159 88v21m-10-11h21" />
  </Sketch>
}

const DRAWINGS = {
  rock: CosmicRock, cloud: PossibilityCloud, paths: ForkingPaths,
  particles: EntangledParticles, waves: ChangingFrequency, self: ChangingSelf,
  sprout: Becoming, alive: Alive, converging: ConvergingPaths, together: Together,
  stars: LittleStars, orbit: LittleOrbit, heart: LittleHeart, spiral: LittleSpiral,
  shootingStar: ShootingStar, moon: LittleMoon,
} as const

type Placement = DoodlePlacement<keyof typeof DRAWINGS>

// Loose compositions change their balance, scale and location with each chapter.
// Stable placements avoid layout jumps or different artwork after hydration.
const COMPOSITIONS: readonly (readonly Placement[])[] = [
  [
    { drawing: 'rock', side: 'left', x: 38, y: 31, size: 158, rotation: -13 },
    { drawing: 'cloud', side: 'right', x: 62, y: 69, size: 174, rotation: 9 },
    { drawing: 'moon', side: 'right', x: 29, y: 13, size: 49, rotation: -20 },
    { drawing: 'stars', side: 'left', x: 76, y: 77, size: 43, rotation: 15 },
    { drawing: 'orbit', side: 'left', x: 26, y: 89, size: 55, rotation: 23 },
    { drawing: 'heart', side: 'right', x: 74, y: 39, size: 34, rotation: -18 },
  ],
  [
    { drawing: 'paths', side: 'right', x: 52, y: 28, size: 174, rotation: 12 },
    { drawing: 'particles', side: 'left', x: 48, y: 71, size: 162, rotation: -8 },
    { drawing: 'stars', side: 'left', x: 76, y: 13, size: 43, rotation: 19 },
    { drawing: 'heart', side: 'right', x: 27, y: 86, size: 40, rotation: -16 },
    { drawing: 'orbit', side: 'left', x: 27, y: 36, size: 50, rotation: 24 },
    { drawing: 'shootingStar', side: 'right', x: 72, y: 62, size: 58, rotation: -12 },
  ],
  [
    { drawing: 'waves', side: 'left', x: 54, y: 26, size: 167, rotation: -13 },
    { drawing: 'self', side: 'right', x: 43, y: 64, size: 154, rotation: 10 },
    { drawing: 'spiral', side: 'right', x: 72, y: 14, size: 47, rotation: -22 },
    { drawing: 'heart', side: 'left', x: 27, y: 84, size: 37, rotation: 14 },
    { drawing: 'stars', side: 'right', x: 76, y: 90, size: 39, rotation: 23 },
    { drawing: 'moon', side: 'left', x: 70, y: 60, size: 51, rotation: -12 },
  ],
  [
    { drawing: 'sprout', side: 'right', x: 61, y: 34, size: 153, rotation: -14 },
    { drawing: 'alive', side: 'left', x: 39, y: 73, size: 164, rotation: 12 },
    { drawing: 'orbit', side: 'left', x: 55, y: 12, size: 57, rotation: 16 },
    { drawing: 'stars', side: 'right', x: 24, y: 75, size: 48, rotation: -23 },
    { drawing: 'shootingStar', side: 'left', x: 78, y: 43, size: 43, rotation: -17 },
    { drawing: 'heart', side: 'right', x: 79, y: 91, size: 32, rotation: 14 },
  ],
  [
    { drawing: 'converging', side: 'left', x: 51, y: 43, size: 169, rotation: 7 },
    { drawing: 'together', side: 'right', x: 55, y: 75, size: 156, rotation: -9 },
    { drawing: 'heart', side: 'right', x: 28, y: 14, size: 48, rotation: -12 },
    { drawing: 'stars', side: 'left', x: 78, y: 87, size: 37, rotation: 19 },
    { drawing: 'moon', side: 'right', x: 78, y: 41, size: 50, rotation: 18 },
    { drawing: 'spiral', side: 'left', x: 23, y: 12, size: 45, rotation: -21 },
  ],
]

export function SuperpositionDoodles() {
  return <ThoughtDoodles chapters={CHAPTERS} drawings={DRAWINGS} compositions={COMPOSITIONS} />
}
