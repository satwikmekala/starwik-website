/**
 * Every interaction does exactly what its line says and nothing more, and
 * none of them gates scrolling. They live as real <button>s laid over the
 * art (≥ 48 px hit areas), focusable only while their beat is on screen,
 * with a one-word italic hint that goes away after first use.
 *
 *  board  drag (or arrow keys) to nudge a piece half an inch; nothing reacts
 *  mug    tap — it falls anyway
 *  door   tap to open; he walks in either way
 *  scrub  drag back and forth (or arrows) — the stain grows; locks on "Stop."
 *  phone  tap — the screen stays dark
 *  hold   press and hold (Space/Enter) — the coat lets go; release and it
 *         settles back; reduced motion: one tap plays a cross-fade
 */
import { BEATS } from './copy.ts'
import type { Box, View } from './camera.ts'
import type { Frame } from './state.ts'
import type { Beat } from './copy.ts'

export type Kind = 'board' | 'mug' | 'door' | 'scrub' | 'phone' | 'hold'
export interface Hit { kind: Kind; id: string; rect: Box; label: string }

const HOLD_SECONDS = 5.5
const HINT: Record<Kind, keyof typeof BEATS.ui.hints> = { board: 'drag', mug: 'tap', door: 'tap', scrub: 'scrub', phone: 'tap', hold: 'hold' }
const LIVE = BEATS.ui.live as Record<string, string>

export class Interactions {
  // story-visible state
  mugFallen = false
  mugFall = 0
  doorOpened = false
  scrubFrame: 'scrub-a' | 'scrub-b' | null = null
  hold = 0
  holdDone = false
  reducedDissolve = false
  phoneFall = 0
  phoneGone = 1
  busy = false

  private offsets = new Map<string, { x: number; y: number }>()
  private hovered: string | null = null
  private scrubAcc = 0
  private scrubLocked = false
  private holding = false
  private autoplay = false
  private pulse = 0
  private sinceDone = 0
  private used = new Set<Kind>()
  private told = new Set<string>()
  private buttons = new Map<string, HTMLButtonElement>()
  private hints = new Map<Kind, HTMLElement>()
  private ring: SVGSVGElement
  private drag: { id: string; pointer: number; x: number; y: number; ox: number; oy: number; last: number } | null = null
  private view: View = { s: 1, tx: 0, ty: 0 }

  constructor(private root: HTMLElement, private layer: HTMLElement, private announce: (m: string) => void, private motion: () => boolean, private invalidate: () => void = () => {}) {
    this.ring = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    this.ring.setAttribute('class', 'ats-ring')
    this.ring.setAttribute('viewBox', '0 0 100 100')
    this.ring.setAttribute('aria-hidden', 'true')
    this.ring.innerHTML = '<circle cx="50" cy="50" r="44" pathLength="1" class="track"/><circle cx="50" cy="50" r="44" pathLength="1" class="fill"/>'
    layer.append(this.ring)
    for (const k of ['board', 'mug', 'door', 'scrub', 'phone', 'hold'] as Kind[]) {
      const h = document.createElement('span')
      h.className = 'ats-hint'
      h.setAttribute('aria-hidden', 'true')
      h.textContent = BEATS.ui.hints[HINT[k]]
      h.hidden = true
      layer.append(h)
      this.hints.set(k, h)
    }
    addEventListener('pointerup', this.onUp)
    addEventListener('pointercancel', this.onUp)
    addEventListener('blur', this.onBlur)
  }

  // ── read by the renderer ──
  boardOffset(id: string, time: number) {
    const o = this.offsets.get(id) ?? { x: 0, y: 0 }
    const wobble = this.hovered === id && !this.drag && this.motion() ? (Math.floor(time * 6) % 2 ? -1 : 0) : 0
    return { dx: o.x, dy: o.y + wobble }
  }
  get dissolving() { return this.hold > 0.001 || this.holdDone }
  stainExtra(f: Frame) {
    return f.now.stain > 0 && f.now.ring === 0 ? Math.min(1, f.num.stain + Math.min(0.3, this.scrubAcc * 0.0025)) : 0
  }
  chapter(ci: number, root: HTMLElement) { root.dataset.chapter = String(ci) }

  reset() {
    this.mugFallen = false; this.mugFall = 0; this.doorOpened = false; this.scrubAcc = 0; this.scrubLocked = false
    this.hold = 0; this.holdDone = false; this.reducedDissolve = false; this.autoplay = false; this.phoneFall = 0; this.phoneGone = 1
    this.offsets.clear()
  }

