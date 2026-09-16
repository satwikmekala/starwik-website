'use client'

import { createContext, useContext } from 'react'
import type { MotionValue } from 'framer-motion'

import type { Mix } from '@/app/frequencies/mixes'
import type { AudioPlayer } from './useAudioPlayer'

export type View = 'closed' | 'browse' | 'player'
/** where the thing that's opening came from — decides which element it morphs out of */
export type Origin = 'entry' | 'card' | 'dock' | 'deeplink'

export const ENTRY_ID = 'listening-room-entry'

export type ListeningContext = {
  mixes: Mix[]
  view: View
  /** the mix the player is showing */
  focused: Mix | null
  /** the mix loaded in the audio element */
  current: Mix | null
  /** a record has been put on at least once — the dock appears */
  started: boolean
  roomOrigin: Origin
  playerOrigin: Origin
  audio: AudioPlayer
  platter: MotionValue<number>
  openRoom: () => void
  openMix: (mix: Mix, origin: 'card' | 'dock') => void
  playFocused: () => void
  back: () => void
  putAway: () => void
}

export const Listening = createContext<ListeningContext | null>(null)

export function useListening() {
  const value = useContext(Listening)
  if (!value) throw new Error('useListening must be used inside <ListeningRoomProvider>')
  return value
}

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}
