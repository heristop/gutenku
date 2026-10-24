<script lang="ts" setup>
import { computed, watch, useId, type Component } from 'vue';
import { useI18n } from 'vue-i18n';
import { INK_PATHS, INK_STROKE_WIDTH } from '@/core/components/icons/ink';
import { useExpandedState } from '@/core/composables/local-storage';
import ZenTooltip from '@/core/components/ui/ZenTooltip.vue';

const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    icon?: Component;
    title: string;
    subtitle?: string;
    storageKey?: string;
    defaultExpanded?: boolean;
    ariaLabel?: string;
  }>(),
  {
    subtitle: '',
    defaultExpanded: true,
  },
);

const modelValue = defineModel<boolean>();

// Generate unique IDs for accessibility
const baseId = useId();
const headerId = `zen-accordion-header-${baseId}`;
const contentId = `zen-accordion-content-${baseId}`;

// Use storage-backed state if storageKey provided, otherwise use modelValue
const storageState = props.storageKey
  ? useExpandedState(props.storageKey, props.defaultExpanded)
  : null;

const isExpanded = computed({
  get: () =>
    modelValue.value ?? storageState?.value.value ?? props.defaultExpanded,
  set: (val: boolean) => {
    if (modelValue.value !== undefined) {
      modelValue.value = val;
    }

    if (storageState) {
      storageState.value.value = val;
    }
  },
});

const toggleTooltip = computed(() =>
  isExpanded.value ? t('common.collapse') : t('common.expand'),
);

function toggle() {
  isExpanded.value = !isExpanded.value;
}

// Handle keyboard navigation (WCAG 2.1.1)
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    toggle();
  }
}

// The +/- toggle is the ink Plus glyph split into its two strokes, so the
// vertical one can lift away when the section opens.
const [plusVertical, plusHorizontal] = INK_PATHS.Plus;

// Emit expanded state changes
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  toggle: [expanded: boolean];
}>();

watch(isExpanded, (val) => {
  emit('update:modelValue', val);
  emit('toggle', val);
});
</script>

<template>
  <div class="zen-accordion">
    <div class="zen-accordion__header-row">
      <button
        :id="headerId"
        type="button"
        class="zen-accordion__header"
        :class="{ 'zen-accordion__header--expanded': isExpanded }"
        :aria-expanded="isExpanded"
        :aria-controls="contentId"
        :aria-label="ariaLabel || title"
        @click="toggle"
        @keydown="handleKeydown"
      >
        <span
          v-if="icon || $slots.icon"
          class="zen-accordion__icon"
          aria-hidden="true"
        >
          <slot name="icon">
            <component :is="icon" :size="28" />
          </slot>
        </span>

        <span class="zen-accordion__header-content">
          <span class="zen-accordion__title">{{ title }}</span>
          <span
            v-if="subtitle || $slots.subtitle"
            class="zen-accordion__subtitle"
          >
            <slot name="subtitle">{{ subtitle }}</slot>
          </span>
        </span>

        <ZenTooltip :text="toggleTooltip" position="top">
          <span class="zen-accordion__toggle" aria-hidden="true">
            <svg
              class="zen-accordion__toggle-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              :stroke-width="INK_STROKE_WIDTH"
              stroke-linecap="round"
            >
              <path
                class="zen-accordion__stroke zen-accordion__stroke--horizontal"
                :d="plusHorizontal"
              />
              <path
                class="zen-accordion__stroke zen-accordion__stroke--vertical"
                :class="{ 'zen-accordion__stroke--hidden': isExpanded }"
                :d="plusVertical"
              />
            </svg>
          </span>
        </ZenTooltip>
      </button>
    </div>

    <div v-if="$slots.actions" class="zen-accordion__actions">
      <slot name="actions" />
    </div>

    <div
      :id="contentId"
      class="zen-accordion__content"
      :class="{ 'zen-accordion__content--expanded': isExpanded }"
      role="region"
      :aria-labelledby="headerId"
      :hidden="!isExpanded"
    >
      <div class="zen-accordion__content-inner">
        <slot />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// Ex Libris: a ruled section heading that folds open. The +/- is the ink
// Plus glyph; its vertical stroke lifts away when the section opens.
.zen-accordion {
  width: 100%;
}

.zen-accordion__header-row {
  width: 100%;
}

.zen-accordion__header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  min-height: 2.75rem;
  padding: 0.5rem;
  background: transparent;
  border: none;
  border-radius: var(--gk-radius-control);
  cursor: pointer;
  text-align: left;
  font: inherit;
  font-family: var(--gk-font);
  color: var(--gk-ink);
  transition:
    background-color var(--gk-dur-fast) var(--gk-ease-out),
    transform var(--gk-dur-press) var(--gk-ease-out);

  &:focus-visible {
    outline: 2px solid var(--gk-indigo);
    outline-offset: 2px;
  }

  &:active {
    transform: scale(0.995);
  }
}

@media (hover: hover) {
  .zen-accordion__header:hover {
    background: color-mix(in oklch, var(--gk-ink-faint) 40%, transparent);
  }
}

.zen-accordion__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--gk-ink);
}

.zen-accordion__header-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-width: 0;
}

.zen-accordion__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gk-ink);
}

.zen-accordion__subtitle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.125rem;
  font-size: 0.875rem;
  color: var(--gk-ink-soft);
}

.zen-accordion__actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.zen-accordion__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  color: var(--gk-indigo);
}

.zen-accordion__toggle-svg {
  width: 100%;
  height: 100%;
}

.zen-accordion__stroke {
  transition:
    opacity var(--gk-dur-base) var(--gk-ease-out),
    transform var(--gk-dur-base) var(--gk-ease-out);

  &--vertical {
    transform-box: fill-box;
    transform-origin: center;
  }

  &--hidden {
    opacity: 0;
    transform: scaleY(0);
  }
}

.zen-accordion__content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--gk-dur-base) var(--gk-ease-out);

  &--expanded {
    grid-template-rows: 1fr;
  }

  // Keep the grid so the fold can animate; content stays hidden to AT
  &[hidden] {
    display: grid;
  }
}

.zen-accordion__content-inner {
  overflow: hidden;
  opacity: 0;
  transition: opacity var(--gk-dur-base) var(--gk-ease-out);

  .zen-accordion__content--expanded & {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .zen-accordion__header,
  .zen-accordion__stroke,
  .zen-accordion__content,
  .zen-accordion__content-inner {
    transition: none;
  }

  .zen-accordion__header:active {
    transform: none;
  }
}

@media (forced-colors: active) {
  .zen-accordion__header {
    border: 1px solid ButtonText;

    &:focus-visible {
      outline: 3px solid Highlight;
      outline-offset: 2px;
    }
  }

  .zen-accordion__stroke {
    stroke: ButtonText;
  }
}

@media (max-width: 600px) {
  .zen-accordion__subtitle {
    font-size: 0.875rem;
  }
}
</style>
