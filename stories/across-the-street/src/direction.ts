/**
 * Staging. Story text lives in content/beats.json; HOW each beat is shown
 * lives here, keyed by beat id. A beat only lists what changes; everything
 * else carries forward from the beat before (so a new beat added to
 * beats.json simply inherits the staging around it).
 *
 * Shots and positions are named and defined per layout, so one direction
 * drives both the desktop world and the portrait mobile scenes.
 */
import type { Layout } from './engine/layout.ts'

export type Rect = readonly [x: number, y: number, w: number, h: number]
export type ShotName =
  | 'wide' | 'rug' | 'breakfast' | 'board' | 'boardman' | 'lean' | 'oldwin' | 'oldbuilding'
  | 'street' | 'streetclose' | 'window' | 'marcus' | 'door' | 'doorway' | 'roomleft'
  | 'man' | 'two' | 'phone' | 'pair' | 'pairbeam'

export interface Shot {
  /** Rectangle to frame (safe-frame units of the shot's scene)… */
  rect?: Rect
  /** …or follow actors: frame them with this much padding. */
  follow?: readonly ('marcus' | 'man' | 'phone')[]
  pad?: readonly [x: number, y: number]
  /** Desktop copy column: 'left' reserves it; 'over' lays copy on empty wall/sky. */
  copy?: 'left' | 'over'
  /** Mobile only: which canvas this shot looks at. */
  scene?: 'flat' | 'street'
}

const D = (rect: Rect, copy: Shot['copy'] = 'left'): Shot => ({ rect, copy })
const F = (follow: Shot['follow'], pad: readonly [number, number] = [18, 16]): Shot => ({ follow, pad, copy: 'left' })
const M = (rect: Rect, scene: Shot['scene'] = 'flat'): Shot => ({ rect, scene })

export const SHOTS: Record<Layout, Record<ShotName, Shot>> = {
  desktop: {
    wide: D([0, 0, 640, 360], 'over'),
    rug: D([128, 190, 176, 74]),
    breakfast: D([258, 140, 136, 112]),
    board: D([84, 110, 74, 56]),
    boardman: D([70, 104, 170, 150]),
    lean: D([200, 20, 440, 300]),
    oldwin: D([532, 84, 78, 76]),
    oldbuilding: D([446, 28, 194, 292]),
    street: D([430, 248, 210, 96]),
    streetclose: D([528, 266, 96, 52]),
    window: D([200, 66, 216, 196]),
    marcus: F(['marcus'], [26, 14]),
    door: D([14, 98, 86, 140]),
    doorway: D([30, 112, 52, 114]),
    roomleft: D([0, 84, 320, 180]),
    man: F(['man'], [26, 14]),
    two: F(['marcus', 'man'], [22, 16]),
    phone: F(['phone'], [46, 40]),
    pair: F(['marcus', 'man'], [30, 20]),
    pairbeam: D([170, 60, 260, 200]),
  },
  mobile: {
    wide: M([0, 0, 180, 300]),
    rug: M([10, 184, 160, 84]),
    breakfast: M([0, 206, 104, 94]),
    board: M([62, 110, 66, 50]),
    boardman: M([54, 96, 126, 160]),
    lean: M([0, 0, 180, 290], 'street'),
    oldwin: M([60, 60, 62, 60], 'street'),
    oldbuilding: M([0, 0, 180, 282], 'street'),
    street: M([0, 176, 180, 124], 'street'),
    streetclose: M([46, 232, 96, 56], 'street'),
    window: M([20, 60, 160, 210]),
    marcus: { follow: ['marcus'], pad: [20, 14], scene: 'flat' },
    door: M([108, 78, 80, 134]),
    doorway: M([124, 88, 56, 122]),
    roomleft: M([0, 0, 180, 300]),
    man: { follow: ['man'], pad: [20, 14], scene: 'flat' },
    two: { follow: ['marcus', 'man'], pad: [16, 14], scene: 'flat' },
    phone: { follow: ['phone'], pad: [36, 34], scene: 'flat' },
    pair: { follow: ['marcus', 'man'], pad: [22, 18], scene: 'flat' },
    pairbeam: M([0, 10, 180, 280]),
  },
}

/** Where people stand: [centre x, feet y] in safe-frame units. */
export type Spot = 'table' | 'window' | 'rug' | 'mid' | 'pair' | 'door' | 'board' | 'room' | 'over'
export const SPOTS: Record<Layout, { marcus: Partial<Record<Spot, readonly [number, number]>>; man: Partial<Record<Spot, readonly [number, number]>> }> = {
  desktop: {
    marcus: { table: [292, 246], window: [262, 248], rug: [276, 252], mid: [232, 246], pair: [200, 250] },
    man: { door: [56, 238], board: [166, 238], room: [190, 240], over: [190, 240], pair: [244, 246] },
  },
  mobile: {
    marcus: { table: [44, 288], window: [112, 248], rug: [142, 256], mid: [118, 250], pair: [54, 264] },
    man: { door: [152, 214], board: [140, 232], room: [74, 240], over: [96, 240], pair: [98, 260] },
  },
}

