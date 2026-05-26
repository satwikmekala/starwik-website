import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '★wik — Elsewhere',
  description: 'Coming soon.',
}

export default function ElsewherePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700&display=swap');

        .uc-page {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #0a0a0a;
          font-family: 'Space Grotesk', sans-serif;
          color: #fff;
          text-align: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .uc-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.15;
          pointer-events: none;
        }

        .uc-orb-1 {
          width: 500px;
          height: 500px;
          background: #B07820;
          top: -100px;
          right: -100px;
        }

        .uc-orb-2 {
          width: 350px;
          height: 350px;
          background: #4858C8;
          bottom: -80px;
          left: -80px;
        }

        .uc-label {
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.25em;
          color: #B07820;
          text-transform: uppercase;
          margin-bottom: 2rem;
          opacity: 0.9;
        }

        .uc-icon {
          font-size: 3rem;
          margin-bottom: 1.5rem;
          display: block;
          animation: uc-float 4s ease-in-out infinite;
        }

        @keyframes uc-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .uc-title {
          font-size: clamp(2.5rem, 8vw, 5rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1;
          margin: 0 0 1.5rem;
          background: linear-gradient(135deg, #fff 0%, #888 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .uc-sub {
          font-size: 1rem;
          font-weight: 300;
          color: #666;
          letter-spacing: 0.05em;
          margin: 0 0 3rem;
          max-width: 380px;
          line-height: 1.7;
        }

        .uc-back {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #fff;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.15);
          padding: 0.8rem 1.6rem;
          border-radius: 100px;
          transition: all 0.3s ease;
        }

        .uc-back:hover {
          border-color: #B07820;
          color: #B07820;
          background: rgba(176, 120, 32, 0.08);
        }

        .uc-divider {
          width: 40px;
          height: 1px;
          background: rgba(255,255,255,0.15);
          margin: 0 auto 2rem;
        }
      `}</style>

      <main className="uc-page">
        <div className="uc-orb uc-orb-1" aria-hidden="true" />
        <div className="uc-orb uc-orb-2" aria-hidden="true" />

        <span className="uc-label">02 — Elsewhere</span>
        <span className="uc-icon" aria-hidden="true">✦</span>
        <h1 className="uc-title">Under Construction.</h1>
        <div className="uc-divider" />
        <p className="uc-sub">This world is still being mapped. Check back soon.</p>
        <Link href="/" className="uc-back">← Back to wikverse</Link>
      </main>
    </>
  )
}
