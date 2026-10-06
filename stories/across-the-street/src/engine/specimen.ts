/**
 * Visual-system specimen (Checkpoint B): tokens in both palettes with a
 * live --distress slider, the type scale, every sprite and part, and both
 * Scene A compositions. Mounted with `?story=specimen`.
 */
import { SPRITE_DATA } from '../art/compiled.ts'
import { INKS } from '../art/palette.ts'
import { flatDesktop, flatMobile } from '../scenes/flat.ts'
import type { SceneDef } from '../scenes/types.ts'
import { chromeMarkup } from './chrome.ts'
import { BEATS, beatMarkup } from './copy.ts'
import { sunbeamMarkup } from './sunbeam.ts'
import { pathsMarkup, sceneMarkup, SVG_NS } from './svg.ts'

const STYLE = `
[data-ats][data-view=specimen]{min-height:100svh;padding:72px var(--gutter) 120px;}
[data-view=specimen] .spec{max-width:1240px;margin:0 auto;display:grid;gap:72px}
[data-view=specimen] .spec h1{font:400 clamp(2.5rem,6vw,4.5rem)/1 var(--font-story);letter-spacing:-.03em;margin:0}
[data-view=specimen] .spec h2{font:italic 400 1.5rem/1 var(--font-accent);color:var(--line);margin:0 0 20px}
[data-view=specimen] .spec .note{font:400 .9375rem/1.4 var(--font-story);max-width:62ch;margin:8px 0 0}
[data-view=specimen] .swatches{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
[data-view=specimen] .sw{border:2px solid var(--line);background:var(--cloud)}
[data-view=specimen] .sw i{display:block;height:64px;border-bottom:2px solid var(--line)}
[data-view=specimen] .sw b{display:block;font:500 .875rem/1.3 var(--font-story);padding:8px 10px 0}
[data-view=specimen] .sw code{display:block;font:400 .75rem/1.5 ui-monospace,monospace;padding:0 10px 8px}
[data-view=specimen] .slider{display:flex;gap:16px;align-items:center;font:italic 1.125rem var(--font-accent);margin-top:20px}
[data-view=specimen] .slider input{width:min(420px,60vw);accent-color:var(--line)}
[data-view=specimen] .type{display:grid;gap:28px}
[data-view=specimen] .type .row{display:grid;grid-template-columns:140px 1fr;gap:16px;align-items:baseline;border-top:2px solid var(--line);padding-top:14px}
[data-view=specimen] .type .meta{font:400 .75rem/1.4 ui-monospace,monospace}
[data-view=specimen] .sheet{display:flex;flex-wrap:wrap;gap:24px;align-items:flex-end}
[data-view=specimen] .sprite{display:grid;gap:8px;justify-items:start}
[data-view=specimen] .sprite figcaption{font:400 .75rem/1.3 ui-monospace,monospace;max-width:220px}
[data-view=specimen] .sprite svg{display:block;background:var(--cloud);outline:2px dashed color-mix(in oklab,var(--line),transparent 70%)}
[data-view=specimen] .scenes{display:grid;gap:32px;grid-template-columns:auto auto;align-items:start;justify-content:start}
[data-view=specimen] .scenes figure{margin:0;display:grid;gap:8px}
[data-view=specimen] .scenes svg{display:block;border:2px solid var(--line)}
[data-view=specimen] .pill-row{display:flex;gap:24px;align-items:center;flex-wrap:wrap}
[data-view=specimen] .pill-row .ats-back{position:static}
[data-view=specimen] .pill-row .ats-menu{position:static;border:2px dashed transparent}
@media (max-width:767px){[data-view=specimen] .type .row{grid-template-columns:1fr}[data-view=specimen] .scenes{grid-template-columns:1fr}}
`

const SCALE = 2

function spriteFigure(name: string, part: string) {
  const d = SPRITE_DATA[name]
  return `<figure class="sprite"><svg xmlns="${SVG_NS}" viewBox="0 0 ${d.w} ${d.h}" width="${d.w * SCALE}" height="${d.h * SCALE}" shape-rendering="crispEdges" role="img" aria-label="${d.label}">${pathsMarkup(d.parts[part])}</svg>` +
    `<figcaption>${name}${part === 'base' ? '' : '.' + part} · ${d.w}×${d.h}</figcaption></figure>`
}

