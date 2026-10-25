# GutenKu Design Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the three waves of the design audit (fixes and hierarchy, craft, signature moments) across home, haiku, GutenGuess, blog, 404 and dark mode, without changing the Ex Libris identity.

**Architecture:** Mostly scoped SCSS and template changes in existing Vue SFCs, plus a few small pure helpers (verse fitting, title typing, shelf count, puzzle teaser) that carry unit tests. Tokens go in `exlibris.scss`. GutenGuess changes live in the private submodule and are committed there first, then the submodule pointer in the host repo. Motion is CSS keyframes gated by the existing `data-gk-entered` / reduced-motion rules; no new animation library.

**Tech Stack:** Vue 3 + Vite + vite-ssg, Pinia, vue-i18n (en/fr/ja), SCSS, Vitest + @vue/test-utils, Cypress + cypress-axe. Run tools with `mise exec --` and package-local `./node_modules/.bin/*`.

**Spec:** `docs/superpowers/specs/2026-10-25-design-polish.md`

## Global Constraints

- DESIGN.md is the authority: JMH Typewriter only, paper/ink/indigo/stamp tokens (`--gk-*`), never raw hex in components.
- Kept on purpose: red underline on the active nav item; hero illustration as background watermark; book credit on the canvas card.
- Animate only `transform`, `opacity`, `clip-path`, `filter`. Every moment has a reduced-motion variant: a 150ms opacity fade.
- Entrance moments never block input and play once per session (home uses `data-gk-entered`; `ENTRANCE_MS = 1300`).
- Copy: "haiku" (never "haikus"), "emoji" (never "emoticon") in UI strings; every new string in en, fr and ja.
- Accessible names come from visible text (WCAG 2.5.3); no `aria-label` that drifts from the label shown.
- Touch targets ≥ 44px; focus rings visible (2px indigo).
- Never trigger paid AI in tests or manual checks (no AI toggles, no AI themes).
- Commits: conventional, short, lower case, no co-author line. Submodule commits first, then `chore(game): update gutenguess` in the host.
- Lint must stay at 0 errors (`oxlint`, `stylelint`), and no `oxlint-disable` comments (the repo forbids them).

## Review Focus

1. **Second visit in the same session:** no entrance replays on home, haiku or blog; the page is instantly usable. (Task 16 test.)
2. **Reduced motion:** every moment collapses to a 150ms fade, including the theme switch, which must not hard-flash. (Tasks 5 and 16 tests.)
3. **Japanese and French:** the typed title splits graphemes, not UTF-16 units, and long French verses still fit three lines on a 375px phone. (Tasks 2 and 16 tests.)
4. **Screen readers:** the typed h1 still announces the full title once; the sound key announces "Sound, toggle button, pressed/not pressed"; the redacted title isn't read out. (Tasks 8, 16 and 4 tests.)
5. **Returning GutenGuess players with saved games:** restored misses show the stamp without replaying the animation, and a saved narrowed shelf keeps its count wording. (Tasks 9 and 12 tests.)

---

## Phase 1 — Wave 1: fixes and hierarchy

### Task 1: Daily slip hierarchy and phone verses

**Files:**

- Modify: `packages/front/src/features/haiku/components/DailyHaikuSlip.vue` (template header row; SCSS `&__title` ~581, `&__lines` ~589, `&__line` ~598, `&__label` ~788, `@media (max-width: 600px)` ~564/612)
- Modify: `packages/front/src/views/Home.vue` (pass `fold-reading`)
- Test: `packages/front/tests/unit/features/haiku/components/daily-haiku-slip.test.ts`

**Interfaces:**

- Produces: prop `foldReading?: boolean` (default `false`) on `DailyHaikuSlip`; class `.daily-slip__head` wrapping label + date above the title.

