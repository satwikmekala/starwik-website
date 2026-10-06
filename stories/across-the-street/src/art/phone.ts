import { sprite } from './lib/sprite.ts'

/** His phone. The screen stays dark: no call, no name. `lying` is where it lands. */
export default sprite('phone', 12, 12, 'his phone, the screen dark', {
  base: (r) => { r.box(0, 0, 7, 11, 'text'); r.rect(2, 8, 3, 1, 'line') },
  lying: (r) => { r.box(0, 6, 12, 6, 'text'); r.rect(9, 8, 1, 2, 'line') },
})
