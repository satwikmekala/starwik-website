'use client'

/**
 * The reading — the sheet of paper, grown to become the page.
 *
 * The title page mirrors the card's composition at full size, so the
 * card's words can travel straight into place. Everything after it is
 * a quiet literary column: a narrow measure, generous rhythm, and the
 * same hand-made marks as the room outside.
 */

import { Fragment, type ReactNode, type Ref } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll } from 'framer-motion'
import type { ThoughtEntry } from '@/content/thoughts/helpers'
import type { ThoughtBlock } from '@/content/thoughts/types'
import { HandArrow, HandStroke } from './HandStroke'
import { hrefs } from './scene'
import { handStroke } from './strokes'
import styles from './reader.module.css'

interface ReaderProps {
  thought: ThoughtEntry
  next: ThoughtEntry
  ref?: Ref<HTMLElement>
  /** fades the title page in on its own — used when a visitor lands directly on the article */
  entrance: boolean
}

/** *words* → <em>words</em>; nothing else is interpreted */
function inline(text: string): ReactNode[] {
  return text.split(/(\*[^*]+\*)/g).map((part, index) =>
    part.length > 2 && part.startsWith('*') && part.endsWith('*') ? (
      <em key={index}>{part.slice(1, -1)}</em>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    )
  )
}

const IMAGE_SIZES = {
  column: '(min-width: 760px) 640px, 100vw',
  wide: '(min-width: 1180px) 1080px, 100vw',
  full: '100vw',
}

function Block({ block, index }: { block: ThoughtBlock; index: number }) {
  switch (block.type) {
    case 'paragraph':
      return <p className={styles.paragraph}>{inline(block.text)}</p>
    case 'heading':
      return <h2 className={styles.heading}>{inline(block.text)}</h2>
    case 'quote':
      return (
        <figure className={styles.quote}>
          <blockquote className={styles.quoteText}>
            <p>{inline(block.text)}</p>
          </blockquote>
          {block.cite && <figcaption className={styles.quoteCite}>— {block.cite}</figcaption>}
        </figure>
      )
    case 'break':
      return (
        <div role="separator" className={styles.break}>
          <HandStroke stroke={handStroke({ length: 46, seed: 400 + index, weight: 1.9, bow: 1.6 })} />
        </div>
      )
    case 'image': {
      const width = block.width ?? 'column'
      return (
        <figure className={styles.figure} data-width={width}>
          <div className={styles.frame} style={{ aspectRatio: block.aspectRatio ?? '3 / 2' }}>
            <Image
              src={block.src}
              alt={block.alt}
              fill
              sizes={IMAGE_SIZES[width]}
              className={styles.figureImage}
              style={{ objectPosition: block.position ?? 'center' }}
            />
          </div>
          {block.caption && <figcaption className={styles.caption}>{block.caption}</figcaption>}
        </figure>
      )
    }
  }
}

export function Reader({ thought, next, ref, entrance }: ReaderProps) {
  const { scrollYProgress } = useScroll()

  return (
    <>
      <div className={styles.progress} aria-hidden="true" data-reveal>
        <motion.div className={styles.progressFill} style={{ scaleX: scrollYProgress }} />
      </div>

      <article
        ref={ref}
        className={styles.reader}
        aria-labelledby="thought-title"
        data-entrance={entrance ? '' : undefined}
      >
        <header className={styles.titlePage}>
          <p className={styles.kicker} data-flip="kicker">
            {thought.number} / thought
          </p>
          <h1 id="thought-title" className={styles.title} data-flip="title" tabIndex={-1}>
            <span className={styles.titleInner}>
              {thought.titleLines.map((words, index) => (
                <span key={index} className={styles.titleLine}>
                  {words}
                </span>
              ))}
            </span>
          </h1>
          {thought.subtitleLines.length > 0 && (
            <p className={styles.subtitle} data-flip="subtitle">
              {thought.subtitleLines.map((words, index) => (
                <span key={index} className={styles.subtitleLine}>
                  {words}
                </span>
              ))}
            </p>
          )}
          <div className={styles.meta} data-reveal>
            <HandStroke
              className={styles.metaRule}
              stroke={handStroke({ length: 58, seed: thought.index + 71, weight: 1.6, bow: 1.4, hook: 1.2 })}
            />
            <p className={styles.metaLine}>
              {thought.dateLabel && <time dateTime={thought.dateTime}>{thought.dateLabel}</time>}
              {thought.dateLabel && <span className={styles.metaDot} aria-hidden="true">·</span>}
              <span>{thought.readTimeLabel}</span>
            </p>
          </div>
          <div className={styles.cue} aria-hidden="true" data-reveal>
            <HandStroke stroke={handStroke({ length: 40, seed: 29, weight: 1.4, bow: 1.2, hook: 1 })} />
          </div>
        </header>

        <div className={styles.body} data-reveal>
          {thought.body.map((block, index) => (
            <Block key={index} block={block} index={index} />
          ))}
        </div>

        <footer className={styles.end} data-reveal>
          <HandStroke
            className={styles.endMark}
            stroke={handStroke({ length: 30, seed: 911 + thought.index, weight: 1.8, bow: 1.4 })}
          />
          <Link href={hrefs.portal(next.slug)} scroll={false} className={styles.next}>
            <span className={styles.nextLabel}>
              next thought <HandArrow className={styles.nextArrow} />
            </span>
            <span className={styles.nextTitle}>
              <span className={styles.nextNumber}>{next.number} /</span> {next.plainTitle}
            </span>
          </Link>
          <Link href={hrefs.archive} scroll={false} className={styles.returnLink}>
            return to thoughts
          </Link>
        </footer>
      </article>
    </>
  )
}
