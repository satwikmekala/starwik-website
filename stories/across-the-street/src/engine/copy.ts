import beats from '../../content/beats.json'

export type Beat = { id: string; lines: string[]; kind: 'prose' | 'dialogue' | 'thought'; source: number[]; breathe?: boolean; hint?: string }
export type Chapter = { id: string; title: string; beats: Beat[] }
type UI = {
  back: string; backHref: string; menu: string; menuClose: string; scroll: string; readAgain: string; credits: string
  creditsTitle: string; colophon: string; progress: string; current: string
  hints: Record<'drag' | 'tap' | 'hold' | 'scrub', string>
  live: Record<string, string>
  labels: Record<'board' | 'mug' | 'door' | 'scrub' | 'phone' | 'hold', string>
}

export const BEATS = beats as unknown as { title: string; ui: UI; chapters: Chapter[] }

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

/** *thought* → <em>; everything else escaped. */
export const inline = (s: string) => esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>')

/** One beat = one <p>; lines are block spans so screen readers hear one sentence. */
export function beatMarkup(b: Beat) {
  return `<p class="ats-copy" data-beat="${b.id}" data-kind="${b.kind}">${b.lines.map((l) => `<span class="line">${inline(l)} </span>`).join('')}</p>`
}
