import { sprite } from './lib/sprite.ts'

/**
 * The breakfast table by the window: soft eggs on a plate and halved
 * strawberries in a white bowl. Items are a separate part so they can
 * cool, dim and return.
 */
export default sprite('breakfast-table', 64, 56, 'the breakfast table: eggs on a plate and a white bowl of halved strawberries', {
  base: (r) => {
    r.box(4, 18, 7, 38, 'cream')                                // legs
    r.box(53, 18, 7, 38, 'cream')
    r.box(0, 12, 64, 8, 'cream')                                // top
  },
  cold: (r) => {
    r.solid(r.mask().oval(7, 6, 19, 5), 'cream')                // the eggs, gone flat and cold
    r.rect(10, 7, 12, 1, 'line')
    r.solid(r.mask().oval(3, 8, 26, 6), 'cloud')
    for (const [x, y] of [[35, 1], [41, 0], [47, 2], [38, 4]] as const)
      r.stamp(x, y, ['.rrr.', 'rcrcr', 'rrcrr', '.rrr.'])
    r.solid(r.mask().oval(32, -2, 24, 16).rect(32, -2, 24, 7, 0), 'cloud')
  },
  breakfast: (r) => {
    r.solid(r.mask().oval(7, 4, 9, 7).oval(13, 2, 9, 9).oval(19, 5, 7, 6), 'cream') // soft scrambled eggs
    r.solid(r.mask().oval(3, 8, 26, 6), 'cloud')               // plate
    // strawberries, halved, cut faces up
    for (const [x, y] of [[35, 1], [41, 0], [47, 2], [38, 4]] as const)
      r.stamp(x, y, ['.rrr.', 'rcrcr', 'rrcrr', '.rrr.'])
    r.solid(r.mask().oval(32, -2, 24, 16).rect(32, -2, 24, 7, 0), 'cloud') // white bowl
  },
})
