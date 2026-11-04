---
name: GutenKu
description: A leaf from a well-kept library book, typewritten, ruled in ink and stamped.
colors:
  paper: '#f5efe3'
  paper-raised: '#f9f5ec'
  paper-deep: '#ece4d6'
  paper-edge: '#d9cdb9'
  ink: '#27221f'
  ink-soft: '#5d544c'
  ink-faint: 'rgb(39 34 31 / 0.16)'
  indigo: '#264348'
  indigo-edge: 'color-mix(in oklch, #264348, black 35%)'
  on-indigo: '#f8f4ec'
  stamp: '#bc2d29'
  on-stamp: '#f8f4ec'
  stamp-wash: 'rgb(188 45 41 / 0.09)'
  scrim: 'rgb(39 34 31 / 0.45)'
typography:
  display:
    fontFamily: "'JMH Typewriter', monospace"
    fontSize: 'clamp(2.75rem, 7vw, 4.75rem)'
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: '-0.05em'
  headline:
    fontFamily: "'JMH Typewriter', monospace"
    fontSize: 'clamp(2rem, 5.5vw, 3rem)'
    fontWeight: 400
    lineHeight: 1
    letterSpacing: '-0.035em'
  poem:
    fontFamily: "'JMH Typewriter', monospace"
    fontSize: 'clamp(1.375rem, 3.4vw, 2.25rem)'
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: '-0.025em'
  title:
    fontFamily: "'JMH Typewriter', monospace"
    fontSize: '1.125rem'
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "'JMH Typewriter', monospace"
    fontSize: '0.9375rem'
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'JMH Typewriter', monospace"
    fontSize: '0.6875rem'
    fontWeight: 700
    letterSpacing: '0.14em'
rounded:
  control: '3px'
  paper: '4px'
  stamp: '17%'
spacing:
  '1': '0.25rem'
  '2': '0.5rem'
  '3': '0.75rem'
  '4': '1rem'
  '5': '1.25rem'
  '6': '1.5rem'
  '8': '2rem'
  '12': '3rem'
components:
  button-primary:
    backgroundColor: '{colors.indigo}'
    textColor: '{colors.on-indigo}'
    typography: '{typography.title}'
    rounded: '{rounded.control}'
    padding: '0.75rem 1.375rem'
    height: '2.75rem'
  button-ghost:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    rounded: '{rounded.control}'
    padding: '0.5rem 0.875rem'
    height: '2.75rem'
  button-ghost-hover:
    backgroundColor: '{colors.ink-faint}'
  button-text:
    backgroundColor: 'transparent'
    textColor: '{colors.ink-soft}'
    rounded: '{rounded.control}'
    padding: '0.5rem'
    height: '2.75rem'
  button-text-hover:
    backgroundColor: '{colors.ink-faint}'
    textColor: '{colors.ink}'
  card:
    backgroundColor: '{colors.paper-raised}'
    textColor: '{colors.ink}'
    rounded: '{rounded.paper}'
  chip:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    rounded: '{rounded.control}'
    padding: '0.25rem 0.625rem'
    height: '1.75rem'
  tooltip:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.paper}'
    rounded: '{rounded.control}'
    padding: '0.4375rem 0.625rem'
  modal:
    backgroundColor: '{colors.paper-raised}'
    textColor: '{colors.ink}'
    rounded: '{rounded.paper}'
    padding: '1.5rem'
  toast:
    backgroundColor: '{colors.paper-raised}'
    textColor: '{colors.ink}'
    rounded: '{rounded.paper}'
    padding: '0.875rem 0.5rem 0.75rem 1rem'
  select-trigger:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    height: '2.75rem'
    padding: '0.375rem 0'
  switch-on:
    backgroundColor: '{colors.indigo}'
    textColor: '{colors.on-indigo}'
    rounded: '{rounded.control}'
    width: '48px'
    height: '28px'
  nav-item:
    textColor: '{colors.ink-soft}'
    height: '2.75rem'
    padding: '0.75rem 0'
  nav-item-active:
    textColor: '{colors.ink}'
---

# Design System: GutenKu

## Overview

**Creative North Star: "Ex Libris"**

