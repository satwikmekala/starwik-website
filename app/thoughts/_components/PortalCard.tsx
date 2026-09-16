'use client'

/**
 * The portal — one sheet of paper hanging in the photograph.
 *
 * The rig (tilt, float, parallax) is driven by the depth engine; the
 * sheet inside it is swapped with a soft cross-fade when the visitor
 * moves between thoughts. The whole sheet is the link into the reading.
 */

import type { Ref } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import type { ThoughtEntry } from '@/content/thoughts/helpers'
import { HandArrow } from './HandStroke'
import { hrefs } from './scene'
import styles from './portal.module.css'

interface PortalCardProps {
  thought: ThoughtEntry
  /** swaps only animate while the card is actually on screen */
  live: boolean
  stageRef?: Ref<HTMLDivElement>
  rigRef?: Ref<HTMLDivElement>
  shadowRef?: Ref<HTMLDivElement>
  /** the moment of the click — lets the card start settling before the route commits */
  onEnter?: () => void
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const
const EASE_IN = [0.5, 0, 0.75, 0] as const

const sheet: Variants = {
  enter: (live: boolean) => (live ? { opacity: 0, y: 18, scale: 0.985 } : { opacity: 1 }),
  shown: (live: boolean) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: live ? { duration: 0.9, ease: EASE_OUT, delay: 0.22 } : { duration: 0 },
  }),
  gone: (live: boolean) =>
    live
      ? { opacity: 0, y: -10, scale: 1.01, transition: { duration: 0.42, ease: EASE_IN } }
      : { opacity: 0, transition: { duration: 0 } },
}

export function PortalCard({ thought, live, stageRef, rigRef, shadowRef, onEnter }: PortalCardProps) {
  return (
    <div ref={stageRef} className={styles.stage} inert={!live}>
      <div ref={shadowRef} className={styles.shadow} aria-hidden="true" />
      <div ref={rigRef} className={styles.rig}>
        <AnimatePresence initial={false} custom={live}>
          <motion.div
            key={thought.slug}
            className={styles.swap}
            custom={live}
            variants={sheet}
            initial="enter"
            animate="shown"
            exit="gone"
          >
            <h1 className={styles.srOnly}>{thought.plainTitle}</h1>
            <Link
              href={hrefs.read(thought.slug)}
              scroll={false}
              className={styles.card}
              data-slug={thought.slug}
              aria-label={`read “${thought.plainTitle}”`}
              onNavigate={() => onEnter?.()}
            >
              <span className={styles.cardKicker} data-flip="kicker">
                {thought.number} / thought
              </span>
              <span className={styles.cardTitle} data-flip="title">
                <span className={styles.cardTitleInner}>
                  {thought.titleLines.map((words, index) => (
                    <span key={index} className={styles.cardTitleLine}>
                      {words}
                    </span>
                  ))}
                </span>
              </span>
              {thought.subtitleLines.length > 0 && (
                <span className={styles.cardSubtitle} data-flip="subtitle">
                  {thought.subtitleLines.map((words, index) => (
                    <span key={index} className={styles.cardSubtitleLine}>
                      {words}
                    </span>
                  ))}
                </span>
              )}
              <span className={styles.cardCta} data-cta>
                read the thought
                <HandArrow className={styles.cardArrow} />
              </span>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
