<script lang="ts" setup>
import { computed, nextTick, onUnmounted, ref, useId, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter, type LocationQuery } from 'vue-router';
import {
  getCurrentPublicationDate,
  isValidDailyHaikuDate,
} from '@gutenku/shared';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from '@/core/components/icons/ink';
import InkStamp from '@/core/components/ink/InkStamp.vue';
import { useDailyHaiku } from '@/features/haiku/composables/daily-haiku';

type Step = 'prev' | 'next';

const props = withDefaults(
  defineProps<{
    // Home keeps the poem first: the reading waits behind its toggle
    foldReading?: boolean;
  }>(),
  { foldReading: false },
);

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();

// The day lives in the URL (`/?day=YYYY-MM-DD`) so a past page can be shared;
// today is the bare home page
const requestedDay = computed<string | null>(() => {
  const raw = route.query.day;
  const value = Array.isArray(raw) ? raw[0] : raw;

  if (!isValidDailyHaikuDate(value)) {
    return null;
  }

  return value < getCurrentPublicationDate() ? value : null;
});

function queryWithoutDay(): LocationQuery {
  const { day: _day, ...rest } = route.query;

  return rest;
}

// An invalid, future or today's date is dropped from the address
watch(
  () => route.query.day,
  (raw) => {
    if (raw !== undefined && requestedDay.value === null) {
      router.replace({ query: queryWithoutDay() });
    }
  },
  { immediate: true },
);

const { haiku, missing, failed, loading, countdown, reload } =
  useDailyHaiku(requestedDay);

const readingId = `daily-reading-${useId()}`;
const sourceId = `daily-source-${useId()}`;

// Publication days are read in UTC so every reader sees the same page date
function formatDay(iso: string, options: Intl.DateTimeFormatOptions): string {
  // British English keeps the "day month" order the slip reads in
  const tag = locale.value === 'en' ? 'en-GB' : locale.value;

  return new Intl.DateTimeFormat(tag, { timeZone: 'UTC', ...options }).format(
    new Date(`${iso}T12:00:00Z`),
  );
}

/** "Wednesday 21 October", for labels read aloud. */
function spokenDay(iso: string): string {
  return formatDay(iso, { weekday: 'long', day: 'numeric', month: 'long' });
}

// The pager answers at once with the day asked for; the page follows
const pagerDate = computed<string | null>(() => {
  if (requestedDay.value) {
    return requestedDay.value;
  }

  return haiku.value?.isToday ? haiku.value.date : getCurrentPublicationDate();
});

const day = computed(() => {
  const iso = pagerDate.value;

  if (!iso || !isValidDailyHaikuDate(iso)) {
    return null;
  }

  return {
    iso,
    weekday: formatDay(iso, { weekday: 'long' }),
    dayMonth: formatDay(iso, { day: 'numeric', month: 'long' }),
  };
});

const isPast = computed(() => requestedDay.value !== null);

const slipLabel = computed(() =>
  isPast.value && requestedDay.value
    ? t('home.daily.labelPast', {
        date: formatDay(requestedDay.value, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      })
    : t('home.daily.label'),
);

// On a past day the pager already carries the date: the visible label stays
// constant, the heading and aria-label keep the full date
const visibleLabel = computed(() =>
  isPast.value ? t('home.daily.labelDay') : t('home.daily.label'),
);

const previousDate = computed(() =>
  loading.value ? null : (haiku.value?.previousDate ?? null),
);
const nextDate = computed(() => {
  if (loading.value) {
    return null;
  }

  // A past page always leads forward, at worst back to today
  return (
    haiku.value?.nextDate ?? (isPast.value ? getCurrentPublicationDate() : null)
  );
});

const previousLabel = computed(() =>
  previousDate.value
    ? t('home.daily.nav.previous', { date: spokenDay(previousDate.value) })
    : t('home.daily.nav.previousNone'),
);
const nextLabel = computed(() =>
  nextDate.value
    ? t('home.daily.nav.next', { date: spokenDay(nextDate.value) })
    : t('home.daily.nav.nextNone'),
);

const countdownLabel = computed(() => {
  const value = countdown.value;

  if (!value) {
    return t('home.daily.nextDaily');
  }

  if (value.due) {
    return t('home.daily.nextSoon');
  }

  return value.hours === null
    ? t('home.daily.nextInMinutes', { minutes: value.minutes })
    : t('home.daily.nextInHours', { hours: value.hours });
});

// Direction of the last step: the leaf slides the way the reader is turning
const direction = ref<Step>('prev');
const lastStep = ref<Step | null>(null);
const prevButton = ref<HTMLButtonElement | null>(null);
const nextButton = ref<HTMLButtonElement | null>(null);

function goTo(target: string | null, step: Step): void {
  if (!target) {
    return;
  }

  direction.value = step;
  lastStep.value = step;
  const query = queryWithoutDay();

  router.replace({
    query:
      target >= getCurrentPublicationDate() ? query : { ...query, day: target },
  });
}

function goPrevious(): void {
  goTo(previousDate.value, 'prev');
}

function goNext(): void {
  goTo(nextDate.value, 'next');
}

function goToday(): void {
  lastStep.value = null;
  goTo(getCurrentPublicationDate(), 'next');
}

const TYPING_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);
const ARROW_STEPS: Record<string, Step> = {
  ArrowLeft: 'prev',
  ArrowRight: 'next',
};

