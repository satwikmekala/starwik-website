import { sprite } from './lib/sprite.ts'

/** Mobile street: the same 360×420 canvas and (90, 60) safe frame as the mobile flat. */
export const MOBILE_STREET = { w: 360, h: 420, safe: { x: 90, y: 60, w: 180, h: 300 } } as const
const Y = MOBILE_STREET.safe.y

/** Portrait street seen from Marcus's window: the far pavement and the road. */
export default sprite('street-shell-mobile', MOBILE_STREET.w, MOBILE_STREET.h, 'the street below', (r) => {
  r.box(0, Y + 264, MOBILE_STREET.w, 14, 'cream', { bleed: 'lr' })          // pavement
  for (let x = 6; x < MOBILE_STREET.w; x += 16) r.rect(x, Y + 268, 1, 8, 'line')
  r.rect(0, Y + 278, MOBILE_STREET.w, MOBILE_STREET.h - Y - 278, 'cream')  // road
  for (let x = 4; x < MOBILE_STREET.w; x += 22) r.rect(x, Y + 302, 12, 2, 'line')
})
