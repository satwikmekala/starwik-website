import type { Thought } from './types'

/*
 * PLACEHOLDER — the subtitle is from your old Transmit log (tx-002);
 * the body is temporary copy. Replace freely.
 */

const thought: Thought = {
  slug: 'everything-i-was-already-carrying',
  number: '03',
  title: 'everything i was\nalready carrying',
  subtitle: "house music doesn't make me feel anything —\nit makes me feel what i was already carrying.",
  date: '2026-05',
  coverImage: {
    // TEMPORARY photograph
    src: '/images/krunklive.jpg',
    alt: 'A figure behind the decks in a bar lit by warm, low light',
    position: 'center 40%',
    mobilePosition: 'center 30%',
  },
  body: [
    {
      type: 'paragraph',
      text: "People ask what a certain track makes me feel, and I never have a good answer. The honest one sounds strange out loud: it doesn't make me feel anything. It just gives the things I was already carrying somewhere to go.",
    },
    {
      type: 'paragraph',
      text: "A week of small disappointments I didn't have time to look at. A conversation I replayed on the drive over. Some happiness I hadn't told anyone about yet. They come in with me, folded up, and somewhere around the second breakdown the kick drum comes back and they unfold on their own.",
    },
    {
      type: 'quote',
      text: "the floor isn't where you escape your life. it's where your life finally gets a word in.",
    },
    {
      type: 'paragraph',
      text: "I think that's why the best nights feel less like forgetting and more like remembering. Nobody on a good dance floor is empty. Everyone is carrying something, and for a few hours the music is patient enough to let them set it down without having to explain it.",
    },
    { type: 'break' },
    {
      type: 'paragraph',
      text: 'I play for that. Not to make anyone feel something new — just to make enough room for what they brought.',
    },
  ],
}

export default thought