- [ ] **Step 1: Write failing tests** in `daily-haiku-slip.test.ts`: `it('names itself before the title')` asserts `.daily-slip__head` precedes `.daily-slip__title` in DOM order; `it('folds the reading when asked')` mounts with `foldReading: true` and asserts `.daily-slip__reading-text` is absent while the reading toggle is present.
- [ ] **Step 2: Run** `cd packages/front && mise exec -- ./node_modules/.bin/vitest run tests/unit/features/haiku/components/daily-haiku-slip.test.ts` — Expected: 2 FAIL.
- [ ] **Step 3: Implement** the head row and `foldReading`; apply the spec's sizes (title `0.875rem`/400/`--gk-ink-soft`; lines `clamp(1.375rem, 2.2vw, 1.75rem)`, `line-height: 1.55`, `letter-spacing: -0.025em`; phone lines `clamp(1rem, 4.4vw, 1.125rem)`, `--indent` 0.9em/0.45em, hanging wrap `padding-left: calc(var(--indent, 0em) + 1.25em); text-indent: -1.25em`). `Home.vue` passes `fold-reading`.
- [ ] **Step 4: Run** the same test — Expected: PASS. Then check 375px in the browser: each verse is one line for today's haiku.
- [ ] **Step 5: Commit** `feat(home): lead the daily slip with its haiku`

### Task 2: Haiku page poem fits its verses; sources fold on phones

**Files:**

- Create: `packages/front/src/features/haiku/composables/verse-fit.ts`
- Modify: `packages/front/src/features/haiku/components/HaikuPoem.vue` (`&__verses` ~195, `&__sources` ~317, phone blocks ~222/326)
- Test: `packages/front/tests/unit/features/haiku/composables/verse-fit.test.ts`

**Interfaces:**

- Produces: `longestVerseLength(verses: readonly string[]): number` — counts graphemes (`Intl.Segmenter`), returns 0 for an empty list.

- [ ] **Step 1: Write failing tests:** `longestVerseLength(['a b', 'abcd'])` → 4; `longestVerseLength([])` → 0; `longestVerseLength(['古い池や'])` → 4; `longestVerseLength(['Rising upon that motion'])` → 23; French with accents `longestVerseLength(['Élevée sur ce mouvement'])` → 23 (combining marks count once).
- [ ] **Step 2: Run** `mise exec -- ./node_modules/.bin/vitest run tests/unit/features/haiku/composables/verse-fit.test.ts` — Expected: FAIL (module missing).
- [ ] **Step 3: Implement** the helper; in `HaikuPoem.vue` bind `--verse-ch` to it and set `&__verses { font-size: clamp(1.125rem, calc(100cqi / (var(--verse-ch) * 0.6 + 2.4)), 2.25rem) }`, phone indents `1ch`/`0.5ch`; below 600px wrap sources in a disclosure button "Sources · {n}" (`haiku.poem.sourcesToggle` in en/fr/ja) that controls the list (`aria-expanded`).
- [ ] **Step 4: Run** the test — PASS; browser at 375 and 768: today's verses never wrap, Craft Haiku visible without scrolling at 375×812.
- [ ] **Step 5: Commit** `feat(haiku): fit the poem to its verses and fold sources on phones`

### Task 3: Dark-mode key fill and one cover filter

**Files:**

- Modify: `packages/front/src/assets/css/exlibris.scss` (light tokens ~17–29, `[data-theme='dark']` ~100–119)
- Modify: `packages/front/src/core/components/ui/ZenButton.vue` (cta background/colour)
- Modify: `packages/front/src/core/components/ui/PreviewCard.vue:129`
- Modify (submodule): `private/gutenguess/packages/front/components/BookCard.vue:340`, `GuessConfirmModal.vue:180`

**Interfaces:**

- Produces: tokens `--gk-indigo-fill`, `--gk-on-indigo-fill` (light: same as `--gk-indigo`/`--gk-on-indigo`; dark: `oklch(0.42 0.05 205)` / `oklch(0.95 0.01 85)`), `--gk-cover-filter` (light `none`; dark `brightness(0.72) sepia(0.18)`).

- [ ] **Step 1: Add the tokens**; make `.zen-btn--cta` use `--gk-indigo-fill`/`--gk-on-indigo-fill`; replace the three hard-coded cover filters with `filter: var(--gk-cover-filter)`.
- [ ] **Step 2: Verify** in the browser (dark): computed `background-color` of "Write a haiku" equals `oklch(0.42 0.05 205)`; axe colour-contrast passes on `/` and `/game` (`cypress run --spec cypress/e2e/accessibility.cy.ts`) — Expected: all pass.
- [ ] **Step 3: Commit** (submodule first) `style(game): share the cover filter token`, then host `style(theme): deepen the dark key and share the cover filter`

