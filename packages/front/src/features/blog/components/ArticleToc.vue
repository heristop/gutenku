<script lang="ts" setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useId,
  watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { ChevronDown } from '@/core/components/icons/ink';
import type { TocHeading } from '../composables/article-toc';

// The article's contents. "rail": a sticky column in the right margin with
// a reading-progress rule. "disclosure": a collapsed list under the meta
// line for screens without a margin.
const props = defineProps<{
  headings: TocHeading[];
  activeId: string | null;
  progress?: number;
  variant: 'rail' | 'disclosure';
}>();

const emit = defineEmits<{ navigate: [id: string] }>();

const { t } = useI18n();
const panelId = `article-toc-${useId()}`;

const root = ref<HTMLElement | null>(null);
const list = ref<HTMLElement | null>(null);
const open = ref(false);
// Collapsing under a jump is instant, so the scroll target does not drift
const instantClose = ref(false);

const markerY = ref(0);
const markerShown = ref(false);
// The first placement snaps; only later moves glide between entries
const markerGlides = ref(false);

const isRail = computed(() => props.variant === 'rail');

function prefersReducedMotion(): boolean {
  return (
    globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  );
}

function linkFor(id: string): HTMLElement | null {
  return (
    list.value?.querySelector<HTMLElement>(
      `[data-toc-id="${CSS.escape(id)}"]`,
    ) ?? null
  );
}

// Keep the current entry visible when the rail scrolls on its own
function revealInRail(link: HTMLElement) {
  const scroller = root.value;

  if (
    !isRail.value ||
    !scroller ||
    scroller.scrollHeight <= scroller.clientHeight
  ) {
    return;
  }

  const box = scroller.getBoundingClientRect();
  const item = link.getBoundingClientRect();
  const margin = 48;
  const above = Math.min(0, item.top - box.top - margin);
  const below = Math.max(0, item.bottom - box.bottom + margin);
  const delta = above || below;

  if (delta !== 0) {
    scroller.scrollBy({
      top: delta,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }
}

function placeMarker() {
  const link = props.activeId ? linkFor(props.activeId) : null;

  if (!link || link.offsetHeight === 0) {
    markerShown.value = false;
    markerGlides.value = false;

    return;
  }

  markerY.value = link.offsetTop + link.offsetHeight / 2;

  if (!markerShown.value) {
    markerShown.value = true;
    requestAnimationFrame(() => {
      markerGlides.value = true;
    });
  }

  revealInRail(link);
}

watch(
  () => props.activeId,
  async () => {
    await nextTick();
    placeMarker();
  },
);

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  placeMarker();

  // Re-seat the marker when entries rewrap (font load, resize, opening)
  if (list.value && 'ResizeObserver' in globalThis) {
    resizeObserver = new ResizeObserver(() => placeMarker());
    resizeObserver.observe(list.value);
  }
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});

function toggle() {
  instantClose.value = false;
  open.value = !open.value;
}

async function go(id: string) {
  if (!isRail.value && open.value) {
    instantClose.value = true;
    open.value = false;
    await nextTick();
  }

  emit('navigate', id);
}

const progressStyle = computed(() => ({
  transform: `scaleY(${props.progress ?? 0})`,
}));

const markerStyle = computed(() => ({
  transform: `translateY(${markerY.value}px)`,
}));
</script>

<template>
  <nav
    ref="root"
    class="article-toc"
    :class="[
      `article-toc--${variant}`,
      { 'article-toc--open': open, 'article-toc--instant': instantClose },
    ]"
    :aria-label="t('blog.tocLabel')"
  >
    <p v-if="isRail" class="article-toc__title">{{ t('blog.tocTitle') }}</p>
    <button
      v-else
      type="button"
      class="article-toc__toggle"
      :aria-expanded="open"
      :aria-controls="panelId"
      @click="toggle"
    >
      <span class="article-toc__title">{{ t('blog.tocTitle') }}</span>
      <span class="article-toc__count">{{
        t('blog.tocCount', { count: headings.length })
      }}</span>
      <ChevronDown class="article-toc__chevron" :size="16" aria-hidden="true" />
    </button>

    <div :id="panelId" class="article-toc__panel" :inert="!isRail && !open">
      <div class="article-toc__panel-inner">
        <div ref="list" class="article-toc__track">
          <ol class="article-toc__list">
            <li
              v-for="heading in headings"
              :key="heading.id"
              class="article-toc__item"
              :class="`article-toc__item--h${heading.level}`"
            >
              <a
                :href="`#${heading.id}`"
                :data-toc-id="heading.id"
                class="article-toc__link"
                :aria-current="heading.id === activeId ? 'location' : undefined"
                @click.prevent="go(heading.id)"
                >{{ heading.text }}</a
              >
            </li>
          </ol>

          <span
            v-if="isRail"
            class="article-toc__progress"
            :style="progressStyle"
            aria-hidden="true"
          />
          <span
            class="article-toc__marker"
            :class="{
              'article-toc__marker--shown': markerShown,
              'article-toc__marker--glides': markerGlides,
            }"
            :style="markerStyle"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