Every page is a leaf from a well-kept library book: typewritten, ruled in ink, stamped. The surface is warm paper and never pure white. Text and structure are sumi ink. One indigo marks whatever you can press, and one vermilion stamp ink marks verdicts and the GK monogram. Delight comes from craft (a stamp pressed onto the page, a quill writing a line, a drop of ink struck through) and never from confetti, glow or bounce.

The density is that of a printed page: one focal point per view (the board, the poem, the article), generous space between sections, and quieter material such as meta, colophons and footers pushed back in ink-soft. Structure comes from ruled lines rather than boxes: 1.5px ink rules, dashed faint rules, brush-rule section dividers, and a 3px double rule around a colophon. Paper sheets sit on the page with a single lift shadow. There is no glass, no blur, no gradient fill.

The Japanese side lives where it means something: the sumi-e mountains, the haiku, the traditional pigment values (sumi-iro, ai-iro, ginshu). The audience is mostly Western, so kanji and Japanese emblems are never used as decoration. The night theme is dark sumi paper with gofun-white ink and a warmer vermilion, tuned value by value and never inverted.

**Key Characteristics:**

- Paper, ink, indigo, vermilion. No secondary or tertiary accent.
- One typeface, JMH Typewriter, with hierarchy from scale, weight and tracking.
- 1.5px ink rules for structure and 3px double rules for colophons.
- Flat paper with one lift shadow. No glass, blur or halos.
- Small square-ish corners: 4px paper, 3px controls. No pills.
- Signature marks: the GK rubber stamp, brush rules, ink-drop tries, torn clue slips, the ruled colophon with a "Stamped" box, and the vertical page spine.
- Motion only marks a change of state: ease-out, 600ms or less, with a reduced-motion fallback every time.

## Colors

A four-pigment library palette on warm paper. Values follow traditional Japanese pigments and are retuned for the night theme.

### Primary

- **Ai-iro Indigo** (`indigo`): only on things you can press. That covers the primary button fill, the switch "on" track, the slider fill and thumb, the select check mark, footer and article links, and every focus ring (2px outline, 3px offset). Its darker **Indigo Edge** (`indigo-edge`) is the 2px bottom edge under a pressable indigo surface. Text on indigo uses **On-Indigo** (`on-indigo`). Night: `oklch(0.76 0.045 205)` on `oklch(0.2 0.01 70)`.

### Verdict

- **Ginshu Vermilion** (`stamp`): verdict and identity ink, under 5% of any page. Used for the GK monogram stamp, the stamp pressed on a result, spent ink-drop strikes, malus counts, the 3px "new" bar on a clue slip, the 3px mark on a toast, the 7px active-link mark in the nav, the spine dot, error icons, `::selection`, and one italic word in the home display headline. **Stamp Wash** (`stamp-wash`) is its 9% tint for a just-unlocked surface. Text on vermilion uses **On-Stamp** (`on-stamp`). Night: `oklch(0.66 0.16 28)`, wash at 14%.

There is no secondary or tertiary accent. Vermilion is a verdict ink, not a second accent: it never marks something pressable and never decorates.

### Neutral

- **Paper** (`paper`): the page itself, the spine background and the article sheet. Night: `oklch(0.215 0.01 70)`.
- **Raised Paper** (`paper-raised`): sheets resting on the page, such as cards, modals, toasts, clue slips and dropdowns. Night: `oklch(0.245 0.011 70)`.
- **Deep Paper** (`paper-deep`): recessed or aged areas. In the night theme it is also the app background. Night: `oklch(0.175 0.01 70)`.
- **Paper Edge** (`paper-edge`): the 1px edge line inside the lift shadow. Night: `oklch(0.32 0.012 70)`.
- **Sumi Ink** (`ink`): body text, headings, 1.5px structural rules, double rules, ghost-button rings, tooltips (inverted). Night (gofun white): `oklch(0.92 0.012 85)`.
- **Soft Ink** (`ink-soft`): meta, labels, inactive nav items, captions, close icons. Night: `oklch(0.76 0.015 80)`.
- **Faint Ink** (`ink-faint`): 16% ink for hairlines, dashed rules, chip rings, hover washes and scrollbars. Night: `oklch(0.92 0.012 85 / 0.16)`.
- **Sumi Scrim** (`scrim`): the dimmed page behind a modal. There is no blur. Night: `oklch(0.1 0.01 70 / 0.65)`.

### Named Rules

