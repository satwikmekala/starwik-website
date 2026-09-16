import type { Thought } from './types'

/*
 * PLACEHOLDER COPY — written to exercise the reading experience
 * (paragraphs, headings, quotes, a break, a wide photograph, the ending).
 * Replace every word with your own.
 */

const thought: Thought = {
  slug: 'superposition-of-love',
  number: '01',
  title: 'superposition\nof love',
  subtitle: 'maybe every universe is simply\nlooking for a way to touch.',
  date: '2026-09',
  coverImage: {
    // TEMPORARY — swap for the dusk / night photograph this thought belongs to
    src: '/images/ext-clubroom.jpg',
    alt: 'A dark room lit by a single red glow',
    position: 'center 42%',
  },
  body: [
    { type: 'heading', text: 'i. the many' },
    {
      type: 'paragraph',
      text: "There's an idea in physics I keep returning to, mostly because I don't fully understand it. Before anything is observed, a particle isn't here or there. It's in every place it could be at once — a smear of possibilities, each one real enough to interfere with the others. Only when something looks does it settle into a single answer.",
    },
    {
      type: 'paragraph',
      text: "I'm not a physicist. I'm someone who reads the first half of articles about physics at two in the morning and then lies awake with them. But this one stayed, because it describes something I'd already felt long before I had a word for it: meeting someone and sensing, underneath the small talk, every version of the two of you that could happen.",
    },
    {
      type: 'paragraph',
      text: "Strangers at a party. A friend of a friend at the edge of a dance floor. You say something about the music; they laugh at the wrong part of the sentence. And for a moment the air is crowded — with the version where you never speak again, the version where you do, the one where it's a single perfect night and the one where it's ten years and a shared kitchen. All of them present. None of them chosen.",
    },
    {
      type: 'quote',
      text: 'every almost is still an entire world somewhere.',
      cite: 'a note on my phone, 3:14 am',
    },
    {
      type: 'paragraph',
      text: "I think that crowded feeling is what we mean when we say *chemistry*. It isn't certainty. It's the opposite. It's standing inside all the possibilities at once and feeling how much each of them weighs.",
    },
    { type: 'heading', text: 'ii. the collapse' },
    {
      type: 'paragraph',
      text: "The trouble with superposition is that it can't last. Look, and it's gone. The particle picks a place, and every other place it might have been quietly stops being true.",
    },
    {
      type: 'paragraph',
      text: 'Love works like that too, I think. Choosing someone is an act of observation. You stop looking at everything the two of you could be and start looking at what you actually are — the specific laugh, the specific silence in the car, the specific way they leave cupboard doors open. The cloud collapses into a person. And a person is so much smaller than a possibility, and so much more real.',
    },
    {
      type: 'paragraph',
      text: "For a long time I was scared of that collapse. I liked the crowded air. Almosts are safe; nothing that never happened can disappoint you. I stayed in superposition with people for months — texting at the edge of meaning, never saying the sentence that would make it one thing or another. I told myself I was keeping my options open. Mostly I was keeping myself from being seen.",
    },
    {
      type: 'image',
      // TEMPORARY photograph
      src: '/images/ext-moonshine.jpg',
      alt: 'A hand reaching across the decks toward the DJ during an afternoon set',
      caption: 'a hand, reaching across the booth.',
      width: 'wide',
      aspectRatio: '16 / 9',
      position: 'center 40%',
    },
    {
      type: 'paragraph',
      text: "Playing music taught me something about this, strangely. Before a set, every track in my bag is possible. The night could go anywhere. It's thrilling and it's useless — a set that stays possible is just a folder of files. The magic only starts when I commit to one record, and then another, and let each choice close a hundred doors so that one room can open. Nobody dances to what I could play. They dance to what I play.",
    },
    { type: 'heading', text: 'iii. the touch' },
    {
      type: 'paragraph',
      text: "Here is the part I can't prove, and don't need to. I don't think the other versions disappear. I think they go on somewhere — in universes stacked so close to ours that we can feel them on quiet nights, a kind of pressure behind the air. In one of them we never met. In one of them we met too early and ruined it. In one of them it's still that first night, and the song hasn't ended.",
    },
    {
      type: 'paragraph',
      text: 'And in all of them — this is the part that undoes me — something is reaching. Two hands, a few centimetres apart, in every configuration the world allows. Some of them touch. Most of them don\'t. The reaching is the constant. The reaching is the one thing that is true in every version.',
    },
    {
      type: 'quote',
      text: "we are not the only pair of hands. we're just the pair that got here.",
    },
    {
      type: 'paragraph',
      text: 'Maybe that is what love is, underneath all the stories we tell about it. Not fate — fate is too tidy. Just the stubborn, universal fact of reaching. A tendency written into everything that exists to lean toward something else. Gravity with feelings. Particles with a longing they cannot name.',
    },
    { type: 'break' },
    {
      type: 'paragraph',
      text: "I don't know how this ends. That's the honest answer, and I've learned to be less afraid of it. Every morning the possibilities come back, crowded and loud, and every day I get to choose which one to look at. Some days I choose badly. Some days I look away entirely. But I keep choosing, and each time I do, somewhere in the stack of worlds, a door closes and a room opens.",
    },
    {
      type: 'paragraph',
      text: "So I'll leave the other versions where they are. I hope they're kind to each other. I hope some of them are dancing.",
    },
    {
      type: 'paragraph',
      text: "And I'll stay here, in the one where I'm writing this down, still reaching — because *maybe every universe is simply looking for a way to touch.*",
    },
  ],
}

export default thought
