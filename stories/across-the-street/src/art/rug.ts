import { sprite } from './lib/sprite.ts'
import type { Raster } from './lib/raster.ts'

const W = 132, H = 28

/** Coffee stain: a union of stair-stepped ovals; `grow` widens it. */
function stain(r: Raster, grow: number) {
  const m = r.mask()
  m.oval(82 - grow, 9 - grow / 3, 22 + grow * 2, 11 + grow / 1.5)
  m.oval(94, 6, 12 + grow, 8 + grow / 3)
  m.oval(76 - grow * 1.4, 13, 12 + grow, 7 + grow / 4)
  if (grow > 4) m.oval(68 - grow, 8, 10 + grow / 2, 6 + grow / 4)
  // stay inside the rug's border
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++)
    if (x < 6 || x >= W - 6 || y < 4 || y >= H - 4) m.on[y * W + x] = 0
  return m
}

/**
 * THE rug — the hero object and the story's progress bar. Top-down on the
 * oblique floor. `stain-1..3` is the coffee as it spreads under the cloth;
 * `ring` is what is left when it dries, kept on purpose.
 */
export default sprite('rug', W, H, 'a new rug with a cobalt border', {
  base: (r) => {
    for (let y = 6; y < H - 6; y += 3) { r.rect(0, y, 3, 1, 'line'); r.rect(W - 3, y, 3, 1, 'line') } // fringe
    r.box(3, 0, W - 6, H, 'sky')
    r.box(9, 5, W - 18, H - 10, 'cloud', { weight: 1 })          // inner band
    for (let x = 18; x < W - 18; x += 12)                         // diamond motif
      r.stamp(x, 10, ['..b..', '.bsb.', 'bsssb', '.bsb.', '..b..'])
  },
  'stain-1': (r) => { r.fill(stain(r, 0), 'coffee') },
  'stain-2': (r) => { r.fill(stain(r, 5), 'coffee') },
  'stain-3': (r) => { r.fill(stain(r, 10), 'coffee') },
  ring: (r) => {
    const m = stain(r, 5)
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++)
      if (m.has(x, y) && !(m.has(x - 1, y) && m.has(x + 1, y) && m.has(x, y - 1) && m.has(x, y + 1))) r.set(x, y, 'coffee')
  },
})
