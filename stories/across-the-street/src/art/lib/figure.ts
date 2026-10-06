/**
 * THE shared character template. Marcus and the man are the same call:
 * same head, same hair, same eyes, same outline. The man differs only by
 * the options below — long dark coat, raised shoulders, tight jaw, tired
 * eyes, and a phone. That sameness is the story's secret; keep it.
 *
 * Front-facing, centred on `cx`. Standing figures are 100 tall with feet
 * on y = 98; crouching figures are 66 tall with feet on y = 64.
 */
import type { Raster } from './raster.ts'

export type Eyes = 'open' | 'tired' | 'closed' | 'down'
export type Mouth = 'soft' | 'tight' | 'open'
export interface Face { eyes: Eyes; mouth: Mouth; jaw?: 'tight'; stubble?: boolean }

export interface FigureOptions {
  cx: number
  /** 'tee' = Marcus (white tee, barefoot); 'coat' = the man (long dark coat, shoes) */
  wear: 'tee' | 'coat'
  shoulders?: 'normal' | 'raised'
  face: Face
  /** left/right arm poses; 'down' unless set */
  left?: ArmPose
  right?: ArmPose
  /** walking frame: which foot is lifted */
  step?: 'left' | 'right'
}
export type ArmPose = 'down' | 'phone-hand' | 'cloth' | 'mug' | 'reach' | 'point' | 'ear'

/** The head: identical for every character in every pose. */
export function head(r: Raster, cx: number, top: number, face: Face) {
  const x = cx - 9
  r.solid(r.mask().oval(x, top, 18, 21), 'cream')
  // hair: the same cap and sideburns on both of them
  const hair = r.mask().oval(x, top, 18, 21)
  hair.rect(x, top + 5, 18, 30, 0)
  hair.rect(x, top + 5, 3, 3).rect(x + 15, top + 5, 3, 3)
  r.fill(hair, 'line')
  const ey = top + 10
  for (const ex of [cx - 6, cx + 4]) {
    if (face.eyes === 'closed') r.rect(ex, ey + 1, 3, 1, 'text')
    else if (face.eyes === 'down') r.rect(ex, ey + 1, 2, 2, 'text')
    else r.rect(ex, ey, 2, 2, 'text')
    if (face.eyes === 'tired') r.rect(ex, ey + 3, 2, 1, 'line')                // the bag under each eye
  }
  const my = top + 16
  if (face.mouth === 'tight') r.rect(cx - 3, my, 6, 1, 'text')
  else if (face.mouth === 'open') r.rect(cx - 1, my, 2, 2, 'text')
  else r.rect(cx - 2, my, 4, 1, 'text')
  if (face.jaw === 'tight') { r.rect(x + 3, top + 13, 1, 4, 'line'); r.rect(x + 14, top + 13, 1, 4, 'line') }
  if (face.stubble) for (const [dx, dy] of [[-4, 15], [-1, 18], [2, 18], [5, 15], [-5, 17], [4, 17], [0, 19]] as const) r.set(cx + dx, top + dy, 'line')
}

function arm(r: Raster, cx: number, side: -1 | 1, pose: ArmPose, wear: 'tee' | 'coat', shoulderY: number) {
  const sleeve = wear === 'coat' ? 'text' : 'cloud'
  const ax = side < 0 ? cx - 17 : cx + 10 // left edge of the arm column
  switch (pose) {
    case 'down':
    case 'cloth':
    case 'phone-hand':
      if (wear === 'coat') r.box(ax, shoulderY + 2, 7, 33, sleeve)
      else { r.box(ax + 1, shoulderY + 12, 6, 22, 'cream'); r.box(ax, shoulderY + 1, 7, 13, sleeve) }
      r.box(ax, shoulderY + 33, 7, 7, 'cream')                                       // hand
      if (pose === 'phone-hand') r.box(side < 0 ? ax - 2 : ax + 3, shoulderY + 30, 6, 10, 'text') // phone, screen dark
      if (pose === 'cloth') { r.box(ax - 2, shoulderY + 37, 11, 14, 'cloud'); r.rect(ax, shoulderY + 46, 7, 2, 'line') } // the dishcloth
      return
    case 'mug': {
      r.box(ax, shoulderY + 1, 7, 13, sleeve)
      const fx = side < 0 ? cx - 10 : cx - 3
      r.box(fx, shoulderY + 16, 15, 6, 'cream')                                     // forearm across the chest
      r.box(side < 0 ? cx - 2 : cx - 8, shoulderY + 10, 10, 11, 'cloud')            // the mug
      r.rect(side < 0 ? cx : cx - 6, shoulderY + 12, 6, 1, 'coffee')
      return
    }
    case 'reach':
    case 'point': {
      const len = pose === 'reach' ? 24 : 18
      const x0 = side < 0 ? cx - 12 - len : cx + 12
      r.box(x0, shoulderY + 1, len, 7, sleeve)                                       // arm held out, level
      r.box(side < 0 ? x0 - 5 : x0 + len - 2, shoulderY, 7, 8, 'cream')             // hand
      return
    }
    case 'ear': {
      r.box(ax, shoulderY - 14, 7, 18, sleeve)                                       // forearm up to the ear
      r.box(side < 0 ? ax + 1 : ax - 1, shoulderY - 19, 7, 7, 'cream')
      r.box(side < 0 ? ax + 3 : ax - 2, shoulderY - 22, 5, 10, 'text')              // phone
      return
    }
  }
}