  // ── per frame ──
  update(dt: number, f: Frame, ci: number, chapterStart: number[], beats: Beat[]) {
    if (ci < 1) { this.mugFallen = false; this.mugFall = 0 }
    if (ci < 2) this.doorOpened = false
    if (ci < 3) { this.scrubAcc = 0; this.scrubLocked = false }
    if (ci < 5) { this.hold = 0; this.holdDone = false; this.reducedDissolve = false; this.autoplay = false; this.phoneFall = 0; this.phoneGone = 1; this.sinceDone = 0 }
    this.scrubLocked = f.now.lockScrub && ci === 3 ? true : ci === 3 ? this.scrubLocked : this.scrubLocked
    if (f.now.lockScrub) this.scrubFrame = null

    let busy = false
    if (this.mugFallen && this.mugFall < 1) { this.mugFall = Math.min(1, this.mugFall + dt / 0.7); busy = true }

    // the hold
    const lastWindow = beats.findIndex((b) => b.id === 'wi-12')
    if (!this.holdDone) {
      if (ci > 5 || (f.index === lastWindow && f.local > 0.6)) this.autoplay = true     // read on without holding: it finishes by itself
      if (ci > 5) { this.hold = 1; this.done() }
      else if (this.holding || this.autoplay) {
        this.hold = Math.min(1, this.hold + dt / (this.autoplay && !this.holding ? 3 : this.reducedDissolve ? 3 : HOLD_SECONDS))
        this.pulse += dt
        if (this.holding && this.pulse > 0.5) { this.pulse = 0; navigator.vibrate?.(8) }
        if (this.hold >= 1) this.done()
        busy = true
      } else if (this.hold > 0) { this.hold = Math.max(0, this.hold - dt / 1.6); busy = true }
    }
    if (this.hold >= 0.92 && this.phoneFall < 1) { this.phoneFall = Math.min(1, this.phoneFall + dt / 0.5); busy = true }
    if (this.holdDone && this.phoneFall >= 1 && this.phoneGone > 0) {
      this.sinceDone += dt
      if (this.sinceDone > 1.4) this.phoneGone = Math.max(0, this.phoneGone - dt / 1.2)
      busy = true
    }
    if (f.now.interact === 'hold' && (this.hold > 0 || this.holding)) busy = true
    this.busy = busy
    void chapterStart
  }

  private done() {
    if (this.holdDone) return
    this.holdDone = true
    this.holding = false
    this.hold = 1
    navigator.vibrate?.(30)
    this.say('holdDone')
  }

  private say(key: string, once = true) {
    if (once && this.told.has(key)) return
    this.told.add(key)
    this.announce(LIVE[key])
  }

  // ── buttons ──
  place(hits: Hit[], view: View, art: HTMLElement) {
    this.view = view
    const active = new Set(hits.map((h) => h.id))
    for (const [id, b] of this.buttons) if (!active.has(id)) { b.hidden = true; if (this.drag?.id === id) this.drag = null }
    for (const k of this.hints.keys()) this.hints.get(k)!.hidden = true
    this.ring.style.display = 'none'
    const aw = art.clientWidth, ah = art.clientHeight
    for (const h of hits) {
      let b = this.buttons.get(h.id)
      if (!b) b = this.make(h)
      const x = h.rect.x * view.s + view.tx, y = h.rect.y * view.s + view.ty
      const w = h.rect.w * view.s, hh = h.rect.h * view.s
      const min = h.kind === 'hold' ? 72 : 48
      const bw = Math.max(min, w), bh = Math.max(min, hh)
      const bx = x + w / 2 - bw / 2, by = y + hh / 2 - bh / 2
      const onScreen = bx + bw > 0 && by + bh > 0 && bx < aw && by < ah
      if (h.kind === 'mug' && this.mugFallen) { b.hidden = true; continue }
      if (h.kind === 'door' && this.doorOpened) { b.hidden = true; continue }
      if (h.kind === 'hold' && this.holdDone) { b.hidden = true; continue }
      b.hidden = !onScreen
      b.style.transform = `translate(${Math.round(bx)}px, ${Math.round(by)}px)`
      b.style.width = `${Math.round(bw)}px`
      b.style.height = `${Math.round(bh)}px`
      const hint = this.hints.get(h.kind)!
      if (onScreen && !this.used.has(h.kind) && !(h.kind === 'board' && h.id !== 'postcard')) {
        hint.hidden = false
        // above the target, except the hold (that would cover his face): below it
        hint.style.transform = h.kind === 'hold'
          ? `translate(${Math.round(bx + bw / 2)}px, ${Math.round(by + bh + 14)}px) translate(-50%, 0)`
          : `translate(${Math.round(bx + bw / 2)}px, ${Math.round(by - 6)}px) translate(-50%, -100%)`
      }
      if (h.kind === 'hold' && onScreen) {
        this.ring.style.display = 'block'
        const size = Math.max(bw, bh) + 16
        this.ring.style.transform = `translate(${Math.round(bx + bw / 2 - size / 2)}px, ${Math.round(by + bh / 2 - size / 2)}px)`
        this.ring.style.width = this.ring.style.height = `${size}px`
        this.ring.style.setProperty('--p', String(this.hold))
        this.ring.classList.toggle('is-holding', this.holding)
      }
    }
  }

