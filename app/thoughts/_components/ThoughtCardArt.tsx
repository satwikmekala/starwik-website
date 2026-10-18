import { Children, cloneElement, isValidElement, type CSSProperties, type ReactElement, type ReactNode } from 'react'

function Road() {
  return <>
    <path d="M82 222C129 169 150 109 169 43M278 222C236 152 197 82 189 43" />
    <path d="M184 83l-1 17m-2 19-1 16m-2 18-1 18m-3 19-1 19" />
    <path d="M25 222c30-8 58 0 91 0h25" strokeDasharray="2 10" />
    <circle cx="294" cy="44" r="22" />
    <path d="M305 31c-14 4-18 18-9 28M44 44v18m-9-9h18M108 24v9m-4.5-4.5h9M237 18v9m-4.5-4.5h9" />
  </>
}
function SteppingOut() {
  return <>
    <path d="M96 109c-67-36-125 23-89 67 26 34 126 46 151 4 23-44-23-85-62-71Z" transform="translate(65 -8)" />
    <path d="M111 130l2 8m34-10 2 8m-45 20c17 18 43 19 63 1" />
    <path data-art-gesture="arrow" d="M183 87l68-43m-20-3 23 3-5 23" />
  </>
}
function FadingRing() {
  return <>
    <circle cx="175" cy="133" r="48" />
    <circle cx="175" cy="133" r="79" strokeDasharray="3 14" />
    <circle cx="175" cy="133" r="7" fill="currentColor" stroke="none" />
    <path d="m76 57-6-6m214 23 6-4m16 41 7-2m-39 98 7 8m-173-1-5 7m-46-69-8 2" />
  </>
}
function SleepingCat() {
  return <>
    <path d="M87 178c-24-54 8-89 52-92 57-7 109 24 116 64 9 51-55 66-103 54-31-7-49-12-65-26Z" />
    <path d="m94 142-3-41 32 19q21-4 40 7l31-13-9 36q-7 35-46 31-37-2-45-39Z" />
    <path d="m109 145 17 7m23 2 17-6m-38 16 10 1m-28 0-23-3m71 6 23 2" />
    <path data-art-gesture="tail" d="M248 153q-13-29-43-20-23 8-12 26 7 11 20 3" />
    <path d="M77 211q79 12 179-2" />
    <path d="M177 64c-28-18-26-36-13-36 10 0 15 7 17 13 8-12 19-13 26-4 9 12-9 24-30 27Z" />
    <path d="M65 69v12m-6-6h12m198 14v16m-8-8h16" />
  </>
}
function Buildings() {
  return <>
    <path d="M47 223V111h73v112M203 223V85h74v138M24 230h276" />
    <path d="M64 132h12m15 0h12m-39 24h12m15 0h12m115-51h12m16 0h12m-40 27h12m16 0h12m-40 27h12m16 0h12" />
    <path d="M132 235h51" strokeDasharray="2 8" />
    <path data-art-gesture="window" d="M218 105h14v14h-14z" fill="currentColor" stroke="none" />
  </>
}
/** A hand on the old self's shoulder; the coffee ring is allowed to stay. */
function MakingPeace() {
  return <>
    <path d="M228 52 292 50 294 151 227 153Z" opacity=".45" />
    <path d="M259 52v99m-30-53 63-2m-75 65 86-2" opacity=".45" />
    <path d="m267 99-92 102h107l10-105" fill="var(--story-light, currentColor)" fillOpacity=".09" stroke="none" />
    <g data-art-gesture="window" stroke="var(--story-light, currentColor)">
      <circle cx="276" cy="76" r="8" />
      <path d="M276 59v-4m0 42v-4m-17-17h-4m42 0h-4m-29-12-3-3m30 30-3-3m0-24 3-3m-30 30 3-3" strokeWidth="2.5" />
    </g>
    <path d="M68 214q90-11 218-2l-14 23q-103 8-214-1Z" opacity=".3" />
    <path d="m72 236-4 7m22-6-3 7m164-7-2 6m18-7-1 6" opacity=".3" />
    <g opacity=".6">
      <path d="M193 83c0 10-7 18-16 17-10-1-16-9-15-18s7-16 16-16c8 0 15 7 15 17Z" />
      <path d="M169 111q-14 3-17 22l-10 49q18 5 35 2m-9-72q12-5 21 3l8 22m-37-4-2 26m8 26-4 22m15-24 5 20" />
      <path d="m196 144 2 7m1 12 2 7m-11 12-4 2" />
    </g>
    <g fill="var(--story-light, currentColor)" stroke="none">
      <circle cx="209" cy="139" r="2.5" /><circle cx="218" cy="125" r="2" />
      <circle cx="204" cy="172" r="2" /><circle cx="223" cy="154" r="2.5" />
      <circle cx="230" cy="135" r="1.5" /><circle cx="216" cy="184" r="1.5" />
    </g>
    <path d="M130 89c-1 10-8 17-17 16-10-1-16-8-15-18s8-16 17-15c9 1 15 8 15 17Z" />
    <path d="M106 115q-17 5-19 26l-1 26q20 7 43 0l-2-26m-27-9-1 23m-1 17-5 36m25-36 7 36m-39 2h13m21 0h13" />
    <path d="M119 115q11 1 20 13l17-10 13-5q6-1 7 4t-7 6l-11 3-18 15q-7 4-12-3" />
    <g strokeWidth="2.5">
      <path d="m250 199 17 6-5 13-17-6Zm15 10q11 0 8 6-2 4-8 1" />
      <path d="M238 218c-7-6-22-4-25 1-4 7 8 11 21 8 9-1 11-6 4-9Z" opacity=".55" />
    </g>
  </>
}
function Waveform() {
  return <>
    <path d="M100 44c-31 39-32 85 0 128M241 44c31 39 32 85 0 128M170 84v45m-23-22h46" />
    {Array.from({ length: 17 }, (_, index) => {
      const height = [7, 16, 27, 13, 23, 9, 31, 17, 24, 10, 19, 29, 12, 22, 14, 8, 17][index]
      return <path key={index} data-art-gesture="sound" style={{ '--bar-order': index } as CSSProperties} d={`M${77 + index * 12} ${210 - height / 2}v${height}`} />
    })}
  </>
}
function Overlap() {
  return <>
    <circle data-art-gesture="orbit-left" cx="131" cy="129" r="54" />
    <circle data-art-gesture="orbit-right" cx="203" cy="129" r="54" />
    <path d="M40 130c35-47 71 57 123 6 45-47 91-71 132-6M167 58v18m0 112v18" />
  </>
}
function Plus() { return <path d="M130 130h80m-40-40v80" /> }

