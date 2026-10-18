import { sprite } from './lib/sprite.ts'

/** The front door in its casing. `frame` + (`leaf` | hallway + `open`). The opening is (5, 5, 46, 111). */
export const DOOR_OPENING = { x: 5, y: 5, w: 46, h: 111 } as const

export default sprite('door', 56, 116, 'the front door', {
  frame: (r) => r.solid(r.mask().rect(0, 0, 56, 116).rect(5, 5, 46, 111, 0), 'cloud', { bleed: 'b' }),
  leaf: (r) => {
    r.box(5, 5, 46, 111, 'cream', { bleed: 'b' })
    r.box(12, 14, 32, 38, null)                                   // panels
    r.box(12, 60, 32, 46, null)
    r.solid(r.mask().oval(40, 56, 6, 6), 'line')                 // knob
  },
  open: (r) => {
    r.solid(r.mask().poly([[5, 5], [16, 12], [16, 112], [5, 116]]), 'cream', { bleed: 'b' }) // the leaf, swung in
    r.rect(12, 60, 2, 4, 'line')
  },
})
