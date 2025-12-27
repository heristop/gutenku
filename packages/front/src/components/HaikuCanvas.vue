<script lang="ts" setup>
import { computed, ref, useTemplateRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { Palette, Loader2, Download, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { useHaikuStore } from '@/store/haiku';
import { useImageDownload } from '@/composables/image-download';
import { useInView } from '@/composables/in-view';
import { useDebouncedCallback } from '@/composables/debounce';
import { useToast } from '@/composables/toast';
import { useTouchGestures } from '@/composables/touch-gestures';
import HankoStamp from '@/components/HankoStamp.vue';
import EnsoLoader from '@/components/EnsoLoader.vue';
import ZenTooltip from '@/components/ui/ZenTooltip.vue';

const { t } = useI18n();

const themeChangeAnnouncement = ref('');
const { success } = useToast();

const cardRef = useTemplateRef<HTMLElement>('cardRef');
const canvasRef = useTemplateRef<HTMLElement>('canvasRef');
const swipeRef = useTemplateRef<HTMLElement>('swipeRef');
const { isInView } = useInView(cardRef, { delay: 100 });

const { fetchNewHaiku } = useHaikuStore();

// Swipe to generate new haiku
const showSwipeHint = ref(true);
const { isSwiping, isTouchDevice } = useTouchGestures(swipeRef, {
  threshold: 60,
  onSwipeLeft: () => {
    if (!loading.value) {
      showSwipeHint.value = false;
      fetchNewHaiku();
    }
  },
  onSwipeRight: () => {
    if (!loading.value) {
      showSwipeHint.value = false;
      fetchNewHaiku();
    }
  },
  vibrate: true,
  vibrationPattern: [20],
});
const { haiku, loading, optionTheme, themeOptions } =
  storeToRefs(useHaikuStore());

watch(optionTheme, (newTheme) => {
  if (newTheme) {
    themeChangeAnnouncement.value = t('haikuCanvas.themeChanged', { theme: newTheme });
    setTimeout(() => {
      themeChangeAnnouncement.value = '';
    }, 1000);
  }
});

const { debouncedFn: debouncedFetchHaiku, isPending: isThemeChangePending } =
  useDebouncedCallback(fetchNewHaiku, 500);

const imageLoaded = ref(false);
const showHanko = ref(false);
const { inProgress: downloadInProgress, download } = useImageDownload();

const ripples = ref<Array<{ id: number; x: number; y: number }>>([]);
let rippleId = 0;
watch(imageLoaded, (loaded) => {
  if (loaded) {
    setTimeout(() => {
      showHanko.value = true;
    }, 800);
  }
});

watch(loading, (isLoading) => {
  if (isLoading) {
    showHanko.value = false;
    imageLoaded.value = false;
  }
});

const createRipple = (event: MouseEvent) => {
  if (!canvasRef.value) {return;}

  const rect = canvasRef.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const id = ++rippleId;
  ripples.value.push({ id, x, y });

  setTimeout(() => {
    ripples.value = ripples.value.filter((r) => r.id !== id);
  }, 1000);
};

const haikuImage = computed(() => {
  if (!haiku.value) {
    return;
  }

  return `data:image/png;base64,${haiku.value.image}`;
});

const downloadImage = async () => {
  if (!haikuImage.value || !haiku.value) {return;}

  const bookTitle = haiku.value.book.title;
  const chapterTitle = haiku.value.chapter.title;

  try {
    await download(haikuImage.value, {
      filename: `${bookTitle}_${chapterTitle}`,
    });
    success(t('haikuCanvas.downloadSuccess'));
  } catch {
    // Error already handled by toast composable
  }
};

const onImageLoad = () => {
  imageLoaded.value = true;
};
</script>

<template>
  <div
    ref="cardRef"
    class="animate-in haiku-canvas-wrapper"
    :class="{ 'is-visible': isInView }"
  >
    <v-card
      v-if="haiku"
      :loading="loading"
      :aria-busy="loading"
      :aria-label="t('haikuCanvas.ariaLabel')"
      class="gutenku-card haiku-canvas-card haiku-canvas-container pa-4 mb-6 align-center justify-center"
      color="accent"
      variant="tonal"
    >
      <div class="sr-only" aria-live="polite" aria-atomic="true">
        {{ themeChangeAnnouncement }}
      </div>

      <div
        ref="swipeRef"
        class="paper-frame"
        :class="{ 'is-swiping': isSwiping }"
      >
        <div
          v-if="loading"
          v-motion
          :initial="{ opacity: 0, scale: 0.95 }"
          :enter="{
            opacity: 1,
            scale: 1,
            transition: { duration: 400, ease: [0.25, 0.8, 0.25, 1] },
          }"
          :leave="{
            opacity: 0,
            scale: 0.98,
            transition: { duration: 200, ease: [0.4, 0, 1, 1] },
          }"
          class="zen-loading-skeleton"
        >
          <EnsoLoader :size="100" />
          <div class="loading-text">
            {{ t('haikuCanvas.loading') }}
          </div>
        </div>

        <v-sheet
          v-else
          v-motion
          :initial="{ opacity: 0, scale: 0.95, rotateY: 5 }"
          :enter="{
            opacity: 1,
            scale: 1,
            rotateY: 0,
            transition: { duration: 600, ease: [0.4, 0, 0.2, 1] },
          }"
          :leave="{
            opacity: 0,
            scale: 0.98,
            transition: { duration: 200, ease: [0.4, 0, 1, 1] },
          }"
          class="canvas-container pa-2"
          elevation="0"
        >
          <div
            ref="canvasRef"
            class="canvas water-ripple-container"
            @click="createRipple"
          >
            <v-img
              :src="haikuImage"
              :alt="haiku.verses.join(', ')"
              aspect-ratio="1/1"
              cover
              eager
              class="haiku-image"
              :class="{ 'haiku-image--reveal': imageLoaded }"
              @load="onImageLoad"
              @contextmenu.prevent
            />

            <div
              v-for="ripple in ripples"
              :key="ripple.id"
              class="water-ripple water-ripple--active"
              :style="{
                left: `${ripple.x}px`,
                top: `${ripple.y}px`,
                width: '100px',
                height: '100px',
                marginLeft: '-50px',
                marginTop: '-50px',
              }"
            />

            <HankoStamp :show="showHanko" :size="42" />

            <div class="canvas-focus-overlay" />

            <div class="paper-overlay" />

            <div class="aged-edges">
              <div class="edge edge-top" />
              <div class="edge edge-right" />
              <div class="edge edge-bottom" />
              <div class="edge edge-left" />
            </div>

            <!-- Swipe hint for touch devices -->
            <Transition name="swipe-hint-fade">
              <div
                v-if="isTouchDevice && showSwipeHint && !loading"
                class="swipe-hint-overlay"
              >
                <div class="swipe-hint">
                  <ChevronLeft
                    :size="16"
                    class="swipe-arrow swipe-arrow--left"
                  />
                  <span
                    class="swipe-text"
                    >{{ t('haikuChapter.swipeHint') }}</span
                  >
                  <ChevronRight
                    :size="16"
                    class="swipe-arrow swipe-arrow--right"
                  />
                </div>
              </div>
            </Transition>
          </div>
        </v-sheet>
      </div>

      <v-card-actions class="canvas-actions justify-between">
        <v-select
          v-model="optionTheme"
          :label="t('haikuCanvas.themeLabel')"
          :items="themeOptions"
          :loading="isThemeChangePending"
          variant="underlined"
          class="text-primary theme-selector"
          hide-details
          density="compact"
          :menu-props="{ contentClass: 'theme-selector-menu' }"
          @update:model-value="debouncedFetchHaiku()"
        >
          <template #prepend-inner>
            <Palette :size="18" class="text-primary" />
          </template>
        </v-select>

        <ZenTooltip :text="t('haikuCanvas.downloadTooltip')" position="bottom">
          <v-btn
            data-cy="download-btn"
            class="download-btn gutenku-btn"
            color="primary"
            variant="outlined"
            size="small"
            :loading="downloadInProgress"
            :disabled="loading"
            @click="downloadImage"
          >
            <Loader2
              v-if="downloadInProgress"
              :size="18"
              class="animate-spin"
            />
            <Download v-else :size="18" />
            <span class="btn-text">{{
              downloadInProgress ? t('haikuCanvas.saving') : t('haikuCanvas.download')
            }}</span>
          </v-btn>
        </ZenTooltip>
      </v-card-actions>
    </v-card>
  </div>
