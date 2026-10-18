'use client'
import { useEffect, useRef } from 'react'

// A deep field, not a flat backdrop: three parallax layers of stars that
// scintillate on their own rhythms, a faint galactic haze, and the odd
// shooting star. The near layer drifts most against the cursor.

type Star = {
  x: number
  y: number
  radius: number
  alpha: number
  layer: number
  /** scintillation */
  amp: number
  speed: number
  phase: number
  sprite: HTMLCanvasElement
  glint: boolean
}

type ShootingStar = {
  x: number
  y: number
  length: number
  speed: number
  angle: number
  life: number
  maxLife: number
  width: number
}

/** how far each layer moves (px) at full cursor offset; index 3 is the haze */
const DEPTH = [3, 7, 15, 2]

/** star colours by rough spectral class — mostly white, some blue, some warm */
const TINTS: [number, string][] = [
  [0.52, '242, 237, 230'],
  [0.2, '205, 220, 255'],
  [0.16, '255, 236, 200'],
  [0.08, '255, 212, 170'],
  [0.04, '255, 178, 150'],
]

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min

function pickTint() {
  let r = Math.random()
  for (const [weight, rgb] of TINTS) {
    if ((r -= weight) <= 0) return rgb
  }
  return TINTS[0][1]
}

/** a soft round star with a halo, drawn once per tint and scaled at draw time */
function makeSprite(rgb: string) {
  const size = 64
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, `rgba(255, 255, 255, 1)`)
  grad.addColorStop(0.08, `rgba(${rgb}, 1)`)
  grad.addColorStop(0.22, `rgba(${rgb}, 0.32)`)
  grad.addColorStop(0.5, `rgba(${rgb}, 0.07)`)
  grad.addColorStop(1, `rgba(${rgb}, 0)`)
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  return c
}

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = 1
    let stars: Star[] = []
    let shootingStars: ShootingStar[] = []
    let haze: HTMLCanvasElement | null = null
    let animationFrame = 0
    let lastTime = 0
    let nextShootAt = 0
    const margin = 24
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sprites = new Map<string, HTMLCanvasElement>()
    const spriteFor = (rgb: string) => {
      let s = sprites.get(rgb)
      if (!s) sprites.set(rgb, (s = makeSprite(rgb)))
      return s
    }

    const createStars = () => {
      const area = (width + margin * 2) * (height + margin * 2)
      const count = Math.floor(area / 8000)
      stars = Array.from({ length: count }, () => {
        // most stars are far and faint; a handful are near and bright
        const roll = Math.random()
        const layer = roll < 0.7 ? 0 : roll < 0.95 ? 1 : 2
        const bright = layer === 2 && Math.random() < 0.15
        const radius =
          layer === 0 ? randomBetween(0.2, 0.55) : layer === 1 ? randomBetween(0.45, 0.9) : randomBetween(0.8, bright ? 1.7 : 1.2)
        // only a few stars really twinkle — the planets should hold the eye
        const strongTwinkle = Math.random() < 0.04
        return {
          x: randomBetween(-margin, width + margin),
          y: randomBetween(-margin, height + margin),
          radius,
          alpha: layer === 0 ? randomBetween(0.1, 0.32) : layer === 1 ? randomBetween(0.25, 0.5) : randomBetween(0.45, 0.8),
          layer,
          amp: strongTwinkle ? randomBetween(0.4, 0.65) : randomBetween(0.04, 0.14),
          speed: randomBetween(0.4, strongTwinkle ? 2 : 1.2),
          phase: Math.random() * Math.PI * 2,
          sprite: spriteFor(pickTint()),
          glint: bright && Math.random() < 0.4,
        }
      })
    }

    // the faint band of the galaxy and a couple of nebula tints, painted once
    // at full device resolution onto the page colour itself — faint gradients
    // over transparency lose their precision and turn blocky
    const createHaze = () => {
      const w = Math.ceil(width + margin * 2)
      const h = Math.ceil(height + margin * 2)
      haze = document.createElement('canvas')
      haze.width = Math.ceil(w * dpr)
      haze.height = Math.ceil(h * dpr)
      const g = haze.getContext('2d', { alpha: false })!
      g.scale(dpr, dpr)
      g.fillStyle = '#07070A'
      g.fillRect(0, 0, w, h)

      g.save()
      g.translate(w * 0.5, h * 0.5)
      g.rotate(-0.42)
      g.scale(1, 0.16)
      const band = g.createRadialGradient(0, 0, 0, 0, 0, Math.max(w, h) * 0.75)
      band.addColorStop(0, 'rgba(160, 150, 190, 0.07)')
      band.addColorStop(0.45, 'rgba(120, 120, 170, 0.035)')
      band.addColorStop(1, 'rgba(120, 120, 170, 0)')
      g.fillStyle = band
      g.fillRect(-w * 2, -h * 6, w * 4, h * 12)
      g.restore()

      const cloud = (x: number, y: number, r: number, rgb: string, a: number) => {
        const grad = g.createRadialGradient(x, y, 0, x, y, r)
        grad.addColorStop(0, `rgba(${rgb}, ${a})`)
        grad.addColorStop(1, `rgba(${rgb}, 0)`)
        g.fillStyle = grad
        g.fillRect(x - r, y - r, r * 2, r * 2)
      }
      const s = Math.max(w, h)
      cloud(w * 0.18, h * 0.72, s * 0.32, '196, 90, 24', 0.035)
      cloud(w * 0.7, h * 0.62, s * 0.36, '72, 88, 200', 0.045)
      cloud(w * 0.9, h * 0.3, s * 0.26, '15, 122, 106', 0.03)
      cloud(w * 0.42, h * 0.32, s * 0.22, '176, 120, 32', 0.022)
    }

    const layerOffset = (layer: number) => ({
      x: pointer.x * DEPTH[layer] - margin,
      y: pointer.y * DEPTH[layer] - margin,
    })

    const drawField = (time: number, twinkle: boolean) => {
      if (haze) {
        const o = layerOffset(3)
        ctx.drawImage(haze, o.x, o.y, width + margin * 2, height + margin * 2)
      }

      const t = time / 1000
      const offsets = [layerOffset(0), layerOffset(1), layerOffset(2)]
      for (const star of stars) {
        const o = offsets[star.layer]
        const x = star.x + margin + o.x
        const y = star.y + margin + o.y
        // two detuned waves read as atmospheric scintillation, not a metronome
        const wave = twinkle
          ? 0.5 + 0.32 * Math.sin(t * star.speed + star.phase) + 0.18 * Math.sin(t * star.speed * 2.7 + star.phase * 1.7)
          : 0.75
        const a = star.alpha * (1 - star.amp + star.amp * wave)
        const size = star.radius * (7 + (star.layer === 2 ? 3 * wave : 0))

        ctx.globalAlpha = a
        ctx.drawImage(star.sprite, x - size, y - size, size * 2, size * 2)

        if (star.glint) {
          const len = star.radius * (6 + 8 * wave)
          const glint = ctx.createLinearGradient(x - len, y, x + len, y)
          glint.addColorStop(0, 'rgba(255, 255, 255, 0)')
          glint.addColorStop(0.5, 'rgba(255, 255, 255, 0.55)')
          glint.addColorStop(1, 'rgba(255, 255, 255, 0)')
          ctx.fillStyle = glint
          ctx.fillRect(x - len, y - 0.35, len * 2, 0.7)
          const glintV = ctx.createLinearGradient(x, y - len, x, y + len)
          glintV.addColorStop(0, 'rgba(255, 255, 255, 0)')
          glintV.addColorStop(0.5, 'rgba(255, 255, 255, 0.55)')
          glintV.addColorStop(1, 'rgba(255, 255, 255, 0)')
          ctx.fillStyle = glintV
          ctx.fillRect(x - 0.35, y - len, 0.7, len * 2)
        }
      }
      ctx.globalAlpha = 1
    }

    const drawShootingStars = (delta: number) => {
      if (performance.now() >= nextShootAt) {
        shootingStars.push({
          x: randomBetween(-width * 0.1, width * 0.85),
          y: randomBetween(height * 0.02, height * 0.38),
          length: randomBetween(120, 260),
          speed: randomBetween(420, 760),
          angle: Math.PI / 4,
          life: 0,
          maxLife: randomBetween(0.9, 1.35),
          width: randomBetween(1, 1.8),
        })
        nextShootAt = performance.now() + randomBetween(2400, 6000)
      }

      shootingStars = shootingStars.filter((star) => star.life < star.maxLife)

      for (const star of shootingStars) {
        star.life += delta
        star.x += Math.cos(star.angle) * star.speed * delta
        star.y += Math.sin(star.angle) * star.speed * delta

        const progress = star.life / star.maxLife
        const alpha = Math.sin(progress * Math.PI) * 0.85
        const tailX = star.x - Math.cos(star.angle) * star.length
        const tailY = star.y - Math.sin(star.angle) * star.length
        const gradient = ctx.createLinearGradient(star.x, star.y, tailX, tailY)

        gradient.addColorStop(0, `rgba(255, 248, 214, ${alpha})`)
        gradient.addColorStop(0.22, `rgba(255, 218, 120, ${alpha * 0.45})`)
        gradient.addColorStop(1, 'rgba(255, 218, 120, 0)')

        ctx.beginPath()
        ctx.moveTo(star.x, star.y)
        ctx.lineTo(tailX, tailY)
        ctx.strokeStyle = gradient
        ctx.lineWidth = star.width
        ctx.lineCap = 'round'
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.width * 1.2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 248, 214, ${alpha})`
        ctx.fill()
      }
    }

    const renderFrame = (time = performance.now()) => {
      const delta = Math.min((time - lastTime) / 1000 || 0, 0.05)
      lastTime = time

      const ease = 1 - Math.exp(-delta * 3)
      pointer.x += (pointer.tx - pointer.x) * ease
      pointer.y += (pointer.ty - pointer.y) * ease

      ctx.clearRect(0, 0, width, height)
      drawField(time, true)
      drawShootingStars(delta)

      animationFrame = requestAnimationFrame(renderFrame)
    }

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height)
      drawField(0, false)
    }

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      createStars()
      createHaze()
    }

    const restartAnimation = () => {
      cancelAnimationFrame(animationFrame)
      shootingStars = []
      if (reducedMotion.matches) {
        drawStatic()
        return
      }
      lastTime = performance.now()
      nextShootAt = lastTime + randomBetween(600, 1600)
      animationFrame = requestAnimationFrame(renderFrame)
    }

    const handleResize = () => {
      resize()
      restartAnimation()
    }

    // same sense as the planets' parallax, so the whole scene shares one camera
    const handlePointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pointer.tx = -(e.clientX / window.innerWidth - 0.5) * 2
      pointer.ty = -(e.clientY / window.innerHeight - 0.5) * 2
    }

    resize()
    restartAnimation()
    window.addEventListener('resize', handleResize)
    window.addEventListener('pointermove', handlePointer)
    reducedMotion.addEventListener('change', restartAnimation)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('pointermove', handlePointer)
      reducedMotion.removeEventListener('change', restartAnimation)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'block',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
