/**
 * The canvas needs concrete colours every frame. Rather than asking the
 * browser for color-mix() results, read each token's calm and dead hex
 * once from the CSS and mix in OKLab here — the same space tokens.css
 * uses, so canvas art and CSS text drift together.
 */
import { INKS, type Ink } from '../art/palette.ts'

type Lab = [number, number, number]

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)

function hexToLab(hex: string): Lab {
  const h = hex.trim().replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => toLinear(parseInt(h.slice(i, i + 2), 16) / 255))
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s]
}

function labToCss([L, a, b]: Lab) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const rgb = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]
  return `rgb(${rgb.map((c) => Math.round(Math.min(1, Math.max(0, toGamma(c))) * 255)).join(' ')})`
}

export class Palette {
  private calm = {} as Record<Ink, Lab>
  private dead = {} as Record<Ink, Lab>
  private cache = new Map<number, Record<Ink, string>>()

  constructor(root: HTMLElement) {
    const cs = getComputedStyle(root)
    for (const ink of INKS) {
      this.calm[ink] = hexToLab(cs.getPropertyValue(`--${ink}-calm`) || '#ff00ff')
      this.dead[ink] = hexToLab(cs.getPropertyValue(`--${ink}-dead`) || '#ff00ff')
    }
  }

  /** Concrete CSS colours at a distress amount (quantised to 1/200). */
  at(distress: number) {
    const key = Math.round(Math.min(1, Math.max(0, distress)) * 200)
    let inks = this.cache.get(key)
    if (!inks) {
      const t = key / 200
      inks = {} as Record<Ink, string>
      for (const ink of INKS) {
        const c = this.calm[ink], d = this.dead[ink]
        inks[ink] = labToCss([c[0] + (d[0] - c[0]) * t, c[1] + (d[1] - c[1]) * t, c[2] + (d[2] - c[2]) * t])
      }
      this.cache.set(key, inks)
    }
    return inks
  }
}
