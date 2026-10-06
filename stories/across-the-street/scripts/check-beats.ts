/**
 * Guards the copy rules for content/beats.json:
 *  - every line is at most 5 words and 30 characters (fits a 360-px phone at 20 px)
 *  - every beat has at most 6 lines (fits the mobile sheet)
 *  - every quoted chunk (“…”, *…*) appears verbatim in its source paragraphs
 *    (curly/straight quotes are equal; a quote may span lines, or run on
 *    into the next beat without a closing mark)
 *  - every `source` index exists in the matching chapter
 *  - beat ids are unique and every hint names a known hint
 * Run: npm run story:beats
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const beats = JSON.parse(readFileSync(join(here, '../content/beats.json'), 'utf8'))
const story = readFileSync(join(here, '../../../content/thoughts/03-sunday-morning.ts'), 'utf8')
const sections = JSON.parse(story.slice(story.indexOf('['), story.indexOf('] as const') + 1)) as { id: string; paragraphs: string[] }[]
// 'the-phone' + 'three-years' are one chapter here; three-years starts at index 22.
const merged: Record<string, string[]> = {}
for (const s of sections) {
  const id = s.id === 'three-years' ? 'the-phone' : s.id
  merged[id] = [...(merged[id] ?? []), ...s.paragraphs]
}
const norm = (s: string) => s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim()

let problems = 0
const fail = (m: string) => { problems++; console.error('✗', m) }
const ids = new Set<string>()
const hints = new Set(Object.keys(beats.ui.hints))
for (const ch of beats.chapters) {
  const paras = merged[ch.id]
  if (!paras) { fail(`${ch.id}: no such chapter in the story`); continue }
  for (const b of ch.beats) {
    if (ids.has(b.id)) fail(`${b.id}: duplicate id`)
    ids.add(b.id)
    if (b.hint && !hints.has(b.hint)) fail(`${b.id}: unknown hint "${b.hint}"`)
    if (b.lines.length > 6) fail(`${b.id}: ${b.lines.length} lines (max 6)`)
    for (const line of b.lines) {
      const plain = line.replace(/[*]/g, '')
      const words = plain.replace(/[“”"]/g, '').split(/\s+/).filter(Boolean).length
      if (words > 5) fail(`${b.id}: ${words} words — "${line}"`)
      if (plain.length > 30) fail(`${b.id}: ${plain.length} chars — "${line}"`)
    }
    for (const i of b.source) if (paras[i] === undefined) fail(`${b.id}: source paragraph ${i} missing`)
    const src = norm(b.source.map((i: number) => paras[i] ?? '').join(' '))
    const text = b.lines.join(' ').replace(/\*\s+\*/g, ' ')
    const chunks = [...text.matchAll(/“([^”]*)(?:”|$)/g)].map((m) => m[1])
      .concat([...text.matchAll(/\*([^*]+)\*/g)].map((m) => `*${m[1]}*`))
    for (const q of chunks) if (!src.includes(norm(q))) fail(`${b.id}: not verbatim — ${q}`)
  }
}
const count = beats.chapters.reduce((n: number, c: { beats: unknown[] }) => n + c.beats.length, 0)
console.log(problems ? `${problems} problem(s)` : `beats ok — ${beats.chapters.length} chapters, ${count} beats`)
process.exit(problems ? 1 : 0)
