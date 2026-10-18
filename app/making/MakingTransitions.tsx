'use client'

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { PROJECTS, projectFromPath, type ProjectId } from './projects'
import styles from './making.module.css'

type Arrival = 'direct' | 'flood' | 'reduced'
interface Journey { project: ProjectId; x: number; y: number; initialScale: number; coverScale: number; finalScale: number }
interface Navigation { href: string; mode: 'flood' | 'reduced'; snapshot?: HTMLElement }
interface ReturnPosition { project: ProjectId; scroll: number }
const Context = createContext<{ enter: (project: ProjectId, rect: DOMRect) => void; returnToMaking: () => void; arrival: Arrival } | null>(null)
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function useMakingTransitions() {
  const context = useContext(Context)
  if (!context) throw new Error('Making navigation requires the Making layout.')
  return context
}

function savedPosition(): ReturnPosition | undefined {
  const saved = window.history.state?.makingReturn
  if (saved && PROJECTS.some(project => project.id === saved.project) && Number.isFinite(saved.scroll)) return saved
}

function FloodOverlay({ journey, overlayRef, onCovered, onFinished }: {
  journey: Journey
  overlayRef: RefObject<HTMLDivElement | null>
  onCovered: () => void
  onFinished: () => void
}) {
  useEffect(() => {
    let frame = 0
    const checkCoverage = () => {
      const last = overlayRef.current?.lastElementChild
      if (!last) return
      const scale = new DOMMatrixReadOnly(getComputedStyle(last).transform).a
      if (scale >= journey.coverScale) onCovered()
      else frame = requestAnimationFrame(checkCoverage)
    }
    // Check the opaque last layer, rather than assuming its easing covers every screen.
    const timer = window.setTimeout(checkCoverage, 850)
    return () => { clearTimeout(timer); cancelAnimationFrame(frame) }
  }, [journey.coverScale, overlayRef, onCovered])

  const project = PROJECTS.find(project => project.id === journey.project)!
  return (
    <div
      ref={overlayRef}
      className={styles.flood}
      data-making-flood={journey.project}
      data-phase="expand"
      aria-hidden="true"
      style={{
        '--flood-x': `${journey.x}px`, '--flood-y': `${journey.y}px`,
        '--flood-start': journey.initialScale, '--flood-end': journey.finalScale,
        '--flood-height': journey.project === 'spore' ? '200px' : '104px',
        '--flood-color': project.color,
      } as CSSProperties}
      onTransitionEnd={event => {
        if (event.target === event.currentTarget && event.propertyName === 'opacity') onFinished()
      }}
    >
      {[0.3, 0.5, 0.8, 1].map((opacity, index) => (
        <span key={opacity} className={`${styles.floodLayer} ${journey.project === 'spore' ? styles.floodCircle : styles.floodDiamond}`} style={{ opacity, animationDelay: `${index * 100}ms` }} />
      ))}
    </div>
  )
}

