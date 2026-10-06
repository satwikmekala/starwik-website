import { sprite } from './lib/sprite.ts'

/**
 * Mobile canvas 300×400; the composed (safe) frame is 180×300 at (60, 50).
 * 180×300 fits a 390×844 phone at exactly 2× above the text sheet.
 */
export const MOBILE = { w: 300, h: 400, safe: { x: 60, y: 50, w: 180, h: 300 } } as const
const X = MOBILE.safe.x, Y = MOBILE.safe.y

/** Portrait: the flat fills the frame. Walls and floor run past every edge. */
export default sprite('flat-shell-mobile', MOBILE.w, MOBILE.h, "Marcus's flat, cut open", {
  room: (r) => {
    r.box(0, 0, MOBILE.w, Y + 12, 'cream', { bleed: 'tlr' })                // ceiling slab (cut)
    r.rect(0, Y + 12, MOBILE.w, 188, 'cloud')                               // back wall
    r.box(0, Y + 192, MOBILE.w, 10, 'cream', { bleed: 'lr' })               // skirting
    r.rect(0, Y + 202, MOBILE.w, 88, 'cream')                               // floor, seen from above
    for (let y = Y + 213, row = 0; y < Y + 288; y += 11, row++)
      for (let x = (row % 2) * 22 - 10; x < MOBILE.w; x += 44) r.rect(x, y, 40, 1, 'line')
    r.box(0, Y + 290, MOBILE.w, 12, 'cream', { bleed: 'lr' })              // floor slab (cut)
    r.rect(0, Y + 302, MOBILE.w, MOBILE.h - Y - 302, 'cream')              // the facade below
    for (let x = X - 46; x < MOBILE.w; x += 50) r.box(x, Y + 314, 24, 36, 'sky', { bleed: 'b' })
  },
})