/** A standing figure, 100 tall, feet on y = 98. */
export function standing(r: Raster, o: FigureOptions) {
  const { cx, wear, face } = o
  const raised = o.shoulders === 'raised'
  const shoulderY = raised ? 21 : 24
  const lift = (s: 'left' | 'right') => (o.step === s ? 3 : 0)
  // legs (the same trousers on both)
  r.box(cx - 9, 54, 9, 42 - lift('left'), 'sky')
  r.box(cx, 54, 9, 42 - lift('right'), 'sky')
  const foot = wear === 'coat' ? 'text' : 'cream'
  r.box(cx - 11, 93 - lift('left'), 11, 6, foot)
  r.box(cx, 93 - lift('right'), 11, 6, foot)
  // torso
  if (wear === 'coat') {
    r.solid(r.mask().poly([[cx - 13, shoulderY], [cx + 13, shoulderY], [cx + 15, 84], [cx - 15, 84]]).round(cx - 13, shoulderY, 26, 12, raised ? 2 : 4), 'text')
    r.line(cx - 6, shoulderY + 1, cx, shoulderY + 12, 'line')                      // lapels
    r.line(cx + 5, shoulderY + 1, cx, shoulderY + 12, 'line')
    r.rect(cx - 1, shoulderY + 12, 2, 70 - shoulderY, 'line')                      // the coat's edge
  } else {
    r.solid(r.mask().round(cx - 13, shoulderY, 26, 34, 4), 'cloud')
    r.rect(cx - 3, shoulderY + 1, 6, 2, 'cream')                                   // collar
  }
  arm(r, cx, -1, o.left ?? 'down', wear, shoulderY)
  arm(r, cx, 1, o.right ?? 'down', wear, shoulderY)
  r.box(cx - 3, 18, 6, shoulderY - 15, 'cream')                                    // neck (shorter when raised)
  head(r, cx, 0, face)
}

/** Crouching beside the rug, 66 tall, feet on y = 64. `cloth` puts a hand and the dishcloth on the floor. */
export function crouching(r: Raster, cx: number, face: Face, cloth: number | null) {
  r.box(cx - 15, 40, 13, 8, 'sky'); r.box(cx + 2, 40, 13, 8, 'sky')                 // thighs, knees out
  r.box(cx - 15, 46, 8, 16, 'sky'); r.box(cx + 7, 46, 8, 16, 'sky')                 // shins
  r.box(cx - 17, 59, 11, 6, 'cream'); r.box(cx + 6, 59, 11, 6, 'cream')             // bare feet
  r.solid(r.mask().round(cx - 12, 22, 24, 22, 4), 'cloud')                          // torso, leaning in
  r.box(cx - 18, 24, 7, 12, 'cloud'); r.box(cx - 17, 34, 6, 12, 'cream')           // left arm on the knee
  if (cloth !== null) {
    r.solid(r.mask().poly([[cx + 8, 24], [cx + 16, 24], [cx + 21 + cloth, 49], [cx + 13 + cloth, 49]]), 'cloud') // right arm reaching down
    r.solid(r.mask().rect(cx + 12 + cloth, 45, 9, 8), 'cream')                      // hand
    r.box(cx + 9 + cloth, 52, 16, 8, 'cloud')                                      // the dishcloth, pressed flat
    r.rect(cx + 12 + cloth, 55, 10, 1, 'line')
  }
  r.box(cx - 3, 16, 6, 8, 'cream')                                                 // neck
  head(r, cx, 0, face)
}

/** Far-away street figures, 26 tall, 1-px line (a 2-px line would swallow them at this size). */
export interface SmallOptions { cx: number; body: 'coat' | 'tee' | 'apron' | 'dress' | 'old'; step?: 0 | 1 | 2; arm?: 'down' | 'ear' | 'out' | 'leash' }
export function small(r: Raster, o: SmallOptions) {
  const { cx } = o
  const w = { weight: 1 }
  const legs = o.step === 1 ? [0, 1] : o.step === 2 ? [1, 0] : [0, 0]
  const shoe = o.body === 'coat' ? 'text' : 'line'
  r.box(cx - 3, 16, 3, 9 - legs[0], 'sky', w); r.box(cx, 16, 3, 9 - legs[1], 'sky', w)
  r.rect(cx - 4, 24 - legs[0], 4, 2, shoe); r.rect(cx, 24 - legs[1], 4, 2, shoe)
  const ink = o.body === 'coat' ? 'text' : o.body === 'apron' ? 'cloud' : o.body === 'dress' ? 'berry' : o.body === 'old' ? 'cream' : 'cloud'
  const bottom = o.body === 'coat' ? 22 : o.body === 'dress' || o.body === 'old' ? 20 : 17
  r.box(cx - 4, 8, 8, bottom - 8, ink, w)
  if (o.body === 'apron') r.box(cx - 2, 11, 5, 8, 'cream', w)
  const sleeve = ink
  if (o.arm === 'ear') { r.box(cx + 3, 3, 2, 7, sleeve, w); r.rect(cx + 3, 2, 2, 3, 'text') }
  else if (o.arm === 'out') r.box(cx + 3, 9, 6, 2, sleeve, w)
  else if (o.arm === 'leash') r.box(cx + 3, 9, 3, 6, sleeve, w)
  else r.box(cx + 3, 9, 2, 7, sleeve, w)
  r.box(cx - 5, 9, 2, 7, sleeve, w)
  r.solid(r.mask().oval(cx - 3, 0, 7, 9), 'cream', w)
  r.fill(r.mask().oval(cx - 3, 0, 7, 9).rect(cx - 3, 3, 7, 6, 0), o.body === 'old' ? 'cloud' : 'line')
}
