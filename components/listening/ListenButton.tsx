'use client'

import { AnimatePresence, MotionConfig, motion } from 'framer-motion'

import { cx, ENTRY_ID, useListening } from './context'
import { morph, press, tapScale } from './motion'
import styles from './listening.module.css'

/**
 * The one quiet way in. It is the same element as the room's surface
 * (layoutId "room-entry"): tap it and the pill itself unfolds into the room;
 * close the room and it folds back into the pill.
 */
export function ListenButton() {
  const { view, openRoom, audio } = useListening()

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence initial={false}>
        {view === 'closed' && (
          <motion.button
            key="entry"
            id={ENTRY_ID}
            type="button"
            layoutId="room-entry"
            className={cx(styles.entry, audio.playing && styles.entryLive)}
            style={{ borderRadius: 999 }}
            onClick={openRoom}
            aria-haspopup="dialog"
            transition={morph}
            whileTap={{ ...tapScale, transition: press }}
          >
            {/* layout = scale-corrected, so the label stays its own size while
                the room folds down into the pill around it */}
            <motion.span layout className={styles.entryInner} transition={morph}>
              <span className={styles.entryGlyph} aria-hidden="true">
                ∿
              </span>
              <span className={styles.entryWord}>listen</span>
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}
