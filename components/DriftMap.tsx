/**
 * DriftMap — the Mapbox + GSAP heart of "Elsewhere".
 *
 * The map is a fixed, full-viewport canvas that never moves. A tall
 * scroll track (one viewport per chapter) sits behind it purely to
 * create scroll distance. ScrollTrigger reads progress over that track,
 * snaps to chapter positions, and every chapter change fires a
 * cinematic flyTo. The dot nav jumps by tweening the scroll position
 * itself, so scroll and click share one code path.
 */
'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import {
  CHAPTERS,
  VISITED_COUNTRIES,
  LOCATION_DOTS,
} from '@/app/drift/chapters'
import styles from '@/app/drift/drift.module.css'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

export interface DriftMapController {
  goToChapter: (index: number) => void
}

interface DriftMapProps {
  activeIndex: number
  onChapterChange: (index: number) => void
  /** fires true on camera movestart, false on moveend — the panel softens mid-flight */
  onFlyingChange: (flying: boolean) => void
  controllerRef: MutableRefObject<DriftMapController | null>
}

const TOTAL = CHAPTERS.length

// Only render country polygons once per country (the boundaries tileset
// ships one polygon per disputed worldview).
const WORLDVIEW_FILTER = [
  'any',
  ['==', ['get', 'worldview'], 'all'],
  ['in', 'IN', ['get', 'worldview']],
]

