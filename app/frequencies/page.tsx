import type { Metadata } from 'next'
import Image from 'next/image'

import {
  FrequenciesEffects,
  HeroWaveform,
  DJWaveform,
  YouTubeThumbnail,
} from './FrequenciesClient'
import styles from './frequencies.module.css'

export const metadata: Metadata = {
  title: '★wik — Frequencies',
  description: 'DJ press kit for ★wik: sets, mixes, live history, and booking.',
}

const heroTags = ['HOUSE', 'TECHNO', 'REMIXES']

const artistGenres = [
  'DEEP HOUSE',
  'TECH HOUSE',
  'MELODIC HOUSE',
  'AFRO HOUSE',
  'VAPOURSOUL',
  'PROGRESSIVE TECHNO',
  'REMIXES'
]

const allGigs = [
  {
    venue: 'EXT MOONSHINE',
    event: 'WHAT PARTY',
    location: 'HYD · 2026',
    desc: 'Three months drifting across Southeast Asia and the Pacific gave me a lot to say. This set was my attempt to say it through music — vapoursoul buildups, Anjuna Deep tracks, Dosem and Ben Böhmer woven together to take the room somewhere far and bring them back changed.',
    tags: ['DEEP HOUSE', 'VAPOURSOUL', 'PROGRESSIVE'],
    photoClass: styles.gigPhotoMoonshine,
    image: '/images/ext-moonshine.jpg',
    instagramUrl: 'https://www.instagram.com/p/DYG0y1gGooJ/?igsh=OW8yMnlncXVmdzI4',
  },
  {
    venue: 'THE RU EXPERIENCE',
    event: 'OWN CONCEPT EVENT',
    location: 'HYD · 2026',
    desc: 'Our attempt at building a creative new IP from scratch. Audiences walked in to reflective cards and missions — pushing them to find strangers, ask real questions, and actually connect before ever stepping onto the floor. Then came the tech house remixes they could sing and move to together. Connection first. Music second. Both at full volume.',
    tags: ['TECH HOUSE', 'DEEP HOUSE', 'REMIXES'],
    photoClass: styles.gigPhotoRu,
    image: '/images/The RU EXPERIENCE.jpg',
    instagramUrl: 'https://www.instagram.com/reel/DTpOL_3Eupt/?igsh=MTAwZmlhOGVrbHdkdw==',
  },
  {
    venue: 'ZERO 40',
    event: 'WHAT PARTY',
    location: 'HYD · 2025',
    desc: "My first ever club debut — the What Party season finale. Over 150 people packed into the room, fully alive from start to finish. The adrenaline from that night is unlike anything I've felt before or since. I kept pushing the energy higher and the room kept coming with me.",
    tags: ['TECH HOUSE', 'REMIXES'],
    photoClass: styles.gigPhotoZero40,
    image: '/images/Zero 40.jpg',
    instagramUrl: 'https://www.instagram.com/p/DSWuTjJEust/?igsh=MTY4bXF2cWNmcG9kbA==',
  },
  {
    venue: 'TEQUILA SUNRISE',
    event: 'CLUB NIGHT',
    location: 'BALI · 2026',
    desc: "Carried my pen drive to Bali with no expectations. The right conversations led to a set at Tequila Sunrise — the most happening club on Gili T island. Brought in heavy tech house and dance music and gave the floor exactly what it didn't know it needed.",
    tags: ['HIP HOP REMIXES', 'TECH HOUSE'],
    photoClass: styles.gigPhotoBaliSunrise,
    image: '/images/tequila sunrise.jpg',
  },
  {
    venue: 'OPEN WATER BOAT PARTY',
    event: 'OPEN DECK',
    location: 'BALI · 2026',
    desc: 'Always wanted to play a boat party. Hopped on a back-to-back with 4dyblue and we ran the deck with melodic house and dancing rhythms all afternoon. The boat was moving in more ways than one.',
    tags: ['MELODIC HOUSE', 'DEEP HOUSE'],
    photoClass: styles.gigPhotoBaliBoat,
    image: '/images/open-water-boat-party.jpg',
  },
  {
    venue: 'MAIZE AND BEANS',
    event: 'COFFEE RAVE',
    location: 'HYD · 2025',
    desc: "The one that started everything. We transformed a café into a club for a night and I got on the decks for the very first time. That performance gave me the confidence to keep chasing stages — and I haven't stopped since.",
    tags: ['AFRO HOUSE', 'DEEP HOUSE', 'REMIXES'],
    photoClass: styles.gigPhotoCoffeeRave,
    image: '/images/maize and beans.jpg',
  },
]