function isPlainKey(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null;
  const typing =
    !!target && (TYPING_TAGS.has(target.tagName) || target.isContentEditable);

  return !(
    event.defaultPrevented ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    typing
  );
}

// Arrow keys turn the page only while focus is inside the slip
function onKeydown(event: KeyboardEvent): void {
  const step = ARROW_STEPS[event.key];

  if (!step || !isPlainKey(event)) {
    return;
  }

  event.preventDefault();
  const button = step === 'prev' ? prevButton.value : nextButton.value;

  // The focused control may leave with the old page: hold focus on the pager
  if (button && !button.disabled && event.target !== button) {
    button.focus();
  }

  (step === 'prev' ? goPrevious : goNext)();
}

// A step button that just reached the end of the archive cannot keep focus:
// hand it to the other step, else to the date between them
const dateEl = ref<HTMLElement | null>(null);

async function keepPagerFocus(): Promise<void> {
  await nextTick();
  const pressed =
    lastStep.value === 'prev' ? prevButton.value : nextButton.value;
  const other = lastStep.value === 'prev' ? nextButton.value : prevButton.value;
  const active = document.activeElement;
  const lost = active === pressed || active === document.body || !active;

  if (!pressed?.disabled || !lost) {
    return;
  }

  (other && !other.disabled ? other : dateEl.value)?.focus();
}

// The reading rests at five lines; the toggle only exists when there is more
const readingOpen = ref(false);
// Unknown until measured: rest clamped so the page never jumps on load
const readingOverflows = ref<boolean | null>(null);
// Height only animates once the reader has used the toggle
const readingToggled = ref(false);

function toggleReading(): void {
  readingToggled.value = true;
  readingOpen.value = !readingOpen.value;
}
const readingFull = ref(0);
const readingInner = ref<HTMLElement | null>(null);
let readingObserver: ResizeObserver | null = null;

function measureReading(): void {
  const inner = readingInner.value;

  if (!inner) {
    return;
  }

  const style = getComputedStyle(inner);
  const resting = 5 * Number.parseFloat(style.lineHeight);
  readingFull.value = inner.scrollHeight;
  readingOverflows.value =
    Number.isFinite(resting) && inner.scrollHeight > resting + 1;
}

watch(readingInner, (inner) => {
  readingObserver?.disconnect();
  readingObserver = null;

  if (!inner) {
    return;
  }

  nextTick(measureReading);

  if (typeof ResizeObserver === 'function') {
    readingObserver = new ResizeObserver(measureReading);
    readingObserver.observe(inner);
  }
});

const sourceOpen = ref(false);

// Every page opens folded: reading clamped, source hidden
watch(
  () => haiku.value?.date,
  (date, previous) => {
    readingOpen.value = false;
    readingToggled.value = false;
    sourceOpen.value = false;

    if (lastStep.value && date !== previous) {
      keepPagerFocus();
    }
  },
);

onUnmounted(() => {
  readingObserver?.disconnect();
});
</script>

