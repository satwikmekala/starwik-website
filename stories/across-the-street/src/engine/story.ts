/**
 * The story: one sticky stage (art + the copy frame + interaction layer)
 * over a track of empty steps that give each beat its scroll length.
 * Reading position T (beat index + local progress) drives everything:
 * the state timeline, the camera, the sunbeam on the rug, which line of
 * copy is visible. Native scroll, CSS sticky (iOS-safe), GSAP's
 * ScrollTrigger for refresh/progress and its ticker for the frame loop.
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { loadLateSprites, SPRITE_DATA } from '../art/compiled.ts'
import { PHONE_IN_HAND } from '../art/man.ts'
import { OLD_WINDOW } from '../art/old-building.ts'
import { SHOTS, SPOTS, STREET, type Shot } from '../direction.ts'
import { flatDesktop, flatMobile, streetMobile } from '../scenes/flat.ts'
import type { SceneDef } from '../scenes/types.ts'
import { clampView, fitView, lerpView, type Box, type View } from './camera.ts'
import { chromeMarkup, menuMarkup } from './chrome.ts'
import { BEATS, inline, type Beat } from './copy.ts'
import { creditsMarkup } from './credits.ts'
import { dissolveAt, prepareDissolve } from './dissolve.ts'
import { Interactions, type Hit } from './interactions.ts'
import { layoutFor, reducedMotion, type Layout } from './layout.ts'
import { Palette } from './palette.ts'
import { SceneCanvas, type Actor, type ItemState, type Particle } from './renderer.ts'
import { buildTimeline, ease, frameAt, type Frame, type Resolved } from './state.ts'

gsap.registerPlugin(ScrollTrigger)

type Slot = { kind: 'cover' | 'title' | 'beat' | 'end'; beat: number; h: number; el: HTMLElement; chapter: number; breathe?: boolean }

const STEP = { beat: 72, breathe: 110, title: 55, cover: 90, end: 90 } // svh per slot

export interface StoryHandle { destroy(): void }

export function mountStoryView(root: HTMLElement): StoryHandle {
  // ── content ───────────────────────────────────────────
  const beats: (Beat & { chapter: number })[] = []
  BEATS.chapters.forEach((c, ci) => c.beats.forEach((b) => beats.push({ ...b, chapter: ci })))
  const states = buildTimeline(beats)
  const chapterStart = BEATS.chapters.map((_, ci) => beats.findIndex((b) => b.chapter === ci))

  root.innerHTML = `
    <a id="ats-top" class="visually-hidden" tabindex="-1">${BEATS.title}</a>
    <div class="ats-story">
      <div class="ats-stage">
        <div class="ats-art"></div>
        <div class="ats-sheet" aria-hidden="true"></div>
        <div class="ats-copyframe">
          <header class="ats-cover" data-slot>
            <h1>${BEATS.title}</h1>
            <p class="ats-scrollcue" aria-hidden="true"><span>${BEATS.ui.scroll}</span> <svg viewBox="0 0 5 6"><path fill="currentColor" d="M2 0h1v4H2zM0 3h1v1H0zM1 4h1v1H1zM2 5h1v1H2zM3 4h1v1H3zM4 3h1v1H4z"/></svg></p>
          </header>
          ${BEATS.chapters.map((c, ci) => `
          <section class="ats-chapter" id="ch-${c.id}" aria-labelledby="ch-${c.id}-title" data-chapter="${ci}">
            <h2 id="ch-${c.id}-title" class="ats-chapter-title" data-slot><span class="ats-chapter-no">${ci + 1}</span> ${c.title}</h2>
            ${c.beats.map((b) => `<p class="ats-copy" data-slot data-beat="${b.id}" data-kind="${b.kind}">${b.lines.map((l) => `<span class="line">${inline(l)} </span>`).join('')}</p>`).join('')}
          </section>`).join('')}
          <nav class="ats-endcard" data-slot aria-label="End of story">
            <a href="#ats-top" class="ats-readagain" data-readagain>${BEATS.ui.readAgain}</a>
            <a href="#ats-credits" class="ats-creditslink" data-credits>${BEATS.ui.credits}</a>
          </nav>
        </div>
        <div class="ats-hits"></div>
      </div>
      <div class="ats-track" aria-hidden="true"></div>
    </div>
    ${creditsMarkup()}
    ${chromeMarkup()}
    ${menuMarkup()}
    <p class="visually-hidden" aria-live="polite" data-live></p>`

  const stage = root.querySelector<HTMLElement>('.ats-stage')!
  const art = root.querySelector<HTMLElement>('.ats-art')!
  const track = root.querySelector<HTMLElement>('.ats-track')!
  const hitsLayer = root.querySelector<HTMLElement>('.ats-hits')!
  const live = root.querySelector<HTMLElement>('[data-live]')!

  // slots: cover, then per chapter a title and its beats, then the end card
  const slotEls = [...root.querySelectorAll<HTMLElement>('[data-slot]')]
  const slots: Slot[] = []
  let bi = 0
  for (const el of slotEls) {
    if (el.classList.contains('ats-cover')) slots.push({ kind: 'cover', beat: 0, h: STEP.cover, el, chapter: 0 })
    else if (el.classList.contains('ats-chapter-title')) {
      const ci = +el.closest<HTMLElement>('[data-chapter]')!.dataset.chapter!
      slots.push({ kind: 'title', beat: chapterStart[ci], h: STEP.title, el, chapter: ci })
    } else if (el.classList.contains('ats-endcard')) slots.push({ kind: 'end', beat: beats.length - 1, h: STEP.end, el, chapter: BEATS.chapters.length - 1 })
    else { const b = beats[bi]; slots.push({ kind: 'beat', beat: bi, h: b.breathe ? STEP.breathe : STEP.beat, el, chapter: b.chapter, breathe: b.breathe }); bi++ }
  }
  track.innerHTML = slots.map((s) => `<div class="ats-step" style="height:${s.h}svh"></div>`).join('')
  const steps = [...track.children] as HTMLElement[]

  // ── runtime state ─────────────────────────────────────
  const palette = new Palette(root)
  let layout: Layout = layoutFor(innerWidth, innerHeight)
  let scenes: { flat: SceneCanvas; street?: SceneCanvas; periph?: HTMLCanvasElement } | null = null
  let view: View = { s: 1, tx: 0, ty: 0 }
  let streetView: View = { s: 1, tx: 0, ty: 0 }
  let motion = !reducedMotion()
  let T = -1, slotIndex = 0, slotLocal = 0
  let lastShotKey = ''
  let lastScroll = performance.now()
  let distressNow = -1
  const particles: Particle[] = []
  let dirty = true
  let dissolveSeeds: ReturnType<typeof prepareDissolve> | null = null
  const ui = new Interactions(root, hitsLayer, (msg) => { live.textContent = ''; requestAnimationFrame(() => { live.textContent = msg }) }, () => motion, () => { dirty = true })
  let lateReady = false
  loadLateSprites().then(() => { lateReady = true; dissolveSeeds = null; dirty = true })

  // ── layout ────────────────────────────────────────────
  const buildScenes = () => {
    art.replaceChildren()
    root.querySelector('.ats-peripheral')?.remove()
    root.dataset.layout = layout
    if (layout === 'desktop') {
      scenes = { flat: new SceneCanvas(flatDesktop, 'Marcus\'s flat, cut open, and across the road the old building above a shuttered bank') }
      art.append(scenes.flat.canvas)
    } else {
      const flat = new SceneCanvas(flatMobile, 'Marcus\'s flat, cut open')
      const street = new SceneCanvas(streetMobile, 'The street below: the old building across the road, above a shuttered bank')
      street.canvas.classList.add('ats-street')
      const periph = document.createElement('canvas')
      periph.className = 'ats-periph-canvas'
      const fig = document.createElement('figure')
      fig.className = 'ats-peripheral'
      fig.setAttribute('aria-label', 'Across the road: his old kitchen window, a towel in the gap')
      fig.append(periph)
      stage.append(fig)
      scenes = { flat, street, periph }
      art.append(flat.canvas, street.canvas)
    }
    lastShotKey = ''
    dirty = true
  }

  const area = () => ({ w: art.clientWidth, h: art.clientHeight })
  // six lines of 20–23 px copy + the back pill: sized so a 390×844 phone keeps the art at exactly 2×
  const sheetH = () => Math.round(Math.min(290, Math.max(238, innerHeight * 0.285)))
  const copyBox = (): Box => {
    const a = area()
    const col = Math.min(a.w * 0.4, 560)
    return { x: col, y: 0, w: a.w - col, h: a.h }
  }

  // ── actors from state ─────────────────────────────────
  const marcusSprite = (pose: string, moving: number, t: number): [string, string, number] => {
    if (pose.startsWith('crouch')) {
      const f = pose === 'crouch-scrub' ? (ui.scrubFrame ?? (Math.floor(t * 2.5) % 2 ? 'scrub-b' : 'scrub-a')) : pose === 'crouch-still' ? 'still' : 'up'
      return ['marcus-crouch', f, 64]
    }
    if (moving > 0) return ['marcus', Math.floor(moving / 6) % 2 ? 'walk-a' : 'walk-b', 98]
    return ['marcus', pose, 98]
  }

  function figurePos(who: 'marcus' | 'man', f: Frame) {
    const spots = SPOTS[layout][who]
    const now = f.now[who], prev = f.prev[who]
    const at = (st: { at?: string } | null) => (st?.at ? spots[st.at as keyof typeof spots] : undefined)
    const to = at(now), from = at(prev) ?? to
    if (!now || !to) return null
    const x = from![0] + (to[0] - from![0]) * f.k, y = from![1] + (to[1] - from![1]) * f.k
    const moving = Math.abs(to[0] - from![0]) > 2 && f.k > 0 && f.k < 1 ? Math.abs(x - from![0]) : 0
    return { x, y, moving, appear: prev ? 1 : f.k }
  }

  function actorsFor(f: Frame, time: number) {
    const room: Actor[] = [], street: Actor[] = []
    const { now } = f
    const ch = beats[f.index].chapter
    // the mug was knocked early by a tap (chapter 2 only)
    const tappedMug = ui.mugFallen && ch === 1 && now.mug === 'hand'
    // Marcus
    const mp = figurePos('marcus', f)
    let marcusAt: { x: number; y: number } | null = null
    if (mp) {
      const pose = (now.marcus!.pose ?? 'stand') as string
      const mugInHand = now.mug === 'hand' && !tappedMug
      const [sprite, part, foot] = marcusSprite(pose === 'mug' && !mugInHand ? 'worried' : pose, mp.moving && !pose.startsWith('crouch') ? mp.moving : 0, time)
      const flip = pose.startsWith('crouch')
      room.push({ sprite, part, x: Math.round(mp.x - (flip ? SPRITE_DATA[sprite]?.w - 28 : 28) || 0), y: Math.round(mp.y - foot), flip, alpha: mp.appear, layer: 'room', z: mp.y })
      marcusAt = mp
    }
    // the man (indoors)
    const np = figurePos('man', f)
    let manAt: { x: number; y: number; part: string } | null = null
    if (np && lateReady) {
      const pose = now.man!.pose ?? 'stand'
      const shake = now.man!.shake && motion ? (Math.floor(time * 9) % 2) : 0
      const part = np.moving ? (Math.floor(np.moving / 6) % 2 ? 'walk-a' : 'walk-b') : pose
      manAt = { x: np.x + shake, y: np.y, part }
      if (!ui.dissolving) room.push({ sprite: 'man', part, x: Math.round(np.x - 36 + shake), y: Math.round(np.y - 98), alpha: np.appear * (ui.reducedDissolve ? 1 - ui.hold : 1), layer: 'room', z: np.y - 1 })
    }
    // the phone, once it is its own actor
    if (manAt && (manAt.part === 'relieved' || manAt.part === 'younger') && now.phone === 'hand') {
      const px = manAt.x - 36 + PHONE_IN_HAND.x, py = manAt.y - 98 + PHONE_IN_HAND.y
      const fall = ui.phoneFall
      const alpha = ui.phoneGone
      if (alpha > 0) room.push({ sprite: 'phone', part: fall >= 1 ? 'lying' : 'base', x: Math.round(px + fall * 2), y: Math.round(py + ease(fall) * (manAt.y - py - 10)), alpha, layer: 'room', z: manAt.y + 1 })
    }
    // the mug off the sill
    const land = layout === 'desktop' ? [238, 228] : [112, 213]
    const mugState = tappedMug ? 'floor' : now.mug
    if (mugState === 'floor' || mugState === 'upright') {
      const fallK = tappedMug || (ui.mugFallen && ch === 1 && f.prev.mug === 'hand' && now.mug === 'floor') ? ui.mugFall : f.prev.mug === 'hand' && now.mug === 'floor' ? f.k : 1
      if (fallK < 1 && marcusAt) {
        const hx = marcusAt.x - 8, hy = marcusAt.y - 64
        room.push({ sprite: 'mug', part: 'falling', x: Math.round(hx + (land[0] - hx) * fallK), y: Math.round(hy + (land[1] - hy) * fallK * fallK), layer: 'room', z: 999 })
      } else room.push({ sprite: 'mug', part: mugState === 'floor' ? 'tipped' : 'base', x: land[0], y: land[1], layer: 'room', z: land[1] + 12 })
    }

    // the street
    const S = STREET[layout]
    const after = now.street === 'after'
    if (lateReady) {
      street.push({ sprite: 'woman-dog', part: after ? 'home' : 'stubborn', x: after ? S.dogHome[0] : S.dog[0], y: S.dog[1], flip: after, layer: 'street' })
      street.push({ sprite: 'fruit-seller', part: now.seller, x: S.seller[0], y: S.seller[1], layer: 'street' })
      if (after) street.push({ sprite: 'old-woman', part: 'base', x: S.oldWoman[0], y: S.oldWoman[1], layer: 'street' })
      const bk = f.num.bikes
      if (bk > 0 && bk < 1) {
        const bx = S.bikes[1] + (S.bikes[2] - S.bikes[1]) * bk
        street.push({ sprite: 'bikes', part: Math.floor(bx / 4) % 2 ? 'a' : 'b', x: Math.round(bx), y: S.bikes[0], layer: 'street' })
      }
      const pace = (alpha: number) => {
        // exactly three steps each way: A → A+3 → A+6 → A+9, turn, and back
        const seq = [0, 1, 2, 3, 3, 2, 1, 0, 0]
        const i = motion ? Math.floor(time / 0.45) % seq.length : 0
        const x = S.pace[0] + seq[i] * 3
        const moving = i < 3 || (i > 3 && i < 7)
        street.push({ sprite: 'man-small', part: !motion || !moving ? 'pace-0' : i % 2 ? 'pace-1' : 'pace-2', x, y: S.pace[1], flip: i >= 4, alpha, layer: 'street' })
      }
      if (now.manSmall === 'pace') pace(f.prev.manSmall === 'pace' ? 1 : f.k)
      else if (now.manSmall === 'look') street.push({ sprite: 'man-small', part: 'look', x: S.pace[0] + 4, y: S.pace[1], layer: 'street' })
      else if (now.manSmall === 'walk') {
        const k = ease(Math.min(1, f.local / 0.9))
        const x = S.pace[0] + 4 + (S.walkTo - S.pace[0] - 4) * k
        street.push({ sprite: 'man-small', part: Math.floor(x / 3) % 2 ? 'walk-1' : 'walk-2', x: Math.round(x), y: S.pace[1], flip: true, alpha: 1 - Math.max(0, k - 0.75) * 4, layer: 'street' })
      }
      if (f.num.ghost > 0.01) pace(f.num.ghost)
      const linger = now.linger ? Math.min(1, Math.max(0, (performance.now() - lastScroll) / 1000 - 6) / 2) : 0
      if (linger > 0) street.push({ sprite: 'man-small', part: 'look', x: S.pace[0] + 4, y: S.pace[1], alpha: 0.22 * linger, layer: 'street' })
    }
    return { room, street, marcusAt, manAt }
  }

  // ── item states ───────────────────────────────────────
  function itemFn(f: Frame, time: number) {
    const { now } = f
    return (id: string): ItemState | undefined => {
      switch (id) {
        case 'mug': return { hidden: now.mug !== 'sill' }
        case 'dishcloth': return { hidden: now.dishcloth !== 'chair' }
        case 'breakfast': return { parts: ['base', now.breakfast === 'cold' ? 'cold' : 'breakfast'] }
        case 'postcard': return { ...ui.boardOffset(id, time), alpha: now.postcardDull ? 0.55 : 1 }
        case 'tram-pass': case 'wristband': case 'photo': return ui.boardOffset(id, time)
        case 'door': {
          const open = now.door === 'open' || ui.doorOpened
          const knock = now.knock && motion && !open ? (Math.floor(time * 3) % 3 === 0 && (time * 6) % 1 < 0.5 ? 1 : 0) : 0
          return { parts: open ? ['frame'] : ['frame', 'leaf'], dx: knock }
        }
        case 'hallway': return { hidden: !(now.door === 'open' || ui.doorOpened), parts: [now.hallway] }
        case 'door-open': return { hidden: !(now.door === 'open' || ui.doorOpened) }
        case 'old-glint': return { alpha: f.num.glint, hidden: f.num.glint < 0.02 }
        default: return undefined
      }
    }
  }

  // ── camera ────────────────────────────────────────────
  function shotRect(shot: Shot, f: Frame, who: ReturnType<typeof actorsFor>): Box {
    if (shot.rect) return { x: shot.rect[0], y: shot.rect[1], w: shot.rect[2], h: shot.rect[3] }
    const pts: [number, number, number, number][] = []
    for (const w of shot.follow ?? []) {
      if (w === 'marcus' && who.marcusAt) pts.push([who.marcusAt.x - 28, who.marcusAt.y - 98, 56, 100])
      if (w === 'man' && who.manAt) pts.push([who.manAt.x - 26, who.manAt.y - 98, 52, 100])
      if (w === 'phone' && who.manAt) pts.push([who.manAt.x + 4, who.manAt.y - 50, 20, 20])
    }
    if (!pts.length) return { x: 0, y: 0, w: 640, h: 360 }
    const [px, py] = shot.pad ?? [16, 16]
    const x0 = Math.min(...pts.map((p) => p[0])) - px, y0 = Math.min(...pts.map((p) => p[1])) - py
    const x1 = Math.max(...pts.map((p) => p[0] + p[2])) + px, y1 = Math.max(...pts.map((p) => p[1] + p[3])) + py
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }
  }

  function viewFor(shotName: Resolved['shot'], f: Frame, who: ReturnType<typeof actorsFor>, def: SceneDef): View {
    const shot = SHOTS[layout][shotName]
    const r = shotRect(shot, f, who)
    const a = area()
    const box = layout === 'desktop' && shot.copy === 'left' ? copyBox() : { x: 0, y: 0, w: a.w, h: a.h }
    return fitView({ x: r.x + def.safe.x, y: r.y + def.safe.y, w: r.w, h: r.h }, box, a, def.canvas, devicePixelRatio || 1)
  }

  // ── scroll → T ────────────────────────────────────────
  let offsets: number[] = []
  const measure = () => {
    const top = track.getBoundingClientRect().top + scrollY
    offsets = steps.map((s) => s.offsetTop + top)
  }
  const updateT = () => {
    const y = scrollY
    let i = 0
    while (i < steps.length - 1 && offsets[i + 1] <= y) i++
    const h = steps[i].offsetHeight || 1
    slotIndex = i
    slotLocal = Math.max(0, Math.min(1, (y - offsets[i]) / h))
    const s = slots[i]
    T = s.kind === 'beat' ? s.beat + slotLocal : s.kind === 'end' ? beats.length - 1 + 0.99 : s.kind === 'title' ? Math.max(0, s.beat - 0.01) : 0
    lastScroll = performance.now()
    dirty = true
  }

  // ── frame ─────────────────────────────────────────────
  let time = 0
  let lastTick = performance.now()
  let periphSize = { w: 0, h: 0 }

  function render() {
    if (!scenes) return
    const nowMs = performance.now()
    const dt = Math.min(0.1, (nowMs - lastTick) / 1000)
    lastTick = nowMs
    time += dt
    const f = frameAt(states, Math.max(0, T))
    const chapterIdx = beats[f.index].chapter
    ui.update(dt, f, chapterIdx, chapterStart, beats)
    if (!motion && f.k < 1) f.k = 1 // reduced motion: no in-between camera moves (cross-fade instead)
    if (!motion) for (const key of Object.keys(f.num) as (keyof Frame['num'])[]) (f.num as Record<string, number>)[key] = f.now[key] as number

    // palette
    // colours come back with the coat: fully returned when nothing is left
    const distress = f.num.distress * (f.now.interact === 'hold' ? 1 - ui.hold : 1)
    if (Math.abs(distress - distressNow) > 0.002) { root.style.setProperty('--distress', distress.toFixed(3)); distressNow = distress }
    const inks = palette.at(distress)

    const who = actorsFor(f, time)
    const flatDef = scenes.flat.def
    const progress = Math.max(0, Math.min(1, T / (beats.length - 1)))

    // the man dissolving into the sunbeam
    particles.length = 0
    if (lateReady && who.manAt && f.now.interact === 'hold' && ui.dissolving && !ui.reducedDissolve) {
      dissolveSeeds ??= prepareDissolve('relieved', [16, 26], layout === 'desktop' ? 1 : -1)
      dissolveAt(dissolveSeeds, ui.hold, who.manAt.x - 36, who.manAt.y - 98, particles)
    }

    // camera (flat / world)
    const shot = SHOTS[layout][f.now.shot]
    const target = viewFor(f.now.shot, f, who, flatDef)
    const from = viewFor(f.prev.shot, f, who, flatDef)
    view = motion ? lerpView(from, target, f.k, area()) : target
    view = clampView(view, area(), flatDef.canvas, 1e6)
    const shotKey = `${f.now.shot}|${layout === 'mobile' ? shot.scene : ''}`
    if (!motion && shotKey !== lastShotKey && lastShotKey) gsap.fromTo(art, { opacity: 0.25 }, { opacity: 1, duration: 0.35, ease: 'none' })
    lastShotKey = shotKey
    apply(scenes.flat.canvas, view)
    if (layout === 'desktop') {
      // copy on the open wall sits inside the room, never across the building's outline
      const left = shot.copy === 'over' ? `${Math.max(24, Math.round((flatDef.safe.x + 32) * target.s + target.tx))}px` : 'max(24px, 5vw)'
      if (root.style.getPropertyValue('--copy-left') !== left) root.style.setProperty('--copy-left', left)
      const pa = SHOTS.desktop[f.prev.shot].copy === 'left' ? 1 : 0, pb = shot.copy === 'left' ? 1 : 0
      const panel = (pa + (pb - pa) * f.k).toFixed(3)
      if (root.style.getPropertyValue('--panel') !== panel) root.style.setProperty('--panel', panel)
    }

    scenes.flat.draw({ inks, item: itemFn(f, time), beam: progress, stain: Math.max(f.num.stain, ui.stainExtra(f)), ring: f.num.ring, actors: [...who.room, ...(layout === 'desktop' ? who.street : [])], particles, time, motion })

    if (scenes.street) {
      const onStreet = shot.scene === 'street'
      const prevStreet = SHOTS[layout][f.prev.shot].scene === 'street'
      const showK = onStreet === prevStreet ? (onStreet ? 1 : 0) : onStreet ? f.k : 1 - f.k
      scenes.street.canvas.style.opacity = String(showK)
      scenes.street.draw({ inks, item: itemFn(f, time), beam: null, stain: 0, ring: 0, actors: who.street, particles: [], time, motion })
      const sShot = onStreet ? f.now.shot : prevStreet ? f.prev.shot : 'oldbuilding'
      streetView = clampView(viewFor(sShot, f, who, streetMobile), area(), streetMobile.canvas, 1e6)
      apply(scenes.street.canvas, streetView)
      peripheral(f, 1 - showK)
    }
    ui.place(hitsFor(f, who), view, art)
    updateCopy()
  }

  function apply(c: HTMLCanvasElement, v: View) {
    c.style.transform = `translate3d(${v.tx}px, ${v.ty}px, 0) scale(${v.s})`
  }

  function peripheral(f: Frame, visible: number) {
    const periph = scenes!.periph!
    const fig = periph.parentElement as HTMLElement
    const e = f.num.peri
    const w0 = OLD_WINDOW.w + 8, h0 = OLD_WINDOW.h + 12, w1 = 110, h1 = 236
    const cw = Math.round(w0 + (w1 - w0) * e), ch = Math.round(h0 + (h1 - h0) * e)
    const ob = streetMobile.items.find((i) => i.id === 'old-building')!
    const cx = streetMobile.safe.x + ob.x + OLD_WINDOW.x + OLD_WINDOW.w / 2, top = streetMobile.safe.y + ob.y + OLD_WINDOW.y - 6
    const sx = Math.round(cx - cw / 2), sy = Math.round(top - 4 * e)
    if (periph.width !== cw || periph.height !== ch) { periph.width = cw; periph.height = ch }
    const ctx = periph.getContext('2d')!
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(scenes!.street!.canvas, sx, sy, cw, ch, 0, 0, cw, ch)
    const scale = e > 0.5 ? 1.5 : 2
    const w = cw * scale, h = ch * scale
    if (w !== periphSize.w || h !== periphSize.h) { periph.style.width = `${w}px`; periph.style.height = `${h}px`; periphSize = { w, h } }
    fig.style.opacity = String(visible)
    fig.style.visibility = visible < 0.02 ? 'hidden' : 'visible'
  }

  function hitsFor(f: Frame, who: ReturnType<typeof actorsFor>): Hit[] {
    const def = scenes!.flat.def
    const ox = def.safe.x, oy = def.safe.y
    const it = (id: string) => def.items.find((i) => i.id === id)!
    const box = (id: string, sprite: string) => { const p = it(id); const d = SPRITE_DATA[sprite]; const o = ui.boardOffset(id, 0); return { x: p.x + ox + (o.dx ?? 0), y: p.y + oy + (o.dy ?? 0), w: d.w, h: d.h } }
    const hits: Hit[] = []
    const act = f.now.interact
    if (act === 'board') for (const [id, sprite] of [['tram-pass', 'tram-pass'], ['wristband', 'wristband'], ['photo', 'photo'], ['postcard', 'postcard']] as const)
      hits.push({ kind: 'board', id, rect: box(id, sprite), label: BEATS.ui.labels.board.replace('{item}', it(id).label!.replace(/^a /, '').replace(/:.*$/, '')) })
    if (act === 'mug' && who.marcusAt) hits.push({ kind: 'mug', id: 'mug', rect: { x: who.marcusAt.x - 8 + ox, y: who.marcusAt.y - 64 + oy, w: 10, h: 11 }, label: BEATS.ui.labels.mug })
    if (act === 'door') hits.push({ kind: 'door', id: 'door', rect: box('door', 'door'), label: BEATS.ui.labels.door })
    if (act === 'scrub') { const r = box('rug', 'rug'); hits.push({ kind: 'scrub', id: 'stain', rect: { x: r.x + 60, y: r.y + 2, w: 66, h: 24 }, label: BEATS.ui.labels.scrub }) }
    if (act === 'phone' && who.manAt) hits.push({ kind: 'phone', id: 'phone', rect: { x: who.manAt.x - 36 + 49 + ox, y: who.manAt.y - 98 + 51 + oy, w: 6, h: 10 }, label: BEATS.ui.labels.phone })
    if (act === 'hold' && who.marcusAt) hits.push({ kind: 'hold', id: 'hold', rect: { x: who.marcusAt.x - 28 + 58 + ox, y: who.marcusAt.y - 98 + 20 + oy, w: 16, h: 16 }, label: BEATS.ui.labels.hold })
    return hits
  }

  // ── copy visibility ───────────────────────────────────
  let shownSlot = -1
  function updateCopy() {
    for (let i = Math.max(0, slotIndex - 2); i <= Math.min(slots.length - 1, slotIndex + 2); i++) {
      const s = slots[i]
      let o = 0
      if (i === slotIndex) {
        const u = slotLocal
        const outAt = s.breathe ? 0.55 : s.kind === 'end' ? 2 : 0.84
        o = s.kind === 'cover' ? 1 - Math.max(0, (u - 0.55) / 0.3) : Math.min(1, u / 0.14) * (1 - Math.max(0, Math.min(1, (u - outAt) / 0.14)))
        if (s.kind === 'cover' && T <= 0 && u < 0.02) o = 1
      }
      const el = s.el
      const v = o.toFixed(3)
      if (el.style.opacity !== v) el.style.opacity = v
      el.classList.toggle('is-active', o > 0.5)
    }
    if (shownSlot !== slotIndex) {
      if (shownSlot >= 0 && Math.abs(shownSlot - slotIndex) > 2) slots[shownSlot].el.style.opacity = '0'
      shownSlot = slotIndex
      ui.chapter(slots[slotIndex].chapter, root)
    }
  }

  // ── wiring ────────────────────────────────────────────
  const mm = gsap.matchMedia()
  let st: ScrollTrigger | null = null
  const setup = () => {
    layout = layoutFor(innerWidth, innerHeight)
    root.style.setProperty('--sheet-h', `${sheetH()}px`)
    buildScenes()
    measure()
    updateT()
  }
  mm.add({ desktop: '(min-width: 1024px), (min-width: 768px) and (orientation: landscape)', mobile: '(max-width: 1023px) and (orientation: portrait), (max-width: 767px)' }, () => {
    setup()
    st = ScrollTrigger.create({ trigger: track, start: 'top top', end: 'bottom bottom', onUpdate: updateT, onRefresh: () => { measure(); updateT() } })
    return () => { st?.kill(); st = null }
  })
  ScrollTrigger.config({ ignoreMobileResize: true })
  const onScroll = () => updateT()
  addEventListener('scroll', onScroll, { passive: true })
  const ro = new ResizeObserver(() => { root.style.setProperty('--sheet-h', `${sheetH()}px`); measure(); dirty = true })
  ro.observe(root)
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)')
  const onMotion = () => { motion = !motionQuery.matches; dirty = true }
  motionQuery.addEventListener('change', onMotion)

  // the loop: redraw when something moved, or at a steady ~15 fps for
  // the slow time-based things (pacing, drifting clouds, dust)
  let acc = 0
  const tick = (_t: number, dtMs: number) => {
    acc += dtMs
    const animated = motion || ui.busy
    if (dirty || ui.busy || (animated && acc > 66)) { acc = 0; dirty = false; render() }
  }
  gsap.ticker.add(tick)

  // chrome
  const menu = root.querySelector<HTMLDialogElement>('dialog.ats-menu-panel')!
  const menuBtn = root.querySelector<HTMLButtonElement>('.ats-menu')!
  const openMenu = () => {
    menu.querySelectorAll<HTMLElement>('[data-jump]').forEach((a) => {
      const ci = +a.dataset.jump!
      const cur = slots[slotIndex].chapter
      a.toggleAttribute('aria-current', ci === cur)
      a.dataset.state = ci < cur ? 'read' : ci === cur ? 'current' : 'next'
    })
    menu.showModal(); menuBtn.setAttribute('aria-expanded', 'true')
  }
  const jumpTo = (slot: number) => {
    measure()
    scrollTo({ top: offsets[slot] + 2, behavior: reducedMotion() ? 'instant' : 'smooth' })
  }
  const onClick = (e: MouseEvent) => {
    const t = e.target as HTMLElement
    if (t.closest('.ats-menu')) { e.preventDefault(); openMenu(); return }
    const jump = t.closest<HTMLElement>('[data-jump]')
    if (jump) { e.preventDefault(); menu.close(); jumpTo(slots.findIndex((s) => s.kind === 'title' && s.chapter === +jump.dataset.jump!)) ; return }
    if (t.closest('[data-menu-close]')) { menu.close(); return }
    if (t.closest('[data-readagain]')) { e.preventDefault(); ui.reset(); scrollTo({ top: 0, behavior: reducedMotion() ? 'instant' : 'smooth' }); root.querySelector<HTMLElement>('#ats-top')?.focus({ preventScroll: true }); return }
    if (t.closest('[data-credits]')) { e.preventDefault(); menu.open && menu.close(); const c = root.querySelector<HTMLElement>('#ats-credits')!; c.scrollIntoView({ behavior: reducedMotion() ? 'instant' : 'smooth' }); c.focus({ preventScroll: true }) }
  }
  root.addEventListener('click', onClick)
  menu.addEventListener('close', () => { menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.focus() })

  return {
    destroy() {
      gsap.ticker.remove(tick)
      mm.revert()
      st?.kill()
      removeEventListener('scroll', onScroll)
      motionQuery.removeEventListener('change', onMotion)
      ro.disconnect()
      root.removeEventListener('click', onClick)
      ui.destroy()
      root.replaceChildren()
      root.style.removeProperty('--distress')
      root.style.removeProperty('--sheet-h')
      delete root.dataset.layout
    },
  }
}

