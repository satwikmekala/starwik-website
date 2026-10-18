import type { ThoughtBlock, ThoughtScene } from '@/content/thoughts/types'

export interface StorySection {
  id: string | null
  title: string | null
  blocks: Array<{ block: ThoughtBlock; index: number }>
  scene: ThoughtScene | null
}

/** Group references to canonical blocks. Configuration never reorders or copies prose. */
export function sectionThought(body: readonly ThoughtBlock[], config: readonly ThoughtScene[]): StorySection[] {
  const intents = new Map(config.map((scene) => [scene.id, scene]))
  const seen = new Set<string>()
  const sections: StorySection[] = []
  for (const [index, block] of body.entries()) {
    const id = block.type === 'heading' && block.id && !seen.has(block.id) ? block.id : null
    if (id) {
      seen.add(id)
      sections.push({ id, title: block.type === 'heading' ? block.text : null, blocks: [], scene: intents.get(id) ?? { id } })
    } else if (!sections.length) {
      sections.push({ id: null, title: null, blocks: [], scene: null })
    }
    sections[sections.length - 1].blocks.push({ block, index })
  }
  return sections
}

export interface SceneBounds { id: string; top: number; bottom: number }
export interface SceneState {
  activeSceneId: string | null
  /** Canonical neighbor, independent of scroll direction or skipped scenes. */
  previousSceneId: string | null
  nextSceneId: string | null
  sceneIndex: number
  sceneProgress: number
  overallProgress: number
}

const clamp = (value: number) => Math.max(0, Math.min(1, value))

/** A reading line 28% down the viewport selects the last section it has crossed.
 * Cached document coordinates make jumps/reverse scrolling independent of events.
 */
export function sceneStateAt(bounds: readonly SceneBounds[], scrollY: number, viewportHeight: number): SceneState {
  if (!bounds.length) return { activeSceneId: null, previousSceneId: null, nextSceneId: null, sceneIndex: -1, sceneProgress: 0, overallProgress: 0 }
  const line = Math.max(0, scrollY) + Math.max(0, viewportHeight) * .28
  let lo = 0, hi = bounds.length - 1
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2)
    if (bounds[mid].top <= line) lo = mid
    else hi = mid - 1
  }
  const current = bounds[lo]
  const end = bounds[lo + 1]?.top ?? current.bottom
  const first = bounds[0].top
  return {
    activeSceneId: current.id,
    previousSceneId: bounds[lo - 1]?.id ?? null,
    nextSceneId: bounds[lo + 1]?.id ?? null,
    sceneIndex: lo,
    sceneProgress: clamp((line - current.top) / Math.max(1, end - current.top)),
    overallProgress: clamp((line - first) / Math.max(1, bounds[bounds.length - 1].bottom - first)),
  }
}

export function sectionHash(hash: string, ids: readonly string[]): string | null {
  try {
    const id = decodeURIComponent(hash.replace(/^#/, ''))
    return ids.includes(id) ? id : null
  } catch { return null }
}
