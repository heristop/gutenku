<script lang="ts" setup>
import { ArrowRight } from '@/core/components/icons/ink';
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

const { translateX, translateY, handleMouseMove, handleMouseLeave } =
  useMouseParallax(15);
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
        <span class="link-highlight">{{ ctaText }}</span>
        <ArrowRight :size="14" aria-hidden="true" />
      </span>
    </div>
  </RouterLink>
</template>

<style lang="scss" scoped>
// Ex Libris: a paper sheet with a plate on top, separated by an ink rule.
.preview-card {
  display: block;
  text-decoration: none;
  color: var(--gk-ink);
  background: var(--gk-paper-raised);
  border-radius: var(--gk-radius-paper);
  overflow: clip;
  box-shadow: var(--gk-lift);
  container-type: inline-size;
  container-name: preview-card;
  transition: transform var(--gk-dur-fast) var(--gk-ease-out);

  @media (hover: hover) {
    &:hover {
      transform: translateY(-2px);

      .preview-card__cta svg {
        transform: translateX(3px);
      }

      .preview-card__cta .link-highlight {
        text-decoration-thickness: 2px;
      }
    }
  }

  &:active {
    transform: scale(0.99);
  }

  &:focus-visible {
    outline: 2px solid var(--gk-indigo);
    outline-offset: 3px;
  }
}

.preview-card__header {
  position: relative;
  height: 140px;
  overflow: hidden;
  border-bottom: var(--gk-rule);
  background: var(--gk-paper-deep);
}

.preview-card__illustration {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(40%) sepia(10%);
  mix-blend-mode: multiply;
  transition: transform 0.15s ease-out;
  opacity: 0;
  animation: illustration-appear 400ms var(--gk-ease-out) 120ms forwards;
  will-change: transform;

  [data-theme='dark'] & {
    filter: grayscale(40%) var(--gk-cover-filter);
    mix-blend-mode: normal;
  }
}

@keyframes illustration-appear {
  to {
    opacity: 0.75;
  }
}

.preview-card__overlay {
  position: absolute;
  inset: auto 0 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0.75rem;
}

.preview-card__title-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem;
  width: fit-content;
  max-width: 100%;
  padding: 0.375rem 0.625rem;
  background: var(--gk-paper-raised);
  border-radius: var(--gk-radius-control);
}

.preview-card__title {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--gk-ink);
  margin: 0;
  letter-spacing: -0.015em;
  line-height: 1.1;
}

.preview-card__body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.preview-card__description {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--gk-ink-soft);
  line-height: 1.6;
}

.preview-card__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  width: fit-content;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--gk-indigo);

  svg {
    transition: transform var(--gk-dur-fast) var(--gk-ease-out);
  }
}

@container preview-card (max-width: 400px) {
  .preview-card {
    margin: 0 0.4rem;
  }

  .preview-card__header {
    height: 120px;
  }

  .preview-card__title {
    font-size: 1.2rem;
  }

  .preview-card__body {
    padding: 0.75rem;
    gap: 0.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .preview-card {
    transition: none;

    &:hover,
    &:active {
      transform: none;
    }
  }

  .preview-card__illustration {
    animation: none;
    opacity: 0.75;
    transform: scale(1.15) !important;
  }
}
</style>
