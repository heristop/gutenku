<script lang="ts" setup>
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTypewriter } from '@/composables/typewriter';
import { useQuoteRotation } from '@/composables/quote-rotation';
import ZenCard from '@/components/ui/ZenCard.vue';
import ZenQuote from '@/components/ui/ZenQuote.vue';

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
  showCursor,
  start: startTypewriter,
} = useTypewriter('GutenKu', {
  speed: 150,
  startDelay: 300,
  onComplete: startQuoteRotation,
});

onMounted(startTypewriter);
</script>

<template>
  <ZenCard variant="default" class="haiku-title-card" aria-label="Haiku title">
    <div class="title-container">
      <h1 class="haiku-title">
        <span class="typewriter-text">{{ typewriterText }}</span>
        <span v-if="showCursor" class="typewriter-cursor" aria-hidden="true"
          >|</span
        >
      </h1>

      <ZenQuote
        v-if="showQuote"
        :key="currentQuote"
        class="poetry-quote poetry-quote--animate"
      >
        {{ poetryQuotes[currentQuote] }}
      </ZenQuote>
    </div>
  </ZenCard>
</template>

<style lang="scss" scoped>
.haiku-title-card {
  position: relative;
  overflow: visible;
  text-align: center;
  margin-bottom: var(--gutenku-space-6);
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

.typewriter-text {
  // Hide global cursor from main.scss
  &::after {
    display: none;
  }
}

.typewriter-cursor {
  display: inline-block;
  font-weight: 300;
  opacity: 0.4;
  color: var(--gutenku-zen-primary, #2f5d62);
  animation: cursor-blink 0.8s ease-in-out infinite;
  margin-left: -0.1em;
  position: relative;
  top: -0.45em;
}

@keyframes cursor-blink {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0;
  }
}

.poetry-quote {
  display: block;
  margin: 1rem 0 0 0;
  line-height: 1.4;

  &--animate {
    animation: quote-fade-in 0.5s ease-out forwards;
  }

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
}

@keyframes quote-fade-in {
  0% {
    opacity: 0;
    transform: translateY(6px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .poetry-quote--animate {
    animation: none;
    opacity: 1;
  }

  .typewriter-cursor {
    animation: none;
    opacity: 0.4;
  }
}

@media (max-width: 768px) {
  .title-container {
    padding: 1.5rem 1rem;
  }
}
</style>
