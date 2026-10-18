'use client'

import type { CSSProperties, Ref } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { ThoughtEntry } from '@/content/thoughts/helpers'
import { ThoughtCardArt, thoughtCardType } from './ThoughtCardArt'
import { ArchiveDoodles, ArchiveTitleSpark } from './ArchiveDoodles'
import { hrefs } from './scene'
import { ThoughtTransitionLink } from './ThoughtTransitions'
import { THOUGHT_COLORS as COLORS, readableOpacity, thoughtTransitionNames } from './thoughtPresentation'
import styles from './thoughtsIndex.module.css'

interface ArchiveIndexProps {
  thoughts: ThoughtEntry[]
  interactive: boolean
  ref?: Ref<HTMLDivElement>
}

type CardSize = 'large' | 'medium' | 'tall' | 'wide' | 'small' | 'invitation'
interface Placement {
  column: number
  columns: number
  row: number
  rows: number
  size: CardSize
}

const SLOTS: Placement[] = [
  { column: 1, columns: 7, row: 1, rows: 2, size: 'large' },
  { column: 8, columns: 5, row: 1, rows: 1, size: 'medium' },
  { column: 8, columns: 5, row: 2, rows: 1, size: 'medium' },
  { column: 1, columns: 4, row: 3, rows: 2, size: 'tall' },
  { column: 5, columns: 8, row: 3, rows: 1, size: 'wide' },
  { column: 5, columns: 4, row: 4, rows: 1, size: 'small' },
]

/** Explicit lines preserve DOM order and close every row, including block tails. */
export function archivePlacements(count: number): Placement[] {
  const cards = Array.from({ length: count }, (_, index) => {
    const slot = index % 6
    const block = Math.floor(index / 6)
    const placement = { ...SLOTS[slot], row: SLOTS[slot].row + block * 4 }
    // Only the final block has an invitation. Close earlier blocks by
    // letting their sixth thought occupy the invitation's four columns.
    if (slot === 5 && index < count - 1) placement.columns = 8
    return placement
  })
  const remaining = count === 0 ? 0 : ((count - 1) % 6) + 1
  const base = count === 0 ? 0 : Math.floor((count - 1) / 6) * 4
  const invitation: Placement = { column: 1, columns: 12, row: base + 1, rows: 1, size: 'invitation' }
  if (remaining === 1) Object.assign(invitation, { column: 8, columns: 5, rows: 2 })
  if (remaining === 2) Object.assign(invitation, { column: 8, columns: 5, row: base + 2 })
  if (remaining === 3) Object.assign(invitation, { row: base + 3 })
  if (remaining === 4) Object.assign(invitation, { column: 5, columns: 8, row: base + 3, rows: 2 })
  if (remaining === 5) Object.assign(invitation, { column: 5, columns: 8, row: base + 4 })
  if (remaining === 6) Object.assign(invitation, { column: 9, columns: 4, row: base + 4 })
  return [...cards, invitation]
}

function placementStyle(placement: Placement, index: number, color?: string): CSSProperties {
  return {
    '--card-column': `${placement.column} / span ${placement.columns}`,
    '--card-row': `${placement.row} / span ${placement.rows}`,
    '--card-color': color,
    '--card-order': index,
    '--meta-opacity': readableOpacity(color, 0.86),
    '--description-opacity': readableOpacity(color, 0.92),
  } as CSSProperties
}

// The room's shared cover is a fallback, so it gets a motif. A distinct
// thought photograph replaces the motif without changing canonical data.
const FALLBACK_COVER = '/images/thoughts-midnight-notebook.jpg'

