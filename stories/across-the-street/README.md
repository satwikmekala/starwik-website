# Across the Street

A scroll-told, illustrated story. Every drawing is authored as code on a logical pixel grid and
compiled to crisp, stair-stepped pixels. Framework-free TypeScript with GSAP ScrollTrigger and
native scroll, mounted inside the thoughts archive's "Across the Street" card.

## View it

```bash
npm run dev
```

| URL | What |
|---|---|
| `/thoughts` → the "across the street" card | opens the story (server-rendered) |
| `/thoughts/sunday-morning` | the story |
| `/thoughts/sunday-morning?story=old` | the previous article version of the thought |
| `/thoughts/sunday-morning?story=specimen` | the visual system: tokens with a live `--distress` slider, type, every drawing |

The title and every line of the story are in the first HTML; the engine loads afterwards and adopts it.

## Scripts

```bash
npm run story:art     # compile src/art/** → src/art/generated/sprites(-late).json
npm run story:beats   # validate content/beats.json (≤5 words & ≤30 chars a line, ≤6 lines a beat, dialogue verbatim)
npm run story:og      # redraw public/stories/across-the-street/og.png
npm run story:fonts   # re-subset the OFL fonts (needs: python3 -m pip install fonttools brotli)
```

QA (optional, any local Chrome, plus `npm i -D playwright-core axe-core` or `npx -p` them):
`CHROME_PATH=… node stories/across-the-street/scripts/qa/{shots,interact,axe}.mjs` writes
`docs/screens/**` and prints a ✓/✗ report for every interaction.

## Structure

```
stories/across-the-street/
  content/beats.json        ALL on-screen text (story copy and UI labels). Edit here.
  src/direction.ts          staging per beat: shot, who stands where, palette, interactions
  src/art/                  one file per drawing (sofa.ts, rug.ts, man.ts, …)
    lib/raster.ts           cell rasteriser: rect / oval / poly / line / stamp, uniform outline
    lib/figure.ts           THE shared character template (Marcus and the man)
    lib/paths.ts            greedy rect merge → one SVG path per ink
    index.ts                registry (CORE = first screen, LATE = loaded after first paint)
    generated/              compiler output, never edit
  src/scenes/flat.ts        compositions: desktop world, mobile flat, mobile street
  src/engine/
    mount.ts                entry: mountStory(element, { view }) → { destroy }
    story.ts                sticky stage + step track, scroll → T, frame loop, camera, actors
    markup.ts               the story's HTML as a pure string (server-renderable)
    state.ts                beat timeline: state is a pure function of reading position
    renderer.ts             canvas renderer (logical px, Path2D cache, beam, stain, people)
    camera.ts               whole-device-pixel fits and eased moves
    interactions.ts         board nudge, mug, door, scrub, phone, press-and-hold
    dissolve.ts             the coat → particles, a pure function of hold progress
    palette.ts              calm ↔ dead colours mixed in OKLab for the canvas
    specimen.ts, chrome.ts, credits.ts, copy.ts, sunbeam.ts, svg.ts, fit.ts, layout.ts
  src/styles/tokens.css     the two token sets + --distress, contrast notes
  src/styles/story.css      everything scoped under [data-ats]
  fonts/source/             official OFL sources + OFL.txt (served subsets live in public/)
  scripts/                  compile-art, check-beats, og-image, subset-fonts, qa/*
  meta.ts                   page metadata + OG image, ready to wire at the swap
```

Host files (outside this folder): `app/thoughts/_components/AcrossTheStreetStory.tsx` (client
mount), `AcrossTheStreetSSR.tsx` (server-rendered mount), and the flag in `ThoughtsExperience.tsx`.

## Edit the words

Everything you read lives in `content/beats.json`:

```json
{ "id": "kn-07", "source": [7, 8], "kind": "dialogue",
  "lines": ["Marcus glanced down.", "“It's coffee.”", "A short laugh.", "“Of course it is.”"] }
```

- `lines` are the visual line breaks: at most 5 words and 30 characters each, at most 6 lines.
- `kind`: `prose`, `dialogue`, or `thought` (inner voice, set in the italic serif; wrap in `*…*`).
- Dialogue must stay verbatim with `content/thoughts/03-sunday-morning.ts`. Run
  `npm run story:beats`; it points at the line that drifted.
- `breathe: true` adds a pause after the beat. `hint: "drag" | "tap" | "scrub" | "hold"` marks the
  beat whose interaction shows its one-word hint.
- Add or remove beats freely. Staging is keyed by id in `src/direction.ts`, and a beat without an
  entry inherits the previous beat's shot, positions and colours.
- UI strings (back pill, menu, hints, screen-reader announcements, credits) are under `ui`.

## Add or edit a drawing

1. Create `src/art/kettle.ts`:

   ```ts
   import { sprite } from './lib/sprite.ts'
   export default sprite('kettle', 20, 18, 'a kettle on the hob', {
     base: (r) => {
       r.solid(r.mask().round(2, 4, 16, 14, 4), 'cloud')      // body, uniform outline
       r.box(14, 7, 6, 4, null)                                 // spout
       r.stamp(7, 0, ['.bbbb.', 'b....b'])                      // handle, hand-drawn cells
     },
   })
   ```

   Inks are `line cream cloud sky text coffee berry`, which are CSS tokens, so the Stain palette
   recolours the drawing for free. `r.solid()` gives every shape the same 2-px outline
   (`LINE_WEIGHT` in `palette.ts`). Curves and diagonals snap to whole cells, so they're always
   stair-stepped. Stamp chars: `b c w s k o r` (`.` is transparent).
2. Register it in `src/art/index.ts` (CORE if chapter 1 needs it, otherwise LATE).
3. Place it in a composition in `src/scenes/flat.ts`, or draw it as an actor from `story.ts`.
4. `npm run story:art`, then check it on the specimen page.

Characters are `figure.ts` calls. To change both Marcus and the man at once (head, hair, eyes),
edit `head()`. That sameness is the point.

## Credits

Original drawings, code and adaptation. Third-party pieces, all credited in-story on the credits
page:

- **BDO Grotesk**, © 2020 The BDO Grotesk Project Authors (Deni Anggara / Lokal Container),
  SIL OFL 1.1. Licence at `public/stories/across-the-street/fonts/BDO-Grotesk-OFL.txt`.
- **Instrument Serif**, © 2022 The Instrument Serif Project Authors (Rodrigo Fuenzalida, Jordan
  Egstad), SIL OFL 1.1. Licence at `public/stories/across-the-street/fonts/Instrument-Serif-OFL.txt`.
- **GSAP + ScrollTrigger**, GreenSock / Webflow, GSAP Standard "No Charge" License.
- Technique references only: pix2svg (MIT) rect merging; Shaw's "vector pixels" notes. The
  feel is inspired by the Digital Home Zine (Nabiu Studio), with no assets or copy reused.

See `docs/reference-notes.md`, `docs/research.md`, `docs/decisions.md`.
