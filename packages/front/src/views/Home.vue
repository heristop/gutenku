<script lang="ts" setup>
import { defineAsyncComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { withViewTransition } from '@/composables/view-transition';
import ZenSkeleton from '@/components/ZenSkeleton.vue';
import GamePreview from '@/components/GamePreview.vue';
import HaikuPreview from '@/components/HaikuPreview.vue';

const Hero = defineAsyncComponent({
  loader: () => import('@/components/Hero.vue'),
  loadingComponent: ZenSkeleton,
});

const { t } = useI18n();

const showContent = ref(false);

onMounted(() => {
  // Wait for next frame before triggering entrance
  requestAnimationFrame(() => {
    withViewTransition(() => {
      showContent.value = true;
    });
  });
});
</script>

<template>
  <v-container class="home-container pa-2 pa-sm-4">
    <main
      id="main-content"
      class="home-content"
      :class="{ 'home-content--visible': showContent }"
      :aria-label="t('home.haikuContentLabel')"
    >
      <!-- Introduction Section -->
      <v-row justify="center" no-gutters>
        <v-col cols="12" md="10" lg="8" class="pa-1 pa-sm-3">
          <Hero />
        </v-col>
      </v-row>

      <!-- Preview Cards Grid -->
      <div class="preview-grid">
        <GamePreview />
        <HaikuPreview />
      </div>
    </main>
  </v-container>
</template>

<style lang="scss" scoped>
.home-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  padding-top: 1rem;
  padding-bottom: 0.5rem;
}

.home-content {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.5s ease-out,
    transform 0.5s ease-out;

  &--visible {
    opacity: 1;
    transform: translateY(0);
  }
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  max-width: 900px;
  margin: 2rem auto 0;
  padding: 0 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    padding: 0 0.75rem;
    margin-top: 0;
    margin-bottom: 2.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-content {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
