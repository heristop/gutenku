<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import InkBook from '@/core/components/decorative/InkBook.vue';
import { isInkLoading } from '@/core/composables/ink-loading';

// The site's single loading indicator: the GutenKu book writing
// its haiku. It waits 200ms before showing so quick loads never flicker, stays
// at least 400ms once shown, and when the wait ends the stamp seals the page
// before the slip fades away.
const SHOW_DELAY_MS = 200;
const MIN_VISIBLE_MS = 400;
// The verses finish (160ms) while the stamp presses (120ms in, 260ms)
const SEAL_MS = 420;

const { t } = useI18n();
const visible = ref(false);
const sealed = ref(false);
let showTimer: ReturnType<typeof setTimeout> | undefined;
let hideTimer: ReturnType<typeof setTimeout> | undefined;
let shownAt = 0;

watch(
  isInkLoading,
  (busy) => {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);

    if (busy) {
      sealed.value = false;
      showTimer = setTimeout(() => {
        visible.value = true;
        shownAt = Date.now();
      }, SHOW_DELAY_MS);

      return;
    }

    if (!visible.value) {
      return;
    }

    const remaining = Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAt));
    hideTimer = setTimeout(() => {
      sealed.value = true;
      hideTimer = setTimeout(() => {
        visible.value = false;
        sealed.value = false;
      }, SEAL_MS);
    }, remaining);
  },
  { immediate: true },
);
</script>

<template>
  <div class="ink-loading" role="status" aria-live="polite">
    <span class="sr-only">{{ visible ? t('common.loading') : '' }}</span>
    <Transition name="ink-loading">
      <div v-if="visible" class="ink-loading__slip" aria-hidden="true">
        <InkBook :size="64" :sealed="sealed" class="ink-loading__book" />
        <span class="ink-loading__label">{{ t('common.loading') }}</span>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
// Centred on the page's content area (the spine's width is left out on
// desktop), on a small library slip that keeps the book legible. The
// page stays visible and usable underneath: nothing is blocked or dimmed.
.ink-loading {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 900;
  transform: translate(-50%, -50%);
  pointer-events: none;

  @media (min-width: 1024px) {
    left: calc(50% + var(--gk-spine-width) / 2);
  }

  &__slip {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    width: 10.5rem;
    max-width: calc(100vw - 2rem);
    padding: 0.75rem 1.25rem 1rem;
    background-color: var(--gk-paper-raised);
    background-image: var(--gk-paper-texture);
    border-radius: var(--gk-radius-paper);
    box-shadow: var(--gk-lift);

    &::before {
      content: '';
      position: absolute;
      inset: 0.375rem;
      border: 3px double var(--gk-ink-faint);
    }
  }

  &__label {
    width: 100%;
    min-height: 1.25rem;
    font-family: var(--gk-font);
    font-size: 0.8125rem;
    line-height: 1.25rem;
    color: var(--gk-ink-soft);
    text-align: center;
  }
}

// Fade the slip without moving or scaling its text. Only the book animates.
.ink-loading-enter-active {
  transition: opacity var(--gk-dur-base) var(--gk-ease-out);
}

.ink-loading-leave-active {
  transition: opacity var(--gk-dur-fast) var(--gk-ease-out);
}

.ink-loading-enter-from,
.ink-loading-leave-to {
  opacity: 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .ink-loading-enter-active,
  .ink-loading-leave-active {
    transition: opacity 120ms ease;
  }
}
</style>
