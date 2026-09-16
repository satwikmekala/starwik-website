import type { Transition } from 'framer-motion'

// One vocabulary of movement for the whole listening room: weighted, confident,
// never cartoonish. Press is quick and tight; morphs carry mass.

export const press: Transition = { type: 'spring', stiffness: 520, damping: 30, mass: 0.7 }

export const morph: Transition = { type: 'spring', stiffness: 190, damping: 28, mass: 1 }

export const settle: Transition = { type: 'spring', stiffness: 300, damping: 30 }

export const hover: Transition = { type: 'spring', stiffness: 380, damping: 26, mass: 0.8 }

/** screen-to-screen: crossfade with a slight vertical slide */
export const drift: Transition = { duration: 0.28, ease: [0.22, 1, 0.36, 1] }

export const tapScale = { scale: 0.96 }
