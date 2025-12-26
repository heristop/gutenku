<script lang="ts" setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useHaikuStore } from '@/store/haiku';

const { fetchNewHaiku } = useHaikuStore();
const { haiku, loading, optionTheme, themeOptions } =
  storeToRefs(useHaikuStore());

const imageLoaded = ref(false);
const downloadInProgress = ref(false);

const haikuImage = computed(() => {
  if (!haiku.value) {
    return;
  }

  return `data:image/png;base64,${haiku.value.image}`;
});

const downloadImage = async () => {
  downloadInProgress.value = true;

  try {
    const imageData = haikuImage.value as string;
    const downloadLink = document.createElement('a');
    const bookTitle = haiku.value.book.title;
    const chapterTitle = haiku.value.chapter.title;

    downloadLink.href = imageData;
    downloadLink.download = `${bookTitle}_${chapterTitle}`
      .toLowerCase()
      .replace(/[ ;.,]/g, '_');
    downloadLink.target = '_blank';
    downloadLink.click();

    // Brief delay for ink splash effect
    setTimeout(() => {
      downloadInProgress.value = false;
    }, 1000);
  } catch {
    downloadInProgress.value = false;
  }
};

const onImageLoad = () => {
  imageLoaded.value = true;
};
</script>

<template>
  <v-card
    v-if="haiku"
    :loading="loading"
    class="gutenku-card haiku-canvas-card pa-4 mb-6 align-center justify-center"
    color="accent"
    variant="tonal"
  >
    <!-- Paper Frame with Aged Edges -->
    <div class="paper-frame">
      <!-- Loading Skeleton with Zen Brush Strokes -->
      <div
        v-if="loading"
        class="zen-loading-skeleton"
      >
        <div class="brush-stroke brush-stroke-1" />
        <div class="brush-stroke brush-stroke-2" />
        <div class="brush-stroke brush-stroke-3" />
        <div class="loading-text">
          Painting your haiku...
        </div>
      </div>

      <!-- Canvas Container -->
      <v-sheet
        v-else
        class="canvas-container pa-2"
        elevation="0"
        :class="{ 'image-loaded': imageLoaded }"
      >
        <div class="canvas">
          <v-img
            :src="haikuImage"
            :lazy-src="haikuImage"
            :alt="haiku.verses.join(', ')"
            aspect-ratio="1/1"
            cover
            class="haiku-image"
            @load="onImageLoad"
            @contextmenu.prevent
          />

          <!-- Canvas Focus Overlay -->
          <div class="canvas-focus-overlay" />

          <!-- Paper Texture Overlay -->
          <div class="paper-overlay" />

          <!-- Aged Paper Edges -->
          <div class="aged-edges">
            <div class="edge edge-top" />
            <div class="edge edge-right" />
            <div class="edge edge-bottom" />
            <div class="edge edge-left" />
          </div>
        </div>
      </v-sheet>
    </div>

    <!-- Controls -->
    <v-card-actions class="canvas-actions justify-between">
      <!-- Theme Selector -->
      <v-select
        v-model="optionTheme"
        @update:model-value="fetchNewHaiku()"
        label="Artistic Theme"
        :items="themeOptions"
        variant="underlined"
        class="text-primary theme-selector"
        hide-details
        density="compact"
      >
        <template #prepend-inner>
          <v-icon
            color="primary"
            size="small"
          >
            mdi-palette
          </v-icon>
        </template>
      </v-select>

      <!-- Download Button with Ink Splash -->
      <v-btn
        @click="downloadImage"
        data-cy="download-btn"
        class="download-btn gutenku-btn"
        color="primary"
        variant="outlined"
        size="small"
        :loading="downloadInProgress"
        :disabled="loading"
      >
        <v-icon>
          {{
            downloadInProgress ? 'mdi-loading mdi-spin' : 'mdi-download'
          }}
        </v-icon>
        <span class="btn-text">{{
          downloadInProgress ? 'Saving...' : 'Download'
        }}</span>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style lang="scss" scoped>
.haiku-canvas-card {
  background: linear-gradient(
    135deg,
    var(--gutenku-paper-bg) 0%,
    var(--gutenku-paper-bg-warm) 100%
  );
  transition: var(--gutenku-transition-zen);
}

// Paper Frame Container
.paper-frame {
  width: 100%;
  max-width: 400px;
  margin: 0 auto 1rem;
  position: relative;
}

// Zen Loading Skeleton
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

// Brush Stroke Animations
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

// Canvas Container
.canvas-container {
  background: transparent;
  transition: var(--gutenku-transition-slow);
  opacity: 0;
  transform: scale(0.95) rotateY(5deg);

  &.image-loaded {
    opacity: 1;
    transform: scale(1) rotateY(0deg);
  }
}

// Canvas with Paper Effects
.canvas {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);

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

// Haiku Image
.haiku-image {
  transition: var(--gutenku-transition-zen);
  border-radius: 4px;
}

// Canvas Focus Overlay - Improves contrast and focus
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

  // Subtle breathing effect for zen atmosphere
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

// Paper Texture Overlay
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

// Aged Paper Edges
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

// Controls
.canvas-actions {
  gap: 1rem;
  padding: 0.5rem 0 0;
}

.theme-selector {
  flex: 1;
  max-width: 200px;

  :deep(.v-field__input) {
    font-size: 0.85rem;
  }
}

.download-btn {
  min-width: 120px;

  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: var(--gutenku-shadow-ink);

    &::before {
      width: 200%;
      height: 200%;
      animation: ink-splash 0.6s ease-out;
    }
  }

  // Ink splash effect on download
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

// Animations
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

// Mobile Optimizations
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
