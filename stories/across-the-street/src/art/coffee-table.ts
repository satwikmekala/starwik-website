import { sprite } from './lib/sprite.ts'

/** Low coffee table that stands on the rug. */
export default sprite('coffee-table', 48, 20, 'a low coffee table', (r) => {
  r.box(4, 6, 6, 14, 'cream')                                   // legs
  r.box(38, 6, 6, 14, 'cream')
  r.box(8, 13, 32, 3, null)                                     // stretcher
  r.box(0, 0, 48, 7, 'cream')                                   // top
})
