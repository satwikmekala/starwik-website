'use client'

/**
 * ThoughtsExperience — the room.
 *
 * Mounted once by app/thoughts/layout.tsx, so it survives every move
 * between /thoughts, /thoughts/[slug] and /thoughts/[slug]/read. That
 * persistence is what lets a title become a sheet of paper and a sheet
 * of paper become a page: nothing unmounts between the three states.
 *
 * The URL decides the view. This component decides how to get there.
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { MotionConfig } from 'framer-motion'
import type { ThoughtEntry } from '@/content/thoughts/helpers'
import { ArchiveTitle } from './ArchiveTitle'
import { Backdrop, warmImages } from './Backdrop'
import { DepthEngine, type EngineMode } from './engine'
import { Choreography, nextFrame, prefersReducedMotion } from './motion'
import { PortalCard } from './PortalCard'
import { Reader } from './Reader'
import { Selector } from './Selector'
import {
  createExperienceStore,
  hrefs,
  parentHref,
  parseScene,
  useExperienceState,
  type Scene,
  type View,
} from './scene'
import { findCard, planFor, runPlan, type Stage } from './transitions'
import styles from './experience.module.css'

interface ThoughtsExperienceProps {
  thoughts: ThoughtEntry[]
  children?: ReactNode
}

const modeFor = (view: View): EngineMode =>
  view === 'portal' ? 'portal' : view === 'archive' ? 'archive' : 'off'

const lockScroll = () => {
  document.documentElement.style.overflow = 'hidden'
}
const unlockScroll = () => {
  document.documentElement.style.overflow = ''
}

export function ThoughtsExperience({ thoughts, children }: ThoughtsExperienceProps) {
  const pathname = usePathname()
  const router = useRouter()
  const slugs = useMemo(() => thoughts.map((thought) => thought.slug), [thoughts])
  const { view, slug } = parseScene(pathname, slugs)

  const [store] = useState(() =>
    createExperienceStore({
      selected: slug,
      readerSlug: view === 'read' ? slug : null,
      navigated: false,
    })
  )
  const { selected, readerSlug: heldReader, navigated } = useExperienceState(store)

  const find = (key: string | null | undefined) =>
    key ? thoughts.find((thought) => thought.slug === key) : undefined
  const first = thoughts[0]
  const selectedThought = find(selected) ?? null
  const focusThought = find(slug) ?? selectedThought ?? first
  const readerThought = find(view === 'read' ? slug : heldReader)
  const nextThought = (readerThought && find(readerThought.nextSlug)) || first
  const backdropImage =
    view === 'portal' || view === 'read'
      ? (focusThought.heroImage ?? focusThought.coverImage)
      : (selectedThought ?? first).coverImage

  const rootRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const parallaxRef = useRef<HTMLDivElement>(null)
  const atmosRef = useRef<HTMLDivElement>(null)
  const deepRef = useRef<HTMLDivElement>(null)
  const archiveRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const rigRef = useRef<HTMLDivElement>(null)
  const shadowRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const readerRef = useRef<HTMLElement>(null)
  const chromeRef = useRef<HTMLElement>(null)
  const touchRef = useRef<{ x: number; y: number; t: number } | null>(null)

  const engineRef = useRef<DepthEngine | null>(null)
  const choreoRef = useRef<Choreography | null>(null)
  const runRef = useRef(0)
  const sceneRef = useRef<Scene | null>(null)
  /** our own record of in-app history, so "back" controls can mirror the browser's back */
  const trailRef = useRef<string[]>([])

  /* ── the view changed: choreograph the way there ── */
  useLayoutEffect(() => {
    const to: Scene = { view, slug }
    const from = sceneRef.current
    sceneRef.current = to
    document.documentElement.dataset.thoughts = view

    const trail = trailRef.current
    if (trail.length >= 2 && trail[trail.length - 2] === pathname) trail.pop()
    else if (trail[trail.length - 1] !== pathname) trail.push(pathname)

    if (slug) store.set({ selected: slug })
    if (!from) {
      if (view === 'read') store.set({ readerSlug: slug })
      return
    }
    store.set({ navigated: true })

    const previous = choreoRef.current
    previous?.fastForward()
    const c = new Choreography()
    choreoRef.current = c
    const run = ++runRef.current
    const alive = () => runRef.current === run
    const engine = engineRef.current
    const plan = planFor(from, to)

    if (plan === 'stylesheet') engine?.setMode(modeFor(view))
    else lockScroll()

    const stage = (): Stage => ({
      root: rootRef.current,
      backdrop: backdropRef.current,
      atmos: atmosRef.current,
      deep: deepRef.current,
      archive: archiveRef.current,
      sheet: sheetRef.current,
      rig: rigRef.current,
      shadow: shadowRef.current,
      reader: readerRef.current,
    })
    const done = runPlan(plan, from, to, c, {
      stage,
      engine,
      reduced: prefersReducedMotion(),
      alive,
    })
    // the previous choreography's final frame is now pinned by this one's holds
    previous?.release()

    void done.then(async () => {
      if (!alive()) return
      store.set({ readerSlug: view === 'read' ? slug : null })
      await nextFrame()
      if (!alive()) return
      if (view !== 'read') window.scrollTo({ top: 0, behavior: 'instant' })
      unlockScroll()
      if (view === 'read') {
        engine?.setMode('off')
        engine?.jumpToLifted()
      } else {
        engine?.setMode(modeFor(view))
      }
      c.release()

      const target =
        view === 'read'
          ? readerRef.current?.querySelector<HTMLElement>('#thought-title')
          : view === 'portal'
            ? findCard(rigRef.current, slug)
            : view === 'archive'
              ? rootRef.current?.querySelector<HTMLElement>('[data-selector] a[data-active]')
              : null
      target?.focus({ preventScroll: true })
    })
  }, [view, slug, pathname, store])

  /* ── the depth engine lives as long as the room ── */
  useEffect(() => {
    if (prefersReducedMotion()) return
    const engine = new DepthEngine()
    engine.attach({
      backdrop: parallaxRef.current,
      title: titleRef.current,
      rig: rigRef.current,
      shadow: shadowRef.current,
    })
    engineRef.current = engine
    const current = sceneRef.current
    if (current?.view === 'read') engine.jumpToLifted()
    else engine.setMode(modeFor(current?.view ?? 'archive'))
    return () => {
      engine.destroy()
      engineRef.current = null
    }
  }, [])

  /* ── document-level housekeeping for the life of the room ── */
  useEffect(() => {
    const html = document.documentElement
    const restoration = history.scrollRestoration
    history.scrollRestoration = 'manual'
    return () => {
      history.scrollRestoration = restoration
      delete html.dataset.thoughts
      html.style.overflow = ''
      choreoRef.current?.release()
    }
  }, [])

  /* ── fetch the other photographs once the first one has had the network to itself ── */
  useEffect(() => {
    const images = thoughts.flatMap((thought) =>
      thought.heroImage ? [thought.coverImage, thought.heroImage] : [thought.coverImage]
    )
    let idle = 0
    const timer = window.setTimeout(() => {
      if ('requestIdleCallback' in window) idle = window.requestIdleCallback(() => warmImages(images))
      else warmImages(images)
    }, 1600)
    return () => {
      window.clearTimeout(timer)
      if (idle && 'cancelIdleCallback' in window) window.cancelIdleCallback(idle)
    }
  }, [thoughts])

  /* ── moving through the archive ── */
  const select = useCallback((key: string) => store.set({ selected: key }), [store])

  const step = useCallback(
    (direction: 1 | -1) => {
      const current = store.get().selected
      const index = current ? slugs.indexOf(current) : -1
      const next =
        index === -1
          ? direction === 1
            ? 0
            : slugs.length - 1
          : Math.min(slugs.length - 1, Math.max(0, index + direction))
      store.set({ selected: slugs[next] })
    },
    [store, slugs]
  )

  const goUp = useCallback(() => {
    const current = sceneRef.current
    if (!current) return
    const parent = parentHref(current)
    const trail = trailRef.current
    if (trail.length >= 2 && trail[trail.length - 2] === parent) router.back()
    else router.push(parent, { scroll: false })
  }, [router])

  // a trackpad flick or a wheel notch moves one thought — never a whole run of them
  useEffect(() => {
    if (view !== 'archive') return
    let travel = 0
    let lastEvent = 0
    let lastStep = 0
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return
      const now = performance.now()
      const gap = now - lastEvent
      lastEvent = now
      if (gap > 220) travel = 0
      const sinceStep = now - lastStep
      if (lastStep && (sinceStep < 480 || (gap < 200 && sinceStep < 1100))) return
      travel += event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY
      if (Math.abs(travel) > 46) {
        step(travel > 0 ? 1 : -1)
        travel = 0
        lastStep = now
      }
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [view, step])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target instanceof HTMLElement ? event.target : null
      if (target?.closest('input, textarea, select, [contenteditable]')) return

      if (view === 'archive') {
        if (target?.closest('[data-selector]')) return
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
          event.preventDefault()
          step(1)
        } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
          event.preventDefault()
          step(-1)
        } else if (event.key === 'Enter' && (!target || target === document.body)) {
          const current = store.get().selected
          if (current) router.push(hrefs.portal(current), { scroll: false })
        }
      } else if (view === 'portal' && slug) {
        const index = slugs.indexOf(slug)
        if (event.key === 'Escape') {
          event.preventDefault()
          goUp()
        } else if ((event.key === 'ArrowRight' || event.key === 'ArrowDown') && index < slugs.length - 1) {
          event.preventDefault()
          router.push(hrefs.portal(slugs[index + 1]), { scroll: false })
        } else if ((event.key === 'ArrowLeft' || event.key === 'ArrowUp') && index > 0) {
          event.preventDefault()
          router.push(hrefs.portal(slugs[index - 1]), { scroll: false })
        }
      } else if (view === 'read' && event.key === 'Escape') {
        event.preventDefault()
        goUp()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [view, slug, slugs, step, store, router, goUp])

  /* ── while reading, the back control steps aside as you read on ── */
  useEffect(() => {
    if (view !== 'read') return
    const chrome = chromeRef.current
    if (!chrome) return
    let last = window.scrollY
    let frame = 0
    const update = () => {
      frame = 0
      const y = window.scrollY
      if (y > last + 4 && y > 140) chrome.dataset.tucked = ''
      else if (y < last - 4 || y < 80) delete chrome.dataset.tucked
      last = y
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
      delete chrome.dataset.tucked
    }
  }, [view])

  const back =
    view === 'archive'
      ? { href: '/', label: 'wikverse' }
      : view === 'read' && slug
        ? { href: hrefs.portal(slug), label: 'thoughts' }
        : { href: hrefs.archive, label: 'thoughts' }

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={rootRef}
        className={styles.root}
        data-thoughts-view={view}
        data-entrance={navigated ? undefined : ''}
        onTouchStart={(event) => {
          if (view !== 'archive') return
          const touch = event.touches[0]
          touchRef.current = { x: touch.clientX, y: touch.clientY, t: event.timeStamp }
        }}
        onTouchEnd={(event) => {
          const start = touchRef.current
          touchRef.current = null
          if (!start || view !== 'archive') return
          const touch = event.changedTouches[0]
          const dx = touch.clientX - start.x
          const dy = touch.clientY - start.y
          if (Math.abs(dy) > 42 && Math.abs(dy) > Math.abs(dx) * 1.2 && event.timeStamp - start.t < 900) {
            step(dy < 0 ? 1 : -1)
          }
        }}
      >
        <Backdrop ref={backdropRef} parallaxRef={parallaxRef} image={backdropImage} />
        <div ref={atmosRef} className={styles.atmos} aria-hidden="true" />
        <div ref={deepRef} className={styles.deep} aria-hidden="true" />

        <div ref={archiveRef} className={styles.archive}>
          <div className={styles.titleSlot} inert={view !== 'archive'}>
            {view === 'archive' && <h1 className={styles.srOnly}>thoughts</h1>}
            <ArchiveTitle ref={titleRef} thought={selectedThought} interactive={view === 'archive'} />
          </div>
          <div className={styles.selectorSlot} inert={view !== 'archive' && view !== 'portal'}>
            <Selector
              thoughts={thoughts}
              active={view === 'archive' ? selected : (slug ?? selected)}
              view={view}
              onSelect={select}
            />
          </div>
        </div>

        <PortalCard
          thought={focusThought}
          live={view === 'portal'}
          rigRef={rigRef}
          shadowRef={shadowRef}
          onEnter={() => engineRef.current?.settle()}
        />

        <div ref={sheetRef} className={styles.sheet} aria-hidden="true" />

        {readerThought && (
          <Reader ref={readerRef} thought={readerThought} next={nextThought} entrance={!navigated} />
        )}

        <nav ref={chromeRef} className={styles.chrome} aria-label="back">
          <Link
            href={back.href}
            scroll={false}
            className={styles.back}
            onNavigate={(event) => {
              const current = sceneRef.current
              if (!current || current.view === 'archive') return
              const trail = trailRef.current
              if (trail.length >= 2 && trail[trail.length - 2] === parentHref(current)) {
                event.preventDefault()
                router.back()
              }
            }}
          >
            <span className={styles.backArrow} aria-hidden="true">
              ←
            </span>
            {back.label}
          </Link>
        </nav>

        {children}
      </div>
    </MotionConfig>
  )
}
