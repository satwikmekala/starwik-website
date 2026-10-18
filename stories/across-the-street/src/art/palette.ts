/**
 * Inks map 1:1 to CSS custom properties in styles/tokens.css. Drawings
 * never hold a hex value, only an ink name, so the Stain palette (and any
 * later re-theme) recolors every sprite without recompiling.
 */
export const INKS = ['line', 'cream', 'cloud', 'sky', 'text', 'coffee', 'berry'] as const
export type Ink = (typeof INKS)[number]

/** Ink → cell value (0 is transparent). */
export const INK = Object.fromEntries(INKS.map((ink, i) => [ink, i + 1])) as Record<Ink, number>

/**
 * Line weight in logical pixels. Scene grids are 640×360 (desktop) and
 * 180×320 (mobile) at ~2 CSS px per cell, so 2 cells ≈ 4–5 CSS px — the
 * reference's measured outline weight. Change this one number to thicken
 * every outline in the story.
 */
export const LINE_WEIGHT = 2

/** Characters understood by Raster.stamp without a custom map. */
export const CHAR_DEFAULT: Readonly<Record<string, Ink>> = {
  b: 'line',   // cobalt line / blue
  c: 'cream',
  w: 'cloud',  // white-ish
  s: 'sky',
  k: 'text',   // ink-black
  o: 'coffee',
  r: 'berry',
}
