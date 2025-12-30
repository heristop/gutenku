<script lang="ts" setup>
import { computed, watch, onBeforeUnmount } from 'vue';
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
  emit('close');
  modelValue.value = false;
}

// Custom scroll lock for mobile compatibility
let scrollY = 0;

function lockScroll() {
  scrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.overflow = 'hidden';
}

function unlockScroll() {
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.overflow = '';
  window.scrollTo(0, scrollY);
}

watch(modelValue, (isOpen) => {
  if (isOpen) {
    lockScroll();
  } else {
    unlockScroll();
  }
});

onBeforeUnmount(() => {
  if (modelValue.value) {
    unlockScroll();
  }
});
</script>

<template>
  <v-dialog
    v-model="modelValue"
    :max-width="maxWidth"
    :persistent="persistent"
    :transition="transition"
    scroll-strategy="none"
  >
    <div
      class="zen-modal gutenku-paper pa-6"
      :class="contentClass"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="title ? titleId : undefined"
      :aria-label="!title ? undefined : undefined"
    >
      <h2 v-if="title" :id="titleId" class="sr-only">{{ title }}</h2>

      <button
        v-if="showClose"
        class="zen-modal__close"
        :aria-label="t('common.close')"
        @click="close"
      >
        <X :size="20" />
      </button>

      <div v-if="!!$slots.header" class="zen-modal__header">
        <slot name="header" />
      </div>

      <div class="zen-modal__content">
        <slot />
      </div>

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

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