<template>
  <article
    class="daily-slip"
    :class="{ 'is-dim': loading && (haiku || missing) }"
    :data-dir="direction"
    :aria-busy="loading"
    :aria-label="slipLabel"
    data-cy="daily-slip"
    @keydown="onKeydown"
  >
    <h2 class="sr-only">{{ slipLabel }}</h2>

    <template v-if="haiku?.verses?.length || missing || failed">
      <div class="daily-slip__leaf-frame">
        <Transition name="slip-leaf" mode="out-in">
          <div v-if="haiku" :key="haiku.date" class="daily-slip__leaf">
            <!-- The slip names itself first, then its title, then the poem -->
            <div class="daily-slip__head">
              <span class="daily-slip__label" aria-hidden="true">{{
                visibleLabel
              }}</span>
            </div>

            <h3 v-if="haiku.title" class="daily-slip__title">
              {{ haiku.title }}
            </h3>

            <p class="daily-slip__lines">
              <span
                v-for="(verse, i) in haiku.verses"
                :key="i"
                class="daily-slip__line"
              >
                {{ verse }}
              </span>
            </p>

            <div v-if="haiku.reading" class="daily-slip__reading">
              <div
                :id="readingId"
                class="daily-slip__clamp"
                :class="{
                  'is-open': readingOpen,
                  'is-clamped':
                    !props.foldReading &&
                    readingOverflows !== false &&
                    !readingOpen,
                  'is-folded': props.foldReading && !readingOpen,
                  'is-animated': readingToggled,
                }"
                :style="
                  readingFull
                    ? { '--reading-full': `${readingFull}px` }
                    : undefined
                "
              >
                <p
                  v-if="!props.foldReading || readingOpen"
                  ref="readingInner"
                  class="daily-slip__reading-text"
                >
                  {{ haiku.reading }}
                </p>
              </div>
              <button
                v-if="readingOverflows || props.foldReading"
                type="button"
                class="daily-slip__toggle"
                :aria-expanded="readingOpen"
                :aria-controls="readingId"
                data-cy="daily-reading-toggle"
                @click="toggleReading"
              >
                {{
                  readingOpen
                    ? t('home.daily.readLess')
                    : t('home.daily.readMore')
                }}
                <ChevronDown
                  :size="16"
                  class="daily-slip__chevron"
                  :class="{ 'is-open': readingOpen }"
                  aria-hidden="true"
                />
              </button>
            </div>

            <div class="daily-slip__trace">
              <button
                type="button"
                class="daily-slip__toggle"
                :aria-expanded="sourceOpen"
                :aria-controls="sourceId"
                data-cy="daily-trace-toggle"
                @click="sourceOpen = !sourceOpen"
              >
                {{ t('home.daily.trace') }}
                <ChevronDown
                  :size="16"
                  class="daily-slip__chevron"
                  :class="{ 'is-open': sourceOpen }"
                  aria-hidden="true"
                />
              </button>
              <div
                :id="sourceId"
                class="daily-slip__answer"
                :class="{ 'is-open': sourceOpen }"
                :inert="!sourceOpen || undefined"
              >
                <div class="daily-slip__answer-inner">
                  <p class="daily-slip__answer-text">
                    {{ t('home.daily.lifted') }}
                    <span
                      v-if="haiku.book.emoticons"
                      class="daily-slip__bookmoji"
                      role="img"
                      :aria-label="t('home.daily.bookmoji')"
                      >{{ haiku.book.emoticons }}</span
                    >
                  </p>
                  <p class="daily-slip__answer-text">
                    <i18n-t
                      :keypath="
                        haiku.isToday
                          ? 'home.daily.source'
                          : 'home.daily.sourcePast'
                      "
                      tag="span"
                      scope="global"
                    >
                      <template #book>
                        <cite class="daily-slip__book">{{
                          haiku.book.title
                        }}</cite>
                      </template>
                      <template #author>{{ haiku.book.author }}</template>
                    </i18n-t>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p
            v-else-if="failed"
            :key="`failed-${requestedDay}`"
            class="daily-slip__empty daily-slip__failed"
            role="status"
            data-cy="daily-failed"
          >
            {{ t('home.daily.failed') }}
            <button type="button" class="daily-slip__retry" @click="reload()">
              {{ t('home.daily.retry') }}
            </button>
          </p>

          <p
            v-else
            :key="`missing-${requestedDay}`"
            class="daily-slip__empty daily-slip__missing"
            data-cy="daily-missing"
          >
            {{ t('home.daily.missing') }}
          </p>
        </Transition>
      </div>

      <div class="daily-slip__footer">
        <div class="daily-slip__meta">
          <nav
            v-if="day"
            class="daily-slip__pager"
            :aria-label="t('home.daily.nav.label')"
          >
            <button
              ref="prevButton"
              type="button"
              class="daily-slip__step"
              :disabled="!previousDate"
              :aria-label="previousLabel"
              data-cy="daily-prev"
              @click="goPrevious"
            >
              <ChevronLeft :size="18" aria-hidden="true" />
            </button>
            <time
              ref="dateEl"
              :datetime="day.iso"
              tabindex="-1"
              class="daily-slip__date"
              aria-live="polite"
              data-cy="daily-date"
            >
              {{ day.weekday }}<span aria-hidden="true"> · </span
              ><span class="sr-only">, </span>{{ day.dayMonth }}
            </time>
            <button
              ref="nextButton"
              type="button"
              class="daily-slip__step"
              :disabled="!nextDate"
              :aria-label="nextLabel"
              data-cy="daily-next"
              @click="goNext"
            >
              <ChevronRight :size="18" aria-hidden="true" />
            </button>
          </nav>
          <span v-if="!isPast" class="daily-slip__next">
            <span
              class="daily-slip__rule"
              aria-hidden="true"
              :style="{ '--day-progress': countdown?.progress ?? 0 }"
            />
            <span>{{ countdownLabel }}</span>
          </span>
          <span v-else class="daily-slip__return">
            <button
              type="button"
              class="daily-slip__today"
              data-cy="daily-today"
              @click="goToday"
            >
              {{ t('home.daily.backToToday') }}
            </button>
          </span>
        </div>
        <InkStamp v-if="haiku" label="GK" tone="ink" :size="34" :tilt="6" />
      </div>
    </template>

    <p v-else-if="loading" class="daily-slip__status" role="status">
      <span class="daily-slip__placeholder" aria-hidden="true" />
      <span
        class="daily-slip__placeholder daily-slip__placeholder--long"
        aria-hidden="true"
      />
      <span class="daily-slip__placeholder" aria-hidden="true" />
      <span class="sr-only">{{ t('home.daily.loading') }}</span>
    </p>

    <p v-else class="daily-slip__empty">{{ t('home.daily.empty') }}</p>
  </article>
