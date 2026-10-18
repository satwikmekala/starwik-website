'use client'

import { getPortalKind } from '@/content/thoughts/helpers'
import { PaperPortal } from './PaperPortal'
import { HousePortal } from './HousePortal'
import type { ThoughtPortalProps } from './portal'

/** Portal kind selects the artifact; experience kind and routes stay independent. */
const portalRenderers = {
  paper: PaperPortal,
  house: HousePortal,
} satisfies Record<ReturnType<typeof getPortalKind>, typeof PaperPortal>

export function ThoughtPortal(props: ThoughtPortalProps) {
  const Portal = portalRenderers[getPortalKind(props.thought)]
  return <Portal {...props} />
}
