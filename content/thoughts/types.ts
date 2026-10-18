/**
 * Thoughts — the content model.
 *
 * A thought is mostly words. Everything the interface needs is derived
 * from these fields, so adding a new thought means adding a file in this
 * folder and listing it in `index.ts` — never touching a component.
 */

export interface ThoughtImage {
  /** path under /public, e.g. '/images/thoughts/jaipur-dusk.jpg' */
  src: string
  alt: string
  /** CSS object-position used when the photo is cropped to the viewport */
  position?: string
  /** optional crop override for portrait (phone) viewports */
  mobilePosition?: string
}

export type ThoughtBlock =
  /** a paragraph — use *emphasis* or **strong emphasis** */
  | { type: 'paragraph'; text: string }
  /** a quiet heading; an optional stable ID identifies a section for links and scenes */
  | { type: 'heading'; text: string; id?: string; level?: 2 | 3 }
  /** a quotation, given extra air */
  | { type: 'quote'; text: string; cite?: string }
  /** a section break — drawn as a single hand-made mark */
  | { type: 'break' }
  /**
   * a photograph inside the article.
   * `column` sits inside the text measure, `wide` breaks out of it,
   * `full` runs edge to edge.
   */
  | {
      type: 'image'
      src: string
      alt: string
      caption?: string
      width?: 'column' | 'wide' | 'full'
      /** CSS aspect-ratio, e.g. '3 / 2' (defaults to 3 / 2) */
      aspectRatio?: string
      position?: string
      /** Serve the original when an asset cannot be optimized reliably. */
      unoptimized?: boolean
    }

/** Small, serializable page palette. Colors use six-digit hex; numeric values
 * are absolute, not deltas. Light, vignette and grain range from zero to one. */
export interface SceneMood {
  name: string
  background: string
  text: string
  shadow: string
  exposure: number
  contrast: number
  light: number
  vignette: number
  grain: number
}

export interface SceneBeat {
  id: string
  /** Match an existing canonical paragraph; never a second copy of the prose. */
  match: string
  breathingRoom?: boolean
  mood?: Partial<Omit<SceneMood, 'name'>>
  /** Cumulative art cues, exposed as --cue-NAME, restored on reverse scroll. */
  cues?: Readonly<Record<string, number>>
}

/** Serializable scene intent; prose and section order remain in Thought.body. */
export interface ThoughtScene {
  id: string
  theme?: 'warm' | 'cool' | 'dim' | 'muted' | 'dark' | 'soft' | 'warming' | 'calm'
  transition?: 'cut' | 'fade' | 'blend'
  visual?: string
  intro?: boolean
  mood?: SceneMood
  layout?: { focus: 'room' | 'window'; density: 'open' | 'normal' | 'tight'; inlineVisual?: boolean }
  beats?: readonly SceneBeat[]
}

export interface Thought {
  /** url segment — /thoughts/[slug] */
  slug: string
  /** Optional six-digit hex palette shared by the card and article. */
  accent?: string
  /** intended portal artifact; omitted legacy content resolves to paper */
  portal?: { kind: 'paper' | 'house' }
  /** intended reading experience; omitted legacy content resolves to reader */
  experience?: { kind: 'reader' | 'scenes'; scenes?: readonly ThoughtScene[] }
  /** stable, displayed number — '01' */
  number: string
  /**
   * The title. Use '\n' where the line should break on the cover and the
   * title page ('superposition\nof love'). Everywhere else it reads as
   * one line.
   */
  title: string
  /** the line under the title. '\n' breaks lines here too. */
  subtitle?: string
  /** 'YYYY-MM' or 'YYYY-MM-DD' */
  date?: string
  /** optional override — otherwise estimated from the body */
  readTime?: string
  /** the photograph behind the thought in the archive */
  coverImage: ThoughtImage
  /** optional different photograph behind the floating card */
  heroImage?: ThoughtImage
  /** canonical prose, available to Reader regardless of experience kind */
  body: ThoughtBlock[]
}
