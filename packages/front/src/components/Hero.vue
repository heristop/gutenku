<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Sparkles } from 'lucide-vue-next';
import ZenCard from '@/components/ui/ZenCard.vue';
import ZenQuote from '@/components/ui/ZenQuote.vue';
import { useGlobalStats } from '@/composables/global-stats';
import { useAnimatedCounter } from '@/composables/animated-counter';

const { t } = useI18n();
const { globalStats, fetchGlobalStats } = useGlobalStats();

// Quote rotation - hardcoded to avoid i18n array issues
const quotes = [
  'Poetry from prose',
  'Where words fail, poetry speaks',
  'In seventeen syllables, infinite worlds',
  'Literature breathes life into silence',
];
const currentQuoteIndex = ref(0);
const currentQuote = computed(() => quotes[currentQuoteIndex.value]);

let quoteInterval: ReturnType<typeof setInterval> | null = null;

// Animated counter
const targetCount = computed(() => globalStats.value.totalHaikusGenerated ?? 0);
const { count: animatedCount, isAnimating: isCountAnimating, animate: animateCounter } = useAnimatedCounter(targetCount);

onMounted(() => {
  // Start quote rotation
  quoteInterval = setInterval(() => {
    currentQuoteIndex.value = (currentQuoteIndex.value + 1) % quotes.length;
  }, 5000);

  // Fetch stats and animate counter
  fetchGlobalStats().then(() => {
    setTimeout(animateCounter, 600); // Wait for entrance animation
  });
});

onUnmounted(() => {
  if (quoteInterval) {
    clearInterval(quoteInterval);
  }
});
</script>

<template>
  <ZenCard
    variant="default"
    class="hero"
    role="complementary"
    :aria-label="t('hero.ariaLabel')"
  >
    <!-- Ink wash background effect -->
    <div class="hero__ink-wash" aria-hidden="true" />

    <!-- Floating ink drops (zen theme) -->
    <div class="hero__ink-drops" aria-hidden="true">
      <span v-for="i in 6" :key="i" class="ink-drop" />
    </div>

    <!-- Bookmark ribbon -->
    <div class="bookmark-ribbon" aria-hidden="true" />

    <!-- SEO: Visually hidden h1 for proper heading structure -->
    <h1 class="sr-only">GutenKu - Haiku Generator from Classic Literature</h1>

    <!-- Hero layout: stacked centered -->
    <div class="hero__layout">
      <!-- GutenMage illustration - prominent and centered -->
      <div class="hero__illustration-wrapper stagger-1">
        <div class="hero__illustration-glow" aria-hidden="true" />
        <img
          src="/gutenmage.webp"
          alt=""
          aria-hidden="true"
          class="hero__illustration"
          width="1536"
          height="1024"
          loading="eager"
          draggable="false"
          @contextmenu.prevent
        />
      </div>

      <!-- Content column -->
      <div class="hero__content">
        <!-- Rotating quote with typewriter effect -->
        <p
          class="hero__tagline stagger-2"
          aria-live="polite"
          aria-atomic="true"
        >
          <Transition name="quote-fade" mode="out-in">
            <ZenQuote :key="currentQuoteIndex">
              {{ currentQuote }}
            </ZenQuote>
          </Transition>
        </p>

        <!-- Description -->
        <div class="hero__description stagger-3" role="article">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <p v-html="t('hero.description')" />
        </div>

        <!-- Social Proof Badge -->
        <div
          v-if="targetCount > 0"
          class="hero__stats-badge stagger-4"
          role="status"
          :aria-label="`${animatedCount.toLocaleString()} ${t('hero.stats.haikusCrafted')}`"
        >
          <Sparkles class="hero__stats-icon" :size="14" aria-hidden="true" />
          <span
            class="hero__counter"
            :class="{ 'hero__counter--animating': isCountAnimating }"
            aria-hidden="true"
            >{{ animatedCount.toLocaleString() }}</span
          >
          <span
            class="hero__label"
            aria-hidden="true"
            >{{ t('hero.stats.haikusCrafted') }}</span
          >
        </div>
      </div>
    </div>
  </ZenCard>
</template>

