'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MotionConfig, useReducedMotion } from 'framer-motion'

import { mixes, type Mix } from '@/app/frequencies/mixes'
import { ENTRY_ID, Listening, type ListeningContext, type Origin, type View } from './context'
import { useAudioPlayer } from './useAudioPlayer'
import { usePlatter } from './usePlatter'
import { ListeningRoom } from './ListeningRoom'
import { Dock } from './Dock'

type HistoryMark = {
  listening?: 'browse' | 'player'
  listeningSlug?: string
  listeningDepth?: number
}

const ROOM_PATH = '/frequencies'

function urlFor(view: View, slug?: string) {
  if (window.location.pathname !== ROOM_PATH) return undefined
  if (view === 'player' && slug) return `${ROOM_PATH}?mix=${slug}`
  return window.location.search ? ROOM_PATH : undefined
}

export function ListeningRoomProvider({ children }: { children: React.ReactNode }) {
  const { audioRef, player: audio } = useAudioPlayer()
  const reducedMotion = useReducedMotion() ?? false
  const [view, setView] = useState<View>('closed')
  const [focused, setFocused] = useState<Mix | null>(null)
  const [current, setCurrent] = useState<Mix | null>(null)
  const [started, setStarted] = useState(false)
  const [roomOrigin, setRoomOrigin] = useState<Origin>('entry')
  const [playerOrigin, setPlayerOrigin] = useState<Origin>('card')
  const platter = usePlatter(audio.playing && !audio.buffering && !reducedMotion)

  // how many of the history entries below us are ours to pop
  const depth = useRef(0)
  const currentSlug = useRef<string | null>(null)
  const viewRef = useRef<View>('closed')

  useEffect(() => {
    currentSlug.current = current?.slug ?? null
    viewRef.current = view
  }, [current, view])

  const go = useCallback((next: 'browse' | 'player', slug?: string) => {
    const mark: HistoryMark = {
      listening: next,
      listeningSlug: slug,
      listeningDepth: depth.current + 1,
    }
    window.history.pushState(mark, '', urlFor(next, slug))
    depth.current += 1
    setView(next)
  }, [])

  const loadMix = useCallback(
    (mix: Mix, autoplay: boolean) => {
      if (!mix.audio) return
      if (mix.slug !== currentSlug.current) {
        audio.load(mix.audio.src, mix.duration)
        platter.set(0)
        setCurrent(mix)
      }
      if (autoplay) {
        void audio.play()
        setStarted(true)
      }
    },
    [audio, platter]
  )

  const openRoom = useCallback(() => {
    if (viewRef.current !== 'closed') return
    setRoomOrigin('entry')
    go('browse')
  }, [go])

  const openMix = useCallback(
    (mix: Mix, origin: 'card' | 'dock') => {
      setFocused(mix)
      setPlayerOrigin(origin)
      if (viewRef.current === 'closed') setRoomOrigin(origin)
      // tapping a card is the gesture that starts the record — play inside it
      // so mobile browsers allow sound
      loadMix(mix, origin === 'card')
      go('player', mix.slug)
    },
    [go, loadMix]
  )

  const playFocused = useCallback(() => {
    if (!focused) return
    if (focused.slug === currentSlug.current) {
      setStarted(true)
      audio.toggle()
    } else {
      loadMix(focused, true)
    }
  }, [audio, focused, loadMix])

  const back = useCallback(() => {
    const now = viewRef.current
    if (now === 'closed') return
    if (depth.current > 0) {
      window.history.back()
      return
    }
    // landed here from a shared link — nothing of ours to pop, so step down in place
    const next: View = now === 'player' ? 'browse' : 'closed'
    const mark: HistoryMark = next === 'browse' ? { listening: 'browse', listeningDepth: 0 } : {}
    window.history.replaceState(mark, '', urlFor(next))
    setView(next)
  }, [])

  const putAway = useCallback(() => {
    audio.unload()
    setStarted(false)
    setCurrent(null)
  }, [audio])

  // history: back/forward walks the room's levels
  useEffect(() => {
    const onPop = (event: PopStateEvent) => {
      const mark = (event.state ?? {}) as HistoryMark
      depth.current = mark.listeningDepth ?? 0
      if (mark.listening === 'player') {
        const mix = mixes.find((m) => m.slug === mark.listeningSlug)
        if (mix && (mix.slug === currentSlug.current || !mix.audio)) {
          setFocused(mix)
          setView('player')
          return
        }
        setView('browse')
        return
      }
      setView(mark.listening ?? 'closed')
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // a shared link — /frequencies?mix=vol-03 — opens straight into the player
  useEffect(() => {
    if (window.location.pathname !== ROOM_PATH) return
    const slug = new URLSearchParams(window.location.search).get('mix')
    const mix = mixes.find((m) => m.slug === slug)
    if (!mix) return
    const frame = requestAnimationFrame(() => {
      window.history.replaceState(
        { listening: 'player', listeningSlug: mix.slug, listeningDepth: 0 } satisfies HistoryMark,
        ''
      )
      setFocused(mix)
      setRoomOrigin('deeplink')
      setPlayerOrigin('deeplink')
      loadMix(mix, false)
      setView('player')
    })
    return () => cancelAnimationFrame(frame)
    // only on first arrival
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // the room owns the viewport while it's open
  useEffect(() => {
    if (view === 'closed') return
    const root = document.documentElement
    const gutter = window.innerWidth - root.clientWidth
    const previous = { overflow: root.style.overflow, paddingRight: root.style.paddingRight }
    root.style.overflow = 'hidden'
    if (gutter > 0) root.style.paddingRight = `${gutter}px`
    return () => {
      root.style.overflow = previous.overflow
      root.style.paddingRight = previous.paddingRight
    }
  }, [view])

  // hand focus back to the entry button once the room folds away
  const wasOpen = useRef(false)
  useEffect(() => {
    if (view !== 'closed') {
      wasOpen.current = true
      return
    }
    if (!wasOpen.current) return
    wasOpen.current = false
    const frame = requestAnimationFrame(() => {
      document.getElementById(ENTRY_ID)?.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(frame)
  }, [view])

  const dockVisible = started && current !== null && view !== 'player'

  // leave room at the bottom of scrolling pages for the dock
  useEffect(() => {
    document.documentElement.toggleAttribute('data-listening-dock', dockVisible)
  }, [dockVisible])

  // keyboard: escape steps back a level; space / arrows drive the player
  useEffect(() => {
    if (view === 'closed') return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        back()
        return
      }
      if (view !== 'player' || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target?.closest('button, a, input, [role="slider"]')) return
      if (event.key === ' ' || event.key === 'k') {
        event.preventDefault()
        playFocused()
      } else if (event.key === 'ArrowLeft' || event.key === 'j') {
        audio.skip(-15)
      } else if (event.key === 'ArrowRight' || event.key === 'l') {
        audio.skip(15)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [view, back, playFocused, audio])

  // lock screen / hardware keys
  useEffect(() => {
    if (!('mediaSession' in navigator) || !current) return
    const cover = new URL(current.cover, window.location.href).href
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.title,
      artist: '★wik',
      album: 'frequencies',
      artwork: [{ src: cover, sizes: '512x512' }],
    })
    const handlers: Array<[MediaSessionAction, MediaSessionActionHandler]> = [
      ['play', () => void audio.play()],
      ['pause', () => audio.pause()],
      ['seekbackward', () => audio.skip(-15)],
      ['seekforward', () => audio.skip(15)],
      ['seekto', (details) => details.seekTime != null && audio.seek(details.seekTime)],
    ]
    handlers.forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler)
      } catch {
        // not every browser supports every action
      }
    })
    return () => handlers.forEach(([action]) => {
      try {
        navigator.mediaSession.setActionHandler(action, null)
      } catch {}
    })
  }, [current, audio])

  const value = useMemo<ListeningContext>(
    () => ({
      mixes,
      view,
      focused,
      current,
      started,
      roomOrigin,
      playerOrigin,
      audio,
      platter,
      openRoom,
      openMix,
      playFocused,
      back,
      putAway,
    }),
    [view, focused, current, started, roomOrigin, playerOrigin, audio, platter, openRoom, openMix, playFocused, back, putAway]
  )

  return (
    <Listening.Provider value={value}>
      <div style={{ display: 'contents' }} inert={view !== 'closed'}>
        {children}
      </div>
      <MotionConfig reducedMotion="user">
        <ListeningRoom />
        <Dock visible={dockVisible} />
      </MotionConfig>
      <audio ref={audioRef} preload="metadata" />
    </Listening.Provider>
  )
}
