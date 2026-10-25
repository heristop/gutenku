<script lang="ts" setup>
import {
  computed,
  defineAsyncComponent,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useHead, useSeoMeta } from '@unhead/vue';
import { hasPageNavigated } from '@/core/composables/view-transition';
import { ArrowRight } from '@/core/components/icons/ink';
import { useGlobalStats } from '@/core/composables/global-stats';
import ZenButton from '@/core/components/ui/ZenButton.vue';
import InkStamp from '@/core/components/ink/InkStamp.vue';
import InkPlate from '@/core/components/ink/InkPlate.vue';
import PlateShelf from '@/core/components/ink/plates/PlateShelf.vue';
import {
  formatTeaser,
  playLabelKey,
  todaysFreeEmoji,
} from '@/core/composables/game-teaser';
import { GAME_ENABLED } from '@/features/game/config';
import { useGameStore } from '@/features/game/store/game';
import { SITE_URL } from '@/locales/config';

const DailyHaikuSlip = defineAsyncComponent(
  () => import('@/features/haiku/components/DailyHaikuSlip.vue'),
);

const { t } = useI18n();
const { globalStats, fetchGlobalStats, formatNumber } = useGlobalStats();

useSeoMeta({
  ogTitle: 'GutenKu - AI Haiku Generator & Literary Guessing Game',
  ogDescription:
    'Generate beautiful haikus from classic literature. Play GutenGuess - guess the book from emoji hints.',
  ogImage: `${SITE_URL}/og-image.png`,
  twitterImage: `${SITE_URL}/og-image.png`,
});

// The game module is optional (private submodule); its store exposes today's
// puzzle number, computed from the date even before the puzzle is fetched.
type PuzzleNumberSource = {
  puzzleNumber?: number | null;
  puzzle?: Parameters<typeof todaysFreeEmoji>[0];
};
const gameStoreFactory = useGameStore as unknown as
  | (() => PuzzleNumberSource)
  | null;
const gameStore =
  GAME_ENABLED && typeof gameStoreFactory === 'function'
    ? gameStoreFactory()
    : null;

const puzzleNumber = computed(() => {
  const value = gameStore?.puzzleNumber;

  return typeof value === 'number' && value > 0 ? value : null;
});

// The two emoji every player gets free, once a stored puzzle is today's.
// Read after mount: the stored game lives in this browser, not the prerender.
const FREE_EMOJI = 2;
const hasMounted = ref(false);
const teaser = computed(() =>
  hasMounted.value
    ? formatTeaser(
        todaysFreeEmoji(
          gameStore?.puzzle,
          new Date().toISOString().split('T')[0],
        ),
        FREE_EMOJI,
      )
    : '',
);

const playLabel = computed(() =>
  t(playLabelKey(puzzleNumber.value, teaser.value), {
    number: puzzleNumber.value,
    teaser: teaser.value,
  }),
);

const haikusCrafted = computed(() => globalStats.value.totalHaikusGenerated);

onMounted(() => {
  hasMounted.value = true;
  fetchGlobalStats();
});

// The entrance plays once per session, on a fresh load of the home page only.
// It is pure CSS so it starts with the prerendered page; <html data-gk-entered>
// switches it off. The head script sets that attribute before first paint on
// a reload, so a returning reader never sees the page jump.
const ENTRANCE_KEY = 'gk-home-entrance';
const ENTRANCE_MS = 900;

useHead({
  script: [
    {
      key: 'gk-home-entrance',
      tagPosition: 'head',
      innerHTML: `try{sessionStorage.getItem('${ENTRANCE_KEY}')&&document.documentElement.setAttribute('data-gk-entered','')}catch(e){}`,
    },
  ],
});

function markEntered(): void {
  document.documentElement.dataset.gkEntered = '';
}

// Whether this visit plays it (always false in the prerender)
let playEntrance = false;

if (!import.meta.env.SSR) {
  let seen = false;

  try {
    seen = sessionStorage.getItem(ENTRANCE_KEY) !== null;
    sessionStorage.setItem(ENTRANCE_KEY, '1');
  } catch {
    seen = true;
  }

  playEntrance = !seen && !hasPageNavigated();

  // Let it finish, then switch it off for later in-app visits
  const timer = playEntrance ? setTimeout(markEntered, ENTRANCE_MS) : undefined;

  if (!timer) {
    markEntered();
  }

  onBeforeUnmount(() => {
    clearTimeout(timer);
    markEntered();
  });
}
</script>

