'use client'

import { Suspense, useLayoutEffect, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { usePathname, useSearchParams } from 'next/navigation'
import type { ThoughtEntry } from '@/content/thoughts/helpers'
import { ArchiveIndex } from './ArchiveIndex'
import { OpenThought } from './OpenThought'
import { ThoughtTransitions, useThoughtArrival } from './ThoughtTransitions'
import { thoughtAccent, thoughtPageStyle } from './thoughtPresentation'
import indexStyles from './thoughtsIndex.module.css'
import styles from './openThought.module.css'

/**
 * "Across the Street" (sunday-morning) opens the illustrated story
 * (stories/across-the-street), server-rendered so the title and every line
 * arrive in the first HTML. ?story=old shows the previous article,
 * ?story=specimen the story's visual-system specimen.
 */
const AcrossTheStreetSSR = dynamic(() => import('./AcrossTheStreetSSR'))
const AcrossTheStreetStory = dynamic(() => import('./AcrossTheStreetStory'), { ssr: false })

function SundayMorningThought(props: { thought: ThoughtEntry; thoughts: ThoughtEntry[]; readingAlias: boolean }) {
  const flag = useSearchParams().get('story')
  if (flag === 'old') return <OpenThought {...props} />
  if (flag === 'specimen') return <AcrossTheStreetStory view="specimen" />
  return <AcrossTheStreetSSR />
}

interface ThoughtsExperienceProps {
  thoughts: ThoughtEntry[]
  children?: ReactNode
}

function ThoughtsView({ thoughts, children }: ThoughtsExperienceProps) {
  const pathname = usePathname()
  const arrival = useThoughtArrival()
  const thought = thoughts.find((entry) => entry.slug === pathname.split('/')[2])
  const archive = pathname === '/thoughts'
  const accent = thought ? thoughtAccent(thought, thoughts.length) : undefined

  useLayoutEffect(() => {
    const html = document.documentElement
    html.dataset.thoughts = archive ? 'archive' : 'open'
    if (accent) html.style.setProperty('--thought-page-color', accent)
    else html.style.removeProperty('--thought-page-color')
    return () => {
      delete html.dataset.thoughts
      html.style.removeProperty('--thought-page-color')
    }
  }, [archive, accent])

  return <div className={`${indexStyles.index} ${styles.shell}`} style={accent ? thoughtPageStyle(accent) : undefined} data-thoughts-shell data-thought-arrival={arrival}>
    {archive ? <ArchiveIndex thoughts={thoughts} interactive /> : thought ? thought.slug === 'sunday-morning'
      ? <Suspense key={thought.slug} fallback={<AcrossTheStreetSSR />}>
          <SundayMorningThought thought={thought} thoughts={thoughts} readingAlias={pathname.endsWith('/read')} />
        </Suspense>
      : <OpenThought key={thought.slug} thought={thought} thoughts={thoughts} readingAlias={pathname.endsWith('/read')} /> : null}
    {children}
  </div>
}

/** The layout persists so shared card snapshots survive client navigation. */
export function ThoughtsExperience(props: ThoughtsExperienceProps) {
  return <ThoughtTransitions><ThoughtsView {...props} /></ThoughtTransitions>
}
