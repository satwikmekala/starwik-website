import type { InkPath } from './lib/paths.ts'
import core from './generated/sprites.json'

export interface CompiledSprite {
  w: number
  h: number
  label: string
  parts: Record<string, InkPath[]>
}

/**
 * Build output of scripts/compile-art.ts (never edit the JSON by hand).
 * Chapter-1 art ships with the engine; people and the street arrive in a
 * second chunk right after first paint (loadLateSprites).
 */
export const SPRITE_DATA = core as unknown as Record<string, CompiledSprite>

let late: Promise<void> | null = null
export function loadLateSprites() {
  late ??= import('./generated/sprites-late.json').then((m) => {
    Object.assign(SPRITE_DATA, (m.default ?? m) as unknown as Record<string, CompiledSprite>)
  })
  return late
}