**The Press-Me Rule.** Indigo means "press me". If it is indigo, it is interactive. If it is not interactive, it is not indigo. Indigo is never decorative.

**The One Stamp Rule.** Vermilion means "verdict" or "GutenKu". It covers under 5% of a page and is never used as a decorative accent. A second accent colour is never added.

**The Never-White Rule.** Surfaces are paper. The lightest value in the system is Raised Paper. Pure `#fff` never appears.

## Typography

**Display Font:** JMH Typewriter (with `monospace`)
**Body Font:** JMH Typewriter (with `monospace`)
**Label/Mono Font:** JMH Typewriter

**Character:** a single typewriter face does all the work, like a page typed on one machine. Large sizes run at regular weight with negative tracking so headlines feel set rather than shouted. Small labels go bold, uppercase and widely tracked, like the fields printed on a library card.

### Hierarchy

- **Display** (400, `clamp(2.75rem, 7vw, 4.75rem)`, 0.9, -0.05em): the home headline. One italic word may take vermilion.
- **Headline** (400, `clamp(2rem, 5.5vw, 3rem)`, 1, -0.035em, balanced wrap, max 20ch): article titles. Result and first-run sheet titles use the same register at fixed sizes (2rem on mobile results, 2.875rem on desktop results, and 2–2.125rem for first-run sheets).
- **Poem** (400, `clamp(1.375rem, 3.4vw, 2.25rem)`, 1.45, -0.025em): haiku verses.
- **Title** (700, 1.125rem): card and list-item titles.
- **Body** (400, 0.9375–1rem, 1.6–1.7): running text. Article measure is 62ch, and lead paragraphs are capped at 40ch.
- **Label** (700, 0.6875rem, 0.1–0.16em, uppercase): field names on colophons, clue-slip kinds and select group headers. Brush-rule labels use 0.8125rem at 0.12em, and the spine title uses 0.75rem at 0.32em, set vertically.
- **Numerals**: tabular (`font-variant-numeric: tabular-nums`) wherever numbers count, including scores, chips, colophon values and the spine page number.

### Named Rules

**The One Machine Rule.** JMH Typewriter is the only face. Hierarchy comes from scale, weight and tracking, never from a second family. (OpenDyslexic is the only override, and only through the accessibility preference.)

**The Meta-Below Rule.** Meta sits under a title, never above it. No eyebrow or kicker labels go above headings. Uppercase labels are reserved for field names inside a ruled structure (colophon, slip, select group, brush rule).

## Layout

Each page is a single column of sheets centred on paper, sized by content. The home page is a 1.2fr / 1fr two-column spread, capped at 1120px with gaps of 2rem by 3rem. Below 1100px it collapses to one column capped at 720px. The game board is capped at 900px, the footer at 64rem, and article prose at 62ch. Side padding is 1.75rem on desktop, 1–1.125rem at 600px and below, and 0.5rem for the board on small phones.

From 1024px up, a fixed 64px **spine** runs down the left edge (`--gk-spine-width`). It carries the page name vertically, a vermilion dot at the top and the page number at the foot, separated from the page by a 1.5px ink rule. The layout reserves that width so the spine never covers content. Below 1024px the spine is hidden.

The spacing rhythm works in quarter-rem steps (0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3rem). Sections are separated generously (ma), and the nav, footer and meta stay compact. Breakpoints in use are 480px (colophon stacks, type steps), 600px (padding and toasts go full width), 768px (nav spacing), 1024px (spine) and 1100px (home spread). Touch targets are at least 44px, extended through `::before` hit areas on small controls.

## Elevation & Depth

The system is flat paper. Depth comes from one shadow, ruled lines and tonal paper steps (deep, paper, raised). Every sheet that rests on the page (card, modal, toast, clue slip, dropdown, article sheet) uses the same lift. Nothing glows, floats or blurs.

### Shadow Vocabulary

- **Lift** (`box-shadow: 0 1px 0 var(--gk-paper-edge), 0 18px 34px -22px oklch(0.3 0.03 60 / 0.45)`; night: `... 0 18px 34px -20px oklch(0 0 0 / 0.7)`): the only elevation. It is a 1px paper edge plus a soft, tight drop.
- **Pressable edge** (`box-shadow: 0 2px 0 var(--gk-indigo-edge)`, reduced to `0 1px 0` while pressed): a solid ledge under indigo controls (primary button, slider thumb). It reads as a printed block, not as elevation.
- **Inset rings** (`inset 0 0 0 1.5px var(--gk-ink)` or `var(--gk-ink-faint)`): the outlines of ghost buttons, chips, switch tracks, locked slips and dropdowns.

