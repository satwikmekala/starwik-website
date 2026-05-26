'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

type AudioContextConstructor = new () => AudioContext
type WebAudioWindow = Window & typeof globalThis & {
  webkitAudioContext?: AudioContextConstructor
}

interface FrequencyPortalProps {
  active: boolean
  originRect: DOMRect | null
  onComplete: () => void
}

export function FrequencyPortal({ active, originRect, onComplete }: FrequencyPortalProps) {
  const [phase, setPhase] = useState<'idle' | 'expanding' | 'done'>('idle')
  const completedRef = useRef(false)
  const origin = originRect
    ? {
        x: `${originRect.left + originRect.width / 2}px`,
        y: `${originRect.top + originRect.height / 2}px`,
      }
    : { x: '50%', y: '50%' }

  const playSound = useCallback(() => {
    try {
      const AudioContextClass =
        window.AudioContext || (window as WebAudioWindow).webkitAudioContext

      if (!AudioContextClass) return

      const ctx = new AudioContextClass()

      // Single deep thud
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(55, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 0.6)

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.8)

      setTimeout(() => ctx.close(), 1200)
    } catch {}
  }, [])

  useEffect(() => {
    if (!active || !originRect) return
    completedRef.current = false

    playSound()

    // Start expansion on next frame so the clip-path transition triggers
    let firstFrame = 0
    let secondFrame = 0
    firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        setPhase('expanding')
      })
    })

    const timer = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true
        setPhase('done')
        onComplete()
      }
    }, 900)

    return () => {
      cancelAnimationFrame(firstFrame)
      cancelAnimationFrame(secondFrame)
      clearTimeout(timer)
    }
  }, [active, originRect, onComplete, playSound])

  useEffect(() => {
    if (active) return

    const resetFrame = requestAnimationFrame(() => {
      setPhase('idle')
    })

    return () => cancelAnimationFrame(resetFrame)
  }, [active])

  if (!active) return null

  // Calculate max radius needed to cover the entire viewport from the origin point
  const maxDim = typeof window !== 'undefined'
    ? Math.hypot(window.innerWidth, window.innerHeight)
    : 3000

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        pointerEvents: 'all',
      }}
    >
      {/* Main radial wipe — dark with a deep red core */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at ${origin.x} ${origin.y}, #1a0508 0%, #0c0204 35%, #07070A 70%)`,
          clipPath: phase === 'expanding'
            ? `circle(${maxDim}px at ${origin.x} ${origin.y})`
            : `circle(0px at ${origin.x} ${origin.y})`,
          transition: 'clip-path 850ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* Hot glow burst from the origin */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at ${origin.x} ${origin.y}, rgba(232, 51, 74, 0.25) 0%, rgba(196, 90, 24, 0.1) 25%, transparent 55%)`,
          opacity: phase === 'expanding' ? 0 : 1,
          transition: 'opacity 700ms ease-out 200ms',
          pointerEvents: 'none',
        }}
      />

      {/* Expanding ring with red glow */}
      <div
        style={{
          position: 'absolute',
          left: origin.x,
          top: origin.y,
          transform: 'translate(-50%, -50%)',
          width: phase === 'expanding' ? `${maxDim * 2}px` : '0px',
          height: phase === 'expanding' ? `${maxDim * 2}px` : '0px',
          borderRadius: '50%',
          border: '1.5px solid rgba(232, 51, 74, 0.4)',
          boxShadow: '0 0 60px 4px rgba(232, 51, 74, 0.2), 0 0 20px 1px rgba(196, 90, 24, 0.15), inset 0 0 30px 2px rgba(232, 51, 74, 0.1)',
          transition: 'width 850ms cubic-bezier(0.16, 1, 0.3, 1), height 850ms cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