  private make(h: Hit) {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = `ats-hit ats-hit--${h.kind}`
    b.dataset.id = h.id
    b.setAttribute('aria-label', h.label)
    b.hidden = true
    if (h.kind === 'hold') b.setAttribute('aria-describedby', 'ats-hold-help')
    b.addEventListener('pointerdown', (e) => this.down(h, e))
    b.addEventListener('pointermove', (e) => this.move(h, e))
    b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && h.kind === 'board') this.hovered = h.id })
    b.addEventListener('pointerleave', () => { if (this.hovered === h.id) this.hovered = null; if (h.kind === 'hold' && this.holding && !this.drag) this.release() })
    b.addEventListener('click', (e) => this.click(h, e))
    b.addEventListener('keydown', (e) => this.key(h, e, true))
    b.addEventListener('keyup', (e) => this.key(h, e, false))
    this.layer.append(b)
    this.buttons.set(h.id, b)
    return b
  }

  private use(kind: Kind) { this.used.add(kind) }

  private down(h: Hit, e: PointerEvent) {
    this.invalidate()
    if (h.kind === 'board' || h.kind === 'scrub') {
      e.preventDefault()
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      const o = this.offsets.get(h.id) ?? { x: 0, y: 0 }
      this.drag = { id: h.id, pointer: e.pointerId, x: e.clientX, y: e.clientY, ox: o.x, oy: o.y, last: e.clientX }
    }
    if (h.kind === 'hold') {
      e.preventDefault()
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      this.press()
    }
  }

  private move(h: Hit, e: PointerEvent) {
    this.invalidate()
    const d = this.drag
    if (!d || d.pointer !== e.pointerId) return
    const s = this.view.s
    if (h.kind === 'board') {
      const nx = Math.max(-3, Math.min(3, Math.round(d.ox + (e.clientX - d.x) / s)))
      const ny = Math.max(-2, Math.min(2, Math.round(d.oy + (e.clientY - d.y) / s)))
      const o = this.offsets.get(h.id)
      if (!o || o.x !== nx || o.y !== ny) { this.offsets.set(h.id, { x: nx, y: ny }); this.use('board'); this.say('board') }
    } else if (h.kind === 'scrub' && !this.scrubLocked) {
      const dx = Math.abs(e.clientX - d.last) / s
      d.last = e.clientX
      this.scrub(dx)
    }
  }

  private scrub(dx: number) {
    this.scrubAcc += dx
    this.scrubFrame = Math.floor(this.scrubAcc / 4) % 2 ? 'scrub-b' : 'scrub-a'
    this.use('scrub')
    this.say('scrub')
  }

  private onUp = (e: PointerEvent) => {
    if (this.drag && this.drag.pointer === e.pointerId) this.drag = null
    if (this.holding) this.release()
  }
  private onBlur = () => { if (this.holding) this.release() }

  private press() {
    this.invalidate()
    if (this.holdDone) return
    this.use('hold')
    if (!this.motion()) { this.reducedDissolve = true; this.autoplay = true; this.say('holdStart'); return }
    this.holding = true
    this.say('holdStart')
  }
  private release() {
    this.invalidate()
    this.holding = false
    if (!this.holdDone && this.hold > 0 && !this.autoplay) this.say('holdRelease', false)
  }

  private click(h: Hit, e: MouseEvent) {
    this.invalidate()
    switch (h.kind) {
      case 'mug': if (!this.mugFallen) { this.mugFallen = true; this.mugFall = 0; this.use('mug'); this.say('mug') } break
      case 'door': if (!this.doorOpened) { this.doorOpened = true; this.use('door'); this.say('door') } break
      case 'phone': this.use('phone'); this.say('phone', false); break
      case 'hold': if (e.detail === 0 && !this.motion()) this.press(); break // keyboard click under reduced motion
      default: break
    }
  }

  private key(h: Hit, e: KeyboardEvent, down: boolean) {
    this.invalidate()
    if (h.kind === 'board' && down && e.key.startsWith('Arrow')) {
      e.preventDefault()
      const o = this.offsets.get(h.id) ?? { x: 0, y: 0 }
      const n = { x: o.x + (e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0), y: o.y + (e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0) }
      this.offsets.set(h.id, { x: Math.max(-3, Math.min(3, n.x)), y: Math.max(-2, Math.min(2, n.y)) })
      this.use('board'); this.say('board')
    }
    if (h.kind === 'scrub' && down && !this.scrubLocked && ['ArrowLeft', 'ArrowRight', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); this.scrub(4) }
    if (h.kind === 'hold' && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault()
      if (down && !e.repeat) this.press()
      else if (!down) this.release()
    }
  }

  destroy() {
    removeEventListener('pointerup', this.onUp)
    removeEventListener('pointercancel', this.onUp)
    removeEventListener('blur', this.onBlur)
  }
}
