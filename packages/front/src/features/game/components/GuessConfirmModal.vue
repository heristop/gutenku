<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Check } from 'lucide-vue-next';
import ZenModal from '@/core/components/ui/ZenModal.vue';
import ZenButton from '@/core/components/ui/ZenButton.vue';
import type { BookValue } from '@gutenku/shared';

const props = defineProps<{
  modelValue: boolean;
  book: BookValue | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
  cancel: [];
}>();

const { t } = useI18n();

const imageLoaded = ref(false);
const imageError = ref(false);

const coverUrl = computed(() => {
  if (!props.book) {return '';}
  return `/covers/${props.book.reference}.webp`;
});

watch(() => props.book, () => {
  imageLoaded.value = false;
  imageError.value = false;
});

function handleImageLoad() {
  imageLoaded.value = true;
  imageError.value = false;
}

function handleImageError() {
  imageError.value = true;
}

function close() {
  if (props.loading) {return;}
  emit('update:modelValue', false);
  emit('cancel');
}

function confirm() {
  emit('confirm');
}
</script>

<template>
  <ZenModal
    :model-value="modelValue && !!book"
    :max-width="360"
    :persistent="loading"
    :show-close="!loading"
    variant="book"
    show-divider
    content-class="confirm-modal"
    title="confirm-guess"
    description="Confirm your book guess selection"
    @update:model-value="(val: boolean) => !val && close()"
    @close="close"
  >
    <template v-if="book">
      <div class="confirm-modal__content">
        <!-- Decorative frame around cover -->
        <div class="confirm-modal__book-frame">
          <div class="confirm-modal__cover">
            <img
              v-show="imageLoaded && !imageError"
              :src="coverUrl"
              :alt="book.title"
              @load="handleImageLoad"
              @error="handleImageError"
            />
            <div
              v-if="!imageLoaded || imageError"
              class="confirm-modal__fallback"
            >
              <span class="confirm-modal__emoticons">{{ book.emoticons }}</span>
            </div>
            <!-- Sepia tint overlay -->
            <div class="confirm-modal__cover-tint" aria-hidden="true" />
          </div>
        </div>

        <!-- Book info card -->
        <div class="confirm-modal__info-card">
          <h2 id="confirm-title" class="confirm-modal__title">
            {{ book.title }}
          </h2>
          <p class="confirm-modal__author">
            {{ book.author }}
          </p>
        </div>

        <!-- Question -->
        <p class="confirm-modal__question">
          {{ t('game.confirmGuessQuestion') }}
        </p>
      </div>

      <!-- Actions -->
      <div class="confirm-modal__actions">
        <ZenButton
          variant="ghost"
          size="sm"
          spring
          :disabled="loading"
          class="confirm-modal__btn-cancel"
          @click="close"
        >
          {{ t('common.cancel') }}
        </ZenButton>
        <ZenButton
          variant="cta"
          spring
          :loading="loading"
          class="confirm-modal__btn-confirm"
          @click="confirm"
        >
          <template #icon-left>
            <Check :size="18" />
          </template>
          {{ t('game.confirmGuess') }}
        </ZenButton>
      </div>
    </template>
  </ZenModal>
</template>

<style lang="scss" scoped>
:deep(.confirm-modal) {
  text-align: center;
}

// Content wrapper for horizontal centering
.confirm-modal__content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

// Decorative frame around cover
.confirm-modal__book-frame {
  display: inline-block;
  padding: 0.75rem;
  background: var(--gutenku-zen-water);
  border-radius: var(--gutenku-radius-lg);
  box-shadow:
    var(--gutenku-shadow-light),
    inset 0 1px 0 oklch(1 0 0 / 0.1);
  animation: cover-reveal 0.3s ease-out;
}

// Book cover container with material design shadow
.confirm-modal__cover {
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: var(--gutenku-radius-md);
  overflow: hidden;
  box-shadow:
    0 2px 4px -1px oklch(0 0 0 / 0.2),
    0 4px 5px 0 oklch(0 0 0 / 0.14),
    0 1px 10px 0 oklch(0 0 0 / 0.12);
  background: var(--gutenku-zen-water);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

// Sepia tint overlay (matches BookCard)
.confirm-modal__cover-tint {
  position: absolute;
  inset: 0;
  background: oklch(0.6 0.06 55 / 0.18);
  mix-blend-mode: multiply;
  pointer-events: none;
}

[data-theme='dark'] .confirm-modal__cover-tint {
  background: oklch(0.45 0.05 50 / 0.18);
}

// Fallback when image fails
.confirm-modal__fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    var(--gutenku-zen-mist) 0%,
    var(--gutenku-zen-water) 100%
  );
}

.confirm-modal__emoticons {
  font-size: 2.5rem;
}

// Info card with background
.confirm-modal__info-card {
  padding: 1rem 1.25rem;
  background: var(--gutenku-zen-water);
  border-radius: var(--gutenku-radius-md);
  margin-top: 1.25rem;
  text-align: center;
}

.confirm-modal__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gutenku-text-primary);
  margin: 0 0 0.25rem;
  line-height: 1.3;
}

.confirm-modal__author {
  font-size: 0.9rem;
  color: var(--gutenku-text-muted);
  margin: 0;
}

// Question styled as zen thought
.confirm-modal__question {
  position: relative;
  font-size: 0.9rem;
  font-style: italic;
  color: var(--gutenku-text-secondary);
  padding: 1.5rem 0 0;
  margin: 1.5rem 0 0;

  // Brush stroke separator
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--gutenku-zen-primary) 10%,
      var(--gutenku-zen-primary) 50%,
      var(--gutenku-zen-primary) 90%,
      transparent 100%
    );
    opacity: 0.4;
    border-radius: 1px;
    mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 100 2' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 1 Q10 0.3, 20 1 T40 1 T60 1 T80 1 T100 1' stroke='black' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    mask-size: 100% 100%;
  }
}

[data-theme='dark'] .confirm-modal__question::before {
  opacity: 0.5;
}

// Action buttons
.confirm-modal__actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1.25rem;
  width: 100%;
}

.confirm-modal__btn-cancel {
  flex-shrink: 0;
  min-height: 3rem;
}

.confirm-modal__btn-confirm {
  flex: 1;
}

// Cover reveal animation
@keyframes cover-reveal {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .confirm-modal__book-frame {
    animation: none;
  }
}
</style>
