<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Sparkles } from 'lucide-vue-next';
import ZenCard from '@/core/components/ui/ZenCard.vue';
import ZenQuote from '@/core/components/ui/ZenQuote.vue';
import { useGlobalStats } from '@/core/composables/global-stats';
import { useAnimatedCounter } from '@/core/composables/animated-counter';

const { t } = useI18n();
const { globalStats, fetchGlobalStats } = useGlobalStats();

// Quote rotation - uses i18n for translations
const quoteKeys = ['0', '1', '2', '3', '4'] as const;
const currentQuoteIndex = ref(0);
const currentQuote = computed(() =>
  t(`haikuTitle.quotes.${quoteKeys[currentQuoteIndex.value]}`),
);

// Hero element ref for IntersectionObserver
const heroRef = ref<{ $el: HTMLElement } | null>(null);
const isVisible = ref(true);

let quoteInterval: ReturnType<typeof setInterval> | null = null;
let intersectionObserver: IntersectionObserver | null = null;

// Quote rotation - pauses when not visible
function startQuoteRotation() {
  if (quoteInterval) {
    return;
  }

  quoteInterval = setInterval(() => {
    if (isVisible.value) {
      currentQuoteIndex.value =
        (currentQuoteIndex.value + 1) % quoteKeys.length;
    }
  }, 5000);
}

function stopQuoteRotation() {
  if (quoteInterval) {
    clearInterval(quoteInterval);
    quoteInterval = null;
  }
}

function handleVisibilityChange() {
  if (document.hidden) {
    stopQuoteRotation();
  } else if (isVisible.value) {
    startQuoteRotation();
  }
}

// Animated counter
const targetCount = computed(() => globalStats.value.totalHaikusGenerated ?? 0);
const {
  count: animatedCount,
  isAnimating: isCountAnimating,
  animate: animateCounter,
} = useAnimatedCounter(targetCount);

onMounted(() => {
  // IntersectionObserver pauses quote rotation when hero is off-screen
  const heroEl = heroRef.value?.$el;
  if (heroEl) {
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        isVisible.value = entries[0].isIntersecting;
        if (isVisible.value) {
          startQuoteRotation();
        } else {
          stopQuoteRotation();
        }
      },
      { threshold: 0.1 },
    );
    intersectionObserver.observe(heroEl);
  }

  // Pause when tab is hidden
  document.addEventListener('visibilitychange', handleVisibilityChange);

  startQuoteRotation();

  // Load stats and animate counter
  fetchGlobalStats().then(() => {
    setTimeout(animateCounter, 400);
  });
});

