/**
 * The sunbeam: a hard-edged, stair-stepped polygon from the window glass
 * to a patch of floor whose far edge travels across the rug as the story
 * advances (progress 0 → 1). Rasterised on the same grid as the art, so
 * its edges step exactly like everything else.
 */
import { toPaths } from '../art/lib/paths.ts'
import { Raster, type Point } from '../art/lib/raster.ts'
import type { SceneDef } from '../scenes/types.ts'
import { pathsMarkup } from './svg.ts'

function hull(points: Point[]): Point[] {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const cross = (o: Point, a: Point, b: Point) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const lower: Point[] = [], upper: Point[] = []
  for (const q of p) { while (lower.length > 1 && cross(lower.at(-2)!, lower.at(-1)!, q) <= 0) lower.pop(); lower.push(q) }
  for (const q of p.reverse()) { while (upper.length > 1 && cross(upper.at(-2)!, upper.at(-1)!, q) <= 0) upper.pop(); upper.push(q) }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)]
}

export function sunbeamMarkup(def: SceneDef, progress: number) {
  const sun = def.sun
  if (!sun) return ''
  const t = Math.min(1, Math.max(0, progress))
  const far = Math.round(sun.from + (sun.to - sun.from) * t)          // far (left) edge of the floor patch
  const patchW = Math.round(sun.w * 1.15)
  const glass: Point[] = [[sun.x, sun.y], [sun.x + sun.w, sun.y], [sun.x + sun.w, sun.y + sun.h], [sun.x, sun.y + sun.h]]
  const patch: Point[] = [[far, sun.floorTop + 2], [far + patchW, sun.floorTop + 2], [far + patchW - 6, sun.floorBottom], [far - 6, sun.floorBottom]]
  const shape = hull([...glass, ...patch])
  const minX = Math.floor(Math.min(...shape.map((q) => q[0]))), minY = Math.floor(Math.min(...shape.map((q) => q[1])))
  const maxX = Math.ceil(Math.max(...shape.map((q) => q[0]))), maxY = Math.ceil(Math.max(...shape.map((q) => q[1])))
  const r = new Raster(maxX - minX, maxY - minY)
  const m = r.mask().poly(shape.map(([x, y]) => [x - minX, y - minY] as const))
  m.rect(sun.x - minX, sun.y - minY, sun.w, sun.h, 0)                 // the beam starts at the glass
  r.fill(m, 'cloud')
  return `<g transform="translate(${minX + def.safe.x} ${minY + def.safe.y})">${pathsMarkup(toPaths(r))}</g>`
}
