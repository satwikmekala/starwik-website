import type { Thought } from './types'

/*
 * PLACEHOLDER — the subtitle is from your old Transmit log (tx-003, Bohol);
 * the body is temporary copy. Replace freely.
 */

const thought: Thought = {
  slug: 'whats-left',
  number: '04',
  title: "what's left",
  subtitle: "presence isn't a thing you achieve.\nit's what's left when you stop\ntrying to capture it.",
  date: '2026-05',
  coverImage: {
    // TEMPORARY photograph
    src: '/images/tequila sunrise.jpg',
    alt: 'A bamboo bar at night, edged in orange neon',
    position: 'center 45%',
  },
  body: [
    {
      type: 'paragraph',
      text: 'On Bohol I kept reaching for my phone to keep the moment, and every time I did, the moment left. The river was still there. The light was still there. But I had stepped half out of it to make a copy.',
    },
    {
      type: 'paragraph',
      text: "Somewhere in the second week I stopped. Not as a rule — I just forgot. And the days got strangely long. An afternoon could hold a swim, a nap, a conversation with a stranger about nothing, and still have room left over. I hadn't found presence. I'd just stopped leaving.",
    },
    {
      type: 'image',
      // TEMPORARY photograph
      src: '/images/open-water-boat-party.jpg',
      alt: 'An afternoon crowd dancing on the deck of a boat',
      caption: 'one of the few i did take.',
      width: 'column',
      aspectRatio: '3 / 2',
    },
    {
      type: 'paragraph',
      text: "I don't have many photographs from that stretch. I have something better and much harder to show anyone: the feeling that I was there for all of it.",
    },
  ],
}

export default thought
