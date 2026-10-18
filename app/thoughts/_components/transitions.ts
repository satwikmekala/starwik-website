/** Route planning and room elements shared by every portal renderer. */

import type { DepthEngine } from './engine'
import type { Scene } from './scene'

export interface Stage {
  root: HTMLElement | null
  backdrop: HTMLElement | null
  atmos: HTMLElement | null
  deep: HTMLElement | null
  archive: HTMLElement | null
  reader: HTMLElement | null
}

export interface TransitionContext {
  stage: () => Stage
  engine: DepthEngine | null
  reduced: boolean
  alive: () => boolean
}

export type Plan =
  | 'stylesheet'
  | 'enter-reading'
  | 'exit-reading'
  | 'reading-to-archive'
  | 'fade-into-reading'
  | 'swap-reading'

export function planFor(from: Scene, to: Scene): Plan {
  if (to.view === 'read') {
    if (from.view === 'portal') return 'enter-reading'
    if (from.view === 'read') return 'swap-reading'
    return 'fade-into-reading'
  }
  if (from.view === 'read') return to.view === 'portal' ? 'exit-reading' : 'reading-to-archive'
  return 'stylesheet'
}
