import styles from './house.module.css'

/** The same replaceable material layers in the window, handoff and opening. */
export function SundayRoom({ miniature = false }: { miniature?: boolean }) {
  return (
    <span className={`${styles.room} ${miniature ? '' : styles.openRoom}`} aria-hidden="true">
      <span className={styles.interior} data-house-interior>
        <span className={styles.light} />
        <span className={styles.floor} />
        <span className={styles.rug} />
        <span className={styles.curtain} />
        <span className={styles.plant} />
      </span>
    </span>
  )
}
