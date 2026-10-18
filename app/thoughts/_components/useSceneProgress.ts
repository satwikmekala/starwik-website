'use client'

import { useLayoutEffect, useRef, useState, type RefObject } from 'react'
import type { ThoughtScene } from '@/content/thoughts/types'
import { sceneStateAt, sectionHash, type SceneState } from './sceneProgress'
import { chapterPresentationAt, moodVariables, type ChapterBounds } from './chapterPresentation'

let documentRestoreChecked = false
export type SceneIdentity = Omit<SceneState, 'sceneProgress' | 'overallProgress'>

/** React receives scene identities only. Phase, mood and art cues are cheap DOM
 * writes from cached bounds, never per-frame React state or layout reads. */
export function useSceneProgress(rootRef: RefObject<HTMLElement | null>, scenes: readonly ThoughtScene[], storyKey: string) {
  const initial = sceneStateAt(scenes.map(({ id }, i) => ({ id, top: i, bottom: i + 1 })), 0, 0)
  const [identity, setIdentity] = useState<SceneIdentity>(initial)
  const stateRef = useRef<SceneState>(initial)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || !scenes.length) return
    const ids = scenes.map(scene => scene.id)
    const elements = Array.from(root.querySelectorAll<HTMLElement>('[data-thought-scene]'))
    const measuredElements = elements.map(el => ({
      el, prose: el.querySelector<HTMLElement>('[data-chapter-prose]'),
      beats: Array.from(el.querySelectorAll<HTMLElement>('[data-scene-beat]')),
    }))
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const cueNames = new Set(scenes.flatMap(scene => scene.beats?.flatMap(beat => Object.keys(beat.cues ?? {})) ?? []))
    let bounds: ChapterBounds[] = []
    let frame = 0, dirty = true, disposed = false
    let active = stateRef.current.activeSceneId
    let viewportHeight = window.innerHeight
    let lastY = window.scrollY
    let resumeY: number | null = null
    let directScene: string | null = null
    const painted = new Map<string, string>()
    const storageKey = `thought-position:${storyKey}`
    const savePosition = () => {
      try { sessionStorage.setItem(storageKey, JSON.stringify({ y: lastY, hash: location.hash, directScene })) } catch { /* storage is optional */ }
    }
    if (!documentRestoreChecked) {
      documentRestoreChecked = true
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
      if (navigation?.type === 'reload' && new URL(navigation.name).pathname === location.pathname) {
        try {
          const saved = JSON.parse(sessionStorage.getItem(storageKey) ?? 'null')
          const y = typeof saved === 'number' && !location.hash ? saved : saved?.hash === location.hash ? saved.y : null
          if (typeof y === 'number' && Number.isFinite(y) && y > 0) {
            resumeY = y
            if (ids.includes(saved?.directScene)) directScene = saved.directScene
          }
        } catch { /* normal hash navigation remains available */ }
      }
    }
    const debug = process.env.NODE_ENV === 'development' && new URLSearchParams(location.search).has('sceneDebug')
    const debugEl = debug ? root.querySelector<HTMLElement>('[data-scene-debug]') : null
    if (debugEl) debugEl.hidden = false
    const paint = (name: string, value: string) => {
      if (painted.get(name) === value) return
      painted.set(name, value)
      root.style.setProperty(name, value)
    }
    const data = (name: string, value: string) => {
      if (root.dataset[name] !== value) root.dataset[name] = value
    }
    const update = () => {
      frame = 0
      if (disposed) return
      const room = root.closest<HTMLElement>('[data-thoughts-view]')
      if (room && room.dataset.thoughtsView !== 'read') return
      const y = window.scrollY
      lastY = y
      if (dirty) {
        viewportHeight = window.innerHeight
        bounds = measuredElements.map(({ el, prose, beats }) => {
          const rect = el.getBoundingClientRect()
          return {
            id: el.dataset.thoughtScene!, top: rect.top + y, bottom: rect.bottom + y,
            readTop: (prose?.getBoundingClientRect().top ?? rect.top) + y,
            beats: beats.map(beat => ({ id: beat.dataset.sceneBeat!, top: beat.getBoundingClientRect().top + y })),
          }
        })
        dirty = false
      }
      const next = sceneStateAt(bounds, y, viewportHeight)
      stateRef.current = next
      if (directScene && next.activeSceneId !== directScene) directScene = null
      const presentation = chapterPresentationAt(bounds, scenes, next, y, viewportHeight, directScene, reduced.matches)
      data('activeScene', next.activeSceneId ?? '')
      data('previousScene', next.previousSceneId ?? '')
      data('nextScene', next.nextSceneId ?? '')
      data('sceneIndex', String(next.sceneIndex))
      data('scenePhase', presentation.phase)
      data('sceneMood', presentation.mood.name)
      data('activeBeat', presentation.beat ?? '')
      elements.forEach((el, index) => {
        const phase = index === next.sceneIndex ? presentation.phase : index < next.sceneIndex ? 'read' : 'intro'
        if (el.dataset.phase !== phase) el.dataset.phase = phase
      })
      paint('--scene-progress', next.sceneProgress.toFixed(3))
      paint('--story-progress', next.overallProgress.toFixed(3))
      paint('--scene-focus', presentation.focus.toFixed(3))
      for (const [name, value] of Object.entries(moodVariables(presentation.mood))) paint(name, value)
      for (const name of cueNames) paint(`--cue-${name}`, String(presentation.cues[name] ?? 0))
      if (next.activeSceneId !== active) {
        active = next.activeSceneId
        setIdentity({ activeSceneId: next.activeSceneId, previousSceneId: next.previousSceneId, nextSceneId: next.nextSceneId, sceneIndex: next.sceneIndex })
      }
      if (debugEl) debugEl.textContent = `${next.sceneIndex + 1}/${ids.length} · ${next.activeSceneId} · ${presentation.phase} · ${presentation.mood.name} · ${presentation.beat ?? '—'}`
    }
    const schedule = () => { if (!frame && !disposed) frame = requestAnimationFrame(update) }
    const measure = () => { dirty = true; schedule() }
    const jumpToHash = () => {
      const id = sectionHash(location.hash, ids)
      if (id) {
        directScene = id
        const el = elements.find(el => el.dataset.thoughtScene === id)
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - window.innerHeight * .12, behavior: 'instant' })
      }
      dirty = true
      update()
    }
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    observer?.observe(root)
    elements.forEach(el => observer?.observe(el))
    reduced.addEventListener('change', schedule)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', measure)
    window.addEventListener('hashchange', jumpToHash)
    window.addEventListener('pageshow', measure)
    window.addEventListener('pagehide', savePosition)
    if (resumeY !== null) {
      window.scrollTo({ top: resumeY, behavior: 'instant' })
      update()
    } else jumpToHash()
    void document.fonts.ready.then(() => {
      if (disposed) return
      if (resumeY !== null) window.scrollTo({ top: resumeY, behavior: 'instant' })
      else if (directScene) jumpToHash()
      measure()
    })
    return () => {
      disposed = true
      savePosition()
      observer?.disconnect()
      cancelAnimationFrame(frame)
      reduced.removeEventListener('change', schedule)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', measure)
      window.removeEventListener('hashchange', jumpToHash)
      window.removeEventListener('pageshow', measure)
      window.removeEventListener('pagehide', savePosition)
      if (debugEl) debugEl.hidden = true
    }
  }, [rootRef, scenes, storyKey])
  return { identity, stateRef }
}