<template>
  <div class="home">
    <section class="home__hero" :aria-label="t('hero.ariaLabel')">
      <InkPlate
        class="home__frontispiece"
        src="/gutenmage-320.webp"
        srcset="/gutenmage-320.webp 320w, /gutenmage-640.webp 640w"
        sizes="(max-width: 600px) 340px, 640px"
        :width="320"
        :height="213"
        eager
      />
      <h1 class="home__title">
        <i18n-t keypath="home.hero.headline" tag="span" scope="global">
          <template #br><br /></template>
          <template #haiku>
            <em class="home__title-accent">{{
              t('home.hero.headlineHaiku')
            }}</em>
          </template>
        </i18n-t>
      </h1>

      <p class="home__lede">
        <i18n-t keypath="hero.description" tag="span" scope="global">
          <template #gutenku><strong>GutenKu</strong></template>
          <template #gutenguess><strong>GutenGuess</strong></template>
        </i18n-t>
      </p>

      <div class="home__actions">
        <ZenButton to="/haiku" size="lg" data-cy="home-write">
          {{ t('home.hero.write') }}
        </ZenButton>
        <ZenButton
          v-if="GAME_ENABLED"
          to="/game"
          variant="ghost"
          size="lg"
          data-cy="home-play"
        >
          {{ playLabel }}
        </ZenButton>
      </div>

      <!-- One sentence of fact; the count is the only emphasis -->
      <p class="home__colophon">
        <i18n-t
          v-if="haikusCrafted > 0"
          keypath="home.hero.colophonCount"
          tag="span"
          scope="global"
        >
          <template #count>
            <strong class="home__count">{{
              formatNumber(haikusCrafted)
            }}</strong>
          </template>
        </i18n-t>
        <span v-else>{{ t('home.hero.colophon') }}</span>
      </p>
    </section>

    <div class="home__entries">
      <DailyHaikuSlip fold-reading :entrance="playEntrance" />

      <RouterLink
        v-if="GAME_ENABLED"
        to="/game"
        class="home__entry"
        data-cy="home-game-entry"
      >
        <span class="home__entry-plate" aria-hidden="true">
          <InkPlate>
            <PlateShelf />
          </InkPlate>
          <InkStamp
            v-if="puzzleNumber"
            :label="String(puzzleNumber)"
            :size="40"
            :tilt="-8"
            stamp
            class="home__entry-stamp"
          />
        </span>
        <span class="home__entry-text">
          <h2 class="home__entry-title">GutenGuess</h2>
          <span class="home__entry-desc">
            {{ t('home.gameEntry.description') }}
          </span>
          <span v-if="puzzleNumber" class="sr-only">
            {{ t('home.gameEntry.numberLabel', { number: puzzleNumber }) }}
          </span>
        </span>
        <ArrowRight :size="20" class="home__entry-arrow" aria-hidden="true" />
      </RouterLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: 2rem 3rem;
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 1.5rem 1.75rem 3rem;
  color: var(--gk-ink);
  font-family: var(--gk-font);

  @media (max-width: 1100px) {
    grid-template-columns: minmax(0, 1fr);
    max-width: 720px;
    gap: 2.25rem;
  }

  @media (max-width: 600px) {
    padding: 1rem 1.125rem 2.5rem;
  }

  // Two columns: rows are the daily slip, then the GutenGuess entry; the gap
  // between them is the entries' own
  @media (min-width: 1101px) {
    row-gap: var(--gk-gutter);
  }

  > * {
    min-width: 0;
  }

  // The hero is one typographic column. GutenMage is printed faintly behind
  // its lower right corner, like a watermark in the paper: present, never in
  // the way of the words or the keys.
  &__hero {
    position: relative;
    isolation: isolate;
    container-type: inline-size;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto auto auto auto;
    // Rows keep their own height: when the entries column beside is taller,
    // the spare height falls below the colophon, never between the lines
    align-content: start;

    > * {
      position: relative;
      z-index: 1;
      grid-column: 1;
    }

    > .home__lede {
      grid-row: 2;
    }

    > .home__actions {
      grid-row: 3;
    }

    > .home__colophon {
      grid-row: 4;
    }

    // Two columns: title, lede and actions read as one block at their own
    // rhythm; the spare height falls before the colophon, which is set at the
    // foot, level with the bottom of the daily slip, like a page's colophon.
    @media (min-width: 1101px) {
      grid-row: 1;
      grid-column: 1;
      grid-template-rows: auto auto auto minmax(1.5rem, 1fr) auto;

      > .home__colophon {
        grid-row: 5;
        margin: 0;
        padding-top: 1rem;
        border-top: var(--gk-rule-faint);
      }
    }
  }

  // The watermark is the paper of the hero itself: GutenMage printed pale
  // behind the whole block, as tall as it, set to the right. Nothing in the
  // hero has to make room for it, in any language or at any width.
  &__frontispiece {
    position: absolute;
    inset: 0;
    z-index: 0;
    margin: 0;
    opacity: 0.12;
    pointer-events: none;
    user-select: none;

    :deep(.ink-plate__leaf) {
      height: 100%;
      padding: 0;
      background: none;
      box-shadow: none;
    }

    :deep(.ink-plate__leaf::after) {
      display: none;
    }

    // It fades out towards the text side, so the start of every line sits on
    // clean paper and the drawing shows through towards the right
    :deep(.ink-plate__img) {
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: right center;
      mask-image: linear-gradient(to right, transparent 8%, #000 55%);
    }

    // Phones: the column is narrow, so the drawing sits lower, behind the
    // keys and the colophon, where the lines are shortest
    @media (max-width: 600px) {
      opacity: 0.1;

      :deep(.ink-plate__img) {
        object-position: right bottom;
      }
    }
  }

  &__title {
    grid-row: 1;
    margin: 0.5rem 0 1.5rem;
    // Full measure: the headline keeps its two authored lines ("new haiku."
    // is ~6.4em)
    font-size: clamp(2.75rem, min(7vw, calc(100cqi / 6.4)), 4.75rem);
    font-weight: 400;
    line-height: 0.9;
    letter-spacing: -0.05em;
    color: var(--gk-ink);
    text-wrap: balance;
    overflow-wrap: break-word;
  }

  &__title-accent {
    display: inline-block;
    font-style: italic;
    color: var(--gk-stamp);
  }

  &__lede {
    max-width: 40ch;
    margin: 0 0 1.75rem;
    // 16px on phones: body text never drops under the legible floor there
    font-size: 1rem;

    @media (min-width: 601px) {
      font-size: 0.9375rem;
    }

    line-height: 1.7;
    color: var(--gk-ink-soft);

    strong {
      font-weight: 700;
      color: var(--gk-ink);
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;

    // Phones: the keys always stack, one under the other, the same at every
    // phone width; the right of the column stays free for the watermark
    @media (max-width: 600px) {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  &__colophon {
    margin: 1.5rem 0 0;
    font-size: 0.875rem;
    line-height: 1.6;
    color: var(--gk-ink-soft);

    // One line wherever the column fits it (~55ch); phones wrap naturally
    @media (min-width: 600px) {
      white-space: nowrap;
    }
  }

  &__count {
    font-weight: 700;
    color: var(--gk-ink);
    font-variant-numeric: tabular-nums;
  }

  &__entries {
    display: grid;
    // A track that cannot grow past the column, so no slip can push the page wide
    grid-template-columns: minmax(0, 1fr);
    gap: var(--gk-gutter);
    align-content: start;

    // Two columns: the entries join the page grid, so the hero shares its row
    // with the daily slip alone and ends level with it; the GutenGuess entry
    // follows in the next row
    @media (min-width: 1101px) {
      display: contents;

      > :first-child {
        grid-column: 2;
        grid-row: 1;
      }

      > :nth-child(2) {
        grid-column: 2;
        grid-row: 2;
      }
    }
  }

  &__entry {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 1rem;
    align-items: center;
    min-height: 5.5rem;
    padding: 1.125rem;
    background: var(--gk-paper-raised);
    border-radius: var(--gk-radius-paper);
    box-shadow: var(--gk-lift);
    color: var(--gk-ink);
    text-decoration: none;
    transition: transform var(--gk-dur-press) var(--gk-ease-out);

    // Pressed like a key: the whole slip gives a little under the finger
    &:active {
      transform: scale(0.98);
    }

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 3px;
    }

    @media (hover: hover) {
      &:hover .home__entry-title {
        text-decoration-color: currentcolor;
      }

      &:hover .home__entry-arrow {
        transform: translateX(3px);
      }
    }
  }

  &__entry-plate {
    position: relative;
    display: block;
    width: 96px;

    @media (max-width: 400px) {
      width: 80px;
    }
  }

  &__entry-stamp {
    position: absolute;
    right: -10px;
    bottom: -10px;
  }

  &__entry-text {
    display: grid;
    gap: 0.25rem;
  }

  &__entry-title {
    margin: 0;
    font-family: inherit;
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.3;
    color: inherit;
    // Underline drawn in on hover: the row reads as a link without a button
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.22em;
    text-decoration-color: transparent;
    transition: text-decoration-color var(--gk-dur-fast) var(--gk-ease-out);
  }

  &__entry-desc {
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--gk-ink-soft);
  }

  &__entry-arrow {
    color: var(--gk-indigo);
    transition: transform var(--gk-dur-fast) var(--gk-ease-out);
  }
}

// First-load entrance, one authored sequence (~840ms end to end):
//   120ms  the GutenMage watermark comes up through the paper (900ms fade)
//   80ms   the headline block settles: 6px rise, fade (300ms)
//   380ms  the red word is stamped on (scale, tilt and blur settle, 220ms)
//   240ms  the daily slip and the GutenGuess row fade up together (240ms)
//   420ms  the puzzle-number stamp presses in last (InkStamp, 420ms)
// The daily slip then plays its own blackout once its day has loaded.
// <html data-gk-entered> (set by the script) turns all of it off.
.home__frontispiece {
  animation: home-tip-in 900ms var(--gk-ease-out) 120ms both;
}

.home__title,
.home__lede,
.home__actions,
.home__colophon {
  animation: home-settle 300ms var(--gk-ease-out) 80ms both;
}

.home__entries > * {
  animation: home-settle var(--gk-dur-base) var(--gk-ease-out) 240ms both;
}

// The red word is pressed onto the line once the headline has settled
.home__title-accent {
  animation: home-stamp-word 220ms cubic-bezier(0.2, 0.9, 0.3, 1.15) 380ms both;
}

// Outranks InkStamp's own shorthand for the delay alone
.home__entry .home__entry-stamp {
  animation-delay: 420ms;
}

:root[data-gk-entered] .home__frontispiece,
:root[data-gk-entered] .home__title,
:root[data-gk-entered] .home__title-accent,
:root[data-gk-entered] .home__lede,
:root[data-gk-entered] .home__actions,
:root[data-gk-entered] .home__colophon,
:root[data-gk-entered] .home__entries > *,
:root[data-gk-entered] .home__entry .home__entry-stamp {
  animation: none;
}

// At night the drawing's ink is lifted to pale lines on the dark paper
[data-theme='dark'] .home__frontispiece {
  opacity: 0.22;
}

[data-theme='dark'] .home__frontispiece :deep(.ink-plate__img) {
  mix-blend-mode: screen;
  filter: invert(1) sepia(0.25) brightness(1.05) contrast(1.1);
}

// The watermark comes up through the paper, slowly, like ink drying
@keyframes home-tip-in {
  from {
    opacity: 0;
  }
}

@keyframes home-stamp-word {
  from {
    opacity: 0;
    transform: scale(1.08) rotate(-2deg);
    filter: blur(1.5px);
  }
}

@keyframes home-settle {
  from {
    opacity: 0;
    translate: 0 6px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home__entry,
  .home__entry-arrow,
  .home__entry-title {
    transition: none;
  }

  .home__entry:active {
    transform: none;
  }

  .home__frontispiece,
  .home__title,
  .home__title-accent,
  .home__lede,
  .home__actions,
  .home__colophon,
  .home__entries > *,
  .home__entry .home__entry-stamp {
    animation: none;
  }
}

// Every page starts the same distance below the header's rule
.home {
  padding-top: var(--gk-page-top);
}
</style>
