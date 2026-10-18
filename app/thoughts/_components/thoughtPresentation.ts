import type { CSSProperties } from 'react'
import type { ThoughtEntry } from '@/content/thoughts/helpers'

// The existing index palette; shared by cards, articles and server metadata.
export const THOUGHT_COLORS = ['#2D4BDB', '#6A4CD6', '#C9471F', '#167A68', '#2A3A9E', '#B03A78']

function channels(color: string) {
  return [1, 3, 5].map((offset) => parseInt(color.slice(offset, offset + 2), 16) / 255)
}
function luminance(rgb: number[]) {
  return rgb.reduce((sum, channel, index) => sum +
    (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4) * [0.2126, 0.7152, 0.0722][index], 0)
}
function blend(rgb: number[], white: number) {
  return rgb.map((channel) => white + channel * (1 - white))
}

/** Keep requested translucency unless white text would fall below 4.5:1. */
export function readableOpacity(color: string | undefined, preferred: number, surface = 0): number {
  if (!color || !/^#[\da-f]{6}$/i.test(color)) return preferred
  const rgb = blend(channels(color), surface)
  for (let percent = Math.round(preferred * 100); percent <= 100; percent++) {
    const opacity = percent / 100
    if ((luminance(blend(rgb, opacity)) + 0.05) / (luminance(rgb) + 0.05) >= 4.5) return opacity
  }
  return 1
}

/** White surfaces are capped so even their smallest white labels stay readable. */
export function readableSurface(color: string, preferred: number): number {
  for (let percent = Math.round(preferred * 100); percent >= 0; percent--) {
    if (1.05 / (luminance(blend(channels(color), percent / 100)) + 0.05) >= 4.5) return percent / 100
  }
  return 0
}

export function thoughtAccent(thought: ThoughtEntry, count: number): string {
  return thought.accent ?? THOUGHT_COLORS[((count - 1 - thought.index) % THOUGHT_COLORS.length + THOUGHT_COLORS.length) % THOUGHT_COLORS.length]
}

export function thoughtPageStyle(color: string): CSSProperties {
  const surface = readableSurface(color, 0.14)
  const pill = readableSurface(color, 0.18)
  const hover = readableSurface(color, 0.26)
  return {
    '--thought-color': color,
    '--muted': readableOpacity(color, 0.86),
    '--hook-opacity': readableOpacity(color, 0.9),
    '--body-opacity': readableOpacity(color, 0.95),
    '--caption-opacity': readableOpacity(color, 0.8),
    '--surface': surface,
    '--pill-surface': pill,
    '--hover-surface': hover,
    '--control-hover': readableSurface(color, 0.08),
    '--share-surface': readableSurface(color, 0.16),
    '--share-hover': readableSurface(color, 0.24),
    '--surface-muted': readableOpacity(color, 0.8, surface),
    '--placeholder-opacity': readableOpacity(color, 0.6, surface),
    '--pill-text': readableOpacity(color, 1, hover),
  } as CSSProperties
}

export function thoughtTransitionNames(slug: string) {
  return { card: `thought-${slug}-card`, title: `thought-${slug}-title`, art: `thought-${slug}-art` }
}

export function thoughtDate(date?: string) {
  if (!date) return undefined
  const [year, month, day] = date.split('-').map(Number)
  return new Intl.DateTimeFormat('en', {
    ...(day ? { weekday: 'long', day: 'numeric' } as const : {}),
    month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1)))
}
