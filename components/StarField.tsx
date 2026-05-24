'use client'
import { useEffect, useRef } from 'react'

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      draw()
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const count = Math.floor((canvas.width * canvas.height) / 8000)
      for (let i = 0; i < count; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const r = Math.random() * 0.9 + 0.1
        const a = Math.random() * 0.5 + 0.05
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(242, 237, 230, ${a})`
        ctx.fill()
      }
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
