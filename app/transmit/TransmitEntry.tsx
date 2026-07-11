'use client'

import { useEffect, useRef, useState } from 'react'
import type { Transmission } from './TransmitFeed'
import styles from './transmit.module.css'

function MetaLine({
  entry,
  className,
}: {
  entry: Transmission
  className?: string
}) {
  return (
    <span className={`${styles.metaLine} ${className ?? ''}`}>
      <span className={styles.metaNum}>
        {String(entry.index).padStart(3, '0')}
      </span>
      <span className={styles.metaDate}>{entry.date.toUpperCase()}</span>
    </span>
  )
}

export default function TransmitEntry({
  entry,
  onRead,
}: {
  entry: Transmission
  onRead: (entry: Transmission) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [arrived, setArrived] = useState(false)

  /* IntersectionObserver reads post-transform rects, so this works
     for both the horizontal track and native vertical scroll */
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setArrived(true)
          io.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const media = entry.media
  const st = (n: 1 | 2 | 3) => `${styles.st} ${styles[`st${n}`]}`

  let inner: React.ReactNode = null

  switch (entry.type) {
    case 'photo':
      inner = (
        <figure className={styles.photoWrap}>
          {/* TODO: Replace with Next.js <Image src="/images/transmit/[name]" /> */}
          <div
            className={`${styles.photoMedia} ${st(2)}`}
            style={
              {
                '--r': media?.ratio,
                '--rv': media?.ratioValue,
                background: media?.gradient,
              } as React.CSSProperties
            }
            role="img"
            aria-label={media?.alt}
          />
          <div className={`${styles.photoMetaRow} ${styles.vPad}`}>
            <MetaLine entry={entry} className={st(1)} />
            <figcaption className={`${styles.photoCaption} ${st(3)}`}>
              {entry.caption}
            </figcaption>
          </div>
        </figure>
      )
      break

    case 'thought':
      inner = (
        <div className={styles.vPad}>
          <p className={`${styles.thoughtText} ${st(2)}`}>{entry.content}</p>
          <span className={`${styles.thoughtMeta} ${st(1)}`}>
            {String(entry.index).padStart(3, '0')} —{' '}
            {entry.date.toUpperCase()}
          </span>
        </div>
      )
      break

    case 'essay':
      inner = (
        <article className={styles.vPad}>
          <MetaLine entry={entry} className={st(1)} />
          <button
            className={styles.essayBtn}
            onClick={() => onRead(entry)}
            aria-label={`Read essay — ${entry.title}`}
          >
            <h2 className={`${styles.essayTitle} ${st(2)}`}>{entry.title}</h2>
            <p className={`${styles.essayOpening} ${st(2)}`}>
              {entry.opening}
            </p>
            <span className={`${styles.essayLink} ${st(3)}`}>
              READ TRANSMISSION
              <span className={styles.essayArrow} aria-hidden="true">
                →
              </span>
            </span>
          </button>
        </article>
      )
      break

    case 'moment':
      inner = (
        <figure className={styles.momentWrap}>
          {/* TODO: Replace with Next.js <Image src="/images/transmit/[name]" /> */}
          <div
            className={`${styles.momentMedia} ${st(2)}`}
            style={
              {
                '--r': media?.ratio,
                background: media?.gradient,
              } as React.CSSProperties
            }
            role="img"
            aria-label={media?.alt}
          />
          <div className={styles.vPad}>
            <figcaption className={`${styles.momentText} ${st(3)}`}>
              {entry.content}
            </figcaption>
            <MetaLine
              entry={entry}
              className={`${styles.momentMeta} ${st(1)}`}
            />
          </div>
        </figure>
      )
      break
  }

  return (
    <div ref={ref} className={arrived ? styles.arrived : undefined}>
      {inner}
    </div>
  )
}
