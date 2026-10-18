'use client'

import { useEffect, useRef, useState } from 'react'

import styles from './frequencies.module.css'

const waveBars = Array.from({ length: 14 }, (_, index) => index + 1)


export function FrequenciesEffects() {
  useEffect(() => {
    const fadeElements = Array.from(
      document.querySelectorAll<HTMLElement>('[data-frequency-fade]')
    )

    if (!('IntersectionObserver' in window)) {
      fadeElements.forEach((element) => element.classList.add(styles.on))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.on)
          }
        })
      },
      { threshold: 0.07 }
    )

    fadeElements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null
      const anchor = target?.closest<HTMLAnchorElement>('a[href^="#"]')
      const href = anchor?.getAttribute('href')

      if (!href || href === '#') {
        return
      }

      const targetElement = document.querySelector(href)

      if (!targetElement) {
        return
      }

      event.preventDefault()
      targetElement.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
      })
    }

    document.addEventListener('click', handleAnchorClick)

    return () => document.removeEventListener('click', handleAnchorClick)
  }, [])

  return null
}

export function HeroWaveform() {
  return (
    <div className={styles.heroWave} aria-hidden="true">
      {waveBars.map((bar) => (
        <span
          key={bar}
          className={`${styles.waveBar} ${styles[`waveBar${bar}`]}`}
        />
      ))}
    </div>
  )
}

// Each layer: amplitude envelope breathes over time; 4-harmonic mix for organic feel
// Speeds are intentionally very slow for a meditative, flowing quality
const WAVE_LAYERS = [
  // Deep ghost undertow — barely perceptible, very slow
  { baseAmp: 20, freq: 1.2,  speed: 0.08, breatheRate: 0.07, breatheDepth: 0.3,  opacity: 0.07, lineWidth: 1,   color: '#c0192b', vOffset: 0    },
  // Wide slow swell — the atmospheric base
  { baseAmp: 28, freq: 1.5,  speed: 0.11, breatheRate: 0.13, breatheDepth: 0.4,  opacity: 0.13, lineWidth: 1.5, color: '#c0192b', vOffset: 3    },
  // Mid-ground organic layer
  { baseAmp: 22, freq: 2.1,  speed: 0.16, breatheRate: 0.09, breatheDepth: 0.5,  opacity: 0.2,  lineWidth: 1.5, color: '#e8334a', vOffset: -4   },
  // Accent detail layer
  { baseAmp: 26, freq: 1.7,  speed: 0.19, breatheRate: 0.17, breatheDepth: 0.45, opacity: 0.28, lineWidth: 2,   color: '#e8334a', vOffset: 2    },
  // Hero glowing centrepiece — freq 1.8 = ~1.8 full cycles visible, clearly wavy
  { baseAmp: 52, freq: 1.8,  speed: 0.10, breatheRate: 0.11, breatheDepth: 0.18, opacity: 0.85, lineWidth: 2.5, color: '#e8334a', vOffset: 0    },
]

function sampleWave(
  norm: number,     // 0..1 position across canvas
  t: number,        // elapsed seconds
  baseAmp: number,
  freq: number,
  speed: number,
  breatheRate: number,
  breatheDepth: number,
  vOffset: number,
  cy: number,
): number {
  // Phase scrolls left continuously
  const phase = t * speed * Math.PI * 2

  // Amplitude breathes gently over time — no sharp pulsing
  const breathe = 1 - breatheDepth * 0.5 * (1 + Math.sin(t * breatheRate * Math.PI * 2))
  const amp = baseAmp * breathe

  // 4-harmonic mix: fundamental + 3 gentle overtones at coprime ratios for organic feel
  const y =
    cy + vOffset +
    amp       * Math.sin(norm * Math.PI * 2 * freq       - phase) +
    amp * 0.28 * Math.sin(norm * Math.PI * 2 * freq * 2.1 - phase * 1.53 + 0.8) +
    amp * 0.14 * Math.sin(norm * Math.PI * 2 * freq * 3.7 - phase * 2.31 + 2.1) +
    amp * 0.07 * Math.sin(norm * Math.PI * 2 * freq * 5.3 - phase * 0.87 + 4.3)

  return y
}

export function DJWaveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let startTime: number | null = null

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const draw = (ts: number) => {
      if (startTime === null) startTime = ts
      const t = (ts - startTime) / 1000

      const w = canvas.getBoundingClientRect().width
      const h = canvas.getBoundingClientRect().height
      const cy = h / 2

      ctx.clearRect(0, 0, w, h)

      WAVE_LAYERS.forEach((layer) => {
        const { baseAmp, freq, speed, breatheRate, breatheDepth, opacity, lineWidth, color, vOffset } = layer
        const STEP = 2 // px resolution — smooth enough, cheap enough

        // Glow halo pass — only on the hero wave
        if (opacity > 0.5) {
          ctx.save()
          ctx.shadowColor = color
          ctx.shadowBlur = 28
          ctx.globalAlpha = opacity * 0.35
          ctx.strokeStyle = color
          ctx.lineWidth = lineWidth + 6
          ctx.lineJoin = 'round'
          ctx.beginPath()
          for (let x = 0; x <= w + STEP; x += STEP) {
            const norm = x / w
            const y = sampleWave(norm, t, baseAmp, freq, speed, breatheRate, breatheDepth, vOffset, cy)
            if (x === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          }
          ctx.stroke()
          ctx.restore()
        }

        // Main crisp line
        ctx.save()
        ctx.globalAlpha = opacity
        ctx.strokeStyle = color
        ctx.lineWidth = lineWidth
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        ctx.beginPath()
        for (let x = 0; x <= w + STEP; x += STEP) {
          const norm = x / w
          const y = sampleWave(norm, t, baseAmp, freq, speed, breatheRate, breatheDepth, vOffset, cy)
          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()
        ctx.restore()
      })

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
    }
  }, [])

  return (
    <section className={styles.waveformSection} aria-hidden="true">
      {/* Top fade — dissolves into artist section above */}
      <div className={styles.waveformFadeTop} />
      <canvas ref={canvasRef} className={styles.waveformCanvas} />
      {/* Bottom fade — dissolves into live section below */}
      <div className={styles.waveformFadeBottom} />
    </section>
  )
}

type YouTubeThumbnailProps = {
  videoId: string
  alt: string
}

export function YouTubeThumbnail({ videoId, alt }: YouTubeThumbnailProps) {
  const maxRes = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  const fallback = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  const [src, setSrc] = useState(maxRes)

  return (
    <img
      className={styles.mixThumb}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setSrc((current) => (current === fallback ? current : fallback))}
    />
  )
}
