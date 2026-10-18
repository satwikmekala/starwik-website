'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Sketch } from './ThoughtDoodles'
import styles from './archiveDoodles.module.css'

function Ink({ children }: { children: ReactNode }) {
  return <Sketch traceClassName={styles.trace}>{children}</Sketch>
}

function Star() {
  return <Ink><path d="M67 109q38-4 41-46 5 43 43 46-40 5-43 48-4-43-41-48Z" /><path d="M160 170v18m-9-9h18" /></Ink>
}
function Moon() {
  return <Ink><path d="M139 64c-68-2-100 76-52 113 25 21 62 19 86-10-41 9-74-14-75-46 0-25 15-45 41-57Z" /><path d="M169 78v16m-8-8h16" /></Ink>
}
function Paw() {
  return <Ink>
    <path d="M85 140q-24 31 0 32 22-10 46 0 22-3-1-33-21-25-45 1Z" />
    <ellipse cx="72" cy="118" rx="9" ry="14" transform="rotate(-25 72 118)" />
    <ellipse cx="96" cy="99" rx="9" ry="15" /><ellipse cx="123" cy="100" rx="9" ry="15" />
    <ellipse cx="147" cy="121" rx="9" ry="14" transform="rotate(26 147 121)" />
  </Ink>
}
function Heart() {
  return <Ink><path d="M107 167c-62-40-63-78-35-77 18 0 30 14 37 28 11-24 33-33 47-14 16 24-14 47-49 63Z" /></Ink>
}
function Leaf() {
  return <Ink><path d="M64 182q11-65 92-111 12 72-29 99-26 17-51 1M64 182l70-89m-44 59-1-26m15 6 28-7" /></Ink>
}
function Spiral() {
  return <Ink><path d="M111 120c9-15 27 1 16 14-15 17-48-1-33-28 18-32 64-6 54 24-19 50-87 27-83-15 6-51 74-64 106-21" /></Ink>
}
function Orbit() {
  return <Ink><ellipse cx="110" cy="120" rx="35" ry="75" transform="rotate(-42 110 120)" /><circle cx="110" cy="120" r="5" /><path d="M169 170v14m-7-7h14" /></Ink>
}
function Trail() {
  return <Ink><path d="M36 184c77-5 38-68 82-79 26-6 32-26 52-48" /><path d="m155 55 17-1-2 16M45 195l-12 2" /></Ink>
}
function Window() {
  return <Ink><path d="M65 78h87v104H65ZM107 79v102M65 130h86M52 189h111" /><path d="M119 105h21m-11-10v20M43 69l-7-8" /></Ink>
}
function Steam() {
  return <Ink><path d="M70 134h75v30q-3 25-36 26-37 0-39-29ZM145 140q39-7 26 21-7 10-25 8M60 199q54 7 104-1" /><path d="M83 117q-18-17-1-34m24 32q-13-23 3-37m21 40q-13-18 1-31" /></Ink>
}
function Sound() {
  return <Ink><path d="M42 128q15-42 29 0t29 0 29 0 29 0 29 0M52 155q15-18 27 0t26 0 26 0 26 0" /></Ink>
}
function SparkArrow() {
  return <Ink><path d="M47 173q76 7 114-89m-22 8 25-14-1 28" /><path d="M76 77v21m-10-10h21" /></Ink>
}
function UnfinishedConstellation() {
  return <Ink>
    <path d="m35 159 51-67 60 24 33-48" strokeDasharray="2 8" />
    <circle cx="35" cy="159" r="4" /><circle cx="86" cy="92" r="3" />
    <circle cx="146" cy="116" r="4" />
    <path d="M166 65q12-2 13-16 2 15 16 16-14 2-16 16-2-14-13-16Z" />
  </Ink>
}

const MARKS = { star: Star, moon: Moon, paw: Paw, heart: Heart, leaf: Leaf, spiral: Spiral, orbit: Orbit, trail: Trail, window: Window, steam: Steam, sound: Sound, arrow: SparkArrow } as const
type MarkName = keyof typeof MARKS
type Mark = { drawing: MarkName; side: 'left' | 'right'; x: number; y: number; size: number; angle: number }

// Only one trio is visible at a time. Every new trio has a different balance.
const AMBIENT: readonly (readonly Mark[])[] = [
  [
    { drawing: 'moon', side: 'left', x: 47, y: .15, size: 58, angle: -18 },
    { drawing: 'leaf', side: 'right', x: 57, y: .5, size: 51, angle: 16 },
    { drawing: 'star', side: 'left', x: 63, y: .87, size: 43, angle: 12 },
  ],
  [
    { drawing: 'spiral', side: 'right', x: 43, y: .11, size: 55, angle: 18 },
    { drawing: 'paw', side: 'left', x: 38, y: .56, size: 46, angle: -24 },
    { drawing: 'heart', side: 'right', x: 66, y: .91, size: 40, angle: -12 },
  ],
  [
    { drawing: 'star', side: 'right', x: 62, y: .25, size: 46, angle: -17 },
    { drawing: 'leaf', side: 'left', x: 56, y: .71, size: 53, angle: 24 },
    { drawing: 'orbit', side: 'right', x: 36, y: .95, size: 56, angle: 14 },
  ],
]
const ESCAPES: Record<string, readonly [MarkName, MarkName]> = {
  'the-long-way-home': ['trail', 'moon'],
  'the-comfortable-version': ['arrow', 'leaf'],
  'the-monk-i-live-with': ['paw', 'paw'],
  'sunday-morning': ['window', 'steam'],
  'the-order-of-operations': ['sound', 'spiral'],
  'superposition-of-love': ['orbit', 'heart'],
}
const TINTS: Record<string, string> = {
  'the-long-way-home': '#a8b6ff', 'the-comfortable-version': '#c7b4ed',
  'the-monk-i-live-with': '#efbb9a', 'sunday-morning': '#a8b6ff',
  'the-order-of-operations': '#a8b8e7', 'superposition-of-love': '#a6bfdc',
}
type Anchor = { slug: string; side: 'left' | 'right'; y: number }

