import type { DepthEngine } from './engine'
import { Choreography, EASE } from './motion'
import { calculateLocalHouseCamera, type PortalEntryGeometry } from './portalGeometry'
import type { Scene } from './scene'
import type { Plan, TransitionContext } from './transitions'
import styles from './house.module.css'
import roomStyles from './experience.module.css'

export interface HouseEntry {
  choreography: Choreography
  geometry: PortalEntryGeometry | null
  mobile: boolean
  pose: { caption: string }
  camera: { originX: number; originY: number; x: number; y: number } | null
}

/** Inline pins do not create a compositor animation/layer for every surface. */
function pin(c: Choreography, el: HTMLElement | null, values: Record<string, string | undefined>) {
  if (!el) return
  const saved = Object.keys(values).map(name => [name, el.style.getPropertyValue(name), el.style.getPropertyPriority(name)])
  for (const [name, value] of Object.entries(values)) if (value !== undefined) el.style.setProperty(name, value)
  c.onCleanup(() => {
    for (const [name, value, priority] of saved) {
      if (value) el.style.setProperty(name, value, priority)
      else el.style.removeProperty(name)
    }
  })
}

/** Freeze before Next commits the URL: all geometry/style reads are in this batch. */
export function commitHouseEntry(
  root: HTMLElement,
  geometry: () => PortalEntryGeometry | null,
  engine: DepthEngine | null,
): HouseEntry {
  const c = new Choreography()
  engine?.setMode('off')
  const measured = geometry()
  const composition = root.querySelector<HTMLElement>(`.${styles.composition}`)
  const bounds = composition?.getBoundingClientRect()
  const camera = calculateLocalHouseCamera(measured, bounds, composition?.offsetWidth ?? 0)
  const room = root.closest<HTMLElement>('[data-thoughts-view]')
  const rootStyle = getComputedStyle(root)
  const opacity = rootStyle.opacity
  const attention = rootStyle.getPropertyValue('--entry-attention')
  const rigid = new Set(['composition', 'building', 'motion', 'facade', 'side', 'roof', 'window', 'cornice', 'sill'])
  const poses = [...rigid, 'interior', 'caption', 'light', 'glass', 'shadow', 'atmosphere']
    .map((name) => {
      const el = root.querySelector<HTMLElement>(`.${styles[name]}`)
      const style = el && getComputedStyle(el)
      return { name, el, transform: style?.transform, opacity: style?.opacity }
    })
  const surroundings = ['backdrop', 'atmos', 'deep'].map((name) => {
    const el = room?.querySelector<HTMLElement>(`.${roomStyles[name]}`)
    return { el, opacity: el ? getComputedStyle(el).opacity : '1' }
  })
  const locks = [root, room?.querySelector<HTMLElement>(`.${roomStyles.archive}`), room?.querySelector<HTMLElement>(`.${roomStyles.chrome}`)]
    .filter((el): el is HTMLElement => !!el).map((el) => ({ el, inert: el.inert }))
  const width = window.innerWidth
  const height = window.innerHeight
  const media = window.matchMedia('(prefers-reduced-motion: reduce)')

  // Freeze the projected architecture without adding opacity animations to
  // each decorative surface. Only the camera and exposure move during entry.
  poses.forEach(({ name, el, transform, opacity }) => pin(c, el,
    rigid.has(name) ? { transform } : { transform, opacity }
  ))
  surroundings.forEach(({ el, opacity }) => pin(c, el ?? null, { opacity }))
  pin(c, root, { opacity, '--entry-attention': attention })
  root.dataset.entryPhase = 'commit'
  if (room) room.dataset.houseEntry = ''
  locks.forEach(({ el }) => { el.inert = true })
  for (const name of ['archive', 'chrome']) {
    const el = room?.querySelector<HTMLElement>(`.${roomStyles[name]}`)
    void c.animate(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: EASE.fade })
  }
  // Releasing the entry's holds exposes the valid route's stylesheet/content.
  // This also covers a route request that never commits, without trapping input.
  const interrupt = () => c.release()
  const visibility = () => { if (document.hidden) interrupt() }
  const resize = () => {
    if (Math.abs(window.innerWidth - width) > 48 || Math.abs(window.innerHeight - height) > 80) interrupt()
  }
  window.addEventListener('popstate', interrupt)
  window.addEventListener('resize', resize)
  document.addEventListener('visibilitychange', visibility)
  media.addEventListener('change', interrupt)
  const watchdog = window.setTimeout(interrupt, 7000)
  c.onCleanup(() => {
    window.clearTimeout(watchdog)
    window.removeEventListener('popstate', interrupt)
    window.removeEventListener('resize', resize)
    document.removeEventListener('visibilitychange', visibility)
    media.removeEventListener('change', interrupt)
    delete root.dataset.entryPhase
    if (room) delete room.dataset.houseEntry
    locks.forEach(({ el, inert }) => {
      el.inert = el === root ? !['portal', 'archive'].includes(root.dataset.state ?? '') : inert
    })
    const view = root.dataset.state
    if (root.isConnected) engine?.setMode(view === 'portal' ? 'portal' : view === 'archive' ? 'archive' : 'off')
  })
  return {
    choreography: c,
    geometry: measured,
    camera,
    mobile: width < 768 || window.matchMedia('(pointer: coarse)').matches,
    pose: {
      caption: poses.find(({ name }) => name === 'caption')?.opacity ?? '0',
    },
  }
}