### Named Rules

**The Single Lift Rule.** There is one elevation value. If a surface needs more presence, give it a rule or a stamp, not a bigger shadow.

**The No-Glass Rule.** There is no `backdrop-filter` and no translucency over content. Overlays use the sumi scrim.

## Shapes

Corners are barely softened, like trimmed paper: 4px for sheets (`rounded.paper`) and 3px for controls (`rounded.control`). The stamp is a rounded square at 17%. Pills and fully rounded rectangles are not used. The only organic shapes are ink: drops and the slider thumb use an irregular blob radius (`52% 48% 46% 54% / 58% 56% 44% 42%`, varied per nth-child), and the spine dot is a circle. Rules are lines, not boxes. They are 1.5px solid ink (`--gk-rule`), 1px dashed faint ink (`--gk-rule-faint`), or a 3px double rule around a colophon. Clue slips have a torn foot, made with a repeating radial mask.

Icons come from the in-house hand-drawn ink set (`@/core/components/icons/ink`). Every icon uses a single 1.75 stroke width.

## Components

### Buttons

Flat pigment with a short press, never lift-and-glow.

- **Shape:** control corners (3px), minimum height 44px, minimum width 44px when icon-only.
- **Primary:** an indigo fill with on-indigo text, bold, 0.9375rem, a 2px indigo-edge underneath. Hover darkens the indigo by 8%. Active moves it 1px down at scale 0.98 and shrinks the edge to 1px, over 120ms ease-out.
- **Ghost:** a 1.5px inset ink ring on bare paper with ink text. Hover adds a faint-ink wash.
- **Text:** soft-ink text with no ring. Hover switches to ink with a faint-ink wash.
- **Focus:** 2px indigo outline at a 3px offset, on every interactive element.
- **Sizes:** sm (0.8125rem), md (default), lg (1rem, 48px tall).

### Chips

- **Style:** a small typed label inside a ruled box, never a pill. It is transparent with a 1.5px faint-ink inset ring, bold, tabular, tracked 0.04em, in mixed case.
- **State:** the accent variant swaps the ring to full ink, and muted switches the text to ink-soft.

### Cards / Containers

- **Corner Style:** paper (4px).
- **Background:** Raised Paper.
- **Shadow Strategy:** Lift only (see Elevation).
- **Border:** none. Forced-colors mode adds a 1px CanvasText border.
- **Internal Padding:** set per variant. A busy card dims to 0.72 opacity and never shows its own spinner.

### Inputs / Fields

- **Select:** a bare field with a 1.5px faint-ink underline that turns full ink on hover or when open. It has a 44px minimum height and an optional uppercase label above the value. Its dropdown is a raised-paper sheet with a 1.5px ink ring plus lift, 44px options, faint-ink highlight, bold selected option and an indigo check.
- **Switch:** a 48×28 control-radius track with a 1.5px ink ring. The "on" state fills indigo, and the knob is an ink square that turns on-indigo.
- **Slider:** a 2px faint-ink stroke with an indigo fill. The thumb is an indigo ink blob with a 2px indigo-edge.
- **Preference keys (InkPrefs):** small typed keys with a 1.5px faint-ink border. Pressed keys (`aria-pressed`) invert to ink fill with paper text.

### Navigation

- **Style:** a table of contents. The wordmark sits at the left (1.25–1.375rem, regular, with a soft-ink suffix), followed by numbered items in soft ink (0.8125–0.875rem) over a dashed faint-ink bottom rule.
- **Active:** the item turns ink, and a 7px vermilion mark sits under it. The mark slides between links through a view transition (240ms, ease-out, disabled under reduced motion).
- **Footer:** compact soft-ink links at 0.8125rem, with indigo for outbound links.

### Modal, Toast, Tooltip

- **Modal:** a raised-paper sheet with paper corners and lift, padded 1.5rem, over the sumi scrim. Header and actions are separated by 1.5px ink rules. Entry takes 240ms with a hair of scale and no overshoot, and exit takes 180ms.
- **Toast:** a raised-paper sheet with lift and a 3px top mark (vermilion for verdicts and errors, ink for info). It never covers the board, and on mobile it goes full width.
- **Tooltip:** inverted ink with paper text and control corners, 0.8rem, with a hard edge.

