'use client'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

function SignalVisual() {
  const bars = [18, 28, 12, 35, 22, 40, 15, 30, 8, 38, 20, 25, 42, 10, 32]
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'radial-gradient(ellipse 90% 70% at 50% 40%, #7A2A08 0%, #3A0E02 50%, transparent 80%), #0D0703',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, #C45A18 1px, transparent 1px)',
        backgroundSize: '8px 8px', opacity: 0.12,
      }} />
      <svg viewBox="0 0 200 80" style={{
        position: 'absolute', bottom: '20%', left: 0, right: 0,
        width: '100%', height: '40%', opacity: 0.35,
      }}>
        <polyline
          points={bars.map((h, i) => `${(i / (bars.length - 1)) * 200},${40 - h / 2} `).join(' ')}
          fill="none" stroke="#E8803A" strokeWidth="1.2" strokeLinejoin="round"
        />
        <polyline
          points={bars.map((h, i) => `${(i / (bars.length - 1)) * 200},${40 + h / 2} `).join(' ')}
          fill="none" stroke="#C45A18" strokeWidth="0.8" strokeLinejoin="round" opacity="0.5"
        />
      </svg>
      <div style={{
        position: 'absolute', top: 12, right: 14,
        fontSize: '0.45rem', color: '#C45A18', letterSpacing: '0.15em', opacity: 0.5,
      }}>∿ FREQ</div>
    </div>
  )
}

function DriftVisual() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'radial-gradient(ellipse 100% 60% at 50% 85%, #6A4410 0%, #3A2208 40%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 20%, #4A2A06 0%, transparent 60%), #0A0804',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, #B07820 1px, transparent 1px)',
        backgroundSize: '9px 9px', opacity: 0.1,
      }} />
      <svg viewBox="0 0 200 120" style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.2,
      }}>
        <ellipse cx="100" cy="100" rx="80" ry="30" fill="none" stroke="#C49030" strokeWidth="0.8" />
        <ellipse cx="100" cy="100" rx="55" ry="20" fill="none" stroke="#C49030" strokeWidth="0.5" strokeDasharray="3 4" />
        {[30, 70, 130, 170].map((cx, i) => (
          <circle key={i} cx={cx} cy={100 - Math.sin(((cx - 100) / 80) * Math.PI) * 28} r="2" fill="#D4A840" opacity="0.7" />
        ))}
      </svg>
      <div style={{
        position: 'absolute', top: 12, right: 14,
        fontSize: '0.45rem', color: '#B07820', letterSpacing: '0.12em', opacity: 0.5,
      }}>◎ 8 NODES</div>
    </div>
  )
}

function TransmitVisual() {
  const words = ['thought', 'idea', 'feel', 'sense', 'word', 'truth', 'raw', 'mind']
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'radial-gradient(ellipse 80% 80% at 40% 50%, #1A2068 0%, #0A0A3A 50%, transparent 80%), #05050F',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, #4858C8 1px, transparent 1px)',
        backgroundSize: '8px 8px', opacity: 0.1,
      }} />
      {words.map((w, i) => (
        <span key={w} style={{
          position: 'absolute',
          fontFamily: 'var(--font-display), serif',
          fontSize: `${0.5 + (i % 3) * 0.25}rem`,
          color: '#4858C8',
          opacity: 0.08 + (i % 4) * 0.05,
          top: `${10 + (i * 11) % 80}%`,
          left: `${5 + (i * 17) % 70}%`,
          whiteSpace: 'nowrap',
          fontStyle: 'italic',
          letterSpacing: '0.05em',
        }}>{w}</span>
      ))}
      <div style={{
        position: 'absolute', left: '50%', top: 0, bottom: 0,
        width: '1px', background: 'rgba(72,88,200,0.15)',
      }} />
      <div style={{
        position: 'absolute', top: 12, right: 14,
        fontSize: '0.45rem', color: '#4858C8', letterSpacing: '0.12em', opacity: 0.5,
      }}>◈ LOG</div>
    </div>
  )
}

function ConstructVisual() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'radial-gradient(ellipse 80% 70% at 50% 50%, #0A4A3E 0%, #041E18 50%, transparent 80%), #030E0C',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(15,122,106,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(15,122,106,0.08) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, #0F7A6A 1px, transparent 1px)',
        backgroundSize: '8px 8px', opacity: 0.12,
      }} />
      <svg viewBox="0 0 100 100" style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: '45%', height: '45%', opacity: 0.2,
      }}>
        <polygon points="50,15 85,35 85,65 50,85 15,65 15,35" fill="none" stroke="#1A9A8A" strokeWidth="1.5" />
        <polygon points="50,28 74,41 74,59 50,72 26,59 26,41" fill="none" stroke="#0F7A6A" strokeWidth="0.8" />
        <circle cx="50" cy="50" r="4" fill="#0F7A6A" opacity="0.5" />
      </svg>
      <div style={{
        position: 'absolute', top: 12, right: 14,
        fontSize: '0.45rem', color: '#0F7A6A', letterSpacing: '0.12em', opacity: 0.5,
      }}>⬡ BUILD</div>
    </div>
  )
}

const visualMap: Record<string, React.ComponentType> = {
  signal: SignalVisual,
  drift: DriftVisual,
  transmit: TransmitVisual,
  construct: ConstructVisual,
}

interface PortalCardProps {
  id: string
  number: string
  name: string
  descriptor: string
  href: string
  accentColor: string
  index: number
}

export function PortalCard({ id, number, name, descriptor, href, accentColor, index }: PortalCardProps) {
  const router = useRouter()
  const Visual = visualMap[id]

  return (
    <motion.div
      className="portal-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 + index * 0.1, ease: 'easeOut' }}
      whileHover={{ scale: 1.025 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => router.push(href)}
      style={{ '--card-accent': accentColor } as React.CSSProperties}
    >
      <div className="portal-visual">
        <Visual />
      </div>
      <div className="portal-info">
        <span className="portal-number">{number}</span>
        <h2 className="portal-name">{name}</h2>
        <p className="portal-desc">{descriptor}</p>
        <span className="portal-enter" style={{ color: accentColor }}>ENTER →</span>
      </div>
    </motion.div>
  )
}
