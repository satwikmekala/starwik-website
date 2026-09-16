import { redirect } from 'next/navigation'

/** Transmit became Thoughts — old links still arrive somewhere. */
export default function TransmitPage() {
  redirect('/thoughts')
}
