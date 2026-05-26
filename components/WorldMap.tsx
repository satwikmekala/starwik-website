/**
 * WorldMap — Interactive travel map for the "Elsewhere" page.
 *
 * TO ADD PHOTOS:
 * In COUNTRY_DATA below, replace the `photos` array entries with real
 * image paths (e.g. "/images/travel/india-01.jpg"). Then swap the
 * placeholder <div> inside .wm-photo-slot with <Image> or <img>.
 */
'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { feature } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'

// ── DATA ──

interface CountryEntry {
  name: string
  city: string
  region: string
  quote: string
  tags: string[]
  solo: boolean
  duration: string
  bestThing: string
  photos: string[]
  order: number
}

type CountryFeature = GeoJSON.Feature<GeoJSON.Geometry, GeoJSON.GeoJsonProperties> & {
  id?: string | number
}

const COUNTRY_DATA: Record<string, CountryEntry> = {
  IN: {
    name: 'India',
    city: 'Hyderabad',
    region: 'South Asia',
    quote: 'Where it all starts. Where it always returns to.',
    tags: ['HOME BASE'],
    solo: false,
    duration: 'Always',
    bestThing: 'Chai at 2am on a quiet rooftop while the city hums below.',
    photos: [],
    order: 1,
  },
  NL: {
    name: 'Netherlands',
    city: 'Amsterdam',
    region: 'Western Europe',
    quote: 'Something cracked open here.',
    tags: ['EUROPE ARC', 'SOLO'],
    solo: true,
    duration: '10 days',
    bestThing: 'Getting lost along the canals at golden hour with no plan.',
    photos: [],
    order: 2,
  },
  DE: {
    name: 'Germany',
    city: 'Berlin',
    region: 'Central Europe',
    quote: 'Music as philosophy.',
    tags: ['EUROPE ARC', 'SOLO'],
    solo: true,
    duration: '2 weeks',
    bestThing: 'A dark room, heavy bass, and strangers who understood without words.',
    photos: [],
    order: 3,
  },
  CZ: {
    name: 'Czech Republic',
    city: 'Prague',
    region: 'Central Europe',
    quote: 'Old and strange and beautiful.',
    tags: ['EUROPE ARC', 'SOLO'],
    solo: true,
    duration: '5 days',
    bestThing: 'Walking across the Charles Bridge at dawn, completely alone.',
    photos: [],
    order: 4,
  },
  ES: {
    name: 'Spain',
    city: 'Mallorca → Barcelona',
    region: 'Southern Europe',
    quote: 'Sun, clarity, and the feeling of becoming.',
    tags: ['EUROPE ARC', 'SOLO'],
    solo: true,
    duration: '12 days',
    bestThing: 'Swimming in a hidden cove in Mallorca with nothing but sky.',
    photos: [],
    order: 5,
  },
  ID: {
    name: 'Indonesia',
    city: 'Bali · Gili T',
    region: 'South East Asia',
    quote: 'The magic was always inside you all along.',
    tags: ['SEA ARC', 'SOLO'],
    solo: true,
    duration: '3 weeks',
    bestThing: 'Sunrise on a motorbike through rice terraces with nowhere to be.',
    photos: [],
    order: 6,
  },
  PH: {
    name: 'Philippines',
    city: 'Bohol · Palawan',
    region: 'South East Asia',
    quote: 'Ocean. Presence. Nothing else needed.',
    tags: ['SEA ARC', 'SOLO'],
    solo: true,
    duration: '2 weeks',
    bestThing: 'Island hopping through water so clear it didn\'t look real.',
    photos: [],
    order: 7,
  },
  AU: {
    name: 'Australia',
    city: 'Noosa · Sydney',
    region: 'Pacific',
    quote: 'Returned different.',
    tags: ['PACIFIC', 'SOLO'],
    solo: true,
    duration: '3 weeks',
    bestThing: 'Morning surf at a beach with more dolphins than people.',
    photos: [],
    order: 8,
  },
}

const VISITED_CODES = Object.keys(COUNTRY_DATA)
const TRAVEL_ORDER = ['IN', 'NL', 'DE', 'CZ', 'ES', 'IN', 'ID', 'PH', 'AU', 'IN']

const ISO_A2_TO_A3: Record<string, string> = {
  IN: 'IND', NL: 'NLD', DE: 'DEU', CZ: 'CZE',
  ES: 'ESP', ID: 'IDN', PH: 'PHL', AU: 'AUS',
}

