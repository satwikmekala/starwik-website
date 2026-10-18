import type { PlanetKind } from './renderer'

// Two compositions in design px. The stage is scaled to fit the viewport with
// a single CSS unit (--u = one design px), so nothing reflows and nothing jumps
// on hydration. Landscape is the Claude Design horizon; portrait zig-zags.
export const STAGE = {
  wide: { w: 1440, h: 900 },
  tall: { w: 400, h: 960 },
} as const

export type LabelSide = 'above' | 'below' | 'left' | 'right'

export interface Placement {
  x: number
  y: number
  /** planet box edge */
  s: number
  side: LabelSide
}

/** how far from centre (as a fraction of the half-box) each planet's visible body reaches */
const REACH: Record<PlanetKind, { v: number; h: number }> = {
  music: { v: 0.44, h: 0.9 },
  travel: { v: 0.53, h: 0.88 },
  thoughts: { v: 0.66, h: 0.72 },
  building: { v: 0.56, h: 0.64 },
}

export const PLACEMENTS: Record<PlanetKind, { wide: Placement; tall: Placement; depth: number }> = {
  music: {
    wide: { x: 250, y: 560, s: 340, side: 'below' },
    tall: { x: 122, y: 300, s: 236, side: 'right' },
    depth: 18,
  },
  travel: {
    wide: { x: 590, y: 420, s: 280, side: 'above' },
    tall: { x: 282, y: 478, s: 200, side: 'left' },
    depth: 9,
  },
  thoughts: {
    wide: { x: 910, y: 600, s: 340, side: 'below' },
    tall: { x: 124, y: 660, s: 230, side: 'right' },
    depth: 22,
  },
  building: {
    wide: { x: 1220, y: 430, s: 290, side: 'above' },
    tall: { x: 284, y: 838, s: 210, side: 'left' },
    depth: 12,
  },
}

export interface Rect {
  left: number
  top: number
  width: number
  height: number
}

export interface LabelGeometry {
  lead: Rect
  label: { left: number; top: number; shift: string; align: 'start' | 'end' }
}

/** Where the lead line and label sit, relative to the planet's box. */
export function labelGeometry(kind: PlanetKind, { s, side }: Placement): LabelGeometry {
  const half = s / 2
  const reach = REACH[kind]
  const lead = side === 'above' || side === 'below' ? 34 : 22

  switch (side) {
    case 'above': {
      const top = half - reach.v * half - lead
      return {
        lead: { left: half, top, width: 1, height: lead },
        label: { left: half + 12, top: top - 6, shift: 'translateY(-100%)', align: 'start' },
      }
    }
    case 'below': {
      const top = half + reach.v * half
      return {
        lead: { left: half, top, width: 1, height: lead },
        label: { left: half + 12, top: top + 8, shift: 'none', align: 'start' },
      }
    }
    case 'right': {
      const left = half + reach.h * half
      return {
        lead: { left, top: half, width: lead, height: 1 },
        label: { left: left + lead + 10, top: half, shift: 'translateY(-50%)', align: 'start' },
      }
    }
    case 'left': {
      const right = half - reach.h * half
      return {
        lead: { left: right - lead, top: half, width: lead, height: 1 },
        label: { left: right - lead - 10, top: half, shift: 'translate(-100%, -50%)', align: 'end' },
      }
    }
  }
}

/** A smooth voyage line through every world (Catmull-Rom → cubic Béziers). */
export function routePath(points: [number, number][]): string {
  const f = (n: number) => Math.round(n * 10) / 10
  let d = `M ${f(points[0][0])} ${f(points[0][1])}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C ${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`
  }
  return d
}

export const ROUTE_ENDS = {
  wide: { from: [-80, 720] as [number, number], to: [1540, 300] as [number, number] },
  tall: { from: [360, 120] as [number, number], to: [120, 1060] as [number, number] },
}
