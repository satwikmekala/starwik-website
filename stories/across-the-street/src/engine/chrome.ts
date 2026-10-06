import { BEATS } from './copy.ts'

const ARROW = '<svg viewBox="0 0 7 7" aria-hidden="true"><path fill="currentColor" d="M0 3h7v1H0zM1 2h1v3H1zM2 1h1v5H2zM3 0h1v1H3zM3 6h1v1H3z"/></svg>'
const PLUS = '<svg viewBox="0 0 12 12" aria-hidden="true"><path fill="currentColor" d="M0 0h12v1H0zM0 11h12v1H0zM0 1h1v10H0zM11 1h1v10h-1zM5 3h2v6H5zM3 5h6v2H3z"/></svg>'

/** Minimal fixed chrome, mirroring the reference: back pill bottom-left, square menu top-right. */
export function chromeMarkup() {
  const ui = BEATS.ui
  return `<a class="ats-back" href="${ui.backHref}">${ARROW}<span>${ui.back}</span></a>` +
    `<button class="ats-menu" type="button" aria-label="${ui.menu}" aria-expanded="false">${PLUS}</button>`
}
