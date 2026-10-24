<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineProps<{
  lines?: number;
  variant?: 'text' | 'title' | 'image';
}>();
</script>

<template>
  <output
    class="zen-skeleton"
    :class="[`zen-skeleton--${variant || 'text'}`]"
    aria-busy="true"
    :aria-label="t('common.loading')"
  >
    <span
      v-for="n in lines || 3"
      :key="n"
      class="zen-skeleton__stroke"
      aria-hidden="true"
    />
  </output>
</template>

<style scoped lang="scss">
// Ex Libris: faint typed lines waiting for ink. Static paper-deep blocks
// with one short fade-in; the site-wide quill carries the loading signal.
.zen-skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  &--title {
    .zen-skeleton__stroke {
      height: 1.5rem;
      width: 60%;
      margin: 0 auto;
    }
  }

  &--text {
    .zen-skeleton__stroke {
      height: 0.75rem;

      &:nth-child(odd) {
        width: 90%;
      }

      &:nth-child(even) {
        width: 75%;
      }

      &:last-child {
        width: 50%;
      }
    }
  }

  &--image {
    position: relative;
    aspect-ratio: 1/1;
    border-radius: var(--gk-radius-paper);

    .zen-skeleton__stroke {
      position: absolute;
      height: 3px;

      &:nth-child(1) {
        width: 60%;
        top: 30%;
        left: 10%;
      }

      &:nth-child(2) {
        width: 40%;
        top: 50%;
        right: 15%;
        left: auto;
      }

      &:nth-child(3) {
        width: 50%;
        bottom: 35%;
        left: 20%;
        top: auto;
      }
    }
  }

  &__stroke {
    display: block;
    background: var(--gk-paper-deep);
    border-radius: 1px;
    animation: zen-skeleton-in var(--gk-dur-reward) var(--gk-ease-out) both;
  }
}

@keyframes zen-skeleton-in {
  from {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .zen-skeleton__stroke {
    animation: none;
  }
}
</style>
