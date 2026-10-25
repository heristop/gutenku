<script lang="ts" setup>
import { onUnmounted, ref } from 'vue';
import type { DailyHaikuExcerpt } from '@gutenku/shared';
import PretextChapter from '@/features/haiku/components/PretextChapter.vue';
import { MARKER_STROKE_MS } from '@/features/haiku/composables/marker-timing';

// The day's verses as they were found: a few words of their chapter, blacked
// out by the marker until only the poem stands. Played once, on the session's
// first home visit; the slip's own verses wait underneath.
defineProps<{ excerpt: DailyHaikuExcerpt }>();
// `ready` once laid out (the slip stops its fallback), `done` once played
const emit = defineEmits<{ ready: []; done: [] }>();
// The prose is read for a beat before the first stroke
const STROKE_DELAY_MS = 250;
// Every marker sequence ends inside 600ms (marker-timing)
const SEQUENCE_MS = 600 + MARKER_STROKE_MS;
// The verses alone on the blacked-out page
const HOLD_MS = 550;

const ready = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

function onReady(): void {
  if (ready.value) {
    return;
  }

  ready.value = true;
  emit('ready');
  timer = setTimeout(() => emit('done'), SEQUENCE_MS + HOLD_MS);
}

onUnmounted(() => clearTimeout(timer));
</script>

<template>
  <div class="daily-blackout" :class="{ 'is-ready': ready }" aria-hidden="true">
    <PretextChapter
      :text="excerpt.text"
      :verses="excerpt.verses"
      :hidden="true"
      :delay="STROKE_DELAY_MS"
      @ready="onReady"
    />
  </div>
</template>

<style lang="scss" scoped>
// Laid over the verses on the slip's own paper, so whatever it overhangs
// below is covered too while it plays
.daily-blackout {
  --haiku-redaction-ink: color-mix(
    in oklch,
    var(--gk-ink) 78%,
    var(--gk-paper-raised)
  );

  position: absolute;
  inset: 0 0 auto;
  z-index: 1;
  // Seen, never in the way: taps reach what lies under it
  pointer-events: none;
  padding-bottom: 0.5rem;
  background: var(--gk-paper-raised);
  color: var(--gk-ink-soft);
  font-size: 0.8125rem;
  text-align: justify;
  opacity: 0;

  &.is-ready {
    opacity: 1;
  }
}

[data-theme='dark'] .daily-blackout {
  --haiku-redaction-ink: color-mix(in oklch, var(--gk-paper-deep), black 55%);
}
</style>
