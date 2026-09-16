'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'

import { press, tapScale } from './motion'

// Every control in the room: compresses under the finger, springs back on release.

export function Press({ type = 'button', ...props }: HTMLMotionProps<'button'>) {
  return (
    <motion.button
      type={type}
      whileTap={{ ...tapScale, transition: press }}
      {...props}
    />
  )
}

export function PressLink(props: HTMLMotionProps<'a'>) {
  return <motion.a whileTap={{ ...tapScale, transition: press }} {...props} />
}