### Task 4: Haiku page readouts and the redacted title

**Files:**

- Modify: `packages/front/src/features/haiku/components/ToolbarPanel.vue` (~398 ETA, `&__progress-score`)
- Modify: `packages/front/src/features/haiku/components/StatsPanel.vue` (~88 books list)
- Test: `packages/front/tests/unit/features/haiku/components/stats-panel.test.ts` (create), `tests/unit/features/haiku/components/toolbar-panel.test.ts` (create if absent)

**Interfaces:**

- Consumes: haiku store `haiku.book.title` and the chapter's revealed state (`blackMarker` in `HaikuChapter.vue`; expose it from the store as `titleRevealed: Ref<boolean>`, set by the chapter's toggle).
- Produces: store field `titleRevealed`.

- [ ] **Step 1: Write failing tests:** StatsPanel lists the current book as `▬▬▬` while `titleRevealed` is false and by name once true; ToolbarPanel shows no ETA text when `estimatedTimeLeft` is 0 and renders "best 11" (label `toolbar.bestScore`) for a best score of 11.2.
- [ ] **Step 2: Run** both tests — FAIL.
- [ ] **Step 3: Implement** `titleRevealed` in the store (reset on each new haiku), the redaction in StatsPanel, the ETA guard (`estimatedTimeLeft > 0`) and the labelled integer score; add `toolbar.bestScore` ("best {score}") in en/fr/ja.
- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Commit** `fix(haiku): keep the hidden title hidden and clarify progress`

### Task 5: Theme follows the system; gentle switch under reduced motion

**Files:**

- Modify: `packages/front/src/core/composables/theme.ts:76`, `packages/front/index.html` (inline script ~17–30)
- Modify: `packages/front/src/core/composables/view-transition.ts` (`supportsViewTransition` ~27)
- Modify: `packages/front/src/assets/css/main.scss` (reduced-motion view-transition block)
- Test: `tests/unit/core/composables/theme.behaviour.test.ts`, `tests/unit/core/composables/view-transition.test.ts`

**Interfaces:**

- Produces: `supportsViewTransition(kind: 'page' | 'theme'): boolean` — under reduced motion returns `true` for `'theme'`, `false` for `'page'`.

- [ ] **Step 1: Write failing tests:** with no stored preference and `prefers-color-scheme: dark`, the initial theme is dark; under `prefers-reduced-motion: reduce`, `supportsViewTransition('theme')` is true and `('page')` false; a theme change under reduced motion runs a transition without the spread (`data-gk-vt-spread` absent).
- [ ] **Step 2: Run** both test files — FAIL.
- [ ] **Step 3: Implement** `initialValue: 'auto'` (and the same default in `index.html`), the `kind` parameter, and in `main.scss` scope reduced-motion `animation: none` to `html[data-gk-vt='page']`, adding `html[data-gk-vt='theme']::view-transition-old(root)` / `-new(root)` 200ms opacity fades.
- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Commit** `feat(theme): follow the system and fade under reduced motion`

### Task 6: Blog tidy-up

**Files:**

- Modify: `packages/front/content/2026-01-18-gutenku-technical-deep-dive.en.md` and `.fr.md` (hero alt + caption)
- Modify: `packages/front/src/features/blog/views/BlogArticle.vue` (`.prose` images; `&__back-to-top` ~1124)
- Test: `packages/front/cypress/e2e/blog.cy.ts`

- [ ] **Step 1: Write failing Cypress test** `it('keeps back to top clear of the text on phones')`: at `iphone-x`, after scrolling down then up 200px, `.blog-article__back-to-top` is visible and its `bottom` ≥ 16px; while scrolling down it is not visible.
- [ ] **Step 2: Run** `mise exec -- ./node_modules/.bin/cypress run --config baseUrl=http://localhost:4444 --spec cypress/e2e/blog.cy.ts` — FAIL.
- [ ] **Step 3: Implement** the caption/alt text ("A man at a laptop inside a maze" and its fr equivalent), `.prose > :deep(img), .prose > :deep(p > img) { margin-block: 2rem }`, and the phone back-to-top behaviour (hide on scroll down, show on scroll up, 8px y + opacity over 160ms `--gk-ease-out`).
- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Commit** `fix(blog): honest caption, image spacing and a polite back to top`

