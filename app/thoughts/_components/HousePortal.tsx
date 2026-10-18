'use client'

import { useEffect, useImperativeHandle, useRef } from 'react'
import Link from 'next/link'
import { HandArrow } from './HandStroke'
import type { DepthEngine } from './engine'
import { commitHouseEntry, runHousePlan, type HouseEntry } from './houseTransitions'
import { SundayRoom } from './SundayRoom'
import type { ThoughtPortalProps } from './portal'
import { measurePortalEntryGeometry } from './portalGeometry'
import { hrefs } from './scene'
import roomStyles from './experience.module.css'
import styles from './house.module.css'

/** A plaster apartment fragment. All materials are replaceable CSS layers. */
export function HousePortal({ thought, live, view, ref }: ThoughtPortalProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const motionRef = useRef<HTMLDivElement>(null)
  const entryRef = useRef<HTMLAnchorElement>(null)
  const windowRef = useRef<HTMLSpanElement>(null)
  const handoffRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<DepthEngine | null>(null)
  const entryRun = useRef<HouseEntry | null>(null)
  const getEntryGeometry = () => rootRef.current?.dataset.state === 'portal'
    ? measurePortalEntryGeometry(rootRef.current, windowRef.current) : null

  useEffect(() => () => entryRun.current?.choreography.release(), [])
  const interactive = view === 'archive' || view === 'portal'

  useImperativeHandle(ref, () => ({
    getEntryElement: (slug) => entryRef.current?.dataset.slug === slug ? entryRef.current : null,
    getRootElement: () => rootRef.current,
    getEntryTargetElement: () => windowRef.current,
    getEntryGeometry,
    attachDepth: (engine) => {
      engineRef.current = engine
      engine.attach({ artifact: motionRef.current, rig: null, shadow: null })
    },
    runTransition: (plan, from, to, choreography, context) => {
      const entry = entryRun.current
      if (to.view !== 'read') entry?.choreography.release()
      return runHousePlan(plan, to, choreography, context, rootRef.current, handoffRef.current, entry)
    },
  }), [])

  return (
    <>
      <div ref={rootRef} className={styles.stage} data-house-portal data-state={view} inert={!interactive}>
        {live && <h1 className={roomStyles.srOnly}>{thought.plainTitle}</h1>}
        <div className={styles.atmosphere} aria-hidden="true" />
        <div className={styles.composition}>
          <div className={styles.camera} data-house-camera>
          <div className={styles.shadow} aria-hidden="true" />
          <div className={styles.motes} aria-hidden="true" />
          <Link
            ref={entryRef}
            className={styles.control}
            data-slug={thought.slug}
            href={live ? hrefs.read(thought.slug) : hrefs.portal(thought.slug)}
            scroll={false}
            aria-label={`${live ? 'read' : 'open'} ${thought.plainTitle}`}
            onNavigate={(event) => {
              if (!live || !rootRef.current) return
              if (entryRun.current && !entryRun.current.choreography.cancelled) {
                event.preventDefault()
                return
              }
              entryRun.current = commitHouseEntry(rootRef.current, getEntryGeometry, engineRef.current)
            }}
            onKeyDown={(event) => {
              if (event.key === ' ' && !event.metaKey && !event.ctrlKey && !event.altKey) event.preventDefault()
            }}
            onKeyUp={(event) => {
              if (event.key === ' ' && !event.metaKey && !event.ctrlKey && !event.altKey) {
                event.preventDefault()
                event.currentTarget.click()
              }
            }}
          >
            <div ref={motionRef} className={styles.motion} aria-hidden="true">
              <div className={styles.building}>
                <span className={styles.roof} />
                <span className={styles.side} />
                <span className={styles.facade}>
                  <span className={styles.cornice} />
                  <span className={styles.pier} />
                  <span className={styles.lintel} />
                  <span ref={windowRef} className={styles.window} data-house-entry-window>
                    <SundayRoom miniature />
                    <span className={styles.glass} />
                    <span className={styles.frame} />
                    <span className={styles.sill} />
                    <span className={styles.entryBloom} />
                  </span>
                  <span className={styles.seam} />
                  <span className={styles.base} />
                  <span className={styles.memoryVeil} />
                </span>
              </div>
            </div>
            <span className={styles.caption} aria-hidden="true">
              <span className={styles.number}>{thought.number} / thought</span>
              <span className={styles.title}>{thought.plainTitle}</span>
              <span className={styles.invitation}>read the thought <HandArrow /></span>
            </span>
          </Link>
          </div>
        </div>
      </div>
      <div ref={handoffRef} className={styles.handoff} data-house-handoff aria-hidden="true" />
    </>
  )
}
