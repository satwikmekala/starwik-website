'use client'

import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { ThoughtEntry } from '@/content/thoughts/helpers'
import type { ThoughtBlock } from '@/content/thoughts/types'
import { WikLogo } from '@/components/WikLogo'
import { ThoughtCardArt, thoughtCardType } from './ThoughtCardArt'
import { ThoughtMargin } from './ThoughtMargin'
import { ThoughtAudioPlayer } from './ThoughtAudioPlayer'
import { SuperpositionDoodles } from './SuperpositionDoodles'
import { MonkDoodles } from './MonkDoodles'
import { ThoughtTransitionLink, useThoughtArrival } from './ThoughtTransitions'
import { readableOpacity, thoughtAccent, thoughtDate, thoughtTransitionNames } from './thoughtPresentation'
import styles from './openThought.module.css'

function inline(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>
    return <Fragment key={index}>{part}</Fragment>
  })
}
function Photo({ src, alt, caption, aspectRatio = '3 / 2', position, unoptimized }: { src: string; alt: string; caption?: string; aspectRatio?: string; position?: string; unoptimized?: boolean }) {
  return <figure className={styles.photo}>
    <div className={styles.photoFrame} style={{ aspectRatio }}><Image src={src} alt={alt} fill loading="eager" unoptimized={unoptimized} sizes="(max-width: 640px) calc(100vw - 48px), 592px" style={{ objectFit: 'cover', objectPosition: position ?? 'center' }} /></div>
    {caption && <figcaption>{caption}</figcaption>}
  </figure>
}
function BodyBlock({ block }: { block: ThoughtBlock }) {
  switch (block.type) {
    case 'paragraph': return <p>{inline(block.text)}</p>
    case 'heading': {
      const Heading = block.level === 3 ? 'h3' : 'h2'
      return <Heading id={block.id}>{inline(block.text)}</Heading>
    }
    case 'quote': return <figure className={styles.quotation}><blockquote><p>{inline(block.text)}</p></blockquote>{block.cite && <figcaption>{block.cite}</figcaption>}</figure>
    case 'break': return <div className={styles.sectionBreak} role="separator" />
    case 'image': return <Photo {...block} />
  }
}

export function OpenThought({ thought, thoughts, readingAlias }: { thought: ThoughtEntry; thoughts: ThoughtEntry[]; readingAlias: boolean }) {
  const arrival = useThoughtArrival()
  const [toast, setToast] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fallback = thoughts.length - 1 - thought.index
  const type = thoughtCardType(thought.slug, fallback)
  const names = thoughtTransitionNames(thought.slug)
  const date = thoughtDate(thought.date)
  const older = thoughts[thought.index - 1]
  const newer = thoughts[thought.index + 1]

  useEffect(() => {
    if (readingAlias || window.location.hash) {
      const id = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : 'reading'
      document.getElementById(id)?.scrollIntoView({ behavior: 'instant' })
    }
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [readingAlias])

  function notify(message: string) {
    if (timer.current) clearTimeout(timer.current)
    setToast(message)
    timer.current = setTimeout(() => setToast(''), 2000)
  }
  async function share() {
    const url = `${window.location.origin}/thoughts/${thought.slug}`
    if (typeof navigator.share === 'function') {
      try { await navigator.share({ title: thought.plainTitle, text: thought.plainSubtitle, url }); return }
      catch (error) { if (error instanceof DOMException && error.name === 'AbortError') return }
    }
    try { await navigator.clipboard.writeText(url); notify('link copied') }
    catch { notify('could not copy the link. try again.') }
  }
  function leaveNote() {
    const form = document.getElementById('margin-note-form')
    form?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
    form?.querySelector('textarea')?.focus({ preventScroll: true })
  }

  return <main className={styles.page}>
    {thought.slug === 'superposition-of-love' && <SuperpositionDoodles />}
    {thought.slug === 'the-monk-i-live-with' && <MonkDoodles />}
    <article aria-labelledby="thought-title">
      <nav className={styles.controls} aria-label="thought controls">
        <ThoughtTransitionLink href="/thoughts" className={`${styles.control} ${styles.back}`}>← thoughts</ThoughtTransitionLink>
        <Link href="/" className={styles.logo} aria-label="wikverse home"><WikLogo starColor="#fff" textColor="#fff" style={{ width: 57, height: 28 }} aria-hidden="true" /></Link>
        <button type="button" className={`${styles.control} ${styles.add}`} aria-label="leave a note" onClick={leaveNote}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M12 5v14" /></svg></button>
        <button type="button" className={`${styles.control} ${styles.share}`} onClick={share}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m21 3-7 18-4-7-7-4 18-7ZM10 14 21 3" /></svg>share this thought</button>
      </nav>
      <header className={styles.hero} style={{ viewTransitionName: names.card }}>
        <div className={styles.heroStack}>
          {date && <time dateTime={thought.date} className={styles.date}>{date}</time>}
          <h1 id="thought-title" tabIndex={-1} className={styles.title} style={{ viewTransitionName: names.title }}>{thought.plainTitle}</h1>
          {thought.plainSubtitle && <p className={styles.hook}>{thought.plainSubtitle}</p>}
          <span className={styles.type}>{type}</span>
          <div className={styles.art} style={{ viewTransitionName: names.art }}><ThoughtCardArt slug={thought.slug} fallback={fallback} draw={arrival !== 'morph'} /></div>
        </div>
      </header>
      <section id="reading" className={styles.reading} aria-label="read the thought">
        {type === 'voice' && <ThoughtAudioPlayer />}
        {type === 'photo' && <Photo {...(thought.heroImage ?? thought.coverImage)} />}
        <div className={styles.body} data-thought-body>{thought.body.map((block, index) => <BodyBlock key={index} block={block} />)}</div>
        <ThoughtMargin />
      </section>
      <nav className={styles.neighbors} aria-label="more thoughts">
        {([{ entry: older, direction: 'older' }, { entry: newer, direction: 'newer' }] as const).map(({ entry, direction }) => {
          if (!entry) return null
          const accent = thoughtAccent(entry, thoughts.length)
          const neighborNames = thoughtTransitionNames(entry.slug)
          return <ThoughtTransitionLink key={entry.slug} href={`/thoughts/${entry.slug}`} className={styles.neighbor} style={{ background: accent, viewTransitionName: neighborNames.card }}>
            <span className={styles.neighborMeta} style={{ opacity: readableOpacity(accent, 0.86) }}><span>{entry.number} · {thoughtCardType(entry.slug, thoughts.length - 1 - entry.index)}</span><span>{direction === 'older' ? '← older' : 'newer →'}</span></span>
            <span className={styles.neighborTitle} style={{ viewTransitionName: neighborNames.title }}>{entry.plainTitle}</span>
          </ThoughtTransitionLink>
        })}
      </nav>
      <div role="status" aria-live="polite" aria-atomic="true" className={styles.toast}>{toast}</div>
    </article>
  </main>
}
