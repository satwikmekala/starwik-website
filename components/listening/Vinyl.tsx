'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'

import type { Mix } from '@/app/frequencies/mixes'
import { cx, useListening } from './context'
import { morph, settle } from './motion'
import styles from './listening.module.css'

type VinylProps = {
  mix: Mix
  /** shared-element id — the same record in two places morphs between them */
  layoutId?: string
  /** this is the loaded record, so it turns with the platter */
  current?: boolean
  className?: string
}

// Layers, outside in: the layoutId shell (moves between screens) → a warm
// shadow that blooms when the record is lifted → the lift (scale/rise) → the
// disc (rotates; grooves + the cover inset as the label) → a fixed sheen, so
// light stays put while the grooves turn under it, like a real record.

export function Vinyl({ mix, layoutId, current = false, className }: VinylProps) {
  const { platter } = useListening()
  const lift = useAnimationControls()
  const bloom = useAnimationControls()
  const shown = useRef(mix.slug)

  // a different record on the same platter: lift, swap the label, set it down
  useEffect(() => {
    if (shown.current === mix.slug) return
    shown.current = mix.slug
    let cancelled = false
    const run = async () => {
      bloom.start({ opacity: 1, scale: 1.14, transition: settle })
      await lift.start({ scale: 1.06, y: -10, transition: settle })
      await new Promise((resolve) => setTimeout(resolve, 380))
      if (cancelled) return
      bloom.start({ opacity: 0.6, scale: 1, transition: morph })
      lift.start({ scale: 1, y: 0, transition: morph })
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [mix.slug, lift, bloom])

  return (
    <motion.div
      layoutId={layoutId}
      className={cx(styles.vinyl, className)}
      style={{ borderRadius: '50%' }}
      transition={morph}
      onLayoutAnimationStart={() => {
        bloom.start({ opacity: 1, scale: 1.12, transition: settle })
      }}
      onLayoutAnimationComplete={() => {
        bloom.start({ opacity: 0.6, scale: 1, transition: morph })
      }}
    >
      <motion.span
        className={styles.vinylBloom}
        initial={{ opacity: 0.6, scale: 1 }}
        animate={bloom}
        aria-hidden="true"
      />
      <motion.div className={styles.vinylLift} animate={lift}>
        <motion.div className={styles.vinylDisc} style={{ rotate: current ? platter : 0 }}>
          <span className={styles.vinylLabel}>
            <AnimatePresence initial={false}>
              <Cover key={mix.cover} src={mix.cover} />
            </AnimatePresence>
          </span>
          <span className={styles.vinylSpindle} aria-hidden="true" />
        </motion.div>
        <span className={styles.vinylSheen} aria-hidden="true" />
      </motion.div>
    </motion.div>
  )
}

function Cover({ src }: { src: string }) {
  const [url, setUrl] = useState(src)
  const [loaded, setLoaded] = useState(false)

  return (
    <motion.img
      src={url}
      alt=""
      draggable={false}
      decoding="async"
      className={styles.vinylCover}
      initial={{ opacity: 0 }}
      animate={{ opacity: loaded ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      onLoad={() => setLoaded(true)}
      onError={() =>
        // YouTube only has maxres art for some uploads
        setUrl((u) => (u.includes('maxresdefault') ? u.replace('maxresdefault', 'hqdefault') : u))
      }
    />
  )
}
