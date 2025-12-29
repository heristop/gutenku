<script lang="ts" setup>
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { ChevronLeft } from 'lucide-vue-next';
import ZenButton from '@/components/ui/ZenButton.vue';
import ZenSkeleton from '@/components/ZenSkeleton.vue';
import { useHaikuStore } from '@/store/haiku';
import { withViewTransition } from '@/composables/view-transition';
import { useToast } from '@/composables/toast';
import { usePullToRefresh } from '@/composables/pull-to-refresh';
import PullToRefresh from '@/components/PullToRefresh.vue';
import HaikuTitle from '@/components/HaikuTitle.vue';
import AppLoading from '@/components/AppLoading.vue';

const HaikuCanvas = defineAsyncComponent({
  loader: () => import('@/components/HaikuCanvas.vue'),
  loadingComponent: ZenSkeleton,
});

const HaikuChapter = defineAsyncComponent({
  loader: () => import('@/components/HaikuChapter.vue'),
  loadingComponent: ZenSkeleton,
  delay: 200,
});

const ToolbarPanel = defineAsyncComponent({
  loader: () => import('@/components/ToolbarPanel.vue'),
  loadingComponent: ZenSkeleton,
});

const ConfigPanel = defineAsyncComponent({
  loader: () => import('@/components/ConfigPanel.vue'),
  loadingComponent: ZenSkeleton,
  delay: 300,
});

const StatsPanel = defineAsyncComponent({
  loader: () => import('@/components/StatsPanel.vue'),
  loadingComponent: ZenSkeleton,
  delay: 300,
});

const SocialPreviewCard = defineAsyncComponent(
  () => import('@/components/SocialPreviewCard.vue'),
);

const isDev = import.meta.env.DEV;

const { t, tm } = useI18n();
const { error: showError } = useToast();

const haikuStore = useHaikuStore();
const { fetchNewHaiku } = haikuStore;
const { haiku, error, firstLoaded, networkError, loading, optionUseAI } = storeToRefs(haikuStore);

const containerRef = ref<HTMLElement | null>(null);
const { pullDistance, isRefreshing, shouldRelease, progress } = usePullToRefresh(
  containerRef,
  { onRefresh: fetchNewHaiku },
);

watch(error, (newError) => {
  if (newError && newError !== 'network-error') {
    showError(newError);
    haikuStore.error = '';
  }
});

const literaryLoadingMessages = computed(() => {
  const messages = tm('home.loadingMessages');
  return Object.keys(messages)
    .filter((key) => !Number.isNaN(Number(key)))
    .map((key) => t(`home.loadingMessages.${key}`));
});

const loadingLabel = computed(() => {
  if (!firstLoaded.value || loading.value) {
    const messages = literaryLoadingMessages.value;
    const index = Math.floor(Date.now() / 2500) % messages.length;
    return messages[index];
  }
  return t('home.readyMessage');
});

onMounted(fetchNewHaiku);
</script>

<template>
  <v-container ref="containerRef" class="haiku-page pa-2 pa-sm-4">
    <PullToRefresh
      :pull-distance="pullDistance"
      :is-refreshing="isRefreshing"
      :should-release="shouldRelease"
      :progress="progress"
    />

    <nav :aria-label="t('nav.pageNavigation')">
      <ZenButton
        to="/"
        variant="ghost"
        spring
        class="haiku-page__back-wrapper"
        :aria-label="t('common.back')"
      >
        <template #icon-left>
          <ChevronLeft :size="18" />
        </template>
        {{ t('common.back') }}
      </ZenButton>
    </nav>

    <div v-if="!firstLoaded && !networkError" class="haiku-page__loading">
      <AppLoading :text="loadingLabel" :splash="true" />
    </div>

    <div v-else-if="networkError" class="haiku-page__error" role="alert">
      <AppLoading
        :splash="true"
        error
        :text="t('home.networkError')"
        :on-retry="fetchNewHaiku"
      />
    </div>

    <main
      v-else
      id="main-content"
      class="haiku-page__content"
      :aria-busy="loading"
      :aria-label="t('home.haikuContentLabel')"
    >
      <v-row>
        <v-col cols="12" md="7" lg="8" order="1" order-md="1">
          <article :aria-label="t('haiku.articleLabel')">
            <HaikuTitle class="mb-4" />

            <HaikuChapter v-if="haiku" class="mb-4" />
          </article>
        </v-col>

        <v-col cols="12" md="5" lg="4" order="2" order-md="2">
          <aside
            :aria-label="t('haiku.controlsLabel')"
            class="haiku-page__sidebar"
          >
            <HaikuCanvas class="mb-0" />

            <ToolbarPanel class="mb-4" />

            <StatsPanel class="mb-4" />

            <ConfigPanel />

            <SocialPreviewCard v-if="isDev && optionUseAI" class="mt-4" />
          </aside>
        </v-col>
      </v-row>
    </main>
  </v-container>
</template>

<style lang="scss" scoped>
.haiku-page {
  min-height: 100vh;
  padding-bottom: 2rem;
  view-transition-name: haiku-page;
}

.haiku-page__back-wrapper {
  margin-bottom: 1.5rem;
  margin-left: 0.5rem;
  margin-top: 0.25rem;

  @media (min-width: 600px) {
    margin-left: 0;
    margin-top: 0;
  }
}

.haiku-page__loading,
.haiku-page__error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.haiku-page__content {
  animation: fade-in 0.4s ease-out;
}

.haiku-page__sidebar {
  position: sticky;
  top: 1rem;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 960px) {
  .haiku-page__sidebar {
    position: static;
    margin-top: -1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .haiku-page__content {
    animation: none;
  }
}
</style>
