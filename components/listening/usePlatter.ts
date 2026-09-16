'use client'

import { useRef } from 'react'
import { useAnimationFrame, useMotionValue } from 'framer-motion'

// 33⅓ rpm — one revolution every 1.8s.
const RPM_DEG_PER_SEC = 360 / 1.8
// Critically damped so the platter never overshoots into a backwards wobble.
// The motor pulls it up to speed faster than friction lets it coast down.
const SPIN_UP = 0.32
const SPIN_DOWN = 0.62

/**
 * The platter angle for whichever record is loaded. Every vinyl showing the
 * current mix reads this one value, so a record keeps its exact rotation as it
 * morphs between card, player and dock.
 */
export function usePlatter(spinning: boolean) {
  const angle = useMotionValue(0)
  const velocity = useRef(0)
  const acceleration = useRef(0)

  useAnimationFrame((_, delta) => {
    const target = spinning ? RPM_DEG_PER_SEC : 0
    if (target === 0 && velocity.current < 0.05) {
      velocity.current = 0
      return
    }

    // smooth-damp the angular velocity toward its target
    const dt = Math.min(delta / 1000, 0.05)
    const smoothTime = spinning ? SPIN_UP : SPIN_DOWN
    const omega = 2 / smoothTime
    const x = omega * dt
    const decay = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x)
    const change = velocity.current - target
    const temp = (acceleration.current + omega * change) * dt
    acceleration.current = (acceleration.current - omega * temp) * decay
    velocity.current = target + (change + temp) * decay

    angle.set((angle.get() + velocity.current * dt) % 360)
  })

  return angle
}