const mixes = [
  {
    videoId: '9kuPPDcWT44',
    title: '★wik — Mix Vol. 3',
    meta: 'YOUTUBE · 2026',
    desc: "Bohol is an island in the Philippines — forested, quiet, reserved in the most beautiful way. While I explored it I kept wanting to share what it actually felt like to be there. This set is that conversation. Put it on and let me take you around.",
  },
  {
    videoId: 'uG1WS2lbQ7g',
    title: '★wik — Mix Vol. 2',
    meta: 'YOUTUBE · 2025',
    desc: 'Early days. I set up whatever I had on my terrace and just hit record. No studio, no setup, just music that felt like an honest expression of where I was at that point in the journey. Raw and real.',
  },
]

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function fade(delay?: 'd1' | 'd2' | 'd3' | 'd4', extra?: string) {
  return cx(styles.fade, delay && styles[delay], extra)
}

const logoSrc = '/wik%20dj%20logo.svg'

type GigCardProps = {
  venue: string
  event: string
  location: string
  desc: string
  tags: string[]
  photoClass: string
  image?: string
  instagramUrl?: string
  wide?: boolean
}

function GigCard({
  venue,
  event,
  location,
  desc,
  tags,
  photoClass,
  image,
  instagramUrl,
  wide,
}: GigCardProps) {
  const cardContent = (
    <>
      {image ? (
        <div className={cx(styles.gigPhotoPlaceholder, styles.gigPhotoReal)}>
          <Image
            src={image}
            alt={`${venue} — ${event}`}
            fill
            sizes="320px"
            className={styles.gigRealImg}
          />
        </div>
      ) : (
        <div className={cx(styles.gigPhotoPlaceholder, photoClass)}>ADD PHOTO</div>
      )}
      <div className={styles.gigInfo}>
        <div className={styles.gigTop}>
          <div>
            <p className={styles.gigVenue}>{venue}</p>
            <p className={styles.gigEvent}>{event}</p>
          </div>
          <span className={styles.gigLocation}>{location}</span>
        </div>
        <p className={styles.gigDesc}>{desc}</p>
        <div className={styles.gigTags}>
          {tags.map((tag) => (
            <span key={tag} className={styles.gigTag}>
              {tag}
            </span>
          ))}
        </div>
        {instagramUrl ? (
          <span className={styles.gigIg}>
            <span className={styles.igIcon}>◈</span> VIEW ON INSTAGRAM →
          </span>
        ) : null}
      </div>
    </>
  )

  if (instagramUrl) {
    return (
      <a
        href={instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cx(styles.gigCard, wide && styles.baliCard, styles.gigCardLink)}
      >
        {cardContent}
      </a>
    )
  }

  return (
    <article className={cx(styles.gigCard, wide && styles.baliCard)}>
      {cardContent}
    </article>
  )
}

