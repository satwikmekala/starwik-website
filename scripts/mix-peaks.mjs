#!/usr/bin/env node
// Precompute a mix's waveform so the browser never has to decode a 90-minute file.
//
//   npm run mix:peaks -- <audio-file> <slug> [--points 1600]
//
// Writes public/mixes/peaks/<slug>.json ({ duration, peaks }) and prints the
// duration to paste into app/frequencies/mixes.ts. Needs ffmpeg + ffprobe.

import { execFileSync, spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const RATE = 4000 // plenty for a visual envelope

export async function computePeaks(file, points = 1600) {
  const duration = Number(
    execFileSync('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=nw=1:nk=1',
      file,
    ]).toString().trim()
  )
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error(`ffprobe couldn't read a duration from ${file}`)
  }

  const perBucket = (duration * RATE) / points
  const peaks = new Float32Array(points)
  let index = 0
  let carry = Buffer.alloc(0)

  await new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-v', 'error', '-i', file, '-ac', '1', '-ar', String(RATE), '-f', 'f32le', '-',
    ])
    ffmpeg.stdout.on('data', (chunk) => {
      const data = carry.length ? Buffer.concat([carry, chunk]) : chunk
      const usable = data.length - (data.length % 4)
      for (let offset = 0; offset < usable; offset += 4) {
        const bucket = Math.min(points - 1, Math.floor(index / perBucket))
        const value = Math.abs(data.readFloatLE(offset))
        if (value > peaks[bucket]) peaks[bucket] = value
        index += 1
      }
      carry = data.subarray(usable)
    })
    ffmpeg.stderr.on('data', (d) => process.stderr.write(d))
    ffmpeg.on('error', reject)
    ffmpeg.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))))
  })

  const max = peaks.reduce((a, b) => Math.max(a, b), 0) || 1
  return {
    duration: Math.round(duration * 100) / 100,
    peaks: Array.from(peaks, (p) => Math.round((p / max) * 1000) / 1000),
  }
}

export function writePeaks(slug, result) {
  const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
  const out = path.join(root, 'public', 'mixes', 'peaks', `${slug}.json`)
  mkdirSync(path.dirname(out), { recursive: true })
  writeFileSync(out, JSON.stringify(result))
  return path.relative(root, out)
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])

if (isMain) {
  const args = process.argv.slice(2)
  const pointsFlag = args.indexOf('--points')
  const points = pointsFlag >= 0 ? Number(args.splice(pointsFlag, 2)[1]) : 1600
  const [file, slug] = args

  if (!file || !slug) {
    console.error('usage: npm run mix:peaks -- <audio-file> <slug> [--points 1600]')
    process.exit(1)
  }

  const result = await computePeaks(file, points)
  const out = writePeaks(slug, result)
  const m = Math.floor(result.duration / 60)
  const s = String(Math.floor(result.duration % 60)).padStart(2, '0')
  console.log(`${slug} · ${m}:${s} → ${out}`)
  console.log(`set duration: ${result.duration} in app/frequencies/mixes.ts`)
}