export default function DriftMap({
  activeIndex,
  onChapterChange,
  onFlyingChange,
  controllerRef,
}: DriftMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const coordsRef = useRef<HTMLDivElement>(null)
  const constellationPathRef = useRef<SVGPathElement>(null)

  const mapRef = useRef<mapboxgl.Map | null>(null)
  const styleReadyRef = useRef(false)
  const indexRef = useRef(0) // last index reported to the parent
  const flownIndexRef = useRef(0) // last index the camera flew to
  const jumpingRef = useRef(false) // true while a dot-nav scroll tween runs
  const constellationPointsRef = useRef<[number, number][] | null>(null)
  const constellationTokenRef = useRef(0)
  const reducedMotionRef = useRef(false)
  const onChapterChangeRef = useRef(onChapterChange)
  const onFlyingChangeRef = useRef(onFlyingChange)

  useEffect(() => {
    onChapterChangeRef.current = onChapterChange
    onFlyingChangeRef.current = onFlyingChange
  }, [onChapterChange, onFlyingChange])

  // ── Keep the constellation glued to the earth as the camera moves ──
  const updateConstellationPath = useCallback(() => {
    const map = mapRef.current
    const path = constellationPathRef.current
    if (!map || !path) return
    const points = constellationPointsRef.current
    if (!points) {
      path.setAttribute('d', '')
      return
    }
    const d = points
      .map((lngLat, i) => {
        const { x, y } = map.project(lngLat)
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
      })
      .join(' ')
    path.setAttribute('d', d)
  }, [])

  // ── Overview chapters emphasise their arc countries ──
  const applyArcState = useCallback((index: number) => {
    const map = mapRef.current
    if (!map || !styleReadyRef.current) return
    const arc = CHAPTERS[index].arcCountries ?? []
    for (const iso of VISITED_COUNTRIES) {
      map.setFeatureState(
        {
          source: 'drift-countries',
          sourceLayer: 'country_boundaries',
          id: iso,
        },
        { arc: arc.includes(iso) }
      )
    }
  }, [])

  // ── Map initialisation ──
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    reducedMotionRef.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''

    const first = CHAPTERS[0]
    const map = new mapboxgl.Map({
      container,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: first.coordinates,
      zoom: first.zoom,
      bearing: first.bearing,
      pitch: first.pitch,
      attributionControl: false,
      projection: 'globe',
      antialias: true,
    })
    mapRef.current = map

    // Scroll drives the camera — the map itself is not interactive.
    map.scrollZoom.disable()
    map.boxZoom.disable()
    map.dragRotate.disable()
    map.dragPan.disable()
    map.keyboard.disable()
    map.doubleClickZoom.disable()
    map.touchZoomRotate.disable()
    map.touchPitch.disable()

    map.on('style.load', () => {
      // ── Restyle dark-v11 into the wikverse palette ──
      for (const layer of map.getStyle()?.layers ?? []) {
        if (layer.type === 'background') {
          map.setPaintProperty(layer.id, 'background-color', '#07070A')
        }
        if (layer.type === 'fill' && /water/.test(layer.id)) {
          map.setPaintProperty(layer.id, 'fill-color', '#0D0D12')
        }
        if (layer.type === 'line' && layer.id.startsWith('admin')) {
          map.setPaintProperty(
            layer.id,
            'line-color',
            'rgba(242,237,230,0.06)'
          )
        }
        if (layer.type === 'symbol') {
          if (/poi|road|transit|airport|ferry|golf/.test(layer.id)) {
            map.setLayoutProperty(layer.id, 'visibility', 'none')
          } else {
            map.setPaintProperty(layer.id, 'text-color', 'rgba(242,237,230,0.3)')
            map.setPaintProperty(
              layer.id,
              'text-halo-color',
              'rgba(7,7,10,0.75)'
            )
          }
        }
      }

      // Deep-space atmosphere around the globe
      map.setFog({
        color: 'rgba(13,13,18,0.9)',
        'high-color': '#0D0D12',
        'space-color': '#07070A',
        'horizon-blend': 0.04,
        'star-intensity': 0.2,
      })

      // 3D terrain — the Himalaya chapters fly at pitch 55–60 over this
      map.addSource('drift-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14,
      })
      map.setTerrain({ source: 'drift-dem', exaggeration: 1.35 })

      // ── Country fills ──
      map.addSource('drift-countries', {
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1',
        promoteId: 'iso_3166_1',
      })

      const firstSymbolId = map
        .getStyle()
        ?.layers?.find((l) => l.type === 'symbol')?.id

      map.addLayer(
        {
          id: 'drift-country-fill',
          type: 'fill',
          source: 'drift-countries',
          'source-layer': 'country_boundaries',
          filter: WORLDVIEW_FILTER as never,
          paint: {
            'fill-color': '#F2EDE6',
            'fill-opacity': 0.02,
          },
        },
        firstSymbolId
      )

      map.addLayer(
        {
          id: 'drift-visited-fill',
          type: 'fill',
          source: 'drift-countries',
          'source-layer': 'country_boundaries',
          filter: [
            'all',
            WORLDVIEW_FILTER,
            ['in', ['get', 'iso_3166_1'], ['literal', VISITED_COUNTRIES]],
          ] as never,
          paint: {
            'fill-color': '#C45A18',
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.35,
              ['boolean', ['feature-state', 'arc'], false],
              0.32,
              0.2,
            ] as never,
          },
        },
        firstSymbolId
      )

      // ── Specific visited locations — brighter amber dots at 1.2x ──
      map.addSource('drift-locations', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: LOCATION_DOTS.map((dot) => ({
            type: 'Feature' as const,
            properties: { name: dot.name },
            geometry: {
              type: 'Point' as const,
              coordinates: dot.coordinates,
            },
          })),
        },
      })
      const dotRadius = [
        'interpolate',
        ['linear'],
        ['zoom'],
        2, 2.6,
        6, 3.6,
        10, 4.8,
      ] as never
      map.addLayer({
        id: 'drift-location-glow',
        type: 'circle',
        source: 'drift-locations',
        paint: {
          'circle-color': '#E8A040',
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 7, 10, 13] as never,
          'circle-blur': 1.4,
          'circle-opacity': 0.35,
        },
      })
      map.addLayer({
        id: 'drift-location-dot',
        type: 'circle',
        source: 'drift-locations',
        paint: {
          'circle-color': '#E8A040',
          'circle-radius': dotRadius,
          'circle-opacity': 0.95,
        },
      })

      styleReadyRef.current = true
      applyArcState(indexRef.current)
    })

    // ── Hover glow on visited countries ──
    let hoveredIso: string | null = null
    const setHover = (iso: string | null) => {
      if (hoveredIso === iso) return
      if (hoveredIso) {
        map.setFeatureState(
          {
            source: 'drift-countries',
            sourceLayer: 'country_boundaries',
            id: hoveredIso,
          },
          { hover: false }
        )
      }
      hoveredIso = iso
      if (iso) {
        map.setFeatureState(
          {
            source: 'drift-countries',
            sourceLayer: 'country_boundaries',
            id: iso,
          },
          { hover: true }
        )
      }
    }
    map.on('mousemove', 'drift-visited-fill', (e) => {
      const iso = e.features?.[0]?.id
      setHover(typeof iso === 'string' ? iso : null)
    })
    map.on('mouseleave', 'drift-visited-fill', () => setHover(null))

    map.on('move', updateConstellationPath)
    map.on('resize', updateConstellationPath)

    // ── Live GPS readout — ticks via rAF while the camera flies ──
    const setCoordsText = () => {
      if (!coordsRef.current) return
      const c = map.getCenter()
      coordsRef.current.textContent = formatCoords([c.lng, c.lat])
    }
    let coordsRaf = 0
    const tickCoords = () => {
      setCoordsText()
      coordsRaf = requestAnimationFrame(tickCoords)
    }
    map.on('movestart', () => {
      onFlyingChangeRef.current(true)
      cancelAnimationFrame(coordsRaf)
      coordsRaf = requestAnimationFrame(tickCoords)
    })
    map.on('moveend', () => {
      onFlyingChangeRef.current(false)
      cancelAnimationFrame(coordsRaf)
      setCoordsText()
    })
    setCoordsText()

    return () => {
      styleReadyRef.current = false
      cancelAnimationFrame(coordsRaf)
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Scroll orchestration ──
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        if (jumpingRef.current) return
        const idx = Math.round(self.progress * (TOTAL - 1))
        if (idx !== indexRef.current) {
          indexRef.current = idx
          onChapterChangeRef.current(idx)
        }
      },
      snap: {
        snapTo: 1 / (TOTAL - 1),
        duration: { min: 0.35, max: 0.9 },
        delay: 0.08,
        ease: 'power2.out',
      },
    })
    return () => st.kill()
  }, [])

  // ── Dot-nav / keyboard jumps share the scroll code path ──
  const goToChapter = useCallback((index: number) => {
    const target = Math.max(0, Math.min(TOTAL - 1, index))
    if (target === indexRef.current && !jumpingRef.current) return
    jumpingRef.current = true
    indexRef.current = target
    onChapterChangeRef.current(target)
    gsap.to(window, {
      duration: 1.1,
      ease: 'power2.inOut',
      scrollTo: { y: target * window.innerHeight },
      overwrite: 'auto',
      onComplete: () => {
        jumpingRef.current = false
      },
      onInterrupt: () => {
        jumpingRef.current = false
      },
    })
  }, [])

  useEffect(() => {
    controllerRef.current = { goToChapter }
    return () => {
      controllerRef.current = null
    }
  }, [controllerRef, goToChapter])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault()
        goToChapter(indexRef.current + 1)
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        goToChapter(indexRef.current - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goToChapter])

  // ── Chapter change → cinematic flight + constellation ──
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const chapter = CHAPTERS[activeIndex]

    if (activeIndex !== flownIndexRef.current) {
      flownIndexRef.current = activeIndex
      const camera = {
        center: chapter.coordinates,
        zoom: chapter.zoom,
        bearing: chapter.bearing,
        pitch: chapter.pitch,
      }
      if (reducedMotionRef.current) {
        map.jumpTo(camera)
      } else {
        // speed/curve (not a fixed duration) so long hauls arc out
        // through space and short hops stay tight — pure cinema
        map.flyTo({
          ...camera,
          speed: 1.1,
          curve: 1.5,
          maxDuration: 6000,
          essential: true,
        })
      }
    }

    applyArcState(activeIndex)

    // Constellation lines draw themselves once the flight settles
    const token = ++constellationTokenRef.current
    const path = constellationPathRef.current
    if (chapter.constellation && path) {
      constellationPointsRef.current = chapter.constellation
      gsap.set(path, { opacity: 0 })
      const startDraw = () => {
        if (token !== constellationTokenRef.current) return
        updateConstellationPath()
        const length = path.getTotalLength()
        if (length === 0) return
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
          opacity: 1,
        })
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 1.5,
          ease: 'power1.inOut',
          // free the dash so the line survives later re-projection
          onComplete: () => gsap.set(path, { strokeDasharray: 'none' }),
        })
      }
      map.once('moveend', startDraw)
      return () => {
        map.off('moveend', startDraw)
      }
    } else if (path) {
      gsap.to(path, {
        opacity: 0,
        duration: 0.4,
        onComplete: () => {
          if (token === constellationTokenRef.current) {
            constellationPointsRef.current = null
            updateConstellationPath()
          }
        },
      })
    }
  }, [activeIndex, applyArcState, updateConstellationPath])

  return (
    <>
      {/* Scroll distance: one viewport of scrolling per chapter */}
      <div
        ref={trackRef}
        className={styles.scrollTrack}
        style={{ height: `${TOTAL * 100}svh` }}
        aria-hidden
      />

      {/* The map never moves — the world moves beneath it */}
      <div ref={containerRef} className={styles.mapContainer} />

      {/* Constellation lines between visited countries (overview chapters) */}
      <svg className={styles.constellationSvg} aria-hidden>
        <path
          ref={constellationPathRef}
          className={styles.constellationPath}
        />
      </svg>

      {/* Progress: 1px amber line on the very left edge,
          filling chapter by chapter with a 400ms ease */}
      <div className={styles.progressTrack} aria-hidden>
        <div
          className={styles.progressFill}
          style={{ transform: `scaleY(${activeIndex / (TOTAL - 1)})` }}
        />
      </div>

      {/* Coordinates readout — ticks like a GPS during flight */}
      <div ref={coordsRef} className={styles.coordsReadout}>
        {formatCoords(CHAPTERS[0].coordinates)}
      </div>

      {/* Scroll hint, visible on the opening chapter only */}
      <div
        className={`${styles.scrollHint} ${
          activeIndex === 0 ? '' : styles.scrollHintHidden
        }`}
        aria-hidden
      >
        <span>SCROLL TO DEPART</span>
        <span className={styles.scrollHintLine} />
      </div>

      {/* Mapbox requires attribution — kept, but whispered */}
      <div className={styles.attribution}>© Mapbox © OpenStreetMap</div>
    </>
  )
}

function formatCoords([lng, lat]: [number, number]): string {
  const ns = lat >= 0 ? 'N' : 'S'
  const ew = lng >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(4)}°${ns} · ${Math.abs(lng).toFixed(4)}°${ew}`
}
