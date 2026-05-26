import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: '★wik — Frequencies',
  description: 'DJ press kit for ★wik: sets, mixes, live history, and booking.',
}

export default function SignalPage() {
  redirect('/frequencies')
}
