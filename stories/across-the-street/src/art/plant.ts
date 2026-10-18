import { sprite } from './lib/sprite.ts'
import type { Raster, Point } from './lib/raster.ts'

const leaf = (r: Raster, pts: Point[]) => r.solid(r.mask().poly(pts), 'sky')

/** The plant by the window: a pot and long pointed leaves. */
export default sprite('plant', 32, 66, 'a potted plant with long leaves', (r) => {
  r.line(15, 46, 6, 20, 'line'); r.line(16, 46, 24, 14, 'line'); r.line(15, 46, 16, 6, 'line')
  leaf(r, [[16, 0], [22, 10], [17, 26], [11, 12]])
  leaf(r, [[30, 6], [31, 16], [21, 24], [22, 13]])
  leaf(r, [[0, 12], [10, 16], [12, 30], [2, 24]])
  leaf(r, [[32, 26], [28, 36], [18, 36], [24, 28]])
  leaf(r, [[0, 34], [8, 30], [14, 38], [4, 42]])
  r.solid(r.mask().poly([[6, 46], [26, 46], [23, 66], [9, 66]]), 'cream') // pot
  r.box(4, 44, 24, 6, 'cream')                                            // rim
})
