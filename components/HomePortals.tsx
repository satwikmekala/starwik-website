'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PortalCard } from './PortalCard'
import { FrequencyPortal } from './FrequencyPortal'

interface Portal {
  id: string
  number: string
  name: string
  descriptor: string
  href: string
  accentColor: string
}

interface HomePortalsProps {
  portals: Portal[]
}

export function HomePortals({ portals }: HomePortalsProps) {
  const router = useRouter()
  const [portalActive, setPortalActive] = useState(false)
  const [originRect, setOriginRect] = useState<DOMRect | null>(null)
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const handlePortalComplete = useCallback(() => {
    router.push('/frequencies')
  }, [router])

  const handleCardClick = useCallback((portal: Portal, element: HTMLDivElement | null) => {
    if (portal.href === '/frequencies' && element) {
      // Trigger the frequency portal animation
      setOriginRect(element.getBoundingClientRect())
      setPortalActive(true)
    } else {
      // Navigate normally for other cards
      router.push(portal.href)
    }
  }, [router])

  const setCardRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) {
      cardRefs.current.set(id, el)
    } else {
      cardRefs.current.delete(id)
    }
  }, [])

  return (
    <>
      <div className="portals-grid">
        {portals.map((portal, i) => (
          <PortalCard
            key={portal.id}
            {...portal}
            index={i}
            onCustomClick={(el) => handleCardClick(portal, el)}
            customNavigation={portal.href === '/frequencies'}
            ref={(el: HTMLDivElement | null) => setCardRef(portal.id, el)}
          />
        ))}
      </div>

      <FrequencyPortal
        active={portalActive}
        originRect={originRect}
        onComplete={handlePortalComplete}
      />
    </>
  )
}