/** House owns this sequence; paper FLIP and paper material never enter it. */
export async function runHousePlan(
  plan: Plan,
  to: Scene,
  c: Choreography,
  context: TransitionContext,
  root: HTMLElement | null,
  handoff: HTMLElement | null,
  entry: HouseEntry | null,
) {
  const { reader } = context.stage()
  if (plan === 'stylesheet') return
  if (to.view !== 'read') {
    entry?.choreography.release()
    await c.animate(reader, [{ opacity: 1 }, { opacity: 0 }], { duration: context.reduced ? 120 : 260, easing: EASE.fade })
    return
  }
  context.engine?.setMode('off')
  const passage = entry?.choreography ?? c
  c.onCleanup(() => entry?.choreography.release())
  const geometry = entry?.geometry
  const camera = entry?.camera
  const cameraElement = root?.querySelector<HTMLElement>(`.${styles.camera}`)
  const full = !!entry && !context.reduced && geometry && camera && cameraElement && root && handoff && !passage.cancelled
  if (!full) {
    entry?.choreography.release()
    await c.animate(reader, [{ opacity: 0 }, { opacity: 1 }], { duration: context.reduced ? 140 : 220, easing: EASE.fade })
    return
  }

  const active = () => context.alive() && !passage.cancelled
  const mobile = entry.mobile
  const hiddenReader = passage.hold(reader, { opacity: 0 })
  if (reader) {
    reader.inert = true
    passage.onCleanup(() => { reader.inert = false })
  }
  const hiddenCopy = passage.hold(reader?.querySelector('[data-opening-copy]'), { opacity: 0 })
  pin(passage, cameraElement, { 'transform-origin': `${camera.originX}px ${camera.originY}px` })
  const x = camera.x
  const y = camera.y
  const scale = geometry.scaleToViewport * 1.22
  const destination = `translate(${x}px, ${y}px) scale(${scale})`
  const duration = mobile ? 1900 : 2400
  const find = (name: string) => root.querySelector<HTMLElement>(`.${styles[name]}`)

  root.dataset.entryPhase = 'approach'
  void passage.animate(find('caption'), [{ opacity: entry.pose.caption }, { opacity: 0 }], { duration: 140 })
  // Scale only the tightly bounded artifact, never the full-screen stage and
  // its atmospheric textures (which otherwise become enormous GPU surfaces).
  const approach = passage.animate(cameraElement, [{ transform: 'translate(0px, 0px) scale(1)' }, { transform: destination }], {
    duration, easing: 'cubic-bezier(0.42, 0, 0.25, 1)',
  })
  // Keep every architectural plane at its captured pose. Rotating the
  // building while scaling its perspective ancestor makes the recess and
  // side wall swim; fading individual planes also changes their compositing.
  // Exposure rises inside the actual window before the pale light fills the
  // viewport. Both layers end at the story's paper color, avoiding a flash.
  void passage.animate(find('entryBloom'), [
    { opacity: 0 }, { opacity: .2, offset: .35 }, { opacity: 1 },
  ], { delay: duration * .18, duration: duration * .82, easing: EASE.fade })
  await passage.wait(duration * .6)
  if (!active()) return
  root.dataset.entryPhase = 'takeover'
  const whiteout = passage.animate(handoff, [{ opacity: 0 }, { opacity: 1 }], {
    duration: duration * .4, easing: EASE.fade,
  })
  await Promise.all([approach, whiteout])
  if (!active()) return

  root.dataset.entryPhase = 'handoff'
  passage.hold(root, { opacity: 0 })
  passage.drop(hiddenReader)
  // Let the exposure settle on blank paper before the title arrives.
  await passage.wait(180)
  if (!active()) return
  root.dataset.entryPhase = 'resolve'
  await passage.animate(handoff, [{ opacity: 1 }, { opacity: 0 }], { duration: 320, easing: EASE.fade })
  if (!active()) return
  passage.drop(hiddenCopy)
  await passage.animate(reader?.querySelector('[data-opening-copy]'), [
    { opacity: 0, transform: 'translateY(14px)' },
    { opacity: 1, transform: 'translateY(0)' },
  ], { duration: 850, easing: EASE.out })
}
