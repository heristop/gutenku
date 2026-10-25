<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useSitePages } from '@/core/composables/site-pages';

// The book spine down the left edge: names the current page in the same place
// on every page, like a title on a shelf. Decorative; the nav carries the
// accessible current-page state.
const { t } = useI18n();
const { currentPage } = useSitePages();
</script>

<template>
  <aside class="ink-spine" aria-hidden="true">
    <template v-if="currentPage">
      <span class="ink-spine__dot" />
      <span class="ink-spine__title">{{ t(currentPage.labelKey) }}</span>
      <span class="ink-spine__page">p.&nbsp;{{ currentPage.pageNumber }}</span>
    </template>
    <!-- A page that is not in the book is still named on the shelf -->
    <template v-else>
      <span class="ink-spine__dot ink-spine__dot--lost" />
      <span class="ink-spine__title">{{ t('notFound.spine') }}</span>
      <span class="ink-spine__page">p.&nbsp;—</span>
    </template>
  </aside>
</template>

<style lang="scss" scoped>
.ink-spine {
  display: none;

  @media (min-width: 1024px) {
    position: fixed;
    inset: 0 auto 0 var(--safe-area-inset-left, env(safe-area-inset-left, 0px));
    z-index: 5;
    width: var(--gk-spine-width, 64px);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.125rem;
    padding: 1.5rem 0;
    background: var(--gk-paper);
    border-right: var(--gk-rule);
    font-family: var(--gk-font);
    pointer-events: none;
    user-select: none;
  }

  &__dot {
    width: 10px;
    height: 10px;
    flex-shrink: 0;
    border-radius: 50%;
    background: var(--gk-stamp);

    // Not a verdict, so not vermilion
    &--lost {
      background: var(--gk-ink-soft);
    }
  }

  &__title {
    writing-mode: vertical-rl;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: var(--gk-ink);
    white-space: nowrap;
    // Crossfades on page change (assets/css/main.scss)
    view-transition-name: gk-spine-title;
  }

  &__page {
    margin-top: auto;
    writing-mode: vertical-rl;
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    font-variant-numeric: tabular-nums;
    color: var(--gk-ink-soft);
    view-transition-name: gk-spine-page;
  }
}

@media print {
  .ink-spine {
    display: none;
  }
}
</style>
