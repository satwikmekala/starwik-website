/**
 * Pixel-perfect fit. The scale is the largest value that keeps the safe
 * frame inside the box AND lands every logical pixel on whole device
 * pixels (s × dpr is an integer), so nothing is ever resampled. The view
 * box then grows around the safe frame to fill the box with bleed art.
 */
export interface Fit { s: number; vb: { x: number; y: number; w: number; h: number } }

export function fitScene(
  boxW: number, boxH: number,
  safe: { x: number; y: number; w: number; h: number },
  dpr = 1,
  /** where the safe frame sits vertically in spare space: 0 top, .5 centre */
  alignY = 0.5,
): Fit {
  const d = Math.max(1, Math.round(dpr * 4) / 4)
  const step = 1 / d // s = k / dpr  ⇒  one logical pixel = k whole device pixels
  const raw = Math.min(boxW / safe.w, boxH / safe.h)
  const s = Math.max(step, Math.floor(raw / step + 1e-6) * step)
  const w = boxW / s, h = boxH / s
  const px = 1 / (s * d) // one device pixel, in logical units
  const snap = (v: number) => Math.round(v / px) * px
  return {
    s,
    vb: { x: snap(safe.x + safe.w / 2 - w / 2), y: snap(safe.y - (h - safe.h) * alignY), w, h },
  }
}
