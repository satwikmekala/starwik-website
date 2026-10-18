import { sprite } from './lib/sprite.ts'

/** The postcard from Sintra, bought and never sent: a white cliff over the Atlantic. */
export default sprite('postcard', 22, 15, 'a postcard of a white cliff over the Atlantic', (r) => {
  r.box(0, 0, 22, 15, 'cloud')
  r.stamp(2, 2, [
    'ssssssssssbbbsssss',
    'ssssssssssbwwbbsss',
    'sssssssssbwwwwwbss',
    'bbbbbbbbbbwwwwwwbb',
    'bsbbbbsbbbwwwwwwww',
    'bbbbbbbbbwwwwwwwww',
    'bbbsbbbbbwwwwwwwww',
    'bbbbbbbbbbwwwwwwww',
    'bbbbbbbbbbbwwwwwww',
    'bbbbbbbbbbbbwwwwww',
    'bbbbbbbbbbbbbbbwww',
  ])
  r.rect(10, 0, 2, 2, 'berry')
})
