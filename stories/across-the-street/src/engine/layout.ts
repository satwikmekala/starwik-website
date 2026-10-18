export type Layout = 'desktop' | 'mobile'

/** ≥1024 wide is desktop; 768–1023 follows orientation; below is mobile. */
export const layoutFor = (w: number, h: number): Layout => (w >= 1024 || (w >= 768 && w > h) ? 'desktop' : 'mobile')

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
