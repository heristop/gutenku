<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
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
} from '@/core/components/icons/ink';
import ZenCard from '@/core/components/ui/ZenCard.vue';
import ZenModal from '@/core/components/ui/ZenModal.vue';
import RadialProgress from './ui/RadialProgress.vue';
import { useCountUp } from '@/features/haiku/composables/count-up';

const props = defineProps<{
  quality: HaikuQualityScore | null;
  visible: boolean;
}>();

const { t } = useI18n();

const showModal = ref(false);

// The total reads at rest and counts (≤400ms) only when a new haiku changes it.
// Opening the sheet counts the hero figure up once, alongside the dial sweep.
const totalScore = () => props.quality?.totalScore ?? 0;
const { value: cardScore } = useCountUp(totalScore);
const { value: modalScore, play: playModalScore } = useCountUp(totalScore);

watch(showModal, (isOpen) => {
  if (isOpen) {
    playModalScore(totalScore(), 0);
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
    metrics: [
      'repeatedWords',
      'weakStarts',
      'blacklistedVerses',
      'properNouns',
    ] as const,
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
    blacklistedVerses: (v) => Math.max(0, 1 - v / 3),
    properNouns: (v) => Math.max(0, 1 - v / 3),
  };

  return normalizers[key]?.(value ?? 0) ?? value ?? 0;
}

// Get raw value for display tooltip
function getDisplayValue(key: keyof HaikuQualityScore, value: number): string {
  if (['trigramFlow', 'markovFlow'].includes(key as string)) {
    return value.toFixed(1);
  }

  if (
    [
      'natureWords',
      'repeatedWords',
      'weakStarts',
      'blacklistedVerses',
      'properNouns',
    ].includes(key as string)
  ) {
    return (value ?? 0).toString();
  }

  return `${Math.round(value * 100)}%`;
}

// Staggered reveal inside the sheet: the whole board lands within ~500ms
function getDelay(categoryIndex: number, metricIndex: number): number {
  return 60 + categoryIndex * 30 + metricIndex * 15;
}
</script>

<template>
  <ZenCard
    v-if="quality"
    variant="panel"
    :loading="!visible"
    class="scoring-card"
    :class="{ 'scoring-card--busy': !visible }"
    :aria-label="t('scoring.title')"
  >
    <h2 class="scoring-card__title">{{ t('scoring.title') }}</h2>

    <!-- One integer, said once -->
    <p class="scoring-card__score">
      <span class="scoring-card__score-value">{{ cardScore }}</span>
      <span class="scoring-card__score-max">/100</span>
    </p>

    <button
      type="button"
      class="scoring-card__details-btn"
      @click="showModal = true"
    >
      <span>{{ t('scoring.viewDetails') }}</span>
      <ChevronRight
        :size="16"
        class="scoring-card__details-icon"
        aria-hidden="true"
      />
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
          :delay="0"
          color="primary"
        />
        <div class="scoring-modal__hero-info">
          <span class="scoring-modal__hero-value">
            {{ modalScore }}
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
.scoring-card {
  padding: 1.25rem;
  transition: opacity var(--gk-dur-base) var(--gk-ease-out);

  // While the next haiku is written the card stays in place, dimmed, so the
  // sidebar never jumps; the site-wide quill carries the loading signal
  &--busy {
    opacity: 0.72;
  }

  &__title {
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.3;
    color: var(--gk-ink);
    margin: 0;
  }

  &__score {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
    margin: 1rem 0 0;
  }

  &__score-value {
    font-size: 2.25rem;
    font-weight: 400;
    color: var(--gk-ink);
    line-height: 1;
    letter-spacing: -0.04em;
    font-variant-numeric: tabular-nums;
  }

  &__score-max {
    font-size: 0.9375rem;
    color: var(--gk-ink-soft);
    font-variant-numeric: tabular-nums;
  }

  // A text key under the number: no ring, a faint wash on hover
  &__details-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.625rem 0.5rem;
    margin: 0.5rem 0 0 -0.5rem;
    font-size: 0.875rem;
    font-weight: 700;
    min-height: 2.75rem;
    font-family: inherit;
    color: var(--gk-indigo);
    background: transparent;
    border: 0;
    border-radius: var(--gk-radius-control);
    cursor: pointer;
    transition:
      background-color var(--gk-dur-fast) var(--gk-ease-out),
      transform var(--gk-dur-press) var(--gk-ease-out);

    @media (hover: hover) {
      &:hover {
        background: var(--gk-ink-faint);
      }
    }

    &:active {
      transform: scale(0.98);
    }

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 3px;
    }
  }

  &__details-icon {
    transition: transform var(--gk-dur-fast) var(--gk-ease-out);
  }

  @media (hover: hover) {
    &__details-btn:hover &__details-icon {
      transform: translateX(2px);
    }
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
    color: var(--gk-ink);
  }

  &__header-text {
    display: flex;
    flex-direction: column;
  }

  &__title {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--gk-ink);
    margin: 0;
  }

  &__subtitle {
    font-size: 0.875rem;
    color: var(--gk-ink-soft);
    margin: 0;
  }

  &__hero {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 0;
    margin-block: 0 1rem;
    background: transparent;
    border: 0;
  }

  &__hero-info {
    display: flex;
    flex-direction: column;
  }

  &__hero-value {
    font-size: 2rem;
    font-weight: 400;
    color: var(--gk-ink);
    line-height: 1;
    letter-spacing: -0.04em;
    font-variant-numeric: tabular-nums;
  }

  &__hero-label {
    font-size: 0.6875rem;
    font-weight: 700;
    color: var(--gk-ink-soft);
    text-transform: uppercase;
    letter-spacing: 0.14em;
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
      font-size: 0.6875rem;
      font-weight: 700;
      color: var(--gk-ink-soft);
      text-transform: uppercase;
      letter-spacing: 0.14em;
      margin-bottom: 0.5rem;
      padding-bottom: 0.25rem;
      border-bottom: var(--gk-rule-faint);

      svg {
        color: var(--gk-ink);
      }
    }

    &--penalty {
      .scoring-modal__category-header svg {
        color: var(--gk-ink-soft);
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
    background: transparent;
    border-bottom: 1px dashed var(--gk-ink-faint);
    border-radius: 0;

    // Settles in as the sheet opens; `backwards` keeps the rest state visible
    animation: metric-in var(--gk-dur-base) var(--gk-ease-out) backwards;
    animation-delay: var(--stagger-delay, 0ms);
  }

  &__metric-label {
    font-size: 0.875rem;
    color: var(--gk-ink-soft);
    white-space: nowrap;
  }
}

@keyframes metric-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .scoring-card {
    &__details-btn,
    &__details-icon {
      transition: none;
    }
  }

  .scoring-modal__metric {
    animation-name: metric-fade;
  }

  @keyframes metric-fade {
    from {
      opacity: 0;
    }
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
