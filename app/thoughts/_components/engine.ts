/**
 * DepthEngine — the room's sense of depth.
 *
 * One requestAnimationFrame loop, no React renders. The pointer sets
 * targets; damped springs chase them; the loop writes a single transform
 * per plane:
 *
 *   photograph   drifts against the cursor   (furthest away)
 *   title / card leans toward it             (nearest)
 *   grain        doesn't move at all         (it's on the lens)
 *
 * Springs are critically damped, so nothing ever bounces — it only
 * arrives, late and softly, the way a hanging sheet of paper would.
 */

export type EngineMode = 'archive' | 'portal' | 'settle' | 'off'

export interface EngineElements {
  backdrop: HTMLElement | null
  title: HTMLElement | null
  rig: HTMLElement | null
  shadow: HTMLElement | null
}

/** the card's resting attitude — a sheet hanging slightly off-true */
export const REST = { rx: 1.4, ry: -2.2, rz: -0.7 }
/** the pose the card holds just before it becomes the page */
export const LIFTED = { rx: 0, ry: 0, rz: 0, scale: 1.03 }

class Spring {
  value: number
  velocity = 0
  target: number
  constructor(value: number, public stiffness: number, public damping: number) {
    this.value = value
    this.target = value
  }
  step(dt: number, stiffness = this.stiffness, damping = this.damping) {
    const force = -stiffness * (this.value - this.target) - damping * this.velocity
    this.velocity += force * dt
    this.value += this.velocity * dt
  }
  get resting() {
    return Math.abs(this.value - this.target) < 0.004 && Math.abs(this.velocity) < 0.004
  }
  snap(value = this.target) {
    this.value = value
    this.target = value
    this.velocity = 0
  }
}

/** critically damped and quick: the card goes flat in ~0.4s without a wobble */
const SETTLE = { stiffness: 260, damping: 32.2 }

export class DepthEngine {
  private els: EngineElements = { backdrop: null, title: null, rig: null, shadow: null }
  private mode: EngineMode = 'off'
  private raf = 0
  private last = 0
  private clock = 0
  private pointer = { x: 0, y: 0 }
  private settleWaiters: Array<() => void> = []
  private settleTimer = 0

  // photograph plane
  private bgX = new Spring(0, 14, 7.5)
  private bgY = new Spring(0, 14, 7.5)
  // title plane (archive)
  private tX = new Spring(0, 22, 9.4)
  private tY = new Spring(0, 22, 9.4)
  // the card
  private cX = new Spring(0, 26, 10.2)
  private cY = new Spring(0, 26, 10.2)
  private rx = new Spring(REST.rx, 26, 10.2)
  private ry = new Spring(REST.ry, 26, 10.2)
  private rz = new Spring(REST.rz, 26, 10.2)
  private scale = new Spring(1, 60, 15.5)
  private float = new Spring(0, 2.2, 3)

  constructor() {
    window.addEventListener('pointermove', this.onPointer, { passive: true })
    document.documentElement.addEventListener('pointerleave', this.onLeave)
    document.addEventListener('visibilitychange', this.onVisibility)
  }

  attach(els: Partial<EngineElements>) {
    Object.assign(this.els, els)
  }

  setMode(mode: EngineMode) {
    if (mode === this.mode) return
    this.mode = mode
    if (mode === 'off') {
      this.stop()
      return
    }
    this.retarget()
    this.wake()
  }

  /** bring the card flat and a little toward the camera; resolves once it's there */
  settle(): Promise<void> {
    this.setMode('settle')
    return new Promise((resolve) => {
      this.settleWaiters.push(resolve)
      window.clearTimeout(this.settleTimer)
      // never make the visitor wait on a spring's last decimal
      this.settleTimer = window.setTimeout(() => this.finishSettle(), 620)
    })
  }

  /** place the card in its lifted pose instantly (e.g. arriving straight into an article) */
  jumpToLifted() {
    this.rx.snap(LIFTED.rx)
    this.ry.snap(LIFTED.ry)
    this.rz.snap(LIFTED.rz)
    this.scale.snap(LIFTED.scale)
    this.cX.snap(0)
    this.cY.snap(0)
    this.float.snap(0)
    this.write()
  }

  destroy() {
    this.stop()
    window.clearTimeout(this.settleTimer)
    window.removeEventListener('pointermove', this.onPointer)
    document.documentElement.removeEventListener('pointerleave', this.onLeave)
    document.removeEventListener('visibilitychange', this.onVisibility)
  }

  /* ── internals ── */