/** A page-bound margin, so the pencil marks travel with the archive as it scrolls. */
export function ArchiveDoodles({ interactive }: { interactive: boolean }) {
  const root = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<string | null>(null)
  const [anchors, setAnchors] = useState<Anchor[]>([])

  useEffect(() => {
    const layer = root.current
    const index = layer?.parentElement
    const grid = index?.querySelector<HTMLElement>('ul')
    if (!layer || !index || !grid || !interactive) return
    const desktop = window.matchMedia('(min-width: 1120px)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let linger: ReturnType<typeof setTimeout> | undefined
    let frame = 0
    let hovered: string | null = null
    let focused: string | null = null
    const cardFrom = (target: EventTarget | null) => target instanceof Element ? target.closest<HTMLElement>('[data-archive-slug]') : null
    const updateActive = () => {
      clearTimeout(linger)
      const slug = hovered ?? focused
      if (slug) setActive(slug)
      else linger = setTimeout(() => setActive(null), 1500)
    }
    const over = (event: PointerEvent) => {
      if (!desktop.matches || event.pointerType === 'touch') return
      const card = cardFrom(event.target)
      if (card && !card.contains(event.relatedTarget as Node | null)) {
        hovered = card.dataset.archiveSlug ?? null
        updateActive()
      }
    }
    const out = (event: PointerEvent) => {
      const card = cardFrom(event.target)
      if (card && !card.contains(event.relatedTarget as Node | null)) { hovered = null; updateActive() }
    }
    const focus = (event: FocusEvent) => {
      if (!desktop.matches) return
      hovered = null
      focused = cardFrom(event.target)?.dataset.archiveSlug ?? null
      updateActive()
    }
    const blur = (event: FocusEvent) => {
      focused = cardFrom(event.relatedTarget)?.dataset.archiveSlug ?? null
      updateActive()
    }
    const measure = () => {
      frame = 0
      const bounds = layer.getBoundingClientRect()
      const area = grid.getBoundingClientRect()
      layer.style.setProperty('--grid-top', `${area.top - bounds.top}px`)
      layer.style.setProperty('--grid-height', `${area.height}px`)
      setAnchors([...grid.querySelectorAll<HTMLElement>('[data-archive-slug]')].map(card => {
        const rect = card.getBoundingClientRect()
        return { slug: card.dataset.archiveSlug!, side: rect.left + rect.width / 2 < bounds.left + bounds.width / 2 ? 'left' : 'right', y: rect.top - bounds.top + rect.height * .5 }
      }))
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure) }
    const visibility = () => { layer.dataset.paused = String(document.hidden || reduced.matches) }
    const observer = new ResizeObserver(schedule)
    observer.observe(grid)
    observer.observe(index)
    schedule()
    visibility()
    index.addEventListener('pointerover', over)
    index.addEventListener('pointerout', out)
    index.addEventListener('focusin', focus)
    index.addEventListener('focusout', blur)
    window.addEventListener('resize', schedule)
    document.addEventListener('visibilitychange', visibility)
    reduced.addEventListener('change', visibility)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      clearTimeout(linger)
      index.removeEventListener('pointerover', over)
      index.removeEventListener('pointerout', out)
      index.removeEventListener('focusin', focus)
      index.removeEventListener('focusout', blur)
      window.removeEventListener('resize', schedule)
      document.removeEventListener('visibilitychange', visibility)
      reduced.removeEventListener('change', visibility)
    }
  }, [interactive])

  return <div ref={root} className={styles.layer} aria-hidden="true" data-archive-doodles data-engaged={active !== null}>
    <div className={styles.constellation}><UnfinishedConstellation /></div>
    {(['left', 'right'] as const).map(side => <div key={side} className={styles.margin} data-side={side}>
      <div className={styles.ambientGroup}>{AMBIENT.flatMap((group, phase) => group.map((mark, index) => {
        if (mark.side !== side) return null
        const Drawing = MARKS[mark.drawing]
        return <div key={`${phase}-${index}`} className={`${styles.mark} ${styles.ambient}`} data-phase={phase} style={{ '--x': `${mark.x}%`, '--y': `calc(var(--grid-top, 280px) + var(--grid-height, 700px) * ${mark.y})`, '--size': `${mark.size}px`, '--angle': `${mark.angle}deg`, '--phase': `${phase * -12}s`, '--pen-delay': `${index * 180}ms` } as CSSProperties}><Drawing /></div>
      }))}</div>
      {anchors.flatMap(anchor => {
        if (anchor.side !== side || !ESCAPES[anchor.slug]) return []
        return ESCAPES[anchor.slug].map((drawing, index) => {
          const Drawing = MARKS[drawing]
          return <div key={`${anchor.slug}-${index}`} className={`${styles.mark} ${styles.escape}`} data-active={anchor.slug === active} data-escape={anchor.slug} style={{ '--x': `${side === 'left' ? index ? 40 : 60 : index ? 60 : 40}%`, '--y': `${anchor.y + (index ? 36 : -24)}px`, '--size': `${index ? 48 : 68}px`, '--angle': `${side === 'left' ? index ? -24 : 12 : index ? 18 : -12}deg`, '--pen-delay': `${index * 220}ms`, color: TINTS[anchor.slug] } as CSSProperties}><Drawing /></div>
        })
      })}
    </div>)}
  </div>
}

export function ArchiveTitleSpark() {
  return <span className={styles.titleSpark} aria-hidden="true"><Star /></span>
}