function sceneFigure(def: SceneDef, s: number, caption: string) {
  const { x, y, w, h } = def.safe
  const markup = sceneMarkup(def, sunbeamMarkup(def, 0.12)).replace(/ data-hidden/g, ' style="display:none"').replace('class="ats-sunbeam"', 'opacity=".75"')
  return `<figure><svg xmlns="${SVG_NS}" viewBox="${x} ${y} ${w} ${h}" width="${w * s}" height="${h * s}" shape-rendering="crispEdges" role="img" aria-label="${caption}">` +
    `<rect x="0" y="0" width="${def.canvas.w}" height="${def.canvas.h}" fill="var(--sky)"/>${markup}</svg>` +
    `<figcaption class="note">${caption}</figcaption></figure>`
}

export function mountSpecimen(root: HTMLElement) {
  root.dataset.view = 'specimen'
  const swatch = (ink: string) => `<div class="sw"><i style="background:var(--${ink})"></i><b>--${ink}</b><code data-hex="${ink}"></code></div>`
  const chapter = BEATS.chapters[0]
  const sprites = Object.entries(SPRITE_DATA)
    .filter(([name]) => !name.startsWith('flat-shell'))
    .flatMap(([name, d]) => Object.keys(d.parts).map((part) => spriteFigure(name, part)))
  root.innerHTML = `<style>${STYLE}</style><main class="spec">
    <header><h1>${BEATS.title}</h1><p class="note">Visual system: tokens, type, drawings. Every drawing is compiled from code on a logical pixel grid and filled only with the tokens below.</p></header>

    <section aria-labelledby="t-tokens"><h2 id="t-tokens">Tokens</h2>
      <div class="swatches">${INKS.map(swatch).join('')}</div>
      <label class="slider">calm <input type="range" min="0" max="1" step="0.01" value="0" data-distress> dead <output data-distress-out>0.00</output></label>
      <p class="note">The Stain chapter drains the same colours toward a flat dead beige and a dull grey-blue by animating one number, <code>--distress</code>. All text pairs stay ≥ 4.5:1 across the range.</p>
    </section>

    <section aria-labelledby="t-type" class="type"><h2 id="t-type">Type</h2>
      <div class="row"><span class="meta">Story · BDO Grotesk 400<br>var(--story-size) / 1.2 / −0.02em</span>${beatMarkup(chapter.beats[0])}</div>
      <div class="row"><span class="meta">Inner voice · Instrument Serif Italic</span>${beatMarkup(chapter.beats[6])}</div>
      <div class="row"><span class="meta">Dialogue · same voice as prose</span><p class="ats-copy"><span class="line">“Look what you did.”</span><span class="line">Marcus glanced down.</span><span class="line">“It’s coffee.”</span></p></div>
      <div class="row"><span class="meta">Chapter names · serif italic</span><p class="ats-accent" style="font-size:2rem;margin:0">${BEATS.chapters[0].title} · Across the Street · The Knock · The Stain</p></div>
      <div class="row"><span class="meta">Hints · one word</span><p class="ats-hint" style="margin:0;display:flex;gap:32px">${Object.values(BEATS.ui.hints).map((h) => `<span>${h}</span>`).join('')}</p></div>
      <div class="row"><span class="meta">Chrome</span><div class="pill-row">${chromeMarkup()}</div></div>
    </section>

    <section aria-labelledby="t-scenes"><h2 id="t-scenes">Scene A: Marcus's flat</h2>
      <div class="scenes">${sceneFigure(flatDesktop, 1, 'Desktop composition, 640×360 grid, ×1')}${sceneFigure(flatMobile, 1, 'Mobile composition, 180×320 grid, ×1')}</div>
    </section>

    <section aria-labelledby="t-sprites"><h2 id="t-sprites">Drawings (×${SCALE})</h2><div class="sheet">${sprites.join('')}</div></section>
  </main>`

  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!
  const toHex = (css: string) => {
    ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = css; ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')
  }
  const hexes = () => root.querySelectorAll<HTMLElement>('[data-hex]').forEach((el) => {
    const probe = document.createElement('i')
    probe.style.color = `var(--${el.dataset.hex})`
    root.append(probe)
    el.textContent = toHex(getComputedStyle(probe).color)
    probe.remove()
  })
  const input = root.querySelector<HTMLInputElement>('[data-distress]')!
  const out = root.querySelector<HTMLOutputElement>('[data-distress-out]')!
  const onInput = () => { root.style.setProperty('--distress', input.value); out.textContent = Number(input.value).toFixed(2); hexes() }
  input.addEventListener('input', onInput)
  hexes()
  return {
    destroy() {
      input.removeEventListener('input', onInput)
      root.replaceChildren()
      delete root.dataset.view
      delete root.dataset.ats
      root.style.removeProperty('--distress')
    },
  }
}
