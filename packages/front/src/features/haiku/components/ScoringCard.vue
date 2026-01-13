<script lang="ts" setup>
import { computed, ref, watch, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';
import type { HaikuQualityScore } from '@gutenku/shared';
import {
  Trophy,
  MessageSquare,
  Wind,
  Layers,
  Image,
  AlertTriangle,
  ChevronRight,
} from 'lucide-vue-next';
import ZenCard from '@/core/components/ui/ZenCard.vue';
import ZenModal from '@/core/components/ui/ZenModal.vue';
import RadialProgress from './ui/RadialProgress.vue';
import { useAnimatedCounter } from '@/core/composables/animated-counter';
import { useInView } from '@/features/haiku/composables/in-view';

const props = defineProps<{
  quality: HaikuQualityScore | null;
  visible: boolean;
}>();

const { t } = useI18n();

// In-view animation
const cardRef = useTemplateRef<HTMLElement>('cardRef');
const { isInView } = useInView(cardRef, { delay: 200 });

// Modal state
const showModal = ref(false);

// Animation states
const isRevealed = ref(false);
const isAnimating = ref(false);
const scoreWow = ref(false);
const WOW_DURATION = 600;

// Track previous score for wow animation
let lastScore = 0;

// Animated total score for card display
const cardScoreTarget = computed(() => props.quality?.totalScore ?? 0);
const { count: animatedCardScore, animate: animateCardScore } =
  useAnimatedCounter(cardScoreTarget, {
    duration: 800,
    initialDelay: 300,
  });

// Animated total score for modal
const { count: animatedModalScore, animate: animateModalScore } =
  useAnimatedCounter(cardScoreTarget, {
    duration: 1200,
    initialDelay: 200,
  });

// Trigger card animation when becomes visible
watch(
  [isInView, () => props.visible],
  ([inView, visible]) => {
    if (inView && visible && props.quality) {
      animateCardScore();
    }
  },
  { immediate: true },
);

watch(
  () => props.quality?.totalScore,
  (newScore) => {
    if (newScore && newScore !== lastScore && lastScore > 0) {
      scoreWow.value = true;
      setTimeout(() => {
        scoreWow.value = false;
      }, WOW_DURATION);
      animateCardScore();
    }
    lastScore = newScore ?? 0;
  },
);

function triggerChartAnimations() {
  isAnimating.value = true;
  isRevealed.value = false;

  setTimeout(() => {
    isRevealed.value = true;
    animateModalScore();
  }, 50);

  setTimeout(() => {
    isAnimating.value = false;
  }, 1800);
}

// Watch modal state to trigger animations
watch(showModal, (isOpen) => {
  if (isOpen) {
    triggerChartAnimations();
  }
});

// Metric categories configuration
const categories = computed(() => [
  {
    key: 'language',
    icon: MessageSquare,
    metrics: ['sentiment', 'grammar', 'verbPresence'] as const,
  },
  {
    key: 'flow',
    icon: Wind,
    metrics: ['trigramFlow', 'markovFlow', 'alliteration'] as const,
  },
  {
    key: 'structure',
    icon: Layers,
    metrics: ['uniqueness', 'lineLengthBalance', 'verseDistance'] as const,
  },
  {
    key: 'imagery',
    icon: Image,
    metrics: ['imageryDensity', 'semanticCoherence', 'natureWords'] as const,
  },
  {
    key: 'penalties',
    icon: AlertTriangle,
    metrics: ['repeatedWords', 'weakStarts'] as const,
    isPenalty: true,
  },
]);

// Normalize metrics to 0-1 range for RadialProgress
function normalizeMetric(key: keyof HaikuQualityScore, value: number): number {
  const normalizers: Partial<
    Record<keyof HaikuQualityScore, (v: number) => number>
  > = {
    // Already 0-1
    sentiment: (v) => v,
    grammar: (v) => v,
    uniqueness: (v) => v,
    alliteration: (v) => v,
    verseDistance: (v) => v,
    lineLengthBalance: (v) => v,
    imageryDensity: (v) => v,
    semanticCoherence: (v) => v,
    verbPresence: (v) => v,

    // 0-10 scale
    trigramFlow: (v) => v / 10,
    markovFlow: (v) => v / 10,

    // Count-based (show as progress)
    natureWords: (v) => Math.min(v / 5, 1),
    // Penalties (invert for display - 0 is best)
    repeatedWords: (v) => Math.max(0, 1 - v / 3),
    weakStarts: (v) => Math.max(0, 1 - v / 2),
  };

  return normalizers[key]?.(value) ?? value;
}

// Get raw value for display tooltip
function getDisplayValue(key: keyof HaikuQualityScore, value: number): string {
  if (['trigramFlow', 'markovFlow'].includes(key as string)) {
    return value.toFixed(1);
  }

  if (['natureWords', 'repeatedWords', 'weakStarts'].includes(key as string)) {
    return value.toString();
  }
  return `${Math.round(value * 100)}%`;
}

// Calculate animation delay for staggered reveal
function getDelay(categoryIndex: number, metricIndex: number): number {
  return 200 + categoryIndex * 150 + metricIndex * 60;
}
</script>

<template>
  <ZenCard
    v-if="quality && visible"
    ref="cardRef"
    variant="panel"
    class="scoring-card animate-in"
    :class="{ 'is-visible': isInView }"
    :aria-label="t('scoring.title')"
  >
    <!-- Header -->
    <div class="scoring-card__header">
      <Trophy :size="24" class="scoring-card__header-icon" aria-hidden="true" />
      <div class="scoring-card__header-content">
        <h2 class="scoring-card__header-title">{{ t('scoring.title') }}</h2>
        <span class="scoring-card__header-subtitle">{{
          t('scoring.subtitle')
        }}</span>
      </div>
    </div>

    <!-- Score Display -->
    <div class="scoring-card__score-section">
      <div
        class="scoring-card__score-display"
        :class="{ 'scoring-card__score-display--wow': scoreWow }"
      >
        <RadialProgress
          :value="quality.totalScore"
          :max="100"
          size="lg"
          :animated="isInView"
          :delay="400"
          color="primary"
        />
        <div class="scoring-card__score-info">
          <span class="scoring-card__score-value">{{ animatedCardScore }}</span>
          <span class="scoring-card__score-label">{{
            t('scoring.total')
          }}</span>
        </div>
      </div>
    </div>

    <!-- View Details Button -->
    <button
      type="button"
      class="scoring-card__details-btn"
      @click="showModal = true"
    >
      <span>{{ t('scoring.viewDetails') }}</span>
      <ChevronRight :size="16" class="scoring-card__details-icon" />
    </button>

    <!-- Scoring Modal -->
    <ZenModal
      v-model="showModal"
      :title="t('scoring.title')"
      :max-width="420"
      variant="stats"
    >
      <template #header>
        <div class="scoring-modal__header">
          <Trophy :size="24" class="scoring-modal__header-icon" />
          <div class="scoring-modal__header-text">
            <h3 class="scoring-modal__title">{{ t('scoring.title') }}</h3>
            <p class="scoring-modal__subtitle">{{ t('scoring.subtitle') }}</p>
          </div>
        </div>
      </template>

      <!-- Hero Score Display -->
      <div class="scoring-modal__hero">
        <RadialProgress
          :value="quality.totalScore"
          :max="100"
          size="lg"
          :animated="isRevealed"
          :delay="100"
          color="primary"
        />
        <div class="scoring-modal__hero-info">
          <span class="scoring-modal__hero-value">
            {{ animatedModalScore }}
          </span>
          <span class="scoring-modal__hero-label">
            {{ t('scoring.total') }}
          </span>
        </div>
      </div>

      <!-- Category Groups -->
      <div class="scoring-modal__categories">
        <div
          v-for="(category, catIndex) in categories"
          :key="category.key"
          class="scoring-modal__category"
          :class="{
            'scoring-modal__category--penalty': category.isPenalty,
          }"
        >
          <div class="scoring-modal__category-header">
            <component :is="category.icon" :size="14" aria-hidden="true" />
            <span>{{ t(`scoring.categories.${category.key}`) }}</span>
          </div>

          <div class="scoring-modal__metrics">
            <div
              v-for="(metric, metricIndex) in category.metrics"
              :key="metric"
              class="scoring-modal__metric"
              :class="{ 'scoring-modal__metric--revealed': isRevealed }"
              :style="{
                '--stagger-delay': `${getDelay(catIndex, metricIndex)}ms`,
              }"
              :title="getDisplayValue(metric, quality[metric])"
            >
              <RadialProgress
                :value="normalizeMetric(metric, quality[metric])"
                :max="1"
                size="sm"
                :show-value="false"
                :animated="isRevealed"
                :delay="getDelay(catIndex, metricIndex)"
                :color="category.isPenalty ? 'muted' : 'primary'"
              />
              <span class="scoring-modal__metric-label">
                {{ t(`scoring.metrics.${metric}`) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </ZenModal>
  </ZenCard>
</template>

<style lang="scss" scoped>
$spring-easing: cubic-bezier(0.34, 1.56, 0.64, 1);

.scoring-card {
  padding: var(--gutenku-space-5);

  &__header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    animation: header-fade-in 0.5s ease-out 0.2s both;
  }

  &__header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--gutenku-zen-primary);
  }

  &__header-content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-width: 0;
  }

  &__header-title {
    font-size: 1rem;
    font-weight: 500;
    color: var(--gutenku-text-primary);
    letter-spacing: 0.025em;
    margin: 0;
  }

  &__header-subtitle {
    font-size: 0.875rem;
    color: var(--gutenku-text-muted);
    margin-top: 0.125rem;
  }

  &__score-section {
    display: flex;
    justify-content: center;
    padding: 0.5rem 0;
  }

  &__score-display {
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background: var(--gutenku-paper-bg-aged);
    border-radius: var(--gutenku-radius-md);
    border: 1px solid var(--gutenku-paper-border);
    transition: all 0.3s $spring-easing;

    &--wow {
      transform: scale(1.05);
      box-shadow:
        0 0 20px
          color-mix(in oklch, var(--gutenku-zen-primary) 30%, transparent),
        0 4px 12px oklch(0 0 0 / 0.1);
    }
  }

  &__score-info {
    display: flex;
    flex-direction: column;
  }

  &__score-value {
    font-family: 'JMH Typewriter', monospace;
    font-size: 2rem;
    font-weight: 600;
    color: var(--gutenku-zen-primary);
    line-height: 1;
    letter-spacing: -0.02em;
  }

  &__score-label {
    font-size: 0.75rem;
    color: var(--gutenku-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: 0.25rem;
  }

  &__details-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    width: 100%;
    padding: 0.625rem 1rem;
    margin-top: 0.5rem;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--gutenku-text-secondary);
    background: transparent;
    border: 1px solid var(--gutenku-paper-border);
    border-radius: var(--gutenku-radius-sm);
    cursor: pointer;
    transition: all 0.25s $spring-easing;

    &:hover {
      color: var(--gutenku-zen-primary);
      border-color: var(--gutenku-zen-primary);
      background: color-mix(
        in oklch,
        var(--gutenku-zen-primary) 8%,
        transparent
      );
      transform: translateY(-1px);
    }

    &:focus-visible {
      outline: 2px solid var(--gutenku-zen-primary);
      outline-offset: 2px;
    }
  }

  &__details-icon {
    transition: transform 0.2s ease;
  }

  &__details-btn:hover &__details-icon {
    transform: translateX(2px);
  }
}

