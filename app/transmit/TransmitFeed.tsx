'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import TransmitEntry from './TransmitEntry'
import TransmitReader from './TransmitReader'
import styles from './transmit.module.css'

export type TransmissionType = 'thought' | 'photo' | 'essay' | 'moment'

export interface TransmissionMedia {
  /** CSS aspect-ratio value, e.g. '4 / 3' */
  ratio: string
  /** the same ratio as a number, for viewport-fitting math */
  ratioValue: number
  /** placeholder gradient until real photos arrive */
  gradient: string
  alt: string
}

export interface Transmission {
  id: string
  /** transmission number — 001 was the first ever sent */
  index: number
  type: TransmissionType
  date: string
  /** thought / moment text */
  content?: string
  /** photo caption */
  caption?: string
  /** essay */
  title?: string
  opening?: string
  body?: string[]
  pullQuote?: string
  /** index of the body paragraph the pull quote follows */
  pullQuoteAfter?: number
  media?: TransmissionMedia
}

const PANEL_WIDTH: Record<TransmissionType, string> = {
  thought: styles.wThought,
  photo: styles.wPhoto,
  essay: styles.wEssay,
  moment: styles.wMoment,
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v))

/* ── DESKTOP — one axis of movement, and it goes right ── */

function HorizontalTrack({
  entries,
  onRead,
  readingRef,
  onActiveChange,
  progress,
}: {
  entries: Transmission[]
  onRead: (entry: Transmission) => void
  readingRef: React.RefObject<boolean>
  onActiveChange: (index: number) => void
  progress: MotionValue<number>
}) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const boundsRef = useRef({ max: 0, snaps: [] as number[] })

  const target = useMotionValue(0)
  /* the physics: a flick glides and settles — it never snaps */
  const spring = useSpring(target, { stiffness: 80, damping: 20 })
  const x = useTransform(spring, (v) => -v)

  /* measure snap positions and the scrollable range */
  useEffect(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return

    const measure = () => {
      const leftPad = viewport.clientWidth * 0.06
      const snaps = Array.from(
        track.querySelectorAll<HTMLElement>('[data-entry]')
      ).map((el) => Math.max(0, el.offsetLeft - leftPad))
      const max = Math.max(0, track.scrollWidth - viewport.clientWidth)
      boundsRef.current = { max, snaps }
      target.set(clamp(target.get(), 0, max))
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(viewport)
    ro.observe(track)
    return () => ro.disconnect()
  }, [entries, target])

  /* wheel and trackpad both move the one axis */
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (readingRef.current) return
      if (e.ctrlKey) return /* pinch zoom stays the browser's business */
      e.preventDefault()
      const scale = e.deltaMode === 1 ? 16 : 1
      const delta = (e.deltaY + e.deltaX) * scale
      target.set(clamp(target.get() + delta, 0, boundsRef.current.max))
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [readingRef, target])

  /* arrow keys step between entries */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (readingRef.current) return
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
      e.preventDefault()
      const { snaps, max } = boundsRef.current
      if (!snaps.length) return
      const current = target.get()
      if (e.key === 'ArrowRight') {
        const next = snaps.find((s) => s > current + 4)
        target.set(clamp(next ?? max, 0, max))
      } else {
        const prev = [...snaps].reverse().find((s) => s < current - 4)
        target.set(clamp(prev ?? 0, 0, max))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [readingRef, target])

  useMotionValueEvent(spring, 'change', (v) => {
    const { max, snaps } = boundsRef.current
    progress.set(max > 0 ? clamp(v / max, 0, 1) : 0)
    if (!snaps.length) return
    const line = v + window.innerWidth * 0.35
    let idx = 0
    snaps.forEach((s, i) => {
      if (s <= line) idx = i
    })
    onActiveChange(idx)
  })

  return (
    <div ref={viewportRef} className={styles.hViewport}>
      <motion.div ref={trackRef} className={styles.hTrack} style={{ x }}>
        <div
          className={`${styles.hPanel} ${styles.introPanel} ${styles.arrived}`}
        >
          <span className={styles.introGhost} aria-hidden="true">
            TRANSMIT
          </span>
          <p className={`${styles.introSignal} ${styles.st} ${styles.st1}`}>
            LAST TRANSMISSION — {(entries[0]?.date ?? '').toUpperCase()}
          </p>
          <div
            className={`${styles.introRule} ${styles.st} ${styles.st2}`}
            aria-hidden="true"
          />
          <p className={`${styles.introSub} ${styles.st} ${styles.st3}`}>
            Signals from one frequency. No categories.
          </p>
        </div>

        {entries.map((entry) => (
          <div
            key={entry.id}
            data-entry
            className={`${styles.hPanel} ${PANEL_WIDTH[entry.type]}`}
          >
            <TransmitEntry entry={entry} onRead={onRead} />
          </div>
        ))}

        <div className={`${styles.hPanel} ${styles.endPanel}`}>
          <p className={styles.endText}>TRANSMISSION LOG ENDS</p>
          <div className={styles.endRule} aria-hidden="true" />
        </div>
      </motion.div>
    </div>
  )
}

