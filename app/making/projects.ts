export const PROJECTS = [
  { id: 'spore', number: '01', name: 'Spore', descriptor: 'a voice-first thinking companion for iOS.', color: '#F5A623', ink: '#0A0A0A' },
  // White on cobalt is 4.18:1; this ink clears AA at 4.74:1 for the small copy.
  { id: 'stack', number: '02', name: 'Stack', descriptor: 'a minimalist gym-tracking app for iOS.', color: '#4C6FFF', ink: '#0A0A0A' },
] as const

export type Project = typeof PROJECTS[number]
export type ProjectId = Project['id']

export function projectFromPath(pathname: string): ProjectId | undefined {
  return PROJECTS.find(project => pathname === `/making/${project.id}`)?.id
}
