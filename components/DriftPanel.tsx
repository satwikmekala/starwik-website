/**
 * DriftPanel — the chapter info panel, right side on desktop.
 *
 * The counter lives in a persistent header so its digits can roll
 * like an odometer between chapters. Below it, two stacked content
 * layers animate simultaneously on chapter change: the outgoing
 * chapter exits upward while the incoming one rises in from below.
 * On first load the opening chapter arrives as a staggered sequence
 * instead — each element 80ms after the last.
 */
'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Chapter } from '@/app/drift/chapters'
import { CHAPTERS } from '@/app/drift/chapters'
import styles from '@/app/drift/drift.module.css'

interface DriftPanelProps {
  chapter: Chapter
  total: number
  /** true while the map camera is mid-flight — the panel softens */
  isFlying: boolean
}

const EXIT_MS = 400

/** stagger slot for the entry sequence — 80ms per step in CSS */
const stagger = (i: number): CSSProperties =>
  ({ '--d': i }) as CSSProperties

export default function DriftPanel({
  chapter,
  total,
  isFlying,
}: DriftPanelProps) {
  const [displayed, setDisplayed] = useState(chapter)
  const [leaving, setLeaving] = useState<Chapter | null>(null)
  const [intro, setIntro] = useState(true)
  const prevRef = useRef(chapter)

  useEffect(() => {
    const prev = prevRef.current
    if (prev.id === chapter.id) return
    prevRef.current = chapter
    setIntro(false)
    setLeaving(prev)
    setDisplayed(chapter)
  }, [chapter])

  useEffect(() => {
    if (!leaving) return
    const t = setTimeout(() => setLeaving(null), EXIT_MS)
    return () => clearTimeout(t)
  }, [leaving])

  const index = CHAPTERS.findIndex((c) => c.id === chapter.id)

  return (
    <aside
      className={`${styles.panel} ${isFlying ? styles.panelFlying : ''}`}
    >
      {/* Persistent header — the odometer rolls across chapter changes */}
      <div className={styles.panelHeader} style={stagger(0)}>
        <span className={styles.panelCounter}>
          <Odometer value={index} />
          <span className={styles.counterTotal}>
            {' '}
            / {String(total - 1).padStart(2, '0')}
          </span>
        </span>
        <span
          className={`${styles.arcBadge} ${
            chapter.isOverview ? styles.arcBadgeVisible : ''
          }`}
        >
          ARC
        </span>
      </div>

      <div className={styles.panelStack}>
        {leaving && (
          <div
            key={`out-${leaving.id}`}
            className={`${styles.panelContent} ${styles.panelContentLeaving}`}
            aria-hidden
          >
            <PanelBody chapter={leaving} />
          </div>
        )}
        <div
          key={`in-${displayed.id}`}
          className={[
            styles.panelContent,
            intro ? styles.panelIntro : styles.panelContentEntering,
            displayed.isOverview ? styles.panelOverview : '',
          ].join(' ')}
        >
          <PanelBody chapter={displayed} />
        </div>
      </div>
    </aside>
  )
}

function PanelBody({ chapter }: { chapter: Chapter }) {
  return (
    <>
      <h2 className={styles.panelTitle} style={stagger(1)}>
        {chapter.title}
      </h2>
      <span className={styles.panelSubtitle} style={stagger(2)}>
        {chapter.subtitle}
      </span>

      <div className={styles.panelDivider} style={stagger(3)} />

      <p className={styles.panelQuote} style={stagger(4)}>
        “{chapter.quote}”
      </p>
      <p className={styles.panelDescription} style={stagger(5)}>
        {chapter.description}
      </p>

      <div className={styles.panelTags} style={stagger(6)}>
        {chapter.tags.map((tag) => (
          <span key={tag} className={styles.panelTag}>
            {tag}
          </span>
        ))}
      </div>

      {chapter.photoSlots > 0 && (
        <div className={styles.panelPhotosSection} style={stagger(7)}>
          <span className={styles.panelPhotosLabel}>MOMENTS</span>
          {/* TODO: replace these placeholder slots with real Image components
              Example: <Image src="/images/drift/amsterdam-01.jpg" ... /> */}
          <div className={styles.photoStrip}>
            {Array.from({ length: chapter.photoSlots }).map((_, i) => (
              <div key={i} className={styles.photoSlot}>
                <span className={styles.photoSlotLabel}>ADD PHOTO</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

/** Two-digit odometer — each digit is a vertical reel of 0–9 */
function Odometer({ value }: { value: number }) {
  const digits = String(Math.max(0, value)).padStart(2, '0').split('')
  return (
    <span className={styles.odometer}>
      {digits.map((d, i) => (
        <span key={i} className={styles.digitCol}>
          <span
            className={styles.digitReel}
            style={{ transform: `translateY(-${Number(d)}em)` }}
          >
            {Array.from({ length: 10 }, (_, n) => (
              <span key={n} className={styles.digitCell}>
                {n}
              </span>
            ))}
          </span>
        </span>
      ))}
    </span>
  )
}
