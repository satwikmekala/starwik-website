import { sprite } from './lib/sprite.ts'

/** A paper club wristband from Berlin, still looped. */
export default sprite('wristband', 20, 10, 'a paper wristband from a club in Berlin', (r) => {
  r.solid(r.mask().round(0, 0, 20, 10, 4).rect(5, 4, 10, 2, 0), 'sky', { weight: 1 }) // loop
  r.rect(4, 3, 12, 1, 'line'); r.rect(4, 6, 12, 1, 'line')
  r.box(14, 2, 6, 6, 'cloud', { weight: 1 })                    // tab
  r.rect(9, 0, 2, 2, 'berry')
})
