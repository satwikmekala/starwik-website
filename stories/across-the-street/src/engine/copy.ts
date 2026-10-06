import beats from '../../content/beats.json'

export type Beat = { id: string; lines: string[]; kind: 'prose' | 'dialogue' | 'thought'; source: number[]; cue?: string; breathe?: boolean; hint?: string }
export type Chapter = { id: string; title: string; beats: Beat[] }

export const BEATS = beats as unknown as { title: string; ui: Record<string, any>; chapters: Chapter[] }

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

/** *thought* → <em>; everything else escaped. */
export const inline = (s: string) => esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>')

/** One beat = one <p>; lines are block spans so screen readers hear one sentence. */
export function beatMarkup(b: Beat) {
  return `<p class="ats-copy" data-beat="${b.id}" data-kind="${b.kind}">${b.lines.map((l) => `<span class="line">${inline(l)} </span>`).join('')}</p>`
}
