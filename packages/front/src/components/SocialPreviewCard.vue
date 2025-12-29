<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue';
import { storeToRefs } from 'pinia';
import { Share2, Copy, Check } from 'lucide-vue-next';
import { generateSocialCaption, type HaikuValue } from '@gutenku/shared';
import { useHaikuStore } from '@/store/haiku';
import { useInView } from '@/composables/in-view';
import { useClipboard } from '@/composables/clipboard';
import ZenCard from '@/components/ui/ZenCard.vue';
import ZenButton from '@/components/ui/ZenButton.vue';
import ZenAccordion from '@/components/ui/ZenAccordion.vue';

const cardRef = useTemplateRef<HTMLElement>('cardRef');
const { isInView } = useInView(cardRef, { delay: 300 });

const store = useHaikuStore();
const { haiku, loading } = storeToRefs(store);

const expanded = ref(true);
const { copy, copied } = useClipboard();

// Check if haiku has valid social data (title, emoticons, and translations from OpenAI)
const hasValidData = computed(() => {
  const h = haiku.value;
  return h?.title && h?.book?.emoticons && (h?.translations?.fr || h?.translations?.jp);
});

const caption = computed(() => {
  if (!haiku.value || !hasValidData.value) {return '';}
  return generateSocialCaption(haiku.value as HaikuValue);
});

defineExpose({ hasValidData });

function copyCaption() {
  copy(caption.value);
}
</script>

<template>
  <ZenCard
    v-if="hasValidData"
    ref="cardRef"
    variant="panel"
    :loading="loading"
    aria-label="Social Preview"
    class="social-panel social-panel--card pa-5 mb-6 animate-in"
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
        <div class="social-panel__preview">
          <div class="social-panel__caption">
            <pre class="social-panel__caption-text">{{ caption }}</pre>
          </div>
          <ZenButton class="social-panel__copy-btn mt-3" @click="copyCaption">
            <template #icon-left>
              <component :is="copied ? Check : Copy" :size="18" />
            </template>
            {{ copied ? 'Copied!' : 'Copy Caption' }}
          </ZenButton>
        </div>
      </div>
    </ZenAccordion>
  </ZenCard>
</template>

<style scoped lang="scss">
.social-panel {
  position: relative;

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
  }
}
</style>
