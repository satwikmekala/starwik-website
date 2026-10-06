import { SPRITE_DATA } from '../art/compiled.ts'
import type { InkPath } from '../art/lib/paths.ts'
import type { SceneDef } from '../scenes/types.ts'

export const SVG_NS = 'http://www.w3.org/2000/svg'

export const pathsMarkup = (paths: readonly InkPath[]) =>
  paths.map(([ink, d]) => `<path fill="var(--${ink})" d="${d}"/>`).join('')

/** One <g> per sprite placement, one nested <g data-part> per part. */
export function sceneMarkup(def: SceneDef, beam = '') {
  const { safe } = def
  return def.items.map((item) => {
    const data = SPRITE_DATA[item.sprite]
    if (!data) throw new Error(`unknown sprite ${item.sprite}`)
    const parts = item.parts ?? (data.parts.base ? ['base'] : Object.keys(data.parts).slice(0, 1))
    const x = item.canvas ? item.x : item.x + safe.x, y = item.canvas ? item.y : item.y + safe.y
    const a11y = item.label ? ` role="img" aria-label="${item.label}"` : ''
    const transform = item.flip ? `translate(${x + data.w} ${y}) scale(-1 1)` : `translate(${x} ${y})`
    return `<g data-item="${item.id}" transform="${transform}"${a11y}>` +
      parts.map((p) => `<g data-part="${p}"${item.hidden?.includes(p) ? ' data-hidden' : ''}>${pathsMarkup(data.parts[p] ?? [])}</g>`).join('') +
      `</g>` + (item.id === def.beamAfter ? `<g data-layer="sunbeam" class="ats-sunbeam">${beam}</g>` : '')
  }).join('')
}

export function createSceneSVG(def: SceneDef, label: string) {
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('class', 'ats-scene')
  svg.setAttribute('shape-rendering', 'crispEdges')
  svg.setAttribute('role', 'img')
  svg.setAttribute('aria-label', label)
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice')
  svg.dataset.scene = def.name
  const bleed = 4000
  svg.innerHTML = `<rect x="${-bleed}" y="${-bleed}" width="${bleed * 2 + def.canvas.w}" height="${bleed * 2 + def.canvas.h}" fill="var(--sky)"/>` +
    sceneMarkup(def)
  return svg
}
