<script lang="ts" setup>
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTypewriter } from '@/composables/typewriter';
import { useQuoteRotation } from '@/composables/quote-rotation';
import ZenCard from '@/components/ui/ZenCard.vue';

const { t } = useI18n();

// Use direct translation calls instead of tm() to avoid slot invocation warnings
const QUOTE_COUNT = 5;
const poetryQuotes = Array.from({ length: QUOTE_COUNT }, (_, i) =>
  t(`haikuTitle.quotes.${i}`),
);

const {
  currentIndex: currentQuote,
  showQuote,
  start: startQuoteRotation,
} = useQuoteRotation(poetryQuotes, { intervalMs: 4000, startDelay: 800 });

const {
  displayText: typewriterText,
  start: startTypewriter,
} = useTypewriter('GutenKu', {
  speed: 150,
  startDelay: 300,
  onComplete: startQuoteRotation,
});

onMounted(startTypewriter);
</script>

<template>
  <ZenCard
    variant="default"
    class="text-center mb-6 haiku-title-card"
    aria-label="Haiku title"
  >
    <div class="title-container">
      <h1 class="haiku-title">
        <span class="typewriter-text">{{ typewriterText }}</span>
      </h1>

      <p
        v-if="showQuote"
        :key="currentQuote"
        class="poetry-quote poetry-quote--animate"
      >
        {{ poetryQuotes[currentQuote] }}
      </p>
    </div>
  </ZenCard>
</template>

<style lang="scss" scoped>
.haiku-title-card {
  position: relative;
  overflow: visible;
  transition: var(--gutenku-transition-zen, all 0.4s ease);
  background: linear-gradient(
    135deg,
    var(--gutenku-paper-bg, #f8f6f0) 0%,
    var(--gutenku-paper-bg-warm, #faf8f2) 100%
  );

  [data-theme='dark'] & {
    background: oklch(0.18 0.02 70 / 0.5) !important;
    backdrop-filter: blur(12px);
  }

  cursor: default !important;
  user-select: none !important;
}

.title-container {
  position: relative;
  z-index: 2;
  padding: 2rem 1.5rem;
  cursor: default;
  user-select: none;
}

.haiku-title {
  font-size: 2.2rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  color: var(--gutenku-text-primary, #2c1810);
  text-shadow:
    1px 1px 2px oklch(0 0 0 / 0.1),
    0 0 4px oklch(0.45 0.08 195 / 0.2);
  margin: 0;
  position: relative;
  cursor: default !important;
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }

  span {
    cursor: default !important;
    user-select: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
  }
}

.poetry-quote {
  font-size: 0.9rem;
  font-style: italic;
  color: var(--gutenku-text-zen, #2f5d62);
  margin: 1rem 0 0 0;
  opacity: 0.8;
  line-height: 1.4;
  perspective: 800px;
  transform-style: preserve-3d;

  &--animate {
    animation: quote-page-flip 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
}

@keyframes quote-page-flip {
  0% {
    opacity: 0;
    transform: rotateX(45deg) translateY(15px);
    filter: blur(3px);
  }
  40% {
    opacity: 0.6;
    transform: rotateX(-5deg) translateY(-3px);
    filter: blur(0);
  }
  70% {
    transform: rotateX(2deg) translateY(1px);
  }
  100% {
    opacity: 0.8;
    transform: rotateX(0) translateY(0);
    filter: blur(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .poetry-quote--animate {
    animation: none;
    opacity: 0.8;
    transform: none;
    filter: none;
  }
}

@media (max-width: 768px) {
  .title-container {
    padding: 1.5rem 1rem;
  }
}
</style>
