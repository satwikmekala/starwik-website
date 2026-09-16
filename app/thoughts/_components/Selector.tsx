'use client'

/**
 * The selector — a column of hand-made marks, one per thought.
 *
 * Hover (or focus, or a first tap) chooses a thought; a click on the
 * chosen mark opens it. Every mark is a real link, so keyboard, screen
 * readers, middle-click and "open in new tab" all behave.
 */

import { useRef, type KeyboardEvent, type PointerEvent } from 'react'
import Link from 'next/link'
import type { ThoughtEntry } from '@/content/thoughts/helpers'
import { HandStroke } from './HandStroke'
import { hrefs, type View } from './scene'
import { selectorStroke } from './strokes'
import styles from './archive.module.css'

interface SelectorProps {
  thoughts: ThoughtEntry[]
  /** the chosen thought in the archive, or the open one in the portal */
  active: string | null
  view: View
  onSelect: (slug: string) => void
}

export function Selector({ thoughts, active, view, onSelect }: SelectorProps) {
  const links = useRef<Array<HTMLAnchorElement | null>>([])
  const lastPointer = useRef<string>('mouse')
  const inArchive = view === 'archive'
  const interactive = view === 'archive' || view === 'portal'
  const activeEntry = thoughts.find((thought) => thought.slug === active)

  const onKeyDown = (event: KeyboardEvent<HTMLOListElement>) => {
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End']
    if (!keys.includes(event.key)) return
    const current = links.current.findIndex((link) => link === document.activeElement)
    if (current === -1) return
    event.preventDefault()
    const last = thoughts.length - 1
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? last
          : event.key === 'ArrowDown'
            ? Math.min(last, current + 1)
            : Math.max(0, current - 1)
    links.current[next]?.focus()
  }

  return (
    <nav
      className={styles.selector}
      aria-label="thoughts"
      data-selector
      data-interactive={interactive || undefined}
    >
      <ol className={styles.list} onKeyDown={onKeyDown}>
        {thoughts.map((thought, index) => {
          const stroke = selectorStroke(index)
          const isActive = thought.slug === active
          return (
            <li
              key={thought.slug}
              className={styles.item}
              style={{ '--i': index, '--len': `${stroke.width}px` } as React.CSSProperties}
            >
              <Link
                ref={(el) => {
                  links.current[index] = el
                }}
                href={hrefs.portal(thought.slug)}
                scroll={false}
                className={styles.mark}
                data-active={isActive || undefined}
                tabIndex={interactive ? 0 : -1}
                aria-label={`${thought.number}, ${thought.plainTitle}`}
                aria-current={view === 'portal' && isActive ? 'page' : undefined}
                onPointerDown={(event: PointerEvent) => {
                  lastPointer.current = event.pointerType
                }}
                onPointerEnter={(event: PointerEvent) => {
                  if (inArchive && event.pointerType !== 'touch') onSelect(thought.slug)
                }}
                onFocus={() => {
                  if (inArchive) onSelect(thought.slug)
                }}
                onClick={(event) => {
                  // on touch the first tap only chooses; the second one opens
                  if (inArchive && lastPointer.current === 'touch' && !isActive) {
                    event.preventDefault()
                    onSelect(thought.slug)
                  }
                  lastPointer.current = 'mouse'
                }}
              >
                <span className={styles.markDot} aria-hidden="true" />
                <HandStroke stroke={stroke} className={styles.markLine} />
                <span className={styles.markLabel} aria-hidden="true">
                  {thought.plainTitle}
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
      <p className={styles.count} aria-hidden="true">
        <span className={styles.countCurrent}>{activeEntry?.number ?? '——'}</span>
        <span className={styles.countSep}>/</span>
        {String(thoughts.length).padStart(2, '0')}
      </p>
    </nav>
  )
}
