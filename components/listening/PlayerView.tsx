'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { formatReleased, formatTime, type Mix } from '@/app/frequencies/mixes'
import { cx, useListening } from './context'
import { Press, PressLink } from './Press'
import { Vinyl } from './Vinyl'
import { Waveform } from './Waveform'
import { ChevronIcon, PauseIcon, PlayIcon, SkipIcon } from './icons'
import { drift, press, settle } from './motion'
import styles from './listening.module.css'

export function PlayerView() {
  const { mixes, focused: mix, current, audio, playerOrigin, roomOrigin, back } = useListening()
  if (!mix) return null

  const isCurrent = current?.slug === mix.slug
  const needleDown = isCurrent && audio.playing
  const number = String(mixes.indexOf(mix) + 1).padStart(2, '0')
  const vinylId =
    playerOrigin === 'card'
      ? `vinyl-card-${mix.slug}`
      : playerOrigin === 'dock'
        ? 'vinyl-dock'
        : undefined

  return (
    <motion.section
      className={styles.player}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0, transition: { ...drift, delay: 0.06 } }}
      exit={{ opacity: 0, y: 18, transition: { duration: 0.2 } }}
    >
      <header className={styles.roomBar}>
        <Press className={styles.pill} onClick={back} autoFocus>
          {roomOrigin === 'dock' ? '↓ fold away' : '← the crate'}
        </Press>
        <span className={styles.roomLabel}>∿ {needleDown ? 'needle down' : 'needle up'}</span>
      </header>

      <div className={styles.playerBody}>
        <div className={styles.playerDeck}>
          <Vinyl mix={mix} layoutId={vinylId} current={isCurrent} className={styles.playerVinyl} />
        </div>

        <div className={styles.playerInfo}>
          <p className={styles.playerEyebrow}>
            {number} — {formatReleased(mix.released)}
            {mix.venue ? ` · ${mix.venue}` : ''}
          </p>
          <h2 className={styles.playerTitle}>{mix.title}</h2>
          <ul className={styles.playerMoods} aria-label="moods">
            {mix.moods.map((mood) => (
              <li key={mood} className={styles.tag}>
                {mood}
              </li>
            ))}
          </ul>
          {mix.note ? <p className={styles.playerNote}>{mix.note}</p> : null}

          {mix.audio && isCurrent ? (
            <>
              <Waveform key={mix.slug} mix={mix} />
              <Transport />
              <AnimatePresence>
                {audio.failed && (
                  <motion.p
                    className={styles.notice}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    this record won’t play right now.{' '}
                    <button type="button" className={styles.inlineAction} onClick={audio.retry}>
                      try again
                    </button>
                  </motion.p>
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className={styles.unpressed}>
              <p className={styles.notice}>still being pressed for the room.</p>
              {mix.link ? (
                <PressLink
                  className={styles.pill}
                  href={mix.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  hear it on {mix.link.label} ↗
                </PressLink>
              ) : null}
            </div>
          )}

          {mix.tracklist?.length ? <Tracklist mix={mix} seekable={isCurrent} /> : null}

          {mix.audio && mix.link ? (
            <a className={styles.elsewhere} href={mix.link.href} target="_blank" rel="noopener noreferrer">
              also on {mix.link.label} ↗
            </a>
          ) : null}
        </div>
      </div>
    </motion.section>
  )
}

function Transport() {
  const { audio, playFocused } = useListening()
  const waiting = audio.playing && audio.buffering

  return (
    <div className={styles.transport}>
      <Press className={styles.skip} onClick={() => audio.skip(-15)} aria-label="back 15 seconds">
        <SkipIcon direction="back" />
        15
      </Press>
      <Press
        className={cx(styles.play, audio.playing && styles.playOn, waiting && styles.playWaiting)}
        onClick={playFocused}
        aria-label={audio.playing ? 'pause' : 'play'}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={audio.playing ? 'pause' : 'play'}
            className={styles.playIcon}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={press}
          >
            {audio.playing ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
          </motion.span>
        </AnimatePresence>
      </Press>
      <Press className={styles.skip} onClick={() => audio.skip(15)} aria-label="forward 15 seconds">
        15
        <SkipIcon direction="forward" />
      </Press>
    </div>
  )
}

function Tracklist({ mix, seekable }: { mix: Mix; seekable: boolean }) {
  const { audio } = useListening()
  const [open, setOpen] = useState(false)
  const tracks = mix.tracklist ?? []
  const timed = tracks.some((track) => track.at !== undefined)

  let active = -1
  if (seekable) {
    tracks.forEach((track, i) => {
      if (track.at !== undefined && track.at <= audio.second) active = i
    })
  }

  return (
    <div className={styles.tracklist}>
      <Press className={styles.pill} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        running order · {tracks.length} <ChevronIcon open={open} />
      </Press>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className={styles.trackPanel}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={settle}
          >
            <ol className={styles.tracks}>
              {tracks.map((track, i) => {
                const at = track.at
                const inner = (
                  <>
                    <span className={styles.trackAt}>
                      {i === active ? '▸ ' : ''}
                      {at !== undefined ? formatTime(at) : String(i + 1).padStart(2, '0')}
                    </span>
                    <span className={styles.trackName}>
                      <span className={styles.trackArtist}>{track.artist}</span> — {track.title}
                    </span>
                  </>
                )
                return (
                  <li key={`${i}-${track.title}`}>
                    {seekable && at !== undefined ? (
                      <Press
                        className={cx(styles.track, i === active && styles.trackActive)}
                        onClick={() => audio.seek(at)}
                        aria-label={`jump to ${track.artist} — ${track.title}, ${formatTime(at)}`}
                      >
                        {inner}
                      </Press>
                    ) : (
                      <div className={cx(styles.track, styles.trackStatic)}>{inner}</div>
                    )}
                  </li>
                )
              })}
            </ol>
            {!timed ? <p className={styles.trackHint}>timestamps still to come.</p> : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