### Stamp (InkStamp), the signature component

A rubber stamp in vermilion (or ink), filled or outlined, tilted by `--stamp-tilt` and sized through `--ink-stamp-size`. It carries the GK monogram, the puzzle number and verdicts. **Press:** 420ms ease-out, landing from scale 1.6 at −8° with full impact at 60% (scale 0.94) before it settles. Sound plays at the 60% frame. Under reduced motion it becomes a 200ms fade.

### Ink Primitives

- **Brush Rule:** a section divider made of two 8px brush strokes at 50% opacity, with a bold, uppercase, 0.12em label between them. A stamp variant tints the strokes vermilion.
- **Ink Drops:** one blob per remaining try (12×13, ink-filled). A spent drop empties to a vermilion ring and is struck through with a vermilion stroke (200ms, 160ms delay).
- **Clue Slip:** a raised-paper index card with lift, a torn foot, an index number at the top right and an uppercase "kind" label. **New** slips get a 6% vermilion tint and a 3px vermilion top bar. **Locked** slips sit on bare paper inside a faint-ink ring.
- **Colophon Table:** the result page, set inside a 3px double ink rule. It is a two-column field/value list with uppercase soft-ink field names and tabular values, beside a 6.5rem "Stamped" box that holds the stamp, or a dashed, tilted empty seal after a loss. It stacks at 480px by default. Result sheets use a compact variant below 600px: repeated title/author rows are omitted, and a 3rem stamp sits beside the remaining fields in a 5.5rem column.
- **Pagination Dots:** small ink-blob outlines, filled in ink when active.
- **Spine:** see Layout.

### Loading

There is one site-wide loader: a writing quill (`InkLoadingIndicator` driven by `useInkLoading`), whose ink line writes in a loop. It leaves over 240ms ease-out, and its loop stops under reduced motion. Cards and panels never carry their own spinner. They dim instead.

### Motion

The ease-out curve is `cubic-bezier(0.23, 1, 0.32, 1)`. Durations are 120ms (press), 180ms (fast state change), 240ms (base: enter, slide) and 400ms (reward), and no animation runs longer than 600ms. Motion marks a change of state only. Every animation has a `prefers-reduced-motion` fallback, usually a short opacity fade or none.

## Do's and Don'ts

### Do:

- **Do** keep surfaces on paper: `paper` for the page, `paper-raised` for sheets.
- **Do** give structure with 1.5px ink rules, dashed faint rules, brush rules, and 3px double rules for colophons.
- **Do** use JMH Typewriter as the only face, with oversized tabular numerals and negative tracking on display sizes.
- **Do** reserve indigo for pressable things and use a 2px indigo focus ring at a 3px offset on every interactive element.
- **Do** reserve vermilion for stamps, verdicts and the GK monogram, under 5% of a page.
- **Do** use the shared primitives: brush rules, clue slips, ink drops, the ink strike for eliminated items, and the ruled colophon with a "Stamped" box.
- **Do** name each page on the spine at desktop width.
- **Do** keep the sumi-e mountains and the haiku as the Japanese voice.
- **Do** draw icons from the in-house ink set at a 1.75 stroke.
- **Do** use `--gk-*` tokens only. Legacy `--gutenku-*` tokens are aliases and should not be extended.
- **Do** keep touch targets at 44px or more and text contrast at 4.5:1 or better in both themes.

### Don't:

- **Don't** use pill badges or uppercase chips.
- **Don't** use gradients, glass, `backdrop-filter` blur, or soft rounded cards with halos.
- **Don't** use bouncy overshoot on entrances, or motion longer than 600ms.
- **Don't** show toasts that cover the board.
- **Don't** use emoji as icons or decoration. Bookmoji clues are game content, not UI.
- **Don't** add a second accent colour, and don't use indigo or vermilion decoratively.
- **Don't** use kanji or Japanese emblems as decoration.
- **Don't** put eyebrow or kicker labels above headings. Meta goes under the title.
- **Don't** add per-card or per-panel loaders. The site-wide quill is the only one.
- **Don't** use pure white surfaces, or invert colours for the night theme.
