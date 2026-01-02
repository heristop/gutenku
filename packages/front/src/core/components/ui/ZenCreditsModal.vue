<script lang="ts" setup>
import { computed } from 'vue';
import { ExternalLink, Instagram, Github, Linkedin, Twitter } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import ZenModal from '@/core/components/ui/ZenModal.vue';
import ZenButton from '@/core/components/ui/ZenButton.vue';
import ZenHaiku from '@/core/components/ui/ZenHaiku.vue';

const modelValue = defineModel<boolean>({ default: false });

const { t } = useI18n();
const currentYear = new Date().getFullYear();

const haikuLines = computed(() => [
  t('footer.credits.line1'),
  t('footer.credits.line2'),
  t('footer.credits.line3'),
]);
</script>

<template>
  <ZenModal
    v-model="modelValue"
    :max-width="380"
    variant="scroll"
    content-class="zen-credits-modal"
    :title="t('footer.credits.ariaLabel')"
    description="Credits and information about GutenKu"
  >
    <!-- Haiku content -->
    <ZenHaiku :lines="haikuLines" class="zen-credits-modal__haiku" />

    <!-- Author -->
    <p class="zen-credits-modal__author">
      {{ t('footer.credits.craftedBy') }} <strong>heristop</strong>
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

    <!-- Year -->
    <p class="zen-credits-modal__year">
      ～ {{ t('footer.credits.years', { year: currentYear }) }} ～
    </p>

    <!-- Portfolio Link -->
    <div class="zen-credits-modal__links">
      <ZenButton
        href="https://heristop.vercel.app"
        target="_blank"
        class="zen-credits-modal__link"
        :aria-label="t('footer.credits.portfolioLabel')"
      >
        <template #icon-left>
          <ExternalLink :size="18" aria-hidden="true" />
        </template>
        {{ t('footer.credits.portfolio') }}
      </ZenButton>
    </div>

    <!-- Social Links -->
    <div class="zen-credits-modal__social">
      <a
        href="https://instagram.com/heristop"
        target="_blank"
        rel="noopener noreferrer"
        class="zen-credits-modal__social-link"
        :aria-label="t('footer.social.instagram')"
      >
        <Instagram :size="18" aria-hidden="true" />
      </a>
      <a
        href="https://github.com/heristop"
        target="_blank"
        rel="noopener noreferrer"
        class="zen-credits-modal__social-link"
        :aria-label="t('footer.social.github')"
      >
        <Github :size="18" aria-hidden="true" />
      </a>
      <a
        href="https://www.linkedin.com/in/heristop"
        target="_blank"
        rel="noopener noreferrer"
        class="zen-credits-modal__social-link"
        :aria-label="t('footer.social.linkedin')"
      >
        <Linkedin :size="18" aria-hidden="true" />
      </a>
      <a
        href="https://x.com/heristop"
        target="_blank"
        rel="noopener noreferrer"
        class="zen-credits-modal__social-link"
        :aria-label="t('footer.social.x')"
      >
        <Twitter :size="18" aria-hidden="true" />
      </a>
      <a
        href="https://bsky.app/profile/heristop.bsky.social"
        target="_blank"
        rel="noopener noreferrer"
        class="zen-credits-modal__social-link"
        :aria-label="t('footer.social.bluesky')"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.882 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"
          />
        </svg>
      </a>
    </div>

    <!-- Feedback Text -->
    <p class="zen-credits-modal__feedback">
      {{ t('footer.credits.feedback') }}
    </p>
  </ZenModal>
</template>

<style scoped lang="scss">
:deep(.zen-credits-modal) {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  overflow: hidden;
}

.zen-credits-modal {
  &__haiku {
    margin-bottom: 1.5rem;
  }

  &__author {
    position: relative;
    font-family: 'JMH Typewriter', monospace;
    font-size: 0.95rem;
    color: var(--gutenku-text-primary);
    margin: 0 0 1rem;
    opacity: 0;
    animation: fade-in 0.3s ease forwards;
    animation-delay: 1.4s;
    z-index: 1;

    strong {
      font-weight: 600;
      color: var(--gutenku-zen-primary);
    }
  }

  &__year {
    font-family: 'JMH Typewriter', monospace;
    font-size: 0.9rem;
    color: var(--gutenku-text-muted);
    margin: 0 0 1.5rem;
    opacity: 0;
    animation: fade-in 0.3s ease forwards;
    animation-delay: 1.8s;
    z-index: 1;
    position: relative;
  }

  &__hanko {
    position: relative;
    width: 40px;
    height: 40px;
    margin: 0 auto 0.75rem;
    color: oklch(0.55 0.2 25);
    opacity: 0;
    transform: scale(0) rotate(-15deg);
    animation: hanko-stamp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    animation-delay: 1.6s;
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

  &__social {
    position: relative;
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 1rem;
    opacity: 0;
    animation: fade-in 0.3s ease forwards;
    animation-delay: 2.2s;
    z-index: 1;
  }

  &__social-link {
    display: grid;
    place-items: center;
    width: 2.25rem;
    height: 2.25rem;
    color: var(--gutenku-text-muted);
    background: transparent;
    border: 1px solid oklch(0 0 0 / 0.1);
    border-radius: 50%;
    text-decoration: none;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      color: var(--gutenku-zen-primary);
      background: oklch(0 0 0 / 0.04);
      border-color: var(--gutenku-zen-primary);
      transform: translateY(-2px);
    }

    &:focus-visible {
      outline: 2px solid var(--gutenku-zen-primary);
      outline-offset: 2px;
    }
  }

  &__feedback {
    position: relative;
    font-family: 'JMH Typewriter', monospace;
    font-size: 0.8rem;
    color: var(--gutenku-text-muted);
    margin: 1rem 0 0;
    opacity: 0;
    animation: fade-in 0.3s ease forwards;
    animation-delay: 2.4s;
    z-index: 1;
  }
}

// Animations
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
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

// Dark theme
[data-theme='dark'] .zen-credits-modal {
  &__social-link {
    border-color: oklch(1 0 0 / 0.15);

    &:hover {
      color: var(--gutenku-zen-accent);
      background: oklch(1 0 0 / 0.08);
      border-color: var(--gutenku-zen-accent);
    }
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .zen-credits-modal {
    &__author,
    &__year,
    &__hanko,
    &__links,
    &__social,
    &__feedback {
      animation: none;
      opacity: 1;
      transform: none;
    }

    &__social-link {
      transition: none;
    }
  }
}

// Mobile
@media (max-width: 480px) {
  .zen-credits-modal {
    &__author {
      font-size: 0.875rem;
    }

    &__hanko {
      width: 32px;
      height: 32px;
    }
  }
}
</style>
