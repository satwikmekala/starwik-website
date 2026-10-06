/**
 * The coat lets go. Every cell of the man's sprite is a particle whose
 * state is a pure function of p (0..1, how long your hand has been on his
 * shoulder): release early and p eases back, so the same function plays
 * the dissolve in reverse and the coat settles back into place.
 *
 * Order (the story's): the fabric under Marcus's hand first, then the
 * sleeve and the hand, the rest of the coat, the legs — the face last.
 * Each square lifts along the sunbeam toward the window and pales into it.
 */
import { SPRITE_DATA } from '../art/compiled.ts'
import type { Ink } from '../art/palette.ts'
import { cellsOf, rng } from './cells.ts'
import type { Particle } from './renderer.ts'

interface Seed { x: number; y: number; ink: Ink; delay: number; dx: number; dy: number; wob: number; ph: number }

const SPAN = 0.22 // each square takes this long (in p) to leave

export function prepareDissolve(part = 'relieved', shoulder: [number, number], towardWindow: -1 | 1): Seed[] {
  const cells = cellsOf(SPRITE_DATA.man?.parts[part] ?? [])
  const r = rng(31)
  const seeds = cells.map((c) => {
    const isCoat = c.ink === 'text' && c.y > 20 && c.y < 86
    const isFace = c.y <= 21
    const dist = Math.hypot(c.x - shoulder[0], (c.y - shoulder[1]) * 0.8)
    // coat: 0 → .45 by distance from the hand; legs .45 → .6; face .6 → .78
    const base = isCoat ? (dist / 70) * 0.45 : isFace ? 0.6 + (c.y / 21) * 0.18 : 0.45 + Math.min(1, dist / 90) * 0.15
    const len = 40 + r() * 60
    return { x: c.x, y: c.y, ink: c.ink, delay: Math.min(1 - SPAN, base + r() * 0.05), dx: towardWindow * (0.45 + r() * 0.35) * len, dy: -(0.9 + r() * 0.3) * len, wob: 1 + r() * 2.5, ph: r() * 6.28 }
  })
  return seeds
}

/** Particles in sprite-local units, at progress p. */
export function dissolveAt(seeds: Seed[], p: number, ox: number, oy: number, out: Particle[] = []) {
  out.length = 0
  for (const s of seeds) {
    const u = Math.min(1, Math.max(0, (p - s.delay) / SPAN))
    if (u >= 1) continue
    const e = u * u * (3 - 2 * u)
    out.push({
      x: ox + s.x + s.dx * e + Math.sin(e * 6 + s.ph) * s.wob * e,
      y: oy + s.y + s.dy * e,
      ink: u > 0.55 ? 'cloud' : s.ink,
      alpha: u === 0 ? 1 : 1 - e * e,
    })
  }
  return out
}
