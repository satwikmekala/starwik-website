/**
 * The archive, in order.
 *
 * To add a thought:
 *   1. copy one of the numbered files in this folder
 *   2. change the words (and the photograph)
 *   3. import it below and add it to THOUGHTS
 *
 * The selector draws one hand-made mark per entry, the routes are
 * generated from the slugs, and "next thought" follows this order.
 */

import { prepareThoughts } from './helpers'
import type { Thought } from './types'

import superpositionOfLove from './01-superposition-of-love'
import theOrderOfOperations from './02-the-order-of-operations'
import sundayMorning from './03-sunday-morning'
import theMonkILiveWith from './04-the-monk-i-live-with'
import theComfortableVersion from './05-the-comfortable-version'
import theLongWayHome from './06-the-long-way-home'

export const THOUGHTS: Thought[] = [
  superpositionOfLove,
  theOrderOfOperations,
  sundayMorning,
  theMonkILiveWith,
  theComfortableVersion,
  theLongWayHome,
]

export const THOUGHT_ENTRIES = prepareThoughts(THOUGHTS)

export function getThought(slug: string) {
  return THOUGHT_ENTRIES.find((thought) => thought.slug === slug)
}

export type { Thought, ThoughtBlock, ThoughtImage } from './types'
export type { ThoughtEntry } from './helpers'
export { getExperienceKind, getPortalKind } from './helpers'
export { SUNDAY_MORNING_SCENE_IDS, type SundayMorningSceneId } from './03-sunday-morning'
