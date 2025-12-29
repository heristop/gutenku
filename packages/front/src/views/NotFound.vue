<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Home, BookOpen } from 'lucide-vue-next';
import ZenCard from '@/components/ui/ZenCard.vue';
import ZenButton from '@/components/ui/ZenButton.vue';

const { t } = useI18n();

const isVisible = ref(false);
const showVerses = ref([false, false, false]);

onMounted(() => {
  requestAnimationFrame(() => {
    isVisible.value = true;
  });

  // Staggered verse animations
  [400, 600, 800].forEach((delay, i) => {
    setTimeout(() => {
      showVerses.value[i] = true;
    }, delay);
  });
});
</script>

<template>
  <v-container class="not-found fill-height d-flex align-center justify-center">
    <Transition name="fade-up">
      <ZenCard
        v-if="isVisible"
        variant="default"
        class="not-found__card text-center pa-8 pa-sm-12"
        aria-label="Page not found"
      >
        <!-- Floating book icon -->
        <div class="not-found__icon">
          <BookOpen :size="48" stroke-width="1" />
        </div>

        <!-- Animated 404 number -->
        <div class="not-found__number">
          <span class="digit">4</span>
          <span class="digit digit--center">0</span>
          <span class="digit">4</span>
        </div>

        <!-- Staggered haiku verses -->
        <div class="not-found__haiku">
          <Transition name="verse">
            <p v-if="showVerses[0]" class="verse">{{ t('notFound.verse1') }}</p>
          </Transition>
          <Transition name="verse">
            <p v-if="showVerses[1]" class="verse">{{ t('notFound.verse2') }}</p>
          </Transition>
          <Transition name="verse">
            <p v-if="showVerses[2]" class="verse">{{ t('notFound.verse3') }}</p>
          </Transition>
        </div>

        <!-- Ink brush divider -->
        <div class="not-found__divider">
          <span class="brush-stroke"></span>
        </div>

        <ZenButton to="/" :aria-label="t('notFound.returnHome')">
          <template #icon-left>
            <Home :size="18" />
          </template>
          {{ t('notFound.returnHome') }}
        </ZenButton>
      </ZenCard>
    </Transition>
  </v-container>
</template>

<style lang="scss" scoped>
.not-found {
  min-height: 80vh;

  &__card {
    max-width: 420px;
    width: 100%;
    background: linear-gradient(
      135deg,
      var(--gutenku-paper-bg) 0%,
      var(--gutenku-paper-bg-warm) 100%
    );
    border-radius: var(--gutenku-radius-xl);
    box-shadow: var(--gutenku-shadow-paper, var(--gutenku-shadow-zen));
    position: relative;
    z-index: 1;

    [data-theme='dark'] & {
      background: oklch(0.18 0.02 70 / 0.7);
      backdrop-filter: blur(16px);
      border: 1px solid oklch(1 0 0 / 0.05);
    }
  }

  &__icon {
    color: var(--gutenku-zen-secondary);
    opacity: 0.7;
    margin-bottom: 1rem;
    animation: float 4s ease-in-out infinite;

    [data-theme='dark'] & {
      opacity: 0.6;
    }
  }

  &__number {
    font-size: 5rem;
    font-weight: 200;
    letter-spacing: 0.15em;
    color: var(--gutenku-text-primary);
    line-height: 1;
    margin-bottom: 1.5rem;
    display: flex;
    justify-content: center;
    gap: 0.1em;

    .digit {
      display: inline-block;
      text-shadow: 2px 2px 4px oklch(0 0 0 / 0.08);
      transition: transform 0.3s ease;

      &--center {
        animation: breathe 3s ease-in-out infinite;
      }
    }

    [data-theme='dark'] & .digit {
      text-shadow: 2px 2px 12px oklch(0 0 0 / 0.4);
    }

    @media (max-width: 600px) {
      font-size: 4rem;
    }
  }

  &__haiku {
    margin-bottom: 2rem;
    min-height: 5.4rem;

    .verse {
      font-size: 1.1rem;
      font-style: italic;
      color: var(--gutenku-text-zen);
      line-height: 1.8;
      margin: 0;

      &:nth-child(2) {
        font-size: 1rem;
        opacity: 0.9;
      }

      &:nth-child(3) {
        font-size: 0.95rem;
        opacity: 0.8;
      }

      @media (max-width: 600px) {
        font-size: 1rem;

        &:nth-child(2) {
          font-size: 0.95rem;
        }

        &:nth-child(3) {
          font-size: 0.9rem;
        }
      }
    }
  }

  &__divider {
    width: 80px;
    height: 3px;
    margin: 0 auto 2rem;
    position: relative;
    overflow: hidden;

    .brush-stroke {
      display: block;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent 0%,
        var(--gutenku-zen-secondary) 20%,
        var(--gutenku-zen-secondary) 80%,
        transparent 100%
      );
      opacity: 0.5;
      border-radius: var(--gutenku-radius-xs);
      animation: brush-in 0.8s ease-out 0.5s both;
    }
  }

}

// Animations
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes breathe {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

@keyframes brush-in {
  from {
    transform: scaleX(0);
    opacity: 0;
  }
  to {
    transform: scaleX(1);
    opacity: 0.5;
  }
}

// Page transitions
.fade-up-enter-active {
  transition:
    opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-up-enter-to {
  opacity: 1;
  transform: translateY(0);
}

// Verse transitions
.verse-enter-active {
  transition:
    opacity 0.4s ease-out,
    transform 0.4s ease-out;
}

.verse-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.verse-enter-to {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .not-found__icon,
  .not-found__number .digit--center,
  .not-found__divider .brush-stroke {
    animation: none;
  }
}
</style>
