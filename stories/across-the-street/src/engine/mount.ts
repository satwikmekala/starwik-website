/**
 * Framework-free entry point. The host (Next today, a Vite shell later)
 * gives us an element; we own everything inside it and clean up on destroy.
 */
import { mountSpecimen } from './specimen.ts'
import { mountStoryView } from './story.ts'

export interface StoryOptions { view?: 'story' | 'specimen' }
export interface StoryHandle { destroy(): void }

export function mountStory(root: HTMLElement, opts: StoryOptions = {}): StoryHandle {
  root.dataset.ats = ''
  const inner = opts.view === 'specimen' ? mountSpecimen(root) : mountStoryView(root)
  return {
    destroy() {
      inner.destroy()
      delete root.dataset.ats
    },
  }
}
