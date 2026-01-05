<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ALargeSmall } from 'lucide-vue-next';
import { useAccessibility } from '@/core/composables/accessibility';
import ZenTooltip from '@/core/components/ui/ZenTooltip.vue';

const { t } = useI18n();
const { dyslexiaEnabled, toggleDyslexia } = useAccessibility();

const dyslexiaTooltip = computed(() =>
  dyslexiaEnabled.value
    ? t('footer.accessibility.dyslexiaOn')
    : t('footer.accessibility.dyslexiaOff'),
);
</script>

<template>
  <ZenTooltip :text="dyslexiaTooltip" position="top">
    <button
      type="button"
      class="a11y-toggle-btn"
      :class="{ 'a11y-toggle-btn--active': dyslexiaEnabled }"
      :aria-label="dyslexiaTooltip"
      :aria-pressed="dyslexiaEnabled"
      @click="toggleDyslexia"
    >
      <span class="a11y-toggle-btn__circle" aria-hidden="true" />
      <ALargeSmall :size="20" :stroke-width="1.5" />
    </button>
  </ZenTooltip>
</template>

<style lang="scss" scoped>
.a11y-toggle-btn {
  position: relative;
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: var(--gutenku-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;

  svg {
    position: relative;
    z-index: 1;
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  &:hover {
    color: var(--gutenku-zen-primary);

    svg {
      transform: translateY(-2px) scale(1.05);
    }

    .a11y-toggle-btn__circle {
      transform: scale(1) rotate(0deg);
      opacity: 0.1;
    }
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-primary);
    outline-offset: 2px;
  }

  &__circle {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at center,
      var(--gutenku-zen-primary) 0%,
      var(--gutenku-zen-primary) 50%,
      transparent 100%
    );
    border-radius: 50%;
    transform: scale(0) rotate(-30deg);
    opacity: 0;
    transition:
      transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
      opacity 0.25s ease;
  }

  // Active state
  &--active {
    color: var(--gutenku-zen-primary);

    .a11y-toggle-btn__circle {
      transform: scale(1) rotate(0deg);
      opacity: 0.15;
    }

    &:hover {
      .a11y-toggle-btn__circle {
        opacity: 0.2;
      }
    }
  }
}

// Dark theme
[data-theme='dark'] .a11y-toggle-btn {
  color: var(--gutenku-text-primary);

  &:hover {
    color: var(--gutenku-zen-accent);
  }

  .a11y-toggle-btn__circle {
    background: radial-gradient(
      circle at center,
      var(--gutenku-zen-accent) 0%,
      var(--gutenku-zen-accent) 50%,
      transparent 100%
    );
  }

  &--active {
    color: var(--gutenku-zen-accent);
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .a11y-toggle-btn {
    transition: none;

    svg {
      transition: none;
    }

    &__circle {
      transition: none;
    }

    &:hover {
      svg {
        transform: none;
      }
    }
  }
}
</style>
