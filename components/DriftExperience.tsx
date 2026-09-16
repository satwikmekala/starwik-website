/**
 * DriftExperience — client orchestrator for the "Elsewhere" page.
 *
 * Owns the active-chapter state and wires the three pieces together:
 *   DriftMap   — Mapbox + GSAP ScrollTrigger (dynamically imported, no SSR)
 *   DriftPanel — the chapter info panel (right side)
 *   DriftNav   — the dot navigation (left side)
 *
 * `next/dynamic` with `ssr: false` must live inside a Client Component,
 * which is why this wrapper exists between page.tsx and DriftMap.
 */
'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { CHAPTERS } from '@/app/drift/chapters'
import type { DriftMapController } from '@/components/DriftMap'
import DriftPanel from '@/components/DriftPanel'
import DriftNav from '@/components/DriftNav'
import styles from '@/app/drift/drift.module.css'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

// mapbox-gl touches `window` at init — only ever load it in the browser
const DriftMap = dynamic(() => import('@/components/DriftMap'), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>LOCATING…</div>,
})

function hasValidToken(): boolean {
  return Boolean(MAPBOX_TOKEN) && MAPBOX_TOKEN !== 'your_mapbox_token_here'
}

export default function DriftExperience() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isFlying, setIsFlying] = useState(false)
  // null until mounted — avoids a hydration mismatch on viewport detection
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  const controllerRef = useRef<DriftMapController | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // ── Graceful fallback when the Mapbox token is missing ──
  if (!hasValidToken()) {
    return (
      <div className={styles.fallback}>
        <Link href="/" className={styles.backLink}>
          ← Back to wikverse
        </Link>
        <div className={styles.fallbackInner}>
          <span className={styles.fallbackKicker}>ELSEWHERE · OFFLINE</span>
          <h1 className={styles.fallbackTitle}>The map is waiting.</h1>
          <p className={styles.fallbackBody}>
            Set <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> in <code>.env.local</code>{' '}
            to begin the journey. Free tokens live at
            mapbox.com/account/access-tokens.
          </p>
        </div>
      </div>
    )
  }

  if (isMobile === null) {
    return <div className={styles.mapLoading}>LOCATING…</div>
  }

  // ── MOBILE — simple vertical stack of chapter cards ──
  // TODO: MOBILE SCROLL EXPERIENCE — rebuild this as a
  // touch-driven vertical journey with the map as background
  if (isMobile) {
    return (
      <div className={styles.mobileStack}>
        <Link href="/" className={styles.backLink}>
          ← Back to wikverse
        </Link>
        <header className={styles.mobileHeader}>
          <span className={styles.mobileKicker}>ELSEWHERE</span>
          <h1 className={styles.mobileTitle}>The Journey</h1>
        </header>
        {CHAPTERS.map((chapter, i) => (
          <article key={chapter.id} className={styles.mobileCard}>
            {/* Static mini-map thumbnail via the Mapbox Static Images API */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.mobileMiniMap}
              alt={`Map of ${chapter.title}`}
              loading="lazy"
              src={`https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${chapter.coordinates[0]},${chapter.coordinates[1]},${Math.max(chapter.zoom - 1, 1)},${chapter.bearing}/640x360@2x?access_token=${MAPBOX_TOKEN}&logo=false&attribution=false`}
            />
            <div className={styles.mobileCardBody}>
              <span className={styles.panelCounter}>
                {String(i).padStart(2, '0')} /{' '}
                {String(CHAPTERS.length - 1).padStart(2, '0')}
              </span>
              <h2 className={styles.panelTitle}>{chapter.title}</h2>
              <span className={styles.panelSubtitle}>{chapter.subtitle}</span>
              <p className={styles.panelQuote}>“{chapter.quote}”</p>
              <p className={styles.panelDescription}>{chapter.description}</p>
              <div className={styles.panelTags}>
                {chapter.tags.map((tag) => (
                  <span key={tag} className={styles.panelTag}>
                    {tag}
                  </span>
                ))}
              </div>
              {chapter.photoSlots > 0 && (
                /* TODO: replace these placeholder slots with real Image components
                   Example: <Image src="/images/drift/amsterdam-01.jpg" ... /> */
                <div className={styles.photoStrip}>
                  {Array.from({ length: chapter.photoSlots }).map((_, s) => (
                    <div key={s} className={styles.photoSlot}>
                      <span className={styles.photoSlotLabel}>ADD PHOTO</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    )
  }

  // ── DESKTOP — the full scroll-driven cinematic experience ──
  return (
    <div className={styles.experience}>
      <DriftMap
        activeIndex={activeIndex}
        onChapterChange={setActiveIndex}
        onFlyingChange={setIsFlying}
        controllerRef={controllerRef}
      />
      <Link href="/" className={styles.backLink}>
        ← Back to wikverse
      </Link>
      <DriftNav
        chapters={CHAPTERS}
        activeIndex={activeIndex}
        onSelect={(i) => controllerRef.current?.goToChapter(i)}
      />
      <DriftPanel
        chapter={CHAPTERS[activeIndex]}
        total={CHAPTERS.length}
        isFlying={isFlying}
      />
    </div>
  )
}
