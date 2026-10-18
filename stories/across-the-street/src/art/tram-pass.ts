import { sprite } from './lib/sprite.ts'

/** A tram pass from Prague. */
export default sprite('tram-pass', 18, 12, 'a tram pass from Prague', (r) => {
  r.box(0, 0, 18, 12, 'cloud')
  r.rect(2, 2, 14, 3, 'line')                                   // coloured band
  r.rect(4, 7, 8, 1, 'text'); r.rect(4, 9, 5, 1, 'text')        // printed lines
  r.rect(14, 7, 2, 3, 'text')                                   // validation stamp
  r.rect(8, 0, 2, 2, 'berry')                                   // pin
})
