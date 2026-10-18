import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../app/thoughts/_components/sceneProgress.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } })
const { sectionThought, sceneStateAt, sectionHash } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)

test('section wrappers retain every canonical block, its order, identity and heading ID', () => {
  const body = [{ type: 'paragraph', text: 'preamble' }, { type: 'heading', id: 'one', text: 'One' }, { type: 'paragraph', text: 'one prose' }, { type: 'heading', text: 'Subheading' }, { type: 'heading', id: 'two', text: 'Two' }, { type: 'paragraph', text: 'two prose' }]
  const config = [{ id: 'two', theme: 'cool' }, { id: 'missing', theme: 'dark' }, { id: 'one', theme: 'warm' }]
  const sections = sectionThought(body, config)
  assert.deepEqual(sections.map(s => s.id), [null, 'one', 'two'])
  assert.deepEqual(sections.flatMap(s => s.blocks.map(({ index }) => index)), [0, 1, 2, 3, 4, 5])
  sections.flatMap(s => s.blocks).forEach(({ block, index }) => assert.equal(block, body[index]))
  assert.equal(sections[1].scene.theme, 'warm')
  assert.equal(sections[2].scene.theme, 'cool')
})

test('unconfigured headings receive safe defaults and duplicate IDs do not add another tracked scene', () => {
  const body = [{ type: 'heading', id: 'one', text: 'One' }, { type: 'heading', id: 'one', text: 'Repeated' }, { type: 'heading', id: 'two', text: 'Two' }]
  const sections = sectionThought(body, [])
  assert.deepEqual(sections.map(s => s.scene), [{ id: 'one' }, { id: 'two' }])
  assert.equal(sections[0].blocks.length, 2)
})

const bounds = Array.from({ length: 8 }, (_, i) => ({ id: `scene-${i}`, top: 1000 + i * 1300, bottom: 2300 + i * 1300 }))
const at = y => sceneStateAt(bounds, y, 1000)

test('slow scroll crosses each boundary once in canonical order, in both directions', () => {
  const seen = [], reverse = []
  for (let y = 0; y < 12000; y += 13) if (seen.at(-1) !== at(y).activeSceneId) seen.push(at(y).activeSceneId)
  for (let y = 12000; y >= 0; y -= 13) if (reverse.at(-1) !== at(y).activeSceneId) reverse.push(at(y).activeSceneId)
  assert.deepEqual(seen, bounds.map(b => b.id))
  assert.deepEqual(reverse, bounds.map(b => b.id).reverse())
})

test('fast jumps select the destination immediately, without replaying intervening scenes', () => {
  assert.equal(at(0).sceneIndex, 0)
  assert.equal(at(10000).sceneIndex, 7)
  assert.equal(at(2600).sceneIndex, 1)
  assert.equal(at(6200).previousSceneId, 'scene-3')
  assert.equal(at(6200).nextSceneId, 'scene-5')
})

test('reading-line boundary and progress are stable and clamped', () => {
  assert.equal(at(2019).activeSceneId, 'scene-0')
  assert.equal(at(2020).activeSceneId, 'scene-1')
  assert.equal(at(2020).sceneProgress, 0)
  assert.equal(at(2670).sceneProgress, .5)
  assert.equal(at(-1000).overallProgress, 0)
  assert.equal(at(999999).sceneProgress, 1)
  assert.equal(at(999999).overallProgress, 1)
  assert.equal(at(999999).nextSceneId, null)
  assert.equal(at(0).previousSceneId, null)
  assert.equal(sceneStateAt([], 0, 0).activeSceneId, null)
})

test('hash navigation accepts only canonical section IDs', () => {
  assert.equal(sectionHash('#scene-4', bounds.map(b => b.id)), 'scene-4')
  assert.equal(sectionHash('#scene%2D4', bounds.map(b => b.id)), 'scene-4')
  assert.equal(sectionHash('#not-a-scene', bounds.map(b => b.id)), null)
  assert.equal(sectionHash('#%ZZ', bounds.map(b => b.id)), null)
})

