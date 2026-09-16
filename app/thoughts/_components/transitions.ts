/**
 * The paper transitions — the moments where one layer becomes another.
 *
 * Moving between the room and a floating card is simple enough for the
 * stylesheet (see the `[data-thoughts-view]` rules). Everything involving
 * the paper is choreographed here with Web Animations, because it has to
 * *measure*: the full-screen sheet is mapped onto the card's exact
 * rectangle, and the article's opening words are mapped onto the card's
 * words, so the page you were looking at is the page you end up reading.
 */

import type { DepthEngine } from './engine'
import { Choreography, EASE } from './motion'
import type { Scene } from './scene'

export interface Stage {
  root: HTMLElement | null
  backdrop: HTMLElement | null
  atmos: HTMLElement | null
  deep: HTMLElement | null
  archive: HTMLElement | null
  sheet: HTMLElement | null
  rig: HTMLElement | null
  shadow: HTMLElement | null
  reader: HTMLElement | null
}

export interface TransitionContext {
  stage: () => Stage
  engine: DepthEngine | null
  reduced: boolean
  alive: () => boolean
}

export type Plan =
  | 'stylesheet'
  | 'enter-reading'
  | 'exit-reading'
  | 'reading-to-archive'
  | 'fade-into-reading'
  | 'swap-reading'

export function planFor(from: Scene, to: Scene): Plan {
  if (to.view === 'read') {
    if (from.view === 'portal') return 'enter-reading'
    if (from.view === 'read') return 'swap-reading'
    return 'fade-into-reading'
  }
  if (from.view === 'read') return to.view === 'portal' ? 'exit-reading' : 'reading-to-archive'
  return 'stylesheet'
}

/* ── geometry ── */

const FLIP_KEYS = ['kicker', 'title', 'subtitle'] as const

const part = (scope: Element | null | undefined, key: string) =>
  scope?.querySelector<HTMLElement>(`[data-flip="${key}"]`) ?? null

const reveals = (root: HTMLElement | null) =>
  Array.from(root?.querySelectorAll<HTMLElement>('[data-reveal]') ?? [])

export const findCard = (rig: HTMLElement | null, slug: string | null) =>
  slug ? (rig?.querySelector<HTMLElement>(`[data-slug="${CSS.escape(slug)}"]`) ?? null) : null

/** transform that makes an element laid out at `at` appear exactly over `over` (origin: centre) */
function placeOver(over: DOMRect, at: DOMRect) {
  const dx = over.left + over.width / 2 - (at.left + at.width / 2)
  const dy = over.top + over.height / 2 - (at.top + at.height / 2)
  const k = over.width / (at.width || 1)
  return `translate(${dx}px, ${dy}px) scale(${k})`
}

/** transform that shrinks the full-screen sheet onto the card */
function sheetOver(card: DOMRect, sheet: DOMRect) {
  const dx = card.left + card.width / 2 - (sheet.left + sheet.width / 2)
  const dy = card.top + card.height / 2 - (sheet.top + sheet.height / 2)
  return `translate(${dx}px, ${dy}px) scale(${card.width / sheet.width}, ${card.height / sheet.height})`
}

/* ── the plans ── */

export function runPlan(plan: Plan, from: Scene, to: Scene, c: Choreography, ctx: TransitionContext) {
  switch (plan) {
    case 'enter-reading':
      return enterReading(to, c, ctx)
    case 'exit-reading':
      return exitReading(from, to, c, ctx)
    case 'reading-to-archive':
      return readingToArchive(c, ctx)
    case 'fade-into-reading':
      return fadeIntoReading(c, ctx)
    case 'swap-reading':
      return swapReading(c, ctx)
    default:
      return Promise.resolve()
  }
}

/**
 * portal → read. The card settles flat and lifts toward the camera; the
 * full-screen sheet takes its place at the card's exact size; the sheet
 * unfolds to the edges while the photograph dims away and the card's
 * words glide to where the article prints them.
 */
