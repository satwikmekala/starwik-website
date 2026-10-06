export interface Placement {
  /** Handle the renderer and chapters use (`itemState(id)`). */
  id: string
  sprite: string
  /** Parts to draw, in order. Defaults to ['base'] or the sprite's only part. */
  parts?: string[]
  /** Parts drawn but hidden until a chapter reveals them. */
  hidden?: string[]
  /** Position in safe-frame units (canvas units for `canvas: true`). */
  x: number
  y: number
  canvas?: boolean
  /** Mirror horizontally (same art, facing the other way). */
  flip?: boolean
  /** Desktop clouds: drift slowly with time (not under reduced motion). */
  drift?: number
  /** Meaningful art gets a label (used for the canvas description). */
  label?: string
}

export interface SceneDef {
  name: string
  canvas: { w: number; h: number }
  safe: { x: number; y: number; w: number; h: number }
  items: Placement[]
  /** The sunbeam is drawn right after this item: over floor and rug, under window and furniture. */
  beamAfter?: string
  /** Street people (the man pacing, the fruit seller…) are drawn right after this item. */
  streetAfter?: string
  /** Window glass in safe-frame units: where the sunbeam starts; `from`/`to` = far edge of the floor patch at progress 0/1. */
  sun?: { x: number; y: number; w: number; h: number; floorTop: number; floorBottom: number; from: number; to: number }
}
