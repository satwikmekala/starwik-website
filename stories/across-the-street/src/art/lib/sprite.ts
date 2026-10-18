import { Raster } from './raster.ts'

export type Draw = (r: Raster) => void

/**
 * One drawing. `parts` are separately addressable layers of the same
 * w×h grid (e.g. the rug's base, stain and dried ring), so the engine can
 * show, hide or animate each without re-drawing anything.
 */
export interface SpriteDef {
  name: string
  w: number
  h: number
  /** What the drawing depicts, used for aria labels and the specimen. */
  label: string
  parts: Record<string, Draw>
}

export function sprite(name: string, w: number, h: number, label: string, parts: Draw | Record<string, Draw>): SpriteDef {
  return { name, w, h, label, parts: typeof parts === 'function' ? { base: parts } : parts }
}

export function render(def: SpriteDef, part: string) {
  const r = new Raster(def.w, def.h)
  def.parts[part](r)
  return r
}
