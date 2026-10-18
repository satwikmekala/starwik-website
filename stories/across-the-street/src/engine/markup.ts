/**
 * The story's HTML as a pure string — no DOM, no window — so a host can
 * server-render it (the title and every line of the story arrive in the
 * first HTML, readable before any script) and the engine adopts it.
 */
import { chromeMarkup, menuMarkup } from './chrome.ts'
import { BEATS, inline } from './copy.ts'
import { creditsMarkup } from './credits.ts'

/** Scroll length of each slot, in svh. */
export const STEP = { beat: 72, breathe: 110, title: 55, cover: 90, end: 90 } as const

const ARROW_DOWN = '<svg viewBox="0 0 5 6"><path fill="currentColor" d="M2 0h1v4H2zM0 3h1v1H0zM1 4h1v1H1zM2 5h1v1H2zM3 4h1v1H3zM4 3h1v1H4z"/></svg>'

export function stepHeights() {
  const h: number[] = [STEP.cover]
  for (const c of BEATS.chapters) { h.push(STEP.title); for (const b of c.beats) h.push(b.breathe ? STEP.breathe : STEP.beat) }
  h.push(STEP.end)
  return h
}

export function storyMarkup() {
  return `
    <a id="ats-top" class="visually-hidden" tabindex="-1">${BEATS.title}</a>
    <div class="ats-story">
      <div class="ats-stage">
        <div class="ats-art"></div>
        <div class="ats-sheet" aria-hidden="true"></div>
        <div class="ats-copyframe">
          <header class="ats-cover" data-slot>
            <h1>${BEATS.title}</h1>
            <p class="ats-scrollcue" aria-hidden="true"><span>${BEATS.ui.scroll}</span> ${ARROW_DOWN}</p>
          </header>
          ${BEATS.chapters.map((c, ci) => `
          <section class="ats-chapter" id="ch-${c.id}" aria-labelledby="ch-${c.id}-title" data-chapter="${ci}">
            <h2 id="ch-${c.id}-title" class="ats-chapter-title" data-slot><span class="ats-chapter-no">${ci + 1}</span> ${c.title}</h2>
            ${c.beats.map((b) => `<p class="ats-copy" data-slot data-beat="${b.id}" data-kind="${b.kind}">${b.lines.map((l) => `<span class="line">${inline(l)} </span>`).join('')}</p>`).join('')}
          </section>`).join('')}
          <nav class="ats-endcard" data-slot aria-label="End of story">
            <a href="#ats-top" class="ats-readagain" data-readagain>${BEATS.ui.readAgain}</a>
            <a href="#ats-credits" class="ats-creditslink" data-credits>${BEATS.ui.credits}</a>
          </nav>
        </div>
        <div class="ats-hits"></div>
      </div>
      <div class="ats-track" aria-hidden="true">${stepHeights().map((h) => `<div class="ats-step" style="height:${h}svh"></div>`).join('')}</div>
    </div>
    ${creditsMarkup()}
    ${chromeMarkup()}
    ${menuMarkup()}
    <p class="visually-hidden" aria-live="polite" data-live></p>`
}
