import { TRANSITION_FRAG, TRANSITION_VERT } from './transitionShader'
import type { PlanetKind } from './renderer'

const KIND_INDEX: Record<PlanetKind, number> = { music: 0, travel: 1, thoughts: 2, building: 3 }

export interface PassageFrame {
  kind: PlanetKind
  t: number
  coverAt: number
  reveal: number
  /** planet centre and disc radius in css px (y down) */
  cx: number
  cy: number
  radius: number
  kicks?: [number, number, number, number]
}

const NAMES = ['uRes', 'uScale', 'uKind', 'uT', 'uCoverAt', 'uReveal', 'uO', 'uR', 'uKicks'] as const

/**
 * The full-screen passage effect. It gets its own small WebGL context (drawn
 * straight to screen, no copy) and renders below device resolution — every
 * effect is soft enough that nobody can tell, and phones stay smooth.
 */
class TransitionRenderer {
  readonly canvas: HTMLCanvasElement
  private gl: WebGLRenderingContext
  private u: Record<(typeof NAMES)[number], WebGLUniformLocation | null>
  private scale = 1
  lost = false

  constructor(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
    this.canvas = canvas
    this.gl = gl
    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, src)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) ?? 'passage shader failed to compile')
      }
      return shader
    }
    const program = gl.createProgram()!
    gl.attachShader(program, compile(gl.VERTEX_SHADER, TRANSITION_VERT))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, TRANSITION_FRAG))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? 'passage shader failed to link')
    }
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(program, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    this.u = Object.fromEntries(NAMES.map((n) => [n, gl.getUniformLocation(program, n)])) as typeof this.u

    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault()
      this.lost = true
    })
  }

  /** size the drawing buffer to the viewport; call once per passage */
  fit() {
    const coarse = window.matchMedia('(pointer: coarse)').matches
    this.scale = Math.min(window.devicePixelRatio || 1, 1.25) * (coarse ? 0.62 : 0.85)
    const w = Math.max(2, Math.round(window.innerWidth * this.scale))
    const h = Math.max(2, Math.round(window.innerHeight * this.scale))
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w
      this.canvas.height = h
    }
  }

  render(f: PassageFrame) {
    if (this.lost) return
    const { gl, u, canvas } = this
    const k = f.kicks ?? [0, 0, 0, 0]
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(u.uRes, canvas.width, canvas.height)
    gl.uniform1f(u.uScale, this.scale)
    gl.uniform1i(u.uKind, KIND_INDEX[f.kind])
    gl.uniform1f(u.uT, f.t)
    gl.uniform1f(u.uCoverAt, f.coverAt)
    gl.uniform1f(u.uReveal, f.reveal)
    gl.uniform2f(u.uO, f.cx, window.innerHeight - f.cy)
    gl.uniform1f(u.uR, f.radius)
    gl.uniform4f(u.uKicks, k[0], k[1], k[2], k[3])
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
}

let shared: TransitionRenderer | null | undefined

/** Compiled lazily — call `warmPassages()` when idle so the first click never stalls on it. */
export function getTransitionRenderer(): TransitionRenderer | null {
  if (shared !== undefined) return shared?.lost ? null : shared
  try {
    const canvas = document.createElement('canvas')
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block'
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false })
    shared = gl ? new TransitionRenderer(canvas, gl) : null
  } catch (err) {
    console.error(err)
    shared = null
  }
  return shared
}

export function warmPassages() {
  const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 400))
  idle(() => {
    getTransitionRenderer()
  })
}