### Task 7: 404 haiku in the locales; dark plate

**Files:**

- Modify: `packages/front/src/views/NotFound.vue` (~11 `haikuLines`, plate styles)
- Modify: `packages/front/src/locales/{en,fr,ja}.json` (`notFound.haiku`: array of 3 strings)
- Test: `packages/front/tests/unit/views/not-found.test.ts` (create)

- [ ] **Step 1: Write failing test:** with locale `fr`, the page renders the three `notFound.haiku` lines from the fr messages.
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** `tm('notFound.haiku')`; move the current English lines to en and write fr/ja versions; dark plate `padding: 0.75rem; transform: rotate(-1.5deg)`.
- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Commit** `feat(404): translate the lost-leaf haiku`

### Task 8: GutenGuess sound key in the header (submodule)

**Files:**

- Modify: `private/gutenguess/packages/front/components/GameHeader.vue` (~156 `.header-row--actions`, imports ~5)
- Modify: `private/gutenguess/packages/front/components/GameHelp.vue` (~24, ~130–140: remove the sound button)
- Modify: `private/gutenguess/packages/front/locales/{en,fr,ja}.json` (`game.sound`, `game.soundTooltipOn`, `game.soundTooltipOff`; drop `game.soundOn/soundOff` if unused)
- Modify: host `packages/front/src/core/components/icons/ink/{paths,index}.ts` if `Volume2`/`VolumeX` are missing (hand-drawn, same primitives)
- Test: `private/gutenguess/packages/front/tests/unit/components/game-header.test.ts` (create)

**Interfaces:**

- Consumes: `useAudioFeedback(): { isMuted: Ref<boolean>, toggleMute(): void }`.

- [ ] **Step 1: Write failing tests:** the header has a button named "Sound" with `aria-pressed="false"` when muted; clicking it calls `toggleMute` and the name stays "Sound"; GameHelp no longer renders a sound button.
- [ ] **Step 2: Run** `cd private/gutenguess/packages/front && mise exec -- ./node_modules/.bin/vitest run tests/unit/components/game-header.test.ts` — FAIL.
- [ ] **Step 3: Implement** the key before help (`ZenTooltip` + `ZenButton variant="text" size="sm" class="action-btn"`, icon `.action-icon`), constant label, `aria-pressed="!isMuted"`.
- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Commit** (submodule) `feat(game): put the sound key back in the header`

### Task 9: GutenGuess board — miss stamp, set-aside glyph, selection lift

**Files:**

- Modify: `private/gutenguess/packages/front/components/BookCard.vue` (~240 wrong state, `.book-card__action-btn`, `.book-card--selected`)
- Test: `private/gutenguess/packages/front/tests/unit/components/book-card.test.ts` (create or extend)

**Interfaces:**

- Consumes: host `InkStamp` (`size`, `tilt`, `label` props).
- Produces: `.book-card__miss-stamp` element rendered for `state === 'wrong'`.

- [ ] **Step 1: Write failing tests:** `state: 'wrong'` renders `.book-card__miss-stamp` with label "✕"; `state: 'normal'` does not; mounting already wrong does not add the live-transition class (no replay for restored games).
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** the stamp (InkStamp size 30, tilt -8, bottom-left), cover `grayscale(0.8)` when wrong, borderless set-aside glyph (`--gk-ink-soft`, opacity 0.7 on touch, keep the 44px `::before`), selection `translateY(-2px)` + `box-shadow: var(--gk-lift)` while focus keeps the ring.
- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Commit** (submodule) `feat(game): stamp a miss on its cover`

### Task 10: GutenGuess clues — copy, labels, tablet grid, help placement

**Files:**

