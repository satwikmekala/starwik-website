/** Viewport-space geometry only. Measuring this never changes styles or routes. */
export interface EntryViewport {
  left: number
  top: number
  width: number
  height: number
}

export interface PortalEntryGeometry {
  rootRect: DOMRectReadOnly
  entryRect: DOMRectReadOnly
  entryCenter: { x: number; y: number }
  viewportCenter: { x: number; y: number }
  scaleToViewport: number
  translateX: number
  translateY: number
  /** Pixel coordinates relative to rootRect, not percentages. */
  transformOrigin: { x: number; y: number }
}

/**
 * Cover the visible viewport with the measured entry target. In viewport space,
 * applying `translate(tx, ty) scale(s)` about transformOrigin maps the entry's
 * center to the viewport center. Translation is deliberately NOT scaled.
 * Apply this to an untransformed root (the HousePortal's fixed stage).
 *
 * Measurements include the current facade perspective, hover pose and scale.
 * A future passage must capture/freeze that pose before applying this mapping.
 * No transform is applied in Slice 3.
 */
export function calculatePortalEntryGeometry(
  rootRect: DOMRectReadOnly,
  entryRect: DOMRectReadOnly,
  viewport: EntryViewport
): PortalEntryGeometry | null {
  const values = [
    rootRect.left, rootRect.top, rootRect.width, rootRect.height,
    entryRect.left, entryRect.top, entryRect.width, entryRect.height,
    viewport.left, viewport.top, viewport.width, viewport.height,
  ]
  if (!values.every(Number.isFinite) ||
    [rootRect.width, rootRect.height, entryRect.width, entryRect.height, viewport.width, viewport.height]
      .some((size) => size <= 0)) return null

  const entryCenter = {
    x: entryRect.left + entryRect.width / 2,
    y: entryRect.top + entryRect.height / 2,
  }
  const viewportCenter = {
    x: viewport.left + viewport.width / 2,
    y: viewport.top + viewport.height / 2,
  }
  return {
    rootRect,
    entryRect,
    entryCenter,
    viewportCenter,
    scaleToViewport: Math.max(viewport.width / entryRect.width, viewport.height / entryRect.height),
    translateX: viewportCenter.x - entryCenter.x,
    translateY: viewportCenter.y - entryCenter.y,
    transformOrigin: { x: entryCenter.x - rootRect.left, y: entryCenter.y - rootRect.top },
  }
}

/** Read fresh on demand, including visual-viewport offsets after zoom/resize. */
export function measurePortalEntryGeometry(
  root: HTMLElement | null,
  entry: HTMLElement | null
): PortalEntryGeometry | null {
  if (!root?.isConnected || !entry?.isConnected || !root.contains(entry)) return null
  const host = root.ownerDocument.defaultView
  if (!host) return null
  const viewport = host.visualViewport
  return calculatePortalEntryGeometry(root.getBoundingClientRect(), entry.getBoundingClientRect(), {
    left: viewport?.offsetLeft ?? 0,
    top: viewport?.offsetTop ?? 0,
    width: viewport?.width ?? host.innerWidth,
    height: viewport?.height ?? host.innerHeight,
  })
}

/** Map viewport geometry into a house-sized camera under a scaled parent.
 * The atmosphere remains at viewport size while only this camera zooms. */
export function calculateLocalHouseCamera(
  entry: PortalEntryGeometry | null,
  bounds: Pick<DOMRectReadOnly, 'left' | 'top' | 'width'> | undefined,
  layoutWidth: number,
) {
  if (!entry || !bounds || !Number.isFinite(layoutWidth) || layoutWidth <= 0) return null
  const scale = bounds.width / layoutWidth
  if (!Number.isFinite(scale) || scale <= 0) return null
  return {
    originX: (entry.entryCenter.x - bounds.left) / scale,
    originY: (entry.entryCenter.y - bounds.top) / scale,
    x: entry.translateX / scale,
    y: entry.translateY / scale,
  }
}
