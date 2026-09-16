/**
 * Pure helpers shared by the server routes and the client experience.
 * No content is imported here, so client components can use these
 * without pulling every article into the JavaScript bundle.
 */

import type { Thought, ThoughtBlock } from './types'

/** a thought with everything the interface derives from it, precomputed on the server */
export interface ThoughtEntry extends Thought {
  index: number
  /** title split on '\n' — cover and title page */
  titleLines: string[]
  /** title on a single line — annotations, metadata, links */
  plainTitle: string
  subtitleLines: string[]
  plainSubtitle?: string
  /** 'september 2026' */
  dateLabel?: string
  /** machine-readable date for <time> */
  dateTime?: string
  /** '6 min read' */
  readTimeLabel: string
  nextSlug: string
}

const WORDS_PER_MINUTE = 230

export function splitLines(text?: string): string[] {
  if (!text) return []
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export function joinLines(text: string): string {
  return splitLines(text).join(' ')
}

function blockText(block: ThoughtBlock): string {
  switch (block.type) {
    case 'paragraph':
    case 'heading':
      return block.text
    case 'quote':
      return `${block.text} ${block.cite ?? ''}`
    case 'image':
      return block.caption ?? ''
    default:
      return ''
  }
}

export function estimateReadTime(thought: Thought): string {
  const words = [thought.title, thought.subtitle ?? '', ...thought.body.map(blockText)]
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE))
  return `${minutes} min read`
}

/** '2026-09' → 'september 2026' (always formatted in UTC so it never drifts a month) */
export function formatDate(date?: string): { label: string; dateTime: string } | undefined {
  if (!date) return undefined
  const [year, month = 1, day = 1] = date.split('-').map(Number)
  if (!year) return undefined
  const utc = new Date(Date.UTC(year, month - 1, day))
  const label = new Intl.DateTimeFormat('en', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
    .format(utc)
    .toLowerCase()
  return { label, dateTime: date }
}

export function prepareThoughts(thoughts: Thought[]): ThoughtEntry[] {
  return thoughts.map((thought, index) => {
    const date = formatDate(thought.date)
    return {
      ...thought,
      index,
      titleLines: splitLines(thought.title),
      plainTitle: joinLines(thought.title),
      subtitleLines: splitLines(thought.subtitle),
      plainSubtitle: thought.subtitle ? joinLines(thought.subtitle) : undefined,
      dateLabel: date?.label,
      dateTime: date?.dateTime,
      readTimeLabel: thought.readTime ?? estimateReadTime(thought),
      nextSlug: thoughts[(index + 1) % thoughts.length].slug,
    }
  })
}
