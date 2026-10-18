import { standing, type Face } from './lib/figure.ts'
import { sprite } from './lib/sprite.ts'

const hard: Face = { eyes: 'tired', mouth: 'tight', jaw: 'tight', stubble: true }
const C = 36

/** Where the phone sits in his right hand when it is drawn separately. */
export const PHONE_IN_HAND = { x: C + 13, y: 54 } as const

/**
 * The man: Marcus's own template in a long dark coat — raised shoulders,
 * tight jaw, tired eyes, a phone with a dark screen. In `relieved` and
 * `younger` the phone is its own actor (phone.ts) so it can fall silently;
 * PHONE_IN_HAND is where it sits. The dissolve takes coat cells first.
 */
export default sprite('man', 72, 100, 'the man in the long dark coat', {
  stand: (r) => standing(r, { cx: C, wear: 'coat', shoulders: 'raised', face: hard, right: 'phone-hand' }),
  'walk-a': (r) => standing(r, { cx: C, wear: 'coat', shoulders: 'raised', face: hard, right: 'phone-hand', step: 'left' }),
  'walk-b': (r) => standing(r, { cx: C, wear: 'coat', shoulders: 'raised', face: hard, right: 'phone-hand', step: 'right' }),
  point: (r) => standing(r, { cx: C, wear: 'coat', shoulders: 'raised', face: hard, left: 'point', right: 'phone-hand' }),
  over: (r) => standing(r, { cx: C, wear: 'coat', shoulders: 'raised', face: { ...hard, eyes: 'down' }, right: 'phone-hand' }),
  soft: (r) => standing(r, { cx: C, wear: 'coat', shoulders: 'raised', face: { eyes: 'tired', mouth: 'soft', stubble: true }, right: 'phone-hand' }),
  relieved: (r) => standing(r, { cx: C, wear: 'coat', face: { eyes: 'closed', mouth: 'soft', stubble: true } }),
  younger: (r) => standing(r, { cx: C, wear: 'coat', face: { eyes: 'open', mouth: 'soft' } }),
})