@keyframes header-fade-in {
  0% {
    opacity: 0;
    transform: translateY(-8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

// Modal content
.scoring-modal {
  &__header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__header-icon {
    color: var(--gutenku-zen-primary);
  }

  &__header-text {
    display: flex;
    flex-direction: column;
  }

  &__title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--gutenku-text-primary);
    margin: 0;
  }

  &__subtitle {
    font-size: 0.75rem;
    color: var(--gutenku-text-muted);
    margin: 0;
  }

  &__hero {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    margin-bottom: 1rem;
    background: var(--gutenku-paper-bg-aged);
    border-radius: var(--gutenku-radius-sm);
    border: 1px solid var(--gutenku-paper-border);
  }

  &__hero-info {
    display: flex;
    flex-direction: column;
  }

  &__hero-value {
    font-family: 'JMH Typewriter', monospace;
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--gutenku-zen-primary);
    line-height: 1;
    letter-spacing: -0.02em;
  }

  &__hero-label {
    font-size: 0.75rem;
    color: var(--gutenku-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: 0.25rem;
  }

  &__categories {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__category {
    &-header {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--gutenku-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
      padding-bottom: 0.25rem;
      border-bottom: 1px solid oklch(0.9 0.01 85 / 0.5);

      svg {
        color: var(--gutenku-zen-primary);
      }
    }

    &--penalty {
      .scoring-modal__category-header svg {
        color: var(--gutenku-text-muted);
      }
    }
  }

  &__metrics {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  &__metric {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.5rem 0.25rem 0.25rem;
    background: oklch(0.98 0.005 85 / 0.6);
    border-radius: var(--gutenku-radius-sm);
    transition:
      background 0.2s ease,
      transform 0.15s ease;

    // Calligraphy stroke reveal - starts hidden
    opacity: 0;
    transform: translateY(4px);

    &--revealed {
      animation: calligraphy-reveal 0.5s $spring-easing forwards;
      animation-delay: var(--stagger-delay, 0ms);
    }

    &:hover {
      background: oklch(0.95 0.01 85 / 0.8);
      transform: translateY(-1px);
    }
  }

  &__metric-label {
    font-size: 0.6875rem;
    color: var(--gutenku-text-secondary);
    white-space: nowrap;
  }
}

// Calligraphy stroke reveal animation
@keyframes calligraphy-reveal {
  0% {
    opacity: 0;
    transform: translateY(4px);
  }
  60% {
    opacity: 0.8;
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

// Dark theme
[data-theme='dark'] {
  .scoring-card {
    &__header-icon,
    &__score-value {
      color: var(--gutenku-text-primary);
    }

    &__score-label {
      color: var(--gutenku-text-secondary);
    }

    &__score-display {
      background: var(--gutenku-paper-bg);
      border-color: oklch(0.72 0.04 178 / 0.5);

      &--wow {
        box-shadow:
          0 0 20px
            color-mix(in oklch, var(--gutenku-zen-accent) 40%, transparent),
          0 4px 12px oklch(0 0 0 / 0.2);
      }
    }

    &__details-btn:hover {
      color: var(--gutenku-zen-accent);
      border-color: var(--gutenku-zen-accent);
      background: color-mix(
        in oklch,
        var(--gutenku-zen-accent) 10%,
        transparent
      );
    }
  }

  .scoring-modal {
    &__header-icon,
    &__hero-value {
      color: var(--gutenku-zen-accent);
    }

    &__hero {
      background: var(--gutenku-paper-bg);
      border-color: oklch(0.72 0.04 178 / 0.3);
    }

    &__category-header {
      border-color: oklch(0.35 0.02 85 / 0.5);

      svg {
        color: var(--gutenku-zen-accent);
      }
    }

    &__metric {
      background: oklch(0.25 0.01 85 / 0.6);

      &:hover {
        background: oklch(0.3 0.02 85 / 0.8);
      }
    }
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .scoring-card {
    &__header {
      animation: none;
      opacity: 1;
    }

    &__score-display {
      transition: none;

      &--wow {
        transform: none;
      }
    }

    &__details-btn {
      transition: none;
    }
  }

  .scoring-modal__metric {
    animation: none;
    opacity: 1;
    transform: none;
  }
}

// Mobile
@media (max-width: 768px) {
  .scoring-card {
    padding: 1.25rem;

    &__score-value {
      font-size: 1.75rem;
    }
  }
}
</style>
