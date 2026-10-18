'use client'

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface Navigation {
  href: string
  resolve: () => void
  committed: Promise<void>
  archive: boolean
}
const Context = createContext<{ navigate: (href: string) => void; arrival: string }>({ navigate: () => {}, arrival: 'direct' })
export const useThoughtArrival = () => useContext(Context).arrival
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Keep the native snapshot open until App Router commits the destination DOM. */
export function ThoughtTransitions({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const path = useRef(pathname)
  const pending = useRef<Navigation | null>(null)
  const active = useRef<ViewTransition | null>(null)
  const archiveScroll = useRef(0)
  const lastSlug = useRef<string | null>(null)
  const [arrival, setArrival] = useState('direct')

  const navigate = useCallback((href: string, history = false) => {
    const target = new URL(href, window.location.href)
    if (target.pathname === path.current || pending.current) return
    if (path.current === '/thoughts') archiveScroll.current = window.scrollY
    else lastSlug.current = path.current.split('/')[2] ?? null
    const native = !reduced() && typeof document.startViewTransition === 'function'
    setArrival(target.pathname === '/thoughts' ? 'return' : native ? 'morph' : 'fade')
    let resolve!: () => void
    const committed = new Promise<void>((done) => { resolve = done })
    pending.current = { href: target.href, resolve, committed, archive: target.pathname === '/thoughts' }
    const html = document.documentElement
    const shell = document.querySelector<HTMLElement>('[data-thoughts-shell]')
    html.style.setProperty('--thought-transition-ease', shell ? getComputedStyle(shell).getPropertyValue('--index-ease') : 'ease')
    const update = async () => {
      if (!history) router.push(`${target.pathname}${target.search}${target.hash}`, { scroll: false })
      await committed
      // Layout effects, including scroll restoration, have run. Resolve now:
      // browsers can suspend animation frames while the snapshot update is open.
    }
    const focus = () => {
      const element = target.pathname === '/thoughts'
        ? Array.from(document.querySelectorAll<HTMLElement>('[data-archive-slug]')).find((link) => link.dataset.archiveSlug === lastSlug.current)
        : document.getElementById('thought-title')
      element?.focus({ preventScroll: true })
    }
    if (native) {
      html.dataset.thoughtTransition = 'morph'
      const transition = document.startViewTransition(update)
      active.current = transition
      // A skipped transition still completes navigation. No unhandled rejection.
      void transition.ready.catch(() => {})
      void transition.finished.catch(() => {}).then(() => {
        delete html.dataset.thoughtTransition
        html.style.removeProperty('--thought-transition-ease')
        active.current = null
        focus()
      })
    } else if (!reduced() && shell) {
      const overlay = document.createElement('div')
      const snapshot = shell.cloneNode(true) as HTMLElement
      snapshot.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'))
      overlay.setAttribute('aria-hidden', 'true')
      overlay.inert = true
      Object.assign(overlay.style, { position: 'fixed', inset: '0', zIndex: '1000', overflow: 'hidden', pointerEvents: 'none' })
      snapshot.style.transform = `translateY(-${window.scrollY}px)`
      overlay.append(snapshot)
      document.body.append(overlay)
      void update().then(async () => {
        const options = { duration: 300, easing: getComputedStyle(shell).getPropertyValue('--index-ease') }
        const fadeIn = shell.animate({ opacity: [0, 1] }, options)
        const fadeOut = overlay.animate({ opacity: [1, 0] }, options)
        await Promise.allSettled([fadeIn.finished, fadeOut.finished])
        overlay.remove()
        html.style.removeProperty('--thought-transition-ease')
        focus()
      })
    } else {
      void update().then(focus)
      html.style.removeProperty('--thought-transition-ease')
    }
  }, [router])

  useLayoutEffect(() => {
    path.current = pathname
    const navigation = pending.current
    if (!navigation || new URL(navigation.href).pathname !== pathname) return
    const hash = new URL(navigation.href).hash
    if (navigation.archive) window.scrollTo({ top: archiveScroll.current, behavior: 'instant' })
    else if (hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: 'instant' })
    else window.scrollTo({ top: pathname.endsWith('/read') ? (document.getElementById('reading')?.offsetTop ?? 0) : 0, behavior: 'instant' })
    navigation.resolve()
    pending.current = null
  }, [pathname])

  useEffect(() => {
    const pop = () => {
      if (window.location.pathname.startsWith('/thoughts')) navigate(window.location.href, true)
    }
    window.addEventListener('popstate', pop, true)
    return () => {
      window.removeEventListener('popstate', pop, true)
      pending.current?.resolve()
      active.current?.skipTransition()
      delete document.documentElement.dataset.thoughtTransition
      document.documentElement.style.removeProperty('--thought-transition-ease')
    }
  }, [navigate])

  return <Context.Provider value={{ navigate, arrival }}>{children}</Context.Provider>
}

export function ThoughtTransitionLink({ href, onNavigate, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const { navigate } = useContext(Context)
  return <Link {...props} href={href} scroll={false} onNavigate={(event) => {
    onNavigate?.(event)
    event.preventDefault()
    navigate(href)
  }} />
}
