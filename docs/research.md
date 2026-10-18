# Research — open-source help for "Across the Street"

Checked 2026-10-06. Licenses verified at the source: the GitHub API `license.spdx_id`, the
license file, or (for fonts) the license string embedded in the font's `name` table.
"Use" means it ships in the site or the build. "Technique" means we read it and write our
own code; nothing of theirs ships.

Ground rule held throughout: **every drawing is ours.** Icon sets and repos are used for
technique only, plus (optionally) a couple of tiny UI glyphs. Nothing is traced.

---

## 1. Pixel / doodle / 1-bit icon sets

| Candidate | License (verified) | Link | Verdict |
|---|---|---|---|
| **pixelarticons** (halfmage) | MIT | https://github.com/halfmage/pixelarticons | **Maybe, UI only.** 24×24 grid, 1-bit, clean, actively maintained (pushed today). A good fit *as a reference grid* for our hint icons (hand, hold-ring, menu "+", arrow). Plan: draw our own 3 hint icons on the same 24-grid. Fall back to 1–2 pixelarticons glyphs (e.g. `arrow-left` in the back pill) only if ours read worse. If any ship, they get credited. |
| HackerNoon pixel-icon-library | MIT (repo) | https://github.com/hackernoon/pixel-icon-library | **Reject.** Heavier, brand-flavored style; overlaps pixelarticons. |
| Streamline Pixel (free) | CC BY 4.0 | https://www.streamlinehq.com/icons/pixel | **Reject.** It's the exact icon set the reference uses. Using it would make us look derivative, which is the opposite of the brief. |
| Kenney 1-Bit Pack | CC0 | https://kenney.nl/assets/1-bit-pack | **Reject.** 16-px game tiles; the style says "roguelike", not "illustrated zine". |
| Tabler / Remix icons | MIT / Remix license | github.com/tabler/tabler-icons | **Reject.** Vector, anti-aliased. Breaks the no-AA rule. |

## 2. Hand-drawn / sketchy rendering

| Candidate | License | Link | Verdict |
|---|---|---|---|
| rough.js | MIT | https://github.com/rough-stuff/rough | **Reject.** Lovely, but it produces anti-aliased wobbly bezier strokes. Our brief forbids AA curves and wants stair-stepped, uniform 3-px outlines. Wrong aesthetic. |
| perfect-freehand | MIT | https://github.com/steveruizok/perfect-freehand | **Reject** for art (same reason). |

→ The "hand-made" quality comes from **authoring on a coarse grid by hand**, not from a
sketch renderer.

## 3. Scroll animation

| Candidate | License | Link | Verdict |
|---|---|---|---|
| **GSAP 3 + ScrollTrigger** | GSAP *Standard "No Charge" License*: free incl. commercial use and all plugins since May 2025. **Not OSI open source**: it forbids use in no-code visual animation builders that compete with Webflow, which doesn't apply to us. | https://gsap.com/standard-license | **Use.** Already a dependency in this repo (`gsap@3.15`). `ScrollTrigger` for pins/scrub, `gsap.matchMedia()` for per-breakpoint staging, `gsap.quickSetter` for per-frame CSS vars. Tree-shaken core + ScrollTrigger ≈ 45 KB gz. Credit it in /credits. |
| Lenis | MIT | https://github.com/darkroomengineering/lenis | **Reject (default).** The reference uses native scroll and it feels right: never traps, keeps iOS momentum, plays nicely with sticky. Smooth-scroll libs add input latency and fight `position: sticky` on iOS. Hold in reserve as a desktop-only opt-in if pinned scrubs feel steppy on wheel mice. |
| Motion (framer-motion) | MIT | https://github.com/motiondivision/motion | **Reject for this story.** It's what the reference uses and it's already in the repo, but it's React-bound. The brief asks for a framework-free engine with GSAP. |
| CSS scroll-driven animations (`animation-timeline: view()`) | web standard | MDN | **Use for small things** (cloud drift, dust) where supported; GSAP covers the rest. Free on the compositor. |

## 4. Pixel-art-in-code

