import { sprite } from './lib/sprite.ts'

/** The front door, in its casing. Two recessed panels and a knob. */
export default sprite('door', 56, 116, 'the front door', (r) => {
  r.box(0, 0, 56, 116, 'cloud')                                 // casing
  r.box(5, 5, 46, 111, 'cream', { bleed: 'b' })              // leaf
  r.box(12, 14, 32, 38, null)                                   // panels
  r.box(12, 60, 32, 46, null)
  r.solid(r.mask().oval(40, 56, 6, 6), 'line')                 // knob
})
