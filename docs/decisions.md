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
