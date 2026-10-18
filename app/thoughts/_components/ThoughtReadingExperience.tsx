'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { getExperienceKind } from '@/content/thoughts/helpers'
import { Reader, type ReaderProps } from './Reader'
import { SceneExperience } from './SceneExperience'
import { SundayMorningOpeningScene } from './SundayMorningOpeningScene'
import styles from './sceneExperience.module.css'

function StoryExperience(props: ReaderProps) {
  const [textOnly, setTextOnly] = useState(false)
  const restore = useRef<string | null>(null)
  const changeMode = (plain: boolean) => {
    const ids = props.thought.body.flatMap((block) => block.type === 'heading' && block.id ? [block.id] : [])
    restore.current = ids.filter((id) => (document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) <= innerHeight * .28).at(-1) ?? ids[0] ?? 'thought-title'
    history.replaceState(history.state, '', `${location.pathname}${location.search}#${restore.current}`)
    setTextOnly(plain)
  }
  useLayoutEffect(() => {
    if (!restore.current) return
    const heading = document.getElementById(restore.current)
    heading?.scrollIntoView({ block: 'start', behavior: 'instant' })
    heading?.setAttribute('tabindex', '-1')
    heading?.focus({ preventScroll: true })
  }, [textOnly])
  if (!textOnly) return props.thought.slug === 'sunday-morning'
    ? <SundayMorningOpeningScene {...props} onTextMode={() => changeMode(true)} />
    : <SceneExperience {...props} scenes={props.thought.experience.scenes ?? []} onTextMode={() => changeMode(true)} />
  return (
    <div className={styles.fallback}>
      <button className={styles.return} type="button" onClick={() => changeMode(false)}>return to scene view</button>
      <Reader {...props} entrance={false} />
    </div>
  )
}

/** Reading surfaces are independent of the artifact and its entry animation. */
const experiences = { reader: Reader, scenes: StoryExperience }

export function ThoughtReadingExperience(props: ReaderProps) {
  const Experience = experiences[getExperienceKind(props.thought)]
  return <Experience key={props.thought.slug} {...props} />
}