- Modify: `private/gutenguess/packages/front/components/HintPanel.vue` (~246 `.clue-row__item`, help link, helper line)
- Modify: `private/gutenguess/packages/front/components/GameHint.vue` (? tile labels, revealed tile frame)
- Modify: `private/gutenguess/packages/front/locales/{en,fr,ja}.json` (`emoticon` → `emoji` in UI strings; `game.helpers.revealEmoji`: "Tap a ? to reveal it · −2 pts"; `game.helpers.revealEmojiLabel`: "Reveal emoji {n} of {total}, costs 2 points")
- Test: `private/gutenguess/packages/front/tests/unit/components/game-hint.test.ts`

- [ ] **Step 1: Write failing tests:** three ? tiles carry distinct labels "Reveal emoji 1 of 3…", "…2 of 3…", "…3 of 3…"; the helper text equals the new copy.
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** labels and copy; revealed tiles share the 44px box with `border: 1px solid var(--gk-ink-faint)`; move "Need help?" to the right end of the Clues rule and drop the "Helpers cost points" line; tablet `@media (min-width: 601px) and (max-width: 900px)` wide cards `flex: 2 1 13rem`, others `flex: 1 1 7rem`.
- [ ] **Step 4: Run** — PASS; browser at 768: no orphan card.
- [ ] **Step 5: Commit** (submodule) `fix(game): clearer clue helpers and tablet grid`

### Task 11: GutenGuess stats first-run state

**Files:**

- Modify: `private/gutenguess/packages/front/components/GameStats.vue` (~46, ~132)
- Modify: locales (`game.stats.empty`: "Your first colophon will be filed here.")
- Test: `private/gutenguess/packages/front/tests/unit/components/game-stats.test.ts`

- [ ] **Step 1: Write failing tests:** with `gamesPlayed: 0`, the counters and distribution are absent and the empty line shows; with one free haiku shown, "Haiku reveals" reads 0.
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** the empty state and exclude the free first haiku from `haikuRevealsThisGame` display.
- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Commit** (submodule) `feat(game): a first-run line for stats`

### Task 12: GutenGuess shelf count after a miss

**Files:**

- Create: `private/gutenguess/packages/front/store/game-store-count.ts`
- Modify: the component that renders "{n} books" (find with `git grep -n "booksCount\|shelfCount" private/gutenguess/packages/front`)
- Modify: locales (`game.shelf.count`: "{n} on the shelf", `game.shelf.countTried`: "{n} on the shelf · {m} tried")
- Test: `private/gutenguess/packages/front/tests/unit/store/game-store-count.test.ts`

**Interfaces:**

- Produces: `shelfCount(available: number, guesses: readonly { correct: boolean }[]): { onShelf: number; tried: number }`.

- [ ] **Step 1: Write failing tests:** `shelfCount(50, [])` → `{ onShelf: 50, tried: 0 }`; `shelfCount(50, [{ correct: false }])` → `{ onShelf: 50, tried: 1 }`; a restored narrowed shelf `shelfCount(30, [{correct:false},{correct:false}])` → `{ onShelf: 30, tried: 2 }`.
- [ ] **Step 2: Run** — FAIL. **Step 3: Implement** and render "{n} on the shelf · {m} tried" when `tried > 0`. **Step 4: Run** — PASS.
- [ ] **Step 5: Commit** (submodule) `fix(game): say how many books were tried`, then host `chore(game): update gutenguess`

## Phase 2 — Wave 2: craft

### Task 13: Honest type and red restraint

**Files:**

- Modify: `packages/front/src/assets/css/main.scss` (`html`, `strong, b, .is-bold`)
- Modify: `packages/front/src/assets/css/exlibris.scss:157` (`::selection`)
- Modify: `packages/front/src/views/Home.vue` (`.home__title-accent`)

- [ ] **Step 1: Implement** `html { font-synthesis: none }`; `strong, b, .is-bold { font-weight: 400; text-shadow: 0.045em 0 0 currentColor }` (and drop `font-weight: 700` from component styles that set it, found with `git grep -n "font-weight: 700" packages/front/src private/gutenguess/packages/front`); `.home__title-accent { font-style: normal }`; `::selection { background: var(--gk-stamp-wash); color: inherit }`.
- [ ] **Step 2: Verify** in the browser: `document.fonts` still lists only JMH Typewriter, bold labels show the overstrike, no italic glyph in the hero; stylelint passes.
- [ ] **Step 3: Commit** `style(type): drop faked bold and italic`

