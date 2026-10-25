# GutenKu design polish — spec

Source: three design audits (home and shell; haiku and blog; GutenGuess, 404
and theming), a comparison with the previous production design, and the two
approved previews (`gutenku_redesign_preview_first_visit`,
`gutenku_redesign_preview_all_pages`). Polish of the current Ex Libris
design, not a redesign: DESIGN.md stays the authority.

## Kept on purpose (user decisions)

- The red underline under the active nav item stays.
- The hero illustration stays a background watermark (no repositioning).
- The canvas card keeps its book credit: it is the shareable output, and a
  raster can't follow the page's redaction state.

## Wave 1 — fixes and hierarchy

1. **Daily slip (home).** Order: label "Today's haiku · {date}" first, then
   the title as a quiet line (`0.875rem`, weight 400, `--gk-ink-soft`), then
   the verses at `clamp(1.375rem, 2.2vw, 1.75rem)`, line-height 1.55,
   letter-spacing -0.025em. The AI reading is folded behind its toggle on the
   home page. Phones (≤600px): verses `clamp(1rem, 4.4vw, 1.125rem)`, indents
   0.9em / 0.45em, a wrapped verse hangs (continuation indented 1.25em).
2. **Haiku page poem fits its verses.** Font size follows the longest verse
   so the poem stays three lines: `clamp(1.125rem, calc(100cqi /
(var(--verse-ch) * 0.6 + 2.4)), 2.25rem)`; phone indents 1ch / 0.5ch.
   Phones: the sources fold behind "Sources · {n}" so Craft Haiku shows
   without scrolling.
3. **Haiku page readouts.** No "~0s": the ETA shows only when > 0. The
   running score is labelled "best {n}" on the 0–100 integer scale the
   Quality Score card uses. The book of the current haiku is shown as
   "▬▬▬" in the stats panel's book list until the reader reveals it.
4. **Dark mode.** The primary key gets its own fill: `--gk-indigo-fill:
oklch(0.42 0.05 205)` with `--gk-on-indigo-fill: oklch(0.95 0.01 85)`;
   `--gk-indigo` (0.76) stays for links and chevrons. One cover filter token
   `--gk-cover-filter` (light `none`, dark `brightness(0.72) sepia(0.18)`)
   used by every book cover and preview card.
5. **Theme.** First visit follows the system preference (`'auto'`).
   Reduced motion: the theme switch is a 200ms opacity cross-fade (no
   spread), never an instant flash.
6. **Blog.** The hero image's alt and caption describe the image (a man at a
   laptop in a maze). Body images get `margin-block: 2rem`. Phones: the
   back-to-top key sits at `bottom: calc(1rem + env(safe-area-inset-bottom))`
   and hides while scrolling down, shows on scroll up.
7. **404.** The haiku moves to the locales (`notFound.haiku`, three lines,
   en/fr/ja). In dark mode the plate is padded `0.75rem` and tilted -1.5deg.
8. **GutenGuess sound key.** In the game header, before help: one key with
   the constant label "Sound", `aria-pressed` = sound on, icon
   `VolumeX`/`Volume2`, tooltip "Turn sound on/off". Removed from the help
   panel.
9. **GutenGuess board.**
   - A miss is a red ✕ stamp pressed on the cover (bottom-left) plus the
     existing strike; the cover goes `grayscale(0.8)`. The set-aside action
     is a borderless glyph (`--gk-ink-soft`, opacity 0.7 on touch, 44px hit
     area kept).
   - A selected book lifts (`translateY(-2px)` + `--gk-lift`); keyboard
     focus keeps the plain ring.
   - The count reads "{n} on the shelf · {m} tried" after a miss.
   - Clues: "Need help?" sits at the right end of the Clues rule; the
     "Helpers cost points" line goes. The emoji helper reads "Tap a ? to
     reveal it · −2 pts"; each ? tile is labelled "Reveal emoji {n} of
     {total}, costs 2 points"; "emoji" everywhere (not "emoticon").
     Revealed emoji sit in the same 44px framed tile as the ?.
   - Tablet (601–900px): wide clue cards `flex: 2 1 13rem`, others
     `flex: 1 1 7rem` (no orphan card).
   - Stats with no game played: one line "Your first colophon will be filed
     here." instead of zeros; the free first haiku isn't counted as a reveal.

## Wave 2 — craft

1. **No faked type.** `font-synthesis: none` on `html`. Bold renders as a
   typewriter overstrike: `font-weight: 400; text-shadow: 0.045em 0 0
currentColor`. The hero accent "haiku" is not italic (vermilion only).
2. **Red restraint.** `::selection` uses `--gk-stamp-wash` with inherited
   text colour.
3. **The poem leads the haiku page.** Redaction bars at
   `color-mix(in oklch, var(--gk-ink) 78%, transparent)`; the chapter opens
   compacted (untouched paragraphs folded to "· · ·"). While crafting, the
   latest candidate replaces the verses on the leaf at opacity 0.55
   (120ms cross-fade); the floating crafting card goes, its `aria-live` text
   stays.

## Wave 3 — signature moments

All once per session per page (the existing `data-gk-entered` gate on home),
never blocking input, only transform/opacity/clip-path/filter. Reduced
motion: each is a 150ms opacity fade.

1. **Home entrance (~1.3s).** Header rule draws (scaleX, 360ms); the title
   types per character (22ms stagger, 60ms `steps(2)`, 90ms pause at the
   line break; the h1 keeps its full text as accessible name); the red
   "haiku" stamps at ~860ms (scale 1.08→1, rotate -2deg→0, blur 1.5px→0,
   220ms); verses ink in (clip-path, 380ms, 140ms stagger from 900ms); the
   GK seal presses at 1240ms (scale 1.18→0.97→1, 260ms); the count ticks up
   40 over 800ms from 1000ms. `ENTRANCE_MS` becomes 1300.
2. **Home daily hook.** The GutenGuess key shows today's free emoji clues
   small: "Play No. {n} · today: {emoji}".
3. **Haiku page.** A finished craft presses the GK seal on the leaf (scale
   1.08→1, 180ms) — crafted haiku only, never the daily one. Revealing the
   hidden title peels the marker left to right (clip-path, 320ms).
4. **GutenGuess.** The miss stamp lands on the stamp's impact frame (252ms):
   scale 1.15→1, rotate -8deg, blur 1.5px→0, 420ms. Narrowing the shelf
   fades the removed covers down 4px with a 30ms stagger capped at 300ms.
5. **Blog.** Each article ends with a colophon: a rule draws, the GK seal
   presses, then "No. {roman} · set in JMH Typewriter · {date}".
