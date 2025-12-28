<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import ZenCard from '@/components/ui/ZenCard.vue';

const { t } = useI18n();
</script>

<template>
  <ZenCard
    variant="default"
    class="intro-card pa-4 mb-6"
    role="complementary"
    :aria-label="t('introduction.ariaLabel')"
  >
    <div class="bookmark-ribbon" aria-hidden="true" />

    <v-card-title class="intro-card__header ma-2">
      <v-img
        :style="{ viewTransitionName: 'gutenku-logo' }"
        height="56"
        alt="GutenKu Logo"
        src="@/assets/img/logo/gutenku-logo-300.png"
        class="intro-card__logo"
      />
    </v-card-title>

    <div class="intro-card__text text-primary" role="article">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <p v-html="t('introduction.description')" />
    </div>
  </ZenCard>
</template>

<style lang="scss" scoped>
.bookmark-ribbon {
  animation: bookmark-entrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
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

.intro-card {
  position: relative;
  overflow: visible;

  @media (max-width: 600px) {
    margin-top: 3.5rem;
    margin-bottom: 1.25rem !important;
  }

  &__header {
    display: flex;
    justify-content: center;
  }

  &__logo {
    transition: var(--gutenku-transition-fast);

    &:hover {
      opacity: 0.8;
    }
  }

  &__text {
    text-align: center;

    p {
      margin: 0;
    }
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .bookmark-ribbon {
    animation: none;
  }
}
</style>
