import { sprite } from './lib/sprite.ts'

/** Desktop canvas 800×480; the composed (safe) frame is 640×360 at (80, 60). */
export const DESKTOP = { w: 800, h: 480, safe: { x: 80, y: 60, w: 640, h: 360 } } as const
const X = DESKTOP.safe.x, Y = DESKTOP.safe.y

/**
 * Marcus's building, cut away at the fourth floor so we see into the flat,
 * (desktop copy sits on the open upper wall, safe y ≈ 4–104)
 * plus the street across the road where the old building stands.
 * Coordinates below are in safe-frame units (+X/+Y).
 */
export default sprite('flat-shell-desktop', DESKTOP.w, DESKTOP.h, "Marcus's building, cut open to show his flat", {
  street: (r) => {
    r.box(X + 430, Y + 300, DESKTOP.w - X - 430, 12, 'cream', { bleed: 'r' })               // far pavement
    r.rect(X + 430, Y + 312, DESKTOP.w - X - 430, DESKTOP.h - Y - 312, 'cream') // road
    for (let x = X + 452; x < DESKTOP.w; x += 22) r.rect(x, Y + 336, 12, 2, 'line')
    for (let x = X + 440; x < DESKTOP.w; x += 16) r.rect(x, Y + 304, 1, 6, 'line') // paving joints
  },
  building: (r) => {
    // The cutaway runs off the top of the frame: the room's upper wall is
    // where desktop copy lives, so no roof — just the cut slab above.
    const facade = r.mask().rect(X + 8, 0, 420, DESKTOP.h).rect(X + 20, 0, 396, Y + 262, 0)
    r.solid(facade, 'cream', { bleed: 'tb' })
    r.solid(r.mask().poly([[X + 426, 0], [X + 438, 0], [X + 438, DESKTOP.h], [X + 426, DESKTOP.h]]), 'cream', { bleed: 'tb' }) // slim side face
    for (let i = 0; i < 5; i++) for (const y of [Y + 282, Y + 352]) {       // the floors below
      r.box(X + 40 + i * 76, y, 26, 36, 'sky')
      r.rect(X + 52 + i * 76, y + 2, 2, 32, 'line')
    }
  },
  room: (r) => {
    r.rect(X + 20, 0, 396, Y + 226, 'cloud')                                // back wall
    r.box(X + 18, Y - 44, 400, 12, 'cream')                                 // ceiling slab (cut), above the frame
    r.box(X + 20, Y + 218, 396, 8, 'cream')                                 // skirting
    r.rect(X + 20, Y + 226, 396, 26, 'cream')                               // floor, seen from above
    for (const [row, y] of [Y + 233, Y + 241].entries())                    // board joints
      for (let x = X + 20 - row * 20; x < X + 416; x += 40)
        r.rect(Math.max(x, X + 22), y, Math.min(x + 36, X + 414) - Math.max(x, X + 22), 1, 'line')
    r.box(X + 18, Y + 252, 400, 12, 'cream')                                // floor slab (cut)
  },
})
