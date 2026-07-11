'use client'

import { Fragment, useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { Transmission } from './TransmitFeed'
import styles from './transmit.module.css'

export default function TransmitReader({
  entry,
  isDesktop,
  onClose,
}: {
  entry: Transmission
  isDesktop: boolean
  onClose: () => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const body = entry.body ?? []
  const quoteAfter = entry.pullQuoteAfter ?? -1

  /* slides in from the right on desktop, rises from below on mobile */
  const off = isDesktop ? { x: '100%' } : { y: '100%' }
  const on = isDesktop ? { x: 0 } : { y: 0 }

  return (
    <motion.div
      className={styles.reader}
      role="dialog"
      aria-modal="true"
      aria-label={entry.title}
      initial={reduced ? { opacity: 0 } : off}
      animate={reduced ? { opacity: 1 } : on}
      exit={reduced ? { opacity: 0 } : off}
      transition={
        reduced
          ? { duration: 0.15 }
          : { duration: 0.6, ease: [0.32, 0.72, 0, 1] }
      }
    >
      <div className={styles.readerBg} aria-hidden="true" />
      <button
        ref={closeRef}
        className={styles.readerClose}
        onClick={onClose}
        aria-label="Close essay"
      >
        ✕
      </button>
      <div className={styles.readerScroll}>
        <div className={styles.readerInner}>
          <p className={`${styles.metaLine} ${styles.readerMeta}`}>
            <span className={styles.metaNum}>
              {String(entry.index).padStart(3, '0')}
            </span>
            <span className={styles.metaDate}>{entry.date.toUpperCase()}</span>
          </p>
          <h1 className={styles.readerTitle}>{entry.title}</h1>
          {body.map((paragraph, i) => (
            <Fragment key={i}>
              <p className={styles.readerBody}>{paragraph}</p>
              {i === quoteAfter && entry.pullQuote && (
                <blockquote className={styles.pullQuote}>
                  {entry.pullQuote}
                </blockquote>
              )}
            </Fragment>
          ))}
          <p className={styles.readerEnd}>— END OF TRANSMISSION</p>
        </div>
      </div>
    </motion.div>
  )
}
