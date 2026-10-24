<script lang="ts" setup>
import { computed, ref, useTemplateRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import {
  Palette,
  ChevronLeft,
  ChevronRight,
} from '@/core/components/icons/ink';
import { useHaikuStore } from '@/features/haiku/store/haiku';
import { useDebouncedCallback } from '@/core/composables/debounce';
import { useTouchGestures } from '@/core/composables/touch-gestures';
import ZenCard from '@/core/components/ui/ZenCard.vue';
import ZenSelect from '@/core/components/ui/ZenSelect.vue';
import ZenImage from '@/core/components/ui/ZenImage.vue';
import InkPlate from '@/core/components/ink/InkPlate.vue';
import PlateQuill from '@/core/components/ink/plates/PlateQuill.vue';

const { t } = useI18n();

const themeChangeAnnouncement = ref('');

const swipeRef = useTemplateRef<HTMLElement>('swipeRef');

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
const {
  haiku,
  loading,
  optionTheme,
  themeOptions,
  imageAIThemes,
  generationProgress,
  imagePreviews,
} = storeToRefs(useHaikuStore());

// Dynamic loading label: "Drawing" when GA finished (stopReason set), otherwise "Crafting"
const loadingLabel = computed(() => {
  if (generationProgress.value.stopReason || imagePreviews.value.length > 0) {
    return t('haikuCanvas.drawing');
  }

  return t('haikuCanvas.loading');
});

watch(optionTheme, (newTheme) => {
  if (newTheme) {
    themeChangeAnnouncement.value = t('haikuCanvas.themeChanged', {
      theme: newTheme,
    });
    setTimeout(() => {
      themeChangeAnnouncement.value = '';
    }, 1000);
  }
});

const { debouncedFn: debouncedFetchHaiku, isPending: isThemeChangePending } =
  useDebouncedCallback(fetchNewHaiku, 500);

const imageLoaded = ref(false);

watch(loading, (isLoading) => {
  if (isLoading) {
    imageLoaded.value = false;
  }
});

const haikuImage = computed(() => {
  if (!haiku.value?.image) {
    return '';
  }

  return `data:image/png;base64,${haiku.value.image}`;
});

const onImageLoad = () => {
  imageLoaded.value = true;
};
</script>

<template>
  <div class="haiku-canvas-wrapper">
    <ZenCard
      v-if="haiku"
      variant="default"
      :loading="loading"
      :aria-label="t('haikuCanvas.ariaLabel')"
      class="haiku-canvas-card haiku-canvas-container"
    >
      <div class="sr-only" aria-live="polite" aria-atomic="true">
        {{ themeChangeAnnouncement }}
      </div>

      <div
        ref="swipeRef"
        class="paper-frame"
        :class="{ 'is-swiping': isSwiping }"
      >
        <Transition name="canvas-swap" mode="out-in">
          <div
            v-if="loading"
            key="loading"
            class="zen-loading-skeleton"
            :class="{ 'is-developing': imagePreviews.length > 0 }"
          >
            <!-- Drafts of the AI background, each washing in over the last,
                 sharper every time, until the finished card replaces them -->
            <img
              v-for="(src, index) in imagePreviews"
              :key="index"
              :src="src"
              alt=""
              class="draft"
              :class="`draft--${Math.min(index, 2)}`"
              decoding="async"
            />
            <InkPlate v-if="imagePreviews.length === 0" class="loading-plate">
              <PlateQuill />
            </InkPlate>
            <p class="loading-text">
              {{ loadingLabel }}
            </p>
          </div>

          <div v-else key="canvas" class="canvas-container">
            <div
              class="canvas"
              role="img"
              :aria-label="
                t('haikuCanvas.imageLabel', { verses: haiku.verses.join(', ') })
              "
            >
              <ZenImage
                :src="haikuImage"
                :alt="haiku.verses.join(', ')"
                aspect-ratio="3/4"
                fit="cover"
                :lazy="false"
                placeholder="none"
                :reveal="false"
                :prevent-context-menu="true"
                class="haiku-image"
                :class="{ 'haiku-image--reveal': imageLoaded }"
                @load="onImageLoad"
              />

              <!-- Swipe hint for touch devices -->
              <Transition name="swipe-hint-fade">
                <div
                  v-if="isTouchDevice && showSwipeHint && !loading"
                  class="swipe-hint-overlay"
                >
                  <div class="swipe-hint">
                    <ChevronLeft :size="16" aria-hidden="true" />
                    <span class="swipe-text">{{
                      t('haikuChapter.swipeHint')
                    }}</span>
                    <ChevronRight :size="16" aria-hidden="true" />
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </Transition>
      </div>

      <template #actions>
        <ZenSelect
          v-model="optionTheme"
          :label="t('haikuCanvas.themeLabel')"
          :options="themeOptions"
          :ai-themes="imageAIThemes"
          :loading="isThemeChangePending"
          class="theme-selector"
          @update:model-value="debouncedFetchHaiku()"
        >
          <template #icon>
            <Palette :size="18" />
          </template>
        </ZenSelect>
      </template>
    </ZenCard>
  </div>
</template>

<style lang="scss" scoped>
.haiku-canvas-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 1rem 0.75rem;

  // The card centres its content, which would shrink it to fit: the loading
  // frame and the drafts must take the same box as the finished print
  :deep(.zen-card__content) {
    width: 100%;
  }

  :deep(.zen-card__actions) {
    width: 100%;
    padding: 0.75rem 0.5rem 0;
  }
}

