/**
 * Draws a scene into a canvas at logical resolution (1 canvas pixel = 1
 * art cell). The page scales it up with `image-rendering: pixelated` and
 * a compositor transform, so every edge stays a hard stair-step and the
 * camera moves for free. Sprite paths are compiled data → cached Path2D.
 */
import { SPRITE_DATA } from '../art/compiled.ts'
import type { Ink } from '../art/palette.ts'
import type { SceneDef } from '../scenes/types.ts'
import { cellsOf, rng, type Cell } from './cells.ts'
import { sunbeam, type Beam } from './sunbeam.ts'

export interface ItemState { parts?: string[]; dx?: number; dy?: number; alpha?: number; hidden?: boolean }
export interface Actor { sprite: string; part: string; x: number; y: number; flip?: boolean; alpha?: number; layer: 'room' | 'street'; z?: number }
export interface Particle { x: number; y: number; ink: Ink; alpha: number }

export interface DrawInput {
  inks: Record<Ink, string>
  item: (id: string) => ItemState | undefined
  beam: number | null
  /** 0..1 reveal of the coffee stain, and the dried ring's opacity */
  stain: number
  ring: number
  actors: Actor[]
  particles: Particle[]
  time: number
  motion: boolean
}

type Compiled = [Ink, Path2D][]

export class SceneCanvas {
  readonly canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private paths = new Map<string, Compiled>()
  private beamCache = new Map<number, { beam: Beam; path: Path2D }>()
  private stainCells: Cell[] | null = null
  private dust = Array.from({ length: 16 }, (_, i) => { const r = rng(i * 97 + 13); return { x: r(), y: r(), v: 0.4 + r() * 0.8, p: r() * 6.28 } })

  constructor(readonly def: SceneDef, label: string) {
    this.canvas = document.createElement('canvas')
    this.canvas.width = def.canvas.w
    this.canvas.height = def.canvas.h
    this.canvas.className = 'ats-canvas'
    this.canvas.dataset.scene = def.name
    this.canvas.setAttribute('role', 'img')
    this.canvas.setAttribute('aria-label', label)
    this.ctx = this.canvas.getContext('2d', { alpha: false })!
    this.ctx.imageSmoothingEnabled = false
  }

  private compiled(sprite: string, part: string): Compiled | null {
    const key = `${sprite}:${part}`
    let c = this.paths.get(key)
    if (!c) {
      const data = SPRITE_DATA[sprite]?.parts[part]
      if (!data) return null
      c = data.map(([ink, d]) => [ink, new Path2D(d)])
      this.paths.set(key, c)
    }
    return c
  }

  private sprite(sprite: string, part: string, x: number, y: number, inks: DrawInput['inks'], flip = false, alpha = 1) {
    const c = this.compiled(sprite, part)
    if (!c || alpha <= 0) return
    const ctx = this.ctx
    ctx.save()
    ctx.globalAlpha = alpha
    if (flip) { ctx.translate(Math.round(x) + SPRITE_DATA[sprite].w, Math.round(y)); ctx.scale(-1, 1) }
    else ctx.translate(Math.round(x), Math.round(y))
    for (const [ink, p] of c) { ctx.fillStyle = inks[ink]; ctx.fill(p) }
    ctx.restore()
  }

  /** The beam's mask, for placing dust and hit-testing (canvas units). */
  beamAt(progress: number) {
    const key = Math.round(progress * 400)
    let b = this.beamCache.get(key)
    if (!b) {
      const beam = sunbeam(this.def, key / 400)
      if (!beam) return null
      b = { beam, path: new Path2D(beam.d) }
      if (this.beamCache.size > 64) this.beamCache.clear()
      this.beamCache.set(key, b)
    }
    return b
  }

  private stainOrder() {
    if (!this.stainCells) {
      const all = cellsOf(SPRITE_DATA.rug.parts['stain-3'] ?? [])
      const r = rng(7)
      // spread outward from where the mug landed, with a ragged edge
      this.stainCells = all.map((c) => ({ c, d: Math.hypot((c.x - 96) * 0.8, (c.y - 13) * 1.6) + r() * 5 }))
        .sort((a, b) => a.d - b.d).map(({ c }) => c)
    }
    return this.stainCells
  }

