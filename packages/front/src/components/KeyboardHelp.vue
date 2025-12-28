<script setup lang="ts">
import { Keyboard } from 'lucide-vue-next';

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

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

function close() {
  emit('update:modelValue', false);
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="380"
    @update:model-value="emit('update:modelValue', $event)"
    @keydown.escape="close"
  >
    <v-card class="keyboard-help gutenku-card pa-4">
      <v-card-title class="keyboard-help__title d-flex align-center ga-2 pb-3">
        <Keyboard :size="24" class="text-primary" />
        <span>Keyboard Shortcuts</span>
      </v-card-title>

      <v-card-text class="keyboard-help__content pa-0">
        <div
          v-for="shortcut in shortcuts"
          :key="shortcut.key"
          class="keyboard-help__row d-flex align-center justify-space-between py-2"
        >
          <span
            class="keyboard-help__label text-body-2"
            >{{ shortcut.label }}</span
          >
          <kbd class="keyboard-help__key">{{ shortcut.key }}</kbd>
        </div>
      </v-card-text>

      <v-card-actions class="pt-4 px-0">
        <v-btn variant="outlined" color="primary" block @click="close">
          Got it
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
.keyboard-help {
  &__title {
    font-family: 'JMH Typewriter', monospace !important;
    letter-spacing: 0.5px;
    border-bottom: 1px solid var(--gutenku-zen-border);
  }

  &__row {
    border-bottom: 1px solid color-mix(in oklch, var(--gutenku-zen-border) 50%, transparent);

    &:last-child {
      border-bottom: none;
    }
  }

  &__label {
    color: var(--gutenku-zen-text-secondary);
  }

  &__key {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2rem;
    padding: 0.25rem 0.5rem;
    font-family: 'JMH Typewriter', monospace;
    font-size: 0.85rem;
    background: var(--gutenku-zen-surface);
    border: 1px solid var(--gutenku-zen-border);
    border-radius: var(--gutenku-radius-sm);
    box-shadow: 0 2px 0 var(--gutenku-zen-border);
  }
}

[data-theme='dark'] {
  .keyboard-help__key {
    background: oklch(0.25 0.01 60);
    border-color: oklch(0.35 0.02 60);
    box-shadow: 0 2px 0 oklch(0.2 0.01 60);
  }
}
</style>
