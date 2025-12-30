<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { X } from 'lucide-vue-next';

interface Props {
  maxWidth?: string | number;
  persistent?: boolean;
  showClose?: boolean;
  title?: string;
  transition?: string;
  contentClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  maxWidth: 400,
  persistent: false,
  showClose: true,
  transition: 'dialog-bottom-transition',
  contentClass: '',
});

const emit = defineEmits<{
  close: [];
}>();

const modelValue = defineModel<boolean>({ default: false });
const { t } = useI18n();

const titleId = computed(() =>
  props.title ? `zen-modal-${props.title.toLowerCase().replaceAll(/\s+/g, '-')}` : undefined
);

function close() {
  if (!props.persistent) {
    emit('close');
    modelValue.value = false;
  }
}
</script>

<template>
  <v-dialog
    v-model="modelValue"
    :max-width="maxWidth"
    :persistent="persistent"
    :transition="transition"
  >
    <div
      class="zen-modal gutenku-paper pa-6"
      :class="contentClass"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
    >
      <!-- Close button -->
      <button
        v-if="showClose"
        class="zen-modal__close"
        :aria-label="t('common.close')"
        @click="close"
      >
        <X :size="20" />
      </button>

      <!-- Header slot -->
      <div v-if="!!$slots.header" class="zen-modal__header">
        <slot name="header" />
      </div>

      <!-- Default content -->
      <div class="zen-modal__content">
        <slot />
      </div>

      <!-- Actions slot -->
      <div v-if="!!$slots.actions" class="zen-modal__actions">
        <slot name="actions" />
      </div>
    </div>
  </v-dialog>
</template>

<style lang="scss" scoped>
.zen-modal {
  position: relative;
  border-radius: var(--gutenku-radius-md);
  overflow: hidden;
}

.zen-modal__close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  border-radius: var(--gutenku-radius-full);
  color: var(--gutenku-text-secondary);
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background: var(--gutenku-zen-water);
    color: var(--gutenku-text-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-accent);
    outline-offset: 2px;
  }
}

.zen-modal__header {
  margin-bottom: 1rem;
}

.zen-modal__actions {
  margin-top: 1.5rem;
}
</style>