const MOTIFS = [Road, SteppingOut, FadingRing, Buildings, Waveform, Overlap]
const ART: Record<string, () => ReactNode> = {
  'the-long-way-home': Road,
  'the-comfortable-version': SteppingOut,
  'the-monk-i-live-with': SleepingCat,
  'sunday-morning': MakingPeace,
  'the-order-of-operations': Waveform,
  'superposition-of-love': Overlap,
  'add-yours': Plus,
}
const TYPES: Record<string, string> = {
  'the-long-way-home': 'photo',
  'the-comfortable-version': 'short',
  'the-monk-i-live-with': 'journal',
  'sunday-morning': 'story',
  'the-order-of-operations': 'voice',
  'superposition-of-love': 'short',
}
export function thoughtCardType(slug: string, fallback: number): string {
  return TYPES[slug] ?? ['photo', 'short', 'journal', 'photo', 'voice', 'short'][fallback % 6]
}
/** Normalize drawing paths only in the article; index geometry stays untouched. */
function drawingArt(node: ReactNode, counter: { value: number }): ReactNode {
  return Children.map(node, (child) => {
    if (!isValidElement(child)) return child
    const element = child as ReactElement<{ children?: ReactNode; fill?: string; strokeDasharray?: string; style?: CSSProperties }>
    if (element.type === 'path' || element.type === 'circle') {
      const filled = !!element.props.fill && element.props.fill !== 'none'
      const index = counter.value++
      const dashed = element.props.strokeDasharray
      const normalized = dashed === '2 10' ? '0.0167 0.0833' : dashed === '2 8' ? '0.0392 0.1569' : dashed === '3 14' ? '0.006 0.028' : undefined
      return cloneElement(element, {
        pathLength: 1,
        'data-draw': filled ? 'fill' : 'stroke',
        ...(normalized ? { strokeDasharray: normalized } : {}),
        style: { ...element.props.style, '--draw-order': index },
      } as Partial<typeof element.props>)
    }
    return cloneElement(element, { children: drawingArt(element.props.children, counter) })
  })
}

export function ThoughtCardArt({ slug, fallback = 0, draw = false, playful = false }: { slug: string; fallback?: number; draw?: boolean; playful?: boolean }) {
  const Motif = ART[slug] ?? MOTIFS[fallback % MOTIFS.length]
  const art = Motif()
  return <svg viewBox="0 0 340 260" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{draw ? drawingArt(art, { value: 0 }) : art}{playful && slug === 'the-long-way-home' && <circle data-art-gesture="traveller" cx="184" cy="208" r="4" fill="currentColor" stroke="none" />}</svg>
}
