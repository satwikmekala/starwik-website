import { sprite } from './lib/sprite.ts'

/** Kitchen chair, side-on, facing right toward the breakfast table. */
export default sprite('chair', 26, 56, 'a wooden chair', (r) => {
  r.box(0, 0, 7, 56, 'cream')                                   // back post + rear leg
  r.box(1, 8, 5, 4, null)                                       // back rail
  r.box(18, 34, 6, 22, 'cream')                                 // front leg
  r.box(0, 28, 26, 7, 'cream')                                  // seat
})
