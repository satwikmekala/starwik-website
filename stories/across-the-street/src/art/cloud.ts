import { sprite } from './lib/sprite.ts'

/** Two cloud shapes, puffs of stair-stepped ovals. */
export default sprite('cloud', 72, 30, 'a cloud', {
  a: (r) => r.solid(r.mask().oval(0, 12, 26, 18).oval(14, 2, 30, 26).oval(34, 8, 26, 22).oval(48, 14, 24, 16).rect(10, 20, 54, 10), 'cloud'),
  b: (r) => r.solid(r.mask().oval(4, 10, 24, 20).oval(20, 0, 26, 30).rect(10, 18, 44, 12).oval(40, 12, 20, 18), 'cloud'),
})