<style lang="scss" scoped>
// Keyframes
@keyframes hero-entrance {
  from {
    opacity: 0;
    transform: translateY(20px);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

@keyframes bookmark-entrance {
  0% {
    opacity: 0;
    transform: translateY(-50%) rotate(-3deg);
  }
  60% {
    opacity: 1;
    transform: translateY(0.1rem) rotate(1deg);
  }
  80% {
    transform: translateY(-0.05rem) rotate(0deg);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotate(0deg);
  }
}

@keyframes breathe {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

@keyframes ink-diffuse {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes ink-float {
  0% {
    transform: translateY(100%) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.2;
  }
  90% {
    opacity: 0.2;
  }
  100% {
    transform: translateY(-100vh) rotate(360deg);
    opacity: 0;
  }
}

@keyframes illustration-breathe {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-1.5px); }
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.15; transform: scale(1); }
  50% { opacity: 0.25; transform: scale(1.05); }
}

@keyframes gentle-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

// Staggered entrance animations
.stagger-1 {
  animation: hero-entrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0s both;
}

.stagger-2 {
  animation: hero-entrance 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both;
}

.stagger-3 {
  animation: hero-entrance 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
}

.stagger-4 {
  animation: hero-entrance 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.45s both;
}

.stagger-5 {
  animation: hero-entrance 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s both;
}

.bookmark-ribbon {
  animation: bookmark-entrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
  top: -12px; // Moved down from default -20px
}

.hero {
  position: relative;
  overflow: visible;
  text-align: center;
  padding: var(--gutenku-space-2) var(--gutenku-space-3) var(--gutenku-space-3);
  margin-bottom: var(--gutenku-space-4);

  @media (max-width: 600px) {
    margin-top: 2.5rem;
    margin-bottom: 1rem !important;
  }

  // Ink wash background
  &__ink-wash {
    position: absolute;
    inset: 0;
    overflow: hidden;
    border-radius: inherit;
    background:
      radial-gradient(
        ellipse at 25% 20%,
        oklch(0.45 0.06 192 / 0.05) 0%,
        transparent 40%
      ),
      radial-gradient(
        ellipse at 70% 75%,
        oklch(0.45 0.04 192 / 0.04) 0%,
        transparent 35%
      );
    animation: ink-diffuse 10s ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
  }

  // Floating ink drops
  &__ink-drops {
    position: absolute;
    inset: 0;
    overflow: hidden;
    border-radius: inherit;
    pointer-events: none;
    z-index: 0;
  }

  .ink-drop {
    position: absolute;
    width: 3px;
    height: 3px;
    background: var(--gutenku-zen-primary);
    border-radius: 50%;
    opacity: 0;
    animation: ink-float linear infinite;

    &:nth-child(1) {
      left: 15%;
      animation-duration: 12s;
      animation-delay: 0s;
    }
    &:nth-child(2) {
      left: 35%;
      animation-duration: 10s;
      animation-delay: 2s;
    }
    &:nth-child(3) {
      left: 55%;
      animation-duration: 14s;
      animation-delay: 4s;
    }
    &:nth-child(4) {
      left: 75%;
      animation-duration: 11s;
      animation-delay: 1s;
    }
    &:nth-child(5) {
      left: 25%;
      animation-duration: 13s;
      animation-delay: 3s;
    }
    &:nth-child(6) {
      left: 85%;
      animation-duration: 9s;
      animation-delay: 5s;
    }
  }

  // Stacked centered layout - tight spacing
  &__layout {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    z-index: 1;
    text-align: center;
  }

  // Illustration - larger and prominent
  &__illustration-wrapper {
    position: relative;
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: default;

    &:hover .hero__illustration {
      transform: translateY(-6px) scale(1.02);
      filter: grayscale(0%);
    }

    &:hover .hero__illustration-glow {
      opacity: 0.35;
      transform: scale(1.1);
    }
  }

  &__illustration-glow {
    position: absolute;
    width: 260px;
    height: 260px;
    background: radial-gradient(
      circle,
      oklch(0.45 0.12 192 / 0.18) 0%,
      oklch(0.45 0.08 192 / 0.08) 45%,
      transparent 70%
    );
    border-radius: 50%;
    animation: glow-pulse 8s ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
    transition: all 0.4s ease;

    @media (min-width: 600px) {
      width: 300px;
      height: 300px;
    }

    @media (min-width: 768px) {
      width: 340px;
      height: 340px;
    }

    [data-theme='dark'] & {
      background: radial-gradient(
        circle,
        oklch(0.5 0.15 192 / 0.15) 0%,
        oklch(0.5 0.1 192 / 0.08) 40%,
        transparent 70%
      );
    }
  }

  &__illustration {
    position: relative;
    width: 240px;
    height: auto;
    opacity: 0.95;
    filter: grayscale(15%);
    animation: illustration-breathe 5s ease-in-out infinite;
    z-index: 1;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);

    @media (min-width: 600px) {
      width: 280px;
    }

    @media (min-width: 768px) {
      width: 320px;
    }

    [data-theme='dark'] & {
      filter: brightness(0.85) grayscale(20%);
    }
  }

  // Content column - tighter spacing
  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 500px;
    gap: 0.4rem;
    margin-top: -0.5rem; // Pull closer to illustration
  }

  // Tagline/Verse container
  &__tagline {
    position: relative;
    min-height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0.5rem 1.5rem;
    z-index: 1;
  }

  // Description - primary content
  &__description {
    position: relative;
    z-index: 1;

    p {
      margin: 0;
      line-height: 1.6;
      font-size: 0.95rem;
      max-width: 52ch;
      color: var(--gutenku-text-primary);

      @media (min-width: 600px) {
        font-size: 1rem;
      }
    }
  }

  // Stats badge - compact with Lucide icon
  &__stats-badge {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    padding: 0.4rem 0.85rem;
    margin-top: 0.6rem;
    margin-bottom: 0.8rem;
    background: var(--gutenku-zen-water);
    border: 1px solid oklch(0.45 0.08 192 / 0.12);
    border-radius: 2rem;
    z-index: 1;
    cursor: default;
    animation: gentle-float 6s ease-in-out infinite;
    animation-delay: 1s;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px oklch(0.45 0.08 192 / 0.12);
      border-color: oklch(0.45 0.08 192 / 0.25);
    }
  }

  &__stats-icon {
    color: var(--gutenku-zen-primary);
    opacity: 0.8;
    transition: all 0.3s ease;

    .hero__stats-badge:hover & {
      transform: scale(1.1) rotate(8deg);
      opacity: 1;
    }
  }

  &__counter {
    font-family: 'JMH Typewriter', monospace;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--gutenku-zen-primary);
    letter-spacing: 0.02em;
    transition: transform 0.1s ease;

    &--animating {
      transform: scale(1.05);
    }
  }

  &__label {
    font-family: 'JMH Typewriter', monospace;
    font-size: 0.8rem;
    color: var(--gutenku-text-secondary);
    letter-spacing: 0.02em;
  }
}

