/**
 * Motion vocabulary for Thoughts.
 *
 * The same few curves everywhere, so every movement feels like it was
 * made by the same hand: things arrive slowly, leave quickly, and the
 * camera always eases in and out.
 */

export const EASE = {
  /** arriving — long, soft deceleration */
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  /** leaving — quiet acceleration */
  in: 'cubic-bezier(0.5, 0, 0.75, 0)',
  /** camera moves and the paper unfolding */
  camera: 'cubic-bezier(0.7, 0, 0.2, 1)',
  /** photographs dimming and returning */
  fade: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const

export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

const HOLD = 1e7

/**
 * A choreography owns every animation and pause of one transition.
 *
 * - `hold` pins an element at a value (above the stylesheet) until dropped
 * - `animate` runs a Web Animation that keeps its last frame
 * - `fastForward` jumps everything to its end the moment the visitor asks
 *   for something else (back button mid-animation, a second click…)
 * - `release` hands every element back to the stylesheet
 */
export class Choreography {
  private animations = new Set<Animation>()
  private pending = new Set<() => void>()
  private fast = false
  private dead = false

  animate(
    el: Element | null | undefined,
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions
  ): Promise<void> {
    if (!el || this.dead) return Promise.resolve()
    const animation = el.animate(keyframes, {
      fill: 'both',
      ...options,
      ...(this.fast ? { duration: 0, delay: 0 } : null),
    })
    this.animations.add(animation)
    return animation.finished.then(
      () => undefined,
      () => undefined
    )
  }

  hold(el: Element | null | undefined, keyframe: Keyframe): Animation | null {
    if (!el || this.dead) return null
    const animation = el.animate([keyframe, keyframe], { duration: HOLD, fill: 'both' })
    this.animations.add(animation)
    return animation
  }

  drop(animation: Animation | null | undefined) {
    if (!animation) return
    animation.cancel()
    this.animations.delete(animation)
  }

  wait(ms: number): Promise<void> {
    if (this.fast || this.dead || ms <= 0) return Promise.resolve()
    return new Promise((resolve) => {
      const done = () => {
        window.clearTimeout(timer)
        this.pending.delete(done)
        resolve()
      }
      const timer = window.setTimeout(done, ms)
      this.pending.add(done)
    })
  }

  fastForward() {
    this.fast = true
    this.animations.forEach((animation) => {
      try {
        animation.finish()
      } catch {
        /* nothing here runs forever, but never let cleanup throw */
      }
    })
    Array.from(this.pending).forEach((done) => done())
  }

  release() {
    this.dead = true
    this.animations.forEach((animation) => animation.cancel())
    this.animations.clear()
    Array.from(this.pending).forEach((done) => done())
  }
}

export function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()))
}
