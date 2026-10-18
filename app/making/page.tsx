import type { Metadata } from 'next'
import Link from 'next/link'
import { SporeMotif, StackMotif } from './ProjectMotifs'
import { ProjectDuo, ProjectPod } from './ProjectPods'
import { PROJECTS } from './projects'
import styles from './making.module.css'

export const metadata: Metadata = {
  title: '★wik — The Making',
  description: "what i'm building and why",
}

const friends = ['Sandeep’s platform', "[a friend's project]", "[a friend's project]"]

const notes = [
  '> now',
  "[what i'm working on now]",
  "// why i'm making this",
  '[one line, in your own words]',
  "// what i'm figuring out",
  "[what i'm figuring out]",
  '// what changed my mind',
  '[what changed my mind]',
]

export default function MakingPage() {
  return (
    <main className={styles.page}>
      <nav className={styles.topRow} aria-label="The Making navigation">
        <Link href="/" className={styles.back}>
          <span aria-hidden="true">←</span> wikverse
        </Link>
        <p className={styles.count}>2 things in the making</p>
      </nav>

      <header className={styles.header}>
        <p className={styles.number}>04</p>
        <h1 className={styles.title}>The Making</h1>
        <p className={styles.subtitle}>what i&apos;m building and why</p>
      </header>

      <section aria-label="Projects in the making">
        <ProjectDuo>
          {PROJECTS.map((project) => (
            <ProjectPod key={project.id} project={project}>
              <div className={styles.podCopy}>
                <p className={styles.projectNumber}>{project.number}</p>
                <h2 className={styles.projectName}>{project.name}</h2>
                <p className={styles.descriptor}>{project.descriptor}</p>
                <p className={styles.status}><span className={styles.statusDot} aria-hidden="true" />building</p>
              </div>
              {project.id === 'spore' ? <SporeMotif /> : <StackMotif />}
            </ProjectPod>
          ))}
        </ProjectDuo>
        <p className={styles.projectFootnote}>two things, for now. new ones show up here as they start.</p>
      </section>

      <section className={styles.friends} aria-labelledby="friends-title">
        <h2 id="friends-title" className={styles.sectionLabel}>WHAT MY FRIENDS ARE BUILDING</h2>
        <p className={styles.sectionIntro}>[a short line about what my friends are building]</p>
        <div className={styles.friendRow}>
          {friends.map((name, index) => (
            <article key={index} className={styles.friendCard} tabIndex={0} aria-labelledby={`friend-${index}`}>
              <h3 id={`friend-${index}`} className={styles.friendName}>{name}</h3>
              <p className={styles.friendDescription}>[one line on why i like it]</p>
              <span className={styles.friendArrow} aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.workbench} aria-labelledby="workbench-title">
        <h2 id="workbench-title" className={styles.sectionLabel}>FROM THE WORKBENCH</h2>
        <div className={styles.notes} tabIndex={0} role="region" aria-label="notes.md">
          <p className={styles.filename}>notes.md</p>
          <ol className={styles.noteLines}>
            {notes.map((line, index) => (
              <li key={line} className={index % 2 === 0 ? styles.noteHeading : undefined}>
                <span className={styles.lineNumber} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <code>{line}{index === notes.length - 1 ? <span className={styles.caret} aria-hidden="true">▎</span> : null}</code>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  )
}