// Quote fade transition
.quote-fade-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.quote-fade-leave-active {
  transition: all 0.3s ease-out;
}

.quote-fade-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
  filter: blur(2px);
}

.quote-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

// Dark theme
[data-theme='dark'] {
  .hero__ink-wash {
    background:
      radial-gradient(
        ellipse at 25% 15%,
        oklch(0.5 0.1 192 / 0.1) 0%,
        transparent 45%
      ),
      radial-gradient(
        ellipse at 75% 85%,
        oklch(0.5 0.08 192 / 0.08) 0%,
        transparent 40%
      );
  }

  .hero__stats-badge {
    background: oklch(0.25 0.03 192 / 0.4);
    border-color: oklch(0.5 0.1 192 / 0.2);
  }


  .hero__counter {
    color: var(--gutenku-zen-accent);
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .stagger-1,
  .stagger-2,
  .stagger-3,
  .stagger-4,
  .stagger-5,
  .bookmark-ribbon {
    animation: none;
    opacity: 1;
    transform: none;
    filter: none;
  }

  .hero__illustration {
    animation: none;
  }

  .hero__illustration-glow {
    animation: none;
    opacity: 0.2;
  }

  .hero__ink-wash {
    animation: none;
  }

  .ink-drop {
    animation: none;
    display: none;
  }

  .hero__stats-badge {
    animation: none;
  }

  .quote-fade-enter-active,
  .quote-fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .quote-fade-enter-from,
  .quote-fade-leave-to {
    transform: none;
    filter: none;
  }
}
</style>
