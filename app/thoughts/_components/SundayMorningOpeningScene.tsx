import type { ReaderProps } from './Reader'
import Image from 'next/image'
import { SceneExperience } from './SceneExperience'
import { SundayMorningEnvironment } from './SundayMorningEnvironment'
import styles from './sundayOpening.module.css'

/** The portal exposure resolves into morning light and the illustrated room. */
export function SundayMorningOpeningScene(props: ReaderProps & { onTextMode?: () => void }) {
  const { thought } = props
  return (
    <SceneExperience
      {...props}
      scenes={thought.experience.scenes ?? []}
      sceneVisuals={{
        'sunday-morning-photo': (
          <div className={styles.sceneImage}>
            <Image
              src="/images/sundaymorning.png"
              alt="A man looking across a sunlit street from a warm, plant-filled apartment"
              fill
              sizes="(max-width: 767px) 100vw, 58vw"
            />
          </div>
        ),
        'across-the-street-photo': (
          <div className={styles.acrossImage}>
            <Image
              src="/images/across-the-street.png"
              alt="Marcus beside a spilled cup of coffee, looking toward the street below"
              fill
              sizes="(max-width: 767px) 100vw, 58vw"
            />
          </div>
        ),
        apartment: <SundayMorningEnvironment />,
      }}
      opening={
      <header className={styles.opening} data-cinematic-opening>
        <Image
          className={styles.hero}
          src={thought.coverImage.src}
          alt={thought.coverImage.alt}
          fill
          sizes="100vw"
          preload
        />
        <div className={styles.shade} aria-hidden="true" />
        <div className={styles.title} data-opening-copy>
          <h1 id="thought-title" tabIndex={-1}>{thought.plainTitle}</h1>
        </div>
      </header>
    } />
  )
}
