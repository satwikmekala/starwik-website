import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { THOUGHT_ENTRIES, getThought } from '@/content/thoughts'
import { thoughtAccent } from '../_components/thoughtPresentation'

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return THOUGHT_ENTRIES.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const thought = getThought((await params).slug)
  if (!thought) return {}
  return {
    title: `${thought.plainTitle} · thoughts`,
    description: thought.plainSubtitle,
    openGraph: { images: [(thought.heroImage ?? thought.coverImage).src] },
  }
}

export async function generateViewport({ params }: Props): Promise<Viewport> {
  const thought = getThought((await params).slug)
  return thought ? { themeColor: thoughtAccent(thought, THOUGHT_ENTRIES.length) } : {}
}

/** The persistent layout renders the article; /read opens its reading section. */
export default async function ThoughtPortalPage({ params }: Props) {
  if (!getThought((await params).slug)) notFound()
  return null
}
