<script setup lang="ts">
import { Keyboard } from 'lucide-vue-next';
import ZenModal from '@/components/ui/ZenModal.vue';
import ZenButton from '@/components/ui/ZenButton.vue';

const modelValue = defineModel<boolean>({ default: false });

const shortcuts = [
  { key: 'Space', label: 'Generate new haiku' },
  { key: 'C', label: 'Copy haiku to clipboard' },
  { key: 'S', label: 'Share haiku' },
  { key: 'D', label: 'Download as image' },
  { key: '\u2190', label: 'Previous haiku' },
  { key: '\u2192', label: 'Next haiku' },
  { key: '?', label: 'Show this help' },
  { key: 'Esc', label: 'Close dialogs' },
];
</script>

<template>
  <ZenModal
    v-model="modelValue"
    :max-width="380"
    title="Keyboard Shortcuts"
    description="Available keyboard shortcuts for navigating and using GutenKu"
    show-divider
    content-class="keyboard-help"
  >
    <div class="keyboard-help__title">
      <Keyboard :size="24" class="text-primary" />
      <span>Keyboard Shortcuts</span>
    </div>

    <div class="keyboard-help__content">
      <div
        v-for="shortcut in shortcuts"
        :key="shortcut.key"
        class="keyboard-help__row"
      >
        <span class="keyboard-help__label">{{ shortcut.label }}</span>
        <kbd class="keyboard-help__key">{{ shortcut.key }}</kbd>
      </div>
    </div>

    <template #actions>
      <ZenButton class="keyboard-help__action" @click="modelValue = false"
        >Got it</ZenButton
      >
    </template>
  </ZenModal>
</template>

<style scoped lang="scss">
.keyboard-help {
  &__title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'JMH Typewriter', monospace !important;
    letter-spacing: 0.5px;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--gutenku-paper-border);
  }

  &__content {
    padding: 0.5rem 0;
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid color-mix(in oklch, var(--gutenku-paper-border) 50%, transparent);

    &:last-child {
      border-bottom: none;
    }
  }

  &__label {
    font-size: 0.875rem;
    color: var(--gutenku-text-secondary);
  }

  &__key {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2rem;
    padding: 0.25rem 0.5rem;
    font-family: 'JMH Typewriter', monospace;
    font-size: 0.85rem;
    background: var(--gutenku-paper-bg-aged);
    border: 1px solid var(--gutenku-paper-border);
    border-radius: var(--gutenku-radius-sm);
    box-shadow: 0 2px 0 var(--gutenku-paper-border);
  }
}

[data-theme='dark'] {
  .keyboard-help__key {
    background: oklch(0.25 0.01 60);
    border-color: oklch(0.35 0.02 60);
    box-shadow: 0 2px 0 oklch(0.2 0.01 60);
  }
}

.keyboard-help__action {
  width: 100%;
}
</style>
