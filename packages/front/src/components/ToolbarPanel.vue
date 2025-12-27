<script lang="ts" setup>
import { computed, ref, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { Loader2, Sparkles, Check, Copy } from 'lucide-vue-next';
import { useHaikuStore } from '@/store/haiku';
import { useClipboard } from '@/composables/clipboard';
import { useInView } from '@/composables/in-view';
import { useToast } from '@/composables/toast';
import ZenTooltip from '@/components/ui/ZenTooltip.vue';

const { t } = useI18n();
const { success, error } = useToast();

const cardRef = useTemplateRef<HTMLElement>('cardRef');
const { isInView } = useInView(cardRef, { delay: 0 });

const haikuStore = useHaikuStore();
const { fetchNewHaiku } = haikuStore;
const { haiku, loading, firstLoaded } = storeToRefs(haikuStore);

const { copy, copied } = useClipboard();

const buttonLabel = computed<string>(() => {
  if (loading.value) {
    return firstLoaded.value ? t('toolbar.generating') : t('toolbar.extracting');
  }
  return firstLoaded.value ? t('toolbar.generate') : t('toolbar.extract');
});

// Tooltip texts
const generateTooltip = computed(() => t('toolbar.generateTooltip', { action: buttonLabel.value }));
const copyTooltip = computed(() => t('toolbar.copyTooltip'));

// Show pulse when ready for next haiku
const showPulse = computed(() => firstLoaded.value && !loading.value && haiku.value?.verses?.length);

// Haiku generation
async function extractGenerate(): Promise<void> {
  await fetchNewHaiku();
}

// Copy haiku to clipboard
async function copyHaiku(): Promise<void> {
  if (!haiku.value?.verses) {return;}
  const copySuccess = await copy(haiku.value.verses.join('\n'));
  if (copySuccess) {
    success(t('toolbar.copySuccess'));
  } else {
    error(t('toolbar.copyError'));
  }
}
</script>

<template>
  <div
    ref="cardRef"
    class="gutenku-card toolbar-panel toolbar-panel--card toolbar-container mt-2 mt-sm-0 mb-6 animate-in"
    :class="{ 'is-visible': isInView }"
  >
    <!-- Action Buttons -->
    <div class="toolbar-panel__buttons">
      <!-- Extract/Generate Button -->
      <ZenTooltip :text="generateTooltip" position="top">
        <v-btn
          :loading="loading"
          :disabled="loading"
          :aria-busy="loading"
          :aria-label="generateTooltip"
          class="zen-btn gutenku-btn gutenku-btn-generate toolbar-panel__button toolbar-panel__button--generate"
          :class="{
            'toolbar-panel__button--loading': loading,
            'toolbar-panel__button--pulse': showPulse,
          }"
          data-cy="fetch-btn"
          variant="outlined"
          size="default"
          @click="extractGenerate"
        >
          <Loader2
            v-if="loading"
            :size="20"
            class="toolbar-panel__icon animate-spin"
          />
          <Sparkles v-else :size="20" class="toolbar-panel__icon" />
          <span class="toolbar-panel__button-text">{{ buttonLabel }}</span>
        </v-btn>
      </ZenTooltip>

      <!-- Copy Button -->
      <ZenTooltip :text="copyTooltip" position="top">
        <v-btn
          class="zen-btn gutenku-btn gutenku-btn-copy toolbar-panel__button toolbar-panel__button--copy"
          :class="{
            'toolbar-panel__button--success': copied,
            'toolbar-panel__button--ripple': copied,
            success: copied,
          }"
          data-cy="copy-btn"
          variant="outlined"
          size="small"
          :disabled="!haiku?.verses?.length"
          :aria-label="copied ? t('toolbar.copiedLabel') : copyTooltip"
          @click="copyHaiku"
        >
          <Check v-if="copied" :size="18" class="toolbar-panel__icon" />
          <Copy v-else :size="18" class="toolbar-panel__icon" />
          <span class="toolbar-panel__button-text">{{
            copied ? t('toolbar.copied') : t('toolbar.copy')
          }}</span>
        </v-btn>
      </ZenTooltip>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.toolbar-panel {
  &__buttons {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
  }

  &__button {
    border-width: 1.5px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    // Generate button pulse animation when ready
    &--pulse {
      animation: generate-pulse 2.5s ease-in-out infinite;
    }

    &--success {
      [data-theme='dark'] & {
        background: oklch(0.65 0.18 145 / 0.2) !important;
        border-color: oklch(0.65 0.18 145 / 0.6);
        color: oklch(1 0 0) !important;

        .toolbar-panel__icon,
        .toolbar-panel__button-text {
          color: oklch(1 0 0) !important;
        }
      }
    }

    // Copy success ripple effect
    &--ripple {
      position: relative;
      overflow: hidden;

      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        background: radial-gradient(
          circle,
          oklch(0.65 0.18 145 / 0.4) 0%,
          transparent 70%
        );
        border-radius: 50%;
        transform: translate(-50%, -50%);
        animation: copy-ripple 0.6s ease-out forwards;
      }
    }

    [data-theme='dark'] & {
      background: oklch(1 0 0 / 0.12) !important;
      color: oklch(1 0 0 / 0.95) !important;
      border-color: oklch(1 0 0 / 0.25);
      box-shadow:
        0 2px 8px oklch(0 0 0 / 0.3),
        0 1px 3px oklch(0 0 0 / 0.2),
        inset 0 1px 0 oklch(1 0 0 / 0.15);
    }

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px oklch(0 0 0 / 0.15);

      [data-theme='dark'] & {
        background: oklch(1 0 0 / 0.18) !important;
        border-color: oklch(1 0 0 / 0.4);
        box-shadow:
          0 4px 16px oklch(0 0 0 / 0.4),
          0 2px 6px oklch(0 0 0 / 0.3),
          inset 0 1px 0 oklch(1 0 0 / 0.2);

        .toolbar-panel__icon {
          color: oklch(1 0 0) !important;
          filter: drop-shadow(0 2px 3px oklch(0 0 0 / 0.5));
        }

        .toolbar-panel__button-text {
          color: oklch(1 0 0) !important;
          text-shadow: 0 1px 3px oklch(0 0 0 / 0.5);
        }
      }
    }
  }

  &__icon {
    margin-right: 0.5rem;

    [data-theme='dark'] .toolbar-panel__button & {
      color: oklch(1 0 0 / 0.95) !important;
      filter: drop-shadow(0 1px 2px oklch(0 0 0 / 0.4));
    }
  }

  &__button-text {
    [data-theme='dark'] .toolbar-panel__button & {
      color: oklch(1 0 0 / 0.95) !important;
      text-shadow: 0 1px 2px oklch(0 0 0 / 0.4);
    }
  }
}

// Generate button pulse animation
@keyframes generate-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 oklch(0.55 0.15 145 / 0.4);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 0 6px oklch(0.55 0.15 145 / 0);
  }
}

// Copy success ripple animation
@keyframes copy-ripple {
  0% {
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    width: 300%;
    height: 300%;
    opacity: 0;
  }
}

// Responsive touch targets (44px minimum)
@media (max-width: 768px) {
  .toolbar-panel {
    &__button {
      min-height: 2.75rem;  // 44px
      padding: 0 1rem;
    }
  }
}
</style>
