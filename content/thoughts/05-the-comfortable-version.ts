import type { Thought } from './types'

/*
 * PLACEHOLDER — the subtitle is from your old Transmit log (tx-006);
 * the body is temporary copy. Replace freely.
 */

const thought: Thought = {
  slug: 'the-comfortable-version',
  number: '05',
  title: 'the comfortable\nversion',
  subtitle: 'the version of you that got comfortable\nis not the version of you that wanted this.',
  date: '2026-07',
  coverImage: {
    // TEMPORARY photograph
    src: '/images/front page.JPG',
    alt: 'A crowded room at night, faces turned toward the booth',
    position: 'center 35%',
  },
  body: [
    {
      type: 'paragraph',
      text: "Wanting something is loud. It keeps you up. It makes you send the message, book the ticket, carry the pen drive across an ocean on the off chance. Then you get a little of it, and the wanting goes quiet, and a calmer person moves in — someone who's grateful, reasonable, and slowly, politely, stops trying.",
    },
    {
      type: 'paragraph',
      text: "I like that person. I just don't trust him with the plan. He'd rather keep what we have than risk it for what we said we were going to build.",
    },
    {
      type: 'quote',
      text: 'comfort is a reward. it was never supposed to be the destination.',
    },
    {
      type: 'paragraph',
      text: 'So every few months I try to go back and find the other one — the version who wanted this badly enough to be embarrassing about it — and ask what he would do next. He is usually right. He is usually terrifying.',
    },
  ],
}

export default thought
