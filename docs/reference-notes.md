# Reference notes — Digital Home Zine (nabiu.studio)

Studied 2026-10-06 in a real browser (Claude desktop browser pane, Chromium, DPR 2) at
1440×900 and 390×844, scrolled start to finish, with computed styles, DOM, stylesheet
tokens, and image pixels read via DevTools-equivalent JS.

- Essay: https://nabiu.studio/digital-home-zine/essay
- Write-up: https://nabiu.studio/garden/digital-home-zine-a-storytelling-website-about-digital-homes

The point of these notes is to capture the **feel** (rhythm, restraint, chrome, how the
art and the type share a frame). Nothing here is to be copied: no assets, no copy, no
layouts. Every drawing in "Across the Street" is original.

---

## 1. How it's built

| Thing | Finding |
|---|---|
| Platform | **Framer** site (React + Framer Motion, `framerusercontent.com` modules, `data-framer-name` on every layer). No GSAP, no ScrollTrigger, no Lenis. |
| Scrolling | **Native scroll.** No smooth-scroll hijack. Nothing ever traps the wheel. |
| Pinning | Pure CSS **`position: sticky; top: 0`** children inside tall parents (parent height = N × 100vh). A pinned "stage" lasts 1–5 screens. |
| Art | **Raster PNGs** (`<img>`, ~70 of them) + **inline SVG icons** (~46, Streamline Pixel, CC BY 4.0). **No canvas.** |
| Pixel look | Authored pixel art exported as PNG at or near display size. `image-rendering` is **`auto`** everywhere (0 images use `pixelated`). Clouds ship at 240×137 and render at 290×165 (≈1.2×), so their stair-steps are slightly soft. Big pieces (phone, laptop, path) are high-res PNGs scaled *down*. The stair-step is drawn into the art, not produced by a renderer. |
| Icons | Streamline "Pixel" free set (SVG, `fill: currentColor`), credited in the footer ("Free Icons from Streamline"). Cursor-hand and home icons in the chrome are also from that set. |
| Page length | Desktop 33,192 px (≈37 screens). Mobile 24,607 px (≈29 screens). |

**What we'll do differently:** the brief wants every drawing authored as grid maps and
compiled to SVG. That gives us a *crisper* pixel look than the reference (true
nearest-neighbor, integer scale, no soft edges) and keeps every drawing editable in code.

---

## 2. Typography (computed)

Three families, each with a single job:

| Role | Family | Desktop | Mobile | Line-height | Tracking |
|---|---|---|---|---|---|
| Story / body | **BDO Grotesk Regular** (400 only) | 32 / 40 / 48 px (body), 75 px (one uppercase display line) | 22 / 24 / 32 px | **1.2** everywhere | **−0.02em** (32 px → −0.64 px; 40 → −0.8) |
| Small body / captions in art | BDO Grotesk | 14 / 12 px | 14 / 12 px | 1.2 | −0.02em |
| UI + hints + "machine" voice | **JetBrains Mono** 400 (700 uppercase for folder labels) | 64 px title (−0.07em), 40 / 24 / 16 / 12 px | 32 px title, 24 / 16 / 12 / 11 px | 1.2 (1.3 at 11–12 px) | −0.04em at 16–40 px, −0.02em at 12 px |
| Back pill only | **Libre Baskerville Italic** 400 | 14 px | 14 px | 1.4 | normal |

- Body copy is **centered** in most beats, **left-aligned** in the two "essay paragraph"
  pins (left column with art on the right). Ragged right, never justified.
- Measure is narrow: centered beats wrap at about 28–38 characters (2–4 lines). This is
  where the "3–5 words per line" rhythm comes from.
- Tracking is tight but not crushed. −0.02em on a neo-grotesk at 32 px reads "editorial",
  not "compressed".
- The italic serif shows up **once**, on the back pill. It acts like a signature, not a voice.

