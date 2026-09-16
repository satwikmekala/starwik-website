#!/usr/bin/env node
// Synthesises a 45-minute deep-house-shaped test set (kick, hats, bass, a slow
// minor-seventh pad, with breakdowns) so the listening room can be exercised
// locally before real mixes are uploaded. Output is gitignored.
//
//   npm run mix:test-pressing

import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { computePeaks, writePeaks } from './mix-peaks.mjs'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const out = path.join(root, 'public', 'mixes', 'audio', 'test-pressing.mp3')
mkdirSync(path.dirname(out), { recursive: true })

const RATE = 22050
const LENGTH = 45 * 60
const BEAT = 60 / 122
const BAR = BEAT * 4
const CHORDS = [57, 53, 48, 55] // A, F, C, G — each a minor seventh voicing
const midi = (n) => 440 * 2 ** ((n - 69) / 12)

// Kick is out during these windows (seconds) — the breakdowns
const breakdowns = [[0, 32], [590, 606], [1200, 1232], [1790, 1806], [2100, 2116]]
const inBreak = (t) => breakdowns.some(([a, b]) => t >= a && t < b)

let seed = 0x9e3779b9
const noise = () => {
  seed ^= seed << 13
  seed ^= seed >>> 17
  seed ^= seed << 5
  return ((seed >>> 0) / 4294967295) * 2 - 1
}

const padPhase = [0, 0, 0, 0]
let bassPhase = 0

const ffmpeg = spawn('ffmpeg', [
  '-v', 'error', '-y',
  '-f', 's16le', '-ar', String(RATE), '-ac', '1', '-i', '-',
  '-codec:a', 'libmp3lame', '-b:a', '48k', out,
], { stdio: ['pipe', 'inherit', 'inherit'] })

const done = new Promise((resolve, reject) => {
  ffmpeg.on('error', reject)
  ffmpeg.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))))
})

const total = LENGTH * RATE
const chunk = RATE // one second at a time

for (let start = 0; start < total; start += chunk) {
  const size = Math.min(chunk, total - start)
  const pcm = new Int16Array(size)

  for (let i = 0; i < size; i += 1) {
    const t = (start + i) / RATE

    // long-form shape: energy swells over ~15-minute arcs
    const arc = 0.55 + 0.45 * Math.sin((Math.PI * t) / 900) ** 2
    const chord = CHORDS[Math.floor(t / (BAR * 16)) % CHORDS.length]

    const b = t % BEAT
    const kickOn = !inBreak(t)
    const kick = kickOn
      ? Math.sin(2 * Math.PI * (45 * b + (110 * (1 - Math.exp(-28 * b))) / 28)) * Math.exp(-6.5 * b) * 0.85 * arc
      : 0

    const off = (t + BEAT / 2) % BEAT
    const hat = kickOn ? noise() * Math.exp(-55 * off) * 0.1 * arc : 0

    bassPhase += (2 * Math.PI * midi(chord - 12)) / RATE
    const bass = kickOn ? Math.sin(bassPhase) * Math.exp(-7 * off) * 0.28 * arc : 0

    let pad = 0
    const voicing = [0, 3, 7, 10]
    for (let v = 0; v < 4; v += 1) {
      padPhase[v] += (2 * Math.PI * midi(chord + 12 + voicing[v]) * (1 + v * 0.0015)) / RATE
      pad += Math.sin(padPhase[v])
    }
    const breathe = 0.6 + 0.4 * Math.sin(2 * Math.PI * 0.05 * t)
    pad *= 0.045 * breathe * (inBreak(t) ? 1.8 : 1)

    const fade = Math.min(1, t / 8, (LENGTH - t) / 20)
    const y = Math.tanh(1.3 * (kick + hat + bass + pad)) * fade
    pcm[i] = Math.max(-1, Math.min(1, y)) * 32767
  }

  if (!ffmpeg.stdin.write(Buffer.from(pcm.buffer))) {
    await new Promise((resolve) => ffmpeg.stdin.once('drain', resolve))
  }
}

ffmpeg.stdin.end()
await done

const peaks = await computePeaks(out)
const peaksOut = writePeaks('test-pressing', peaks)
console.log(`test pressing · 45:00 → ${path.relative(root, out)} + ${peaksOut}`)
