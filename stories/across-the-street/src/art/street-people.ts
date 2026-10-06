import { small } from './lib/figure.ts'
import { sprite } from './lib/sprite.ts'
import type { Raster } from './lib/raster.ts'

/** The man, seen from Marcus's window: pacing three steps each way, phone to his ear. */
export const manSmall = sprite('man-small', 12, 27, 'the man in the long dark coat, pacing', {
  'pace-0': (r) => small(r, { cx: 6, body: 'coat', arm: 'ear' }),
  'pace-1': (r) => small(r, { cx: 6, body: 'coat', arm: 'ear', step: 1 }),
  'pace-2': (r) => small(r, { cx: 6, body: 'coat', arm: 'ear', step: 2 }),
  look: (r) => small(r, { cx: 6, body: 'coat' }),
  'walk-1': (r) => small(r, { cx: 6, body: 'coat', step: 1 }),
  'walk-2': (r) => small(r, { cx: 6, body: 'coat', step: 2 }),
})

function crates(r: Raster) {
  const w = { weight: 1 }
  for (const x of [0, 13]) {
    r.box(x, 17, 13, 10, 'cream', w)
    r.rect(x + 1, 21, 11, 1, 'line')
  }
  for (let x = 2; x < 25; x += 3) { r.set(x, 16, 'berry'); r.set(x + 1, 15, x % 2 ? 'berry' : 'coffee') }
}

/** The fruit seller and his wooden crates outside the grocer. */
export const fruitSeller = sprite('fruit-seller', 40, 27, 'a fruit seller setting out wooden crates', {
  base: (r) => { small(r, { cx: 32, body: 'apron', arm: 'out' }); crates(r) },
  look: (r) => { small(r, { cx: 32, body: 'apron' }); crates(r); r.rect(31, 2, 3, 1, 'line') },
  argue: (r) => { small(r, { cx: 32, body: 'apron', arm: 'out' }); crates(r) },
})

/** An old woman haggling over the oranges (After). Faces left toward the seller. */
export const oldWoman = sprite('old-woman', 12, 27, 'an old woman arguing over the price of oranges', {
  base: (r) => small(r, { cx: 6, body: 'old', arm: 'out' }),
})

function bike(r: Raster, x: number, pedal: 0 | 1) {
  const w = { weight: 1 }
  r.solid(r.mask().oval(x, 12, 9, 9), null, w)                       // wheels
  r.solid(r.mask().oval(x + 14, 12, 9, 9), null, w)
  r.line(x + 4, 16, x + 9, 11, 'line', 1); r.line(x + 9, 11, x + 18, 11, 'line', 1)
  r.line(x + 18, 11, x + 18, 16, 'line', 1); r.line(x + 9, 11, x + 12, 16, 'line', 1)
  // rider, seated, leaning on the bars
  r.solid(r.mask().oval(x + 7, 0, 6, 6), 'cream', w)
  r.fill(r.mask().oval(x + 7, 0, 6, 6).rect(x + 7, 2, 6, 4, 0), 'line')
  r.box(x + 7, 5, 6, 6, 'cloud', w)
  r.line(x + 12, 6, x + 17, 9, 'cream', 1)
  r.line(x + 9, 11, x + 10 + pedal * 2, 15, 'sky', 2)
}

/** Two boys moving slowly past on bicycles. */
export const bikes = sprite('bikes', 50, 22, 'two boys moving slowly past on bicycles', {
  a: (r) => { bike(r, 0, 0); bike(r, 26, 1) },
  b: (r) => { bike(r, 0, 1); bike(r, 26, 0) },
})

function dog(r: Raster, x: number, pulling: boolean) {
  const w = { weight: 1 }
  r.box(x, 19, 10, 5, 'cream', w)                                     // body
  r.box(x + (pulling ? 8 : -3), 16, 5, 5, 'cream', w)                 // head
  r.rect(x + 1, 24, 1, 3, 'line'); r.rect(x + 8, 24, 1, 3, 'line')     // legs
  r.rect(pulling ? x - 2 : x + 10, pulling ? 18 : 17, 2, 1, 'line')   // tail
}

/** A woman negotiating with a dog that has decided the walk is over; in After the dog has won. */
export const womanDog = sprite('woman-dog', 32, 27, 'a woman and a stubborn dog', {
  stubborn: (r) => { small(r, { cx: 5, body: 'dress', arm: 'leash' }); dog(r, 21, false); r.line(9, 15, 19, 18, 'line', 1) },
  home: (r) => { small(r, { cx: 5, body: 'dress', arm: 'leash', step: 1 }); dog(r, 17, true); r.line(9, 14, 25, 17, 'line', 1) },
})
