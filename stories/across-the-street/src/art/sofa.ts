import { sprite } from './lib/sprite.ts'

/** Marcus's sofa, side-on against the back wall. */
export default sprite('sofa', 96, 46, 'a sofa', (r) => {
  r.solid(r.mask().round(6, 0, 84, 30, 5), 'cream')            // back
  r.line(48, 4, 48, 21, 'line')                                // back cushion seam
  r.solid(r.mask().round(12, 20, 38, 16, 3), 'cream')           // seat cushions
  r.solid(r.mask().round(46, 20, 38, 16, 3), 'cream')
  r.solid(r.mask().round(0, 12, 18, 30, 4), 'cream')            // arms
  r.solid(r.mask().round(78, 12, 18, 30, 4), 'cream')
  r.box(6, 34, 84, 8, 'cream')                                  // base
  r.rect(10, 42, 4, 4, 'line')                                  // feet
  r.rect(82, 42, 4, 4, 'line')
})
