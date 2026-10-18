import type { ReactNode } from 'react'
import { WorldForming } from '@/components/WorldForming'

/** Flip to false to open the Elsewhere world back up. */
const LOCKED = true

export default function DriftLayout({ children }: { children: ReactNode }) {
  if (LOCKED) return <WorldForming name="Elsewhere" accent="#FFC061" />
  return children
}
