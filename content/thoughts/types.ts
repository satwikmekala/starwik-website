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
  /** a paragraph — wrap words in *asterisks* for emphasis */
  | { type: 'paragraph'; text: string }
  /** a quiet heading inside the article */
  | { type: 'heading'; text: string }
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
    }

export interface Thought {
  /** url segment — /thoughts/[slug] */
  slug: string
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
  body: ThoughtBlock[]
}