</template>

<style lang="scss" scoped>
// Screen reader only utility
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

.haiku-canvas-card {
  background: linear-gradient(
    135deg,
    var(--gutenku-paper-bg) 0%,
    var(--gutenku-paper-bg-warm) 100%
  );
  transition: var(--gutenku-transition-zen);
}

.paper-frame {
  width: 100%;
  max-width: 25rem;
  margin: 0 auto 1rem;
  position: relative;
  aspect-ratio: 1/1;
}

.zen-loading-skeleton {
  aspect-ratio: 1/1;
  background: var(--gutenku-paper-bg-aged);
  border-radius: 4px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  .loading-text {
    font-size: 0.9rem;
    color: var(--gutenku-text-zen);
    z-index: 3;
    text-align: center;
  }
}

.brush-stroke {
  position: absolute;
  background: linear-gradient(
    45deg,
    var(--gutenku-zen-primary),
    var(--gutenku-zen-accent)
  );
  border-radius: 2px;
  opacity: 0.3;
}

.brush-stroke-1 {
  width: 60%;
  height: 3px;
  top: 30%;
  left: 10%;
  animation: brush-draw 2s ease-in-out infinite;
  animation-delay: 0s;
}

.brush-stroke-2 {
  width: 40%;
  height: 2px;
  top: 50%;
  right: 15%;
  animation: brush-draw 2s ease-in-out infinite;
  animation-delay: 0.7s;
}

