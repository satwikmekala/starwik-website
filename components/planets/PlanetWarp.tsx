'use client'

import { useLayoutEffect, useRef } from 'react'
import { getPlanetRenderer, type PlanetBody } from './renderer'
import { getTransitionRenderer } from './transitionRenderer'
import { JOURNEYS, beatClock, buzzKicks, playKicks } from './journeys'
import styles from './warp.module.css'

export interface WarpOrigin {
  body: PlanetBody
  /** the planet's box on screen */
  rect: DOMRect
}

interface PlanetWarpProps {
  origin: WarpOrigin
  destination: { name: string; accent: string }
  /** the destination route has rendered underneath */
  arrived: boolean
  onNavigate: () => void
  onFinish: () => void
}

/** after the route lands, give the new page a beat to paint before opening onto it */
const SETTLE_MS = 140
/** if the route never lands, open the curtain anyway rather than trap anyone */
const GIVE_UP_MS = 8000

const clamp = (n: number) => Math.max(0, Math.min(n, 1))
const easeInOutSine = (n: number) => -(Math.cos(Math.PI * clamp(n)) - 1) / 2

/**
 * One clock drives everything: the departing planet (the real shader, crisp at
 * any size), the world's passage effect over it, the route change once the
 * passage is opaque, and the reveal once the new page has painted.
 */
export function PlanetWarp({ origin, destination, arrived, onNavigate, onFinish }: PlanetWarpProps) {
  const planetRef = useRef<HTMLCanvasElement>(null)
  const effectRef = useRef<HTMLDivElement>(null)
  const veilRef = useRef<HTMLDivElement>(null)
  const latest = useRef({ arrived, onNavigate, onFinish })

  useLayoutEffect(() => {
    latest.current = { arrived, onNavigate, onFinish }
  })

  useLayoutEffect(() => {
    const planetCanvas = planetRef.current!
    const host = effectRef.current!
    const veil = veilRef.current!
    const planets = getPlanetRenderer()
    const passage = getTransitionRenderer()
    const { body: source, rect } = origin
    const kind = source.kind
    const journey = JOURNEYS[kind]
    const screen = { w: window.innerWidth, h: window.innerHeight }
    const from = { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2, size: rect.width }

    // the planet carries on exactly where it was, spun up as if still hovered
    const body: PlanetBody = {
      ...source,
      canvas: planetCanvas,
      hover: true,
      h: Math.max(source.h, 0.6),
      visible: true,
      maxDpr: 1,
      view: journey.planet(0, from, screen),
    }
    if (planets) {
      planets.add(body)
      planets.drawNow(body)
      planets.hide(source)
    }

    if (passage) {
      host.appendChild(passage.canvas)
      passage.fit()
    } else {
      veil.dataset.active = ''
    }

    if (journey.kicks) {
      playKicks(journey.kicks)
      buzzKicks(journey.kicks)
    }

    const start = performance.now()
    let frame = 0
    let planetGone = false
    let navigated = false
    let landedAt = 0
    let forced = false
    let done = false

    const finish = () => {
      if (done) return
      done = true
      latest.current.onFinish()
    }

    const step = (now: number) => {
      if (done) return
      const t = (now - start) / 1000

      // act one: the planet leaves
      let view = body.view!
      if (!planetGone) {
        view = journey.planet(Math.min(t, journey.planetUntil), from, screen)
        body.view = view
        if (journey.kicks) body.beat = beatClock(t, journey.kicks)
        if (t >= journey.planetUntil) {
          planetGone = true
          planets?.remove(body)
          planetCanvas.style.visibility = 'hidden'
        }
      }

      // act two: fully covered, so change the world underneath
      if (t >= journey.coverAt && !navigated) {
        navigated = true
        latest.current.onNavigate()
      }

      // act three: once the new page has painted, open onto it
      if (navigated && !landedAt && (latest.current.arrived || forced)) landedAt = now
      const reveal = landedAt ? easeInOutSine((now - landedAt - SETTLE_MS) / 1000 / journey.reveal) : 0

      if (passage) {
        passage.render({
          kind,
          t,
          coverAt: journey.coverAt,
          reveal,
          cx: view.cx,
          cy: view.cy,
          radius: view.size * journey.disc * 1.03,
          kicks: journey.kicks,
        })
      } else {
        veil.style.opacity = String(clamp(t / journey.coverAt) * (1 - reveal))
      }

      if (reveal >= 1) {
        finish()
        return
      }
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)

    const giveUp = window.setTimeout(() => {
      forced = true
    }, GIVE_UP_MS)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') forced = true
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('popstate', finish)

    return () => {
      done = true
      cancelAnimationFrame(frame)
      clearTimeout(giveUp)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('popstate', finish)
      planets?.remove(body)
      planets?.show(source)
      passage?.canvas.remove()
    }
  }, [origin])

  return (
    <div
      className={styles.passage}
      data-world-transition={origin.body.kind}
      style={{ '--accent': destination.accent } as React.CSSProperties}
    >
      <canvas ref={planetRef} className={styles.layer} aria-hidden="true" />
      <div ref={effectRef} className={styles.layer} aria-hidden="true" />
      <div ref={veilRef} className={styles.veil} aria-hidden="true" />
      <span role="status" className={styles.srOnly}>
        Entering {destination.name}
      </span>
    </div>
  )
}
