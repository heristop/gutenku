<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { Home } from '@/core/components/icons/ink';
import ZenCard from '@/core/components/ui/ZenCard.vue';
import ZenButton from '@/core/components/ui/ZenButton.vue';
import ZenHaiku from '@/core/components/ui/ZenHaiku.vue';
import BrushRule from '@/core/components/ink/BrushRule.vue';

import { computed } from 'vue';

const { t, tm, rt } = useI18n();

// A haiku found in a book, translated with the rest of the page
const haikuLines = computed(() =>
  (tm('notFound.haiku') as unknown as string[]).map((line) => rt(line)),
);
</script>

<template>
  <div class="not-found">
    <ZenCard
      variant="default"
      class="not-found__card"
      :aria-label="t('notFound.title')"
    >
      <img
        src="/gutenmage.webp"
        alt=""
        aria-hidden="true"
        class="not-found__illustration"
        width="1536"
        height="1024"
        decoding="async"
      />

      <h1 class="not-found__title">
        <span class="not-found__number" aria-hidden="true">404</span>
        <span class="not-found__label">{{ t('notFound.title') }}</span>
      </h1>

      <ZenHaiku
        :lines="haikuLines"
        size="sm"
        :animated="true"
        :show-brush-stroke="false"
        class="not-found__haiku"
      />

      <BrushRule class="not-found__rule" />

      <ZenButton to="/" class="not-found__action">
        <template #icon-left>
          <Home :size="18" aria-hidden="true" />
        </template>
        {{ t('notFound.returnHome') }}
      </ZenButton>
    </ZenCard>
  </div>
</template>

<style lang="scss" scoped>
// Ex Libris: a leaf missing from the shelf. Oversized typed numerals, the
// meta under them, a short poem, then the one way back.
.not-found {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 2rem 1rem 1.5rem;
  font-family: var(--gk-font);

  &__card {
    width: 100%;
    max-width: 26rem;
    padding: 2rem 1.5rem;
    text-align: center;
    animation: not-found-in var(--gk-dur-reward) var(--gk-ease-out) both;

    @media (min-width: 600px) {
      padding: 2.5rem 2.5rem 2.25rem;
    }
  }

  &__illustration {
    display: block;
    width: 160px;
    height: auto;
    margin: 0 auto 1.25rem;
    aspect-ratio: 3 / 2;

    @media (min-width: 600px) {
      width: 200px;
    }

    // The drawing is sumi line on transparent paper: on the night page it is
    // tipped in on a light leaf, like the home plate, never inverted
    // A little askew, as a plate pasted in by hand, so it never reads as a
    // grey placeholder
    [data-theme='dark'] & {
      padding: 0.75rem;
      transform: rotate(-1.5deg);
      object-fit: contain;
      background: var(--gk-plate-leaf);
      border-radius: 2px;
      box-shadow: var(--gk-lift);
      filter: var(--gk-plate-filter);
    }
  }

  &__title {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 1.25rem;
    font-weight: 400;
  }

  &__number {
    font-size: clamp(3.5rem, 12vw, 4.75rem);
    line-height: 0.9;
    letter-spacing: -0.04em;
    font-variant-numeric: tabular-nums;
    color: var(--gk-ink);
  }

  &__label {
    font-size: 1rem;
    font-weight: 700;
    color: var(--gk-ink-soft);
  }

  &__haiku {
    margin-bottom: 0.5rem;
  }

  &__rule {
    margin: 0 auto 1.5rem;
    max-width: 8rem;
  }
}

@keyframes not-found-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .not-found__card {
    animation: none;
  }
}

// Every page starts the same distance below the header's rule: the card
// hangs from the top like the others instead of floating mid-page
.not-found {
  align-items: flex-start;
  padding-top: var(--gk-page-top);
}
</style>