| Candidate | License | Link | Verdict |
|---|---|---|---|
| pixels2svg | **GPL-3.0** | https://github.com/ValentinFrancois/pixels2svg | **Reject (license + Python).** Its idea (merge same-color pixels into polygons) is the right one; we reimplement the concept ourselves. |
| pix2svg | MIT | https://github.com/LeSnow-Ye/pix2svg | **Technique.** Greedy rectangle merge: expand each unvisited pixel right, then down, while the color matches. Rust, 2 stars. We port the ~40-line idea to TS rather than depend on it. |
| "Vector pixels: SVG optimization" (Shaw, CodePen) | article | https://codepen.io/shshaw/post/vector-pixels-svg-optimization-animation-and-understanding-path-data | **Technique.** Emit one `<path>` per color using relative `h`/`v` commands (`M x y h w v 1 h -w z`), so a whole sprite is a handful of paths. |
| `image-rendering: pixelated` + integer scaling | web standard | MDN | **Use for the particle canvas** (dissolve). Back store at logical resolution, CSS-scaled by an integer factor. |
| `shape-rendering: crispEdges` on SVG | web standard | MDN | **Use** on every sprite `<svg>`. With integer grid coordinates and an integer `viewBox` → device-pixel scale, edges stay hard. |

**Our compiler (to write, ~120 lines TS, no deps):**
`src/art/*.ts` exports `{ palette: Record<char, token>, rows: string[] }` → build step →
greedy-rect merge per color → one `<path fill="var(--token)">` per color → `.svg`
fragments imported as strings. Colors are **CSS custom properties**, so the distress
palette shift recolors every drawing for free (no re-render), and Marcus/the man can share
one template with overlay layers (coat, jaw, eyes, phone).

Seams: merged rects inside a single path with integer coords produce no hairlines; we
also snap the scene's CSS scale to an integer multiple of the logical grid per breakpoint
(e.g. 320×180 → ×4 = 1280×720 on desktop, letterboxed in sky).

## 5. Particle / dissolve on pixel sprites

| Candidate | License | Link | Verdict |
|---|---|---|---|
| Disintegrate (Zach Saucier) | MIT | https://github.com/ZachSaucier/Disintegrate | **Technique only.** It rasterizes DOM via html2canvas (heavy) and plays one-shot timelines. Our sprites already *are* grids, so we skip rasterizing entirely. |
| ParticleEffectsButtons (Codrops) | no license on repo | https://github.com/hrastnik/ParticleEffectsButtons | **Reject** (no license). Read the Codrops article for feel only. |

**Our approach:** the coat sprite's grid cells *are* the particles (≈300–600 cells). Each
cell gets a seeded random delay ordered along the sunbeam direction (cells nearest the
beam go first), an upward drift vector along the beam angle, and slight lateral sine
wobble. Position is a **pure function of hold-progress `t ∈ [0,1]`**, so "release too early
and it settles back" is simply `t` easing back toward 0, which is reversible for free,
deterministic, and reduced-motion friendly (we cross-fade instead). Drawn to one
`<canvas>` at logical resolution with `image-rendering: pixelated`. One `fillRect` per
live cell per frame is trivially 60 fps on a mid-range phone.

## 6. Fonts (all self-hosted, subset, `font-display: swap`)