export default function FrequenciesPage() {
  return (
    <main className={styles.page}>
      <FrequenciesEffects />
      <div className={styles.ambientMesh} aria-hidden="true">
        <div className={cx(styles.orb, styles.orb1)} />
        <div className={cx(styles.orb, styles.orb2)} />
        <div className={cx(styles.orb, styles.orb3)} />
      </div>

      <nav className={styles.nav} aria-label="Frequencies navigation">
        <a href="https://starwik.com" className={styles.navLogoText}>
          DJ PRESS KIT · 2026
        </a>
        <a href="#book" className={styles.navBook}>
          GET IN TOUCH
        </a>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroPhoto} aria-hidden="true">
          <Image
            src="/images/front page.JPG"
            alt=""
            fill
            priority={true}
            sizes="100vw"
            className={styles.heroImage}
          />
        </div>
        <div className={styles.heroOverlay} />
        <HeroWaveform />
        <div className={styles.heroScroll} aria-hidden="true">
          <div className={styles.scrollLine} />
          SCROLL
        </div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroName}>
            <Image
              src={logoSrc}
              alt="★wik"
              width={500}
              height={500}
              loading="eager"
              unoptimized
              className={styles.heroNameLogo}
            />
          </h1>
          <p className={styles.heroRole}>Experience Curator</p>
          <div className={styles.heroTags}>
            {heroTags.map((tag) => (
              <span key={tag} className={styles.heroTag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.artist}>
        {/* Full-bleed background image */}
        <div className={styles.artistBg} aria-hidden="true">
          <Image
            src="/images/section-2.svg"
            alt=""
            fill
            sizes="100vw"
            className={styles.artistBgImg}
          />
        </div>
        <div className={styles.artistScrim} aria-hidden="true" />

        <div className={cx(styles.artistOverlayContent, styles.sectionPad)}>
          {/* Left — editorial label + headline */}
          <div className={styles.artistLeft}>
            <span className={styles.sectionLabel}>
              01 — THE ARTIST
            </span>
            <h2 className={styles.artistName}>
              Satwik Mekala.
              <br />
              Known as *wik.
            </h2>
          </div>

          {/* Right — frosted glass bio card */}
          <div className={styles.artistBioCard}>
            <p className={styles.artistBio}>
              &ldquo;I grew up writing songs, composing, and connecting to music on an emotional level. When house music found me three years ago, it gave me a lane to go even deeper into myself. I didn&apos;t plan to become a DJ. It was a natural transition that happened out of pure passion for the music and the craft.
              <br />
              <br />
              What I&apos;m equally passionate about is curating experiences. I&apos;m naturally observant, which means I can read a dance floor really well. I understand the energy, feel the shifts, and bring people into the vibe by being the vibe behind the decks. The connection between me and the floor is where it all comes alive.
              <br />
              <br />
              Can&apos;t wait to bring more vibes to you.&rdquo;
            </p>
            <div className={styles.artistGenres}>
              {artistGenres.map((genre) => (
                <span key={genre} className={styles.genrePill}>
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <DJWaveform />

      <section className={cx(styles.live, styles.sectionPad)}>
        <span className={fade(undefined, styles.sectionLabel)} data-frequency-fade>
          02 — LIVE
        </span>
        <h2 className={fade('d1', styles.liveHeading)} data-frequency-fade>
          On the decks.
        </h2>

        <div className={fade('d2', styles.gigScroll)} data-frequency-fade>
          {allGigs.map((gig) => (
            <GigCard key={gig.venue} {...gig} />
          ))}
        </div>
      </section>

      <section className={cx(styles.mixes, styles.sectionPad)}>
        <span className={fade(undefined, styles.sectionLabel)} data-frequency-fade>
          03 — THE MIXES
        </span>
        <h2 className={fade('d1', styles.mixesHeading)} data-frequency-fade>
          Recorded Sets.
        </h2>
        <div className={styles.mixesGrid}>
          {mixes.map((mix, index) => (
            <article
              key={mix.videoId}
              className={fade(index === 0 ? 'd2' : 'd3', styles.mixCard)}
              data-frequency-fade
            >
              <div className={styles.mixThumbWrap}>
                <YouTubeThumbnail videoId={mix.videoId} alt={`${mix.title} thumbnail`} />
                <div className={styles.mixPlayOverlay}>
                  <a
                    className={styles.mixPlay}
                    href={`https://youtu.be/${mix.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Play ${mix.title} on YouTube`}
                  >
                    <svg viewBox="0 0 68 48" width="60" height="42" aria-hidden="true" className={styles.ytIcon}>
                      <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="currentColor" />
                      <path d="M 45,24 27,14 27,34" fill="#fff" />
                    </svg>
                  </a>
                </div>
              </div>
              <div className={styles.mixInfo}>
                <p className={styles.mixTitle}>{mix.title}</p>
                <p className={styles.mixMeta}>{mix.meta}</p>
                <p className={styles.mixDesc}>{mix.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.book} id="book">
        <span className={fade(undefined, styles.sectionLabel)} data-frequency-fade>
          04 — LET&apos;S TALK
        </span>
        <h2 className={fade('d1', styles.bookHeadline)} data-frequency-fade>
          Keen to bring more vibes and curate experiences.
        </h2>
        <p className={fade('d2', styles.bookSub)} data-frequency-fade>
          Let&apos;s do something together.
        </p>
        <div className={fade('d3', styles.bookOptions)} data-frequency-fade>
          <a
            href="mailto:satwikmekala01@gmail.com"
            className={cx(styles.bookBtn, styles.bookBtnPrimary)}
            id="contact-email"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            EMAIL ME
          </a>
          <a
            href="https://www.instagram.com/satwik01/"
            target="_blank"
            rel="noopener noreferrer"
            className={cx(styles.bookBtn, styles.bookBtnGhost)}
            id="contact-instagram"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
            DM ON INSTAGRAM
          </a>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>★WIK — EXPERIENCE CURATOR · HYD, INDIA</span>
        <span>STARWIK.COM · 2025</span>
      </footer>
    </main>
  )
}
