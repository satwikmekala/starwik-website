import { sprite } from './lib/sprite.ts'

/** The mug. Upright; `tipped` is the same mug on its side, empty. */
export default sprite('mug', 14, 12, 'a coffee mug', {
  base: (r) => {
    r.box(8, 3, 6, 6, null)                                     // handle
    r.box(0, 0, 10, 12, 'cloud')                                // body
    r.rect(2, 2, 6, 1, 'coffee')                                // coffee line at the rim
  },
  falling: (r) => {
    r.solid(r.mask().poly([[2, 5], [9, 1], [14, 9], [7, 12]]), 'cloud') // turning in the air
    r.set(1, 2, 'coffee'); r.set(3, 0, 'coffee'); r.set(0, 4, 'coffee')
  },
  tipped: (r) => {
    r.box(1, 0, 6, 6, null)                                     // handle, now on top
    r.box(0, 3, 12, 9, 'cloud')                                 // body on its side
    r.rect(10, 5, 1, 5, 'line')                                 // the open mouth
  },
})
