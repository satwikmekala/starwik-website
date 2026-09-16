/**
 * Where we are, derived from the URL.
 *
 *   /thoughts                     archive — the room of marks
 *   /thoughts/[slug]              portal  — the paper floating in the photograph
 *   /thoughts/[slug]/read         read    — the paper has become the page
 *
 * The URL is the only source of truth for the view, so browser back /
 * forward and deep links behave exactly like any other page.
 */

import { useSyncExternalStore } from 'react'

export type View = 'archive' | 'portal' | 'read' | 'missing'

export interface Scene {
  view: View
  slug: string | null
}

export const hrefs = {
  archive: '/thoughts',
  portal: (slug: string) => `/thoughts/${slug}`,
  read: (slug: string) => `/thoughts/${slug}/read`,
}

export function parseScene(pathname: string, slugs: readonly string[]): Scene {
  const parts = pathname.split('/').filter(Boolean)
  if (parts[0] !== 'thoughts') return { view: 'missing', slug: null }
  if (parts.length === 1) return { view: 'archive', slug: null }

  let slug = parts[1]
  try {
    slug = decodeURIComponent(slug)
  } catch {
    return { view: 'missing', slug: null }
  }
  if (!slugs.includes(slug)) return { view: 'missing', slug: null }
  if (parts.length === 2) return { view: 'portal', slug }
  if (parts.length === 3 && parts[2] === 'read') return { view: 'read', slug }
  return { view: 'missing', slug: null }
}

export const sceneKey = (scene: Scene) => `${scene.view}:${scene.slug ?? ''}`

/** where the quiet "back" control of each view leads */
export function parentHref(scene: Scene): string {
  if (scene.view === 'read' && scene.slug) return hrefs.portal(scene.slug)
  if (scene.view === 'portal' || scene.view === 'missing') return hrefs.archive
  return '/'
}

/* ── the experience store ──────────────────────────────────────
   A tiny external store for state that must change in response to
   navigation (which React state can't do without an effect) — read
   with useSyncExternalStore, written from effects and handlers. */

export interface ExperienceState {
  /** the thought selected in the archive — survives trips into a thought */
  selected: string | null
  /** the article held in the DOM, so it can fold back into its card */
  readerSlug: string | null
  /** false until the first navigation — the arrival choreography only plays once */
  navigated: boolean
}

export interface ExperienceStore {
  get: () => ExperienceState
  set: (patch: Partial<ExperienceState>) => void
  subscribe: (listener: () => void) => () => void
}

export function createExperienceStore(initial: ExperienceState): ExperienceStore {
  let state = initial
  const listeners = new Set<() => void>()
  return {
    get: () => state,
    set(patch) {
      const next = { ...state, ...patch }
      const changed = (Object.keys(next) as Array<keyof ExperienceState>).some(
        (key) => next[key] !== state[key]
      )
      if (!changed) return
      state = next
      listeners.forEach((listener) => listener())
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}

export function useExperienceState(store: ExperienceStore) {
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}
