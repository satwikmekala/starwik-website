'use client'

import '@/stories/across-the-street/src/styles/tokens.css'
import '@/stories/across-the-street/src/styles/story.css'
import { useEffect, useRef } from 'react'
import { preload } from 'react-dom'
import { storyMarkup } from '@/stories/across-the-street/src/engine/markup.ts'

/**
 * Server-rendered "Across the Street" (used when NEXT_PUBLIC_ATS_STORY=1):
 * the title and every line of the story are in the first HTML, so they
 * paint before any script; the engine loads afterwards and adopts the DOM.
 */
export default function AcrossTheStreetSSR() {
  const ref = useRef<HTMLDivElement>(null)
  for (const font of ['bdo-grotesk-regular', 'instrument-serif-italic'])
    preload(`/stories/across-the-street/fonts/${font}.woff2`, { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })
  useEffect(() => {
    let alive = true
    let story: { destroy(): void } | null = null
    import('@/stories/across-the-street/src/engine/mount.ts').then(({ mountStory }) => {
      if (alive && ref.current) story = mountStory(ref.current)
    })
    return () => { alive = false; story?.destroy() }
  }, [])
  return <div ref={ref} data-ats="" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: storyMarkup() }} />
}
