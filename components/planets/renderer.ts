import { FRAG, VERT } from './shader'

export type PlanetKind = 'music' | 'travel' | 'thoughts' | 'building'

const KIND_INDEX: Record<PlanetKind, number> = { music: 0, travel: 1, thoughts: 2, building: 3 }

/** A custom view inside the body's canvas, in CSS px (y down). Defaults to a centred square. */
export interface PlanetView {
  cx: number
  cy: number
  size: number
}

export interface PlanetBody {
  canvas: HTMLCanvasElement
  kind: PlanetKind
  seed: number
  rings: boolean
  speed: number
  /** per-planet time; seeded randomly so the worlds never line up */
  t: number
  /** smoothed hover amount, 0..1 */
  h: number
  hover: boolean
  visible: boolean
  maxDpr: number
  view?: PlanetView
  /** overrides the wall clock that drives the music planet's beat (a transition sets the tempo) */
  beat?: number
}

type Uniforms = Record<
  'uRes' | 'uCenter' | 'uSize' | 'uTime' | 'uClock' | 'uType' | 'uHover' | 'uSeed' | 'uRings',
  WebGLUniformLocation | null
>

/**
 * One WebGL context, many planets. Every frame each visible body is drawn
 * into the shared GL canvas and copied out to its own 2D canvas — browsers
 * cap live WebGL contexts, and this keeps the home page at exactly one.
 */
class PlanetRenderer {
  private glCanvas: HTMLCanvasElement
  private gl: WebGLRenderingContext
  private u: Uniforms
  private bodies = new Set<PlanetBody>()
  private hidden = new WeakSet<PlanetBody>()
  private ctxs = new WeakMap<HTMLCanvasElement, CanvasRenderingContext2D>()
  private frame = 0
  private last = 0
  private readonly start = performance.now()
  private reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  lost = false

  constructor(glCanvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
    this.glCanvas = glCanvas
    this.gl = gl
    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, src)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) ?? 'planet shader failed to compile')
      }
      return shader
    }
    const program = gl.createProgram()!
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? 'planet shader failed to link')
    }
    gl.useProgram(program)

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(program, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const names = ['uRes', 'uCenter', 'uSize', 'uTime', 'uClock', 'uType', 'uHover', 'uSeed', 'uRings'] as const
    this.u = Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(program, n)])) as Uniforms

    glCanvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault()
      this.lost = true
      cancelAnimationFrame(this.frame)
      this.frame = 0
    })
  }

  add(body: PlanetBody) {
    this.bodies.add(body)
    if (!this.frame && !this.lost) {
      this.last = performance.now()
      this.frame = requestAnimationFrame(this.tick)
    }
  }

  remove(body: PlanetBody) {
    this.bodies.delete(body)
    if (!this.bodies.size && this.frame) {
      cancelAnimationFrame(this.frame)
      this.frame = 0
    }
  }

  /** Stop drawing a body (it keeps spinning, so it can be shown again in sync). */
  hide(body: PlanetBody) {
    this.hidden.add(body)
  }

  show(body: PlanetBody) {
    this.hidden.delete(body)
  }

  /** Draw a body right now, outside the frame loop (for seamless hand-offs). */
  drawNow(body: PlanetBody) {
    if (!this.lost) this.draw(body, (performance.now() - this.start) / 1000)
  }

  private tick = (now: number) => {
    const dt = Math.min((now - this.last) / 1000, 0.05)
    this.last = now
    const clock = (now - this.start) / 1000
    const calm = this.reducedMotion.matches ? 0.25 : 1
    const ease = 1 - Math.exp(-dt * 5)

    for (const body of this.bodies) {
      body.h += ((body.hover ? 1 : 0) - body.h) * ease
      body.t += dt * calm * body.speed * (1 + body.h * 1.2)
      if (body.visible && !this.hidden.has(body)) this.draw(body, clock)
    }
    this.frame = requestAnimationFrame(this.tick)
  }

  private draw(body: PlanetBody, clock: number) {
    const { gl, glCanvas, u } = this
    const dpr = Math.min(window.devicePixelRatio || 1, body.maxDpr)
    const cssW = body.canvas.clientWidth
    const cssH = body.canvas.clientHeight
    const w = Math.max(2, Math.round(cssW * dpr))
    const h = Math.max(2, Math.round(cssH * dpr))
    if (w > glCanvas.width || h > glCanvas.height) {
      glCanvas.width = Math.max(w, glCanvas.width)
      glCanvas.height = Math.max(h, glCanvas.height)
    }
    if (body.canvas.width !== w || body.canvas.height !== h) {
      body.canvas.width = w
      body.canvas.height = h
    }

    let ctx = this.ctxs.get(body.canvas)
    if (!ctx) {
      ctx = body.canvas.getContext('2d')!
      this.ctxs.set(body.canvas, ctx)
    }

    const view = body.view ?? { cx: cssW / 2, cy: cssH / 2, size: Math.min(cssW, cssH) }

    gl.viewport(0, 0, w, h)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.uniform2f(u.uRes, w, h)
    gl.uniform2f(u.uCenter, view.cx * dpr, h - view.cy * dpr)
    gl.uniform1f(u.uSize, view.size * dpr)
    gl.uniform1f(u.uTime, body.t)
    gl.uniform1f(u.uClock, body.beat ?? clock)
    gl.uniform1i(u.uType, KIND_INDEX[body.kind])
    gl.uniform1f(u.uHover, body.h)
    gl.uniform1f(u.uSeed, body.seed)
    gl.uniform1f(u.uRings, body.rings ? 1 : 0)
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(glCanvas, 0, glCanvas.height - h, w, h, 0, 0, w, h)
  }
}

let shared: PlanetRenderer | null | undefined

/** The page-wide renderer, or null when WebGL isn't available. */
export function getPlanetRenderer(): PlanetRenderer | null {
  if (shared !== undefined) return shared?.lost ? null : shared
  try {
    const glCanvas = document.createElement('canvas')
    glCanvas.width = glCanvas.height = 256
    const gl = glCanvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      preserveDrawingBuffer: true,
    })
    shared = gl ? new PlanetRenderer(glCanvas, gl) : null
  } catch (err) {
    console.error(err)
    shared = null
  }
  return shared
}
