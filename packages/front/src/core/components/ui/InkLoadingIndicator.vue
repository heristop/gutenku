<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import InkBook from '@/core/components/decorative/InkBook.vue';
import { isInkLoading } from '@/core/composables/ink-loading';

// The site's single loading indicator, under the nav: the GutenKu book writing
// its haiku. It waits 200ms before showing so quick loads never flicker, stays
// at least 400ms once shown, and when the wait ends the stamp seals the page
// before the book lifts away.
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
      <InkBook
        v-if="visible"
        :size="56"
        :sealed="sealed"
        class="ink-loading__book"
      />
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
// Centred on the page's content area (the spine's width is left out on
// desktop), over a soft paper halo so the book reads above any page. The
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

  &__book {
    display: block;
    box-sizing: content-box;
    padding: 1.25rem;
    // Plain paper fading to nothing (sRGB interpolation keeps the hue true)
    background: radial-gradient(
      closest-side in srgb,
      var(--gutenku-app-bg) 52%,
      transparent
    );
    border-radius: 50%;
  }
}

// The book settles in (240ms, from slightly small) and lifts away quicker
// (180ms): the page underneath has arrived, the indicator should not linger.
.ink-loading-enter-active {
  transition:
    opacity var(--gk-dur-base) var(--gk-ease-out),
    transform var(--gk-dur-base) var(--gk-ease-out);
}

.ink-loading-leave-active {
  transition:
    opacity var(--gk-dur-fast) var(--gk-ease-out),
    transform var(--gk-dur-fast) var(--gk-ease-out);
}

.ink-loading-enter-from {
  opacity: 0;
  transform: scale(0.92);
}

.ink-loading-leave-to {
  opacity: 0;
  transform: translateY(-6px);
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

  .ink-loading-enter-from,
  .ink-loading-leave-to {
    transform: none;
  }
}
</style>
