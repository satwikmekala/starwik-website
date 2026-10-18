import { BEATS } from './copy.ts'

const ARROW = '<svg viewBox="0 0 7 7" aria-hidden="true"><path fill="currentColor" d="M0 3h7v1H0zM1 2h1v1H1zM1 4h1v1H1zM2 1h1v1H2zM2 5h1v1H2zM3 0h1v1H3zM3 6h1v1H3z"/></svg>'
const PLUS = '<svg viewBox="0 0 12 12" aria-hidden="true"><path fill="currentColor" d="M0 0h12v1H0zM0 11h12v1H0zM0 1h1v10H0zM11 1h1v10h-1zM5 3h2v6H5zM3 5h6v2H3z"/></svg>'

/** Minimal fixed chrome, mirroring the reference: back pill bottom-left, square menu top-right. */
export function chromeMarkup() {
  const ui = BEATS.ui
  return `<a class="ats-back" href="${ui.backHref}">${ARROW}<span>${ui.back}</span></a>` +
    `<button class="ats-menu" type="button" aria-label="${ui.menu}" aria-haspopup="dialog" aria-expanded="false">${PLUS}</button>`
}

/** Full-screen chapter list (a modal <dialog>: focus trap and Esc for free). */
export function menuMarkup() {
  const ui = BEATS.ui
  return `<dialog class="ats-menu-panel" aria-labelledby="ats-menu-title">
    <div class="ats-menu-inner">
      <p id="ats-menu-title" class="ats-accent ats-menu-head">${BEATS.title}</p>
      <ol class="ats-menu-list">
        ${BEATS.chapters.map((c, i) => `<li><a href="#ch-${c.id}" data-jump="${i}"><span class="n">${i + 1}</span><span class="t">${c.title}</span><span class="s" data-label-read="${ui.progress}" data-label-current="${ui.current}"></span></a></li>`).join('')}
      </ol>
      <p class="ats-menu-foot"><a href="#ats-credits" data-credits>${ui.credits}</a></p>
      <button type="button" class="ats-menu-close" data-menu-close>${ui.menuClose}</button>
    </div>
  </dialog>
  <p id="ats-hold-help" class="visually-hidden">Press and hold. With a keyboard, hold Space or Enter.</p>`
}
