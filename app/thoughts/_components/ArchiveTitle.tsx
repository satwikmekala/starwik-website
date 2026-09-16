'use client'

/**
 * The title in the middle of the room. It reads "thoughts" until a mark
 * is chosen, then becomes that thought's title — the old words lift and
 * soften away while the new ones settle up into focus, line by line.
 */

import type { Ref } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import type { ThoughtEntry } from '@/content/thoughts/helpers'
import { hrefs } from './scene'
import styles from './archive.module.css'

interface ArchiveTitleProps {
  thought: ThoughtEntry | null
  interactive: boolean
  /** outer wrapper — leaned toward the cursor by the depth engine */
  ref?: Ref<HTMLDivElement>
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const
const EASE_IN = [0.5, 0, 0.75, 0] as const

const block: Variants = {
  enter: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: 0.2, staggerChildren: 0.075, delayChildren: 0.06 } },
  gone: {
    opacity: 0,
    y: -8,
    filter: 'blur(5px)',
    transition: { duration: 0.38, ease: EASE_IN },
  },
}

const line: Variants = {
  enter: { opacity: 0, y: 12, filter: 'blur(8px)' },
  shown: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.85, ease: EASE_OUT },
  },
}

export function ArchiveTitle({ thought, interactive, ref }: ArchiveTitleProps) {
  const lines = thought ? thought.titleLines : ['thoughts']

  const text = (
    <span className={styles.titleText} aria-hidden="true">
      {lines.map((words, index) => (
        <motion.span key={index} className={styles.titleLine} variants={line}>
          {words}
        </motion.span>
      ))}
    </span>
  )

  return (
    <div ref={ref} className={styles.titleWrap}>
      <div className={styles.titleStage}>
        <AnimatePresence initial={false}>
          <motion.div
            key={thought?.slug ?? 'idle'}
            className={styles.titleItem}
            data-idle={thought ? undefined : ''}
            variants={block}
            initial="enter"
            animate="shown"
            exit="gone"
          >
            {thought ? (
              <Link
                href={hrefs.portal(thought.slug)}
                scroll={false}
                className={styles.titleLink}
                tabIndex={interactive ? 0 : -1}
                aria-label={`open ${thought.number}, ${thought.plainTitle}`}
              >
                {text}
                <span className={styles.titleHint} aria-hidden="true">
                  tap to open
                </span>
              </Link>
            ) : (
              text
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
