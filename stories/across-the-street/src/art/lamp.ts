import { sprite } from './lib/sprite.ts'

/** Floor lamp beside the sofa. */
export default sprite('lamp', 22, 92, 'a floor lamp', (r) => {
  r.rect(10, 18, 2, 70, 'line')                                 // pole
  r.solid(r.mask().oval(3, 84, 16, 8), 'cream')                 // base
  r.solid(r.mask().poly([[5, 0], [17, 0], [22, 20], [0, 20]]), 'cloud') // shade
})
