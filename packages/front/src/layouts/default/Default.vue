<script lang="ts" setup>
import DefaultView from './View.vue';
import ZenToast from '@/components/ui/ZenToast.vue';
</script>

<template>
  <v-app>
    <ZenToast />
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
  </v-app>
</template>

<style lang="scss" scoped>
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
