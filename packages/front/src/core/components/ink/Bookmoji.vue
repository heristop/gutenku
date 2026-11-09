<script lang="ts" setup>
import { computed } from 'vue';
import { bookmojiUrl } from '@/assets/bookmoji';
import { readBookmoji } from '@/core/composables/bookmoji';

const props = defineProps<{ text?: string | null }>();
const marks = computed(() =>
  readBookmoji(props.text ?? '').map((glyph) => ({
    glyph,
    url: bookmojiUrl(glyph),
  })),
);
</script>

<template>
  <span
    class="bookmoji"
    role="img"
    :aria-label="marks.map((mark) => mark.glyph).join(' ') || undefined"
  >
    <template v-for="(mark, index) in marks" :key="index">
      <svg
        v-if="mark.url"
        class="bookmoji__print"
        viewBox="0 0 36 36"
        aria-hidden="true"
        focusable="false"
      >
        <use :href="mark.url" width="36" height="36" />
      </svg>
      <span v-else aria-hidden="true">{{ mark.glyph }}</span>
    </template>
  </span>
</template>

<style scoped>
.bookmoji {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.12em;
  color: var(--gk-ink);
  line-height: 1;
  vertical-align: -0.12em;
}

[data-theme='dark'] .bookmoji {
  --bm-natural-outline: #d3bfa7;
}

.bookmoji__print {
  flex: none;
  width: 1em;
  height: 1em;
}
</style>