  private onPointer = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    this.pointer.y = (event.clientY / window.innerHeight) * 2 - 1
    if (this.mode === 'archive' || this.mode === 'portal') {
      this.retarget()
      this.wake()
    }
  }

  private onLeave = () => {
    this.pointer.x = 0
    this.pointer.y = 0
    if (this.mode === 'archive' || this.mode === 'portal') {
      this.retarget()
      this.wake()
    }
  }

  private onVisibility = () => {
    if (document.hidden) this.stop()
    else if (this.mode !== 'off') this.wake()
  }

  private retarget() {
    const { x, y } = this.pointer
    const portal = this.mode === 'portal'
    const settling = this.mode === 'settle'

    this.bgX.target = settling ? 0 : -x * (portal ? 9 : 11)
    this.bgY.target = settling ? 0 : -y * (portal ? 6 : 8)
    this.tX.target = this.mode === 'archive' ? x * 6 : 0
    this.tY.target = this.mode === 'archive' ? y * 4 : 0

    if (settling) {
      this.cX.target = 0
      this.cY.target = 0
      this.rx.target = LIFTED.rx
      this.ry.target = LIFTED.ry
      this.rz.target = LIFTED.rz
      this.scale.target = LIFTED.scale
      this.float.target = 0
    } else {
      this.cX.target = portal ? x * 6 : 0
      this.cY.target = portal ? y * 4 : 0
      this.rx.target = REST.rx - (portal ? y * 1.9 : 0)
      this.ry.target = REST.ry + (portal ? x * 2.6 : 0)
      this.rz.target = REST.rz
      this.scale.target = 1
      this.float.target = portal ? 1 : 0
    }
  }

  private wake() {
    if (this.raf || document.hidden) return
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.tick)
  }

  private stop() {
    if (this.raf) cancelAnimationFrame(this.raf)
    this.raf = 0
  }

  private tick = (now: number) => {
    this.raf = 0
    const dt = Math.min(0.034, Math.max(0.001, (now - this.last) / 1000))
    this.last = now
    this.clock += dt

    const settling = this.mode === 'settle'
    const cardSprings = [this.cX, this.cY, this.rx, this.ry, this.rz, this.scale, this.float]
    this.bgX.step(dt)
    this.bgY.step(dt)
    this.tX.step(dt)
    this.tY.step(dt)
    for (const spring of cardSprings) {
      if (settling) spring.step(dt, SETTLE.stiffness, SETTLE.damping)
      else spring.step(dt)
    }

    this.write()

    if (settling) {
      // close enough to flat that nobody could tell — snap the last hair and go
      const flat =
        Math.abs(this.rx.value) < 0.03 &&
        Math.abs(this.ry.value) < 0.03 &&
        Math.abs(this.rz.value) < 0.03 &&
        Math.abs(this.scale.value - LIFTED.scale) < 0.0015 &&
        Math.abs(this.cX.value) < 0.15 &&
        Math.abs(this.cY.value) < 0.15 &&
        Math.abs(this.float.value) < 0.02
      if (flat) {
        this.finishSettle()
        return
      }
      this.raf = requestAnimationFrame(this.tick)
      return
    }

    const resting = [this.bgX, this.bgY, this.tX, this.tY, ...cardSprings].every(
      (spring) => spring.resting
    )
    // the card keeps breathing while it floats; everything else sleeps once still
    if (this.mode === 'portal' || !resting) this.raf = requestAnimationFrame(this.tick)
  }

  private finishSettle() {
    window.clearTimeout(this.settleTimer)
    if (this.mode === 'settle') {
      // only the card snaps; the photograph is left exactly where it drifted to
      ;[this.cX, this.cY, this.rx, this.ry, this.rz, this.scale, this.float].forEach((spring) =>
        spring.snap()
      )
      this.write()
      this.stop()
    }
    const waiters = this.settleWaiters
    this.settleWaiters = []
    waiters.forEach((resolve) => resolve())
  }

  private write() {
    const { backdrop, title, rig, shadow } = this.els
    const f = this.float.value
    const floatY = f * 4 * Math.sin((this.clock / 7.2) * Math.PI * 2)
    const floatZ = f * 0.16 * Math.sin((this.clock / 11.3) * Math.PI * 2 + 1.1)

    if (backdrop) {
      backdrop.style.transform = `translate3d(${this.bgX.value.toFixed(2)}px, ${this.bgY.value.toFixed(2)}px, 0)`
    }
    if (title) {
      title.style.transform = `translate3d(${this.tX.value.toFixed(2)}px, ${this.tY.value.toFixed(2)}px, 0)`
    }
    if (rig) {
      rig.style.transform =
        `translate3d(${this.cX.value.toFixed(2)}px, ${(this.cY.value + floatY).toFixed(2)}px, 0) ` +
        `rotateX(${this.rx.value.toFixed(3)}deg) rotateY(${this.ry.value.toFixed(3)}deg) ` +
        `rotateZ(${(this.rz.value + floatZ).toFixed(3)}deg) scale(${this.scale.value.toFixed(4)})`
    }
    if (shadow) {
      // light from the upper left: the shadow slides against the tilt and
      // loosens a little as the card drifts up
      const sx = this.cX.value * 0.6 - this.ry.value * 3.2
      const sy = this.cY.value * 0.6 + this.rx.value * 3 + floatY * 0.35
      const spread = 1 + (this.scale.value - 1) * 1.6 - floatY * 0.004
      shadow.style.transform = `translate3d(${sx.toFixed(2)}px, ${sy.toFixed(2)}px, 0) scale(${spread.toFixed(4)})`
    }
  }
}
