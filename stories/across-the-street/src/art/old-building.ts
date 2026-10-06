import { sprite } from './lib/sprite.ts'

export const OLD_WINDOW = { x: 92, y: 68, w: 34, h: 34 } as const

/**
 * The building across the road. Shuttered bank on the ground floor; Marcus
 * lived on the third floor (British count), and the second window from the
 * left is the old kitchen — the one that never shut, with a towel in the gap.
 */
export default sprite('old-building', 260, 262, 'the old building across the road, above a shuttered bank', {
  base: (r) => {
    r.solid(r.mask().poly([[0, 8], [12, 2], [12, 262], [0, 262]]), 'cream', { bleed: 'b' })  // slim side face
    r.solid(r.mask().rect(10, 6, 250, 256), 'cream', { bleed: 'rb' })
    r.box(6, 0, 254, 12, 'cream', { bleed: 'r' })                        // cornice
    // floors 4..1 (top to bottom), three sash windows each
    for (let f = 0; f < 4; f++) for (let i = 0; i < 3; i++) {
      const x = 30 + i * 62, y = 20 + f * 48
      r.box(x, y, 34, 34, 'sky')
      r.rect(x, y + 16, 34, 2, 'line')                                      // meeting rail
      r.box(x - 3, y + 33, 40, 5, 'cream')                                  // sill
    }
    // ground floor: the shuttered bank
    r.rect(10, 210, 250, 2, 'line')
    r.box(22, 214, 110, 10, 'cream')                                        // fascia
    for (const x of [24, 36, 48, 60, 72, 84, 96, 108, 120]) r.rect(x, 218, 6, 2, 'line') // lettering, abstracted
    r.box(22, 228, 52, 34, 'cloud', { bleed: 'b' })                       // shutters
    r.box(80, 228, 52, 34, 'cloud', { bleed: 'b' })
    for (let y = 232; y < 262; y += 4) { r.rect(24, y, 48, 1, 'line'); r.rect(82, y, 48, 1, 'line') }
    r.box(150, 222, 34, 40, 'sky', { bleed: 'b' })                       // street door
  },
  towel: (r) => {
    const { x, y } = OLD_WINDOW
    r.box(x + 4, y + 13, 26, 6, 'cloud', { weight: 1 })                    // towel in the gap
    r.rect(x + 8, y + 15, 18, 1, 'line')
    r.box(x + 22, y + 17, 8, 9, 'cloud', { weight: 1 })                    // a corner hanging down
  },
})
