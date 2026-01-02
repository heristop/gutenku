<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { Filter, Check } from 'lucide-vue-next';
import ZenModal from '@/core/components/ui/ZenModal.vue';
import ZenButton from '@/core/components/ui/ZenButton.vue';

defineProps<{
  modelValue: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
  cancel: [];
}>();

const { t } = useI18n();

function close() {
  emit('update:modelValue', false);
  emit('cancel');
}

function confirm() {
  emit('confirm');
}
</script>

<template>
  <ZenModal
    :model-value="modelValue"
    :max-width="340"
    :persistent="loading"
    :show-close="!loading"
    show-divider
    content-class="reduce-modal"
    title="confirm-reduce"
    description="Confirm using the reduce books lifeline"
    @update:model-value="(val: boolean) => !val && close()"
    @close="close"
  >
    <div class="reduce-modal__content">
      <div class="reduce-modal__icon-wrapper">
        <Filter :size="32" class="reduce-modal__icon" />
      </div>

      <h2 class="reduce-modal__title">
        {{ t('game.confirmReduceBooks') }}
      </h2>

      <p class="reduce-modal__desc">
        {{ t('game.confirmReduceBooksDesc') }}
      </p>

      <div class="reduce-modal__cost">-20 pts</div>
    </div>

    <div class="reduce-modal__actions">
      <ZenButton
        variant="ghost"
        size="sm"
        spring
        :disabled="loading"
        class="reduce-modal__btn-cancel"
        @click="close"
      >
        {{ t('common.cancel') }}
      </ZenButton>
      <ZenButton
        variant="cta"
        spring
        :loading="loading"
        class="reduce-modal__btn-confirm"
        @click="confirm"
      >
        <template #icon-left>
          <Check :size="18" />
        </template>
        {{ t('game.confirmReduce') }}
      </ZenButton>
    </div>
  </ZenModal>
</template>

<style lang="scss" scoped>
:deep(.reduce-modal) {
  text-align: center;
}

.reduce-modal__content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.reduce-modal__icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  background: var(--gutenku-zen-water);
  border-radius: var(--gutenku-radius-full);
  margin-bottom: 1rem;
}

.reduce-modal__icon {
  color: var(--gutenku-zen-primary);
}

.reduce-modal__title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--gutenku-text-primary);
  margin: 0 0 0.5rem;
}

.reduce-modal__desc {
  font-size: 0.9rem;
  color: var(--gutenku-text-secondary);
  margin: 0 0 1rem;
  line-height: 1.5;
}

.reduce-modal__cost {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: oklch(0.4 0.1 25);
  background: oklch(0.95 0.03 55);
  border: 1px solid oklch(0.85 0.05 45);
  border-radius: var(--gutenku-radius-sm);
}

[data-theme='dark'] .reduce-modal__cost {
  color: oklch(0.9 0.08 45);
  background: oklch(0.32 0.04 45);
  border-color: oklch(0.45 0.06 45);
}

.reduce-modal__actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1.25rem;
  width: 100%;
}

.reduce-modal__btn-cancel {
  flex-shrink: 0;
  min-height: 3rem;
}

.reduce-modal__btn-confirm {
  flex: 1;
}
</style>
