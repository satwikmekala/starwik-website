# Decisions log: Across the Street

One line each: **decision**, then the reason.

## Process
- **Host edits to `ThoughtsExperience.tsx` and `package.json` stay uncommitted.** Both files already carry your unrelated uncommitted changes, and committing just my hunks isn't possible without touching yours.
- **`.claude/launch.json` gained a `nextdev-attach` entry and isn't committed.** A dev server was already running on :3000 and the preview attaches to it rather than killing it.
- **The source of truth for the story is `content/thoughts/03-sunday-morning.ts`.** There is no `content/story.md`.
- **"The Phone" and "Three Years" merge into one chapter, `the-phone`, titled "The Phone".** It gives the brief's seven chapters, and the beats validator maps `three-years` paragraphs onto it, offset by 22.

## Copy
- **`beats.json` holds copy only.** Ids, lines, source paragraph indexes, kind, breathe, and the beat where a hint appears. The chapter-1 `cue` fields were removed. All staging lives in `src/direction.ts`, keyed by beat id, and a new beat inherits the previous beat's staging. This keeps copy edits from breaking code.
- **When a sentence of dialogue runs past 5 words, it's split across lines**, never reworded. The validator re-joins lines before checking verbatim.
- **Long speeches that span beats follow the multi-paragraph quote convention.** The first beat has no closing quote and the next beat reopens with one. The validator checks each quoted chunk is a substring of the source.
- **Straight quotes in the source and curly quotes in the beats are treated as equal** by the validator.
- **Small trims of non-dialogue prose ("Another knock.", "No answer.") are allowed.** The brief asks for about 30% trimming of descriptive prose.

## Story mechanics
- **No interaction ever gates scrolling** (the reference never traps). Each interaction gives an earlier, personal response, and scrolling past applies the canonical outcome. The mug falls, the door opens, and the stain grows by scroll.
- **The scrub lock is on the second "Stop." beat ("Stop." / "I'm sorry." / "Don't." / "…stop his hand").** In the source, Marcus keeps scrubbing after the first "Stop.". The prose says the second one is what stops his hand.
- **If the reader scrolls past the end of The Window without completing the hold, the dissolve finishes on its own in about 3 s.** Otherwise the following beats would describe something that never happened. Completing the hold is still the intended path.
- **Interaction latches (mug fallen early, door opened early) reset if the reader scrolls back above that chapter.**

## Rendering
- **Story art is drawn to one low-res canvas per scene and scaled with `image-rendering: pixelated`.** The camera is a compositor `transform`. SVG `viewBox` animation re-rasterises roughly 3k rects every frame. The canvas redraws in about 1 ms and moves for free. The specimen and the OG image still use the SVG and PNG outputs of the same compiled data.
- **Camera shots snap to whole-device-pixel scales at rest and interpolate continuously only while moving.** That keeps pixels uneven only in motion.
- **The palette mixes in OKLab in JS, reading the calm and dead hexes from the CSS tokens once.** The canvas then needs no `getComputedStyle` per frame. CSS text and UI still interpolate through `color-mix()` on the same `--distress`.
- **Line weight is 2 logical px (about 4 CSS px at 1440).** It matches the reference's measured 4–5 px outline. 3 px at this grid density swallowed small props like the mug and tickets. One constant, `LINE_WEIGHT`, changes it everywhere.
- **Characters are front-facing and built by one `figure()` template.** Head, eyes and outline are shared. The man is the same call with coat, raised shoulders, tight jaw, tired eyes and a phone.
- **The lamp is kept on mobile but moved to the front-right corner,** the only free floor space in the portrait room.

## Staging and layout
- **Desktop close-ups get a flat paper column (the cloud colour, with a cobalt rule) behind the copy;** wide shots lay the copy on the room's open upper wall instead. Without the column, text in close-ups would sit over the scene. The reference does the same thing with its text column beside the art.
- **In wide shots the copy's left edge follows the room's inner wall,** so it never crosses the building outline.
- **The desktop cutaway runs off the top of the frame (no roof)** to free the upper wall for copy.
- **Lines never wrap: they're `nowrap` and the type is sized to the column.** The 5-word, 30-character, 6-line limits are enforced by `story:beats`. That fits a 360 px phone at 20 px and the six-line mobile sheet beside the back pill.
- **Mobile uses two canvases: the flat, and a portrait street view.** Street beats cross-fade between them. The docked old window is a live crop of the street canvas, so it shows the pacing man and the After states. It grows from window-only to window-and-pavement when the story looks at it, and hides while the full street view is up.
- **Mobile layout puts the window on the left and the door on the right,** which keeps the top-right free for the docked window.
- **Street figures use a 1-px line.** They're 26 cells tall and far away, and a 2-px line turns them into blots. Everything at room scale keeps the 2-px line.
- **The hallway glimpse uses 1-px perspective lines** (deep space inside a 46-cell doorway).
- **The man is the same `figure()` call as Marcus,** with coat, raised shoulders (neck 3 cells shorter), tight jaw, stubble, tired eyes (a cobalt bag under each eye) and the phone. In `relieved` and `younger` the phone is its own actor so it can fall silently.
- **Marcus's hold target is his hand on the man's shoulder.** It's at least 72 px, the hint sits below it rather than over the man's face, and the progress ring is an SVG stroke.
- **The board nudge is clamped to ±3 cells horizontally and ±2 vertically.** Nothing reacts, and hovered pieces wobble one cell on desktop only.
- **In After, Marcus stands by the table while the beam reaches the dried ring,** so he doesn't hide it.
- **The imagined coat pacing in After (af-09) is drawn at 40% opacity.** The 6-second linger silhouette is a still figure at 22%.

## Platform
- **The host sets `overflow-x: hidden` on html and body, which turns `<body>` into a scroll container and breaks `position: sticky`.** While the story is mounted (`html:has(body [data-ats][data-ats])`), both switch to `overflow-x: clip` (same look, no scroll container). `globals.css` is untouched.
- **The stage is `100lvh` and sticky; the steps and the mobile sheet use `svh`.** Showing or hiding the iOS toolbars never reflows the story or uncovers its edges. ScrollTrigger runs with `ignoreMobileResize`.
- **Layout is chosen in CSS media queries that mirror `layoutFor()`,** so server-rendered HTML is already in its final layout before any script runs (CLS 0).
- **Drag, scrub and hold targets use `touch-action: none`,** so a drag never scrolls the page. Hold buttons also disable callouts and text selection (an iOS long-press risk).
- **`?story=ats` stays a client-rendered preview.** `NEXT_PUBLIC_ATS_STORY=1` serves the story server-rendered through `AcrossTheStreetSSR` (the swap path). Without it, that branch is dead code and isn't bundled.
- **Flagged visits start fetching the story chunk during hydration,** and the fonts are preloaded with React's `preload()`, only when the flag is on.
- **The engine marks itself ready only after its first frame,** so the server-rendered title is never hidden and re-shown (that was costing an LCP entry).
- **Page metadata and the OG image are prepared in `stories/across-the-street/meta.ts` but not wired.** Route metadata can't depend on a query flag, and the default page has to stay unchanged until the swap.
- **QA uses Playwright and axe-core from outside the project.** No new dependencies were added to `package.json`; the only changes there are the `story:*` scripts.
