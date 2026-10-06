/**
 * A tiny cell rasterizer. Every drawing in the story is authored on a
 * logical pixel grid: geometric primitives (rect, oval, poly, line) are
 * snapped to whole cells, so curves and diagonals come out stair-stepped
 * by construction, and hand-drawn details are stamped from string grids.
 *
 * Nothing here knows about the DOM; it runs at build time (compile-art)
 * and at runtime (the moving sunbeam, the coat particles).
 */
import { CHAR_DEFAULT, INK, type Ink, LINE_WEIGHT } from '../palette.ts'

export type Point = readonly [number, number]

/** A boolean coverage mask the same size as its raster. */
export class Mask {
  readonly w: number
  readonly h: number
  readonly on: Uint8Array
  constructor(w: number, h: number) { this.w = w; this.h = h; this.on = new Uint8Array(w * h) }

  private put(x: number, y: number, v: 0 | 1) {
    x = Math.floor(x); y = Math.floor(y)
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.on[y * this.w + x] = v
  }
  has(x: number, y: number) { return x >= 0 && y >= 0 && x < this.w && y < this.h && this.on[y * this.w + x] === 1 }

  rect(x: number, y: number, w: number, h: number, v: 0 | 1 = 1) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.put(i, j, v)
    return this
  }
  /** Axis-aligned ellipse inside the box (x, y, w, h); sampled at cell centres. */
  oval(x: number, y: number, w: number, h: number, v: 0 | 1 = 1) {
    const rx = w / 2, ry = h / 2, cx = x + rx, cy = y + ry
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) {
      const dx = (i + 0.5 - cx) / rx, dy = (j + 0.5 - cy) / ry
      if (dx * dx + dy * dy <= 1) this.put(i, j, v)
    }
    return this
  }
  /** Rectangle with stair-stepped corners of radius r. */
  round(x: number, y: number, w: number, h: number, r: number, v: 0 | 1 = 1) {
    this.rect(x + r, y, w - 2 * r, h, v).rect(x, y + r, w, h - 2 * r, v)
    this.oval(x, y, 2 * r, 2 * r, v).oval(x + w - 2 * r, y, 2 * r, 2 * r, v)
    this.oval(x, y + h - 2 * r, 2 * r, 2 * r, v).oval(x + w - 2 * r, y + h - 2 * r, 2 * r, 2 * r, v)
    return this
  }
  /** Even-odd polygon fill sampled at cell centres. */
  poly(points: readonly Point[], v: 0 | 1 = 1) {
    let minY = Infinity, maxY = -Infinity
    for (const [, py] of points) { minY = Math.min(minY, py); maxY = Math.max(maxY, py) }
    for (let j = Math.floor(minY); j < Math.ceil(maxY); j++) {
      const cy = j + 0.5, xs: number[] = []
      for (let k = 0; k < points.length; k++) {
        const [x0, y0] = points[k], [x1, y1] = points[(k + 1) % points.length]
        if ((y0 <= cy && y1 > cy) || (y1 <= cy && y0 > cy)) xs.push(x0 + ((cy - y0) / (y1 - y0)) * (x1 - x0))
      }
      xs.sort((a, b) => a - b)
      for (let k = 0; k + 1 < xs.length; k += 2)
        for (let i = Math.ceil(xs[k] - 0.5); i < Math.ceil(xs[k + 1] - 0.5); i++) this.put(i, j, v)
    }
    return this
  }
  cut(other: Mask) { for (let k = 0; k < this.on.length; k++) if (other.on[k]) this.on[k] = 0; return this }
  add(other: Mask) { for (let k = 0; k < this.on.length; k++) if (other.on[k]) this.on[k] = 1; return this }
}

export interface SolidOptions {
  line?: Ink
  weight?: number
  /** Raster sides the shape bleeds past ('t','r','b','l'): no outline there. */
  bleed?: string
}

export class Raster {
  readonly w: number
  readonly h: number
  readonly cells: Uint8Array
  constructor(w: number, h: number) { this.w = w; this.h = h; this.cells = new Uint8Array(w * h) }

  mask() { return new Mask(this.w, this.h) }

  set(x: number, y: number, ink: Ink) {
    x = Math.floor(x); y = Math.floor(y)
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.cells[y * this.w + x] = INK[ink]
  }
  clear(x: number, y: number) { if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.cells[y * this.w + x] = 0 }

  /** Flat fill, no outline. */
  fill(m: Mask, ink: Ink) {
    for (let k = 0; k < m.on.length; k++) if (m.on[k]) this.cells[k] = INK[ink]
    return this
  }
  rect(x: number, y: number, w: number, h: number, ink: Ink) { return this.fill(this.mask().rect(x, y, w, h), ink) }

  /**
   * The house style: flat `ink` fill with a uniform inner outline of
   * `weight` cells (Chebyshev distance), so every shape — boxy or
   * stair-stepped — carries the same line.
   */
  solid(m: Mask, ink: Ink | null, { line = 'line', weight = LINE_WEIGHT, bleed = '' }: SolidOptions = {}) {
    const { w, h } = this, fillI = ink ? INK[ink] : -1, lineI = INK[line]
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (!m.on[y * w + x]) continue
      let border = false
      for (let dy = -weight; dy <= weight && !border; dy++) for (let dx = -weight; dx <= weight; dx++) {
        const nx = x + dx, ny = y + dy
        const side = ny < 0 ? 't' : nx >= w ? 'r' : ny >= h ? 'b' : nx < 0 ? 'l' : ''
        if (side ? !bleed.includes(side) : !m.on[ny * w + nx]) { border = true; break }
      }
      if (border) this.cells[y * w + x] = lineI
      else if (fillI >= 0) this.cells[y * w + x] = fillI
    }
    return this
  }
  box(x: number, y: number, w: number, h: number, ink: Ink | null, o?: SolidOptions) { return this.solid(this.mask().rect(x, y, w, h), ink, o) }

  /** Thick Bresenham line with a square brush. */
  line(x0: number, y0: number, x1: number, y1: number, ink: Ink = 'line', t = LINE_WEIGHT) {
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1
    let err = dx + dy, x = x0, y = y0
    for (;;) {
      for (let j = 0; j < t; j++) for (let i = 0; i < t; i++) this.set(x + i, y + j, ink)
      if (x === x1 && y === y1) break
      const e2 = 2 * err
      if (e2 >= dy) { err += dy; x += sx }
      if (e2 <= dx) { err += dx; y += sy }
    }
    return this
  }

  /**
   * Stamp a hand-authored grid map. Each character is one cell; see
   * CHAR in palette.ts. Space and '.' are transparent.
   */
  stamp(x: number, y: number, rows: readonly string[], chars: Readonly<Record<string, Ink>> = {}) {
    rows.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        const ch = row[i]
        if (ch === ' ' || ch === '.') continue
        const ink = chars[ch] ?? CHAR_DEFAULT[ch]
        if (!ink) throw new Error(`stamp: unknown char "${ch}"`)
        this.set(x + i, y + j, ink)
      }
    })
    return this
  }

  /** Paste another raster (non-empty cells only). */
  paste(src: Raster, x: number, y: number) {
    for (let j = 0; j < src.h; j++) for (let i = 0; i < src.w; i++) {
      const v = src.cells[j * src.w + i]
      const tx = x + i, ty = y + j
      if (v && tx >= 0 && ty >= 0 && tx < this.w && ty < this.h) this.cells[ty * this.w + tx] = v
    }
    return this
  }
}

