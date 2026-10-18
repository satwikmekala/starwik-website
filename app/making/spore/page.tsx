import type { Metadata } from 'next'
import { ProjectArrival } from '../ProjectArrival'
import { PROJECTS } from '../projects'

export const metadata: Metadata = { title: '★wik — Spore', description: PROJECTS[0].descriptor }

export default function SporePage() {
  return <ProjectArrival project={PROJECTS[0]} />
}
