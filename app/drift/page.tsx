import type { Metadata } from 'next'
import DriftExperience from '@/components/DriftExperience'

export const metadata: Metadata = {
  title: '★wik — Elsewhere',
  description:
    'A personal atlas of places, journeys, and the things ★wik brought back.',
}

export default function ElsewherePage() {
  return <DriftExperience />
}
