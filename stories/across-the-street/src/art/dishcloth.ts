import { sprite } from './lib/sprite.ts'

/** A tea towel folded over the chair back: two cobalt bands near the hem. */
export default sprite('dishcloth', 13, 24, 'a dishcloth over the chair', (r) => {
  r.box(0, 0, 13, 24, 'cloud')
  r.rect(2, 15, 9, 2, 'line')
  r.rect(2, 19, 9, 1, 'line')
  r.rect(6, 2, 1, 9, 'line')                                    // the fold
})
