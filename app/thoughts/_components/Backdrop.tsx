'use client'

/**
 * The photograph — a stack of full-bleed images that dissolve into one
 * another. The incoming photograph loads *underneath* the current one;
 * only once it has fully decoded does the current one drift forward
 * (1 → 1.015) and dissolve, so the change is never a blink.
 */

import { useCallback, useState, type Ref } from 'react'
import Image, { getImageProps } from 'next/image'
import type { ThoughtImage } from '@/content/thoughts/types'
import styles from './experience.module.css'

interface Layer {
  id: number
  image: ThoughtImage
  ready: boolean
  leaving: boolean
  /** the very first photograph fades up out of the dark; later ones sit ready underneath */
  entrance: boolean
}

interface BackdropProps {
  image: ThoughtImage
  /** outer element — scaled / faded by the view */
  ref?: Ref<HTMLDivElement>
  /** inner element — moved by the depth engine */
  parallaxRef?: Ref<HTMLDivElement>
}

const LEAVE_MS = 1150

export function Backdrop({ image, ref, parallaxRef }: BackdropProps) {
  // ids are per-instance (never module-level) so server and client agree on the first layer
  const [layers, setLayers] = useState<Layer[]>(() => [
    { id: 0, image, ready: false, leaving: false, entrance: true },
  ])
  const [shownSrc, setShownSrc] = useState(image.src)

  // a new photograph was asked for: slide a layer in underneath
  if (image.src !== shownSrc) {
    setShownSrc(image.src)
    setLayers((current) => {
      const id = current.reduce((max, layer) => Math.max(max, layer.id), 0) + 1
      // photographs that were queued but never seen can go
      const visible = current.filter((layer) => layer.ready || layer.leaving)
      const somethingOnScreen = visible.some((layer) => layer.ready && !layer.leaving)
      return [...visible, { id, image, ready: false, leaving: false, entrance: !somethingOnScreen }]
    })
  }

  const markReady = useCallback((id: number) => {
    setLayers((current) => {
      const newest = current[current.length - 1]
      const next = current.map((layer) =>
        layer.id === id ? { ...layer, ready: true } : layer
      )
      // only the newest photograph may retire the ones above it
      if (newest?.id !== id) return next
      return next.map((layer) =>
        layer.id !== id ? { ...layer, leaving: true } : layer
      )
    })
    window.setTimeout(() => {
      setLayers((current) => {
        const newestIndex = current.findIndex((layer) => layer.id === id)
        if (newestIndex === -1) return current
        return current.filter((layer, index) => !layer.leaving || index > newestIndex)
      })
    }, LEAVE_MS)
  }, [])

  return (
    <div ref={ref} className={styles.backdrop} aria-hidden="true">
      <div ref={parallaxRef} className={styles.parallax}>
        <div className={styles.breathe}>
          {layers.map((layer, index) => (
            <div
              key={layer.id}
              className={styles.layer}
              data-state={layer.leaving ? 'leaving' : layer.ready ? 'ready' : 'loading'}
              data-entrance={layer.entrance ? '' : undefined}
              style={{ zIndex: layers.length - index }}
            >
              <Image
                src={layer.image.src}
                alt=""
                fill
                sizes="100vw"
                preload={layer.id === 0}
                fetchPriority={layer.id === 0 ? 'high' : 'auto'}
                className={styles.photo}
                style={
                  {
                    '--pos': layer.image.position ?? 'center',
                    '--pos-mobile': layer.image.mobilePosition ?? layer.image.position ?? 'center',
                  } as React.CSSProperties
                }
                onLoad={(event) => {
                  const img = event.currentTarget
                  img
                    .decode()
                    .catch(() => undefined)
                    .then(() => markReady(layer.id))
                }}
                onError={() => markReady(layer.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const warmed = new Set<string>()

/** quietly fetch the other photographs so hovering never waits on the network */
export function warmImages(images: ThoughtImage[]) {
  images.forEach((image) => {
    if (warmed.has(image.src)) return
    warmed.add(image.src)
    const { props } = getImageProps({ src: image.src, alt: '', fill: true, sizes: '100vw' })
    const img = new window.Image()
    img.decoding = 'async'
    if (props.sizes) img.sizes = props.sizes
    if (props.srcSet) img.srcset = props.srcSet
    img.src = props.src
  })
}
