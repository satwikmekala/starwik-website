import Link from 'next/link'
import styles from './_components/experience.module.css'

export default function ThoughtNotFound() {
  return (
    <div className={styles.missing}>
      <h1 className={styles.missingTitle}>this thought hasn&apos;t been written yet.</h1>
      <Link href="/thoughts" className={styles.missingLink}>
        return to thoughts
      </Link>
    </div>
  )
}
