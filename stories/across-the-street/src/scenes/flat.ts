/**
 * Scene A — Marcus's flat. One shared cast of sprites, two compositions:
 * a wide cutaway with the old building always visible on the right third
 * (desktop), and a portrait room that fills the frame (mobile), where the
 * old window lives in a docked peripheral view instead.
 */
import { DESKTOP } from '../art/flat-shell-desktop.ts'
import { MOBILE } from '../art/flat-shell-mobile.ts'
import type { SceneDef } from './types.ts'

const board = (x: number, y: number) => [
  { id: 'board', sprite: 'corkboard', x, y, label: 'a pinboard beside the front door' },
  { id: 'tram-pass', sprite: 'tram-pass', x: x + 5, y: y + 5, label: 'a tram pass from Prague' },
  { id: 'wristband', sprite: 'wristband', x: x + 30, y: y + 6, label: 'a paper wristband from a club in Berlin' },
  { id: 'photo', sprite: 'photo', x: x + 6, y: y + 21, label: 'a photograph of a table by the sea' },
  { id: 'postcard', sprite: 'postcard', x: x + 29, y: y + 19, label: 'a postcard from Sintra: a white cliff over the Atlantic' },
]

export const flatDesktop: SceneDef = {
  name: 'flat-desktop',
  canvas: { w: DESKTOP.w, h: DESKTOP.h },
  safe: DESKTOP.safe,
  sun: { x: 310, y: 74, w: 60, h: 78, floorTop: 226, floorBottom: 252, from: 284, to: 150 },
  beamAfter: 'rug',
  items: [
    { id: 'cloud-1', sprite: 'cloud', parts: ['a'], x: 520, y: 6 },
    { id: 'cloud-2', sprite: 'cloud', parts: ['b'], x: 120, y: -46 },
    { id: 'street', sprite: 'flat-shell-desktop', parts: ['street'], x: 0, y: 0, canvas: true },
    { id: 'old-building', sprite: 'old-building', parts: ['base', 'towel'], x: 462, y: 38, label: 'across the road, the old building above a shuttered bank' },
    { id: 'shell', sprite: 'flat-shell-desktop', parts: ['building', 'room'], x: 0, y: 0, canvas: true },
    { id: 'rug', sprite: 'rug', parts: ['base', 'stain-1', 'stain-2', 'stain-3', 'ring'], hidden: ['stain-1', 'stain-2', 'stain-3', 'ring'], x: 150, y: 225, label: 'the new rug' },
    { id: 'door', sprite: 'door', x: 28, y: 110, label: 'the front door' },
    ...board(92, 118),
    { id: 'window', sprite: 'window', x: 300, y: 68, label: 'the window, sun coming up over the buildings opposite' },
    { id: 'mug', sprite: 'mug', x: 356, y: 142, label: 'a mug of coffee on the sill' },
    { id: 'sofa', sprite: 'sofa', x: 156, y: 184, label: 'the sofa' },
    { id: 'lamp', sprite: 'lamp', x: 252, y: 140 },
    { id: 'plant', sprite: 'plant', x: 382, y: 162, label: 'the plant by the window' },
    { id: 'coffee-table', sprite: 'coffee-table', x: 184, y: 228 },
    { id: 'chair', sprite: 'chair', x: 278, y: 186 },
    { id: 'dishcloth', sprite: 'dishcloth', x: 275, y: 184 },
    { id: 'breakfast', sprite: 'breakfast-table', parts: ['base', 'breakfast'], x: 308, y: 188, label: 'breakfast: eggs, and strawberries in a white bowl' },
  ],
}

export const flatMobile: SceneDef = {
  name: 'flat-mobile',
  canvas: { w: MOBILE.w, h: MOBILE.h },
  safe: MOBILE.safe,
  // window on the left, so the light travels right across the rug; the
  // top-right corner stays clear for the docked view of the old window
  sun: { x: 12, y: 20, w: 60, h: 78, floorTop: 202, floorBottom: 290, from: 6, to: 118 },
  beamAfter: 'rug',
  items: [
    { id: 'shell', sprite: 'flat-shell-mobile', parts: ['room'], x: 0, y: 0, canvas: true },
    { id: 'rug', sprite: 'rug', parts: ['base', 'stain-1', 'stain-2', 'stain-3', 'ring'], hidden: ['stain-1', 'stain-2', 'stain-3', 'ring'], x: 24, y: 210, label: 'the new rug' },
    { id: 'door', sprite: 'door', x: 124, y: 88, label: 'the front door' },
    ...board(66, 116),
    { id: 'window', sprite: 'window', x: 2, y: 14, label: 'the window, sun coming up over the buildings opposite' },
    { id: 'mug', sprite: 'mug', x: 62, y: 88, label: 'a mug of coffee on the sill' },
    { id: 'plant', sprite: 'plant', x: 0, y: 138, label: 'the plant by the window' },
    { id: 'sofa', sprite: 'sofa', x: 28, y: 158, label: 'the sofa' },
    { id: 'coffee-table', sprite: 'coffee-table', x: 64, y: 212 },
    { id: 'lamp', sprite: 'lamp', x: 154, y: 196 },
    { id: 'breakfast', sprite: 'breakfast-table', parts: ['base', 'breakfast'], x: 2, y: 234, label: 'breakfast: eggs, and strawberries in a white bowl' },
    { id: 'chair', sprite: 'chair', x: 66, y: 234, flip: true },
    { id: 'dishcloth', sprite: 'dishcloth', x: 82, y: 232 },
  ],
}
