import { sprite } from './lib/sprite.ts'

/** A photograph of a table by the sea. */
export default sprite('photo', 16, 14, 'a photograph of a table by the sea', (r) => {
  r.box(0, 0, 16, 14, 'cloud')
  r.stamp(2, 2, [
    'ssssssssssss',
    'ssssssssssss',
    'bbbbbbbbbbbb',
    'bbbbbbbbbbbb',
    'bccccccccccb',
    'bbkbbbbbbkbb',
    'bbkbbbbbbkbb',
    'cckcccccckcc',
  ])
  r.rect(7, 0, 2, 2, 'berry')
})
