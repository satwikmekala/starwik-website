'use client'

import '@/stories/across-the-street/src/styles/tokens.css'
import '@/stories/across-the-street/src/styles/story.css'
import { useEffect, useRef } from 'react'
import { mountStory } from '@/stories/across-the-street/src/engine/mount.ts'

/**
 * Host for the framework-free "Across the Street" engine
 * (stories/across-the-street). React only provides the element and the
 * lifecycle; the engine owns everything inside it.
 */
export default function AcrossTheStreetStory({ view = 'story' }: { view?: 'story' | 'specimen' }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const story = mountStory(ref.current!, { view })
    return () => story.destroy()
  }, [view])
  return <div ref={ref} />
}
