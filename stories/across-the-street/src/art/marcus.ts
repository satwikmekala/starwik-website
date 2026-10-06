import { crouching, standing, type Face } from './lib/figure.ts'
import { sprite } from './lib/sprite.ts'

const calm: Face = { eyes: 'open', mouth: 'soft' }
const C = 28

/**
 * Marcus. Standing poses are 72×100 with the body centred on x 28 (feet
 * at y 98) so the reaching arm fits; crouching 56×66 (feet at y 64).
 * Same template as the man — only his clothes and his ease differ.
 */
export const marcus = sprite('marcus', 72, 100, 'Marcus', {
  stand: (r) => standing(r, { cx: C, wear: 'tee', face: calm }),
  'walk-a': (r) => standing(r, { cx: C, wear: 'tee', face: calm, step: 'left' }),
  'walk-b': (r) => standing(r, { cx: C, wear: 'tee', face: calm, step: 'right' }),
  mug: (r) => standing(r, { cx: C, wear: 'tee', face: calm, right: 'mug' }),
  cloth: (r) => standing(r, { cx: C, wear: 'tee', face: { eyes: 'down', mouth: 'soft' }, right: 'cloth' }),
  worried: (r) => standing(r, { cx: C, wear: 'tee', face: { eyes: 'down', mouth: 'tight' } }),
  reach: (r) => standing(r, { cx: C, wear: 'tee', face: { eyes: 'open', mouth: 'soft' }, right: 'reach' }),
})

export const marcusCrouch = sprite('marcus-crouch', 56, 66, 'Marcus, crouching by the rug', {
  'scrub-a': (r) => crouching(r, C, { eyes: 'down', mouth: 'tight' }, 0),
  'scrub-b': (r) => crouching(r, C, { eyes: 'down', mouth: 'tight' }, 5),
  still: (r) => crouching(r, C, { eyes: 'open', mouth: 'soft' }, 0),
  up: (r) => crouching(r, C, { eyes: 'open', mouth: 'open' }, 0),
})
