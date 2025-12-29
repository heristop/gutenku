<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { X, Check } from 'lucide-vue-next';
import { useFocusTrap } from '@/composables/focus-trap';
import ZenButton from '@/components/ui/ZenButton.vue';
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

const modalRef = ref<HTMLElement | null>(null);
const { activate: activateFocusTrap, deactivate: deactivateFocusTrap } = useFocusTrap(modalRef);

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

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    activateFocusTrap();
  } else {
    deactivateFocusTrap();
  }
});

function handleImageLoad() {
  imageLoaded.value = true;
  imageError.value = false;
}

function handleImageError() {
  imageError.value = true;
}

function close() {
  emit('update:modelValue', false);
  emit('cancel');
}

function confirm() {
  emit('confirm');
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close();
  } else if (event.key === 'Enter' && !props.loading) {
    confirm();
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue && book"
        class="confirm-modal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="'confirm-title'"
        @keydown="handleKeydown"
      >
        <div
          class="confirm-modal__backdrop"
          aria-hidden="true"
          @click="close"
        />

        <div ref="modalRef" class="confirm-modal__content" tabindex="-1">
          <button
            class="confirm-modal__close"
            :aria-label="t('common.close')"
            @click="close"
          >
            <X :size="20" />
          </button>

          <div class="confirm-modal__book">
            <!-- Book cover -->
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
                <span
                  class="confirm-modal__emoticons"
                  >{{ book.emoticons }}</span
                >
              </div>
            </div>

            <!-- Book info -->
            <div class="confirm-modal__info">
              <h2 id="confirm-title" class="confirm-modal__title">
                {{ book.title }}
              </h2>
              <p class="confirm-modal__author">
                {{ book.author }}
              </p>
            </div>
          </div>

          <p class="confirm-modal__question">
            {{ t('game.confirmGuessQuestion') }}
          </p>

          <div class="confirm-modal__actions">
            <ZenButton
              variant="ghost"
              :disabled="loading"
              class="confirm-modal__btn"
              @click="close"
            >
              {{ t('common.cancel') }}
            </ZenButton>
            <ZenButton
              variant="cta"
              :loading="loading"
              class="confirm-modal__btn"
              @click="confirm"
            >
              <template #icon-left>
                <Check :size="18" />
              </template>
              {{ t('game.confirmGuess') }}
            </ZenButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.confirm-modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.confirm-modal__backdrop {
  position: absolute;
  inset: 0;
  background: oklch(0 0 0 / 0.5);
  backdrop-filter: blur(4px);
}

.confirm-modal__content {
  position: relative;
  width: 100%;
  max-width: 340px;
  background: var(--gutenku-paper-bg);
  border-radius: var(--gutenku-radius-lg);
  box-shadow:
    0 20px 60px oklch(0 0 0 / 0.3),
    0 8px 20px oklch(0 0 0 / 0.2);
  padding: 1.5rem;
  text-align: center;
}

.confirm-modal__close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: var(--gutenku-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--gutenku-zen-mist);
    color: var(--gutenku-text-primary);
  }
}

.confirm-modal__book {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.confirm-modal__cover {
  width: 120px;
  height: 120px;
  border-radius: var(--gutenku-radius-md);
  overflow: hidden;
  box-shadow: var(--gutenku-shadow-zen);
  background: var(--gutenku-zen-water);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

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

.confirm-modal__info {
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

.confirm-modal__question {
  font-size: 0.9rem;
  color: var(--gutenku-text-muted);
  margin: 0 0 1.5rem;
}

.confirm-modal__actions {
  display: flex;
  gap: 0.75rem;
}

.confirm-modal__btn {
  flex: 1;
}

// Modal transitions
.modal-enter-active {
  transition: all 0.25s ease-out;

  .confirm-modal__content {
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.modal-leave-active {
  transition: all 0.2s ease-in;

  .confirm-modal__content {
    transition: all 0.2s ease-in;
  }
}

.modal-enter-from,
.modal-leave-to {
  .confirm-modal__backdrop {
    opacity: 0;
  }

  .confirm-modal__content {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active,
  .confirm-modal__close {
    transition: none;
  }
}
</style>
