<script lang="ts" setup>
import { computed } from 'vue';
import { markSvg, type MarkSize } from './brand-mark';

// The GutenKu mark in the page, drawn from the same geometry as the app icons.
// Colours come from the theme tokens, so it follows Day and Night.
const props = withDefaults(
  defineProps<{
    size?: number;
    variant?: MarkSize;
    tile?: boolean;
  }>(),
  {
    size: 28,
    variant: 'small',
    tile: false,
  },
);

const markup = computed(() =>
  markSvg({
    size: props.variant,
    tile: props.tile,
    colors: {
      ink: 'var(--gk-ink)',
      verse: 'var(--gk-indigo)',
      paper: 'var(--gk-paper-raised)',
      stamp: 'var(--gk-stamp)',
      onStamp: 'var(--gk-on-stamp)',
    },
  }),
);
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -- static markup built from our own geometry -->
  <svg
    class="brand-mark"
    viewBox="0 0 100 100"
    :width="size"
    :height="size"
    aria-hidden="true"
    focusable="false"
    v-html="markup"
  />
</template>

<style lang="scss" scoped>
.brand-mark {
  display: block;
  flex-shrink: 0;
  overflow: visible;
}
</style>
