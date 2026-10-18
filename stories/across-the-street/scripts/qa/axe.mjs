import { chromium } from 'playwright-core'
const exe = process.env.CHROME_PATH // any local Chrome/Chromium
const browser = await chromium.launch({ executablePath: exe })
for (const vp of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  const page = await browser.newPage({ viewport: vp })
  await page.goto('http://localhost:3000/thoughts/sunday-morning?story=ats', { waitUntil: 'networkidle' })
  await page.waitForSelector('.ats-canvas'); await page.waitForTimeout(1000)
  await page.addScriptTag({ path: process.env.AXE_PATH ?? 'node_modules/axe-core/axe.min.js' })
  for (const [label, prep] of [['cover', null], ['board beat', 'sm-12'], ['hold beat', 'wi-08'], ['menu open', 'menu']]) {
    if (prep === 'menu') { await page.click('.ats-menu'); await page.waitForTimeout(300) }
    else if (prep) await page.evaluate((id) => { const s = [...document.querySelectorAll('[data-slot]')]; const i = s.findIndex((x) => x.dataset.beat === id); const st = document.querySelectorAll('.ats-step')[i]; scrollTo({ top: st.getBoundingClientRect().top + scrollY + st.offsetHeight * 0.5, behavior: 'instant' }) }, prep)
    await page.waitForTimeout(500)
    const r = await page.evaluate(async () => {
      const res = await axe.run(document.querySelector('[data-ats]'), { resultTypes: ['violations'] })
      return res.violations.map((v) => `${v.impact} ${v.id}: ${v.nodes.length} — ${v.nodes.slice(0, 2).map((n) => n.target.join(' ') + ' :: ' + (n.failureSummary || '').split('\n')[1]).join(' | ')}`)
    })
    console.log(`${vp.width} ${label}:`, r.length ? '\n  ' + r.join('\n  ') : 'no violations')
  }
  await page.close()
}
await browser.close()
