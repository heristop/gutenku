<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue';
import { storeToRefs } from 'pinia';
import { Share2, Copy, Check, Sparkles } from 'lucide-vue-next';
import { generateSocialCaption, type HaikuValue } from '@gutenku/shared';
import { useHaikuStore } from '@/features/haiku/store/haiku';
import { useInView } from '@/features/haiku/composables/in-view';
import { useClipboard } from '@/core/composables/clipboard';
import ZenCard from '@/core/components/ui/ZenCard.vue';
import ZenButton from '@/core/components/ui/ZenButton.vue';
import ZenAccordion from '@/core/components/ui/ZenAccordion.vue';

const cardRef = useTemplateRef<HTMLElement>('cardRef');
const { isInView } = useInView(cardRef, { delay: 300 });

const store = useHaikuStore();
const { haiku, loading } = storeToRefs(store);

const expanded = ref(true);
const { copy, copied } = useClipboard();

const hasValidData = computed(() => {
  const h = haiku.value;
  return h?.title && (h?.translations?.fr || h?.translations?.jp);
});

const caption = computed(() => {
  if (!haiku.value || !hasValidData.value) {
    return '';
  }
  return generateSocialCaption(haiku.value as HaikuValue);
});

defineExpose({ hasValidData });

function copyCaption() {
  copy(caption.value);
}
</script>

<template>
  <ZenCard
    ref="cardRef"
    variant="panel"
    :loading="loading"
    aria-label="Social Preview"
    class="social-panel social-panel--card animate-in"
    :class="{ 'is-visible': isInView }"
  >
    <ZenAccordion
      v-model="expanded"
      :icon="Share2"
      title="Social Preview"
      subtitle="Dev mode only"
      storage-key="socialPanel-expanded"
      :default-expanded="true"
      aria-label="Social Preview"
    >
      <div class="social-panel__content">
        <div v-if="hasValidData" class="social-panel__preview">
          <div class="social-panel__caption">
            <pre class="social-panel__caption-text">{{ caption }}</pre>
          </div>
          <ZenButton class="social-panel__copy-btn" @click="copyCaption">
            <template #icon-left>
              <component :is="copied ? Check : Copy" :size="18" />
            </template>
            {{ copied ? 'Copied!' : 'Copy Caption' }}
          </ZenButton>
        </div>
        <div v-else class="social-panel__placeholder">
          <Sparkles :size="24" class="social-panel__placeholder-icon" />
          <p class="social-panel__placeholder-text">
            Generate a new haiku to see AI description
          </p>
        </div>
      </div>
    </ZenAccordion>
  </ZenCard>
</template>

<style scoped lang="scss">
.social-panel {
  position: relative;
  padding: var(--gutenku-space-5);
  margin-bottom: var(--gutenku-space-6);

  &__content {
    padding-top: 0.5rem;
  }

  &__preview {
    background: #36393f;
    border-radius: var(--gutenku-radius-md);
    padding: 1rem;
    border: 1px solid #202225;
  }

  &__caption {
    max-height: 400px;
    overflow-y: auto;
  }

  &__caption-text {
    font-family: 'Whitney', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 0.9rem;
    line-height: 1.4;
    color: #dcddde;
    white-space: pre-wrap;
    word-break: break-word;
    margin: 0;
    background: transparent;
  }

  &__copy-btn {
    width: 100%;
    margin-top: var(--gutenku-space-3);
  }

  &__placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem 1rem;
    background: var(--gutenku-zen-soft);
    border-radius: var(--gutenku-radius-md);
    border: 1px dashed var(--gutenku-border);
  }

  &__placeholder-icon {
    color: var(--gutenku-zen-primary);
    opacity: 0.6;
  }

  &__placeholder-text {
    margin: 0;
    font-size: 0.875rem;
    color: var(--gutenku-text-muted);
    text-align: center;
  }
}
</style>
