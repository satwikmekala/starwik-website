import type { SceneMood, ThoughtScene } from '@/content/thoughts/types'
import type { SceneBounds, SceneState } from './sceneProgress'

export interface ChapterBounds extends SceneBounds {
  readTop: number
  beats: Array<{ id: string; top: number }>
}
export interface ChapterPresentation {
  phase: 'intro' | 'read'
  beat: string | null
  mood: SceneMood
  focus: number
  cues: Record<string, number>
}

export const BASE_MOOD: SceneMood = {
  name: 'placeholder', background: '#eee5d6', text: '#302b23', shadow: '#665b45',
  exposure: 1, contrast: 1, light: 1, vignette: 0, grain: .025,
}
const clamp = (n: number) => Math.max(0, Math.min(1, n))
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const color = (a: string, b: string, t: number) => {
  const channels = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
  return `rgb(${channels(a).map((n, i) => Math.round(mix(n, channels(b)[i], t))).join(', ')})`
}

function blend(a: SceneMood, b: SceneMood, t: number): SceneMood {
  return {
    name: b.name,
    background: color(a.background, b.background, t),
    text: color(a.text, b.text, t), shadow: color(a.shadow, b.shadow, t),
    exposure: mix(a.exposure, b.exposure, t), contrast: mix(a.contrast, b.contrast, t),
    light: mix(a.light, b.light, t), vignette: mix(a.vignette, b.vignette, t), grain: mix(a.grain, b.grain, t),
  }
}
const focusOf = (scene?: ThoughtScene) => scene?.layout?.focus === 'window' ? 1 : 0
function settled(scene?: ThoughtScene, beatCount = 0) {
  const mood = { ...(scene?.mood ?? BASE_MOOD) }
  const cues: Record<string, number> = {}
  for (const beat of scene?.beats?.slice(0, beatCount) ?? []) {
    Object.assign(mood, beat.mood)
    Object.assign(cues, beat.cues)
  }
  return { mood, cues }
}

/** Pure, position-derived presentation: jumps and reverse scroll never replay
 * a timeline. All coordinates are measured once per resize/content change. */
export function chapterPresentationAt(
  bounds: readonly ChapterBounds[], scenes: readonly ThoughtScene[], state: SceneState,
  y: number, viewportHeight: number, directScene: string | null = null, immediate = false,
): ChapterPresentation {
  const index = state.sceneIndex
  const scene = scenes[index]
  const current = bounds[index]
  if (!scene || !current) return { phase: 'read', beat: null, mood: BASE_MOOD, focus: 0, cues: {} }
  const line = y + viewportHeight * .28
  const direct = directScene === scene.id
  const phase = scene.intro && line < current.readTop && !direct ? 'intro' : 'read'
  const crossed = current.beats.filter(beat => beat.top <= line)
  const count = (scene.beats?.findIndex(beat => beat.id === crossed.at(-1)?.id) ?? -1) + 1
  const { mood, cues } = settled(scene, count)
  let focus = focusOf(scene)
  let result = mood
  const transitionStart = current.top - viewportHeight * .65
  if (!immediate && scene.intro && !direct && line < current.readTop && index > 0) {
    const previous = scenes[index - 1]
    const outgoing = settled(previous, previous.beats?.length).mood
    const t = clamp((line - transitionStart) / Math.max(1, current.readTop - transitionStart))
    result = blend(outgoing, mood, t)
    focus = mix(focusOf(previous), focus, t)
  } else if (!immediate) {
    const incoming = scenes[index + 1]
    const next = bounds[index + 1]
    if (incoming?.intro && next && line >= next.top - viewportHeight * .65) {
      const start = next.top - viewportHeight * .65
      const t = clamp((line - start) / Math.max(1, next.readTop - start))
      result = blend(mood, incoming.mood ?? BASE_MOOD, t)
      result.name = `${mood.name}-to-${incoming.mood?.name ?? 'placeholder'}`
      focus = mix(focus, focusOf(incoming), t)
    }
  }
  return { phase, beat: crossed.at(-1)?.id ?? null, mood: result, focus, cues }
}

export function moodVariables(mood: SceneMood): Record<string, string> {
  return {
    '--scene-bg': mood.background, '--scene-text': mood.text, '--scene-shadow': mood.shadow,
    '--scene-exposure': String(mood.exposure), '--scene-contrast': String(mood.contrast),
    '--scene-light': String(mood.light), '--scene-vignette': String(mood.vignette), '--scene-grain': String(mood.grain),
  }
}