</template>

<style lang="scss" scoped>
.daily-slip {
  --reading-line: 1.5rem;

  position: relative;
  display: grid;
  padding: 1.5rem 1.5rem 1.25rem;
  background: var(--gk-paper-raised);
  border-radius: var(--gk-radius-paper);
  box-shadow: var(--gk-lift);
  color: var(--gk-ink);
  font-family: var(--gk-font);

  @media (max-width: 600px) {
    padding: 1.25rem 1.125rem 1rem;
  }

  // The page itself: dims while the next one is fetched, the footer stays put
  &__leaf-frame {
    transition: opacity var(--gk-dur-fast) var(--gk-ease-out);
  }

  &.is-dim &__leaf-frame {
    opacity: 0.55;
  }

  &__missing {
    margin-bottom: 1.25rem;
  }

  &__head {
    margin: 0 0 0.75rem;
  }

  // The title is a quiet line: the poem carries the slip
  &__title {
    margin: 0 0 0.5rem;
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.4;
    color: var(--gk-ink-soft);
    text-wrap: balance;
  }

  &__lines {
    display: grid;
    margin: 0 0 1.25rem;
    font-size: clamp(1.375rem, 2.2vw, 1.75rem);
    line-height: 1.55;
    letter-spacing: -0.025em;
    overflow-wrap: anywhere;

    @media (max-width: 600px) {
      font-size: clamp(1rem, 4.4vw, 1.125rem);
    }
  }

  // A verse that must wrap hangs: its continuation sits further in, so the
  // poem still reads as three lines
  &__line {
    --indent: 0em;

    display: block;
    padding-left: calc(var(--indent) + 1.25em);
    text-indent: -1.25em;
    text-wrap: balance;

    &:nth-child(2) {
      --indent: 2.2em;
    }

    &:nth-child(3) {
      --indent: 1em;
    }

    @media (max-width: 600px) {
      &:nth-child(2) {
        --indent: 0.9em;
      }

      &:nth-child(3) {
        --indent: 0.45em;
      }
    }
  }

  // Reading: five ruled lines at rest, the full text when opened
  &__reading {
    display: grid;
    justify-items: start;
    gap: 0.25rem;
  }

  &__clamp {
    display: grid;
    grid-template-rows: minmax(0, var(--reading-full, auto));
    width: 100%;
    overflow: hidden;

    &.is-animated {
      transition: grid-template-rows var(--gk-dur-reward) var(--gk-ease-out);
    }

    // Folded: nothing reserved, the toggle alone stands for the reading
    &.is-folded {
      grid-template-rows: minmax(0, 0fr);
    }

    &.is-clamped {
      grid-template-rows: minmax(0, calc(5 * var(--reading-line)));
      // The last line fades into the paper: there is more to read
      mask-image: linear-gradient(
        to bottom,
        #000 calc(100% - var(--reading-line)),
        transparent
      );
    }
  }

  &__reading-text {
    margin: 0;
    max-width: 65ch;
    font-size: 0.9375rem;
    line-height: var(--reading-line);
    color: var(--gk-ink-soft);
  }

  // Ghost text key: ink, with the indigo chevron as the pressable cue
  &__toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    min-height: 2.75rem;
    margin-left: -0.5rem;
    padding: 0.5rem;
    border: 0;
    border-radius: var(--gk-radius-control);
    background: transparent;
    color: var(--gk-ink);
    font: inherit;
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    touch-action: manipulation;
    transition:
      background-color var(--gk-dur-fast) var(--gk-ease-out),
      transform var(--gk-dur-press) var(--gk-ease-out);

    @media (hover: hover) {
      &:hover {
        background: var(--gk-ink-faint);
      }
    }

    // Answers on press, like the main keys
    &:active {
      transform: scale(0.98);
    }

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 2px;
    }
  }

  &__chevron {
    color: var(--gk-indigo);
    transition: transform var(--gk-dur-fast) var(--gk-ease-out);

    &.is-open {
      transform: rotate(180deg);
    }
  }

  &__trace {
    display: grid;
    justify-items: start;
    margin-bottom: 0.75rem;
  }

  // Spoiler-safe: the book stays folded away until asked for
  &__answer {
    display: grid;
    grid-template-rows: 0fr;
    width: 100%;
    visibility: hidden;
    transition:
      grid-template-rows var(--gk-dur-base) var(--gk-ease-out),
      visibility 0s linear var(--gk-dur-base);

    &.is-open {
      grid-template-rows: 1fr;
      visibility: visible;
      transition:
        grid-template-rows var(--gk-dur-base) var(--gk-ease-out),
        visibility 0s;
    }
  }

  &__answer-inner {
    display: grid;
    gap: 0.375rem;
    min-height: 0;
    overflow: hidden;
  }

  &__answer-text {
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--gk-ink-soft);

    &:first-child {
      padding-top: 0.25rem;
    }

    &:last-child {
      padding-bottom: 0.5rem;
    }
  }

  &__book {
    font-style: italic;
    font-weight: 700;
    color: var(--gk-ink);
  }

  &__bookmoji {
    margin-left: 0.25rem;
    font-size: 1.125rem;
    letter-spacing: 0.2em;
    white-space: nowrap;

    &:focus {
      outline: none;
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-top: 0.875rem;
    border-top: var(--gk-rule-faint);
  }

  &__meta {
    display: grid;
    gap: 0.25rem;
    min-width: 0;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--gk-ink-soft);
  }

  &__label {
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gk-ink);
  }

  // Pager: ghost ink keys either side of the date, indigo chevrons as the cue
  &__pager {
    display: flex;
    align-items: center;
    min-width: 0;
    // Optically align the first chevron with the label above it
    margin-left: -0.8125rem;
  }

  &__step {
    display: inline-grid;
    flex: none;
    place-items: center;
    inline-size: 2.75rem;
    block-size: 2.75rem;
    padding: 0;
    border: 0;
    border-radius: var(--gk-radius-control);
    background: transparent;
    color: var(--gk-indigo);
    cursor: pointer;
    touch-action: manipulation;
    transition:
      background-color var(--gk-dur-fast) var(--gk-ease-out),
      color var(--gk-dur-fast) var(--gk-ease-out),
      transform var(--gk-dur-press) var(--gk-ease-out);

    @media (hover: hover) {
      &:hover:not(:disabled) {
        background: var(--gk-ink-faint);
      }
    }

    &:active:not(:disabled) {
      transform: scale(0.94);
    }

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: -2px;
    }

    &:disabled {
      color: var(--gk-ink-faint);
      cursor: default;
    }
  }

  // Monospace, so a fixed measure keeps the next chevron from wandering
  &__date {
    min-inline-size: 22ch;
    text-align: center;
    color: var(--gk-ink);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;

    // Small phones: 22ch plus both keys outruns the slip, so the date gives
    // way and may fold onto two lines between the chevrons
    @media (max-width: 360px) {
      flex: 1 1 auto;
      min-inline-size: 0;
      white-space: normal;
      text-wrap: balance;
    }
  }

  // Same line height as the countdown it replaces, with a 44px hit area
  &__return {
    display: inline-flex;
  }

  &__today {
    margin: -0.6875rem -0.5rem;
    padding: 0.6875rem 0.5rem;
    border: 0;
    border-radius: var(--gk-radius-control);
    background: transparent;
    color: var(--gk-indigo);
    font: inherit;
    font-weight: 700;
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.25em;
    cursor: pointer;
    transition: background-color var(--gk-dur-fast) var(--gk-ease-out);

    @media (hover: hover) {
      &:hover {
        background: var(--gk-ink-faint);
      }
    }

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: -2px;
    }
  }

  // The day's ruled bar fills from one rollover to the next
  &__next {
    display: inline-flex;
    align-items: center;
    gap: 0.625rem;
    font-variant-numeric: tabular-nums;
  }

  &__rule {
    position: relative;
    flex: none;
    width: 3rem;
    height: 1.5px;
    background: var(--gk-ink-faint);

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--gk-ink);
      transform: scaleX(var(--day-progress, 0));
      transform-origin: left center;
      transition: transform var(--gk-dur-reward) var(--gk-ease-out);
    }
  }

  &__status {
    display: grid;
    gap: 0.75rem;
    margin: 0.5rem 0 1.25rem;
  }

  &__placeholder {
    display: block;
    width: 55%;
    height: 0.875rem;
    border-bottom: var(--gk-rule-faint);

    &--long {
      width: 78%;
      margin-left: 2.2em;
    }
  }

  &__empty {
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--gk-ink-soft);
  }
}

