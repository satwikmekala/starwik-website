'use client'

import type { CSSProperties } from 'react'
import Link from 'next/link'
import { useMakingTransitions } from './MakingTransitions'
import { SporeArrivalMotif, StackMotif } from './ProjectMotifs'
import type { Project } from './projects'
import styles from './making.module.css'

export function ProjectArrival({ project }: { project: Project }) {
  const { arrival, returnToMaking } = useMakingTransitions()
  return (
    <main className={`${styles.arrival} ${styles[project.id]}`} style={{ '--arrival-color': project.color, '--arrival-ink': project.ink } as CSSProperties} data-making-arrival-page={project.id}>
      <Link href="/making" className={styles.arrivalBack} scroll={false} onNavigate={event => {
        event.preventDefault()
        returnToMaking()
      }}>← the making</Link>
      <div className={styles.arrivalContent} data-arrival={arrival}>
        <p className={styles.arrivalMeta}>{project.number} · [date]</p>
        {project.id === 'spore' ? <SporeArrivalMotif /> : <StackMotif compact />}
        <h1 id="making-arrival-title" className={styles.arrivalTitle} tabIndex={-1}>{project.name}</h1>
        <p className={styles.arrivalDescriptor}>{project.descriptor}</p>
      </div>
    </main>
  )
}