.article-toc {
  font-family: var(--gk-font);
  color: var(--gk-ink-soft);

  // Library-card field name: the list's own label, not a kicker
  &__title {
    margin: 0;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gk-ink-soft);
  }

  &__list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__track {
    position: relative;
    padding-left: 1.125rem;

    // The ruled margin line; the progress fill and marker ride on it
    &::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 1.5px;
      background: var(--gk-ink-faint);
    }
  }

  &__item {
    margin: 0;
    padding: 0;

    &--h3 {
      padding-left: 0.875rem;
    }
  }

  &__link {
    position: relative;
    display: block;
    padding: 0.3125rem 0;
    font-size: 0.8125rem;
    line-height: 1.4;
    color: var(--gk-ink-soft);
    text-decoration: none;
    text-wrap: pretty;
    overflow-wrap: break-word;
    border-radius: var(--gk-radius-control);
    transition: color var(--gk-dur-fast) var(--gk-ease-out);

    // 44px target without spreading the list: the hit area overhangs
    &::before {
      content: '';
      position: absolute;
      inset: -0.5rem 0 -0.5rem -1.125rem;
    }

    @media (hover: hover) {
      &:hover {
        color: var(--gk-ink);
        text-decoration: underline;
        text-decoration-thickness: 1px;
        text-underline-offset: 0.22em;
      }
    }

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 2px;
    }

    &[aria-current='location'] {
      font-weight: 700;
      color: var(--gk-ink);
    }
  }

  &__item--h3 &__link {
    font-size: 0.75rem;
  }

  &__progress {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 1.5px;
    background: var(--gk-ink);
    transform-origin: top center;
    pointer-events: none;
    will-change: transform;
  }

  // Vermilion brush tick across the rule, the nav's active mark turned
  // sideways. Positioned by translateY so it glides from entry to entry.
  &__marker {
    position: absolute;
    top: -3px;
    left: -0.375rem;
    width: 1rem;
    height: 6px;
    background: var(--gk-stamp);
    clip-path: polygon(
      0 55%,
      8% 30%,
      40% 20%,
      75% 28%,
      100% 10%,
      98% 70%,
      60% 85%,
      20% 80%,
      2% 95%
    );
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--gk-dur-fast) var(--gk-ease-out);

    &--shown {
      opacity: 0.9;
    }

    &--glides {
      transition:
        opacity var(--gk-dur-fast) var(--gk-ease-out),
        transform var(--gk-dur-base) var(--gk-ease-out);
    }
  }

  // Rail: sticky in the right margin, scrolls on its own when very long
  &--rail {
    // Clears the back-to-top key parked in the bottom-right corner
    max-height: calc(100vh - 8rem);
    max-height: calc(100dvh - 8rem);
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: var(--gk-ink-faint) transparent;
    // Room for focus rings inside the scroll box
    padding: 0.25rem 0.25rem 0.5rem 0.5rem;

    .article-toc__title {
      margin-bottom: 0.875rem;
    }
  }

  // Disclosure: a typed key under the meta line, collapsed by default
  &--disclosure {
    margin-top: 1rem;
  }

  &__toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.625rem;
    min-height: 2.75rem;
    padding: 0.5rem 0;
    font-family: inherit;
    color: var(--gk-ink);
    background: none;
    border: 0;
    border-radius: var(--gk-radius-control);
    cursor: pointer;

    .article-toc__title {
      color: var(--gk-ink);
    }

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 3px;
    }

    @media (hover: hover) {
      &:hover .article-toc__count {
        color: var(--gk-ink);
      }
    }
  }

  &__count {
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
    color: var(--gk-ink-soft);
    transition: color var(--gk-dur-fast) var(--gk-ease-out);
  }

  &__chevron {
    flex-shrink: 0;
    transition: transform var(--gk-dur-base) var(--gk-ease-out);
  }

  &--open &__chevron {
    transform: rotate(180deg);
  }

  &--disclosure &__panel {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows var(--gk-dur-base) var(--gk-ease-out);
  }

  &--disclosure &__panel-inner {
    min-height: 0;
    overflow: hidden;
  }

  &--disclosure &__track {
    margin: 0.25rem 0 0.5rem 0.125rem;
  }

  // Bigger rows for fingers on the disclosure
  &--disclosure &__link {
    padding-block: 0.8125rem;

    &::before {
      inset: 0 0 0 -1.125rem;
    }
  }

  &--open &__panel {
    grid-template-rows: 1fr;
  }

  &--instant &__panel,
  &--instant &__chevron {
    transition: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .article-toc__marker--glides {
    transition: opacity var(--gk-dur-fast) var(--gk-ease-out);
  }

  .article-toc--disclosure .article-toc__panel,
  .article-toc__chevron {
    transition: none;
  }
}

@media (forced-colors: active) {
  .article-toc__marker,
  .article-toc__progress {
    background: CanvasText;
  }

  .article-toc__link[aria-current='location'] {
    text-decoration: underline;
  }
}
</style>