/** The /making layout owns the curtain, so it survives the actual route commit. */
export function MakingTransitions({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const previousPath = useRef(pathname)
  const viewRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const navigation = useRef<Navigation | null>(null)
  const returnPosition = useRef<ReturnPosition | null>(null)
  const busyRef = useRef(false)
  const watchdog = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const snapshotRef = useRef<HTMLElement | null>(null)
  const [busy, setBusy] = useState(false)
  const [journey, setJourney] = useState<Journey | null>(null)
  const [arrival, setArrival] = useState<Arrival>('direct')

  const finish = useCallback(() => {
    clearTimeout(watchdog.current)
    snapshotRef.current?.remove()
    snapshotRef.current = null
    navigation.current = null
    busyRef.current = false
    setBusy(false)
    setJourney(null)
  }, [])

  const pushAfterCoverage = useCallback(() => {
    const target = navigation.current
    if (target) router.push(target.href, { scroll: false })
  }, [router])

  const enter = useCallback((project: ProjectId, rect: DOMRect) => {
    if (busyRef.current) return
    busyRef.current = true
    setBusy(true)
    const position = { project, scroll: window.scrollY }
    returnPosition.current = position
    // Preserve Next's own history tree and attach restoration data to this index entry.
    window.history.replaceState({ ...window.history.state, makingReturn: position }, '')
    const href = `/making/${project}`
    router.prefetch(href)
    watchdog.current = setTimeout(finish, 12_000)

    if (reducedMotion()) {
      setArrival('reduced')
      const section = viewRef.current?.parentElement
      const snapshot = section?.cloneNode(true) as HTMLElement | undefined
      if (snapshot) {
        snapshot.querySelectorAll('[id]').forEach(element => { if (!element.closest('svg')) element.removeAttribute('id') })
        snapshot.inert = true
        snapshot.setAttribute('aria-hidden', 'true')
        const curtain = document.createElement('div')
        curtain.className = styles.fadeSnapshot
        snapshot.style.transform = `translateY(-${window.scrollY}px)`
        curtain.append(snapshot)
        document.body.append(curtain)
        snapshotRef.current = curtain
      }
      navigation.current = { href, mode: 'reduced', snapshot: snapshotRef.current ?? undefined }
      router.push(href, { scroll: false })
      return
    }

    setArrival('flood')
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const corners = [[0, 0], [innerWidth, 0], [0, innerHeight], [innerWidth, innerHeight]]
    const coverScale = Math.max(...corners.map(([cx, cy]) => project === 'spore'
      ? Math.hypot(cx - x, cy - y) / 100
      : Math.abs(cx - x) / 100 + Math.abs(cy - y) / 52)) * 1.04
    navigation.current = { href, mode: 'flood' }
    setJourney({ project, x, y, initialScale: rect.width / 200, coverScale, finalScale: Math.max(26, coverScale * 1.3) })
  }, [router, finish])

  const returnToMaking = useCallback(() => {
    if (busyRef.current) return
    setArrival('direct')
    if (window.history.state?.makingFromIndex) router.back()
    else router.push('/making', { scroll: false })
  }, [router])

  useLayoutEffect(() => {
    const changed = previousPath.current !== pathname
    const previousProject = projectFromPath(previousPath.current)
    previousPath.current = pathname
    let frame = 0
    let settleFrame = 0

    if (pathname === '/making') {
      const saved = savedPosition() ?? (previousProject ? returnPosition.current ?? { project: previousProject, scroll: 0 } : undefined)
      if (saved) {
        const restore = () => {
          window.scrollTo({ top: saved.scroll, behavior: 'instant' })
          document.querySelector<HTMLElement>(`[data-making-pod="${saved.project}"]`)?.focus({ preventScroll: true })
        }
        restore()
        // Also settle after App Router's own history restoration runs.
        frame = requestAnimationFrame(() => { restore(); settleFrame = requestAnimationFrame(restore) })
      }
    } else if (projectFromPath(pathname)) {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }

    const pending = navigation.current
    if (pending?.href === pathname) {
      navigation.current = null
      window.history.replaceState({ ...window.history.state, makingFromIndex: true }, '')
      if (pending.mode === 'flood') {
        // The new page is committed below a fully opaque project-colored curtain.
        overlayRef.current?.setAttribute('data-phase', 'reveal')
      } else {
        const options = { duration: 200, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }
        const incoming = viewRef.current?.animate({ opacity: [0, 1] }, options)
        const outgoing = pending.snapshot?.animate({ opacity: [1, 0] }, options)
        void Promise.allSettled([incoming?.finished, outgoing?.finished]).then(finish)
      }
    } else if (changed && projectFromPath(pathname)) {
      frame = requestAnimationFrame(() => document.getElementById('making-arrival-title')?.focus({ preventScroll: true }))
    }
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(settleFrame) }
  }, [pathname, finish])

  useLayoutEffect(() => {
    if (busy || !projectFromPath(pathname)) return
    // Focus only after React has removed inert from the committed arrival view.
    const frame = requestAnimationFrame(() => document.getElementById('making-arrival-title')?.focus({ preventScroll: true }))
    return () => cancelAnimationFrame(frame)
  }, [busy, pathname])

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const motionChanged = () => {
      if (!preference.matches || !busyRef.current) return
      const pending = navigation.current
      finish()
      setArrival('reduced')
      if (pending) router.push(pending.href, { scroll: false })
    }
    const pop = () => {
      setArrival('direct')
      if (busyRef.current) finish()
    }
    window.addEventListener('popstate', pop, true)
    preference.addEventListener('change', motionChanged)
    return () => {
      window.removeEventListener('popstate', pop, true)
      preference.removeEventListener('change', motionChanged)
      clearTimeout(watchdog.current)
      snapshotRef.current?.remove()
    }
  }, [finish, router])

  return (
    <Context.Provider value={{ enter, returnToMaking, arrival }}>
      <div ref={viewRef} className={styles.view} inert={busy} data-making-view>{children}</div>
      {journey ? <FloodOverlay journey={journey} overlayRef={overlayRef} onCovered={pushAfterCoverage} onFinished={finish} /> : null}
    </Context.Provider>
  )
}
