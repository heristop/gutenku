<script lang="ts" setup>
import { ref, computed, watch } from 'vue';

interface Props {
  src: string;
  alt: string;
  aspectRatio?: string;
  width?: string | number;
  height?: string | number;
  fit?: 'cover' | 'contain' | 'fill';
  lazy?: boolean;
  priority?: boolean;
  placeholder?: 'shimmer' | 'blur' | 'none';
  fallback?: string;
  reveal?: boolean;
  viewTransitionName?: string;
  preventContextMenu?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  aspectRatio: undefined,
  width: undefined,
  height: undefined,
  fit: 'cover',
  lazy: true,
  priority: false,
  placeholder: 'shimmer',
  fallback: undefined,
  reveal: true,
  viewTransitionName: undefined,
  preventContextMenu: false,
});

const emit = defineEmits<{
  load: [event: Event];
  error: [event: Event];
}>();

const imgRef = ref<HTMLImageElement | null>(null);
const isLoaded = ref(false);
const hasError = ref(false);

// Check if image is decorative (empty alt)
const isDecorative = computed(() => props.alt === '');

// Container classes
const imageClasses = computed(() => [
  'zen-image',
  {
    'zen-image--loaded': isLoaded.value,
    'zen-image--error': hasError.value,
    'zen-image--reveal': props.reveal && isLoaded.value,
  },
]);

// Container styles with fallback aspect-ratio
const containerStyle = computed(() => {
  const style: Record<string, string> = {};

  // Use explicit aspectRatio if provided
  if (props.aspectRatio) {
    style.aspectRatio = props.aspectRatio;
  }

  // Otherwise calculate from width/height if both are provided
  if (!props.aspectRatio && props.width && props.height) {
    const w =
      typeof props.width === 'number'
        ? props.width
        : Number.parseInt(props.width, 10);
    const h =
      typeof props.height === 'number'
        ? props.height
        : Number.parseInt(props.height, 10);

    if (w && h) {
      style.aspectRatio = `${w} / ${h}`;
    }
  }

  if (props.width) {
    style.width =
      typeof props.width === 'number' ? `${props.width}px` : props.width;
  }

  if (props.height) {
    style.height =
      typeof props.height === 'number' ? `${props.height}px` : props.height;
  }

  if (props.viewTransitionName) {
    style.viewTransitionName = props.viewTransitionName;
  }

  return style;
});

// Determine loading attribute based on priority and lazy props
const loadingAttr = computed(() => {
  if (props.priority) {
    return 'eager';
  }
  return props.lazy ? 'lazy' : 'eager';
});

// Determine fetchpriority attribute
const fetchPriorityAttr = computed(() => {
  return props.priority ? 'high' : undefined;
});

// Image styles
const imageStyle = computed(() => ({
  objectFit: props.fit,
}));

// Current source (switches to fallback on error)
const currentSrc = computed(() => {
  if (hasError.value && props.fallback) {
    return props.fallback;
  }
  return props.src;
});

function onLoad(event: Event) {
  isLoaded.value = true;
  hasError.value = false;
  emit('load', event);
}

function onError(event: Event) {
  if (props.fallback && currentSrc.value !== props.fallback) {
    // Try fallback image
    hasError.value = false;
    emit('error', event);
    return;
  }

  hasError.value = true;
  emit('error', event);
}

function onContextMenu(event: MouseEvent) {
  if (props.preventContextMenu) {
    event.preventDefault();
  }
}

// Reset state when src changes
watch(
  () => props.src,
  () => {
    isLoaded.value = false;
    hasError.value = false;
  },
);
</script>

<template>
  <div
    :class="imageClasses"
    :style="containerStyle"
    :aria-busy="!isLoaded && !hasError"
    :aria-hidden="isDecorative || undefined"
  >
    <!-- Placeholder (shown while loading) -->
    <div
      v-if="!isLoaded && !hasError && placeholder !== 'none'"
      class="zen-image__placeholder"
      :class="`zen-image__placeholder--${placeholder}`"
      aria-hidden="true"
    />

    <!-- Actual image -->
    <img
      v-show="isLoaded || hasError"
      ref="imgRef"
      :src="currentSrc"
      :alt="alt"
      :loading="loadingAttr"
      :fetchpriority="fetchPriorityAttr"
      :style="imageStyle"
      class="zen-image__img"
      :class="{ 'zen-image__img--loaded': isLoaded }"
      @load="onLoad"
      @error="onError"
      @contextmenu="onContextMenu"
    />

    <!-- Error state (only if no fallback or fallback also failed) -->
    <div
      v-if="hasError && !fallback"
      class="zen-image__error"
      role="img"
      :aria-label="alt"
    >
      <svg
        class="zen-image__error-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
      >
        <!-- Ink brush stroke icon -->
        <path d="M4 20c2-2 4-6 8-6s6 4 8 6" stroke-linecap="round" />
        <circle cx="8" cy="8" r="2" />
        <rect x="2" y="2" width="20" height="20" rx="2" />
      </svg>
      <span class="zen-image__error-text">{{ alt }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.zen-image {
  position: relative;
  display: block;
  overflow: hidden;
  background-color: var(--gutenku-paper-bg);
}

// Placeholder styles
.zen-image__placeholder {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.zen-image__placeholder--shimmer {
  background: linear-gradient(
    110deg,
    var(--gutenku-paper-bg) 0%,
    var(--gutenku-zen-water) 50%,
    var(--gutenku-paper-bg) 100%
  );
  background-size: 200% 100%;
  animation: zen-shimmer 1.5s ease-in-out infinite;
}

.zen-image__placeholder--blur {
  background: var(--gutenku-zen-water);
  filter: blur(20px);
  opacity: 0.6;
}

@keyframes zen-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

// Image styles
.zen-image__img {
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition:
    opacity var(--gutenku-duration-gentle) ease,
    transform var(--gutenku-duration-gentle) ease;
}

.zen-image__img--loaded {
  opacity: 1;
}

// Reveal animation
.zen-image--reveal .zen-image__img--loaded {
  animation: zen-image-reveal var(--gutenku-duration-gentle) ease forwards;
}

@keyframes zen-image-reveal {
  0% {
    opacity: 0;
    transform: scale(1.02);
    filter: blur(4px);
  }
  100% {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }
}

// Error state
.zen-image__error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--gutenku-paper-bg);
  color: var(--gutenku-text-muted);
}

.zen-image__error-icon {
  width: 2rem;
  height: 2rem;
  opacity: 0.5;
}

.zen-image__error-text {
  font-size: 0.75rem;
  text-align: center;
  opacity: 0.7;
  max-width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .zen-image__placeholder--shimmer {
    animation: none;
    background: var(--gutenku-zen-water);
    opacity: 0.3;
  }

  .zen-image__img {
    transition: opacity var(--gutenku-duration-swift) ease;
  }

  .zen-image--reveal .zen-image__img--loaded {
    animation: none;
    opacity: 1;
    transform: none;
    filter: none;
  }
}

// Dark mode
[data-theme='dark'] {
  .zen-image__placeholder--shimmer {
    background: linear-gradient(
      110deg,
      var(--gutenku-paper-bg) 0%,
      oklch(0.35 0.03 55 / 0.5) 50%,
      var(--gutenku-paper-bg) 100%
    );
    background-size: 200% 100%;
  }

  .zen-image__placeholder--blur {
    background: oklch(0.3 0.02 55);
  }
}
</style>
