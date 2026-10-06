/**
 * Guards the copy rules for content/beats.json:
 *  - every line is at most 5 words
 *  - dialogue lines appear verbatim in the canonical story
 *  - every `source` index exists in the matching chapter
 * Run: npm run story:beats
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const beats = JSON.parse(readFileSync(join(here, '../content/beats.json'), 'utf8'))
const story = readFileSync(join(here, '../../../content/thoughts/03-sunday-morning.ts'), 'utf8')
const sections = JSON.parse(story.slice(story.indexOf('['), story.indexOf('] as const') + 1)) as { id: string; paragraphs: string[] }[]
// The story's 'the-phone' + 'three-years' are one chapter here.
const merged: Record<string, string[]> = {}
for (const s of sections) {
  const id = s.id === 'three-years' ? 'the-phone' : s.id
  merged[id] = [...(merged[id] ?? []), ...s.paragraphs]
}
let problems = 0
const fail = (m: string) => { problems++; console.error('✗', m) }
for (const ch of beats.chapters) {
  const paras = merged[ch.id]
  if (!paras) { fail(`${ch.id}: no such chapter in the story`); continue }
  for (const b of ch.beats) {
    for (const line of b.lines) {
      const words = line.replace(/\*/g, '').split(/\s+/).filter(Boolean).length
      if (words > 5) fail(`${b.id}: ${words} words — "${line}"`)
    }
    for (const i of b.source) if (!paras[i]) fail(`${b.id}: source paragraph ${i} missing`)
    if (b.kind === 'dialogue' || b.kind === 'thought') {
      const text = b.lines.join(' ')
      for (const q of text.match(/“[^”]+”|"[^"]+"|\*[^*]+\*/g) ?? [])
        if (!b.source.some((i: number) => paras[i]?.includes(q))) fail(`${b.id}: not verbatim — ${q}`)
    }
  }
}
const count = beats.chapters.reduce((n: number, c: { beats: unknown[] }) => n + c.beats.length, 0)
console.log(problems ? `${problems} problem(s)` : `beats ok — ${beats.chapters.length} chapter(s), ${count} beats`)
process.exit(problems ? 1 : 0)
