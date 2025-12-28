<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useHead } from '@unhead/vue';
import DefaultView from './View.vue';
import ZenToast from '@/components/ui/ZenToast.vue';
import ThemeToggle from '@/components/ThemeToggle.vue';
import AppFooter from '@/components/AppFooter.vue';

const route = useRoute();

useHead({
  title: computed(() => (route.meta.title as string) || 'GutenKu'),
  meta: [
    {
      name: 'description',
      content: computed(
        () =>
          (route.meta.description as string) ||
          'AI Haiku Generator & Literary Games'
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
          'AI Haiku Generator & Literary Games'
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
          'AI Haiku Generator & Literary Games'
      ),
    },
  ],
});
</script>

<template>
  <v-app>
    <ZenToast />
    <ThemeToggle />
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

    <a href="#main-content" class="skip-link">
      {{ $t('layout.skipLink') }}
    </a>
    <default-view />
    <footer role="contentinfo">
      <AppFooter />
    </footer>
  </v-app>
</template>

<style lang="scss" scoped>
:deep(.v-application__wrap) {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
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