| Font | License (verified) | Link | Use |
|---|---|---|---|
| **BDO Grotesk** | SIL OFL 1.1 (checked in the font's name table and the repo) | https://github.com/LCTipografi/BDO-Grotesk | **Story text.** It's the reference's measured text face: a tight, slightly narrow neo-grotesk. Matches the brief's "tight, slightly condensed neo-grotesk". Regular (+ Medium if needed). |
| Inter Tight | SIL OFL 1.1 | https://fonts.google.com/specimen/Inter+Tight | **Fallback option** if BDO's Latin subset has a gap. More neutral, slightly more condensed. |
| **Instrument Serif Italic** | SIL OFL 1.1 | https://github.com/Instrument/instrument-serif | **Accent + UI** (back pill, hints, chapter names). As the brief specifies. Plays the role Libre Baskerville Italic plays in the reference. |
| fontTools `pyftsubset` | MIT | https://github.com/fonttools/fonttools | **Build-time subsetting** to Latin + the story's glyphs (“ ” ’ — …). Expect ~15–20 KB per woff2. |
| glyphhanger | MIT | https://github.com/zachleat/glyphhanger | Alternative subsetter. Not needed if pyftsubset works. |

## 7. Other platform pieces

- **Pointer Events + `setPointerCapture`** for drag/scrub/hold (no library).
- **`navigator.vibrate`**: Android Chrome only. iOS Safari doesn't support it, so it gets
  feature-detected with a silent fallback (the visible hold-ring carries the feedback).
- **`svh`/`dvh`** units for pinned stages, `env(safe-area-inset-*)` for the bottom sheet
  and chrome.
- **Vite** (MIT, https://github.com/vitejs/vite): the brief's bundler. See the stack
  decision below.

---

## Proposed final stack

**Engine: vanilla TypeScript + GSAP ScrollTrigger + native scroll + SVG sprites compiled
from grid maps + one canvas for particles. No Lenis, no framework inside the story.**

```
art (string grids) ──build script──▶ SVG path strings (fill = var(--token))
content/beats.json ──▶ semantic HTML (h2 per chapter, <p> per beat)
                       └▶ GSAP timelines per chapter, staged via gsap.matchMedia()
tokens.css (calm + distress sets) ──▶ CSS vars tweened by ScrollTrigger progress
```

| Concern | Choice | Size budget (gz) |
|---|---|---|
| Animation | gsap core + ScrollTrigger | ~45 KB |
| Engine + chapters | own TS | ~25 KB |
| Art | inlined SVG paths (~40 sprites) | ~20–30 KB |
| Fonts | BDO Grotesk Regular + Instrument Serif Italic, subset | ~35 KB |
| **Total first load** | | **≈ 130 KB**, comfortably Lighthouse-90 territory |

Later chapters' art and timelines lazy-load (dynamic `import()`) as the reader approaches.

### ⚠ One decision for you: where the build lives

The brief says **Vite + vanilla TS, static files**, but also **inside the existing Next.js
thoughts page, in the "Across the Street" card** (`content/thoughts/03-sunday-morning.ts`,
slug `sunday-morning`, today special-cased in
`app/thoughts/_components/ThoughtReadingExperience.tsx` to `SundayMorningOpeningScene`).
Those pull in different directions. Two options:

**A. Framework-free engine inside the Next app (recommended).**
`stories/across-the-street/src/**` is pure TS with zero React imports (engine, art,
chapters, tokens.css, beats.json). A ~25-line client component mounts it into the
existing `sunday-morning` route and unmounts it cleanly. Next's bundler builds it, and
the art compiler runs as an `npm run story:art` prebuild step.
- ✅ Lives inside the thoughts card/route as you described, shares the archive's portal
  transition, one deploy, no iframe.
- ✅ Still framework-free and portable: the same `src/` can be dropped into a Vite shell
  later in minutes.
- ⚠ Not literally Vite. Global CSS has to be scoped (`[data-story]` root) so it doesn't
  fight `globals.css`.

**B. Separate Vite project, emitted as static files the card opens.**
`stories/across-the-street/` is its own Vite app; `vite build` outputs to
`public/stories/across-the-street/`. The card links there (full page) or embeds it in an
iframe.
- ✅ Exactly the brief's stack, fully isolated, trivially static-deployable anywhere.
- ⚠ Two build pipelines. Leaving the Next app breaks the archive → thought portal
  animation and the persistent thoughts layout. An iframe would break scroll/pin
  behavior on iOS and the back pill's history, so it would have to be a real navigation.

I'd go with **A**: it honours "inside the thoughts page" and keeps the engine
framework-free. But it's your call, and I won't start Stage B until you pick.

### Other notes for Checkpoint A
- **Source text:** there's no `content/story.md`. The canonical story is the `sections`
  array in `content/thoughts/03-sunday-morning.ts` (8 chapters there: Sunday Morning,
  Across the Street, The Knock, The Stain, The Phone, Three Years, The Window, After).
  The brief's 7 chapters merge "The Phone" + "Three Years". I'll generate `beats.json` from
  that file and keep the Reader's text-only fallback reading the same source.
- **Token adjustments** from measurement: `--line` → `#0E27B6`, `--text` → `#29210C`
  (others match). Details in reference-notes.md §3.
- The reference has **no parallax and no hover wobble**. Both are additions from the
  brief; I'll keep them very quiet so they stay in the same register.
