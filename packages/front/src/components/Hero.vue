<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import ZenCard from '@/components/ui/ZenCard.vue';
import { useGlobalStats } from '@/composables/global-stats';

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
const animatedCount = ref(0);
const isCountAnimating = ref(false);

function animateCounter() {
  if (targetCount.value === 0) {return;}

  isCountAnimating.value = true;
  const duration = 2000;
  const startTime = performance.now();
  const startValue = 0;
  const endValue = targetCount.value;

  function easeOutQuart(x: number): number {
    return 1 - Math.pow(1 - x, 4);
  }

  function updateCounter(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutQuart(progress);

    animatedCount.value = Math.floor(startValue + (endValue - startValue) * easedProgress);

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      isCountAnimating.value = false;
    }
  }

  requestAnimationFrame(updateCounter);
}

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
    class="hero pa-4 mb-6"
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

    <!-- Logo with breathing animation -->
    <div class="hero__logo-wrapper stagger-1">
      <v-img
        :style="{ viewTransitionName: 'gutenku-logo' }"
        height="64"
        alt="GutenKu Logo"
        src="@/assets/img/logo/gutenku-logo-300.png"
        class="hero__logo"
      />
    </div>

    <!-- Hero Tagline with quote rotation -->
    <h1 class="hero__tagline stagger-2">
      <Transition name="quote-fade" mode="out-in">
        <span :key="currentQuoteIndex" class="hero__tagline-text">
          {{ currentQuote }}
        </span>
      </Transition>
    </h1>

    <!-- Description -->
    <div class="hero__description stagger-3" role="article">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <p v-html="t('hero.description')" />
    </div>

    <!-- Social Proof Counter -->
    <div v-if="targetCount > 0" class="hero__stats stagger-4">
      <span
        class="hero__counter"
        :class="{ 'hero__counter--animating': isCountAnimating }"
      >
        {{ animatedCount.toLocaleString() }}
      </span>
      <span class="hero__label">{{ t('hero.stats.haikusCrafted') }}</span>
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

.bookmark-ribbon {
  animation: bookmark-entrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
}

.hero {
  position: relative;
  overflow: visible;
  text-align: center;

  @media (max-width: 600px) {
    margin-top: 3.5rem;
    margin-bottom: 1.25rem !important;
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

  // Logo
  &__logo-wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    margin-bottom: 0.75rem;
    z-index: 1;
  }

  &__logo {
    animation: breathe 4s ease-in-out infinite;
    transition: var(--gutenku-transition-fast);

    &:hover {
      opacity: 0.85;
    }
  }

  // Tagline
  &__tagline {
    position: relative;
    min-height: 2.5rem;
    margin: 0 0 0.75rem;
    z-index: 1;
  }

  &__tagline-text {
    display: block;
    font-family: 'JMH Typewriter', monospace;
    font-size: 1.35rem;
    font-weight: 400;
    letter-spacing: 0.08em;
    color: var(--gutenku-zen-primary);
    font-style: italic;
  }

  // Description
  &__description {
    position: relative;
    margin-bottom: 1rem;
    z-index: 1;

    p {
      margin: 0;
      line-height: 1.7;
    }
  }

  // Stats counter
  &__stats {
    position: relative;
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid oklch(0 0 0 / 0.06);
    z-index: 1;
  }

  &__counter {
    font-family: 'JMH Typewriter', monospace;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--gutenku-zen-primary);
    letter-spacing: 0.02em;
    transition: transform 0.1s ease;

    &--animating {
      transform: scale(1.02);
    }
  }

  &__label {
    font-family: 'JMH Typewriter', monospace;
    font-size: 0.9rem;
    color: var(--gutenku-text-muted);
    letter-spacing: 0.05em;
  }
}

// Quote fade transition
.quote-fade-enter-active,
.quote-fade-leave-active {
  transition: all 0.4s ease;
}

.quote-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.quote-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
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

  .hero__stats {
    border-top-color: oklch(1 0 0 / 0.08);
  }

  .hero__tagline-text {
    color: var(--gutenku-zen-accent);
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
  .bookmark-ribbon {
    animation: none;
    opacity: 1;
    transform: none;
    filter: none;
  }

  .hero__logo {
    animation: none;
  }

  .hero__ink-wash {
    animation: none;
  }

  .ink-drop {
    animation: none;
    display: none;
  }

  .quote-fade-enter-active,
  .quote-fade-leave-active {
    transition: none;
  }
}
</style>
