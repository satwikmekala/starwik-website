import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../app/thoughts/_components/motion.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
})
const { Choreography, nextFrame } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
globalThis.window = globalThis

function surface() {
  const running = new Set()
  return {
    running,
    animate() {
      let finish, cancel
      const finished = new Promise((resolve, reject) => { finish = resolve; cancel = reject })
      // Real WAAPI rejects finished when canceling an animation, including a hold.
      finished.catch(() => {})
      const animation = {
        finished,
        finish: () => { running.delete(animation); finish() },
        cancel: () => { running.delete(animation); cancel(new Error('canceled')) },
      }
      running.add(animation)
      return animation
    },
  }
}

test('canceling the route releases a nested entry, animation, pause and input lock exactly once', async () => {
  const route = new Choreography()
  const entry = new Choreography()
  const el = surface()
  let locked = true
  let cleanups = 0
  route.onCleanup(() => entry.release())
  entry.onCleanup(() => { locked = false; cleanups++ })
  entry.hold(el, { opacity: 0 })
  const animation = entry.animate(el, [{ transform: 'scale(1)' }, { transform: 'scale(8)' }], { duration: 1000 })
  const pause = entry.wait(10000)
  route.release()
  route.release()
  await Promise.all([animation, pause])
  assert.equal(locked, false)
  assert.equal(cleanups, 1)
  assert.equal(el.running.size, 0)
  assert.equal(entry.cancelled, true)
  // A continuation after cancellation must not resurrect the visual overlay.
  await entry.animate(el, [{ opacity: 1 }], { duration: 100 })
  assert.equal(el.running.size, 0)
})

test('cleanup registered after cancellation runs immediately', () => {
  const entry = new Choreography()
  entry.release()
  let locked = true
  entry.onCleanup(() => { locked = false })
  assert.equal(locked, false)
})

test('fast-forward preserves holds until the next route has established its frame', async () => {
  const c = new Choreography()
  const el = surface()
  let released = false
  c.onCleanup(() => { released = true })
  const animation = c.animate(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 1000 })
  const pause = c.wait(10000)
  c.fastForward()
  await Promise.all([animation, pause])
  assert.equal(released, false)
  c.release()
  assert.equal(released, true)
})

test('hidden tabs resolve the final-frame wait without a suspended RAF', async () => {
  globalThis.document = { hidden: true }
  await nextFrame()
  const document = new EventTarget()
  document.hidden = false
  globalThis.document = document
  let canceled = 0
  globalThis.requestAnimationFrame = () => 7 // simulate a browser pausing RAF
  globalThis.cancelAnimationFrame = (id) => { assert.equal(id, 7); canceled++ }
  const pending = nextFrame()
  document.hidden = true
  document.dispatchEvent(new Event('visibilitychange'))
  await pending
  assert.equal(canceled, 1)
  document.dispatchEvent(new Event('visibilitychange'))
  assert.equal(canceled, 1, 'visibility listener is removed after resolving')
})
