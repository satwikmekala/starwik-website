import type { Metadata } from 'next'
import TransmitFeed, { type Transmission } from './TransmitFeed'
import styles from './transmit.module.css'

export const metadata: Metadata = {
  title: '★wik — Transmit',
  description:
    'Signals from one frequency. Photos, thoughts, essays, moments — one log, no categories.',
}

const TRANSMISSIONS: Transmission[] = [
  {
    id: 'tx-006',
    index: 6,
    type: 'thought',
    date: 'Jul 2026',
    content:
      'The version of you that got comfortable is not the version of you that wanted this.',
  },
  {
    id: 'tx-005',
    index: 5,
    type: 'photo',
    date: 'Jun 2026',
    caption: 'Somewhere in the Himalayas. 4300m.',
    media: {
      ratio: '4 / 3',
      ratioValue: 4 / 3,
      gradient:
        'radial-gradient(ellipse 80% 60% at 40% 60%, #3A1A08 0%, #0E0806 100%)',
      alt: 'Somewhere in the Himalayas, 4300 metres up',
    },
  },
  {
    id: 'tx-004',
    index: 4,
    type: 'essay',
    date: 'Jun 2026',
    title: 'On the Order of Operations',
    opening:
      "There's a pattern I keep catching myself in. I reach for the meaning before I've let the experience breathe. It took a difficult night in Kasol to show me that the sequence matters more than the content.",
    body: [
      "There's a pattern I keep catching myself in. I reach for the meaning before I've let the experience breathe. It took a difficult night in Kasol to show me that the sequence matters more than the content.",
      "It was cold in a way the forecast hadn't promised, and the plan for the night had quietly fallen apart — no bonfire, no friends of friends, just the Parvati being loud in the dark and me with nowhere particular to be. I remember sitting on the guesthouse steps trying to decide what the trip meant. Not remembering it. Not feeling it. Captioning it, in real time, before it had even finished happening.",
      "That's the pattern. The moment something significant starts, a narrator wakes up in me and begins drafting. This will be the trip where. This is the year I finally. The experience gets interrupted mid-sentence by its own summary. And a summary written that early is almost always wrong, because it's written by the person I was before the thing changed me.",
      "What Kasol made obvious is that meaning has an order of operations. Experience first. Then residue — the parts that survive without being rehearsed. Then, much later, language. Skip a step and you don't get meaning at all; you get a caption. You get the postcard version of your own life, written by the least qualified person available: you, mid-moment, wanting it to matter.",
      "I notice it in everything now. In sets — the mixes that land are never the ones I narrated while playing; they're the ones I disappeared into and only understood on the ride home. In building — the projects that matter were never the ones with the manifesto written first. The order is always the same. Do the thing fully. Let it sit. Name it last.",
      "So that's the discipline I carried down from the mountains, more useful than any photograph: when something is happening, let it happen. The meaning isn't going anywhere. It's more patient than I am, and it writes better endings when I don't hover over its shoulder.",
    ],
    pullQuote: 'Meaning is not extracted. It settles.',
    pullQuoteAfter: 3,
  },
  {
    id: 'tx-003',
    index: 3,
    type: 'moment',
    date: 'May 2026',
    content:
      "Bohol taught me that presence isn't a thing you achieve. It's what's left when you stop trying to capture it.",
    media: {
      ratio: '3 / 4',
      ratioValue: 3 / 4,
      gradient:
        'radial-gradient(ellipse 60% 80% at 60% 30%, #0A1A3A 0%, #050810 100%)',
      alt: 'A quiet moment in Bohol',
    },
  },
  {
    id: 'tx-002',
    index: 2,
    type: 'thought',
    date: 'May 2026',
    content:
      "House music doesn't make me feel anything. It makes me feel everything I was already carrying but didn't have language for.",
  },
  {
    id: 'tx-001',
    index: 1,
    type: 'photo',
    date: 'Apr 2026',
    caption: 'EXT Moonshine. The set people kept talking about after.',
    media: {
      ratio: '16 / 9',
      ratioValue: 16 / 9,
      gradient:
        'radial-gradient(ellipse 100% 60% at 50% 80%, #1A0A08 0%, #080604 100%)',
      alt: 'EXT Moonshine — the set people kept talking about after',
    },
  },
]

export default function TransmitPage() {
  return (
    <main>
      {/* content assembles in via JS — without it, show everything plainly */}
      <noscript>
        <style>{`.${styles.st} { opacity: 1 !important; transform: none !important; }`}</style>
      </noscript>
      <TransmitFeed entries={TRANSMISSIONS} />
    </main>
  )
}