const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  IN: [78.9, 22.5], NL: [5.3, 52.1], DE: [10.4, 51.2], CZ: [15.5, 49.8],
  ES: [1.5, 39.5], ID: [117.0, -2.5], PH: [121.8, 12.9], AU: [134.0, -25.3],
}

const COUNTRY_ID_TO_A3: Record<string, string> = {
  '356': 'IND', '528': 'NLD', '276': 'DEU', '203': 'CZE',
  '724': 'ESP', '360': 'IDN', '608': 'PHL', '036': 'AUS',
  '004': 'AFG', '008': 'ALB', '012': 'DZA', '024': 'AGO',
  '032': 'ARG', '040': 'AUT', '050': 'BGD', '056': 'BEL',
  '068': 'BOL', '070': 'BIH', '072': 'BWA', '076': 'BRA',
  '100': 'BGR', '104': 'MMR', '116': 'KHM', '120': 'CMR',
  '124': 'CAN', '144': 'LKA', '148': 'TCD', '152': 'CHL',
  '156': 'CHN', '170': 'COL', '178': 'COG', '180': 'COD',
  '188': 'CRI', '191': 'HRV', '192': 'CUB', '196': 'CYP',
  '208': 'DNK', '218': 'ECU', '818': 'EGY', '222': 'SLV',
  '231': 'ETH', '233': 'EST', '246': 'FIN', '250': 'FRA',
  '266': 'GAB', '268': 'GEO', '288': 'GHA', '300': 'GRC',
  '320': 'GTM', '328': 'GUY', '332': 'HTI', '340': 'HND',
  '348': 'HUN', '352': 'ISL', '364': 'IRN',
  '368': 'IRQ', '372': 'IRL', '376': 'ISR', '380': 'ITA',
  '392': 'JPN', '400': 'JOR', '398': 'KAZ', '404': 'KEN',
  '410': 'KOR', '414': 'KWT', '418': 'LAO', '422': 'LBN',
  '428': 'LVA', '434': 'LBY', '440': 'LTU', '442': 'LUX',
  '458': 'MYS', '484': 'MEX', '496': 'MNG', '504': 'MAR',
  '508': 'MOZ', '512': 'OMN', '516': 'NAM', '524': 'NPL',
  '554': 'NZL', '558': 'NIC', '562': 'NER', '566': 'NGA',
  '578': 'NOR', '586': 'PAK', '591': 'PAN', '598': 'PNG',
  '600': 'PRY', '604': 'PER', '616': 'POL', '620': 'PRT',
  '634': 'QAT', '642': 'ROU', '643': 'RUS', '646': 'RWA',
  '682': 'SAU', '686': 'SEN', '688': 'SRB', '702': 'SGP',
  '703': 'SVK', '704': 'VNM', '705': 'SVN', '706': 'SOM',
  '710': 'ZAF', '716': 'ZWE', '728': 'SSD', '729': 'SDN',
  '740': 'SUR', '748': 'SWZ', '752': 'SWE', '756': 'CHE',
  '760': 'SYR', '762': 'TJK', '764': 'THA', '768': 'TGO',
  '780': 'TTO', '784': 'ARE', '788': 'TUN', '792': 'TUR',
  '800': 'UGA', '804': 'UKR', '826': 'GBR', '834': 'TZA',
  '840': 'USA', '854': 'BFA', '858': 'URY', '860': 'UZB',
  '862': 'VEN', '887': 'YEM', '894': 'ZMB',
}

// ── COMPONENT ──

