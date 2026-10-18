import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

// Use the project's existing compiler; no browser/test dependency is needed
// for these viewport-space invariants. The helper has no runtime imports.
const source = await readFile(new URL('../app/thoughts/_components/portalGeometry.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
})
const { calculatePortalEntryGeometry: calculate, measurePortalEntryGeometry: measure, calculateLocalHouseCamera: localCamera } =
  await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)

const rect = (left, top, width, height) => ({
  x: left, y: top, left, top, width, height, right: left + width, bottom: top + height,
})
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`)

for (const [name, root, entry, viewport] of [
  ['desktop', rect(0, 0, 1440, 1000), rect(620, 320, 224, 205), rect(0, 0, 1440, 1000)],
  ['portrait', rect(0, 0, 390, 844), rect(125, 285, 143, 122), rect(0, 0, 390, 844)],
  ['landscape', rect(0, 0, 844, 390), rect(386, 98, 92, 81), rect(0, 0, 844, 390)],
  ['visual viewport with offsets', rect(-20, -10, 1200, 900), rect(345.5, 222.25, 157.5, 143.75), rect(70, 125, 400, 500)],
]) {
  test(`${name}: target centers exactly and covers the visible viewport`, () => {
    const g = calculate(root, entry, viewport)
    assert.ok(g)
    const origin = { x: root.left + g.transformOrigin.x, y: root.top + g.transformOrigin.y }
    const map = (x, y) => ({
      x: origin.x + (x - origin.x) * g.scaleToViewport + g.translateX,
      y: origin.y + (y - origin.y) * g.scaleToViewport + g.translateY,
    })
    const center = map(g.entryCenter.x, g.entryCenter.y)
    close(center.x, viewport.left + viewport.width / 2)
    close(center.y, viewport.top + viewport.height / 2)
    const start = map(entry.left, entry.top)
    const end = map(entry.right, entry.bottom)
    assert.ok(start.x <= viewport.left + 1e-8 && start.y <= viewport.top + 1e-8)
    assert.ok(end.x >= viewport.right - 1e-8 && end.y >= viewport.bottom - 1e-8)
    assert.equal(g.rootRect, root)
    assert.equal(g.entryRect, entry)
  })
}

test('invalid or unmeasurable surfaces do not produce a camera transform', () => {
  const root = rect(0, 0, 1000, 800)
  const entry = rect(100, 100, 200, 150)
  for (const size of [0, -1, NaN, Infinity]) {
    assert.equal(calculate(root, { ...entry, width: size }, root), null)
    assert.equal(calculate({ ...root, height: size }, entry, root), null)
    assert.equal(calculate(root, entry, { ...root, width: size }), null)
  }
  assert.equal(calculate(root, { ...entry, left: NaN }, root), null)
})

function surfaces() {
  let bounds = rect(100, 100, 200, 150)
  const host = { innerWidth: 1000, innerHeight: 800, visualViewport: null }
  const entry = { isConnected: true, getBoundingClientRect: () => bounds }
  const root = {
    isConnected: true,
    contains: (node) => node === entry,
    ownerDocument: { defaultView: host },
    getBoundingClientRect: () => rect(0, 0, 1000, 800),
  }
  return { root, entry, host, setBounds: (value) => { bounds = value } }
}

test('on-demand measurement follows a changed pose and a resized visual viewport', () => {
  const { root, entry, host, setBounds } = surfaces()
  const first = measure(root, entry)
  assert.deepEqual(first.viewportCenter, { x: 500, y: 400 })
  setBounds(rect(310, 270, 240, 180))
  host.visualViewport = { offsetLeft: 40, offsetTop: 60, width: 400, height: 500 }
  const next = measure(root, entry)
  assert.deepEqual(next.entryCenter, { x: 430, y: 360 })
  assert.deepEqual(next.viewportCenter, { x: 240, y: 310 })
  assert.notEqual(next.scaleToViewport, first.scaleToViewport)
  assert.equal(next.translateX, -190)
  assert.equal(next.translateY, -50)
})

test('missing, detached, or unrelated targets are rejected safely', () => {
  const { root, entry } = surfaces()
  assert.equal(measure(null, entry), null)
  assert.equal(measure(root, null), null)
  assert.equal(measure(root, { ...entry }), null)
  entry.isConnected = false
  assert.equal(measure(root, entry), null)
  entry.isConnected = true
  root.isConnected = false
  assert.equal(measure(root, entry), null)
})

for (const scale of [.74, 1.17, 1.18]) {
  test(`bounded camera centers its window under parent scale ${scale}`, () => {
    const entry = calculate(rect(0, 0, 1280, 720), rect(530, 210, 180, 200), rect(0, 0, 1280, 720))
    const bounds = rect(420, 120, 330 * scale, 295 * scale)
    const camera = localCamera(entry, bounds, 330)
    // A point at the transform origin is unchanged by any zoom factor.
    // Parent scale converts the camera's translation back to viewport pixels.
    close(bounds.left + (camera.originX + camera.x) * scale, entry.viewportCenter.x)
    close(bounds.top + (camera.originY + camera.y) * scale, entry.viewportCenter.y)
    close(bounds.left + camera.originX * scale, entry.entryCenter.x)
    close(bounds.top + camera.originY * scale, entry.entryCenter.y)
  })
}
test('bounded camera rejects unavailable layout', () => {
  const entry = calculate(rect(0, 0, 1280, 720), rect(530, 210, 180, 200), rect(0, 0, 1280, 720))
  assert.equal(localCamera(entry, undefined, 330), null)
  assert.equal(localCamera(entry, rect(0, 0, 0, 0), 330), null)
  assert.equal(localCamera(entry, rect(0, 0, 330, 295), 0), null)
})
