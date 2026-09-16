/**
 * Hand-made marks.
 *
 * Every line on the Thoughts pages is generated here rather than drawn as
 * a rectangle: a slightly bowed centreline, a pen that lands with a small
 * hook, presses, and lifts off into a taper.
 *
 * Only + − × ÷ and sqrt are used (all exactly specified by IEEE-754), so
 * the server and every browser produce byte-identical paths — no
 * hydration drift from engine-specific Math.sin implementations.
 */

export interface Stroke {
  d: string
  /** viewBox width — the stroke's length in px */
  width: number
  /** viewBox height, centred on y = 0 */
  height: number
}

export interface StrokeOptions {
  /** length of the mark in px */
  length: number
  /** any integer — the same seed always draws the same mark */
  seed: number
  /** pen thickness at full pressure, in px */
  weight?: number
  /** how far the line may bow away from straight, in px */
  bow?: number
  /** size of the landing hook at the start, in px */
  hook?: number
}

function prng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const smooth = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

/** smooth random wander through a handful of knots */
function wander(knots: number[], t: number) {
  const span = knots.length - 1
  const i = Math.min(span - 1, Math.floor(t * span))
  const u = t * span - i
  const e = u * u * (3 - 2 * u)
  return knots[i] + (knots[i + 1] - knots[i]) * e
}

const r2 = (n: number) => Math.round(n * 100) / 100

export function handStroke({
  length,
  seed,
  weight = 2.2,
  bow = 2,
  hook = 1.8,
}: StrokeOptions): Stroke {
  const rand = prng(seed * 9973 + 131)
  const signed = () => rand() * 2 - 1

  const bowAmount = signed() * bow
  const drift = signed() * 1.3 - 0.35 // hands tend to drift up a little
  const hookAmount = (0.55 + rand() * 0.45) * hook * (rand() < 0.62 ? 1 : -1)
  const hookSpan = 0.05 + rand() * 0.05
  const wobbleKnots = [0, signed() * 0.35, signed() * 0.45, signed() * 0.35, 0]
  const pressureKnots = [1, 1 + signed() * 0.12, 1 + signed() * 0.1, 1 + signed() * 0.14, 1]

  const samples = 30
  const points: Array<[number, number]> = []
  const widths: number[] = []

  for (let i = 0; i <= samples; i++) {
    const t = i / samples
    const land = t < hookSpan ? (1 - t / hookSpan) * (1 - t / hookSpan) : 0
    const x = t * length
    const y =
      bowAmount * 4 * t * (1 - t) +
      drift * t +
      wander(wobbleKnots, t) +
      hookAmount * land

    // the pen lands, presses, then lifts into a long taper
    const attack = 0.45 + 0.55 * smooth(0, 0.07, t)
    const release = 1 - 0.86 * smooth(0.5, 1, t)
    const w = weight * attack * release * (1 - 0.12 * t) * wander(pressureKnots, t)

    points.push([x, y])
    widths.push(Math.max(0.2, w))
  }

  const left: string[] = []
  const right: string[] = []

  for (let i = 0; i <= samples; i++) {
    const prev = points[Math.max(0, i - 1)]
    const next = points[Math.min(samples, i + 1)]
    const tx = next[0] - prev[0]
    const ty = next[1] - prev[1]
    const len = Math.sqrt(tx * tx + ty * ty) || 1
    const nx = -ty / len
    const ny = tx / len
    const h = widths[i] / 2
    const [px, py] = points[i]
    left.push(`${r2(px + nx * h)} ${r2(py + ny * h)}`)
    right.push(`${r2(px - nx * h)} ${r2(py - ny * h)}`)
  }

  const endCap = r2(widths[samples] / 2)
  const startCap = r2(widths[0] / 2)

  const d = [
    `M${left[0]}`,
    ...left.slice(1).map((p) => `L${p}`),
    `A${endCap} ${endCap} 0 0 1 ${right[samples]}`,
    ...right
      .slice(0, samples)
      .reverse()
      .map((p) => `L${p}`),
    `A${startCap} ${startCap} 0 0 1 ${left[0]}`,
    'Z',
  ].join('')

  return { d, width: length, height: 14 }
}

/** the six (or more) marks of the selector — varied, but never random between renders */
const SELECTOR_LENGTHS = [64, 86, 58, 76, 94, 68, 82, 60, 72]

export function selectorStroke(index: number, scale = 1): Stroke {
  return handStroke({
    length: SELECTOR_LENGTHS[index % SELECTOR_LENGTHS.length] * scale,
    seed: index + 1,
    weight: 2.3,
    bow: 2.2,
    hook: 2,
  })
}