  draw(input: DrawInput) {
    const { ctx, def } = this
    const { inks } = input
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalAlpha = 1
    ctx.fillStyle = inks.sky
    ctx.fillRect(0, 0, def.canvas.w, def.canvas.h)
    const ox = def.safe.x, oy = def.safe.y
    const roomActors = input.actors.filter((a) => a.layer === 'room').sort((a, b) => (a.z ?? 0) - (b.z ?? 0))
    const streetActors = input.actors.filter((a) => a.layer === 'street')

    for (const item of def.items) {
      const st = input.item(item.id)
      const data = SPRITE_DATA[item.sprite]
      if (st?.hidden || !data) {
        if (item.id === def.beamAfter && input.beam !== null) this.drawBeam(input)
        if (item.id === def.streetAfter) for (const a of streetActors) this.sprite(a.sprite, a.part, a.x + ox, a.y + oy, inks, a.flip, a.alpha)
        continue
      }
      let x = (item.canvas ? item.x : item.x + ox) + (st?.dx ?? 0)
      const y = (item.canvas ? item.y : item.y + oy) + (st?.dy ?? 0)
      if (item.drift && input.motion) x = ((x + input.time * item.drift - ox + 120) % (def.safe.w + 240)) + ox - 120
      const parts = st?.parts ?? item.parts ?? (data.parts.base ? ['base'] : Object.keys(data.parts).slice(0, 1))
      for (const p of parts) this.sprite(item.sprite, p, x, y, inks, item.flip, st?.alpha ?? 1)

      if (item.id === 'rug') this.drawStain(x, y, input)
      if (item.id === def.beamAfter && input.beam !== null) this.drawBeam(input)
      if (item.id === def.streetAfter) for (const a of streetActors) this.sprite(a.sprite, a.part, a.x + ox, a.y + oy, inks, a.flip, a.alpha)
    }
    for (const a of roomActors) this.sprite(a.sprite, a.part, a.x + ox, a.y + oy, inks, a.flip, a.alpha)
    for (const p of input.particles) {
      ctx.globalAlpha = p.alpha
      ctx.fillStyle = inks[p.ink]
      ctx.fillRect(Math.round(p.x) + ox, Math.round(p.y) + oy, 1, 1)
    }
    ctx.globalAlpha = 1
  }

  private drawStain(x: number, y: number, input: DrawInput) {
    const { ctx } = this
    if (input.stain > 0) {
      const cells = this.stainOrder()
      const n = Math.round(cells.length * Math.min(1, input.stain))
      ctx.fillStyle = input.inks.coffee
      for (let i = 0; i < n; i++) ctx.fillRect(x + cells[i].x, y + cells[i].y, 1, 1)
    }
    if (input.ring > 0) this.sprite('rug', 'ring', x, y, input.inks, false, input.ring)
  }

  private drawBeam(input: DrawInput) {
    const b = this.beamAt(input.beam!)
    if (!b) return
    const { ctx } = this
    ctx.save()
    ctx.globalAlpha = 0.72
    ctx.translate(b.beam.x, b.beam.y)
    ctx.fillStyle = input.inks.cloud
    ctx.fill(b.path)
    // dust turning in the beam
    if (input.motion) {
      const { mask } = b.beam
      ctx.globalAlpha = 0.5
      ctx.fillStyle = input.inks.line
      for (const m of this.dust) {
        const px = Math.floor((m.x * mask.w + Math.sin(input.time * 0.4 * m.v + m.p) * 3) % mask.w)
        const py = Math.floor(((m.y * mask.h - input.time * m.v * 2) % mask.h + mask.h) % mask.h)
        if (mask.has(px, py)) ctx.fillRect(px, py, 1, 1)
      }
    }
    ctx.restore()
  }
}
