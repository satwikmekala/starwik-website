'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'

import { WikLogo } from '@/components/WikLogo'
import { Planet } from './Planet'
import type { WarpOrigin } from './PlanetWarp'
import { useWorldTransition } from './WorldTransition'
import { warmPassages } from './transitionRenderer'
import type { PlanetBody, PlanetKind } from './renderer'
import { PLACEMENTS, ROUTE_ENDS, STAGE, labelGeometry, routePath, type Placement } from './layout'
import styles from './worlds.module.css'

export interface World {
  id: string
  number: string
  name: string
  descriptor: string
  href: string
  kind: PlanetKind
  seed: number
  accent: string
  italic?: boolean
}

const u = (n: number) => `calc(var(--u) * ${n})`

const ROUTES = {
  wide: routePath([
    ROUTE_ENDS.wide.from,
    ...(['music', 'travel', 'thoughts', 'building'] as const).map(
      (k) => [PLACEMENTS[k].wide.x, PLACEMENTS[k].wide.y] as [number, number],
    ),
    ROUTE_ENDS.wide.to,
  ]),
  tall: routePath([
    ROUTE_ENDS.tall.from,
    ...(['music', 'travel', 'thoughts', 'building'] as const).map(
      (k) => [PLACEMENTS[k].tall.x, PLACEMENTS[k].tall.y] as [number, number],
    ),
    ROUTE_ENDS.tall.to,
  ]),
}

export function HomeWorlds({ worlds }: { worlds: World[] }) {
  const { activeHref, launch: startJourney } = useWorldTransition()
  const stageRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  useParallax(stageRef, activeHref === null)

  // compile the passage shaders while nobody's looking, so a click never stalls
  useEffect(() => warmPassages(), [])

  const launch = useCallback((world: World, origin: WarpOrigin) => {
    setHovered(world.id)
    startJourney(world, origin)
  }, [startJourney])

  return (
    <div className={styles.viewport}>
      <div ref={stageRef} className={styles.stage} data-warping={activeHref ? '' : undefined} inert={activeHref !== null}>
        <h1 className={styles.brand}>
          <WikLogo size="100%" aria-label="wik" role="img" />
        </h1>
        <p className={styles.tag}>
          <span>welcome to the wikverse.</span>
          <span>which world would you like to explore?</span>
        </p>

        <div className={styles.parallax} style={{ '--depth': 4 } as React.CSSProperties}>
          {(['wide', 'tall'] as const).map((layout) => (
            <svg
              key={layout}
              className={styles.route}
              data-layout={layout}
              viewBox={`0 0 ${STAGE[layout].w} ${STAGE[layout].h}`}
              aria-hidden="true"
            >
              <path id={`route-${layout}`} d={ROUTES[layout]} />
              <g className={styles.probe}>
                <circle r="9" className={styles.probeHalo} />
                <circle r="1.8" />
                <animateMotion dur={layout === 'wide' ? '48s' : '36s'} repeatCount="indefinite" rotate="auto">
                  <mpath href={`#route-${layout}`} />
                </animateMotion>
              </g>
            </svg>
          ))}
        </div>

        {worlds.map((world, i) => (
          <WorldLink
            key={world.id}
            world={world}
            index={i}
            hovered={hovered === world.id}
            dimmed={hovered !== null && hovered !== world.id}
            launching={activeHref === world.href}
            onHover={setHovered}
            onLaunch={launch}
          />
        ))}
      </div>

    </div>
  )
}

interface WorldLinkProps {
  world: World
  index: number
  hovered: boolean
  dimmed: boolean
  launching: boolean
  onHover: (id: string | null) => void
  onLaunch: (world: World, origin: WarpOrigin) => void
}

function WorldLink({ world, index, hovered, dimmed, launching, onHover, onLaunch }: WorldLinkProps) {
  const bodyRef = useRef<PlanetBody | null>(null)
  const planetRef = useRef<HTMLSpanElement>(null)
  const place = PLACEMENTS[world.kind]

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const body = bodyRef.current
    const el = planetRef.current
    if (!body || !el) return
    e.preventDefault()
    onLaunch(world, { body, rect: el.getBoundingClientRect() })
  }

  const vars = {
    '--x': place.wide.x,
    '--y': place.wide.y,
    '--s': place.wide.s,
    '--mx': place.tall.x,
    '--my': place.tall.y,
    '--ms': place.tall.s,
    '--depth': place.depth,
    '--i': index,
    '--accent': world.accent,
  } as React.CSSProperties

  return (
    <Link
      href={world.href}
      className={styles.world}
      style={vars}
      data-hovered={hovered || undefined}
      data-dimmed={dimmed || undefined}
      data-launching={launching || undefined}
      onMouseEnter={() => onHover(world.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(world.id)}
      onBlur={() => onHover(null)}
      onClick={handleClick}
    >
      <span className={styles.parallax}>
        <span className={styles.arrive}>
          <span className={styles.bob}>
            <span ref={planetRef} className={styles.planetBox}>
              <Planet kind={world.kind} seed={world.seed} hovered={hovered} bodyRef={bodyRef} className={styles.planet} />
            </span>
            <WorldLabel world={world} kind={world.kind} placement={place.wide} layout="wide" />
            <WorldLabel world={world} kind={world.kind} placement={place.tall} layout="tall" />
          </span>
        </span>
      </span>
    </Link>
  )
}

function WorldLabel({
  world,
  kind,
  placement,
  layout,
}: {
  world: World
  kind: PlanetKind
  placement: Placement
  layout: 'wide' | 'tall'
}) {
  const { lead, label } = labelGeometry(kind, placement)
  return (
    <span className={styles.labelSet} data-layout={layout} data-side={placement.side}>
      <span
        className={styles.lead}
        style={{ left: u(lead.left), top: u(lead.top), width: u(lead.width), height: u(lead.height) }}
      />
      <span
        className={styles.label}
        data-align={label.align}
        style={{ left: u(label.left), top: u(label.top), transform: label.shift }}
      >
        <span className={styles.num}>{world.number}</span>
        <span className={styles.title} data-italic={world.italic || undefined}>
          {world.name}
        </span>
        <span className={styles.sub}>{world.descriptor}</span>
        <span className={styles.enter}>enter →</span>
      </span>
    </span>
  )
}

/** Worlds drift against the cursor by their depth — near planets move more. */
function useParallax(stageRef: React.RefObject<HTMLDivElement | null>, enabled: boolean) {
  useEffect(() => {
    const stage = stageRef.current
    if (!stage || !enabled) return
    const fine = window.matchMedia('(pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches || reduced.matches) return

    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    let frame = 0

    const step = () => {
      current.x += (target.x - current.x) * 0.06
      current.y += (target.y - current.y) * 0.06
      stage.style.setProperty('--px', current.x.toFixed(4))
      stage.style.setProperty('--py', current.y.toFixed(4))
      frame =
        Math.abs(target.x - current.x) + Math.abs(target.y - current.y) > 0.0005 ? requestAnimationFrame(step) : 0
    }
    const onMove = (e: PointerEvent) => {
      target.x = -(e.clientX / window.innerWidth - 0.5) * 2
      target.y = -(e.clientY / window.innerHeight - 0.5) * 2
      if (!frame) frame = requestAnimationFrame(step)
    }
    const onLeave = () => {
      target.x = 0
      target.y = 0
      if (!frame) frame = requestAnimationFrame(step)
    }

    window.addEventListener('pointermove', onMove)
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [stageRef, enabled])
}
