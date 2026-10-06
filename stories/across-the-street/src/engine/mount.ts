/**
 * Framework-free entry point. The host (Next today, a Vite shell later)
 * gives us an element; we own everything inside it and clean up on destroy.
 *
 * Stage B scope: the visual system and Scene A, composed per layout,
 * static (no scroll logic yet).
 */
import { OLD_WINDOW } from '../art/old-building.ts'
import { SPRITE_DATA } from '../art/compiled.ts'
import { flatDesktop, flatMobile } from '../scenes/flat.ts'
import type { SceneDef } from '../scenes/types.ts'
import { chromeMarkup } from './chrome.ts'
import { BEATS, beatMarkup } from './copy.ts'
import { fitScene } from './fit.ts'
import { mountSpecimen } from './specimen.ts'
import { sunbeamMarkup } from './sunbeam.ts'
import { createSceneSVG, pathsMarkup, SVG_NS } from './svg.ts'

export type Layout = 'desktop' | 'mobile'
export interface StoryOptions { view?: 'story' | 'specimen'; progress?: number }
export interface StoryHandle { destroy(): void }

/** ≥1024 wide is desktop; 768–1023 follows orientation; below is mobile. */
export const layoutFor = (w: number, h: number): Layout => (w >= 1024 || (w >= 768 && w > h) ? 'desktop' : 'mobile')

/** Desktop copy lives on the open upper wall (safe-frame units). */
const WALL_COPY = { x: 26, y: -24, w: 266, h: 124 }

export function mountStory(root: HTMLElement, opts: StoryOptions = {}): StoryHandle {
  root.dataset.ats = ''
  if (opts.view === 'specimen') return mountSpecimen(root)

  let layout: Layout | null = null
  let cleanup = () => {}

  const build = () => {
    cleanup()
    layout = layoutFor(window.innerWidth, window.innerHeight)
    cleanup = layout === 'desktop' ? buildDesktop(root, opts) : buildMobile(root, opts)
  }
  build()

  const onResize = () => {
    if (layoutFor(window.innerWidth, window.innerHeight) !== layout) build()
  }
  window.addEventListener('resize', onResize)
  return {
    destroy() {
      window.removeEventListener('resize', onResize)
      cleanup()
      root.replaceChildren()
      delete root.dataset.ats
    },
  }
}

function stage(root: HTMLElement, def: SceneDef, layout: Layout, progress: number) {
  const chapter = BEATS.chapters[0]
  root.innerHTML = `<div class="ats-stage" data-layout="${layout}">
      <div class="ats-art"></div>
      <section class="ats-text" aria-labelledby="ch-${chapter.id}">
        <h2 id="ch-${chapter.id}" class="visually-hidden">${chapter.title}</h2>
        ${beatMarkup(chapter.beats[0])}
      </section>
    </div>${chromeMarkup()}`
  const art = root.querySelector<HTMLElement>('.ats-art')!
  const svg = createSceneSVG(def, `Marcus's flat on a Sunday morning`)
  const beam = svg.querySelector('[data-layer="sunbeam"]')
  if (beam) beam.innerHTML = sunbeamMarkup(def, progress)
  art.append(svg)
  return { art, svg, text: root.querySelector<HTMLElement>('.ats-text')! }
}

function frame(art: HTMLElement, svg: SVGSVGElement, def: SceneDef, alignY: number) {
  const box = art.getBoundingClientRect()
  const fit = fitScene(box.width, box.height, def.safe, window.devicePixelRatio || 1, alignY)
  svg.setAttribute('viewBox', `${fit.vb.x} ${fit.vb.y} ${fit.vb.w} ${fit.vb.h}`)
  return fit
}

function buildDesktop(root: HTMLElement, opts: StoryOptions) {
  const def = flatDesktop
  const { art, svg, text } = stage(root, def, 'desktop', opts.progress ?? 0.12)
  const copy = text.querySelector<HTMLElement>('.ats-copy')!
  copy.dataset.place = 'wall'
  const place = () => {
    const { s, vb } = frame(art, svg, def, 0.5)
    const x = (WALL_COPY.x + def.safe.x - vb.x) * s, y = (WALL_COPY.y + def.safe.y - vb.y) * s
    copy.style.setProperty('--copy-x', `${x}px`)
    copy.style.setProperty('--copy-y', `${Math.max(y, 56)}px`)
    copy.style.setProperty('--copy-w', `${WALL_COPY.w * s}px`)
    copy.style.setProperty('--copy-h', `${WALL_COPY.h * s - Math.max(0, 56 - y)}px`)
  }
  place()
  const ro = new ResizeObserver(place)
  ro.observe(art)
  return () => ro.disconnect()
}

function buildMobile(root: HTMLElement, opts: StoryOptions) {
  const def = flatMobile
  const { art, svg, text } = stage(root, def, 'mobile', opts.progress ?? 0.12)
  text.classList.add('ats-sheet')
  root.insertAdjacentHTML('beforeend', peripheralMarkup())
  const place = () => {
    const sheet = Math.round(Math.min(260, Math.max(200, window.innerHeight * 0.27)))
    root.style.setProperty('--sheet-h', `${sheet}px`)
    art.style.setProperty('--art-bottom', `${sheet}px`)
    frame(art, svg, def, 0.5)
  }
  place()
  const ro = new ResizeObserver(place)
  ro.observe(root)
  return () => ro.disconnect()
}

/** The old kitchen window, cropped from the same old-building sprite. */
function peripheralMarkup() {
  const data = SPRITE_DATA['old-building']
  const crop = { x: OLD_WINDOW.x - 4, y: OLD_WINDOW.y - 6, w: OLD_WINDOW.w + 8, h: OLD_WINDOW.h + 12 }
  const s = 2
  return `<figure class="ats-peripheral" aria-label="Across the road: his old kitchen window, a towel in the gap">` +
    `<svg xmlns="${SVG_NS}" viewBox="${crop.x} ${crop.y} ${crop.w} ${crop.h}" width="${crop.w * s}" height="${crop.h * s}" shape-rendering="crispEdges" aria-hidden="true">` +
    `<rect x="${crop.x}" y="${crop.y}" width="${crop.w}" height="${crop.h}" fill="var(--sky)"/>` +
    pathsMarkup(data.parts.base) + pathsMarkup(data.parts.towel) + `</svg></figure>`
}
