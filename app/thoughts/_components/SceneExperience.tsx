'use client'

import { memo, useCallback, useMemo, useRef, type ReactNode, type CSSProperties } from 'react'
import Link from 'next/link'
import type { ThoughtScene } from '@/content/thoughts/types'
import { Reader, ReaderBlock, type ReaderProps } from './Reader'
import { sectionThought, type StorySection } from './sceneProgress'
import { useSceneProgress } from './useSceneProgress'
import { BASE_MOOD, moodVariables } from './chapterPresentation'
import { hrefs } from './scene'
import reader from './reader.module.css'
import styles from './sceneExperience.module.css'

export interface SceneExperienceProps extends ReaderProps {
  scenes: readonly ThoughtScene[]
  opening?: ReactNode
  sceneVisuals?: Readonly<Record<string, ReactNode>>
  onTextMode?: () => void
}

/** The content boundary is reusable; an optional opening belongs to its consumer. */
export function SceneExperience(props: SceneExperienceProps) {
  const sections = useMemo(() => sectionThought(props.thought.body, props.scenes), [props.thought.body, props.scenes])
  if (!sections.some(({ id }) => id)) return <Reader {...props} />
  return <SceneArticle {...props} sections={sections} />
}

function SceneVisualLayer({ sections, active, visuals }: { sections: StorySection[]; active: number; visuals?: SceneExperienceProps['sceneVisuals'] }) {
  const current = sections[active]
  // Chapters can share one persistent environment instead of crossfading two rooms.
  const surfaces = sections.filter((section, index) => sections.findIndex(other =>
    (other.scene?.visual ?? other.id) === (section.scene?.visual ?? section.id)) === index)
  const activeVisual = current?.scene?.visual ?? current?.id
  return (
    <div className={styles.visualRail} aria-hidden="true">
      <div className={styles.visual} data-scene-visual data-transition={current?.scene?.transition ?? 'blend'}>
        {surfaces.map((section) => {
          const key = section.scene?.visual ?? section.id!
          return <div key={key} className={styles.surface} data-theme={section.scene?.theme ?? 'warm'} data-visible={key === activeVisual} data-illustrated={!!visuals?.[key] || undefined}>{visuals?.[key]}</div>
        })}
        <p className={styles.visualCaption}>{String(active + 1).padStart(2, '0')} / {String(sections.length).padStart(2, '0')}</p>
      </div>
    </div>
  )
}

const SceneTextLayer = memo(function SceneTextLayer({ sections, visuals }: { sections: StorySection[]; visuals?: SceneExperienceProps['sceneVisuals'] }) {
  return (
    <div className={`${reader.body} ${styles.text}`} data-scene-text>
      {sections.map(({ id, blocks, scene }, index) => {
        const heading = blocks[0]?.block.type === 'heading' ? blocks[0] : null
        const prose = heading ? blocks.slice(1) : blocks
        return <section key={id ?? `preamble-${index}`} className={styles.section}
          data-thought-scene={id ?? undefined} data-chapter-intro={scene?.intro || undefined}
          data-density={scene?.layout?.density} aria-labelledby={id ?? undefined}>
          {heading && <header className={styles.chapterTitle} data-chapter-title>
            {scene?.layout?.inlineVisual && <div className={styles.inlineVisual} data-inline-visual aria-hidden="true">
              {visuals?.[scene.visual ?? id!]}
            </div>}
            <ReaderBlock block={heading.block} index={heading.index} />
          </header>}
          <div data-chapter-prose className={styles.chapterProse}>
            {prose.map(({ block, index }) => {
              const beat = block.type === 'paragraph' ? scene?.beats?.find(beat => block.text.includes(beat.match)) : undefined
              return <div key={index} data-scene-beat={beat?.id} className={beat?.breathingRoom ? styles.quietBeat : undefined}>
                <ReaderBlock block={block} index={index} />
              </div>
            })}
          </div>
        </section>
      })}
    </div>
  )
})

function SceneArticle({ thought, next, ref, opening, sections, sceneVisuals, onTextMode }: SceneExperienceProps & { sections: StorySection[] }) {
  const root = useRef<HTMLElement | null>(null)
  const bind = useCallback((node: HTMLElement | null) => {
    root.current = node
    if (typeof ref === 'function') return ref(node)
    if (ref) ref.current = node
  }, [ref])
  const canonicalScenes = useMemo(() => sections.filter((section) => section.id !== null), [sections])
  const config = useMemo(() => canonicalScenes.map(({ scene, id }) => scene ?? { id: id! }), [canonicalScenes])
  const { identity } = useSceneProgress(root, config, thought.slug)

  return (
    <article ref={bind} className={`${reader.reader} ${styles.experience}`} aria-labelledby="thought-title" style={moodVariables(config[0]?.mood ?? BASE_MOOD) as CSSProperties} data-scene-experience data-sunday-opening={thought.slug === 'sunday-morning' ? '' : undefined}>
      <div className={styles.atmosphere} aria-hidden="true" />
      {opening ?? <header className={styles.simpleOpening}>
        <h1 id="thought-title" tabIndex={-1}>{thought.plainTitle}</h1>
      </header>}
      <div className={styles.story}>
        <div className={styles.tools}>
          <details className={styles.contents}>
            <summary>story sections</summary>
            <nav aria-label="story sections">
              {canonicalScenes.map(({ id, title }) => <a key={id} href={`#${id}`}>{title}</a>)}
            </nav>
          </details>
          {onTextMode && <button type="button" onClick={onTextMode}>read as text</button>}
        </div>
        <div className={styles.layout}>
          <SceneVisualLayer sections={canonicalScenes} active={identity.sceneIndex} visuals={sceneVisuals} />
          <SceneTextLayer sections={sections} visuals={sceneVisuals} />
        </div>
        <footer className={reader.end}>
          <Link href={hrefs.portal(next.slug)} scroll={false} className={reader.next}>
            <span className={reader.nextLabel}>next thought →</span>
            <span className={reader.nextTitle}>{next.plainTitle}</span>
          </Link>
          <Link href={hrefs.archive} scroll={false} className={reader.returnLink}>return to thoughts</Link>
        </footer>
      </div>
      {process.env.NODE_ENV === 'development' && <output className={styles.debug} data-scene-debug hidden aria-hidden="true" />}
    </article>
  )
}