/* ── MOBILE — vertical, native momentum, nothing hijacked ── */

function VerticalFeed({
  entries,
  onRead,
  onActiveChange,
  progress,
}: {
  entries: Transmission[]
  onRead: (entry: Transmission) => void
  onActiveChange: (index: number) => void
  progress: MotionValue<number>
}) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const items = Array.from(
      list.querySelectorAll<HTMLElement>('[data-entry]')
    )

    let raf = 0
    const update = () => {
      raf = 0
      const doc = document.documentElement
      const range = doc.scrollHeight - window.innerHeight
      progress.set(range > 0 ? clamp(window.scrollY / range, 0, 1) : 0)
      const line = window.innerHeight * 0.35
      let idx = 0
      items.forEach((el, i) => {
        if (el.getBoundingClientRect().top <= line) idx = i
      })
      onActiveChange(idx)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [entries, onActiveChange, progress])

  return (
    <div ref={listRef} className={styles.vFeed}>
      <header className={`${styles.vPad} ${styles.arrived}`}>
        <p className={`${styles.introSignal} ${styles.st} ${styles.st1}`}>
          LAST TRANSMISSION — {(entries[0]?.date ?? '').toUpperCase()}
        </p>
        <div
          className={`${styles.introRule} ${styles.st} ${styles.st2}`}
          aria-hidden="true"
        />
      </header>

      {entries.map((entry) => (
        <div key={entry.id} data-entry>
          <TransmitEntry entry={entry} onRead={onRead} />
        </div>
      ))}

      <footer className={styles.vPad}>
        <p className={styles.endText}>TRANSMISSION LOG ENDS</p>
        <div className={styles.endRule} aria-hidden="true" />
      </footer>
    </div>
  )
}

/* ── THE FEED ── */

export default function TransmitFeed({ entries }: { entries: Transmission[] }) {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null)
  const [reading, setReading] = useState<Transmission | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const readingRef = useRef(false)
  const progress = useMotionValue(0)

  useEffect(() => {
    readingRef.current = reading !== null
  }, [reading])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  /* the page holds still while the reader is up */
  useEffect(() => {
    if (!reading) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [reading])

  const onRead = useCallback((entry: Transmission) => setReading(entry), [])
  const onActiveChange = useCallback((i: number) => setActiveIndex(i), [])

  const activeDate = entries[activeIndex]?.date ?? entries[0]?.date ?? ''

  return (
    <div className={styles.page}>
      <div className={styles.bg} aria-hidden="true" />

      <nav className={styles.nav}>
        <Link href="/" className={styles.backLink}>
          ← Back to wikverse
        </Link>
        <span className={styles.navMark} aria-hidden="true">
          TRANSMIT
        </span>
        <span className={styles.navDate} key={activeDate} aria-hidden="true">
          {activeDate.toUpperCase()}
        </span>
      </nav>

      {isDesktop === true && (
        <HorizontalTrack
          entries={entries}
          onRead={onRead}
          readingRef={readingRef}
          onActiveChange={onActiveChange}
          progress={progress}
        />
      )}
      {isDesktop === false && (
        <VerticalFeed
          entries={entries}
          onRead={onRead}
          onActiveChange={onActiveChange}
          progress={progress}
        />
      )}

      <div className={styles.progressTrack} aria-hidden="true">
        <motion.div className={styles.progressFill} style={{ scaleX: progress }} />
      </div>

      <AnimatePresence>
        {reading && (
          <TransmitReader
            entry={reading}
            isDesktop={isDesktop === true}
            onClose={() => setReading(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
