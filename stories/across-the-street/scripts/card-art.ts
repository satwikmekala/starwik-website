/** Export the archive vignette from the story's original sprites and palette. */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { SPRITES } from '../src/art/index.ts'
import { render } from '../src/art/lib/sprite.ts'
import { toPaths } from '../src/art/lib/paths.ts'
import { INKS, type Ink } from '../src/art/palette.ts'

const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8')
const colors = Object.fromEntries(INKS.map(ink => [ink, css.match(new RegExp(`--${ink}-calm:\\s*(#[0-9a-f]{6})`))![1]])) as Record<Ink, string>
const defs = Object.fromEntries(SPRITES.map(def => [def.name, def]))
const sprite = (name: string, parts: string[], x: number, y: number, scale = 1, palette = colors) =>
  `<g transform="translate(${x} ${y}) scale(${scale})">${parts.map(part =>
    toPaths(render(defs[name], part)).map(([ink, d]) => `<path fill="${palette[ink]}" d="${d}"/>`).join(''),
  ).join('')}</g>`

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 410 190" fill="none" shape-rendering="crispEdges">
  ${sprite('window', ['base'], 116, 8, 1.7)}
  ${sprite('plant', ['base'], 248, 75, 1.4, { ...colors, line: colors.cloud })}
</svg>`
const out = new URL('../../../public/stories/across-the-street/card-art.svg', import.meta.url)
writeFileSync(out, svg)
console.log(`Archive artwork → ${fileURLToPath(out)}`)
