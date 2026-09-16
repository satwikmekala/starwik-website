import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { THOUGHT_ENTRIES, getThought } from '@/content/thoughts'

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return THOUGHT_ENTRIES.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const thought = getThought((await params).slug)
  if (!thought) return {}
  return {
    title: `★wik — ${thought.plainTitle}`,
    description: thought.plainSubtitle,
    openGraph: { images: [thought.coverImage.src] },
  }
}

/** the floating card is drawn by the persistent experience in ../layout.tsx */
export default async function ThoughtPortalPage({ params }: Props) {
  if (!getThought((await params).slug)) notFound()
  return null
}