async function enterReading(to: Scene, c: Choreography, ctx: TransitionContext) {
  const s = ctx.stage()
  const card = findCard(s.rig, to.slug)
  if (!card || !s.reader || !s.sheet) return fadeIntoReading(c, ctx)

  const heads = FLIP_KEYS.map((key) => part(s.reader, key))
  const revealEls = reveals(s.root)

  // hold the room exactly as it was while the card settles
  const sheetHold = c.hold(s.sheet, { opacity: 0 })
  const headHolds = heads.map((head) => c.hold(head, { opacity: 0 }))
  const revealHolds = revealEls.map((el) => c.hold(el, { opacity: 0 }))
  const roomHolds = [s.backdrop, s.atmos, s.deep].map((el) => c.hold(el, { opacity: 1 }))
  const shadowHold = c.hold(s.shadow, { opacity: 1 })

  if (ctx.reduced) {
    c.drop(sheetHold)
    await c.animate(s.sheet, [{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: 'ease' })
    ;[...roomHolds, shadowHold, ...headHolds, ...revealHolds].forEach((hold) => c.drop(hold))
    await Promise.all(
      [...heads, ...revealEls].map((el) =>
        c.animate(el, [{ opacity: 0, offset: 0 }], { duration: 360, easing: 'ease' })
      )
    )
    return
  }

  c.animate(card.querySelector('[data-cta]'), [{ opacity: 0 }], { duration: 220, easing: EASE.in })
  await (ctx.engine ? ctx.engine.settle() : c.wait(160))
  if (!ctx.alive()) return

  const sheetRect = s.sheet.getBoundingClientRect()
  const cardRect = card.getBoundingClientRect()
  const flips = FLIP_KEYS.map((key, i) => {
    const head = heads[i]
    const source = part(card, key)
    return head && source
      ? placeOver(source.getBoundingClientRect(), head.getBoundingClientRect())
      : null
  })

  const D = 1050
  c.drop(sheetHold)
  c.animate(
    s.sheet,
    [
      { opacity: 1, transform: sheetOver(cardRect, sheetRect) },
      { opacity: 1, transform: 'none' },
    ],
    { duration: D, easing: EASE.camera }
  )
  heads.forEach((head, i) => {
    c.drop(headHolds[i])
    const from = flips[i]
    if (from) {
      c.animate(head, [{ opacity: 1, transform: from }, { opacity: 1, transform: 'none' }], {
        duration: D,
        easing: EASE.camera,
      })
    } else {
      c.animate(head, [{ opacity: 0, offset: 0 }], { duration: 600, delay: D * 0.6, easing: EASE.out })
    }
  })
  c.drop(shadowHold)
  c.animate(s.shadow, [{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'ease-out' })
  ;[s.backdrop, s.atmos, s.deep].forEach((el, i) => {
    c.drop(roomHolds[i])
    c.animate(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 820, delay: 120, easing: EASE.fade })
  })

  await c.wait(D * 0.72)
  if (!ctx.alive()) return
  revealEls.forEach((el, i) => {
    c.drop(revealHolds[i])
    c.animate(el, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], {
      duration: 900,
      delay: i * 80,
      easing: EASE.out,
    })
  })
  await c.wait(D * 0.28 + 900)
}

/**
 * read → portal. The words that aren't on the cover leave; the page
 * folds back down to the card's size while the photograph returns, and
 * — if the title page is still in view — the title travels back onto
 * the card. Then the card lets go of its lifted pose and hangs again.
 */
async function exitReading(from: Scene, to: Scene, c: Choreography, ctx: TransitionContext) {
  const s = ctx.stage()
  const card = findCard(s.rig, to.slug)
  const heads = FLIP_KEYS.map((key) => part(s.reader, key))
  const revealEls = reveals(s.root)
  const cardParts = card
    ? Array.from(card.querySelectorAll<HTMLElement>('[data-flip], [data-cta]'))
    : []
  const headerInView = window.scrollY < window.innerHeight * 0.35
  const morph = !ctx.reduced && !!card && from.slug === to.slug && headerInView

  const sheetHold = c.hold(s.sheet, { opacity: 1, transform: 'none' })
  const roomHolds = [s.backdrop, s.atmos, s.deep].map((el) => c.hold(el, { opacity: 0 }))
  const shadowHold = c.hold(s.shadow, { opacity: 0 })
  const partHolds = cardParts.map((el) => c.hold(el, { opacity: 0 }))

  // 1. everything that isn't going back onto the card leaves first
  const leaving = morph ? revealEls : [...revealEls, ...heads]
  await Promise.all(
    leaving.map((el) =>
      c.animate(el, [{ opacity: 0 }], { duration: ctx.reduced ? 200 : 320, easing: EASE.in })
    )
  )
  if (!ctx.alive()) return

  if (ctx.reduced || !card || !s.sheet) {
    ;[...roomHolds, shadowHold, ...partHolds].forEach((hold) => c.drop(hold))
    c.drop(sheetHold)
    c.hold(s.reader, { opacity: 0 })
    await c.animate(s.sheet, [{ opacity: 1 }, { opacity: 0 }], { duration: 380, easing: 'ease' })
    return
  }

  // 2. the page folds back down to the card
  const sheetRect = s.sheet.getBoundingClientRect()
  const cardRect = card.getBoundingClientRect()
  const D = 980
  c.drop(sheetHold)
  c.animate(
    s.sheet,
    [
      { opacity: 1, transform: 'none' },
      { opacity: 1, transform: sheetOver(cardRect, sheetRect) },
    ],
    { duration: D, easing: EASE.camera }
  )
  if (morph) {
    heads.forEach((head, i) => {
      const target = part(card, FLIP_KEYS[i])
      if (!head || !target) return
      c.animate(
        head,
        [
          { transform: 'none' },
          { transform: placeOver(target.getBoundingClientRect(), head.getBoundingClientRect()) },
        ],
        { duration: D, easing: EASE.camera }
      )
    })
  }
  ;[s.backdrop, s.atmos, s.deep].forEach((el, i) => {
    c.drop(roomHolds[i])
    c.animate(el, [{ opacity: 0, offset: 0 }], { duration: 900, delay: 160, easing: EASE.fade })
  })
  c.drop(shadowHold)
  c.animate(s.shadow, [{ opacity: 0, offset: 0 }], { duration: 520, delay: D - 340, easing: EASE.out })

  await c.wait(D)
  if (!ctx.alive()) return

  // 3. the page is a card again
  c.hold(s.reader, { opacity: 0 })
  c.hold(s.sheet, { opacity: 0 })
  cardParts.forEach((el, i) => {
    c.drop(partHolds[i])
    const travelled = morph && el.hasAttribute('data-flip')
    if (!travelled) {
      c.animate(el, [{ opacity: 0, offset: 0 }], { duration: 560, delay: i * 70, easing: EASE.out })
    }
  })
  ctx.engine?.setMode('portal')
  await c.wait(morph ? 480 : 720)
}

