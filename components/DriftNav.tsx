/**
 * DriftNav — fixed vertical dot navigation, left side.
 * Unfilled = not yet reached, dim amber = already visited,
 * filled amber (pulsing) = current. Hover slides the destination
 * name out beside the dot. Click jumps straight to that chapter.
 *
 * (The build spec placed the dots at right: 1.5rem, but the chapter
 * panel owns the right edge — the dots live on the left so the two
 * never collide.)
 */
'use client'

import type { Chapter } from '@/app/drift/chapters'
import styles from '@/app/drift/drift.module.css'

interface DriftNavProps {
  chapters: Chapter[]
  activeIndex: number
  onSelect: (index: number) => void
}

export default function DriftNav({
  chapters,
  activeIndex,
  onSelect,
}: DriftNavProps) {
  return (
    <nav className={styles.dotNav} aria-label="Journey chapters">
      {chapters.map((chapter, i) => {
        const state =
          i === activeIndex
            ? styles.dotCurrent
            : i < activeIndex
              ? styles.dotVisited
              : ''
        return (
          <button
            key={chapter.id}
            type="button"
            className={`${styles.dotItem} ${state}`}
            onClick={() => onSelect(i)}
            aria-label={`Chapter ${i}: ${chapter.title}`}
            aria-current={i === activeIndex ? 'step' : undefined}
          >
            <span className={styles.dot} />
            <span className={styles.dotLabel}>{chapter.title}</span>
          </button>
        )
      })}
    </nav>
  )
}
