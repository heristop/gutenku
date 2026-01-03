<script lang="ts" setup>
import { ChevronRight } from 'lucide-vue-next';
import { useMouseParallax } from '@/core/composables/parallax';

defineProps<{
  to: string;
  title: string;
  description: string;
  ctaText: string;
  imageSrc: string;
  imageSrcset?: string;
  imageSizes?: string;
  imageAlt: string;
  ariaLabel: string;
  viewTransitionName?: string;
  illustrationViewTransitionName?: string;
}>();

defineSlots<{
  subtitle?: () => unknown;
}>();

const { translateX, translateY, handleMouseMove, handleMouseLeave } = useMouseParallax(15);
</script>

<template>
  <RouterLink
    :to="to"
    class="preview-card gutenku-card"
    :aria-label="ariaLabel"
    :style="viewTransitionName ? { viewTransitionName } : undefined"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <div class="preview-card__header">
      <img
        :src="imageSrc"
        :srcset="imageSrcset"
        :sizes="imageSizes"
        :alt="imageAlt"
        class="preview-card__illustration"
        width="640"
        height="427"
        loading="lazy"
        :style="{
          transform: `translate(${translateX}px, ${translateY}px) scale(1.15)`,
          viewTransitionName: illustrationViewTransitionName,
        }"
      />
      <div class="preview-card__overlay">
        <div class="preview-card__title-row">
          <div>
            <h2 class="preview-card__title">{{ title }}</h2>
            <slot name="subtitle" />
          </div>
        </div>
      </div>
    </div>

    <div class="preview-card__body">
      <p class="preview-card__description">{{ description }}</p>
      <span class="preview-card__cta">
        {{ ctaText }}
        <ChevronRight :size="16" />
      </span>
    </div>
  </RouterLink>
</template>

<style lang="scss" scoped>
.preview-card {
  display: block;
  text-decoration: none;
  background: var(--gutenku-paper-bg);
  border: 1px solid var(--gutenku-paper-border);
  border-radius: var(--gutenku-radius-lg);
  overflow: hidden;
  transition: var(--gutenku-transition-zen);
  box-shadow: var(--gutenku-shadow-zen);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--gutenku-shadow-elevated);

    .preview-card__cta {
      color: var(--gutenku-zen-primary);

      svg {
        transform: translateX(4px);
      }
    }
  }

  &:active {
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-primary);
    outline-offset: 2px;
  }
}

.preview-card__header {
  position: relative;
  height: 140px;
  overflow: hidden;
}

.preview-card__illustration {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(20%);
  transition: transform 0.15s ease-out;
  opacity: 0;
  animation: illustration-appear 0.8s ease-out 0.3s forwards;
  will-change: transform;

  [data-theme='dark'] & {
    filter: grayscale(30%) brightness(0.85);
  }
}

@keyframes illustration-appear {
  to {
    opacity: 0.7;
  }
}

[data-theme='dark'] .preview-card__illustration {
  animation: illustration-appear-dark 0.8s ease-out 0.3s forwards;
}

@keyframes illustration-appear-dark {
  to {
    opacity: 0.5;
  }
}

.preview-card__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1rem;
  background: linear-gradient(
    to top,
    oklch(0.97 0.01 85) 0%,
    oklch(0.97 0.01 85 / 0) 100%
  );
  opacity: 0;
  animation: overlay-appear 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.4s forwards;

  [data-theme='dark'] & {
    background: linear-gradient(
      to top,
      oklch(0.18 0.01 85) 0%,
      oklch(0.18 0.01 85 / 0) 100%
    );
  }
}

@keyframes overlay-appear {
  to {
    opacity: 1;
  }
}

.preview-card__title-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem;
}

.preview-card__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gutenku-text-primary);
  margin: 0;
  letter-spacing: 0.05em;
}

.preview-card__body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.preview-card__description {
  margin: 0;
  font-size: 0.9rem;
  color: var(--gutenku-text-primary);
  line-height: 1.5;
  opacity: 0.85;
}

.preview-card__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gutenku-text-primary);
  transition: var(--gutenku-transition-fast);

  svg {
    transition: transform 0.2s ease;
  }
}

@media (max-width: 600px) {
  .preview-card {
    margin: 0;
  }

  .preview-card__header {
    height: 120px;
  }

  .preview-card__title {
    font-size: 1.25rem;
  }

  .preview-card__body {
    padding: 0.75rem;
    gap: 0.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .preview-card__illustration {
    animation: none;
    opacity: 0.7;
    transform: scale(1.15) !important;
  }

  [data-theme='dark'] .preview-card__illustration {
    animation: none;
    opacity: 0.5;
  }

  .preview-card__overlay {
    animation: none;
    opacity: 1;
  }
}
</style>