/** read → archive. The page recedes into the dark and the room comes back around it. */
async function readingToArchive(c: Choreography, ctx: TransitionContext) {
  const s = ctx.stage()
  const heads = FLIP_KEYS.map((key) => part(s.reader, key))
  const revealEls = reveals(s.root)
  const sheetHold = c.hold(s.sheet, { opacity: 1, transform: 'none' })
  const roomHolds = [s.backdrop, s.atmos].map((el) => c.hold(el, { opacity: 0 }))
  const archiveHold = c.hold(s.archive, { opacity: 0 })

  await Promise.all(
    [...revealEls, ...heads].map((el) =>
      c.animate(el, [{ opacity: 0 }], { duration: 320, easing: EASE.in })
    )
  )
  if (!ctx.alive()) return

  c.hold(s.reader, { opacity: 0 })
  c.drop(sheetHold)
  c.animate(
    s.sheet,
    [
      { opacity: 1, transform: 'none' },
      { opacity: 0, transform: ctx.reduced ? 'none' : 'scale(0.97)' },
    ],
    { duration: ctx.reduced ? 360 : 900, easing: EASE.camera }
  )
  ;[s.backdrop, s.atmos].forEach((el, i) => {
    c.drop(roomHolds[i])
    c.animate(el, [{ opacity: 0, offset: 0 }], {
      duration: ctx.reduced ? 360 : 1100,
      delay: 120,
      easing: EASE.fade,
    })
  })
  await c.wait(ctx.reduced ? 160 : 620)
  c.drop(archiveHold)
  c.animate(s.archive, [{ opacity: 0, offset: 0 }], {
    duration: ctx.reduced ? 300 : 1000,
    easing: EASE.out,
  })
  await c.wait(ctx.reduced ? 300 : 1000)
}

/** anywhere → read without a card to unfold (history jumps, missing card) */
async function fadeIntoReading(c: Choreography, ctx: TransitionContext) {
  const s = ctx.stage()
  const heads = FLIP_KEYS.map((key) => part(s.reader, key))
  const words = [...heads, ...reveals(s.root)]
  const wordHolds = words.map((el) => c.hold(el, { opacity: 0 }))
  const roomHolds = [s.backdrop, s.atmos, s.deep].map((el) => c.hold(el, { opacity: 1 }))
  const sheetHold = c.hold(s.sheet, { opacity: 0 })

  c.drop(sheetHold)
  c.animate(s.sheet, [{ opacity: 0 }, { opacity: 1 }], { duration: 700, easing: EASE.fade })
  ;[s.backdrop, s.atmos, s.deep].forEach((el, i) => {
    c.drop(roomHolds[i])
    c.animate(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 700, easing: EASE.fade })
  })
  await c.wait(ctx.reduced ? 200 : 420)
  words.forEach((el, i) => {
    c.drop(wordHolds[i])
    c.animate(
      el,
      ctx.reduced
        ? [{ opacity: 0, offset: 0 }]
        : [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
      { duration: 800, delay: i * 70, easing: EASE.out }
    )
  })
  await c.wait(900)
}

/** one article straight to another — the text simply rests and returns */
async function swapReading(c: Choreography, ctx: TransitionContext) {
  const s = ctx.stage()
  const hold = c.hold(s.reader, { opacity: 0 })
  window.scrollTo({ top: 0, behavior: 'instant' })
  await c.wait(ctx.reduced ? 0 : 120)
  c.drop(hold)
  await c.animate(s.reader, [{ opacity: 0, offset: 0 }], { duration: 600, easing: EASE.out })
}
