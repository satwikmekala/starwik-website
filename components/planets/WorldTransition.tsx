'use client'

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { PlanetWarp, type WarpOrigin } from './PlanetWarp'

interface Destination {
  href: string
  name: string
  accent: string
}
interface Journey { destination: Destination; origin: WarpOrigin }

const TransitionContext = createContext<{
  activeHref: string | null
  launch: (destination: Destination, origin: WarpOrigin) => void
}>({ activeHref: null, launch: () => {} })

/** Lives above the routes: the departing world and arriving page share one curtain. */
export function WorldTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [journey, setJourney] = useState<Journey | null>(null)
  const busy = useRef(false)
  const launch = useCallback((destination: Destination, origin: WarpOrigin) => {
    if (busy.current) return
    busy.current = true
    router.prefetch(destination.href)
    setJourney({ destination, origin })
  }, [router])
  const finish = useCallback(() => {
    busy.current = false
    setJourney(null)
  }, [])
  const navigate = useCallback(() => {
    if (journey) router.push(journey.destination.href)
  }, [journey, router])

  return (
    <TransitionContext.Provider value={{ activeHref: journey?.destination.href ?? null, launch }}>
      {children}
      {journey && (
        <PlanetWarp
          origin={journey.origin}
          destination={journey.destination}
          arrived={pathname === journey.destination.href}
          onNavigate={navigate}
          onFinish={finish}
        />
      )}
    </TransitionContext.Provider>
  )
}

export const useWorldTransition = () => useContext(TransitionContext)
