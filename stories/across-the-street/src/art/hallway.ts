import { sprite } from './lib/sprite.ts'
import type { Raster } from './lib/raster.ts'

/**
 * Scene C — what the open front door shows. `white`: his building's soft
 * white corridor. `old`: the hallway of the old flat, flat dead beige, and
 * on the ceiling a wide brown water stain shaped almost like a hand.
 * Deep space, so the perspective lines are 1 px.
 */
const W = 46, H = 111
const ceiling = [[0, 0], [W, 0], [31, 34], [15, 34]] as const
const floor = [[0, H], [W, H], [31, 80], [15, 80]] as const
const leftWall = [[0, 0], [15, 34], [15, 80], [0, H]] as const
const rightWall = [[W, 0], [31, 34], [31, 80], [W, H]] as const

function corridor(r: Raster, walls: 'cloud' | 'cream', floorInk: 'cream' | 'sky') {
  const w = { weight: 1 }
  r.solid(r.mask().poly(leftWall), walls, w)
  r.solid(r.mask().poly(rightWall), walls, w)
  r.solid(r.mask().poly(ceiling), walls, w)
  r.solid(r.mask().poly(floor), floorInk, w)
  r.box(15, 34, 17, 47, 'cream', w)                               // far wall
  r.box(19, 48, 9, 33, walls === 'cloud' ? 'cloud' : 'sky', w)    // a far door
}

export default sprite('hallway', W, H, 'the hallway beyond the front door', {
  white: (r) => corridor(r, 'cloud', 'cream'),
  old: (r) => {
    corridor(r, 'cream', 'cream')
    r.stamp(13, 6, [
      '..o..o..o.........',
      '..o.oo..o...o.....',
      '.oo.oo.oo..oo.....',
      '.oo.oooooo.oo.....',
      '.ooooooooooo......',
      '..oooooooooo...oo.',
      '..ooooooooooo.ooo.',
      '...oooooooooooooo.',
      '...ooooooooooooo..',
      '....oooooooooo....',
      '.....oooooooo.....',
      '......ooooo.......',
    ])
    r.rect(4, 58, 3, 9, 'coffee'); r.rect(5, 67, 2, 4, 'coffee')  // damp on the wall
    r.rect(23, 34, 1, 6, 'line')                                   // a bare bulb
    r.solid(r.mask().oval(21, 39, 5, 5), 'cloud', { weight: 1 })
  },
})
