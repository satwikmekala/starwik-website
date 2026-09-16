'use client'

import { AnimatePresence, motion } from 'framer-motion'

import { useListening } from './context'
import { Press } from './Press'
import { morph } from './motion'
import styles from './listening.module.css'

/**
 * The full-screen room. Its surface is the same element as the small entry
 * pill (layoutId "room-entry"), so opening it is the pill unfolding rather
 * than a page appearing.
 *
 * TEMPORARY: the crate/player are blocked behind an "under construction"
 * notice while the listening feature is reworked.
 */
export function ListeningRoom() {
  const { view, roomOrigin, back } = useListening()
  const open = view !== 'closed'
  const surfaceId = roomOrigin === 'entry' ? 'room-entry' : undefined

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="room"
          className={styles.room}
          role="dialog"
          aria-modal="true"
          aria-label="the listening room"
          exit={{ pointerEvents: 'none' }}
        >
          <motion.div
            layoutId={surfaceId}
            className={styles.roomSurface}
            style={{ borderRadius: 0 }}
            initial={surfaceId ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={morph}
          />
          <motion.div
            className={styles.roomGlow}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1.2, delay: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            aria-hidden="true"
          />
          <div className={styles.roomStage}>
            <motion.div
              className={styles.construction}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0, transition: { ...morph, delay: 0.24 } }}
              exit={{ opacity: 0, y: 12, transition: { duration: 0.18 } }}
            >
              <header className={styles.roomBar}>
                <span className={styles.roomLabel}>∿ Freq — the crate</span>
                <Press className={styles.pill} onClick={back} autoFocus aria-label="close">
                  close <span aria-hidden="true">×</span>
                </Press>
              </header>
              <div className={styles.constructionBody}>
                <p className={styles.constructionHeading}>under construction.</p>
                <p className={styles.constructionSub}>the crate is being rebuilt — check back soon.</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
