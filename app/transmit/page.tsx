import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '★wik — The Transmit',
  description: 'Words. Ideas. Confessions.',
}

const posts = [
  {
    title: 'The Thought You Almost Lost',
    excerpt: 'What happens in the three seconds between the idea and the forgotten.',
    tag: 'MIND',
  },
  {
    title: 'On Becoming',
    excerpt: 'Europe cracked something open. I went in one person and returned as a question.',
    tag: 'JOURNEY',
  },
]

export default function TransmitPage() {
  return (
    <main className="universe-page transmit-page" style={{ background: 'var(--transmit-bg)', minHeight: '100vh' }}>

      <div className="transmit-static-bg" aria-hidden>
        {'wordthoughtideapulsefeelingrawmindtruthvoice'.split('').join('')}
      </div>

      <Link href="/" className="universe-back">← BACK TO ORBIT</Link>

      <div className="universe-hero" style={{ position: 'relative', zIndex: 2 }}>
        <span className="universe-number" style={{ color: 'var(--transmit)' }}>03 / THE TRANSMIT</span>
        <h1 className="universe-title">Some things<br />need to be<br />said out loud.</h1>

        <p style={{
          fontSize: '0.7rem', lineHeight: 1.9, color: 'var(--text-secondary)',
          maxWidth: 360, marginTop: '1.5rem', letterSpacing: '0.03em',
        }}>
          Writings from the edge of things I&apos;m figuring out.
          Raw and probably unfinished.
        </p>

        <div style={{ marginTop: '3rem', maxWidth: 420 }}>
          <div style={{
            fontSize: '0.5rem', letterSpacing: '0.25em',
            color: 'rgba(72,88,200,0.4)', marginBottom: '1.25rem',
          }}>
            TRANSMISSIONS
          </div>
          {posts.map((post, i) => (
            <div key={i} style={{
              padding: '1.2rem 0',
              borderBottom: '1px solid rgba(72,88,200,0.1)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{
                  fontFamily: 'var(--font-display), serif',
                  fontSize: '1rem', fontWeight: 400,
                  color: 'var(--text-primary)', letterSpacing: '0.04em',
                  lineHeight: 1.3,
                }}>
                  {post.title}
                </h3>
                <span style={{
                  fontSize: '0.45rem', color: 'var(--transmit)',
                  letterSpacing: '0.15em', opacity: 0.6,
                  marginLeft: '1rem', paddingTop: '0.15rem', whiteSpace: 'nowrap',
                }}>
                  {post.tag}
                </span>
              </div>
              <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', lineHeight: 1.7, letterSpacing: '0.03em' }}>
                {post.excerpt}
              </p>
            </div>
          ))}
        </div>

        <a
          href="https://substack.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block', marginTop: '2.5rem',
            fontSize: '0.6rem', letterSpacing: '0.2em',
            color: 'var(--transmit)', textDecoration: 'none',
            borderBottom: '1px solid rgba(72,88,200,0.3)',
            paddingBottom: '0.2rem',
          }}
        >
          READ ON SUBSTACK →
        </a>

        <p className="universe-status" style={{ marginTop: '3rem', color: 'rgba(72,88,200,0.35)' }}>
          MORE TRANSMISSIONS INCOMING ◈
        </p>
      </div>
    </main>
  )
}
