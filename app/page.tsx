import { Metadata } from 'next'

import StarField from '@/components/StarField'
import { HomeWorlds, type World } from '@/components/planets/HomeWorlds'
import styles from './home.module.css'

export const metadata: Metadata = {
  title: '★wik',
  description: 'DJ · Builder · Drifter · Mid-Transmission',
}

const worlds: World[] = [
  {
    id: 'signal',
    number: '01',
    name: 'Frequencies',
    descriptor: 'sets, mixes, the whole journey',
    href: '/music',
    kind: 'music',
    seed: 1,
    accent: '#FF7A33',
  },
  {
    id: 'drift',
    number: '02',
    name: 'Elsewhere',
    descriptor: "everywhere i've been",
    href: '/drift',
    kind: 'travel',
    seed: 2,
    accent: '#FFC061',
  },
  {
    id: 'thoughts',
    number: '03',
    name: 'thoughts',
    descriptor: "whatever's on my mind",
    href: '/thoughts',
    kind: 'thoughts',
    seed: 3,
    accent: '#8F9BFF',
    italic: true,
  },
  {
    id: 'construct',
    number: '04',
    name: 'The Making',
    descriptor: "what i'm building and why",
    href: '/making',
    kind: 'building',
    seed: 4,
    accent: '#45F0C6',
  },
]

export default function Home() {
  return (
    <main className={styles.page}>
      <StarField />
      <HomeWorlds worlds={worlds} />
      <footer className={styles.footer}>
        <span>STARWIK.COM</span>
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </main>
  )
}
