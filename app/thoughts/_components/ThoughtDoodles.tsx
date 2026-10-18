'use client'

import { Children, cloneElement, isValidElement, useEffect, useId, useState, type CSSProperties, type ReactElement, type ReactNode, type SVGProps } from 'react'
import styles from './superpositionDoodles.module.css'

type StrokeProps = SVGProps<SVGElement>

/** A separate pen mask preserves dashed lines while revealing each stroke. */
function traceStrokes(node: ReactNode, id: string, counter: { value: number }, traceClassName: string): ReactNode {
  return Children.map(node, (child) => {
    if (!isValidElement(child)) return child
    const element = child as ReactElement<StrokeProps>
    if (['path', 'circle', 'ellipse', 'line', 'polyline'].includes(String(element.type))) {
      const order = counter.value++
      const mask = `${id}-stroke-${order}`
      const pen = cloneElement(element, {
        className: traceClassName,
        style: { '--stroke-order': order } as CSSProperties,
        fill: 'none', stroke: '#fff', strokeWidth: 12,
        pathLength: 1, strokeDasharray: '1', vectorEffect: 'non-scaling-stroke',
      })
      return <g>
        <defs><mask id={mask} maskUnits="userSpaceOnUse" x="-20" y="-20" width="260" height="280">{pen}</mask></defs>
        {cloneElement(element, { mask: `url(#${mask})`, vectorEffect: 'non-scaling-stroke' })}
      </g>
    }
    return cloneElement(element, { children: traceStrokes(element.props.children, id, counter, traceClassName) })
  })
}

export function Sketch({ children, traceClassName = styles.trace }: { children: ReactNode; traceClassName?: string }) {
  const id = useId()
  return <svg viewBox="0 0 220 240" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" focusable="false">
    {traceStrokes(children, id, { value: 0 }, traceClassName)}
  </svg>
}

export type DoodlePlacement<Name extends string = string> = {
  drawing: Name
  side: 'left' | 'right'
  x: number
  y: number
  size: number
  rotation: number
}

type ThoughtDoodlesProps<Name extends string> = {
  chapters: readonly string[]
  drawings: Record<Name, () => ReactNode>
  compositions: readonly (readonly DoodlePlacement<Name>[])[]
  pencil?: string
  highlight?: string
}

/** Shared pen animation and reading position, with artwork specific to each essay. */
export function ThoughtDoodles<Name extends string>({ chapters, drawings, compositions, pencil, highlight }: ThoughtDoodlesProps<Name>) {
  const [scene, setScene] = useState({ stage: 0, visible: false })

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1120px) and (min-height: 560px)')
    const body = document.querySelector<HTMLElement>('[data-thought-body]')
    const headings = chapters.map((id) => document.getElementById(id))
    if (!body) return
    let frame = 0
    let previous = { stage: 0, visible: false }

    const update = () => {
      frame = 0
      const bounds = body.getBoundingClientRect()
      const visible = desktop.matches && bounds.top < innerHeight * .68 && bounds.bottom > innerHeight * .32
      let stage = 0
      headings.forEach((heading, index) => {
        if (heading && heading.getBoundingClientRect().top <= innerHeight * .42) stage = index + 1
      })
      if (stage !== previous.stage || visible !== previous.visible) {
        previous = { stage, visible }
        setScene(previous)
      }
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const onScroll = () => { if (desktop.matches) schedule() }
    schedule()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', schedule)
    desktop.addEventListener('change', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', schedule)
      desktop.removeEventListener('change', schedule)
    }
  }, [chapters])

  return <div className={styles.margins} aria-hidden="true" style={{ ...(pencil ? { '--pencil': pencil } : {}), ...(highlight ? { '--starlight': highlight } : {}) } as CSSProperties} data-doodle-stage={scene.stage} data-visible={scene.visible}>
    {(['left', 'right'] as const).map((side) => <div key={side} className={styles.field} data-side={side}>
      {compositions.flatMap((composition, stage) => composition.map((placement, index) => {
        if (placement.side !== side) return null
        const Drawing: () => ReactNode = drawings[placement.drawing]
        return <div key={`${stage}-${index}`} className={styles.doodle}
          data-active={scene.visible && scene.stage === stage}
          data-drawing={placement.drawing}
          style={{
            '--x': `${placement.x}%`, '--y': `${placement.y}%`,
            '--size': `${placement.size}px`, '--rotation': `${placement.rotation}deg`,
            '--pen-delay': `${index * 110}ms`,
          } as CSSProperties}>
          <Drawing />
        </div>
      }))}
    </div>)}
  </div>
}