export default function WorldMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [activeCountry, setActiveCountry] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const worldDataRef = useRef<Topology | null>(null)

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return

    const svgElement = svgRef.current
    if (!svgElement) return

    const svg = d3.select<SVGSVGElement, unknown>(svgElement)
    svg.selectAll('*').remove()

    const { width, height } = dimensions

    const viewBounds: GeoJSON.Feature<GeoJSON.Polygon> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-15, 62], [160, 62], [160, -48], [-15, -48], [-15, 62],
        ]],
      },
    }

    const projection = d3.geoNaturalEarth1().fitSize([width, height], viewBounds)
    const path = d3.geoPath().projection(projection)

    const fetchAndRender = async () => {
      let worldTopo: Topology
      if (worldDataRef.current) {
        worldTopo = worldDataRef.current
      } else {
        const res = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
        worldTopo = await res.json()
        worldDataRef.current = worldTopo
      }

      const countries = feature(
        worldTopo,
        worldTopo.objects.countries as GeometryCollection
      ) as GeoJSON.FeatureCollection<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>
      const countryFeatures = countries.features as CountryFeature[]

      const g = svg.append('g').attr('class', 'wm-countries')

      g.selectAll<SVGPathElement, CountryFeature>('path')
        .data(countryFeatures)
        .join('path')
        .attr('d', (d) => path(d) || '')
        .attr('data-code', (d) => {
          const a3 = COUNTRY_ID_TO_A3[String(d.id)]
          return Object.entries(ISO_A2_TO_A3).find(([, v]) => v === a3)?.[0] || ''
        })
        .attr('class', (d) => {
          const a3 = COUNTRY_ID_TO_A3[String(d.id)]
          const a2 = Object.entries(ISO_A2_TO_A3).find(([, v]) => v === a3)?.[0]
          return a2 && VISITED_CODES.includes(a2) ? 'wm-country wm-visited' : 'wm-country'
        })
        .on('mouseenter', function () {
          const code = (this as SVGPathElement).getAttribute('data-code')
          if (code && VISITED_CODES.includes(code)) setActiveCountry(code)
        })
        .on('mouseleave', function () {
          const code = (this as SVGPathElement).getAttribute('data-code')
          if (code && VISITED_CODES.includes(code)) setActiveCountry(null)
        })
        .on('click', function () {
          const code = (this as SVGPathElement).getAttribute('data-code')
          if (code && VISITED_CODES.includes(code)) {
            setActiveCountry((prev) => (prev === code ? null : code))
          }
        })

      // Constellation lines
      const linesG = svg.append('g').attr('class', 'wm-lines')
      for (let i = 0; i < TRAVEL_ORDER.length - 1; i++) {
        const from = projection(COUNTRY_CENTROIDS[TRAVEL_ORDER[i]])
        const to = projection(COUNTRY_CENTROIDS[TRAVEL_ORDER[i + 1]])
        if (!from || !to) continue
        const length = Math.sqrt((to[0] - from[0]) ** 2 + (to[1] - from[1]) ** 2)
        linesG.append('line')
          .attr('x1', from[0]).attr('y1', from[1])
          .attr('x2', to[0]).attr('y2', to[1])
          .attr('class', 'wm-constellation-line')
          .style('stroke-dasharray', `${length}`)
          .style('stroke-dashoffset', `${length}`)
          .style('animation-delay', `${i * 0.4 + 0.8}s`)
      }

      // Glow dots
      const dotsG = svg.append('g').attr('class', 'wm-dots')
      VISITED_CODES.forEach((code, i) => {
        const coords = projection(COUNTRY_CENTROIDS[code])
        if (!coords) return
        dotsG.append('circle').attr('cx', coords[0]).attr('cy', coords[1]).attr('r', 2.5)
          .attr('class', 'wm-dot-glow').style('animation-delay', `${i * 0.15}s`)
        dotsG.append('circle').attr('cx', coords[0]).attr('cy', coords[1]).attr('r', 1.2)
          .attr('class', 'wm-dot-core')
      })

      // Zoom
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([1, 6])
        .on('zoom', (event) => {
          svg.selectAll('g').attr('transform', event.transform.toString())
        })
      svg.call(zoom)
      svg.on('dblclick.zoom', null)
    }

    fetchAndRender()
  }, [dimensions])

  const activeData = activeCountry ? COUNTRY_DATA[activeCountry] : null

  return (
    <div ref={containerRef} className="wm-container">
      {/* Counter */}
      <div className="wm-counter">
        {VISITED_CODES.length} COUNTRIES · COUNTING
      </div>

      {/* SVG MAP */}
      <svg ref={svgRef} className="wm-svg" width={dimensions.width} height={dimensions.height} />

      {/* ── LEFT PANEL ── */}
      <div
        className={`wm-panel ${activeCountry ? 'wm-panel--open' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative corner strokes */}
        <div className="wm-panel-corner wm-panel-corner--tl" />
        <div className="wm-panel-corner wm-panel-corner--br" />

        {activeData && activeCountry && (
          <div className="wm-panel-inner" key={activeCountry}>
            {/* Header line */}
            <div className="wm-panel-header">
              <span className="wm-panel-index">
                {String(activeData.order).padStart(2, '0')} / {String(VISITED_CODES.length).padStart(2, '0')}
              </span>
              <div className="wm-panel-header-line" />
              <span className="wm-panel-region">{activeData.region}</span>
            </div>

            {/* Country name */}
            <h2 className="wm-panel-name">{activeData.name}</h2>

            {/* City */}
            <span className="wm-panel-city">{activeData.city}</span>

            {/* Tags row */}
            <div className="wm-panel-tags">
              {activeData.tags.map((tag) => (
                <span key={tag} className="wm-panel-tag">{tag}</span>
              ))}
              {activeData.solo && (
                <span className="wm-panel-tag wm-panel-tag--solo">SOLO</span>
              )}
            </div>

            {/* Divider */}
            <div className="wm-panel-divider" />

            {/* Quote */}
            <p className="wm-panel-quote">&ldquo;{activeData.quote}&rdquo;</p>

            {/* Meta grid */}
            <div className="wm-panel-meta">
              <div className="wm-panel-meta-item">
                <span className="wm-panel-meta-label">DURATION</span>
                <span className="wm-panel-meta-value">{activeData.duration}</span>
              </div>
              <div className="wm-panel-meta-item">
                <span className="wm-panel-meta-label">TRAVEL STYLE</span>
                <span className="wm-panel-meta-value">{activeData.solo ? 'Solo' : 'Home'}</span>
              </div>
            </div>

            {/* Best thing */}
            <div className="wm-panel-section">
              <span className="wm-panel-section-label">BEST THING</span>
              <p className="wm-panel-section-body">{activeData.bestThing}</p>
            </div>

            {/* Photo grid */}
            <div className="wm-panel-section">
              <span className="wm-panel-section-label">MOMENTS</span>
              <div className="wm-panel-photos">
                <div className="wm-photo-slot">
                  <span className="wm-photo-label">ADD PHOTO</span>
                </div>
                <div className="wm-photo-slot wm-photo-slot--small">
                  <span className="wm-photo-label">+</span>
                </div>
                <div className="wm-photo-slot wm-photo-slot--small">
                  <span className="wm-photo-label">+</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click-away overlay on mobile */}
      {activeCountry && (
        <div className="wm-overlay" onClick={() => setActiveCountry(null)} />
      )}

      <style>{`
        .wm-container {
          position: relative;
          width: 100%;
          height: 100svh;
          background: #07070A;
          overflow: hidden;
          cursor: grab;
        }
        .wm-container:active { cursor: grabbing; }

        .wm-svg {
          display: block;
          position: absolute;
          inset: 0;
        }

        /* ── COUNTRIES ── */
        .wm-country {
          fill: rgba(242, 237, 230, 0.03);
          stroke: rgba(242, 237, 230, 0.06);
          stroke-width: 0.3;
          transition: fill 0.3s, stroke 0.3s, filter 0.3s;
          cursor: default;
        }
        .wm-visited {
          fill: rgba(196, 90, 24, 0.35);
          stroke: #C45A18;
          stroke-width: 0.6;
          cursor: pointer;
          animation: countryPulse 3s ease-in-out infinite;
        }
        .wm-visited:hover {
          fill: rgba(196, 90, 24, 0.55);
          stroke: #e67020;
          stroke-width: 0.9;
          filter: drop-shadow(0 0 8px rgba(196, 90, 24, 0.6));
        }
        @keyframes countryPulse {
          0%, 100% { fill: rgba(196, 90, 24, 0.3); filter: drop-shadow(0 0 2px rgba(196, 90, 24, 0.2)); }
          50% { fill: rgba(196, 90, 24, 0.45); filter: drop-shadow(0 0 6px rgba(196, 90, 24, 0.4)); }
        }

        /* ── CONSTELLATION LINES ── */
        .wm-constellation-line {
          stroke: rgba(196, 90, 24, 0.25);
          stroke-width: 0.5;
          fill: none;
          animation: drawLine 1.2s ease forwards;
        }
        @keyframes drawLine { to { stroke-dashoffset: 0; } }

        /* ── DOTS ── */
        .wm-dot-glow {
          fill: rgba(196, 90, 24, 0.35);
          animation: dotPulse 2.5s ease-in-out infinite;
        }
        .wm-dot-core { fill: #C45A18; }
        @keyframes dotPulse {
          0%, 100% { r: 2.5; opacity: 0.5; }
          50% { r: 4; opacity: 0.9; }
        }

        /* ── COUNTER ── */
        .wm-counter {
          position: absolute;
          top: 1.2rem;
          right: 1.5rem;
          font-family: var(--font-mono), monospace;
          font-size: 0.55rem;
          letter-spacing: 0.25em;
          color: rgba(242, 237, 230, 0.18);
          z-index: 10;
          pointer-events: none;
        }

        /* ── CLICK-AWAY OVERLAY (mobile) ── */
        .wm-overlay {
          display: none;
        }

        /* ══════════════════════════════════════
           LEFT PANEL
           ══════════════════════════════════════ */
        .wm-panel {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 100%;
          max-width: 460px;
          z-index: 30;
          background: rgba(7, 7, 10, 0.94);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-right: 1px solid rgba(196, 90, 24, 0.1);
          padding: 0;
          overflow-y: auto;
          overflow-x: hidden;
          transform: translateX(-100%);
          opacity: 0;
          transition:
            transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
            opacity 0.4s ease;
          pointer-events: none;
          scrollbar-width: none;
        }
        .wm-panel::-webkit-scrollbar { display: none; }
        .wm-panel--open {
          transform: translateX(0);
          opacity: 1;
          pointer-events: auto;
        }

        /* ── CORNER STROKES ── */
        .wm-panel-corner {
          position: absolute;
          width: 28px;
          height: 28px;
          pointer-events: none;
          z-index: 2;
        }
        .wm-panel-corner--tl {
          top: 1.5rem;
          left: 1.5rem;
          border-top: 1px solid rgba(196, 90, 24, 0.3);
          border-left: 1px solid rgba(196, 90, 24, 0.3);
        }
        .wm-panel-corner--br {
          bottom: 1.5rem;
          right: 1.5rem;
          border-bottom: 1px solid rgba(196, 90, 24, 0.3);
          border-right: 1px solid rgba(196, 90, 24, 0.3);
        }

        /* ── INNER CONTENT ── */
        .wm-panel-inner {
          padding: 3.5rem 2.2rem 3rem;
          animation: panelFadeIn 0.5s ease 0.1s both;
        }
        @keyframes panelFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── HEADER ── */
        .wm-panel-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.8rem;
        }
        .wm-panel-index {
          font-family: var(--font-mono), monospace;
          font-size: 0.5rem;
          letter-spacing: 0.2em;
          color: #C45A18;
          flex-shrink: 0;
        }
        .wm-panel-header-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(196, 90, 24, 0.3), rgba(196, 90, 24, 0.03));
        }
        .wm-panel-region {
          font-family: var(--font-mono), monospace;
          font-size: 0.45rem;
          letter-spacing: 0.2em;
          color: rgba(242, 237, 230, 0.25);
          flex-shrink: 0;
        }

        /* ── NAME ── */
        .wm-panel-name {
          font-family: var(--font-display), serif;
          font-size: clamp(2.4rem, 7vw, 3.2rem);
          font-weight: 300;
          color: #F2EDE6;
          letter-spacing: 0.04em;
          line-height: 1.1;
          margin: 0;
        }

        /* ── CITY ── */
        .wm-panel-city {
          display: block;
          font-family: var(--font-mono), monospace;
          font-size: 0.65rem;
          letter-spacing: 0.12em;
          color: rgba(242, 237, 230, 0.35);
          margin-top: 0.5rem;
        }

        /* ── TAGS ── */
        .wm-panel-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-top: 1.2rem;
        }
        .wm-panel-tag {
          font-family: var(--font-mono), monospace;
          font-size: 0.45rem;
          letter-spacing: 0.18em;
          color: rgba(196, 90, 24, 0.7);
          border: 1px solid rgba(196, 90, 24, 0.2);
          padding: 0.25rem 0.6rem;
          border-radius: 2px;
        }
        .wm-panel-tag--solo {
          color: rgba(242, 237, 230, 0.5);
          border-color: rgba(242, 237, 230, 0.12);
        }

        /* ── DIVIDER ── */
        .wm-panel-divider {
          width: 100%;
          height: 1px;
          margin: 1.8rem 0;
          background: linear-gradient(90deg,
            rgba(196, 90, 24, 0.25) 0%,
            rgba(196, 90, 24, 0.08) 60%,
            transparent 100%
          );
          position: relative;
        }
        .wm-panel-divider::after {
          content: '';
          position: absolute;
          left: 0;
          top: -2px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #C45A18;
          opacity: 0.5;
        }

        /* ── QUOTE ── */
        .wm-panel-quote {
          font-family: var(--font-display), serif;
          font-size: 1.15rem;
          font-style: italic;
          font-weight: 300;
          color: rgba(242, 237, 230, 0.6);
          line-height: 1.7;
          margin: 0 0 1.8rem;
          padding-left: 1rem;
          border-left: 2px solid rgba(196, 90, 24, 0.2);
        }

        /* ── META GRID ── */
        .wm-panel-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: rgba(196, 90, 24, 0.08);
          border: 1px solid rgba(196, 90, 24, 0.08);
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 1.8rem;
        }
        .wm-panel-meta-item {
          background: rgba(7, 7, 10, 0.9);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .wm-panel-meta-label {
          font-family: var(--font-mono), monospace;
          font-size: 0.4rem;
          letter-spacing: 0.2em;
          color: rgba(196, 90, 24, 0.5);
        }
        .wm-panel-meta-value {
          font-family: var(--font-display), serif;
          font-size: 0.95rem;
          font-weight: 400;
          color: #F2EDE6;
          letter-spacing: 0.02em;
        }

        /* ── SECTIONS ── */
        .wm-panel-section {
          margin-bottom: 1.8rem;
        }
        .wm-panel-section-label {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-family: var(--font-mono), monospace;
          font-size: 0.45rem;
          letter-spacing: 0.2em;
          color: rgba(196, 90, 24, 0.5);
          margin-bottom: 0.8rem;
        }
        .wm-panel-section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(196, 90, 24, 0.08);
        }
        .wm-panel-section-body {
          font-family: var(--font-display), serif;
          font-size: 0.9rem;
          font-weight: 300;
          color: rgba(242, 237, 230, 0.55);
          line-height: 1.7;
          margin: 0;
        }

        /* ── PHOTO GRID ── */
        .wm-panel-photos {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: auto auto;
          gap: 6px;
        }
        .wm-photo-slot {
          aspect-ratio: 16 / 9;
          border-radius: 6px;
          border: 1px dashed rgba(196, 90, 24, 0.15);
          background: rgba(196, 90, 24, 0.03);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          grid-column: 1 / -1;
          transition: border-color 0.3s, background 0.3s;
        }
        .wm-photo-slot:hover {
          border-color: rgba(196, 90, 24, 0.3);
          background: rgba(196, 90, 24, 0.06);
        }
        .wm-photo-slot--small {
          grid-column: auto;
          aspect-ratio: 4 / 3;
        }
        .wm-photo-label {
          font-family: var(--font-mono), monospace;
          font-size: 0.45rem;
          letter-spacing: 0.2em;
          color: rgba(196, 90, 24, 0.25);
        }

        /* ── MOBILE ── */
        @media (max-width: 767px) {
          .wm-panel {
            max-width: 100%;
            width: 100%;
            top: auto;
            bottom: 0;
            left: 0;
            right: 0;
            max-height: 85svh;
            border-right: none;
            border-top: 1px solid rgba(196, 90, 24, 0.15);
            border-radius: 16px 16px 0 0;
            transform: translateY(100%);
          }
          .wm-panel--open {
            transform: translateY(0);
          }
          .wm-panel-inner {
            padding: 2rem 1.5rem 2.5rem;
          }
          .wm-panel-name {
            font-size: clamp(1.8rem, 8vw, 2.4rem);
          }
          .wm-panel-corner--tl { top: 1rem; left: 1rem; }
          .wm-panel-corner--br { bottom: 1rem; right: 1rem; }
          .wm-overlay {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 25;
            background: rgba(7, 7, 10, 0.5);
            animation: overlayIn 0.3s ease;
          }
          @keyframes overlayIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        }

        /* ── REDUCED MOTION ── */
        @media (prefers-reduced-motion: reduce) {
          .wm-visited { animation: none; }
          .wm-dot-glow { animation: none; }
          .wm-constellation-line { animation: none; stroke-dashoffset: 0; }
          .wm-panel { transition: none; }
          .wm-panel-inner { animation: none; }
        }
      `}</style>
    </div>
  )
}
