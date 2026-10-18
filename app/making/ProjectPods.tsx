'use client'

import { createContext, useContext, useState, type ReactNode, type SyntheticEvent } from 'react'
import Link from 'next/link'
import { useMakingTransitions } from './MakingTransitions'
import type { Project, ProjectId } from './projects'
import styles from './making.module.css'

const HoverContext = createContext<{ active: ProjectId | null; setActive: (project: ProjectId | null) => void }>({ active: null, setActive: () => {} })
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

export function ProjectDuo({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ProjectId | null>(null)
  return (
    <HoverContext.Provider value={{ active, setActive }}>
      <div className={`${styles.duo}${active ? ` ${styles.hasActivePod}` : ''}`}>{children}</div>
    </HoverContext.Provider>
  )
}

export function ProjectPod({ project, children }: { project: Project; children: ReactNode }) {
  const { enter } = useMakingTransitions()
  const { active, setActive } = useContext(HoverContext)
  const updateFallback = (event: SyntheticEvent<HTMLAnchorElement>) => {
    if (!finePointer() || CSS.supports('selector(:has(*))')) return
    const duo = event.currentTarget.parentElement
    const focused = duo?.querySelector<HTMLElement>('[data-making-pod]:focus-visible')
    const hovered = duo?.querySelector<HTMLElement>('[data-making-pod]:hover')
    setActive((focused ?? hovered)?.dataset.makingPod as ProjectId | undefined ?? null)
  }

  return (
    <Link
      href={`/making/${project.id}`}
      scroll={false}
      className={`${styles.pod} ${styles[project.id]}`}
      data-making-pod={project.id}
      data-active={active === project.id || undefined}
      aria-label={`${project.name}, ${project.descriptor.replace(/\.$/, '')}, building. Enter.`}
      onPointerEnter={updateFallback}
      onPointerLeave={updateFallback}
      onFocus={updateFallback}
      onBlur={updateFallback}
      onNavigate={event => {
        const pod = document.querySelector<HTMLElement>(`[data-making-pod="${project.id}"]`)
        const motif = pod?.querySelector<SVGGraphicsElement>('[data-making-origin]')
        if (motif) {
          event.preventDefault()
          enter(project.id, motif.getBoundingClientRect())
        }
      }}
    >
      {children}
      <span className={styles.leaderLine} aria-hidden="true" />
      <div className={styles.specSheet}>
        <div className={styles.specRow}>
          <p className={styles.specLabel}>WHAT IT IS</p>
          <p className={styles.specBody}>{project.descriptor}</p>
        </div>
        <div className={styles.specRow}>
          <p className={styles.specLabel}>WHY I&apos;M MAKING IT</p>
          <p className={styles.specBody}>[one line, in your own words]</p>
        </div>
        <div className={styles.specRow}>
          <p className={styles.specLabel}>LATEST FROM THE BUILD</p>
          <p className={styles.specBody}>[date] · [latest log entry]</p>
        </div>
        <div className={styles.specRow}>
          <span className={styles.enterPill}>enter {project.name} <span aria-hidden="true">→</span></span>
        </div>
      </div>
    </Link>
  )
}
