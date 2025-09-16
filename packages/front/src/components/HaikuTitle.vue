<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';

const poetryQuotes = [
  'Where words fail, poetry speaks',
  'In seventeen syllables, infinite worlds',
  'Every haiku holds a season of the soul',
  'Literature breathes life into silence',
  'From classic books to modern verse',
];

const currentQuote = ref(0);
const showQuote = ref(false);
const typewriterText = ref('');
const showCursor = ref(true);
const fullTitle = 'GutenKu';

let quoteInterval: NodeJS.Timeout | null = null;
let typewriterTimeout: NodeJS.Timeout | null = null;

const startTypewriter = () => {
  let i = 0;
  const typeNextChar = () => {
    if (i < fullTitle.length) {
      typewriterText.value += fullTitle.charAt(i);
      i++;
      typewriterTimeout = setTimeout(typeNextChar, 150);
    } else {
      showCursor.value = false;
      setTimeout(() => {
        showQuote.value = true;
        startQuoteRotation();
      }, 800);
    }
  };
  typeNextChar();
};

const startQuoteRotation = () => {
  quoteInterval = setInterval(() => {
    currentQuote.value = (currentQuote.value + 1) % poetryQuotes.length;
  }, 4000);
};

onMounted(() => {
  setTimeout(startTypewriter, 300);
});

onUnmounted(() => {
  if (quoteInterval) clearInterval(quoteInterval);
  if (typewriterTimeout) clearTimeout(typewriterTimeout);
});
</script>

<template>
  <v-card
    class="gutenku-card text-center mb-6 haiku-title-card"
    color="secondary"
    variant="tonal"
  >
    <div class="title-container">
      <h1 class="haiku-title">
        <span class="typewriter-text">{{ typewriterText }}</span>
      </h1>

      <transition name="quote-fade" mode="out-in">
        <p v-if="showQuote" :key="currentQuote" class="poetry-quote">
          {{ poetryQuotes[currentQuote] }}
        </p>
      </transition>
    </div>
  </v-card>
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
  cursor: default !important;
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
  caret-color: transparent !important;

  *,
  *::before,
  *::after {
    cursor: default !important;
    user-select: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
    caret-color: transparent !important;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      radial-gradient(
        ellipse at 20% 30%,
        var(--gutenku-zen-water, rgba(47, 93, 98, 0.05)) 0%,
        transparent 50%
      ),
      radial-gradient(
        ellipse at 80% 70%,
        var(--gutenku-zen-mist, rgba(167, 196, 188, 0.1)) 0%,
        transparent 50%
      );
    border-radius: 8px;
    pointer-events: none;
    z-index: 1;
    opacity: 0.6;
  }
}

.title-container {
  position: relative;
  z-index: 2;
  padding: 2rem 1.5rem;
  cursor: default;
  user-select: none;
}

.haiku-title {
  font-family: 'JMH Typewriter', monospace;
  font-size: 2.2rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  color: var(--gutenku-text-primary, #2c1810);
  text-shadow:
    1px 1px 2px rgba(0, 0, 0, 0.1),
    0 0 4px rgba(47, 93, 98, 0.2);
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
  font-family: 'JMH Typewriter', monospace;
  font-size: 0.9rem;
  font-style: italic;
  color: var(--gutenku-text-zen, #2f5d62);
  margin: 1rem 0 0 0;
  opacity: 0.8;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
}

.quote-fade-enter-active,
.quote-fade-leave-active {
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.quote-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
  filter: blur(2px);
}

.quote-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  filter: blur(1px);
}

@media (max-width: 768px) {
  .title-container {
    padding: 1.5rem 1rem;
  }
}
</style>
