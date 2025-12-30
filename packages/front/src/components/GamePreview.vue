<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { ChevronRight } from 'lucide-vue-next';
import { useGameStore } from '@/store/game';
import { useGlobalStats } from '@/composables/global-stats';
import ZenChip from '@/components/ui/ZenChip.vue';

const { t } = useI18n();
const gameStore = useGameStore();
const { puzzleNumber } = storeToRefs(gameStore);
const { globalStats, fetchGlobalStats, formatNumber } = useGlobalStats();

const winRate = computed(() => {
  if (globalStats.value.totalGamesPlayed === 0) {return 0;}
  return Math.round((globalStats.value.totalGamesWon / globalStats.value.totalGamesPlayed) * 100);
});

const statsLabel = computed(() => {
  return `${t('game.puzzleNumber', { number: puzzleNumber.value })}, ${t('home.gamesPlayed', { count: formatNumber(globalStats.value.totalGamesPlayed) })}, ${t('home.winRate', { rate: winRate.value })}`;
});

onMounted(() => {
  fetchGlobalStats();
});
</script>

<template>
  <RouterLink
    to="/game"
    class="preview-card gutenku-card"
    :aria-label="t('game.playToday')"
  >
    <div class="preview-card__header">
      <img
        src="@/assets/img/sumi-e-books-320.webp"
        srcset="
          @/assets/img/sumi-e-books-320.webp 320w,
          @/assets/img/sumi-e-books-640.webp 640w
        "
        sizes="(max-width: 600px) 320px, 640px"
        alt=""
        class="preview-card__illustration"
        loading="lazy"
      />
      <div class="preview-card__overlay">
        <div class="preview-card__title-row">
          <div>
            <h2 class="preview-card__title">GutenGuess</h2>
            <ZenChip
              v-if="globalStats.totalGamesPlayed > 0"
              class="preview-card__subtitle"
              variant="muted"
              size="sm"
              :ariaLabel="statsLabel"
            >
              #{{ puzzleNumber }} ·
              {{ t('home.gamesPlayed', { count: formatNumber(globalStats.totalGamesPlayed) }) }}
              · {{ t('home.winRate', { rate: winRate }) }}
            </ZenChip>
          </div>
        </div>
      </div>
    </div>

    <div class="preview-card__body">
      <p class="preview-card__description">{{ t('game.tagline') }}</p>
      <span class="preview-card__cta">
        {{ t('game.playToday') }}
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
  border-radius: var(--gutenku-radius-md);
  overflow: hidden;
  transition: var(--gutenku-transition-zen);
  box-shadow: var(--gutenku-shadow-zen);
  view-transition-name: game-card;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--gutenku-shadow-elevated);

    .preview-card__illustration {
      transform: scale(1.05);
    }

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
  transition: transform 0.6s var(--gutenku-ease-zen);
  view-transition-name: game-illustration;
  opacity: 0;
  animation: illustration-appear 0.8s ease-out 0.3s forwards;

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

.preview-card__subtitle {
  margin-top: 0.35rem;
  backdrop-filter: blur(4px);
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
