/**
 * Raster → SVG path data. Same-ink cells are merged into rectangles
 * greedily (grow right, then down), and every rectangle of one ink is
 * emitted into a single `d` string with relative h/v commands. Integer
 * coordinates + `shape-rendering: crispEdges` = no anti-aliasing and no
 * hairline seams between neighbours.
 */
import { INKS, type Ink } from '../palette.ts'
import type { Raster } from './raster.ts'

export type InkPath = readonly [ink: Ink, d: string]

export function toPaths(r: Raster): InkPath[] {
  const { w, h, cells } = r
  const used = new Uint8Array(w * h)
  const out = new Map<number, string[]>()
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const k = y * w + x, v = cells[k]
    if (!v || used[k]) continue
    let rw = 1
    while (x + rw < w && cells[k + rw] === v && !used[k + rw]) rw++
    let rh = 1
    grow: while (y + rh < h) {
      const row = (y + rh) * w + x
      for (let i = 0; i < rw; i++) if (cells[row + i] !== v || used[row + i]) break grow
      rh++
    }
    for (let j = 0; j < rh; j++) used.fill(1, (y + j) * w + x, (y + j) * w + x + rw)
    let list = out.get(v)
    if (!list) out.set(v, (list = []))
    list.push(`M${x} ${y}h${rw}v${rh}h${-rw}z`)
  }
  return [...out.entries()].sort(([a], [b]) => a - b).map(([v, parts]) => [INKS[v - 1], parts.join('')] as const)
}
