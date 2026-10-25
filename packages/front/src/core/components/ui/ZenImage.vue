<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { Image as ImageIcon } from '@/core/components/icons/ink';

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

const isLoaded = ref(false);
const hasError = ref(false);
const usingFallback = ref(false);

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

// Helper to convert dimension to number
function parseDimension(value: string | number | undefined): number {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    return Number.parseInt(value, 10);
  }

  return 0;
}

// Helper to format dimension as CSS value
function formatDimension(value: string | number): string {
  return typeof value === 'number' ? `${value}px` : value;
}

// Helper to compute aspect ratio from dimensions
function computeAspectRatio(
  explicitRatio: string | undefined,
  width: string | number | undefined,
  height: string | number | undefined,
): string | undefined {
  if (explicitRatio) {
    return explicitRatio;
  }

  if (!width || !height) {
    return undefined;
  }

  const w = parseDimension(width);
  const h = parseDimension(height);

  return w && h ? `${w} / ${h}` : undefined;
}

// Container styles with fallback aspect-ratio
const containerStyle = computed(() => {
  const style: Record<string, string> = {};

  const aspectRatio = computeAspectRatio(
    props.aspectRatio,
    props.width,
    props.height,
  );

  if (aspectRatio) {
    style.aspectRatio = aspectRatio;
  }

  if (props.width) {
    style.width = formatDimension(props.width);
  }

  if (props.height) {
    style.height = formatDimension(props.height);
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
  if (usingFallback.value && props.fallback) {
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
  if (props.fallback && !usingFallback.value) {
    // Try the fallback image once before showing the error leaf
    usingFallback.value = true;
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
    usingFallback.value = false;
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
      v-show="isLoaded"
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

    <!-- Error state: the source and any fallback both failed -->
    <figure v-if="hasError" class="zen-image__error">
      <ImageIcon :size="32" class="zen-image__error-icon" aria-hidden="true" />
      <figcaption class="zen-image__error-text">{{ alt }}</figcaption>
    </figure>
  </div>
</template>

<style lang="scss" scoped>
// Ex Libris: images sit on paper. While loading, a static paper-deep plate;
// on failure, the ink Image glyph and the alt text on that same plate.
.zen-image {
  position: relative;
  display: block;
  overflow: hidden;
  background-color: var(--gk-paper-deep);
}

.zen-image__placeholder {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: var(--gk-paper-deep);
}

.zen-image__img {
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity var(--gk-dur-reward) var(--gk-ease-out);
}

.zen-image__img--loaded {
  opacity: 1;
}

.zen-image__error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 0;
  padding: 1rem;
  background: var(--gk-paper-deep);
  color: var(--gk-ink-soft);
  font-family: var(--gk-font);
}

.zen-image__error-text {
  max-width: 80%;
  overflow: hidden;
  font-size: 0.875rem;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .zen-image__img {
    transition: opacity var(--gk-dur-fast) linear;
  }
}
</style>
