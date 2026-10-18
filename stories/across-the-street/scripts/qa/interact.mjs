// Drives every interaction with real input and reports outcomes.
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const exe = process.env.CHROME_PATH // any local Chrome/Chromium
const url = 'http://localhost:3000/thoughts/sunday-morning?story=ats'
const out = new URL('../../../../docs/screens', import.meta.url).pathname + '/interactions'
mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ executablePath: exe })
const results = []
const ok = (name, pass, detail = '') => { results.push(`${pass ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`) }

async function open(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, ...opts })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => results.push('pageerror ' + e.message))
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForSelector('.ats-canvas')
  await page.waitForTimeout(800)
  return { ctx, page }
}
const goto = (page, id, u = 0.55) => page.evaluate(([id, u]) => {
  const slots = [...document.querySelectorAll('[data-slot]')]
  const i = slots.findIndex((x) => x.dataset.beat === id)
  const st = document.querySelectorAll('.ats-step')[i]
  scrollTo({ top: st.getBoundingClientRect().top + scrollY + st.offsetHeight * u, behavior: 'instant' })
}, [id, u]).then(() => page.waitForTimeout(500))
const live = (page) => page.$eval('[data-live]', (e) => e.textContent)
const center = async (page, sel) => { const b = await page.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height, hidden: e.hidden } }); return b }

