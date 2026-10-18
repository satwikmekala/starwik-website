import type { CSSProperties } from 'react'
import styles from './making.module.css'

// sporeFE: RecordingStage's amber dot and MicHalo's radial stops / six-second breath.
export function SporeMotif() {
  return (
    <div className={`${styles.motif} ${styles.sporeMotif}`} aria-hidden="true">
      <svg viewBox="0 0 360 360" fill="none" focusable="false">
        <defs>
          <radialGradient id="making-spore-halo">
            <stop offset="0" stopColor="#F5A623" stopOpacity="0.48" />
            <stop offset="0.38" stopColor="#F5A623" stopOpacity="0.42" />
            <stop offset="0.52" stopColor="#F5A623" stopOpacity="0.29" />
            <stop offset="0.70" stopColor="#F5A623" stopOpacity="0.12" />
            <stop offset="0.86" stopColor="#F5A623" stopOpacity="0.025" />
            <stop offset="1" stopColor="#F5A623" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g className={styles.sporeBreath}>
          <circle className={styles.sporeHalo} cx="180" cy="180" r="128" fill="url(#making-spore-halo)" />
          <circle className={styles.sporeRipple} cx="180" cy="180" r="36" stroke="#F5A623" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <circle className={styles.sporeDot} data-making-origin="spore" cx="180" cy="180" r="36" fill="#F5A623" />
        </g>
      </svg>
    </div>
  )
}

// stackv3: model.ts constants and geometry.ts's five-point, clipped-corner footprint.
const CHAMFER = 0.24
const SLAB_GAP = 0.045
const SLAB_HEIGHT = 0.28
const GOLD_SEAM = 0.022
const GOLD_INSET = 0.014
const GOLD = '#FFE84A'
// BuildPreview keeps five slabs; orange remains the top PR slab.
const PALETTE = ['#28C8BD', '#A76FF2', '#4F8BFF', '#B5E53F', '#FF7A3D'] as const
type Point = readonly [number, number]
const PERIMETER: readonly Point[] = [[-1, -1], [1, -1], [1, 1 - CHAMFER], [1 - CHAMFER, 1], [-1, 1]]
const REFLECTION_AXIS = 260

/** Project Stack's x/z footprint and y elevation onto a quiet isometric plane. */
function project([x, z]: Point, elevation: number, reflected: boolean) {
  const y = 214 + (x + z) * 22 - elevation * 62
  return `${(180 + (x - z) * 50).toFixed(2)},${(reflected ? REFLECTION_AXIS * 2 - y : y).toFixed(2)}`
}

function face(points: readonly Point[], elevation: number, reflected: boolean) {
  return `M${points.map(point => project(point, elevation, reflected)).join(' L')} Z`
}

function side(a: Point, b: Point, bottom: number, top: number, reflected: boolean) {
  return `M${project(a, bottom, reflected)} L${project(a, top, reflected)} L${project(b, top, reflected)} L${project(b, bottom, reflected)} Z`
}

function SlabFaces({ level, reflected }: { level: number; reflected: boolean }) {
  const bottom = level * (SLAB_HEIGHT + SLAB_GAP)
  const top = bottom + SLAB_HEIGHT
  const record = level === PALETTE.length - 1
  const inner = PERIMETER.map(([x, z]): Point => [x * (1 - GOLD_INSET), z * (1 - GOLD_INSET)])

  return (
    <>
      {PERIMETER.slice(1, 4).map((a, index) => {
        const b = PERIMETER[index + 2]
        return (
          <g key={index}>
            <path d={side(a, b, bottom, top, reflected)} className={index === 2 ? styles.stackLeft : styles.stackRight} />
            {record ? <path d={side(a, b, top - GOLD_SEAM, top, reflected)} fill={GOLD} /> : null}
          </g>
        )
      })}
      <path d={face(PERIMETER, top, reflected)} className={styles.stackTop} data-making-origin={!reflected && record ? 'stack' : undefined} />
      {record ? <path d={`${face(PERIMETER, top, reflected)} ${face(inner, top, reflected)}`} fill={GOLD} fillRule="evenodd" /> : null}
    </>
  )
}

function StackSlabs({ reflected = false }: { reflected?: boolean }) {
  return PALETTE.map((color, level) => (
    <g
      key={color}
      className={reflected ? undefined : styles.stackSlab}
      data-slab-color={reflected ? undefined : color}
      style={{
        '--slab-color': color,
        '--slab-lift': `${level * 5 + (level === PALETTE.length - 1 ? 10 : 0)}px`,
        '--slab-delay': `${level * 50}ms`,
      } as CSSProperties}
    >
      <g className={!reflected && level === PALETTE.length - 1 ? styles.stackDrift : undefined}>
        <SlabFaces level={level} reflected={reflected} />
      </g>
    </g>
  ))
}

export function StackMotif({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? styles.miniStack : `${styles.motif} ${styles.stackMotif}`}>
      <svg viewBox={compact ? '55 20 250 250' : '0 0 360 370'} fill="none" aria-hidden="true" focusable="false">
        {compact ? null : <defs>
          <linearGradient id="making-stack-reflection-fade" x1="0" y1="260" x2="0" y2="335" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="making-stack-reflection-mask" x="0" y="260" width="360" height="110" maskUnits="userSpaceOnUse">
            <rect x="0" y="260" width="360" height="110" fill="url(#making-stack-reflection-fade)" />
          </mask>
        </defs>}
        {compact ? null : <g opacity="0.16" mask="url(#making-stack-reflection-mask)"><StackSlabs reflected /></g>}
        <StackSlabs />
      </svg>
      {compact ? null : <p className={styles.stackCaption}>THIS WEEK · [n] BLOCKS · <span>[n] PR</span></p>}
    </div>
  )
}

export function SporeArrivalMotif() {
  return (
    <svg className={styles.miniSpore} viewBox="0 0 96 96" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="making-spore-arrival-halo">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="0.52" stopColor="currentColor" stopOpacity="0.12" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="48" cy="48" r="34" fill="url(#making-spore-arrival-halo)" />
      <circle cx="48" cy="48" r="8" fill="currentColor" />
    </svg>
  )
}
