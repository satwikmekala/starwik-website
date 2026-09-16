'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMotionValue } from 'framer-motion'

// The single <audio> element behind the whole listening room. React state is
// kept coarse (whole seconds, play/pause, buffering) so the tree doesn't
// re-render sixty times a second; anything that moves every frame reads the
// `time` / `progress` motion values instead.

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [buffering, setBuffering] = useState(false)
  const [failed, setFailed] = useState(false)
  const [second, setSecond] = useState(0)
  const [duration, setDuration] = useState(0)
  const time = useMotionValue(0)
  const progress = useMotionValue(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const sync = () => {
      const t = audio.currentTime
      time.set(t)
      if (audio.duration > 0 && Number.isFinite(audio.duration)) {
        progress.set(t / audio.duration)
      }
      setSecond(Math.floor(t))
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onWaiting = () => setBuffering(true)
    const onReady = () => setBuffering(false)
    const onMeta = () => {
      if (Number.isFinite(audio.duration)) setDuration(audio.duration)
    }
    const onError = () => {
      if (!audio.getAttribute('src')) return
      setBuffering(false)
      setPlaying(false)
      setFailed(true)
    }

    const events: Array<[string, () => void]> = [
      ['timeupdate', sync],
      ['seeked', sync],
      ['play', onPlay],
      ['pause', onPause],
      ['waiting', onWaiting],
      ['loadstart', onWaiting],
      ['playing', onReady],
      ['canplay', onReady],
      ['loadedmetadata', onMeta],
      ['durationchange', onMeta],
      ['error', onError],
    ]
    events.forEach(([name, fn]) => audio.addEventListener(name, fn))
    return () => events.forEach(([name, fn]) => audio.removeEventListener(name, fn))
  }, [time, progress])

  // per-frame progress while sound is actually moving
  useEffect(() => {
    if (!playing) return
    let frame = 0
    const tick = () => {
      const audio = audioRef.current
      if (audio && audio.duration > 0) {
        time.set(audio.currentTime)
        progress.set(audio.currentTime / audio.duration)
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, time, progress])

  const load = useCallback(
    (src: string, knownDuration: number) => {
      const audio = audioRef.current
      if (!audio || audio.getAttribute('src') === src) return
      audio.src = src
      audio.load()
      setFailed(false)
      setSecond(0)
      setDuration(knownDuration)
      time.set(0)
      progress.set(0)
    },
    [time, progress]
  )

  const play = useCallback(async () => {
    const audio = audioRef.current
    if (!audio || !audio.getAttribute('src')) return
    try {
      await audio.play()
    } catch (error) {
      // AbortError just means a newer load/pause superseded this play
      if ((error as DOMException).name !== 'AbortError') setPlaying(false)
    }
  }, [])

  const pause = useCallback(() => audioRef.current?.pause(), [])

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) void play()
    else audio.pause()
  }, [play])

  const seek = useCallback(
    (to: number) => {
      const audio = audioRef.current
      if (!audio) return
      const end = Number.isFinite(audio.duration) ? audio.duration : duration
      const next = Math.min(Math.max(0, to), end || to)
      audio.currentTime = next
      time.set(next)
      if (end) progress.set(next / end)
      setSecond(Math.floor(next))
    },
    [duration, time, progress]
  )

  const skip = useCallback(
    (delta: number) => seek((audioRef.current?.currentTime ?? 0) + delta),
    [seek]
  )

  const retry = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    setFailed(false)
    audio.load()
    void play()
  }, [play])

  const unload = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
    setFailed(false)
    setBuffering(false)
  }, [])

  /** the element itself, for code that runs outside render (effects, handlers) */
  const media = useCallback(() => audioRef.current, [])

  const player = useMemo(
    () => ({
      media,
      playing,
      buffering,
      failed,
      second,
      duration,
      time,
      progress,
      load,
      play,
      pause,
      toggle,
      seek,
      skip,
      retry,
      unload,
    }),
    [media, playing, buffering, failed, second, duration, time, progress, load, play, pause, toggle, seek, skip, retry, unload]
  )

  return { audioRef, player }
}

export type AudioPlayer = ReturnType<typeof useAudioPlayer>['player']