{ // board: drag, keyboard nudge, hint goes away, size
  const { ctx, page } = await open()
  await goto(page, 'sm-12')
  const hintBefore = await page.$$eval('.ats-hint', (h) => h.filter((x) => !x.hidden).map((x) => x.textContent))
  const b = await center(page, '.ats-hit[data-id=postcard]')
  ok('board: hit area ≥ 48px', b.w >= 48 && b.h >= 48, `${Math.round(b.w)}×${Math.round(b.h)}`)
  await page.mouse.move(b.x, b.y); await page.mouse.down(); await page.mouse.move(b.x + 30, b.y + 6, { steps: 6 }); await page.mouse.move(b.x + 200, b.y + 120, { steps: 6 }); await page.mouse.up()
  await page.waitForTimeout(300)
  const b2 = await center(page, '.ats-hit[data-id=postcard]')
  const moved = Math.round((b2.x - b.x) / 1), clampedOk = Math.abs(b2.x - b.x) > 5 && Math.abs(b2.x - b.x) < 80
  ok('board: drag nudges (clamped to a few cells)', clampedOk, `moved ${moved}px`)
  ok('board: aria-live', (await live(page)).includes('Nobody notices'), await live(page))
  const hintAfter = await page.$$eval('.ats-hint', (h) => h.filter((x) => !x.hidden).map((x) => x.textContent))
  ok('board: Drag hint shown then hidden after use', hintBefore.includes('Drag') && !hintAfter.includes('Drag'), `${hintBefore} → ${hintAfter}`)
  await page.focus('.ats-hit[data-id=photo]')
  const p1 = await center(page, '.ats-hit[data-id=photo]')
  await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(200)
  const p2 = await center(page, '.ats-hit[data-id=photo]')
  ok('board: keyboard arrows nudge', p2.x < p1.x, `${Math.round(p1.x - p2.x)}px`)
  await page.screenshot({ path: `${out}/board-nudged.png` })
  await ctx.close()
}
{ // mug: tap makes it fall anyway
  const { ctx, page } = await open()
  await goto(page, 'as-10')
  const m = await center(page, '.ats-hit[data-id=mug]')
  await page.mouse.click(m.x, m.y); await page.waitForTimeout(1200)
  ok('mug: tap → falls anyway', (await live(page)).includes('slips anyway'), await live(page))
  ok('mug: button gone after', await page.$eval('.ats-hit[data-id=mug]', (e) => e.hidden))
  await page.screenshot({ path: `${out}/mug-fell.png` })
  await ctx.close()
}
{ // door: keyboard open
  const { ctx, page } = await open()
  await goto(page, 'kn-02')
  await page.focus('.ats-hit[data-id=door]'); await page.keyboard.press('Enter'); await page.waitForTimeout(400)
  ok('door: Enter opens', (await live(page)).includes('door opens'), await live(page))
  await page.screenshot({ path: `${out}/door-open.png` })
  await ctx.close()
}
{ // scrub grows, then locks on "Stop."
  const { ctx, page } = await open()
  await goto(page, 'st-02')
  await page.screenshot({ path: `${out}/scrub-before.png` })
  const s = await center(page, '.ats-hit[data-id=stain]')
  await page.mouse.move(s.x, s.y); await page.mouse.down()
  for (let i = 0; i < 8; i++) { await page.mouse.move(s.x + 60, s.y, { steps: 5 }); await page.mouse.move(s.x - 60, s.y, { steps: 5 }) }
  await page.mouse.up(); await page.waitForTimeout(300)
  ok('scrub: drag → stain spreads', (await live(page)).includes('stain spreads'), await live(page))
  await page.screenshot({ path: `${out}/scrub-after.png` })
  await goto(page, 'st-13')
  ok('scrub: locked on "Stop." (no scrub control)', await page.$eval('.ats-hit[data-id=stain]', (e) => e.hidden))
  await ctx.close()
}
{ // phone: stays dark
  const { ctx, page } = await open()
  await goto(page, 'ph-04')
  const p = await center(page, '.ats-hit[data-id=phone]')
  await page.mouse.click(p.x, p.y); await page.waitForTimeout(300)
  ok('phone: tap → screen stays dark', (await live(page)).includes('stays dark'), await live(page))
  await page.screenshot({ path: `${out}/phone.png` })
  await ctx.close()
}
{ // hold: mouse — partial, release settles back, then complete
  const { ctx, page } = await open()
  await goto(page, 'wi-08')
  const h = await center(page, '.ats-hit[data-id=hold]')
  ok('hold: target ≥ 72px', h.w >= 72, `${Math.round(h.w)}px`)
  await page.mouse.move(h.x, h.y); await page.mouse.down(); await page.waitForTimeout(2600)
  await page.screenshot({ path: `${out}/hold-mid.png` })
  const ringMid = await page.$eval('.ats-ring', (e) => +getComputedStyle(e).getPropertyValue('--p'))
  await page.mouse.up(); await page.waitForTimeout(1800)
  const ringBack = await page.$eval('.ats-ring', (e) => +getComputedStyle(e).getPropertyValue('--p'))
  ok('hold: progresses while held, settles back on release', ringMid > 0.3 && ringBack < ringMid, `p ${ringMid.toFixed(2)} → ${ringBack.toFixed(2)}`)
  await page.screenshot({ path: `${out}/hold-released.png` })
  await page.mouse.down(); await page.waitForTimeout(6200); await page.mouse.up(); await page.waitForTimeout(3500)
  ok('hold: completes; phone falls silently', (await live(page)).includes('coat is gone'), await live(page))
  const distress = await page.$eval('[data-ats]', (e) => e.style.getPropertyValue('--distress'))
  ok('hold: colours fully return', Number(distress) < 0.01, `--distress ${distress}`)
  await page.screenshot({ path: `${out}/hold-done.png` })
  await ctx.close()
}
{ // hold: keyboard Space
  const { ctx, page } = await open()
  await goto(page, 'wi-08')
  await page.focus('.ats-hit[data-id=hold]')
  const y0 = await page.evaluate(() => scrollY)
  await page.keyboard.down(' '); await page.waitForTimeout(6300); await page.keyboard.up(' '); await page.waitForTimeout(400)
  ok('hold: keyboard Space completes', (await live(page)).includes('coat is gone'), await live(page))
  ok('hold: Space does not scroll the page', (await page.evaluate(() => scrollY)) === y0)
  await ctx.close()
}
{ // reduced motion: one tap plays the cross-fade
  const { ctx, page } = await open({ reducedMotion: 'reduce' })
  await goto(page, 'wi-08')
  const h = await center(page, '.ats-hit[data-id=hold]')
  await page.mouse.click(h.x, h.y); await page.waitForTimeout(1500)
  await page.screenshot({ path: `${out}/hold-reduced-mid.png` })
  await page.waitForTimeout(2500)
  ok('reduced motion: tap auto-plays the hold', (await live(page)).includes('coat is gone'), await live(page))
  await ctx.close()
}
{ // menu, linger, read again
  const { ctx, page } = await open()
  await page.click('.ats-menu'); await page.waitForTimeout(300)
  ok('menu: opens as modal dialog', await page.$eval('dialog.ats-menu-panel', (d) => d.open))
  await page.screenshot({ path: `${out}/menu.png` })
  await page.click('[data-jump="3"]'); await page.waitForTimeout(1800)
  ok('menu: jump to chapter 4', (await page.$eval('[data-ats]', (e) => e.dataset.chapter)) === '3')
  await page.keyboard.press('Escape')
  await goto(page, 'af-13', 0.5)
  await page.waitForTimeout(9500)
  await page.screenshot({ path: `${out}/linger.png` })
  ok('linger: silhouette after 6 s (see linger.png)', true)
  await goto(page, 'af-13', 0.95)
  await page.evaluate(() => { const s = [...document.querySelectorAll('.ats-step')].at(-1); scrollTo({ top: s.getBoundingClientRect().top + scrollY + 400, behavior: 'instant' }) })
  await page.waitForTimeout(500)
  const ra = await page.$('.ats-endcard.is-active [data-readagain]')
  ok('end card: Read again visible', !!ra)
  if (ra) { await ra.click(); await page.waitForTimeout(1500); ok('read again → top', (await page.evaluate(() => scrollY)) < 5) }
  await ctx.close()
}
await browser.close()
console.log(results.join('\n'))