// Turning a leaf: the old page slips out the way the reader turns, the next
// one settles in from the other side (120ms out, 180ms in)
.slip-leaf-leave-active {
  transition:
    opacity var(--gk-dur-press) var(--gk-ease-out),
    transform var(--gk-dur-press) var(--gk-ease-out);
}

.slip-leaf-enter-active {
  transition:
    opacity var(--gk-dur-fast) var(--gk-ease-out),
    transform var(--gk-dur-fast) var(--gk-ease-out);
}

.slip-leaf-enter-from,
.slip-leaf-leave-to {
  opacity: 0;
}

// Previous: the page moves right, back through the book
.daily-slip[data-dir='prev'] {
  .slip-leaf-leave-to {
    transform: translateX(0.375rem);
  }

  .slip-leaf-enter-from {
    transform: translateX(-0.375rem);
  }
}

.daily-slip[data-dir='next'] {
  .slip-leaf-leave-to {
    transform: translateX(-0.375rem);
  }

  .slip-leaf-enter-from {
    transform: translateX(0.375rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .slip-leaf-enter-active,
  .slip-leaf-leave-active {
    transition: opacity var(--gk-dur-press) linear;
  }

  .daily-slip[data-dir] .slip-leaf-enter-from,
  .daily-slip[data-dir] .slip-leaf-leave-to {
    transform: none;
  }

  .daily-slip__step,
  .daily-slip__today,
  .daily-slip__clamp.is-animated,
  .daily-slip__answer,
  .daily-slip__answer.is-open,
  .daily-slip__chevron,
  .daily-slip__toggle,
  .daily-slip__rule::after {
    transition: none;
  }
}

// The retry reads as a link inside the sentence: indigo, because it acts
.daily-slip__retry {
  min-height: 44px;
  padding: 0 0.25rem;
  font: inherit;
  color: var(--gk-indigo);
  background: none;
  border: 0;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.25em;

  &:focus-visible {
    outline: 2px solid var(--gk-indigo);
    outline-offset: 2px;
    border-radius: 2px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .daily-slip__toggle,
  .daily-slip__step {
    transition:
      background-color var(--gk-dur-fast) ease,
      color var(--gk-dur-fast) ease;

    &:active {
      transform: none;
    }
  }
}
</style>
