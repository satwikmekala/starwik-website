/**
 * Scene A (Marcus's flat) and Scene B (the street), one shared cast of
 * sprites, three compositions:
 *  - desktop "world": the cut-away flat on the left two-thirds and the old
 *    building across the road on the right third, always visible;
 *  - mobile flat: a portrait room that fills the frame;
 *  - mobile street: a portrait view down onto the far pavement.
 * Characters, the stain and street people are drawn by the renderer from
 * story state; these lists are the furniture.
 */
import { DESKTOP } from '../art/flat-shell-desktop.ts'
import { MOBILE } from '../art/flat-shell-mobile.ts'
import { MOBILE_STREET } from '../art/street-shell-mobile.ts'
import type { Placement, SceneDef } from './types.ts'

const board = (x: number, y: number): Placement[] => [
  { id: 'board', sprite: 'corkboard', x, y, label: 'a pinboard beside the front door' },
  { id: 'tram-pass', sprite: 'tram-pass', x: x + 5, y: y + 5, label: 'a tram pass from Prague' },
  { id: 'wristband', sprite: 'wristband', x: x + 30, y: y + 6, label: 'a paper wristband from a club in Berlin' },
  { id: 'photo', sprite: 'photo', x: x + 6, y: y + 21, label: 'a photograph of a table by the sea' },
  { id: 'postcard', sprite: 'postcard', x: x + 29, y: y + 19, label: 'a postcard from Sintra: a white cliff over the Atlantic' },
]
const rug = (x: number, y: number): Placement => ({ id: 'rug', sprite: 'rug', parts: ['base'], x, y, label: 'the new rug' })
// the door is three placements so the hallway can sit between the frame and the open leaf
const door = (x: number, y: number): Placement[] => [
  { id: 'door', sprite: 'door', parts: ['frame', 'leaf'], x, y, label: 'the front door' },
  { id: 'hallway', sprite: 'hallway', parts: ['white'], x: x + 5, y: y + 5, label: 'the hallway beyond the door' },
  { id: 'door-open', sprite: 'door', parts: ['open'], x, y },
]
const glint = (x: number, y: number): Placement => ({ id: 'old-glint', sprite: 'old-building', parts: ['glint'], x, y })
const breakfast = (x: number, y: number): Placement => ({ id: 'breakfast', sprite: 'breakfast-table', parts: ['base', 'breakfast'], x, y, label: 'breakfast: eggs, and strawberries in a white bowl' })

export const flatDesktop: SceneDef = {
  name: 'world-desktop',
  canvas: { w: DESKTOP.w, h: DESKTOP.h },
  safe: DESKTOP.safe,
  sun: { x: 310, y: 74, w: 60, h: 78, floorTop: 226, floorBottom: 252, from: 286, to: 196 },
  beamAfter: 'rug',
  streetAfter: 'old-glint',
  items: [
    { id: 'cloud-1', sprite: 'cloud', parts: ['a'], x: 520, y: 4, drift: 0.6 },
    { id: 'cloud-2', sprite: 'cloud', parts: ['b'], x: 610, y: -44, drift: 0.35 },
    { id: 'street', sprite: 'flat-shell-desktop', parts: ['street'], x: 0, y: 0, canvas: true },
    { id: 'old-building', sprite: 'old-building', parts: ['base', 'towel'], x: 462, y: 38, label: 'across the road, the old building above a shuttered bank' },
    glint(462, 38),
    { id: 'shell', sprite: 'flat-shell-desktop', parts: ['building', 'room'], x: 0, y: 0, canvas: true },
    rug(150, 225),
    ...door(28, 110),
    ...board(92, 118),
    { id: 'window', sprite: 'window', x: 300, y: 68, label: 'the window, sun coming up over the buildings opposite' },
    { id: 'mug', sprite: 'mug', x: 356, y: 142, label: 'a mug of coffee on the sill' },
    { id: 'sofa', sprite: 'sofa', x: 156, y: 184, label: 'the sofa' },
    { id: 'lamp', sprite: 'lamp', x: 252, y: 140, label: 'a floor lamp' },
    { id: 'plant', sprite: 'plant', x: 382, y: 162, label: 'the plant by the window' },
    { id: 'coffee-table', sprite: 'coffee-table', x: 184, y: 228 },
    { id: 'chair', sprite: 'chair', x: 278, y: 186 },
    { id: 'dishcloth', sprite: 'dishcloth', x: 275, y: 184 },
    breakfast(308, 188),
  ],
}

export const flatMobile: SceneDef = {
  name: 'flat-mobile',
  canvas: { w: MOBILE.w, h: MOBILE.h },
  safe: MOBILE.safe,
  // window on the left, so the light travels right across the rug; the
  // top-right corner stays clear for the docked view of the old window
  sun: { x: 12, y: 20, w: 60, h: 78, floorTop: 202, floorBottom: 290, from: 4, to: 70 },
  beamAfter: 'rug',
  items: [
    { id: 'shell', sprite: 'flat-shell-mobile', parts: ['room'], x: 0, y: 0, canvas: true },
    rug(24, 210),
    ...door(124, 88),
    ...board(66, 116),
    { id: 'window', sprite: 'window', x: 2, y: 14, label: 'the window, sun coming up over the buildings opposite' },
    { id: 'mug', sprite: 'mug', x: 62, y: 88, label: 'a mug of coffee on the sill' },
    { id: 'plant', sprite: 'plant', x: 0, y: 138, label: 'the plant by the window' },
    { id: 'sofa', sprite: 'sofa', x: 28, y: 158, label: 'the sofa' },
    { id: 'coffee-table', sprite: 'coffee-table', x: 64, y: 212 },
    { id: 'lamp', sprite: 'lamp', x: 154, y: 196, label: 'a floor lamp' },
    breakfast(2, 234),
    { id: 'chair', sprite: 'chair', x: 66, y: 234, flip: true },
    { id: 'dishcloth', sprite: 'dishcloth', x: 82, y: 232 },
  ],
}

export const streetMobile: SceneDef = {
  name: 'street-mobile',
  canvas: { w: MOBILE_STREET.w, h: MOBILE_STREET.h },
  safe: MOBILE_STREET.safe,
  streetAfter: 'old-glint',
  items: [
    { id: 'cloud-1', sprite: 'cloud', parts: ['a'], x: 96, y: -40 },
    { id: 'street', sprite: 'street-shell-mobile', x: 0, y: 0, canvas: true },
    { id: 'old-building', sprite: 'old-building', parts: ['base', 'towel'], x: -19, y: 4, label: 'across the road, the old building above a shuttered bank' },
    glint(-19, 4),
  ],
}
