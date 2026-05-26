'use client'
import { useEffect, useRef } from 'react'

type Star = {
  x: number
  y: number
  radius: number
  alpha: number
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
    let animationFrame = 0
    let lastTime = 0
    let nextShootAt = 0
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min

    const createStars = () => {
      const count = Math.floor((width * height) / 7500)
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: randomBetween(0.15, 1),
        alpha: randomBetween(0.06, 0.55),
      }))
    }

    const drawStars = () => {
      for (const star of stars) {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(242, 237, 230, ${star.alpha})`
        ctx.fill()
      }
    }

    const drawShootingStars = (delta: number) => {
      if (!reducedMotion.matches && performance.now() >= nextShootAt) {
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
        nextShootAt = performance.now() + randomBetween(1400, 3600)
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

      ctx.clearRect(0, 0, width, height)
      drawStars()
      drawShootingStars(delta)

      animationFrame = requestAnimationFrame(renderFrame)
    }

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height)
      drawStars()
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

    resize()
    restartAnimation()
    window.addEventListener('resize', handleResize)
    reducedMotion.addEventListener('change', restartAnimation)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', handleResize)
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
