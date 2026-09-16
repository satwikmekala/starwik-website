import type { Thought } from './types'

/*
 * PLACEHOLDER — loosely after the Vol. 04 night on the ORR;
 * temporary copy and a temporary photograph. Replace freely.
 */

const thought: Thought = {
  slug: 'the-long-way-home',
  number: '06',
  title: 'the long way\nhome',
  subtitle: 'some nights the only plan\nis the road.',
  date: '2026-08',
  coverImage: {
    // TEMPORARY photograph
    src: '/images/antisocial.jpg',
    alt: 'Fog and cold light hanging over an empty stage',
    position: 'center 50%',
  },
  body: [
    {
      type: 'paragraph',
      text: "The recording had gone wrong in every way a recording can go wrong, and none of us wanted to go home and think about it. So we drove. No destination, just the ring road unspooling in the dark and the set playing back through a phone speaker, flaws and all.",
    },
    {
      type: 'paragraph',
      text: 'Somewhere past the exit for the airport it stopped sounding like a failure. It sounded like a night. The mistakes had edges you could hold on to. The parts that worked sounded better for having survived.',
    },
    {
      type: 'paragraph',
      text: "I don't remember turning around. I remember the lights along the median going by like a slow metronome, and thinking that the plan had never really been the point. The point was that we were still in the car, still listening.",
    },
  ],
}

export default thought
