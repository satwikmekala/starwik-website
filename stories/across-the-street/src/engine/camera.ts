/**
 * The camera. A view maps canvas units to screen pixels: screen = c·s + t.
 * At rest a view's scale lands every logical pixel on whole device pixels;
 * between shots it eases scale (in log space) and the framed point.
 */
export interface View { s: number; tx: number; ty: number }
export interface Box { x: number; y: number; w: number; h: number }

export function fitView(rect: Box, box: Box, area: { w: number; h: number }, canvas: { w: number; h: number }, dpr: number, maxS = 16): View {
  const d = Math.max(1, Math.round(dpr * 4) / 4)
  const step = 1 / d
  const raw = Math.min(box.w / rect.w, box.h / rect.h, maxS)
  // never zoom out past the canvas edge
  const minS = Math.max(area.w / canvas.w, area.h / canvas.h)
  let s = Math.max(step, Math.floor(raw / step + 1e-6) * step)
  if (s < minS) s = Math.ceil(minS / step - 1e-6) * step
  return clampView({ s, tx: box.x + box.w / 2 - (rect.x + rect.w / 2) * s, ty: box.y + box.h / 2 - (rect.y + rect.h / 2) * s }, area, canvas, d)
}

export function clampView(v: View, area: { w: number; h: number }, canvas: { w: number; h: number }, d = 1): View {
  const cw = canvas.w * v.s, ch = canvas.h * v.s
  const tx = cw >= area.w ? Math.min(0, Math.max(area.w - cw, v.tx)) : (area.w - cw) / 2
  const ty = ch >= area.h ? Math.min(0, Math.max(area.h - ch, v.ty)) : (area.h - ch) / 2
  return { s: v.s, tx: Math.round(tx * d) / d, ty: Math.round(ty * d) / d }
}

/** Ease between two views, keeping the framed point steady. */
export function lerpView(a: View, b: View, k: number, area: { w: number; h: number }): View {
  if (k <= 0) return a
  if (k >= 1) return b
  const cx = area.w / 2, cy = area.h / 2
  const ca = [(cx - a.tx) / a.s, (cy - a.ty) / a.s], cb = [(cx - b.tx) / b.s, (cy - b.ty) / b.s]
  const s = Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * k)
  const c = [ca[0] + (cb[0] - ca[0]) * k, ca[1] + (cb[1] - ca[1]) * k]
  return { s, tx: cx - c[0] * s, ty: cy - c[1] * s }
}