onUnmounted(() => {
  stopQuoteRotation();
  intersectionObserver?.disconnect();
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

<template>
  <ZenCard
    ref="heroRef"
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
      <span class="hero__label" aria-hidden="true">{{
        t('hero.stats.haikusCrafted')
      }}</span>
    </div>

    <!-- Hero layout -->
    <div class="hero__layout">
      <!-- GutenMage illustration -->
      <div class="hero__illustration-wrapper stagger-1">
        <div class="hero__illustration-glow" aria-hidden="true" />
        <img
          src="/gutenmage-640.webp"
          srcset="
            /gutenmage-320.webp   320w,
            /gutenmage-640.webp   640w,
            /gutenmage-1024.webp 1024w
          "
          sizes="(max-width: 600px) 240px, (max-width: 768px) 280px, 320px"
          alt=""
          aria-hidden="true"
          class="hero__illustration"
          width="640"
          height="427"
          loading="eager"
          fetchpriority="high"
          draggable="false"
          @contextmenu.prevent
        />
      </div>

      <!-- Content column -->
      <div class="hero__content">
        <!-- Rotating quote -->
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

// LCP entrance animation
@keyframes hero-entrance-lcp {
  from {
    opacity: 1;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

@keyframes ink-diffuse {
  0%,
  100% {
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
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-1.5px);
  }
}

// LCP post-paint enhancement
@keyframes lcp-enhance {
  to {
    opacity: 0.95;
    filter: grayscale(15%);
  }
}

@keyframes lcp-enhance-dark {
  to {
    opacity: 0.95;
    filter: brightness(0.85) grayscale(20%);
  }
}

@keyframes glow-pulse {
  0%,
  100% {
    opacity: 0.15;
    transform: scale(1);
  }
  50% {
    opacity: 0.25;
    transform: scale(1.05);
  }
}

@keyframes gentle-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

// Staggered entrance animations
// stagger-1 contains LCP image
.stagger-1 {
  opacity: 1;
  animation: hero-entrance-lcp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0s
    forwards;
}

// Non-LCP elements
.stagger-2 {
  opacity: 1;
  animation: hero-entrance 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s
    backwards;
}

.stagger-3 {
  opacity: 1;
  animation: hero-entrance 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s
    backwards;
}

.stagger-4 {
  opacity: 1;
  animation: hero-entrance 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s
    backwards;
}

.stagger-5 {
  opacity: 1;
  animation: hero-entrance 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s
    backwards;
}

.bookmark-ribbon {
  animation: bookmark-entrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
  top: -12px;
}

.hero {
  position: relative;
  overflow: visible;
  text-align: center;
  padding: var(--gutenku-space-2) var(--gutenku-space-6) var(--gutenku-space-8);
  margin-bottom: var(--gutenku-space-2);

  @media (max-width: 600px) {
    padding: var(--gutenku-space-1) var(--gutenku-space-3)
      var(--gutenku-space-6);
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
    contain: paint;
  }

  // Floating ink drops
  &__ink-drops {
    position: absolute;
    inset: 0;
    overflow: hidden;
    border-radius: inherit;
    pointer-events: none;
    z-index: 0;
    contain: strict;
  }

  .ink-drop {
    position: absolute;
    width: 3px;
    height: 3px;
    background: var(--gutenku-zen-primary);
    border-radius: 50%;
    opacity: 0;
    animation: ink-float linear infinite;
    will-change: transform, opacity;
    backface-visibility: hidden;

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

  // Layout
  &__layout {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    z-index: 1;
    text-align: center;
  }

  // Illustration
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
    z-index: 1;
    animation:
      lcp-enhance 0.01s ease-out 0.1s forwards,
      illustration-breathe 5s ease-in-out 0.5s infinite;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);

    @media (min-width: 600px) {
      width: 280px;
    }

    @media (min-width: 768px) {
      width: 320px;
    }

    [data-theme='dark'] & {
      animation:
        lcp-enhance-dark 0.01s ease-out 0.1s forwards,
        illustration-breathe 5s ease-in-out 0.5s infinite;
    }
  }

  // Content column
  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 600px;
    gap: 0.25rem;
    margin-top: -0.75rem;

    @media (max-width: 600px) {
      gap: 0.4rem;
      margin-top: -0.25rem;
    }
  }

  // Tagline
  &__tagline {
    position: relative;
    min-height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0.5rem 1.5rem;
    z-index: 1;

    @media (max-width: 600px) {
      min-height: 2rem;
      padding: 0.25rem 1rem;
    }
  }

  // Description
  &__description {
    position: relative;
    z-index: 1;

    p {
      margin: 0;
      line-height: 1.6;
      font-size: 0.95rem;
      max-width: 72ch;
      color: var(--gutenku-text-primary);

      @media (min-width: 600px) {
        font-size: 1rem;
      }
    }
  }

  // Stats badge
  &__stats-badge {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    padding: 0.35rem 0.75rem;
    background: var(--gutenku-zen-water);
    border: 1px solid oklch(0.45 0.08 192 / 0.12);
    border-radius: 2rem;
    z-index: 2;
    cursor: default;
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
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--gutenku-zen-primary);
    letter-spacing: 0.02em;
    font-variant-numeric: tabular-nums;
    min-width: 4ch;
    text-align: center;
    transition: transform 0.1s ease;

    &--animating {
      transform: scale(1.05);
    }
  }

  &__label {
    font-size: 0.8rem;
    color: var(--gutenku-text-secondary);
    letter-spacing: 0.02em;
  }
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
}
</style>