**BDO Grotesk license:** checked inside the font file (name ID 13): *"licensed under the SIL
Open Font License, Version 1.1"*, © 2017 Lokal Container, designer Deni Anggara. Official
repo: [LCTipografi/BDO-Grotesk](https://github.com/LCTipografi/BDO-Grotesk) (OFL-1.1).
→ We can self-host the reference's actual text face legally (see research.md).

---

## 3. Color (computed hex)

The page has a large Framer token list. These are the ones actually used:

| Role | Hex | Where |
|---|---|---|
| Cobalt (brand "blue") | **#0E27B6** | body background, outlines of hotel / laptop / path, SVG icon fills, current-page link |
| Cobalt in raster art | #0A28B2 (±2) | anti-aliased linework inside PNGs |
| Periwinkle sky | **#CCD9F8** (also #CCD9F5) | the "phone" pin, the hotel scene sky |
| Cream (paper / windows) | **#F7F6F0** | window panes, light text on dark sections, back-pill bg #F5F3F0 |
| Beige (buildings / interiors) | **#EDEBDA** / #EDEADA | hotel facade, house facade |
| Ink (text) | **#29210C** | all dark text; cloud outlines #282209 |
| Cloud fill | #E4E4E4 | the pollution clouds |
| Mid sky | #6EA3E2 | cloud scene, house-exterior sky |
| Olive (dark rooms) | #40450A | "feel…" section, house door, interior |
| Pill border / pill text | #373532 | back pill |

**Against our brief's tokens:**

| Brief token | Brief value | Reference | Decision |
|---|---|---|---|
| `--sky` | #CDD8F5 | #CCD9F8 | keep **#CDD8F5** (ΔE ≈ 1, reads identical; ours is a hair warmer) |
| `--line` | #1A27B8 | #0E27B6 | adjust to **#0E27B6**. The reference's cobalt is deeper and is what makes it sing. |
| `--cream` | #EDEADB | #EDEBDA | keep **#EDEADB** (matches) |
| `--cloud` | #F8F6F1 | #F7F6F0 | keep (matches) |
| `--text` | #2A2118 | #29210C | adjust to **#29210C**. The reference ink is olive-warm, not brown-warm. |

Contrast (WCAG): ink on sky 11.3:1, ink on cream 13.2:1, cobalt on sky 7.5:1,
cream on cobalt 9.8:1. ⚠ The reference's cream text on #6EA3E2 is **2.42:1 and fails AA**;
we won't use that pairing.

---

## 4. Line work and pixel grammar

- **Clouds:** 240×137 source, 2–3 px outline in ink #282209, flat #E4E4E4 fill, transparent
  outside. **No shading, no highlights, no gradients.** Edges are clean 1-px stair-steps.
- **Buildings (hotel, house):** cobalt outline about 4–5 display px, flat beige fill. The
  hotel gets depth from a **slim left side face** (a narrow parallelogram strip down one
  side, outline only). That is the only depth cue in the whole zine, and it's the device our
  brief asks for.
- **Windows:** cobalt 2×2 mullion grid, cream panes. One window has a tiny pixel face in it.
  "A person behind a window" is the strongest emotional image on the page.
- **House door / arch:** pure stair-stepped arcs at large scale (each step ≈ 8–10 display px),
  flat olive on beige. The arch and the roof diagonal are visibly stepped even at full-screen
  zoom. The pixel grid is held *on purpose* at large scale.
- **Path:** a single thick cobalt curve, pixel-stepped, about 6 px.
- **Icons:** 1-bit, about 3 px strokes at 48–64 px, single color via `currentColor`.
- Only some elements are "pixel": photographic halftone pieces (phone, laptop) sit alongside
  them. Our brief is stricter (everything pixel), which will read more unified.

---

## 5. Scroll mechanics

All pinning is sticky-in-tall-parent. Measured stages (desktop):

| Stage | Parent height | Pinned element | What happens while pinned |
|---|---|---|---|
| Hero | 1 screen | — | Stack of 5 retro "windows" (cream panes, double cobalt rule, ✕ box, 4 px hard drop-shadow). "Scroll ☟" hint in mono at bottom center. |
| Icons + intro | 1.4 screens | none | Pixel icons and two centered sentences scroll naturally. |
| Essay + phone | 1.7 screens | **right column** (phone) sticky | Left column of left-aligned 40 px paragraphs scrolls past while the phone image stays. Scroll progress **cracks the phone** (image swap scrubbed by scroll). |
| "feel…" | 3 screens | text sticky | Olive field. Sentence pinned, then 4 retro dialog windows ("Connected instead of distracted?") pop in, then the next sentence. |
| Clouds | 1.75 screens | none | Sky #6EA3E2, statement + mono hint, then ~15 draggable clouds with labels. |
| Laptop | 2 screens | text sticky | Laptop with blinking cursor, then the next line. |
| Hotel | 3.8 screens | the long hotel image scrolls **under** a sticky text block | Camera "travels" down a tall building. Clouds overlap the facade. Text appears beside the face-in-window. |
| "Digital home" | 5.2 screens | icon sticky | Pixel house icon stays as statements scroll over it, then fades to 40% as text takes over. |
| House | 5.2 screens | house sticky (z 2), content sticky | Scroll-driven **zoom**: a full-screen arched door, then a house facade (roof, round window, two windows, door), then through the door into an olive interior. This is the zine's biggest "camera move". |
| Furniture | inside the house stage | — | Interior with cream furniture silhouettes; interaction (below). |
| Visitors | 1 screen | — | Cobalt field with pairs of pixel eyes, text bottom-right. |
| Path | 4 screens | none | A cobalt line winds down a beige page; text and small icons sit in its bends. |
| Folders | 1 screen | — | Four stacks of retro folders, draggable. |
| Footer | 1 screen | — | "Keep reading" + icon + credits. |

**Parallax:** measured transforms on every animated layer at two scroll positions in the
hotel and house stages. Everything moved **exactly 1:1 with scroll** (Δtop = Δscroll).
**There is no layered parallax.** All motion is (a) sticky stages with scroll-scrubbed
reveals, swaps and zooms, and (b) in-view entrance animations (fade/scale-in, about 0.4–0.6 s,
gentle ease, no bounce). Our parallax clouds are an addition. Keep them slow so they stay
in the same register.

**Pacing:** a single idea per screen. Most text-only beats are exactly 100vh tall with the
sentence vertically centered and nothing else. **Empty screens of pure color** (olive,
cobalt, periwinkle) act as breaths between ideas.

---

## 6. Interactions and affordance

| Interaction | Desktop | Mobile | Affordance signal |
|---|---|---|---|
| Drag clouds away | Framer drag, `cursor: grab`, `touch-action: none`; clouds move freely, no snap, no physics bounce | **Not draggable.** Clouds stack vertically in a column and simply scroll (`cursor/touch-action: auto`) | 16 px JetBrains Mono hint in cream ("Drag the clouds away"), centered under the statement. No pill, no icon, no animation. |
| Arrange furniture | Drag each silhouette; dragging **fades in a hidden label** (opacity 0 → 1) beneath where it sat (e.g. "Photos", "Hobbies") | **Tap** instead of drag (hint copy changes to "Tap to discover…"); portrait re-layout of the same furniture | Hint is a small cream sticky-note with 12 px mono text placed *inside the scene* like an object. |
| Drag folders | `cursor: grab`; folders re-stack | Folders stacked vertically, still draggable | 12 px mono "Drag the folders around to read them". |
| Hover | Only a cursor change (`grab` / `pointer`). **No wobble or hover animation** was observed. | — | — |
| Menu | 20×20 "+" square, top-right, 2 px border, fixed. Opens a full-screen list of the zine's pages (20 px BDO, current page in cobalt) + credits. | Same | — |
| Back | Pill, bottom-left, fixed: 16 px from left, ~16 px from bottom, 81×33, bg #F5F3F0, 1 px #373532 border, radius 32 px, padding 7/10/6, "← Nabiu" in Libre Baskerville Italic 14 px. Always visible on every background. | Same | — |

Takeaways for us:
- Hints are **tiny, typographic, and inside the composition**. Never toasts, never modals.
  This matches our "one-word italic-serif hint" rule (we use the serif for hints instead of mono).
- Interactions are **optional and never block scroll**. You can ignore every one of them.
- Mobile **swaps the interaction verb** (drag → tap) instead of forcing desktop gestures
  onto touch. Our press-and-hold and scrub verbs are already touch-native, so we keep them
  on mobile with bigger targets.

---

## 7. Mobile vs desktop

The mobile site is a real **recomposition**, not a scale-down:

- Every stage is re-staged for portrait. Clouds become a single column. The hotel crops to
  the full height of the building with the side face kept. Furniture re-arranges into a
  tall stack (pendant lamp, stool, frames, shelf, lamp, chair, plant, sofa, table). Folders
  stack top to bottom.
- Type steps down about 30% (32 → 22 px body, 64 → 32 px title) but tracking and line-height
  ratios stay the same.
- Fewer pins: 5 sticky stages on mobile vs 10 on desktop. Several desktop pins become plain
  flow on mobile, so the page shortens from 37 to 29 screens.
- `100vh` = 844 used for stage heights (they used `vh`, not `dvh`). Our brief asks for
  `svh`/`dvh`, which fixes the URL-bar jump the reference is exposed to.
- Chrome (back pill, + menu) is identical on both.

---

## 8. Spacing, whitespace, copy placement

- Big margins: 64 px inner padding on text frames (desktop), about 16–24 px gutters on mobile.
- Copy sits in **empty sky or empty wall**. On the hotel, text is in the sky beside the
  building. In the essay pin, text is in its own column and the art has its own. In the
  house, text sits on the roofline or inside the dark door arch, never over detail.
- Hints sit about 1–2 line-heights below the statement they belong to.
- The one element that overlaps the art is a label *on* an object (cloud text, folder
  labels). The text belongs to the object.

---

## 9. What we take vs what we leave

**Take (feel):** native scroll + sticky stages; one idea per screen; flat 4–5-color palette
with cobalt as the single line color; stair-stepped edges held at large zoom; a slim side
face as the only depth; tiny in-scene hints; full-screen color "breaths"; recomposed mobile;
minimal fixed chrome (back pill bottom-left, square menu top-right).

**Leave:** every asset, icon, illustration and sentence; the photographic halftone pieces;
the mono typeface as a narrative voice (we use the italic serif for UI); and the
low-contrast cream-on-#6EA3E2 pairing.
