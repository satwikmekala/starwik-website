import type { InkPath } from './lib/paths.ts'
import data from './generated/sprites.json'

export interface CompiledSprite {
  w: number
  h: number
  label: string
  parts: Record<string, InkPath[]>
}

/** Build output of scripts/compile-art.ts (never edit the JSON by hand). */
export const SPRITE_DATA = data as unknown as Record<string, CompiledSprite>
