'use client'

import { useId, useState, type FormEvent } from 'react'
import styles from './openThought.module.css'

interface MarginNote { id: string; text: string; author?: string }
const EMPTY_NOTES: readonly MarginNote[] = []

export function ThoughtMargin({ notes = EMPTY_NOTES }: { notes?: readonly MarginNote[] }) {
  const id = useId()
  const [line, setLine] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [invalid, setInvalid] = useState(false)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!line.trim() || line.length > 280) {
      setInvalid(true)
      setMessage('leave a line first. up to 280 characters.')
      document.getElementById(`${id}-line`)?.focus()
      return
    }
    // TODO: Persist a pending note and display only approved notes when storage exists.
    // This UI stub deliberately makes no network request and stores nothing.
    setMessage('thanks. it will appear once approved.')
    setInvalid(false)
    setLine('')
    setName('')
  }

  return <section className={styles.margin} aria-labelledby={`${id}-heading`}>
    <h2 id={`${id}-heading`}>in the margin</h2>
    <p className={styles.marginSubtitle}>notes from people who read this</p>
    <ul className={styles.notes}>
      {notes.length ? notes.map((note) => <li key={note.id} className={styles.note}>
        <p>{note.text}</p><p className={styles.author}>{note.author?.trim() || 'anonymous'}</p>
      </li>) : <li className={styles.note}>no notes yet. be the first.</li>}
    </ul>
    <form id="margin-note-form" className={styles.form} onSubmit={submit} noValidate>
      <label htmlFor={`${id}-line`}>leave a line in the margin</label>
      <textarea id={`${id}-line`} name="note" rows={3} maxLength={280} value={line} placeholder="a thought this left you with…" required aria-invalid={invalid || undefined} aria-describedby={`${id}-count${invalid ? ` ${id}-message` : ''}`} onChange={(event) => { setLine(event.target.value); if (invalid) { setInvalid(false); setMessage('') } }} />
      <span id={`${id}-count`} className={styles.counter} aria-live="polite" aria-atomic="true">{line.length} / 280</span>
      <label htmlFor={`${id}-name`}>your name (optional)</label>
      <input id={`${id}-name`} name="name" autoComplete="name" maxLength={80} value={name} placeholder="anonymous is fine" onChange={(event) => setName(event.target.value)} />
      <button type="submit" className={styles.submit}>pin it to the margin</button>
      <p className={styles.approval}>notes appear after Wik approves them</p>
      <p id={`${id}-message`} role="status" aria-live="polite" className={styles.formMessage}>{message}</p>
    </form>
  </section>
}
