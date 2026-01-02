<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Home } from 'lucide-vue-next';
import ZenCard from '@/core/components/ui/ZenCard.vue';
import ZenButton from '@/core/components/ui/ZenButton.vue';
import ZenHaiku from '@/core/components/ui/ZenHaiku.vue';
import InkBrushNav from '@/core/components/ui/InkBrushNav.vue';

const { t } = useI18n();

const isVisible = ref(false);

const haikuLines = [
  'She did it sweetly',
  'The tears came into his eyes',
  'It will be all right',
];

onMounted(() => {
  requestAnimationFrame(() => {
    isVisible.value = true;
  });
});
</script>

<template>
  <div class="not-found">
    <InkBrushNav />

    <div class="not-found__content">
      <Transition name="fade-up">
        <ZenCard
          v-if="isVisible"
          variant="default"
          class="not-found__card"
          aria-label="Page not found"
        >
          <!-- Illustration -->
          <img
            src="/gutenmage.webp"
            alt=""
            aria-hidden="true"
            class="not-found__illustration"
            width="1536"
            height="1024"
            loading="lazy"
          />

          <!-- Animated 404 number -->
          <div class="not-found__number">
            <span class="digit">4</span>
            <span class="digit digit--center">0</span>
            <span class="digit">4</span>
          </div>

          <!-- Haiku -->
          <ZenHaiku
            :lines="haikuLines"
            size="sm"
            :animated="true"
            :show-brush-stroke="false"
            class="not-found__haiku"
          />

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
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/css/_mixins' as *;

.not-found {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 1rem;

  &__content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__card {
    max-width: 420px;
    width: 100%;
    text-align: center;
    padding: var(--gutenku-space-8);

    @include sm-up {
      padding: var(--gutenku-space-12);
    }

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

  &__illustration {
    display: block;
    width: 180px;
    height: auto;
    margin: 0 auto 1.5rem;
    opacity: 0.95;
    filter: grayscale(10%) drop-shadow(0 4px 12px oklch(0.45 0.08 195 / 0.2));
    animation: float 8s ease-in-out infinite;
    border-radius: var(--gutenku-radius-md);

    @media (min-width: 600px) {
      width: 220px;
    }

    [data-theme='dark'] & {
      filter: brightness(0.9) grayscale(15%) drop-shadow(0 4px 12px oklch(0.5 0.1 195 / 0.3));
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
    transform: translateY(-2px);
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

@media (prefers-reduced-motion: reduce) {
  .not-found__illustration,
  .not-found__number .digit--center,
  .not-found__divider .brush-stroke {
    animation: none;
  }
}
</style>
