import type { ReactNode } from 'react'
import { THOUGHT_ENTRIES } from '@/content/thoughts'
import { ThoughtsExperience } from './_components/ThoughtsExperience'

/**
 * The layout persists across /thoughts, /thoughts/[slug] and
 * /thoughts/[slug]/read — so the experience it holds never unmounts
 * while you move between the archive, a thought, and its reading.
 * (There is deliberately no template.tsx in this segment.)
 */
export default function ThoughtsLayout({ children }: { children: ReactNode }) {
  return <ThoughtsExperience thoughts={THOUGHT_ENTRIES}>{children}</ThoughtsExperience>
}
