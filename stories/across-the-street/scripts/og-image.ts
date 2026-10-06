/**
 * Draws the Open Graph image (1200×630) in the story's own style, from the
 * same compiled drawings: the desktop world at 2×, Marcus at the window
 * with his coffee, the man pacing under the old window, and the title in a
 * hand-made 5×7 pixel face. Writes public/stories/across-the-street/og.png.
 *
 *   npm run story:og
 */
import { writeFileSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'
import { SPRITES } from '../src/art/index.ts'
import { INKS, type Ink } from '../src/art/palette.ts'
import { render } from '../src/art/lib/sprite.ts'
import { flatDesktop } from '../src/scenes/flat.ts'
import { SPOTS, STREET } from '../src/direction.ts'

const here = dirname(fileURLToPath(import.meta.url))
const css = readFileSync(join(here, '../src/styles/tokens.css'), 'utf8')
const hex = (ink: Ink) => css.match(new RegExp(`--${ink}-calm:\\s*(#[0-9a-f]{6})`))![1]
const RGB = [[0, 0, 0], ...INKS.map((i) => [1, 3, 5].map((k) => parseInt(hex(i).slice(k, k + 2), 16)))]

const W = 600, H = 315, S = 2, OX = 100, OY = 120 // crop of the 800×520 canvas
const buf = new Uint8Array(W * H).fill(INKS.indexOf('sky') + 1)
const defs = Object.fromEntries(SPRITES.map((d) => [d.name, d]))
const blit = (name: string, part: string, x: number, y: number) => {
  const r = render(defs[name], part)
  for (let j = 0; j < r.h; j++) for (let i = 0; i < r.w; i++) {
    const v = r.cells[j * r.w + i], tx = x + i - OX, ty = y + j - OY
    if (v && tx >= 0 && ty >= 0 && tx < W && ty < H) buf[ty * W + tx] = v
  }
}
const { safe } = flatDesktop
for (const it of flatDesktop.items) {
  if (['hallway', 'door-open', 'old-glint', 'mug'].includes(it.id)) continue // the mug is in his hand
  const parts = it.parts ?? (defs[it.sprite].parts.base ? ['base'] : Object.keys(defs[it.sprite].parts).slice(0, 1))
  for (const p of parts) blit(it.sprite, p, it.canvas ? it.x : it.x + safe.x, it.canvas ? it.y : it.y + safe.y)
  if (it.id === 'old-building') {
    const st = STREET.desktop
    blit('woman-dog', 'stubborn', st.dog[0] + safe.x, st.dog[1] + safe.y)
    blit('fruit-seller', 'base', st.seller[0] + safe.x, st.seller[1] + safe.y)
    blit('man-small', 'pace-1', st.pace[0] + 6 + safe.x, st.pace[1] + safe.y)
  }
}
const [mx, my] = SPOTS.desktop.marcus.window!
blit('marcus', 'mug', mx - 28 + safe.x, my - 98 + safe.y)

// title: a tiny hand-made pixel face, drawn on the open wall
const GLYPHS: Record<string, string[]> = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  C: ['.####', '#....', '#....', '#....', '#....', '#....', '.####'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  ' ': ['...', '...', '...', '...', '...', '...', '...'],
}
const ink = INKS.indexOf('text') + 1
const cx = 16
let cy = 10
for (const line of ['ACROSS', 'THE STREET']) {
  let x = cx
  for (const ch of line) {
    const g = GLYPHS[ch]
    g.forEach((row, j) => [...row].forEach((c, i) => {
      if (c === '#') for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) buf[(cy + j * 3 + dy) * W + x + i * 3 + dx] = ink
    }))
    x += (g[0].length + 1) * 3
  }
  cy += 26
}

// PNG (RGB, 8-bit), scaled ×2 nearest-neighbour
const rows: Buffer[] = []
for (let y = 0; y < H * S; y++) {
  const row = Buffer.alloc(1 + W * S * 3)
  for (let x = 0; x < W * S; x++) row.set(RGB[buf[Math.floor(y / S) * W + Math.floor(x / S)]], 1 + x * 3)
  rows.push(row)
}
const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0 })
const crc = (b: Buffer) => { let c = 0xffffffff; for (const v of b) c = crcTable[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
const chunk = (type: string, data: Buffer) => { const t = Buffer.concat([Buffer.from(type), data]); const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const c = Buffer.alloc(4); c.writeUInt32BE(crc(t)); return Buffer.concat([len, t, c]) }
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W * S, 0); ihdr.writeUInt32BE(H * S, 4); ihdr[8] = 8; ihdr[9] = 2
const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(Buffer.concat(rows), { level: 9 })), chunk('IEND', Buffer.alloc(0))])
const out = join(here, '../../../public/stories/across-the-street/og.png')
writeFileSync(out, png)
console.log(`og image ${W * S}×${H * S}, ${(png.length / 1024).toFixed(1)} KB → ${out}`)
