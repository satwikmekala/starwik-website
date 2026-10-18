'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './openThought.module.css'

const BARS = [12, 20, 32, 18, 26, 14, 36, 22, 30, 16, 24, 34, 18, 28, 20, 12, 24, 32, 14, 26, 18, 30, 16, 22]
function clock(seconds: number) {
  const whole = Number.isFinite(seconds) ? Math.floor(seconds) : 0
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

/** Optional source keeps presentation ready without inventing a recording. */
export function ThoughtAudioPlayer({ src }: { src?: string }) {
  const audio = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState('')
  useEffect(() => {
    const element = audio.current
    return () => { element?.pause() }
  }, [])

  async function toggle() {
    const element = audio.current
    if (!src || !element) return
    if (element.paused) {
      try { await element.play(); setError('') }
      catch { setError('the recording could not play. try again.') }
    } else element.pause()
  }

  const progress = duration ? elapsed / duration : 0
  return <div className={styles.audioRegion}>
    <div className={styles.audioPlayer} role="group" aria-label="thought recording">
      <audio ref={audio} src={src} preload="metadata" onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onTimeUpdate={(event) => setElapsed(event.currentTarget.currentTime)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onError={() => { if (src) setError('the recording is unavailable.') }} />
      <button type="button" className={styles.play} aria-label={playing ? 'pause' : 'play'} disabled={!src} onClick={toggle}>
        <svg viewBox="0 0 24 24" aria-hidden="true">{playing ? <path d="M7 5h4v14H7zm6 0h4v14h-4z" /> : <path d="m8 5 11 7-11 7z" />}</svg>
      </button>
      <div className={styles.waveform} aria-hidden="true">{BARS.map((height, index) => <span key={index} data-played={progress > index / BARS.length || undefined} style={{ height }} />)}</div>
      <span className={styles.audioTime}>{clock(elapsed)} / {clock(duration)}</span>
    </div>
    {!src && <p className={styles.audioNotice}>audio coming soon</p>}
    <p role="status" className={styles.audioNotice}>{error}</p>
  </div>
}
