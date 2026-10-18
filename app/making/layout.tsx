import type { ReactNode } from 'react'
import { WorldForming } from '@/components/WorldForming'
import { MakingTransitions } from './MakingTransitions'
import styles from './making.module.css'

/** Flip to false to open the making world back up. */
const LOCKED = true

export default function MakingLayout({ children }: { children: ReactNode }) {
  if (LOCKED) return <WorldForming name="The Making" accent="#45F0C6" />
  return <div className={styles.section}><MakingTransitions>{children}</MakingTransitions></div>
}
