import type { Thought } from './types'

/*
 * Carried over from the old Transmit log (tx-004) — your words, unchanged.
 * Only the photograph is temporary.
 */

const thought: Thought = {
  slug: 'the-order-of-operations',
  number: '02',
  title: 'the order\nof operations',
  subtitle: 'meaning is not extracted.\nit settles.',
  date: '2026-06',
  coverImage: {
    // TEMPORARY photograph
    src: '/images/The RU EXPERIENCE.jpg',
    alt: 'A dark room, screens glowing, hands raised toward the light',
    position: 'center 38%',
  },
  body: [
    {
      type: 'paragraph',
      text: "There's a pattern I keep catching myself in. I reach for the meaning before I've let the experience breathe. It took a difficult night in Kasol to show me that the sequence matters more than the content.",
    },
    {
      type: 'paragraph',
      text: "It was cold in a way the forecast hadn't promised, and the plan for the night had quietly fallen apart — no bonfire, no friends of friends, just the Parvati being loud in the dark and me with nowhere particular to be. I remember sitting on the guesthouse steps trying to decide what the trip meant. Not remembering it. Not feeling it. Captioning it, in real time, before it had even finished happening.",
    },
    {
      type: 'paragraph',
      text: "That's the pattern. The moment something significant starts, a narrator wakes up in me and begins drafting. This will be the trip where. This is the year I finally. The experience gets interrupted mid-sentence by its own summary. And a summary written that early is almost always wrong, because it's written by the person I was before the thing changed me.",
    },
    {
      type: 'paragraph',
      text: "What Kasol made obvious is that meaning has an order of operations. Experience first. Then residue — the parts that survive without being rehearsed. Then, much later, language. Skip a step and you don't get meaning at all; you get a caption. You get the postcard version of your own life, written by the least qualified person available: you, mid-moment, wanting it to matter.",
    },
    { type: 'quote', text: 'Meaning is not extracted. It settles.' },
    {
      type: 'paragraph',
      text: "I notice it in everything now. In sets — the mixes that land are never the ones I narrated while playing; they're the ones I disappeared into and only understood on the ride home. In building — the projects that matter were never the ones with the manifesto written first. The order is always the same. Do the thing fully. Let it sit. Name it last.",
    },
    {
      type: 'paragraph',
      text: "So that's the discipline I carried down from the mountains, more useful than any photograph: when something is happening, let it happen. The meaning isn't going anywhere. It's more patient than I am, and it writes better endings when I don't hover over its shoulder.",
    },
  ],
}

export default thought
