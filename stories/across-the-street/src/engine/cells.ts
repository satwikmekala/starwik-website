import type { Ink } from '../art/palette.ts'
import type { InkPath } from '../art/lib/paths.ts'

export interface Cell { x: number; y: number; ink: Ink }

/** Expands compiled rect paths back into single cells (for stains, particles). */
export function cellsOf(paths: readonly InkPath[]): Cell[] {
  const out: Cell[] = []
  for (const [ink, d] of paths) {
    for (const m of d.matchAll(/M(-?\d+) (-?\d+)h(\d+)v(\d+)/g)) {
      const x0 = +m[1], y0 = +m[2], w = +m[3], h = +m[4]
      for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) out.push({ x, y, ink })
    }
  }
  return out
}

/** Small deterministic PRNG so every reader sees the same stain and dust. */
export function rng(seed: number) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}