export function ArchiveIndex({ thoughts, interactive, ref }: ArchiveIndexProps) {
  const newestFirst = [...thoughts].reverse()
  const orderedThoughts = [...newestFirst]
  const featuredIndex = orderedThoughts.findIndex(thought => thought.slug === 'sunday-morning')
  if (featuredIndex > 0) {
    // Feature the illustrated story, exchanging slots with the newest thought.
    const featured = orderedThoughts[featuredIndex]
    orderedThoughts[featuredIndex] = orderedThoughts[0]
    orderedThoughts[0] = featured
  }
  const cardColors = new Map(orderedThoughts.map((thought, index) => [thought.slug, thought.accent ?? COLORS[index % COLORS.length]]))
  const loveIndex = orderedThoughts.findIndex(thought => thought.slug === 'superposition-of-love')
  const comfortableIndex = orderedThoughts.findIndex(thought => thought.slug === 'the-comfortable-version')
  if (loveIndex >= 0 && comfortableIndex >= 0) {
    const love = orderedThoughts[loveIndex]
    orderedThoughts[loveIndex] = orderedThoughts[comfortableIndex]
    orderedThoughts[comfortableIndex] = love
  }
  const placements = archivePlacements(orderedThoughts.length)
  const invitation = placements[orderedThoughts.length]

  return (
    <div ref={ref} className={styles.index} data-archive-index>
      <ArchiveDoodles interactive={interactive} />
      <nav className={styles.topRow} aria-label="thoughts navigation">
        <Link href="/" className={styles.back} tabIndex={interactive ? 0 : -1}>
          <span className={styles.backArrow} aria-hidden="true">←</span> wikverse
        </Link>
        <p className={styles.count}>{thoughts.length} thoughts so far</p>
      </nav>
      <header className={styles.header}>
        <div className={styles.headerCopy}>
          <p className={styles.introduction}>hi, I’m Satwik.<br />I like to sit on my terrace and think.</p>
        </div>
        <div className={styles.headerTitle}>
          <p className={styles.eyebrow}>so here are my</p>
          <h1 className={styles.title}>thoughts<ArchiveTitleSpark /></h1>
        </div>
      </header>
      <ul className={styles.grid}>
        {orderedThoughts.map((thought, index) => {
          const placement = placements[index]
          const horizontal = placement.size !== 'large' && placement.size !== 'tall'
          const photo = thought.coverImage.src !== FALLBACK_COVER ? thought.coverImage : undefined
          const type = thoughtCardType(thought.slug, index)
          const names = thoughtTransitionNames(thought.slug)
          return (
            <li key={thought.slug} className={styles.item} style={placementStyle(placement, index, cardColors.get(thought.slug))}>
              <ThoughtTransitionLink
                href={hrefs.portal(thought.slug)}
                style={{ viewTransitionName: names.card }}
                scroll={false}
                className={styles.card}
                data-size={placement.size}
                data-horizontal={horizontal || undefined}
                data-photo={!!photo || undefined}
                data-archive-slug={thought.slug}
                tabIndex={interactive ? 0 : -1}
                aria-labelledby={`archive-title-${thought.slug}${thought.plainSubtitle ? ` archive-hook-${thought.slug}` : ''}`}
              >
                {photo && <>
                  <Image
                    src={photo.src}
                    alt=""
                    fill
                    sizes={`(max-width: 820px) 90vw, ${(placement.columns / 12 * 90).toFixed(1)}vw`}
                    className={styles.photo}
                    style={{ '--photo-position': photo.position ?? 'center', '--photo-mobile-position': photo.mobilePosition ?? photo.position ?? 'center' } as CSSProperties}
                  />
                  <span className={styles.scrim} aria-hidden="true" />
                </>}
                <span className={styles.meta} aria-hidden="true">
                  <span>{thought.number}</span>
                  {horizontal && <span> · </span>}
                  <span>{type}</span>
                </span>
                {!photo && <span className={styles.art} style={{ viewTransitionName: names.art }}>
                  {thought.slug === 'sunday-morning' ? <Image
                    src="/stories/across-the-street/card-art.svg"
                    alt=""
                    width={410}
                    height={190}
                    loading="eager"
                    className={styles.storyArt}
                  /> : <ThoughtCardArt slug={thought.slug} fallback={index} playful />}
                </span>}
                <span className={styles.copy}>
                  <span id={`archive-title-${thought.slug}`} className={styles.cardTitle} style={{ viewTransitionName: names.title }}>{thought.plainTitle}</span>
                  {thought.plainSubtitle && <span id={`archive-hook-${thought.slug}`} className={styles.description}>{thought.plainSubtitle}</span>}
                </span>
              </ThoughtTransitionLink>
            </li>
          )
        })}
        <li className={styles.item} style={placementStyle(invitation, newestFirst.length)}>
          <ThoughtTransitionLink
            href={newestFirst[0] ? hrefs.portal(newestFirst[0].slug) : hrefs.archive}
            scroll={false}
            className={`${styles.card} ${styles.invitation}`}
            data-size="invitation"
            data-horizontal={invitation.rows === 1 || undefined}
            tabIndex={interactive ? 0 : -1}
            aria-labelledby="archive-add-title archive-add-hook"
          >
            <span className={styles.art}><ThoughtCardArt slug="add-yours" /></span>
            <span className={styles.copy}>
              <span id="archive-add-title" className={styles.cardTitle}>add yours</span>
              <span id="archive-add-hook" className={styles.description}>leave one line in the margin of any thought. no account.</span>
            </span>
          </ThoughtTransitionLink>
        </li>
      </ul>
      <p className={styles.hint}>open a thought to read it</p>
    </div>
  )
}
