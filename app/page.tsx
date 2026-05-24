import { Metadata } from 'next'
import { PortalCard } from '@/components/PortalCard'
import StarField from '@/components/StarField'
import { WikLogo } from '@/components/WikLogo'

export const metadata: Metadata = {
  title: '★wik',
  description: 'DJ · Builder · Drifter · Mid-Transmission',
}

const portals = [
  {
    id: 'signal',
    number: '01',
    name: 'THE SIGNAL',
    descriptor: 'Music. Sets.\nFrequencies.',
    href: '/signal',
    accentColor: '#C45A18',
  },
  {
    id: 'drift',
    number: '02',
    name: 'THE DRIFT',
    descriptor: '8 countries.\nCounting.',
    href: '/drift',
    accentColor: '#B07820',
  },
  {
    id: 'transmit',
    number: '03',
    name: 'THE TRANSMIT',
    descriptor: 'Words. Ideas.\nConfessions.',
    href: '/transmit',
    accentColor: '#4858C8',
  },
  {
    id: 'construct',
    number: '04',
    name: 'THE CONSTRUCT',
    descriptor: 'Spore. The\nmaking of.',
    href: '/construct',
    accentColor: '#0F7A6A',
  },
]

export default function Home() {
  return (
    <main className="home-page">
      <StarField />

      <div className="home-nav" style={{ position: 'relative', zIndex: 2 }}>
        <span className="site-id" style={{ display: 'flex', alignItems: 'center' }}>
          <WikLogo size={36} style={{ opacity: 0.45 }} />
        </span>
        <span className="nav-label">SELECT UNIVERSE</span>
      </div>

      <div className="home-content">
        <section className="hero-section">
          <h1 className="hero-name" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <WikLogo size="clamp(150px, 30vw, 220px)" className="hero-logo-svg" />
          </h1>
          <p className="hero-sub">welcome to the wikverse.</p>
          <p className="hero-sub hero-sub--question">which world would you like to explore?</p>
        </section>

        <section className="portals-section">
          <div className="portals-grid">
            {portals.map((portal, i) => (
              <PortalCard key={portal.id} {...portal} index={i} />
            ))}
          </div>
        </section>
      </div>

      <footer className="home-footer">
        <span>STARWIK.COM</span>
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </main>
  )
}