### Task 14: The poem leads the haiku page

**Files:**

- Modify: `packages/front/src/features/haiku/components/HaikuChapter.vue` (bars colour, default `isCompacted`, remove `.crafting-messages-teleported`)
- Modify: `packages/front/src/features/haiku/components/HaikuPoem.vue` (candidate while generating)
- Test: `tests/unit/features/haiku/components/haiku-chapter.test.ts`, `haiku-poem.test.ts` (create if absent)

**Interfaces:**

- Consumes: store `isGenerating`, `craftingMessages[0].verses`.

- [ ] **Step 1: Write failing tests:** the chapter mounts compacted; while `isGenerating`, HaikuPoem renders the latest candidate's verses with class `haiku-poem__verses--draft`; an `aria-live` region still announces the candidate; no element with class `crafting-messages-teleported` exists.
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** bars at `color-mix(in oklch, var(--gk-ink) 78%, transparent)`, compacted default, draft verses at opacity 0.55 with a 120ms ease-out cross-fade, and remove the teleported card.
- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Commit** `feat(haiku): let the poem lead the page`

## Phase 3 — Wave 3: signature moments

### Task 15: Home daily hook (today's free emoji on the GutenGuess key)

**Files:**

- Create: `packages/front/src/features/game-stub/teaser.ts` (host build) and the matching export in the submodule store if the game build provides it
- Modify: `packages/front/src/views/Home.vue` (~47 `puzzleNumber`, ~53 `playLabel`)
- Test: `tests/unit/views/home-teaser.test.ts`

**Interfaces:**

- Produces: `formatTeaser(emoticons: string | null, visible: number): string` — first `visible` graphemes joined by a space, `''` when null; the home key reads `Play No. {n} · today: {teaser}` when the teaser is non-empty.

- [ ] **Step 1: Write failing tests:** `formatTeaser('⚖️✝️🏛️', 2)` → `'⚖️ ✝️'`; `formatTeaser(null, 2)` → `''`; the home key omits "· today:" when the teaser is empty.
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** the helper and read the emoji already free to every player (`BASE_VISIBLE_EMOTICONS`) from the game store's puzzle when present; no extra request on home when the game is disabled.
- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Commit** `feat(home): tease today's GutenGuess emoji`

### Task 16: Home entrance sequence

**Files:**

- Create: `packages/front/src/core/composables/typed-title.ts`
- Modify: `packages/front/src/views/Home.vue` (~66–100 entrance script, `ENTRANCE_MS`, title markup, `.home__count`)
- Modify: `packages/front/src/features/haiku/components/DailyHaikuSlip.vue` (verse ink and seal press keyed on `:root:not([data-gk-entered])`)
- Test: `tests/unit/core/composables/typed-title.test.ts`, `tests/unit/views/home-entrance.test.ts`

**Interfaces:**

- Produces: `typedGlyphs(text: string, { start: number; step: number; lineBreakPause: number }): { glyph: string; delay: number; lineBreak: boolean }[]` — grapheme-split, delays in ms.

- [ ] **Step 1: Write failing tests:** `typedGlyphs('Classic books,\nnew ', { start: 200, step: 22, lineBreakPause: 90 })` returns 19 glyphs, first delay 200, a `lineBreak` entry, and the first glyph after it delayed by an extra 90; Japanese `'古典の名作から、'` yields 8 glyphs; the h1 has `aria-label` equal to the full title and its glyph spans are `aria-hidden`; with `data-gk-entered` set, no `.is-entering` class is applied (second visit).
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** the helper, the typed title, the header rule draw (scaleX 360ms), the stamped accent (from 860ms: scale 1.08→1, rotate -2deg→0, blur 1.5px→0, 220ms `cubic-bezier(.2,.9,.3,1.15)`), verse ink (clip-path 380ms, 140ms stagger from 900ms), seal press at 1240ms (260ms, `--gk-ease-pop`), count tick (+40 over 800ms from 1000ms, via `core/composables/animated-counter.ts`), `ENTRANCE_MS = 1300`, and the reduced-motion 150ms fade.
- [ ] **Step 4: Run** — PASS; browser: first load shows the sequence, reload in the same tab doesn't; with reduced motion it's a fade.
- [ ] **Step 5: Commit** `feat(home): an entrance that types and stamps`