const chapterSource = await readFile(new URL('../app/thoughts/_components/chapterPresentation.ts', import.meta.url), 'utf8')
const chapterJS = ts.transpileModule(chapterSource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
const { chapterPresentationAt, BASE_MOOD } = await import(`data:text/javascript;base64,${Buffer.from(chapterJS).toString('base64')}`)
const chapters = [
  { id: 'room', mood: { ...BASE_MOOD, name: 'morning' }, layout: { focus: 'room' } },
  { id: 'street', intro: true, mood: { ...BASE_MOOD, name: 'recognition', background: '#dfe2dc', light: .66 }, layout: { focus: 'window' }, beats: [
    { id: 'recognize', match: 'old window', cues: { recognition: 1 } },
    { id: 'spill', match: 'mug', cues: { spill: 1 }, mood: { light: .42 } },
  ] },
  { id: 'later', theme: 'dim' },
]
const chapterBounds = [
  { id: 'room', top: 1000, bottom: 4000, readTop: 1100, beats: [] },
  { id: 'street', top: 4000, bottom: 7000, readTop: 4500, beats: [{ id: 'recognize', top: 5000 }, { id: 'spill', top: 6000 }] },
  { id: 'later', top: 7000, bottom: 9000, readTop: 7100, beats: [] },
]
const presentationAtLine = (line, direct = null) => chapterPresentationAt(chapterBounds, chapters, sceneStateAt(chapterBounds, line - 280, 1000), line - 280, 1000, direct)

test('mood begins before the chapter threshold, continues through intro, and settles before reading', () => {
  assert.equal(presentationAtLine(3300).focus, 0)
  const approach = presentationAtLine(3800), intro = presentationAtLine(4200), read = presentationAtLine(4500)
  assert.ok(approach.focus > 0 && approach.focus < intro.focus)
  assert.equal(intro.phase, 'intro')
  assert.equal(read.phase, 'read')
  assert.equal(read.focus, 1)
  assert.equal(read.mood.light, .66)
  assert.ok(Math.abs(presentationAtLine(3999).focus - presentationAtLine(4000).focus) < .002)
})

test('fast jumps and reverse scroll derive cumulative cues without leaking them to later chapters', () => {
  assert.deepEqual(presentationAtLine(6500).cues, { recognition: 1, spill: 1 })
  assert.equal(presentationAtLine(6500).mood.light, .42)
  assert.deepEqual(presentationAtLine(5200).cues, { recognition: 1 })
  assert.equal(presentationAtLine(5200).mood.light, .66)
  assert.deepEqual(presentationAtLine(4700).cues, {})
  assert.deepEqual(presentationAtLine(7400).cues, {})
  assert.equal(presentationAtLine(7400).mood.name, 'placeholder')
  for (let i = 0; i < 5; i++) {
    assert.equal(presentationAtLine(4200).phase, 'intro')
    assert.equal(presentationAtLine(4600).phase, 'read')
  }
})

test('direct chapter navigation skips intro presentation and starts in the settled mood', () => {
  const state = presentationAtLine(4100, 'street')
  assert.equal(state.phase, 'read')
  assert.equal(state.focus, 1)
  assert.equal(state.mood.background, '#dfe2dc')
  assert.deepEqual(state.cues, {})
})

test('configured canonical beats match uniquely without rewriting or omitting prose', async () => {
  const source = await readFile(new URL('../content/thoughts/03-sunday-morning.ts', import.meta.url), 'utf8')
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  const { default: thought, SUNDAY_MORNING_SCENES: scenes } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
  const sections = sectionThought(thought.body, scenes)
  for (const section of sections) for (const beat of section.scene.beats ?? []) {
    assert.equal(section.blocks.filter(({ block }) => block.type === 'paragraph' && block.text.includes(beat.match)).length, 1, beat.id)
  }
  assert.ok(thought.body.some(block => block.text === '*What if I ruin all of this?*'))
  assert.equal(scenes.filter(scene => scene.mood).length, 3)
  assert.equal(scenes.filter(scene => scene.intro).length, 2)
  assert.equal(scenes.find(scene => scene.id === 'the-stain').mood, undefined)
})

test('The Knock is a cumulative intrusion state with knowledge, shame and rug handoff beats', async () => {
  const source = await readFile(new URL('../content/thoughts/03-sunday-morning.ts', import.meta.url), 'utf8')
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  const { SUNDAY_MORNING_SCENES: scenes } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
  const across = scenes.find(scene => scene.id === 'across-the-street')
  const knock = scenes.find(scene => scene.id === 'the-knock')
  assert.equal(across.visual, 'across-the-street-photo')
  assert.equal(knock.visual, 'apartment')
  assert.equal(knock.intro, true)
  assert.equal(knock.layout.density, 'tight')
  assert.ok(knock.mood.exposure < across.mood.exposure)
  assert.ok(knock.mood.contrast > across.mood.contrast)
  assert.ok(knock.mood.light < across.mood.light)
  const knockBounds = [{ id: knock.id, top: 1000, bottom: 5000, readTop: 1500, beats: [
    { id: 'two-hours', top: 2200 }, { id: 'shame', top: 3000 }, { id: 'there-you-are', top: 3800 },
  ] }]
  const atLine = line => chapterPresentationAt(knockBounds, [knock], sceneStateAt(knockBounds, line - 280, 1000), line - 280, 1000)
  assert.deepEqual(atLine(1800).cues, {})
  assert.deepEqual(atLine(2400).cues, { knowledge: 1, still: 1 })
  assert.deepEqual(atLine(3200).cues, { knowledge: 1, still: 1, shame: 1 })
  assert.deepEqual(atLine(4000).cues, { knowledge: 1, still: 1, shame: 1, rugFocus: 1 })
  assert.ok(atLine(4000).mood.light < atLine(3200).mood.light)
})

test('reduced motion settles atmosphere immediately while keeping intro/read semantics', () => {
  const reduced = line => chapterPresentationAt(chapterBounds, chapters, sceneStateAt(chapterBounds, line - 280, 1000), line - 280, 1000, null, true)
  assert.equal(reduced(3800).mood.name, 'morning')
  assert.equal(reduced(3800).focus, 0)
  assert.equal(reduced(4200).phase, 'intro')
  assert.equal(reduced(4200).mood.light, .66)
  assert.equal(reduced(4200).focus, 1)
  assert.equal(reduced(6500).mood.light, .42)
})
