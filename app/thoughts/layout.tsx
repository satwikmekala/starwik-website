import type { ReactNode } from 'react'
import { THOUGHT_ENTRIES } from '@/content/thoughts'
import { WorldForming } from '@/components/WorldForming'
import { ThoughtsExperience } from './_components/ThoughtsExperience'

/** Flip to false to open the thoughts world back up. */
const LOCKED = true

/**
 * The layout persists across /thoughts, /thoughts/[slug] and
 * /thoughts/[slug]/read — so the experience it holds never unmounts
 * while you move between the archive, a thought, and its reading.
 * (There is deliberately no template.tsx in this segment.)
 */
export default function ThoughtsLayout({ children }: { children: ReactNode }) {
  if (LOCKED) return <WorldForming name="thoughts" accent="#8F9BFF" />
  return <ThoughtsExperience thoughts={THOUGHT_ENTRIES}>{children}</ThoughtsExperience>
}
