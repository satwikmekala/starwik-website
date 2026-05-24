'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const TERMINAL_LINES = [
  '> initializing spore...',
  '> loading voice engine...',
  '> connecting to memory...',
  '> ready.',
]

function TerminalText() {
  const [lines, setLines] = useState<string[]>([])
  const [done, setDone] = useState(false)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i < TERMINAL_LINES.length) {
        setLines(prev => [...prev, TERMINAL_LINES[i]])
        i++
      } else {
        setDone(true)
        clearInterval(interval)
      }
    }, 600)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="construct-terminal">
      {lines.map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: i === lines.length - 1 && !done ? 0.5 : i === lines.length - 1 ? 1 : 0.35 }}
          transition={{ duration: 0.3 }}
        >
          {line}
        </motion.div>
      ))}
      {!done && <span style={{ animation: 'blink 1s step-end infinite', color: 'var(--construct)' }}>_</span>}
    </div>
  )
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

export default function ConstructPage() {
  return (
    <main className="universe-page construct-page" style={{ background: 'var(--construct-bg)', minHeight: '100vh' }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>

      <div className="construct-grid-bg" />

      <Link href="/" className="universe-back">← BACK TO ORBIT</Link>

      {/* Section 1: Entry */}
      <div className="construct-section">
        <motion.span
          className="construct-label"
          initial="hidden" animate="visible" variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          04 / THE CONSTRUCT
        </motion.span>

        <motion.h1
          className="universe-title"
          style={{ color: 'var(--text-primary)', maxWidth: 480 }}
          initial="hidden" animate="visible" variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          Something is<br />being built<br />in the dark.
        </motion.h1>

        <TerminalText />
      </div>

      {/* Section 2: The Moment */}
      <div className="construct-section">
        <motion.div
          className="construct-label"
          initial="hidden" whileInView="visible" variants={fadeUp}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: '-80px' }}
        >
          THE ORIGIN
        </motion.div>
        <motion.blockquote
          className="construct-quote"
          initial="hidden" whileInView="visible" variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true, margin: '-80px' }}
        >
          &ldquo;I was mid-thought. Then gone. Three seconds and it vanished like it was never there.&rdquo;
        </motion.blockquote>
        <motion.p
          className="construct-body"
          initial="hidden" whileInView="visible" variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true, margin: '-80px' }}
        >
          That moment is where Spore was born. Not in a boardroom, not from a pitch deck — 
          from a fleeting thought in an ordinary moment that deserved to exist but didn&apos;t get the chance.
        </motion.p>
      </div>

      {/* Section 3: The Thing */}
      <div className="construct-section">
        <motion.div
          className="construct-label"
          initial="hidden" whileInView="visible" variants={fadeUp}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: '-80px' }}
        >
          THE BUILD
        </motion.div>
        <motion.p
          style={{
            fontFamily: 'var(--font-display), serif',
            fontSize: 'clamp(1rem, 3.5vw, 1.3rem)',
            color: 'var(--text-primary)', fontWeight: 300,
            lineHeight: 1.6, maxWidth: 400, marginBottom: '2rem',
          }}
          initial="hidden" whileInView="visible" variants={fadeUp}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: '-80px' }}
        >
          Spore is a voice-first thinking companion.
          Speak your thought. It captures, names, and saves it.
          The friction between idea and record: gone.
        </motion.p>

        {/* App Mockup */}
        <motion.div
          className="construct-mockup"
          initial="hidden" whileInView="visible" variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.15 }}
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="mockup-bar">
            <div className="mockup-dot" />
            <div className="mockup-dot" />
            <div className="mockup-dot" />
          </div>
          <div className="mockup-screen">
            <div style={{ opacity: 0.5, marginBottom: '0.5rem', fontSize: '0.55rem' }}>spore — voice log</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.6rem', marginBottom: '1rem' }}>
              &ldquo;I want to build something that outlasts me...&rdquo;
            </div>
            <div className="mockup-waveform">
              {[12, 24, 16, 36, 20, 30, 14, 28, 18, 32, 10, 26, 22].map((h, i) => (
                <div
                  key={i}
                  className="mockup-bar-item"
                  style={{
                    width: 3,
                    height: h,
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.5rem', opacity: 0.4 }}>
              <span>00:12</span>
              <span>● REC</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Section 4: The Horizon */}
      <div className="construct-section">
        <motion.div
          className="construct-label"
          initial="hidden" whileInView="visible" variants={fadeUp}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: '-80px' }}
        >
          THE HORIZON
        </motion.div>
        <motion.p
          className="construct-manifesto"
          initial="hidden" whileInView="visible" variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true, margin: '-80px' }}
        >
          &ldquo;What if the best version of your thinking was always available to you — not just when you&apos;re at a desk?&rdquo;
        </motion.p>
        <motion.p
          className="construct-body"
          initial="hidden" whileInView="visible" variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true, margin: '-80px' }}
        >
          Building toward something real. The journey is public.
          Every iteration, every pivot, every dead end — on record.
        </motion.p>
        <motion.a
          href="#"
          className="construct-cta"
          initial="hidden" whileInView="visible" variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true, margin: '-80px' }}
        >
          FOLLOW THE BUILD →
        </motion.a>
      </div>

    </main>
  )
}