.brush-stroke-3 {
  width: 50%;
  height: 2px;
  bottom: 35%;
  left: 20%;
  animation: brush-draw 2s ease-in-out infinite;
  animation-delay: 1.4s;
}

.canvas-container {
  background: transparent;
}

.canvas {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  box-shadow:
    0 4px 12px oklch(0 0 0 / 0.15),
    inset 0 1px 0 oklch(1 0 0 / 0.2);

  &:hover {
    transition: var(--gutenku-transition-zen);

    .paper-overlay {
      opacity: 0.7;
    }

    .haiku-image {
      filter: contrast(1.02) brightness(1.01);
    }
  }
}

.haiku-image {
  transition: var(--gutenku-transition-zen);
  border-radius: 4px;
  clip-path: inset(100% 0 0 0);
  -webkit-clip-path: inset(100% 0 0 0);

  &--reveal {
    animation: paint-in-reveal 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
}

@keyframes paint-in-reveal {
  0% {
    clip-path: inset(100% 0 0 0);
    -webkit-clip-path: inset(100% 0 0 0);
  }
  100% {
    clip-path: inset(0 0 0 0);
    -webkit-clip-path: inset(0 0 0 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .haiku-image {
    clip-path: none;
    -webkit-clip-path: none;

    &--reveal {
      animation: none;
    }
  }
}

.canvas-focus-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--gutenku-canvas-overlay);
  pointer-events: none;
  border-radius: 4px;
  opacity: 0.8;
  transition: var(--gutenku-transition-zen);
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 60%;
    height: 60%;
    background: radial-gradient(
      circle,
      var(--gutenku-backdrop-overlay) 0%,
      transparent 70%
    );
    transform: translate(-50%, -50%);
    border-radius: 50%;
    animation: zen-breathe 4s ease-in-out infinite;
  }
}

