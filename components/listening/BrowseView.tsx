'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { formatTime, moodsOf, type Mix } from '@/app/frequencies/mixes'
import { cx, useListening } from './context'
import { Press } from './Press'
import { Vinyl } from './Vinyl'
import { drift, hover, press, settle } from './motion'
import styles from './listening.module.css'

export function BrowseView({ obscured }: { obscured: boolean }) {
  const { mixes, back } = useListening()
  const moods = useMemo(() => moodsOf(mixes), [mixes])
  const [mood, setMood] = useState<string | null>(null)
  const shown = mood ? mixes.filter((mix) => mix.moods.includes(mood)) : mixes

  return (
    <motion.section
      className={styles.browse}
      layoutScroll
      inert={obscured}
      aria-hidden={obscured || undefined}
      initial={{ opacity: 0, y: 16 }}
      animate={{
        opacity: obscured ? 0 : 1,
        y: obscured ? -12 : 0,
        // let the pill finish unfolding before the crate settles in
        transition: { ...drift, delay: obscured ? 0 : 0.24 },
      }}
      exit={{ opacity: 0, y: 12, transition: { duration: 0.18 } }}
    >
      <header className={styles.roomBar}>
        <span className={styles.roomLabel}>∿ Freq — the crate</span>
        <Press className={styles.pill} onClick={back} autoFocus aria-label="close the crate">
          close <span aria-hidden="true">×</span>
        </Press>
      </header>

      <div className={styles.browseIntro}>
        <h2 className={styles.browseHeading}>put a record on.</h2>
        <p className={styles.browseSub}>
          long sets, played start to finish. {mixes.length} in the crate.
        </p>
      </div>

      <div className={styles.moods} role="group" aria-label="filter by mood">
        {[null, ...moods].map((option) => {
          const active = option === mood
          return (
            <Press
              key={option ?? 'all'}
              className={cx(styles.mood, active && styles.moodActive)}
              aria-pressed={active}
              onClick={() => setMood(option)}
            >
              {active && (
                <motion.span layoutId="mood-active" className={styles.moodFill} transition={settle} />
              )}
              {option ?? 'all'}
            </Press>
          )
        })}
      </div>

      <motion.ul layout className={styles.grid} transition={settle}>
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((mix, index) => (
            <MixCard key={mix.slug} mix={mix} number={mixes.indexOf(mix) + 1} index={index} />
          ))}
        </AnimatePresence>
      </motion.ul>

      <AnimatePresence>
        {shown.length === 0 && (
          <motion.p
            className={styles.empty}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={drift}
          >
            nothing pressed in this mood yet.
          </motion.p>
        )}
      </AnimatePresence>
    </motion.section>
  )
}

function MixCard({ mix, number, index }: { mix: Mix; number: number; index: number }) {
  const { current, audio, openMix } = useListening()
  const isCurrent = current?.slug === mix.slug
  const mood = mix.moods[0]

  return (
    <motion.li
      layout
      className={cx(styles.cardItem, isCurrent && styles.cardCurrent)}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0, transition: { ...settle, delay: 0.32 + index * 0.06 } }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.2 } }}
      transition={settle}
    >
      <motion.button
        type="button"
        className={styles.card}
        onClick={() => openMix(mix, 'card')}
        initial="rest"
        animate="rest"
        whileHover="hover"
        whileTap="tap"
        aria-label={`${mix.title}${mood ? ` — ${mood}` : ''}, ${formatTime(mix.duration)}`}
      >
        <motion.div
          className={styles.cardLift}
          variants={{
            rest: { y: 0, scale: 1, transition: hover },
            hover: { y: -6, scale: 1, transition: hover },
            tap: { y: -3, scale: 0.96, transition: press },
          }}
        >
          <Vinyl
            mix={mix}
            layoutId={`vinyl-card-${mix.slug}`}
            current={isCurrent}
            className={styles.cardVinyl}
          />
          <motion.span
            className={styles.cardLabel}
            style={{ x: '-50%' }}
            variants={{
              rest: { opacity: 0, y: 6 },
              hover: { opacity: 1, y: 0 },
              tap: { opacity: 1, y: 0 },
            }}
            transition={hover}
            aria-hidden="true"
          >
            ▸ {mix.title}
            {mood ? <span className={styles.cardLabelMood}> · {mood}</span> : null}
          </motion.span>
        </motion.div>

        <span className={styles.cardMeta}>
          <span className={styles.cardNumber}>{String(number).padStart(2, '0')}</span>
          {isCurrent ? (
            <span className={styles.onPlatter}>
              <span className={cx(styles.dot, !audio.playing && styles.dotStill)} aria-hidden="true" />
              {audio.playing ? 'on the platter' : 'needle up'}
            </span>
          ) : null}
        </span>
        <span className={styles.cardTitle}>{mix.title}</span>
        <span className={styles.cardInfo}>
          {mood ? `${mood} · ` : ''}
          {formatTime(mix.duration)}
        </span>
      </motion.button>
    </motion.li>
  )
}
