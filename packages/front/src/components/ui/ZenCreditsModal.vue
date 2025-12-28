<script lang="ts" setup>
import { ref, watch, onUnmounted, nextTick } from 'vue';
import { X, ExternalLink } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const isOpen = ref(false);
const isAnimating = ref(false);
const modalRef = ref<HTMLElement | null>(null);
const previousActiveElement = ref<HTMLElement | null>(null);

const currentYear = new Date().getFullYear();

function open() {
  previousActiveElement.value = document.activeElement as HTMLElement;
  isOpen.value = true;
  isAnimating.value = true;

  nextTick(() => {
    modalRef.value?.focus();
  });
}

function close() {
  isOpen.value = false;

  nextTick(() => {
    previousActiveElement.value?.focus();
  });
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close();
  }

  if (event.key === 'Tab' && modalRef.value) {
    const focusableElements = [...modalRef.value.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')];
    const firstElement = focusableElements.at(0);
    const lastElement = focusableElements.at(-1);

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  }
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    close();
  }
}

function onAnimationEnd() {
  isAnimating.value = false;
}

watch(isOpen, (value) => {
  if (value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onUnmounted(() => {
  document.body.style.overflow = '';
});

defineExpose({ open, close });
</script>

<template>
  <Teleport to="body">
    <Transition name="zen-modal">
      <div
        v-if="isOpen"
        class="zen-credits-backdrop"
        @click="handleBackdropClick"
        @keydown="handleKeydown"
      >
        <div
          ref="modalRef"
          class="zen-credits-modal"
          role="dialog"
          aria-modal="true"
          :aria-label="t('footer.credits.ariaLabel')"
          tabindex="-1"
          @animationend="onAnimationEnd"
        >
          <!-- Paper texture -->
          <div class="zen-credits-modal__paper" aria-hidden="true" />

          <!-- Close button -->
          <button
            type="button"
            class="zen-credits-modal__close"
            :aria-label="t('common.close')"
            @click="close"
          >
            <X :size="20" aria-hidden="true" />
          </button>

          <!-- Haiku content -->
          <div class="zen-credits-modal__haiku">
            <p class="zen-credits-modal__line zen-credits-modal__line--1">
              {{ t('footer.credits.line1') }}
            </p>
            <p class="zen-credits-modal__line zen-credits-modal__line--2">
              {{ t('footer.credits.line2') }}
            </p>
            <p class="zen-credits-modal__line zen-credits-modal__line--3">
              {{ t('footer.credits.line3') }}
            </p>
          </div>

          <!-- Brush stroke -->
          <div class="zen-credits-modal__brush" aria-hidden="true">
            <svg viewBox="0 0 200 20" preserveAspectRatio="none">
              <path
                class="zen-credits-modal__brush-path"
                d="M0,10 Q25,5 50,10 T100,10 T150,10 T200,10"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>

          <!-- Year -->
          <p class="zen-credits-modal__year">
            ～ {{ t('footer.credits.years', { year: currentYear }) }} ～
          </p>

          <!-- Hanko stamp -->
          <div class="zen-credits-modal__hanko" aria-hidden="true">
            <svg viewBox="0 0 40 40">
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              />
              <text
                x="20"
                y="24"
                text-anchor="middle"
                font-size="12"
                fill="currentColor"
              >
                俳
              </text>
            </svg>
          </div>

          <!-- Portfolio Link -->
          <div class="zen-credits-modal__links">
            <a
              href="https://heristop.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              class="zen-btn zen-btn--cta zen-credits-modal__link"
              :aria-label="t('footer.credits.portfolioLabel')"
            >
              <ExternalLink :size="18" aria-hidden="true" />
              <span>{{ t('footer.credits.portfolio') }}</span>
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.zen-credits-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: oklch(0 0 0 / 0.5);
  backdrop-filter: blur(8px);
  padding: 1rem;
}

.zen-credits-modal {
  position: relative;
  width: 100%;
  max-width: 380px;
  padding: 2.5rem 2rem 2rem;
  background:
    radial-gradient(ellipse at center, oklch(0.55 0.08 170 / 0.04) 0%, transparent 70%),
    var(--gutenku-paper-bg-aged);
  border: 1px solid var(--gutenku-paper-border);
  border-radius: var(--gutenku-radius-md);
  box-shadow:
    0 8px 32px oklch(0 0 0 / 0.2),
    0 2px 8px oklch(0 0 0 / 0.1),
    inset 0 1px 0 oklch(1 0 0 / 0.5);
  text-align: center;
  overflow: hidden;

  &:focus {
    outline: none;
  }

  &__paper {
    position: absolute;
    inset: 0;
    background:
      url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    opacity: 0.03;
    pointer-events: none;
    border-radius: inherit;
  }

  &__close {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 50%;
    color: var(--gutenku-text-muted);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 2;

    &:hover {
      background: oklch(0 0 0 / 0.06);
      color: var(--gutenku-text-primary);
      transform: rotate(90deg);
    }

    &:focus-visible {
      outline: 2px solid var(--gutenku-zen-primary);
      outline-offset: 2px;
    }
  }

  &__haiku {
    position: relative;
    margin-bottom: 1.5rem;
    z-index: 1;
  }

  &__line {
    font-family: 'JMH Typewriter', monospace;
    font-size: 1.1rem;
    line-height: 2;
    color: var(--gutenku-text-primary);
    margin: 0;
    opacity: 0;
    animation: typewriter-reveal 0.4s ease forwards;

    &--1 {
      animation-delay: 0.3s;
    }

    &--2 {
      animation-delay: 0.6s;
      font-style: italic;
    }

    &--3 {
      animation-delay: 0.9s;
    }
  }

  &__brush {
    position: relative;
    width: 60%;
    height: 20px;
    margin: 0 auto 1.25rem;
    color: var(--gutenku-zen-primary);
    opacity: 0;
    animation: fade-in 0.3s ease forwards;
    animation-delay: 1.2s;
    z-index: 1;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  &__brush-path {
    stroke-dasharray: 300;
    stroke-dashoffset: 300;
    animation: brush-draw 0.6s ease forwards;
    animation-delay: 1.3s;
  }

  &__year {
    font-family: 'JMH Typewriter', monospace;
    font-size: 0.9rem;
    color: var(--gutenku-text-muted);
    margin: 0 0 1.5rem;
    opacity: 0;
    animation: fade-in 0.3s ease forwards;
    animation-delay: 1.5s;
    z-index: 1;
    position: relative;
  }

  &__hanko {
    position: absolute;
    bottom: 4rem;
    right: 1.5rem;
    width: 40px;
    height: 40px;
    color: oklch(0.55 0.2 25);
    opacity: 0;
    transform: scale(0) rotate(-15deg);
    animation: hanko-stamp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    animation-delay: 1.8s;
    z-index: 1;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  &__links {
    position: relative;
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    opacity: 0;
    animation: fade-in 0.3s ease forwards;
    animation-delay: 2s;
    z-index: 1;
  }

  &__link {
    padding: 0.875rem 2rem !important;
    font-size: 1rem !important;
  }
}

// Animations
@keyframes typewriter-reveal {
  0% {
    opacity: 0;
    transform: translateY(8px);
    filter: blur(4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes brush-draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes hanko-stamp {
  0% {
    opacity: 0;
    transform: scale(0) rotate(-15deg);
  }
  60% {
    opacity: 1;
    transform: scale(1.2) rotate(5deg);
  }
  80% {
    transform: scale(0.95) rotate(-2deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

// Modal transitions
.zen-modal-enter-active {
  animation: modal-enter 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);

  .zen-credits-modal {
    animation: modal-content-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.zen-modal-leave-active {
  animation: modal-leave 0.25s ease-in forwards;

  .zen-credits-modal {
    animation: modal-content-leave 0.2s ease-in forwards;
  }
}

@keyframes modal-enter {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modal-leave {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes modal-content-enter {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
    filter: blur(8px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
    filter: blur(0);
  }
}

@keyframes modal-content-leave {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.95);
  }
}

// Dark theme
[data-theme='dark'] .zen-credits-backdrop {
  background: oklch(0 0 0 / 0.7);
}

[data-theme='dark'] .zen-credits-modal {
  background:
    radial-gradient(ellipse at center, oklch(0.5 0.06 170 / 0.06) 0%, transparent 70%),
    var(--gutenku-paper-bg);
  box-shadow:
    0 8px 40px oklch(0 0 0 / 0.5),
    0 2px 8px oklch(0 0 0 / 0.3),
    inset 0 1px 0 oklch(1 0 0 / 0.08);

  .zen-credits-modal__paper {
    opacity: 0.04;
  }

  .zen-credits-modal__close:hover {
    background: oklch(1 0 0 / 0.1);
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .zen-credits-modal__line,
  .zen-credits-modal__brush,
  .zen-credits-modal__brush-path,
  .zen-credits-modal__year,
  .zen-credits-modal__hanko,
  .zen-credits-modal__links {
    animation: none;
    opacity: 1;
    transform: none;
    stroke-dashoffset: 0;
  }

  .zen-modal-enter-active,
  .zen-modal-leave-active {
    animation: none;

    .zen-credits-modal {
      animation: none;
    }
  }

  .zen-modal-enter-active {
    opacity: 1;
  }

  .zen-modal-leave-active {
    opacity: 0;
    transition: opacity 0.15s ease;
  }
}

// Mobile
@media (max-width: 480px) {
  .zen-credits-modal {
    padding: 2rem 1.5rem 1.5rem;

    &__line {
      font-size: 1rem;
    }

    &__hanko {
      bottom: 3.5rem;
      right: 1rem;
      width: 32px;
      height: 32px;
    }
  }
}
</style>