@keyframes zen-breathe {
  0%,
  100% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

.paper-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(
      circle at 25% 25%,
      var(--gutenku-zen-mist) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 75% 75%,
      var(--gutenku-zen-water) 0%,
      transparent 50%
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 1px,
      var(--gutenku-zen-water) 1px,
      var(--gutenku-zen-water) 2px
    );
  pointer-events: none;
  opacity: 0.6;
  transition: var(--gutenku-transition-zen);
  border-radius: 4px;
}

.aged-edges {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  border-radius: 4px;
}

.edge {
  position: absolute;
  background: linear-gradient(
    to right,
    var(--gutenku-paper-border),
    transparent
  );

  &.edge-top {
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      to bottom,
      var(--gutenku-paper-border),
      transparent
    );
  }

  &.edge-right {
    top: 0;
    right: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(
      to left,
      var(--gutenku-paper-border),
      transparent
    );
  }

  &.edge-bottom {
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      to top,
      var(--gutenku-paper-border),
      transparent
    );
  }

  &.edge-left {
    top: 0;
    left: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(
      to right,
      var(--gutenku-paper-border),
      transparent
    );
  }
}

.canvas-actions {
  gap: 1rem;
  padding: 0.5rem 0 0;
}

.theme-selector {
  flex: 1;
  max-width: 12.5rem;

  :deep(.v-field__input) {
    font-size: 0.85rem;
  }
}

.download-btn {
  min-width: 7.5rem;

  &--celebrate {
    animation: download-celebrate 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: var(--gutenku-shadow-ink);

    &::before {
      width: 200%;
      height: 200%;
      animation: ink-splash 0.6s ease-out;
    }
  }

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: radial-gradient(
      circle,
      var(--gutenku-zen-mist) 0%,
      transparent 70%
    );
    transform: translate(-50%, -50%);
    border-radius: 50%;
    z-index: 0;
    transition: var(--gutenku-transition-zen);
  }

  .btn-text,
  .v-icon {
    position: relative;
    z-index: 1;
  }
}

@keyframes download-celebrate {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.15);
  }
  50% {
    transform: scale(0.95);
  }
  70% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes brush-draw {
  0% {
    transform: scaleX(0);
    opacity: 0;
  }
  50% {
    transform: scaleX(1);
    opacity: 0.6;
  }
  100% {
    transform: scaleX(0);
    opacity: 0;
  }
}

@keyframes ink-splash {
  0% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(0);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1);
  }
}

// Swipe feedback
.paper-frame {
  transition: transform 0.2s ease-out;

  &.is-swiping {
    transform: scale(0.98);
  }
}

// Swipe hint overlay
.swipe-hint-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 0.75rem;
  z-index: 10;
  pointer-events: none;
}

.swipe-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  background: oklch(0 0 0 / 0.6);
  backdrop-filter: blur(4px);
  border-radius: 1rem;
  color: oklch(1 0 0 / 0.9);
  font-size: 0.75rem;
  animation: swipe-hint-pulse 2s ease-in-out infinite;
}

.swipe-text {
  font-weight: 500;
}

.swipe-arrow {
  opacity: 0.8;

  &--left {
    animation: swipe-arrow-left 1.5s ease-in-out infinite;
  }

  &--right {
    animation: swipe-arrow-right 1.5s ease-in-out infinite;
  }
}

@keyframes swipe-hint-pulse {
  0%,
  100% {
    opacity: 0.85;
  }
  50% {
    opacity: 1;
  }
}

@keyframes swipe-arrow-left {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-3px);
  }
}

@keyframes swipe-arrow-right {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(3px);
  }
}

// Swipe hint fade transition
.swipe-hint-fade-enter-active {
  transition: opacity 0.3s ease-out;
}

.swipe-hint-fade-leave-active {
  transition: opacity 0.2s ease-in;
}

.swipe-hint-fade-enter-from,
.swipe-hint-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .paper-frame {
    max-width: 100%;
  }

  .canvas-actions {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }

  .theme-selector {
    max-width: 100%;
  }

  .download-btn {
    width: 100%;
  }

  .zen-loading-skeleton {
    .loading-text {
      font-size: 0.8rem;
    }
  }
}
</style>
