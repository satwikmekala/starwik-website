/**
 * Story state as a pure function of reading position. Position T is
 * `beat index + local progress (0..1)` through that beat's scroll block.
 * Each beat's direction merges onto the one before; numbers ease from the
 * previous beat's value during the first part of the block, then hold.
 * Scrolling back simply evaluates an earlier T, so everything reverses.
 */
import { DIRECTION, START, type Direction } from '../direction.ts'
import type { Beat } from './copy.ts'

export type Resolved = typeof START

/** Portion of each beat spent moving from the previous staging. */
export const MOVE = 0.4
export const ease = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u))

const NUMERIC = ['stain', 'ring', 'distress', 'bikes', 'glint', 'ghost', 'peri'] as const

export function buildTimeline(beats: Beat[]) {
  const states: Resolved[] = []
  let cur: Resolved = { ...START }
  for (const b of beats) {
    const d: Direction = DIRECTION[b.id] ?? {}
    const next = { ...cur } as Resolved
    for (const [k, v] of Object.entries(d)) {
      if (k === 'marcus' || k === 'man') {
        // null clears; an object merges onto the current figure
        ;(next as Record<string, unknown>)[k] = v === null ? null : { ...((cur as Record<string, unknown>)[k] as object | null ?? {}), ...(v as object) }
      } else (next as Record<string, unknown>)[k] = v
    }
    if (!('interact' in d)) next.interact = cur.interact
    states.push(next)
    cur = next
  }
  return states
}

export interface Frame {
  /** state of the beat we are in */
  now: Resolved
  /** state of the beat before (for interpolation) */
  prev: Resolved
  /** eased 0..1 progress of the move from prev to now */
  k: number
  /** numbers already interpolated */
  num: Record<(typeof NUMERIC)[number], number>
  index: number
  local: number
}

export function frameAt(states: Resolved[], T: number): Frame {
  const index = Math.max(0, Math.min(states.length - 1, Math.floor(T)))
  const local = Math.max(0, Math.min(1, T - index))
  const now = states[index], prev = states[Math.max(0, index - 1)]
  const k = index === 0 ? 1 : ease(local / MOVE)
  const num = {} as Frame['num']
  for (const key of NUMERIC) num[key] = (prev[key] as number) + ((now[key] as number) - (prev[key] as number)) * k
  return { now, prev, k, num, index, local }
}