/** Street figures, top-left in safe-frame units of the street scene. */
export const STREET: Record<Layout, {
  pace: readonly [number, number]; walkTo: number; seller: readonly [number, number]; oldWoman: readonly [number, number]
  dog: readonly [number, number]; dogHome: readonly [number, number]; bikes: readonly [y: number, from: number, to: number]
}> = {
  desktop: { pace: [565, 284], walkTo: 432, seller: [596, 285], oldWoman: [580, 285], dog: [466, 285], dogHome: [446, 285], bikes: [322, 430, 640] },
  mobile: { pace: [84, 252], walkTo: -40, seller: [128, 252], oldWoman: [110, 252], dog: [4, 252], dogHome: [-14, 252], bikes: [282, -60, 190] },
}

export type MarcusPose = 'stand' | 'mug' | 'cloth' | 'worried' | 'reach' | 'crouch-scrub' | 'crouch-still' | 'crouch-up'
export type ManPose = 'stand' | 'point' | 'over' | 'soft' | 'relieved' | 'younger'
export interface Direction {
  shot?: ShotName
  marcus?: { at?: Spot; pose?: MarcusPose } | null
  man?: { at?: Spot; pose?: ManPose; shake?: boolean } | null
  /** The man seen from the window: pacing, looking up, or walking to the building. */
  manSmall?: 'pace' | 'look' | 'walk' | null
  mug?: 'sill' | 'hand' | 'floor' | 'upright'
  door?: 'closed' | 'open'
  knock?: boolean
  hallway?: 'white' | 'old'
  dishcloth?: 'chair' | 'held'
  breakfast?: 'warm' | 'cold'
  postcardDull?: boolean
  /** 0 → 1 reveal of the coffee stain; `ring` is the dried ring's opacity. */
  stain?: number
  ring?: number
  distress?: number
  street?: 'morning' | 'after'
  seller?: 'base' | 'look' | 'argue'
  bikes?: number
  glint?: number
  /** Imagined coat pacing beneath the old window (After). */
  ghost?: number
  /** Mobile: the docked old window, 0 small → 1 enlarged. */
  peri?: number
  interact?: 'board' | 'mug' | 'door' | 'scrub' | 'phone' | 'hold' | null
  lockScrub?: boolean
  phone?: 'hand' | 'gone'
  linger?: boolean
}

export const START: Required<Omit<Direction, 'interact'>> & { interact: Direction['interact'] } = {
  shot: 'wide', marcus: null, man: null, manSmall: null, mug: 'sill', door: 'closed', knock: false,
  hallway: 'white', dishcloth: 'chair', breakfast: 'warm', postcardDull: false, stain: 0, ring: 0, distress: 0,
  street: 'morning', seller: 'base', bikes: 0, glint: 0, ghost: 0, peri: 0, interact: null, lockScrub: false,
  phone: 'hand', linger: false,
}