.paper-frame {
  width: 100%;
  max-width: 25rem;
  margin: 0 auto;
  position: relative;
  aspect-ratio: 3/4;
  transition: transform var(--gk-dur-fast) var(--gk-ease-out);

  &.is-swiping {
    transform: scale(0.98);
  }
}

.zen-loading-skeleton {
  aspect-ratio: 3/4;
  background: var(--gk-paper-deep);
  border-radius: var(--gk-radius-control);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  overflow: hidden;
  color: var(--gk-ink);

  .loading-plate {
    width: min(9rem, 50%);
    rotate: -1.5deg;
  }

  .loading-text {
    margin: 0;
    font-family: var(--gk-font);
    font-size: 0.875rem;
    color: var(--gk-ink-soft);
    text-align: center;
  }

  &.is-developing {
    position: relative;
    justify-content: flex-end;
    padding-bottom: 1rem;

    .loading-text {
      position: relative;
      padding: 0.25rem 0.75rem;
      border-radius: var(--gk-radius-control);
      background: color-mix(in srgb, var(--gk-paper) 82%, transparent);
    }
  }

  // A draft settles like ink into wet paper: it arrives soft and finds its
  // edges; later drafts start closer to the finished print
  .draft {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    animation: draft-wash 900ms var(--gk-ease-out) both;

    &--0 {
      --draft-blur: 6px;
    }

    &--1 {
      --draft-blur: 2px;
    }

    &--2 {
      --draft-blur: 0px;
    }
  }
}

@keyframes draft-wash {
  from {
    opacity: 0;
    filter: blur(calc(var(--draft-blur) + 8px)) saturate(0.6);
  }

  to {
    opacity: 1;
    filter: blur(var(--draft-blur)) saturate(0.85);
  }
}

@media (prefers-reduced-motion: reduce) {
  .zen-loading-skeleton .draft {
    animation: none;
    filter: blur(var(--draft-blur)) saturate(0.85);
  }
}

// The card sits on the page like a loose leaf: no frame, only the paper lift
.canvas {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: var(--gk-lift);
}

// Plate reveal: the print settles onto its mount, a calm paper fade
.haiku-image {
  border-radius: 4px;
  opacity: 0;

  &--reveal {
    animation: plate-settle 480ms var(--gk-ease-out) forwards;
  }
}

@keyframes plate-settle {
  from {
    opacity: 0;
    transform: scale(1.015);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.canvas-swap-enter-active,
.canvas-swap-leave-active {
  transition: opacity var(--gk-dur-base) var(--gk-ease-out);
}

.canvas-swap-enter-from,
.canvas-swap-leave-to {
  opacity: 0;
}

.theme-selector {
  max-width: 12.5rem;
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
  background: var(--gk-paper);
  border-radius: var(--gk-radius-control);
  box-shadow: inset 0 0 0 1.5px var(--gk-ink);
  color: var(--gk-ink);
  font-family: var(--gk-font);
  font-size: 0.875rem;
}

.swipe-hint-fade-enter-active {
  transition: opacity var(--gk-dur-base) var(--gk-ease-out);
}

.swipe-hint-fade-leave-active {
  transition: opacity var(--gk-dur-fast) var(--gk-ease-out);
}

.swipe-hint-fade-enter-from,
.swipe-hint-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .haiku-image--reveal {
    animation: plate-fade var(--gk-dur-fast) var(--gk-ease-out) forwards;
  }

  .paper-frame {
    transition: none;
  }

  .paper-frame.is-swiping {
    transform: none;
  }
}

@keyframes plate-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.haiku-image {
  filter: var(--gk-plate-filter);
}

@media (max-width: 768px) {
  .haiku-canvas-card {
    margin-top: 0 !important;
  }

  .paper-frame {
    max-width: 100%;
  }

  .theme-selector {
    max-width: 100%;
  }
}
</style>
