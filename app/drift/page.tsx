import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '★wik — The Drift',
  description: '8 countries. Counting.',
}

const countries = [
  { code: 'IN', name: 'India', note: 'Where it starts. Always comes back to.' },
  { code: 'NL', name: 'Netherlands', note: 'Amsterdam. Something cracked open here.' },
  { code: 'DE', name: 'Germany', note: 'Berlin. Music as philosophy.' },
  { code: 'CZ', name: 'Czech Republic', note: 'Prague. Old and strange and beautiful.' },
  { code: 'ES', name: 'Spain', note: 'Mallorca → Barcelona. Sun and clarity.' },
  { code: 'ID', name: 'Indonesia', note: 'Bali, Gili. The magic was inside you all along.' },
  { code: 'PH', name: 'Philippines', note: 'Ocean. Presence.' },
  { code: 'AU', name: 'Australia', note: 'Noosa, Sydney. Returned different.' },
]

export default function DriftPage() {
  return (
    <main className="universe-page drift-page" style={{ background: 'var(--drift-bg)', minHeight: '100vh' }}>

      <div className="drift-orbit-bg">
        <svg viewBox="0 0 600 600" style={{ width: '100%', maxWidth: 600, opacity: 1 }}>
          <ellipse cx="300" cy="300" rx="280" ry="100" fill="none" stroke="#B07820" strokeWidth="0.5" />
          <ellipse cx="300" cy="300" rx="200" ry="70" fill="none" stroke="#B07820" strokeWidth="0.3" strokeDasharray="4 6" />
          <ellipse cx="300" cy="300" rx="120" ry="42" fill="none" stroke="#B07820" strokeWidth="0.3" />
          <circle cx="300" cy="300" r="8" fill="#6A4410" />
        </svg>
      </div>

      <Link href="/" className="universe-back">← BACK TO ORBIT</Link>

      <div className="universe-hero" style={{ position: 'relative', zIndex: 2 }}>
        <span className="universe-number" style={{ color: 'var(--drift)' }}>02 / THE DRIFT</span>
        <h1 className="universe-title">Every place<br />changed the<br />frequency.</h1>

        <p style={{
          fontSize: '0.7rem', lineHeight: 1.9, color: 'var(--text-secondary)',
          maxWidth: 360, marginTop: '1.5rem', letterSpacing: '0.03em',
        }}>
          8 countries in 12 months. Not tourism — 
          field research into becoming.
        </p>

        <div style={{ marginTop: '3rem', maxWidth: 420 }}>
          <div style={{
            fontSize: '0.5rem', letterSpacing: '0.25em',
            color: 'rgba(176,120,32,0.4)', marginBottom: '1.25rem',
          }}>
            THE NODES
          </div>
          {countries.map((c, i) => (
            <div key={c.code} style={{
              display: 'grid', gridTemplateColumns: '36px 1fr',
              gap: '1rem', alignItems: 'start',
              padding: '0.85rem 0',
              borderBottom: '1px solid rgba(176,120,32,0.08)',
            }}>
              <span style={{
                fontSize: '0.5rem', color: 'var(--drift)',
                opacity: 0.5, letterSpacing: '0.1em', paddingTop: '0.15rem',
              }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
                  {c.name}
                </div>
                <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: 1.6, letterSpacing: '0.04em' }}>
                  {c.note}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="universe-status" style={{ marginTop: '3rem', color: 'rgba(176,120,32,0.35)' }}>
          FULL MAP + VLOGS — LOADING ◎
        </p>
      </div>
    </main>
  )
}
