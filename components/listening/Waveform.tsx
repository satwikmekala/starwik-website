'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type WaveSurfer from 'wavesurfer.js'

import { formatTime, type Mix } from '@/app/frequencies/mixes'
import { useListening } from './context'
import styles from './listening.module.css'

// Without precomputed peaks we draw a quiet flat line rather than decode a
// whole set in the browser — still scrubbable, just honest about what it knows.
const FLAT = Array.from({ length: 400 }, () => 0.035)

type Peaks = { slug: string; data: number[] }

/** Minimal monochrome scrubber bound to the room's own <audio> element. */
export function Waveform({ mix }: { mix: Mix }) {
  const { audio } = useListening()
  const getMedia = audio.media
  const host = useRef<HTMLDivElement>(null)
  const [fetched, setFetched] = useState<Peaks | null>(null)
  const [drawn, setDrawn] = useState(false)
  const peaksUrl = mix.audio?.peaks

  const peaks = !peaksUrl ? FLAT : fetched?.slug === mix.slug ? fetched.data : null

  useEffect(() => {
    if (!peaksUrl) return
    const controller = new AbortController()
    fetch(peaksUrl, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.statusText))))
      .then((json: { peaks: number[] }) => setFetched({ slug: mix.slug, data: json.peaks }))
      .catch(() => {
        if (!controller.signal.aborted) setFetched({ slug: mix.slug, data: FLAT })
      })
    return () => controller.abort()
  }, [peaksUrl, mix.slug])

  useEffect(() => {
    const container = host.current
    const media = getMedia()
    if (!container || !media || !peaks) return

    let surfer: WaveSurfer | null = null
    let cancelled = false
    const tokens = getComputedStyle(container)

    import('wavesurfer.js').then(({ default: WaveSurferClass }) => {
      if (cancelled) return
      surfer = WaveSurferClass.create({
        container,
        media,
        peaks: [peaks],
        duration: mix.duration,
        height: 'auto',
        waveColor: tokens.getPropertyValue('--wave').trim(),
        progressColor: tokens.getPropertyValue('--warm').trim(),
        cursorWidth: 0,
        barWidth: 2,
        barGap: 2,
        barRadius: 2,
        barMinHeight: 1,
        normalize: peaks !== FLAT,
        dragToSeek: true,
        hideScrollbar: true,
        autoScroll: false,
      })
      surfer.once('redrawcomplete', () => setDrawn(true))
    })

    return () => {
      cancelled = true
      // the media element belongs to the room — wavesurfer leaves external media alone
      surfer?.destroy()
    }
  }, [peaks, mix.duration, getMedia])

  const total = audio.duration || mix.duration
  const cues = (mix.tracklist ?? []).filter((cue) => cue.at !== undefined && cue.at > 0)

  const onKeyDown = (event: React.KeyboardEvent) => {
    const now = audio.media()?.currentTime ?? 0
    const steps: Record<string, number> = {
      ArrowLeft: now - 5,
      ArrowRight: now + 5,
      PageDown: now - 60,
      PageUp: now + 60,
      Home: 0,
      End: total - 1,
    }
    if (!(event.key in steps)) return
    event.preventDefault()
    audio.seek(steps[event.key])
  }

  return (
    <div className={styles.wave}>
      <div
        className={styles.waveTrack}
        role="slider"
        tabIndex={0}
        aria-label={`position in ${mix.title}`}
        aria-valuemin={0}
        aria-valuemax={Math.round(total)}
        aria-valuenow={audio.second}
        aria-valuetext={`${formatTime(audio.second)} of ${formatTime(total)}`}
        onKeyDown={onKeyDown}
      >
        <div ref={host} className={styles.waveCanvas} />
        {cues.map((cue) => (
          <span
            key={cue.at}
            className={styles.waveCue}
            style={{ left: `${((cue.at ?? 0) / total) * 100}%` }}
            aria-hidden="true"
          />
        ))}
        <AnimatePresence>
          {!drawn && (
            <motion.span
              className={styles.waveSkeleton}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>
      </div>
      <div className={styles.waveTimes}>
        <span>{formatTime(audio.second)}</span>
        <span>{formatTime(total)}</span>
      </div>
    </div>
  )
}
