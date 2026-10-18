import { sprite } from './lib/sprite.ts'

/** The board beside the door, put up in March. Pinned pieces are their own sprites. */
export default sprite('corkboard', 58, 40, 'a pinboard beside the front door', (r) => {
  r.box(0, 0, 58, 40, 'cream')
  // a sparse speckle so it reads as cork, not paper
  for (let y = 5; y < 36; y += 4) for (let x = 5 + ((y / 4) % 2) * 3; x < 54; x += 7) r.set(x, y, 'line')
})