export const DIRECTION: Record<string, Direction> = {
  // 1 · Sunday Morning
  'sm-01': { shot: 'wide' },
  'sm-03': { shot: 'rug' },
  'sm-05': { shot: 'breakfast', marcus: { at: 'table', pose: 'stand' } },
  'sm-08': { shot: 'wide' },
  'sm-11': { shot: 'board', interact: 'board' },
  'sm-15': { shot: 'lean', interact: null, peri: 1 },
  'sm-16': { shot: 'oldwin' },
  'sm-19': { shot: 'oldbuilding', peri: 0.5 },
  'sm-20': { shot: 'wide', peri: 0 },
  'sm-24': { shot: 'window', marcus: { at: 'window', pose: 'mug' }, mug: 'hand' },
  'sm-25': { shot: 'street', bikes: 0.3 },
  'sm-26': { shot: 'streetclose', manSmall: 'pace', bikes: 0.45 },
  // 2 · Across the Street
  'as-01': { shot: 'street', bikes: 0.55 },
  'as-03': { shot: 'streetclose' },
  'as-05': { shot: 'street', bikes: 0.65 },
  'as-06': { shot: 'oldwin', peri: 1 },
  'as-08': { shot: 'wide', peri: 0 },
  'as-10': { shot: 'marcus', interact: 'mug' },
  'as-11': { shot: 'rug', mug: 'floor', stain: 0.3, marcus: { pose: 'worried' }, interact: null },
  'as-12': { mug: 'upright', stain: 0.42 },
  'as-13': { shot: 'street', seller: 'look', bikes: 0.8 },
  'as-14': { shot: 'marcus' },
  'as-15': { shot: 'streetclose', manSmall: 'look' },
  'as-16': { shot: 'street', manSmall: 'walk', bikes: 1 },
  // 3 · The Knock
  'kn-01': { shot: 'door', manSmall: null, knock: true, interact: 'door', marcus: { at: 'mid', pose: 'stand' } },
  'kn-03': { door: 'open', knock: false, man: { at: 'door', pose: 'stand' }, interact: null },
  'kn-04': { shot: 'roomleft', man: { at: 'room' } },
  'kn-05': { shot: 'man' },
  'kn-06': { shot: 'two', man: { pose: 'over' } },
  'kn-07': { man: { pose: 'stand' } },
  'kn-09': { shot: 'wide' },
  'kn-10': { shot: 'boardman', man: { at: 'board', pose: 'point' } },
  'kn-13': { postcardDull: true },
  'kn-16': { shot: 'two', man: { at: 'room', pose: 'stand' } },
  'kn-17': { shot: 'board' },
  'kn-19': { shot: 'two' },
  'kn-20': { shot: 'marcus', dishcloth: 'held', marcus: { pose: 'cloth' } },
  // 4 · The Stain
  'st-01': { shot: 'rug', marcus: { at: 'rug', pose: 'crouch-scrub' }, man: { at: 'over', pose: 'over' }, interact: 'scrub', stain: 0.5, distress: 0.15 },
  'st-02': { stain: 0.6, distress: 0.25 },
  'st-03': { distress: 0.35 },
  'st-04': { stain: 0.68, distress: 0.45 },
  'st-05': { shot: 'two', marcus: { pose: 'crouch-up' }, distress: 0.55 },
  'st-06': { shot: 'man', distress: 0.65 },
  'st-07': { shot: 'doorway', hallway: 'old', distress: 0.8 },
  'st-09': { distress: 0.95 },
  'st-10': { shot: 'wide', marcus: { at: 'mid', pose: 'worried' }, breakfast: 'cold', distress: 1 },
  'st-12': { shot: 'rug', marcus: { at: 'rug', pose: 'crouch-scrub' }, stain: 0.72 },
  'st-13': { marcus: { pose: 'crouch-still' }, lockScrub: true, interact: null },
  'st-14': { shot: 'man', marcus: { pose: 'crouch-up' }, man: { pose: 'soft' } },
  'st-16': { shot: 'two' },
  'st-17': { man: { pose: 'point' } },
  'st-18': { shot: 'doorway' },
  'st-20': { shot: 'two', man: { pose: 'over' } },
  'st-21': { shot: 'lean', peri: 1 },
  'st-22': { shot: 'two', peri: 0 },
  'st-23': { shot: 'wide' },
  // 5 · The Phone (and Three Years)
  'ph-01': { shot: 'two', marcus: { at: 'mid', pose: 'stand' }, man: { at: 'room', pose: 'stand' } },
  'ph-03': { shot: 'phone', interact: 'phone' },
  'ph-08': { shot: 'man', interact: null },
  'ph-09': { man: { pose: 'soft' }, distress: 0.9 },
  'ph-10': { shot: 'wide' },
  'ph-11': { shot: 'two' },
  'ph-12': { distress: 0.8 },
  'ph-13': { distress: 0.7 },
  'ph-14': { distress: 0.62 },
  'ph-16': { distress: 0.5 },
  'ph-17': { distress: 0.3 },
  'ph-18': { shot: 'oldwin', peri: 1 },
  'ph-21': { shot: 'wide', peri: 0 },
  'ph-22': { shot: 'two' },
  'ph-23': { shot: 'rug' },
  'ph-24': { shot: 'man' },
  'ph-26': { shot: 'pair', marcus: { at: 'pair', pose: 'reach' }, man: { at: 'pair', pose: 'stand', shake: true } },
  'ph-29': { man: { pose: 'relieved', shake: false } },
  // 6 · The Window
  'wi-02': { man: { pose: 'younger' } },
  'wi-03': { shot: 'rug' },
  'wi-04': { shot: 'pair' },
  'wi-05': { shot: 'oldwin', peri: 1 },
  'wi-06': { shot: 'pair', peri: 0 },
  'wi-07': { shot: 'pairbeam', man: { pose: 'relieved' }, interact: 'hold' },
  // 7 · After
  'af-01': { shot: 'wide', interact: null, marcus: { at: 'mid', pose: 'stand' }, man: null, phone: 'gone', hallway: 'white', distress: 0, postcardDull: false },
  'af-02': { shot: 'rug', stain: 0, ring: 0.55 },
  'af-03': { marcus: { at: 'rug', pose: 'crouch-still' } },
  'af-04': { shot: 'window', marcus: { at: 'window', pose: 'mug' }, mug: 'hand' },
  'af-05': { shot: 'street', street: 'after', seller: 'argue' },
  'af-06': { shot: 'oldwin', glint: 1, peri: 1 },
  'af-07': { shot: 'wide', glint: 0.6, peri: 0 },
  'af-09': { shot: 'streetclose', ghost: 0.4 },
  'af-10': { shot: 'street', ghost: 0 },
  'af-11': { shot: 'rug', marcus: { at: 'table', pose: 'stand' } },
  'af-13': { shot: 'wide', peri: 1, linger: true },
}
