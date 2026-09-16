'use client'

import { AnimatePresence, motion } from 'framer-motion'

import { formatTime } from '@/app/frequencies/mixes'
import { useListening } from './context'
import { Press } from './Press'
import { Vinyl } from './Vinyl'
import { PauseIcon, PlayIcon } from './icons'
import { settle } from './motion'
import styles from './listening.module.css'

/** The glass bar that keeps the record turning while you wander the site. */
export function Dock({ visible }: { visible: boolean }) {
  const { current, audio, playerOrigin, openMix, putAway } = useListening()

  return (
    <AnimatePresence>
      {visible && current ? (
        <motion.div
          key="dock"
          className={styles.dockWrap}
          // coming back down from the player the vinyl morphs into place, so
          // the bar itself shouldn't also slide in underneath it
          initial={playerOrigin === 'dock' ? { opacity: 0 } : { opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={settle}
        >
          <div className={styles.dock} role="group" aria-label="on the platter">
            <Press
              className={styles.dockExpand}
              onClick={() => openMix(current, 'dock')}
              aria-label={`open ${current.title}`}
            >
              <Vinyl mix={current} layoutId="vinyl-dock" current className={styles.dockVinyl} />
              <span className={styles.dockText}>
                <span className={styles.dockTitle}>{current.title}</span>
                <span className={styles.dockMeta}>
                  {audio.playing ? 'on the platter' : 'needle up'} · {formatTime(audio.second)} /{' '}
                  {formatTime(audio.duration || current.duration)}
                </span>
              </span>
            </Press>
            <Press
              className={styles.dockPlay}
              onClick={audio.toggle}
              aria-label={audio.playing ? 'pause' : 'play'}
            >
              {audio.playing ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
            </Press>
            <AnimatePresence initial={false}>
              {!audio.playing && (
                <Press
                  key="away"
                  className={styles.dockAway}
                  onClick={putAway}
                  aria-label="put the record away"
                  initial={{ opacity: 0, width: 0, marginLeft: -8 }}
                  animate={{ opacity: 1, width: 34, marginLeft: 0 }}
                  exit={{ opacity: 0, width: 0, marginLeft: -8 }}
                  transition={settle}
                >
                  ×
                </Press>
              )}
            </AnimatePresence>
            <span className={styles.dockRail} aria-hidden="true">
              <motion.span className={styles.dockProgress} style={{ scaleX: audio.progress }} />
            </span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