### Task 17: Haiku page moments — craft seal and title peel

**Files:**

- Modify: `packages/front/src/features/haiku/components/HaikuPoem.vue` (seal on a crafted haiku)
- Modify: `packages/front/src/features/haiku/components/HaikuChapter.vue` / `MarkerOverlay.vue` (peel on reveal)
- Test: `tests/unit/features/haiku/components/haiku-poem.test.ts`

- [ ] **Step 1: Write failing tests:** after a craft completes (`isDailyHaiku` false), the seal gets `.haiku-poem__seal--press`; for the daily haiku it doesn't.
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** the press (scale 1.08→1, 180ms `cubic-bezier(.23,1,.32,1)`) and the peel (`clip-path: inset(0)` → `inset(0 0 0 100%)`, 320ms ease-in-out), both with the reduced-motion fade.
- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Commit** `feat(haiku): seal a finished craft and peel the marker`

### Task 18: GutenGuess moments — miss stamp landing and shelf narrowing

**Files:**

- Modify: `private/gutenguess/packages/front/components/BookCard.vue` (stamp keyframes on the live transition only)
- Modify: `private/gutenguess/packages/front/components/BookBoard.vue` (narrowing stagger)
- Test: `private/gutenguess/packages/front/tests/unit/components/book-board.test.ts`

- [ ] **Step 1: Write failing tests:** narrowing from 50 to 30 marks exactly 20 covers `.book-card--leaving` with `--leave-delay` values capped at 300ms; a restored wrong card has no landing class.
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** the stamp landing at the 252ms impact frame (scale 1.15→1, rotate -8deg, blur 1.5px→0, 420ms `cubic-bezier(.23,1,.32,1)`) and the leave (opacity → 0, translateY 4px, 30ms stagger capped at 300ms), with reduced-motion fades.
- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Commit** (submodule) `feat(game): land the miss stamp and narrow with a stagger`, then host `chore(game): update gutenguess`

### Task 19: Blog colophon

**Files:**

- Create: `packages/front/src/features/blog/components/ArticleColophon.vue`
- Create: `packages/front/src/core/utils/roman.ts` (if the host has none; the game's `composables/roman.ts` is in the submodule)
- Modify: `packages/front/src/features/blog/views/BlogArticle.vue` (after the share row)
- Test: `tests/unit/features/blog/components/article-colophon.test.ts`

**Interfaces:**

- Produces: `toRoman(n: number): string`; `<ArticleColophon :issue="number" :date="string" />`.

- [ ] **Step 1: Write failing tests:** `toRoman(12)` → `'XII'`; the colophon renders "No. XII · set in JMH Typewriter · 18 January 2026" for issue 12 and that date in en, and a seal element.
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** the component (rule draw, seal press, then the line; reduced-motion fade) with `blog.colophon` strings in en/fr/ja.
- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Commit** `feat(blog): end each article with a colophon`

### Task 20: Whole-site verification

- [ ] **Step 1:** `mise exec -- ./node_modules/.bin/oxlint` at the root — Expected: 0 errors. `stylelint` in `packages/front` — Expected: exit 0.
- [ ] **Step 2:** typecheck and unit tests: front (`vue-tsc --noEmit`, `vitest run`), server (`tsc --noEmit`, `vitest run`), GutenGuess front (`vue-tsc --noEmit`, `vitest run`) — Expected: all pass.
- [ ] **Step 3:** `cypress run --config baseUrl=http://localhost:4444` — Expected: all specs pass, including `accessibility.cy.ts` (light and dark).
- [ ] **Step 4:** browser pass at 1440, 1280, 768 and 375, light and dark, reduced motion, on `/`, `/haiku`, `/game`, `/blog`, an article and a 404: compare with the two approved previews.
- [ ] **Step 5:** `vite-ssg build` in `packages/front` — Expected: exit 0.
