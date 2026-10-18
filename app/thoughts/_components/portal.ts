import type { Ref } from 'react'
import type { ThoughtEntry } from '@/content/thoughts/helpers'
import type { DepthEngine } from './engine'
import type { Choreography } from './motion'
import type { Scene, View } from './scene'
import type { Plan, TransitionContext } from './transitions'
import type { PortalEntryGeometry } from './portalGeometry'

/** Only the hooks the room currently needs; paper DOM stays inside its renderer. */
export interface PortalHandle {
  getEntryElement: (slug: string | null) => HTMLElement | null
  /** Optional measurable targets for artifacts with a distinct entry point. */
  getRootElement?: () => HTMLElement | null
  getEntryTargetElement?: () => HTMLElement | null
  /** Fresh geometry for a focused artifact; null while inactive or unmounted. */
  getEntryGeometry?: () => PortalEntryGeometry | null
  /** Reattached whenever the rendered portal changes. */
  attachDepth: (engine: DepthEngine) => void
  runTransition: (
    plan: Plan,
    from: Scene,
    to: Scene,
    choreography: Choreography,
    context: TransitionContext
  ) => Promise<void>
}

export interface ThoughtPortalProps {
  thought: ThoughtEntry
  /** swaps only animate while the portal is actually on screen */
  live: boolean
  view: View
  ref?: Ref<PortalHandle>
  /** start settling at activation, before the route commits */
  onEnter?: () => void
}
