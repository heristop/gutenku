<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { Share2, Copy, Check, Sparkles } from '@/core/components/icons/ink';
import { generateSocialCaption, type HaikuValue } from '@gutenku/shared';
import { useHaikuStore } from '@/features/haiku/store/haiku';
import { useClipboard } from '@/core/composables/clipboard';
import ZenCard from '@/core/components/ui/ZenCard.vue';
import ZenAccordion from '@/core/components/ui/ZenAccordion.vue';

const store = useHaikuStore();
const { haiku, loading } = storeToRefs(store);

const expanded = ref(true);
const { copy, copied } = useClipboard();
const copyFailed = ref(false);

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

// Code points, not UTF-16 units: an emoji counts once, as the networks count it
const characterCount = computed(() => [...caption.value].length);

const announcement = computed(() => {
  if (copied.value) {
    return 'Caption copied to clipboard';
  }

  return copyFailed.value ? 'Could not copy the caption' : '';
});

defineExpose({ hasValidData });

async function copyCaption() {
  copyFailed.value = !(await copy(caption.value));
}
</script>

<template>
  <ZenCard
    variant="panel"
    :loading="loading"
    aria-label="Social Preview"
    class="social-panel social-panel--card"
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
        <figure
          v-if="hasValidData"
          class="social-panel__slip"
          :class="{ 'social-panel__slip--copied': copied }"
        >
          <pre
            class="social-panel__caption"
            tabindex="0"
            role="region"
            aria-label="Caption as posted"
            >{{ caption }}</pre
          >

          <figcaption class="social-panel__footer">
            <span class="social-panel__count">
              {{ characterCount.toLocaleString('en') }} characters
            </span>

            <button
              type="button"
              class="social-panel__copy"
              :class="{ 'social-panel__copy--done': copied }"
              @click="copyCaption"
            >
              <Transition name="social-swap" mode="out-in">
                <component
                  :is="copied ? Check : Copy"
                  :key="copied ? 'check' : 'copy'"
                  :size="16"
                  class="social-panel__copy-icon"
                  aria-hidden="true"
                />
              </Transition>
              <span>{{ copied ? 'Copied' : 'Copy caption' }}</span>
            </button>
          </figcaption>
        </figure>

        <div v-else class="social-panel__placeholder">
          <Sparkles
            :size="20"
            class="social-panel__placeholder-icon"
            aria-hidden="true"
          />
          <p class="social-panel__placeholder-text">
            Craft a haiku with AI text to proof its caption
          </p>
        </div>

        <span class="sr-only" role="status" aria-live="polite">
          {{ announcement }}
        </span>
      </div>
    </ZenAccordion>
  </ZenCard>
</template>

<style scoped lang="scss">
// A galley proof of the post: the caption set as it will be posted, ruled off
// from the card, with a quiet copy action at its foot.
.social-panel {
  position: relative;
  padding: 1.25rem;

  &__content {
    padding-top: 0.75rem;
  }

  &__slip {
    margin: 0;
    border-top: var(--gk-rule-faint);
    border-bottom: var(--gk-rule-faint);
    transition: background-color var(--gk-dur-reward) var(--gk-ease-out);

    // A brief wash confirms what was lifted, then the slip settles back
    &--copied {
      background: var(--gutenku-zen-mist);
      transition-duration: var(--gk-dur-fast);
    }
  }

  &__caption {
    max-height: 22rem;
    margin: 0;
    padding: 1rem 0.25rem;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: var(--gk-ink-faint) transparent;
    font-family: var(--gk-font);
    font-size: 0.9375rem;
    line-height: 1.7;
    color: var(--gk-ink);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    background: transparent;
    border-radius: var(--gk-radius-control);

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 2px;
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.25rem 0 0.25rem 0.25rem;
    border-top: var(--gk-rule-faint);
  }

  &__count {
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
    color: var(--gk-ink-soft);
  }

  &__copy {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 2.75rem;
    padding: 0 0.5rem;
    margin-right: -0.5rem;
    background: transparent;
    border: none;
    border-radius: var(--gk-radius-control);
    font: inherit;
    font-family: var(--gk-font);
    font-size: 0.875rem;
    color: var(--gk-indigo);
    cursor: pointer;
    text-decoration: underline;
    text-decoration-color: transparent;
    text-underline-offset: 0.25em;
    transition:
      text-decoration-color var(--gk-dur-fast) var(--gk-ease-out),
      transform var(--gk-dur-press) var(--gk-ease-out);

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 2px;
    }

    &:active {
      transform: scale(0.97);
    }

    &--done {
      color: var(--gk-ink-soft);
    }
  }

  &__copy-icon {
    flex-shrink: 0;
  }

  &__placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1.25rem 0.5rem;
    border-top: var(--gk-rule-faint);
    border-bottom: var(--gk-rule-faint);
  }

  &__placeholder-icon {
    flex-shrink: 0;
    color: var(--gk-ink-soft);
  }

  &__placeholder-text {
    margin: 0;
    font-size: 0.875rem;
    color: var(--gk-ink-soft);
    text-align: center;
  }
}

@media (hover: hover) {
  .social-panel__copy:hover {
    text-decoration-color: currentColor;
  }
}

.social-swap-enter-active,
.social-swap-leave-active {
  transition:
    opacity var(--gk-dur-fast) var(--gk-ease-out),
    transform var(--gk-dur-fast) var(--gk-ease-out);
}

.social-swap-leave-active {
  transition-duration: var(--gk-dur-exit);
}

.social-swap-enter-from,
.social-swap-leave-to {
  opacity: 0;
  transform: scale(0.6);
}

@media (max-width: 600px) {
  .social-panel {
    padding: 1rem;

    &__caption {
      max-height: 18rem;
      font-size: 0.875rem;
      line-height: 1.65;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .social-panel__slip,
  .social-panel__copy,
  .social-swap-enter-active,
  .social-swap-leave-active {
    transition: none;
  }

  .social-swap-enter-from,
  .social-swap-leave-to {
    transform: none;
  }

  .social-panel__copy:active {
    transform: none;
  }
}

@media (forced-colors: active) {
  .social-panel__copy {
    color: LinkText;
    text-decoration-color: currentColor;
  }
}
</style>
