'use client'

import { useEffect, useRef, useState } from 'react'
import { getPlanetRenderer, type PlanetBody, type PlanetKind } from './renderer'

interface PlanetProps {
  kind: PlanetKind
  seed: number
  hovered?: boolean
  rings?: boolean
  speed?: number
  className?: string
  /** receives the live body so a transition can pick up exactly where the planet is */
  bodyRef?: React.RefObject<PlanetBody | null>
}

export function Planet({ kind, seed, hovered = false, rings = true, speed = 1, className, bodyRef }: PlanetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const body = useRef<PlanetBody | null>(null)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const renderer = getPlanetRenderer()
    if (!renderer) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- WebGL support is only knowable in the browser
      setFallback(true)
      return
    }

    const b: PlanetBody = {
      canvas,
      kind,
      seed,
      rings,
      speed,
      t: Math.random() * 40,
      h: 0,
      hover: false,
      visible: true,
      maxDpr: 1.5,
    }
    body.current = b
    if (bodyRef) bodyRef.current = b

    const io = new IntersectionObserver(([entry]) => {
      b.visible = entry.isIntersecting
    })
    io.observe(canvas)
    renderer.add(b)

    return () => {
      io.disconnect()
      renderer.remove(b)
      body.current = null
      if (bodyRef) bodyRef.current = null
    }
  }, [kind, seed, rings, speed, bodyRef])

  useEffect(() => {
    if (body.current) body.current.hover = hovered
  }, [hovered])

  return (
    <span className={className} data-kind={kind} data-fallback={fallback || undefined} aria-hidden="true">
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </span>
  )
}
