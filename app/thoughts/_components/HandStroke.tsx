import type { SVGProps } from 'react'
import type { Stroke } from './strokes'

interface HandStrokeProps extends Omit<SVGProps<SVGSVGElement>, 'stroke'> {
  stroke: Stroke
}

/** renders a generated mark in currentColor */
export function HandStroke({ stroke, ...props }: HandStrokeProps) {
  return (
    <svg
      viewBox={`0 ${-stroke.height / 2} ${stroke.width} ${stroke.height}`}
      width={stroke.width}
      height={stroke.height}
      fill="currentColor"
      overflow="visible"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d={stroke.d} />
    </svg>
  )
}

/** a pen-drawn arrow for "read the thought →" and "next thought →" */
export function HandArrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 12"
      width="24"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.15"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M1.2 6.6C6.4 6.1 12.8 6.7 21.4 6.1" />
      <path d="M16.9 2.6C18.4 3.9 19.9 5 21.5 6.1C19.9 7.1 18.5 8.3 17.2 9.7" />
    </svg>
  )
}
