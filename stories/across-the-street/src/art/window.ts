import { sprite } from './lib/sprite.ts'

/**
 * The window on Marcus's back wall, looking east over the rooftops
 * opposite — the sun's source. Panes show sky, a low sun, roof edges.
 */
export default sprite('window', 80, 96, 'a tall window with the morning sun over the rooftops opposite', (r) => {
  r.box(4, 0, 72, 90, 'cream')                                  // frame
  r.box(10, 6, 60, 78, 'sky', { weight: 2 })                    // glass
  // the view: the low sun, then rooftops across the road
  r.solid(r.mask().oval(40, 26, 20, 20), 'cloud')
  r.solid(r.mask().poly([[12, 60], [26, 60], [26, 54], [44, 54], [44, 62], [56, 62], [56, 50], [68, 50], [68, 82], [12, 82]]), 'cream')
  for (const x of [16, 32, 50, 60]) r.rect(x, 68, 4, 6, 'sky')  // lit windows in the roofs opposite
  r.rect(38, 6, 4, 78, 'line')                                  // mullion
  r.rect(10, 44, 60, 4, 'line')                                 // transom
  r.box(0, 86, 80, 8, 'cream')                                  // sill
})
