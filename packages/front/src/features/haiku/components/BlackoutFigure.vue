<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';
import PretextChapter from '@/features/haiku/components/PretextChapter.vue';

// A page of a book, cut into a haiku before the reader's eyes. When the figure
// comes into view the marker blacks the page out until only the verses stand;
// when it leaves, the page is restored, so scrolling down or up plays it again.
// The key puts the whole page back, or cuts it again.
const props = defineProps<{
  /** The passage, whole */
  text: string;
  /** The verses, as they appear in the passage and in reading order */
  verses: string[];
  /** Where it was cut from */
  caption: string;
  /** Key label while the page is cut: put the page back */
  showLabel: string;
  /** Key label while the whole page shows: cut the haiku */
  cutLabel: string;
}>();

const hidden = ref(false);
const root = useTemplateRef<HTMLElement>('root');
// The reader took over: the scroll leaves the page as they set it, until it leaves view
let manual = false;
let observer: IntersectionObserver | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;

function toggle(): void {
  manual = true;
  hidden.value = !hidden.value;
}

onMounted(() => {
  if (!root.value || !('IntersectionObserver' in globalThis)) {
    hidden.value = true;

    return;
  }

  observer = new IntersectionObserver(
    ([entry]) => {
      clearTimeout(timer);

      if (!entry.isIntersecting) {
        manual = false;
        hidden.value = false;

        return;
      }

      // A beat to read the prose, then the marker
      if (!manual && entry.intersectionRatio >= 0.5) {
        timer = setTimeout(() => {
          hidden.value = true;
        }, 450);
      }
    },
    { threshold: [0, 0.5] },
  );
  observer.observe(root.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  clearTimeout(timer);
});
</script>

<template>
  <figure ref="root" class="blackout">
    <div class="blackout__page" aria-hidden="true">
      <PretextChapter
        :text="props.text"
        :verses="props.verses"
        :hidden="hidden"
        :delay="120"
      />
    </div>

    <!-- What the page says once cut: read by assistive tech, found by search -->
    <p class="sr-only">{{ props.verses.join(' / ') }}</p>

    <figcaption class="blackout__caption">
      <span class="blackout__source">{{ props.caption }}</span>
      <button
        type="button"
        class="blackout__key"
        :aria-pressed="hidden"
        @click="toggle"
      >
        {{ hidden ? props.showLabel : props.cutLabel }}
      </button>
    </figcaption>
  </figure>
</template>

<style lang="scss" scoped>
.blackout {
  // The marker is full sumi ink; the verses stay ink on the paper
  --haiku-redaction-ink: var(--gk-ink);
  --gutenku-text-primary: var(--gk-ink);

  display: grid;
  gap: 0.5rem;
  margin: 0;

  &__page {
    padding: 1.25rem 1.25rem 1.5rem;
    background: var(--gk-paper);
    border-radius: var(--gk-radius-paper);
    box-shadow: inset 0 0 0 1.5px var(--gk-ink-faint);
    font-family: var(--gk-font);
    font-size: 0.9375rem;
    line-height: 1.8;
    color: var(--gk-ink-soft);

    @media (min-width: 600px) {
      padding: 1.75rem 2rem 2rem;
      font-size: 1rem;
    }
  }

  &__caption {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0 1rem;
    font-size: 0.8125rem;
    color: var(--gk-ink-soft);
  }

  &__key {
    min-height: 2.75rem;
    padding: 0 0.25rem;
    background: transparent;
    border: 0;
    font-family: var(--gk-font);
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--gk-indigo);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.25em;
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;

    &:active {
      text-decoration-thickness: 2px;
    }

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 2px;
      border-radius: var(--gk-radius-control);
    }

    @media (hover: hover) {
      &:hover {
        text-decoration-thickness: 2px;
      }
    }
  }
}

[data-theme='dark'] .blackout {
  --haiku-redaction-ink: color-mix(in oklch, var(--gk-paper-deep), black 55%);
  --gutenku-text-primary: var(--gk-ink);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
