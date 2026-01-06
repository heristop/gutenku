<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useHead } from '@unhead/vue';
import DefaultView from './View.vue';
import ZenToast from '@/core/components/ui/ZenToast.vue';
import ThemeToggle from '@/core/components/ThemeToggle.vue';
import AppFooter from '@/core/components/AppFooter.vue';

const route = useRoute();

function skipToMain(): void {
  const targets = [
    'preview-grid',
    'book-page',
    'start-gate',
    'game-hints',
    'main-content',
  ];
  for (const id of targets) {
    const el = document.getElementById(id);
    if (el) {
      el.focus();
      return;
    }
  }
}

const canonicalUrl = computed(
  () => `https://gutenku.xyz${route.path === '/' ? '' : route.path}`,
);

useHead({
  title: computed(() => (route.meta.title as string) || 'GutenKu'),
  link: [{ rel: 'canonical', href: canonicalUrl }],
  meta: [
    {
      name: 'description',
      content: computed(
        () =>
          (route.meta.description as string) ||
          'AI Haiku Generator & Literary Games',
      ),
    },
    {
      property: 'og:title',
      content: computed(() => (route.meta.title as string) || 'GutenKu'),
    },
    {
      property: 'og:description',
      content: computed(
        () =>
          (route.meta.description as string) ||
          'AI Haiku Generator & Literary Games',
      ),
    },
    {
      name: 'twitter:title',
      content: computed(() => (route.meta.title as string) || 'GutenKu'),
    },
    {
      name: 'twitter:description',
      content: computed(
        () =>
          (route.meta.description as string) ||
          'AI Haiku Generator & Literary Games',
      ),
    },
  ],
});
</script>

<template>
  <div class="gutenku-app">
    <div class="gutenku-app__wrap">
      <ZenToast />
      <header role="banner" class="site-header">
        <ThemeToggle />
      </header>
      <div class="light-beam-overlay" aria-hidden="true" />

      <!-- Floating particles -->
      <div class="floating-particles" aria-hidden="true">
        <div class="floating-particles__particle" />
        <div class="floating-particles__particle" />
        <div class="floating-particles__particle" />
        <div class="floating-particles__particle" />
        <div class="floating-particles__particle" />
        <div class="floating-particles__particle" />
        <div class="floating-particles__particle" />
        <div class="floating-particles__particle" />
      </div>

      <a href="#main-content" class="skip-link" @click.prevent="skipToMain">
        {{ $t('layout.skipLink') }}
      </a>
      <default-view />
      <footer role="contentinfo">
        <AppFooter />
      </footer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// CSS containment for decorative elements (improves CLS and paint performance)
.floating-particles {
  contain: strict;
  content-visibility: auto;
}

.light-beam-overlay {
  contain: strict;
}

.gutenku-app__wrap {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: var(--gutenku-app-bg);
  background-image: var(--gutenku-app-bg-image);
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
}

.site-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1000;
  // Let ThemeToggle handle its own positioning
  display: contents;
}

.skip-link {
  position: absolute;
  top: -100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  padding: 0.75rem 1.5rem;
  background: var(--gutenku-zen-primary);
  color: #fff;
  text-decoration: none;
  border-radius: 0 0 8px 8px;
  font-weight: 500;
  transition: top 0.2s ease;

  &:focus {
    top: 0;
    outline: 2px solid var(--gutenku-zen-accent);
    outline-offset: 2px;
  }
}
</style>
