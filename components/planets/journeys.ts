import type { PlanetKind, PlanetView } from './renderer'

// How each world takes you in. Times are seconds from the click.
//   coverAt — the passage is opaque from here; the route changes underneath
//   reveal  — how long the passage takes to open onto the new page
//   planetUntil — after this the departing planet is buried, so stop drawing it

export interface Journey {
  coverAt: number
  reveal: number
  planetUntil: number
  /** the departing planet's flight: from its spot on the page to its end state */
  planet: (t: number, from: PlanetView, screen: { w: number; h: number }) => PlanetView
  /** the shader's disc radius, as a share of the planet box (matches shader.ts) */
  disc: number
  kicks?: [number, number, number, number]
}

const clamp = (n: number) => Math.max(0, Math.min(n, 1))
const easeOut = (n: number) => 1 - Math.pow(1 - clamp(n), 3)
const easeInOut = (n: number) => {
  const x = clamp(n)
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** glide to screen centre while easing the box from `from.size` to `size` */
function glide(t: number, dur: number, from: PlanetView, screen: { w: number; h: number }, size: number): PlanetView {
  const k = easeInOut(t / dur)
  return {
    cx: lerp(from.cx, screen.w / 2, k),
    cy: lerp(from.cy, screen.h / 2, k),
    size: from.size * Math.pow(size / from.size, easeOut(t / dur)),
  }
}

/** four on the floor, accelerating out of the hover groove — the last one is the drop */
const KICKS: [number, number, number, number] = [0.1, 0.4, 0.7, 1.0]

export const JOURNEYS: Record<PlanetKind, Journey> = {
  music: {
    coverAt: 1.16,
    reveal: 0.85,
    planetUntil: 1.2,
    disc: 0.42 * 0.5,
    kicks: KICKS,
    planet: (t, from, screen) => {
      const v = glide(t, 0.55, from, screen, Math.min(screen.w, screen.h) * 1.15)
      // every kick pumps the planet like a speaker cone
      let pump = 0
      for (const k of KICKS) if (t >= k) pump += Math.exp(-(t - k) * 10) * (k === KICKS[3] ? 0 : 1)
      const dive = t > KICKS[3] ? Math.exp((t - KICKS[3]) * 9) : 1
      return { ...v, size: v.size * (1 + 0.06 * pump) * dive }
    },
  },
  travel: {
    coverAt: 1.0,
    reveal: 1.05,
    planetUntil: 1.05,
    disc: 0.5 * 0.5,
    planet: (t, from, screen) => {
      // straight into the atmosphere — the clouds take over on the way down
      const k = easeInOut(t / 1.0)
      const drift = easeOut(Math.min(t / 0.6, 1))
      const far = Math.hypot(screen.w, screen.h) * 4
      return {
        cx: lerp(from.cx, screen.w / 2, drift),
        cy: lerp(from.cy, screen.h / 2, drift),
        size: from.size * Math.pow(far / from.size, k),
      }
    },
  },
  thoughts: {
    coverAt: 1.0,
    reveal: 1.0,
    planetUntil: 1.0,
    disc: 0.64 * 0.5,
    planet: (t, from, screen) => {
      const v = glide(t, 0.6, from, screen, Math.min(screen.w, screen.h) * 1.2)
      return { ...v, size: v.size * (1 + 0.12 * easeInOut((t - 0.6) / 0.4)) }
    },
  },
  building: {
    coverAt: 1.0,
    reveal: 0.9,
    planetUntil: 1.0,
    disc: 0.6 * 0.5,
    planet: (t, from, screen) => glide(t, 0.45, from, screen, Math.min(screen.w, screen.h) * 1.0),
  },
}

/**
 * The music planet's own beat (shader.ts) fires whenever fract(clock·2) wraps.
 * Map the passage's kick grid onto that clock so the planet thumps on our beats.
 */
export function beatClock(t: number, kicks: [number, number, number, number]) {
  const step = kicks[1] - kicks[0]
  return (t - kicks[0]) / step / 2 + 100
}

type AudioContextConstructor = new () => AudioContext

/** Frequencies has a sound: four kicks that land with the visuals, the last one a drop. */
export function playKicks(kicks: [number, number, number, number]) {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    const t0 = ctx.currentTime + 0.02
    const master = ctx.createGain()
    master.gain.value = 0.22
    master.connect(ctx.destination)

    kicks.forEach((k, i) => {
      const drop = i === kicks.length - 1
      const at = t0 + k
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(drop ? 140 : 120, at)
      osc.frequency.exponentialRampToValueAtTime(drop ? 32 : 45, at + (drop ? 0.5 : 0.14))
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.0001, at)
      gain.gain.exponentialRampToValueAtTime(drop ? 1 : 0.55 + i * 0.12, at + 0.006)
      gain.gain.exponentialRampToValueAtTime(0.0001, at + (drop ? 0.9 : 0.24))
      osc.connect(gain)
      gain.connect(master)
      osc.start(at)
      osc.stop(at + 1)
    })

    // a soft riser of filtered noise under the build, cut by the drop
    const len = Math.ceil(ctx.sampleRate * kicks[3])
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.Q.value = 1.2
    filter.frequency.setValueAtTime(400, t0)
    filter.frequency.exponentialRampToValueAtTime(5000, t0 + kicks[3])
    const ng = ctx.createGain()
    ng.gain.setValueAtTime(0.0001, t0)
    ng.gain.exponentialRampToValueAtTime(0.12, t0 + kicks[3] - 0.02)
    ng.gain.exponentialRampToValueAtTime(0.0001, t0 + kicks[3])
    noise.connect(filter)
    filter.connect(ng)
    ng.connect(master)
    noise.start(t0)

    window.setTimeout(() => void ctx.close(), (kicks[3] + 1.5) * 1000)
  } catch {
    /* sound never gates navigation */
  }
}

/** phones that can, feel the beat */
export function buzzKicks(kicks: [number, number, number, number]) {
  if (!('vibrate' in navigator)) return
  // browsers refuse (noisily) without a real tap first
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return
  const pattern: number[] = []
  let at = 0
  kicks.forEach((k, i) => {
    if (i > 0) pattern.push(Math.round((k - at) * 1000) - pattern[pattern.length - 1])
    pattern.push(i === kicks.length - 1 ? 45 : 14)
    at = k
  })
  window.setTimeout(() => navigator.vibrate(pattern), kicks[0] * 1000)
}
