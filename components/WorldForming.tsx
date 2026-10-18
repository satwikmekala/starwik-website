'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import styles from './WorldForming.module.css'

type Props = {
  name: string
  accent: string
}

type Mote = {
  r: number
  a: number
  speed: number
  size: number
  tilt: number
  alpha: number
}

const MOTES = 520

/**
 * A protoplanet accreting out of a dust disk: motes spiral inward,
 * and the core slowly brightens and swells as they land.
 */
export function WorldForming({ name, accent }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0
    let h = 0
    let maxR = 0
    let raf = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      maxR = Math.min(w, h) * 0.46
    }
    resize()
    window.addEventListener('resize', resize)

    const spawn = (fresh: boolean): Mote => ({
      r: fresh ? 0.25 + Math.random() * 0.75 : 0.85 + Math.random() * 0.15,
      a: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 0.8,
      size: 0.4 + Math.random() * 1.3,
      tilt: (Math.random() - 0.5) * 0.08,
      alpha: 0.25 + Math.random() * 0.65,
    })
    const motes = Array.from({ length: MOTES }, () => spawn(true))
    const stars = Array.from({ length: 140 }, () => ({
      x: Math.random(),
      y: Math.random(),
      s: Math.random() * 1.1,
      p: Math.random() * Math.PI * 2,
    }))

    let core = 0.35
    const start = performance.now()

    const draw = (now: number) => {
      const t = (now - start) / 1000
      ctx.clearRect(0, 0, w, h)
      const cx = w / 2
      const cy = h / 2

      for (const s of stars) {
        ctx.globalAlpha = 0.15 + 0.35 * (0.5 + 0.5 * Math.sin(t * 0.8 + s.p)) * s.s
        ctx.fillStyle = '#F2EDE6'
        ctx.fillRect(s.x * w, s.y * h, 1, 1)
      }

      // The disk is drawn squashed so it reads as a ring seen at an angle.
      const squash = 0.32
      ctx.globalCompositeOperation = 'lighter'
      for (let i = 0; i < motes.length; i++) {
        const m = motes[i]
        if (!reduced) {
          // Kepler-ish: inner motes orbit faster, and everything drifts inward.
          m.a += (0.004 * m.speed) / Math.pow(m.r, 1.5)
          m.r -= 0.00045 * m.speed
          if (m.r < 0.07) {
            core = Math.min(1, core + 0.0009)
            motes[i] = spawn(false)
            continue
          }
        }
        const rr = m.r * maxR
        const x = cx + Math.cos(m.a) * rr
        const y = cy + Math.sin(m.a) * rr * (squash + m.tilt)
        const behind = Math.sin(m.a) < 0
        const fade = Math.min(1, (1 - m.r) * 4) * Math.min(1, m.r * 6)
        ctx.globalAlpha = m.alpha * fade * (behind ? 0.45 : 1)
        ctx.fillStyle = m.r < 0.3 ? '#F2EDE6' : accent
        ctx.beginPath()
        ctx.arc(x, y, m.size, 0, Math.PI * 2)
        ctx.fill()
      }

      // Core: a soft glow plus a solid body that grows as matter lands.
      const pulse = reduced ? 1 : 1 + 0.04 * Math.sin(t * 1.6)
      const body = maxR * (0.05 + 0.05 * core) * pulse
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, body * 5)
      glow.addColorStop(0, accent)
      glow.addColorStop(0.25, accent + '55')
      glow.addColorStop(1, accent + '00')
      ctx.globalAlpha = 0.5 + 0.4 * core
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(cx, cy, body * 5, 0, Math.PI * 2)
      ctx.fill()

      ctx.globalCompositeOperation = 'source-over'
      const shade = ctx.createRadialGradient(cx - body * 0.4, cy - body * 0.4, body * 0.1, cx, cy, body)
      shade.addColorStop(0, '#F2EDE6')
      shade.addColorStop(0.5, accent)
      shade.addColorStop(1, '#07070A')
      ctx.globalAlpha = 1
      ctx.fillStyle = shade
      ctx.beginPath()
      ctx.arc(cx, cy, body, 0, Math.PI * 2)
      ctx.fill()

      if (!reduced) raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [accent])

  return (
    <main className={styles.page} style={{ '--accent': accent } as React.CSSProperties}>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={styles.copy}>
        <p className={styles.kicker}>{name}</p>
        <h1 className={styles.title}>This world is still forming.</h1>
        <p className={styles.sub}>
          Matter is gathering<span className={styles.dots} aria-hidden="true" />
        </p>
      </div>
      <Link href="/" className={styles.back}>
        ← back to orbit
      </Link>
    </main>
  )
}
