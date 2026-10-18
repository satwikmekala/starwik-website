import type { Metadata } from 'next'
import { ProjectArrival } from '../ProjectArrival'
import { PROJECTS } from '../projects'

export const metadata: Metadata = { title: '★wik — Stack', description: PROJECTS[1].descriptor }

export default function StackPage() {
  return <ProjectArrival project={PROJECTS[1]} />
}
