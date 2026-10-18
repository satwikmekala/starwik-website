// Screenshots of every chapter at three sizes → docs/screens/<size>/
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const exe = process.env.CHROME_PATH // any local Chrome/Chromium
const base = process.env.URL ?? 'http://localhost:3000/thoughts/sunday-morning?story=ats'
const out = new URL('../../../../docs/screens', import.meta.url).pathname + ''
const only = process.argv[2]
const sizes = [
  { name: '390x844', viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  { name: '768x1024', viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  { name: '1440x900', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
]
const beats = (process.env.BEATS ?? 'cover,sm-02,sm-12,sm-16,sm-26,as-02,as-07,as-12,kn-02,kn-04,kn-11,st-01,st-08,st-10,st-13,ph-05,ph-17,ph-27,wi-07,wi-10,af-05,af-06,af-13').split(',')

const browser = await chromium.launch({ executablePath: exe })
for (const s of sizes) {
  if (only && s.name !== only) continue
  mkdirSync(`${out}/${s.name}`, { recursive: true })
  const ctx = await browser.newContext({ viewport: s.viewport, deviceScaleFactor: s.deviceScaleFactor, isMobile: s.isMobile, hasTouch: s.hasTouch, reducedMotion: process.env.REDUCED ? 'reduce' : 'no-preference' })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => console.log('pageerror', s.name, e.message))
  await page.goto(base, { waitUntil: 'networkidle', timeout: 120000 })
  await page.waitForSelector('.ats-canvas', { timeout: 60000 })
  await page.waitForTimeout(1500)
  for (const [i, id] of beats.entries()) {
    await page.evaluate(([id, u]) => {
      const slots = [...document.querySelectorAll('[data-slot]')]
      const i = id === 'cover' ? 0 : slots.findIndex((x) => x.dataset.beat === id)
      const st = document.querySelectorAll('.ats-step')[i]
      const top = st.getBoundingClientRect().top + scrollY
      scrollTo({ top: id === 'cover' ? 0 : top + st.offsetHeight * u, behavior: 'instant' })
    }, [id, Number(process.env.U ?? 0.55)])
    await page.waitForTimeout(900)
    const ch = await page.evaluate(() => document.querySelector('[data-ats]')?.dataset.chapter ?? '0')
    await page.screenshot({ path: `${out}/${s.name}/${String(i).padStart(2, '0')}-ch${+ch + 1}-${id}.png` })
  }
  console.log('done', s.name)
  await ctx.close()
}
await browser.close()
