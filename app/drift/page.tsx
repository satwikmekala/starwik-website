import type { Metadata } from 'next'
import DriftExperience from '@/components/DriftExperience'

export const metadata: Metadata = {
  title: '★wik — Elsewhere',
  description:
    'A scroll-driven cinematic journey through every place ★wik has ever traveled.',
}

export default function ElsewherePage() {
  return <DriftExperience />
}
