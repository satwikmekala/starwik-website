import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '★wik — The Signal',
  description: 'Music. Sets. Frequencies.',
}

export default function SignalPage() {
  const gigs = [
    { date: 'APR 2025', venue: 'Haus of What', note: 'EXT Moonshine' },
    { date: 'MAR 2025', venue: 'Caramba', note: 'Melodic Progressive' },
    { date: 'FEB 2025', venue: 'Underground', note: 'Hypnotic Minimal' },
  ]

  return (
    <main className="universe-page signal-page" style={{ minHeight: '100vh', background: 'var(--signal-bg)' }}>

      {/* Waveform background */}
      <div className="signal-wave-bg">
        <svg viewBox="0 0 800 400" style={{ width: '100%', height: '100%' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <polyline key={i}
              points={Array.from({ length: 40 }, (_, j) => {
                const x = (j / 39) * 800
                const y = 200 + Math.sin((j / 39) * Math.PI * (3 + i)) * (20 + i * 12) * (0.5 + Math.random() * 0.5)
                return `${x},${y}`
              }).join(' ')}
              fill="none"
              stroke="#C45A18"
              strokeWidth={0.5 + i * 0.1}
              opacity={0.3 - i * 0.03}
            />
          ))}
        </svg>
      </div>

      <Link href="/" className="universe-back">← BACK TO ORBIT</Link>

      <div className="universe-hero" style={{ position: 'relative', zIndex: 2 }}>
        <span className="universe-number" style={{ color: 'var(--signal)' }}>01 / THE SIGNAL</span>
        <h1 className="universe-title">Music is<br />the language<br />I never had<br />to learn.</h1>

        <p style={{
          fontSize: '0.7rem', lineHeight: 1.9, color: 'var(--text-secondary)',
          maxWidth: 360, marginTop: '1.5rem', letterSpacing: '0.03em',
        }}>
          Playing as <strong style={{ color: 'var(--text-primary)', fontWeight: 400 }}>★wik</strong> — 
          melodic progressive house to hypnotic minimal techno. 
          The music is always mid-journey.
        </p>

        {/* Gig timeline */}
        <div style={{ marginTop: '3rem', maxWidth: 400 }}>
          <div style={{
            fontSize: '0.5rem', letterSpacing: '0.25em',
            color: 'rgba(196,90,24,0.4)', marginBottom: '1.25rem',
          }}>
            GIG HISTORY
          </div>
          {gigs.map((gig, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '1.5rem',
              padding: '0.85rem 0',
              borderBottom: '1px solid rgba(196,90,24,0.1)',
            }}>
              <span style={{ fontSize: '0.55rem', color: 'var(--signal)', opacity: 0.6, minWidth: 60, letterSpacing: '0.1em' }}>
                {gig.date}
              </span>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
                  {gig.venue}
                </div>
                <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '0.2rem', letterSpacing: '0.08em' }}>
                  {gig.note}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="universe-status" style={{ marginTop: '3rem' }}>
          SETS LOADING — MORE INCOMING ∿
        </p>
      </div>
    </main>
  )
}
