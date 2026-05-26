import { Metadata } from 'next'

import StarField from '@/components/StarField'
import { WikLogo } from '@/components/WikLogo'
import { HomePortals } from '@/components/HomePortals'

export const metadata: Metadata = {
  title: '★wik',
  description: 'DJ · Builder · Drifter · Mid-Transmission',
}

const portals = [
  {
    id: 'signal',
    number: '01',
    name: 'Frequencies',
    descriptor: 'sets, mixes,\nthe whole journey',
    href: '/frequencies',
    accentColor: '#C45A18',
  },
  {
    id: 'drift',
    number: '02',
    name: 'Elsewhere',
    descriptor: "everywhere i've been",
    href: '/drift',
    accentColor: '#B07820',
  },
  {
    id: 'transmit',
    number: '03',
    name: 'thoughts',
    descriptor: "whatever's on my mind",
    href: '/transmit',
    accentColor: '#4858C8',
  },
  {
    id: 'construct',
    number: '04',
    name: 'The Making',
    descriptor: "what i'm building and why",
    href: '/construct',
    accentColor: '#0F7A6A',
  },
]

export default function Home() {
  return (
    <main className="home-page">

      <StarField />


      <div className="home-content">
        <section className="hero-section">
          <h1 className="hero-name">
            <WikLogo size="clamp(140px, 28vw, 210px)" className="hero-logo-svg" />
          </h1>
          <p className="hero-sub">welcome to the wikverse.</p>
          <p className="hero-sub hero-sub--question">which world would you like to explore?</p>
        </section>

        <section className="portals-section">
          <HomePortals portals={portals} />
        </section>
      </div>

      <footer className="home-footer">
        <span>STARWIK.COM</span>
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </main>
  )
}
