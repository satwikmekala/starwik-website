/**
 * Compiles every drawing in src/art (grid maps + stair-stepped primitives)
 * into merged SVG path data: src/art/generated/sprites.json.
 *
 *   npm run story:art            # once
 *   npm run story:art -- --stats # with cell/rect counts
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CORE, LATE } from '../src/art/index.ts'
import { toPaths } from '../src/art/lib/paths.ts'
import { render } from '../src/art/lib/sprite.ts'

const here = dirname(fileURLToPath(import.meta.url))
const stats = process.argv.includes('--stats')
const seen = new Set<string>()

function compile(list: typeof CORE, file: string) {
const out = join(here, '../src/art/generated', file)
const result: Record<string, unknown> = {}
let total = 0
for (const def of list) {
  if (seen.has(def.name)) throw new Error(`duplicate sprite name: ${def.name}`)
  seen.add(def.name)
  const parts: Record<string, unknown> = {}
  for (const part of Object.keys(def.parts)) {
    const paths = toPaths(render(def, part))
    const rects = paths.reduce((n, [, d]) => n + (d.match(/M/g)?.length ?? 0), 0)
    total += rects
    if (stats) console.log(`${def.name}.${part}`.padEnd(32), `${rects} rects`)
    parts[part] = paths
  }
  result[def.name] = { w: def.w, h: def.h, label: def.label, parts }
}
mkdirSync(dirname(out), { recursive: true })
const json = JSON.stringify(result)
writeFileSync(out, json + '\n')
console.log(`${file}: ${list.length} sprites, ${total} rects, ${(json.length / 1024).toFixed(1)} KB`)
}
compile(CORE, 'sprites.json')
compile(LATE, 'sprites-late.json')
