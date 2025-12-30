<script lang="ts" setup>
import { ref, computed, watch, onMounted, onUnmounted, useSlots, nextTick } from 'vue';
import { ChevronDown, Check, Sparkles } from 'lucide-vue-next';

interface OptionGroup {
  group: string;
  options: string[];
}

type OptionsInput = string[] | OptionGroup[];

const props = withDefaults(
  defineProps<{
    modelValue: string;
    options: OptionsInput;
    label?: string;
    loading?: boolean;
    disabled?: boolean;
    aiThemes?: string[];
  }>(),
  {
    loading: false,
    disabled: false,
    aiThemes: () => [],
  },
);

const isGrouped = computed(() => {
  return props.options.length > 0 && typeof props.options[0] === 'object';
});

const flatOptions = computed(() => {
  if (isGrouped.value) {
    return (props.options as OptionGroup[]).flatMap((g) => g.options);
  }
  return props.options as string[];
});

const groupedOptions = computed(() => {
  if (isGrouped.value) {
    return props.options as OptionGroup[];
  }
  return [{ group: '', options: props.options as string[] }];
});

const isAITheme = (theme: string) => props.aiThemes.includes(theme);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const slots = useSlots();
const hasIcon = computed(() => !!slots.icon);

const isOpen = ref(false);
const highlightedIndex = ref(-1);
const triggerRef = ref<HTMLButtonElement | null>(null);
const dropdownRef = ref<HTMLUListElement | null>(null);
const optionRefs = ref<HTMLLIElement[]>([]);

// Dropdown position for teleport
const dropdownStyle = ref<Record<string, string>>({});

const dropdownId = `zen-select-dropdown-${Math.random().toString(36).slice(2, 9)}`;

const selectedIndex = computed(() =>
  flatOptions.value.findIndex((opt) => opt === props.modelValue),
);

const updateDropdownPosition = () => {
  if (!triggerRef.value) {return;}

  const rect = triggerRef.value.getBoundingClientRect();
  dropdownStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: '9999',
  };
};

const toggle = () => {
  if (props.disabled || props.loading) {return;}
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    highlightedIndex.value = selectedIndex.value >= 0 ? selectedIndex.value : 0;
    nextTick(updateDropdownPosition);
  }
};

const close = () => {
  isOpen.value = false;
  highlightedIndex.value = -1;
};

const select = (option: string) => {
  emit('update:modelValue', option);
  close();
  triggerRef.value?.focus();
};

const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled || props.loading) {return;}

  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      if (isOpen.value && highlightedIndex.value >= 0) {
        select(flatOptions.value[highlightedIndex.value]);
      } else {
        toggle();
      }
      break;

    case 'ArrowDown':
      event.preventDefault();
      if (!isOpen.value) {
        isOpen.value = true;
        highlightedIndex.value = selectedIndex.value >= 0 ? selectedIndex.value : 0;
        nextTick(updateDropdownPosition);
      } else {
        highlightedIndex.value = Math.min(
          highlightedIndex.value + 1,
          flatOptions.value.length - 1,
        );
      }
      break;

    case 'ArrowUp':
      event.preventDefault();
      if (isOpen.value) {
        highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0);
      }
      break;

    case 'Escape':
      event.preventDefault();
      close();
      triggerRef.value?.focus();
      break;

    case 'Tab':
      close();
      break;

    case 'Home':
      if (isOpen.value) {
        event.preventDefault();
        highlightedIndex.value = 0;
      }
      break;

    case 'End':
      if (isOpen.value) {
        event.preventDefault();
        highlightedIndex.value = flatOptions.value.length - 1;
      }
      break;
  }
};

// Scroll highlighted option into view
watch(highlightedIndex, (index) => {
  if (index >= 0 && optionRefs.value[index]) {
    optionRefs.value[index].scrollIntoView({ block: 'nearest' });
  }
});

// Click outside handler
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  if (
    triggerRef.value &&
    !triggerRef.value.contains(target) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(target)
  ) {
    close();
  }
};

// Update position on scroll/resize
const handleScrollResize = () => {
  if (isOpen.value) {
    updateDropdownPosition();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('scroll', handleScrollResize, true);
  window.addEventListener('resize', handleScrollResize);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('scroll', handleScrollResize, true);
  window.removeEventListener('resize', handleScrollResize);
});

const setOptionRef = (el: HTMLLIElement | null, index: number) => {
  if (el) {
    optionRefs.value[index] = el;
  }
};

const getFlatIndex = (groupIndex: number, optionIndex: number): number => {
  let flatIdx = 0;
  for (let i = 0; i < groupIndex; i++) {
    flatIdx += groupedOptions.value[i].options.length;
  }
  return flatIdx + optionIndex;
};
</script>

<template>
  <div
    class="zen-select"
    :class="{
      'zen-select--open': isOpen,
      'zen-select--disabled': disabled,
      'zen-select--loading': loading,
    }"
  >
    <button
      ref="triggerRef"
      type="button"
      class="zen-select__trigger"
      role="combobox"
      :aria-label="label ? `${label}: ${modelValue}` : modelValue"
      :aria-expanded="isOpen"
      :aria-haspopup="'listbox'"
      :aria-controls="dropdownId"
      :aria-activedescendant="
        isOpen && highlightedIndex >= 0
          ? `${dropdownId}-option-${highlightedIndex}`
          : undefined
      "
      :aria-disabled="disabled || loading"
      :disabled="disabled"
      @click="toggle"
      @keydown="handleKeydown"
    >
      <span v-if="hasIcon" class="zen-select__icon" aria-hidden="true">
        <slot name="icon" />
      </span>

      <span class="zen-select__label-value">
        <span v-if="label" class="zen-select__label">{{ label }}</span>
        <span class="zen-select__value">
          {{ modelValue }}
          <Sparkles
            v-if="isAITheme(modelValue)"
            :size="12"
            class="zen-select__ai-badge"
            aria-hidden="true"
          />
        </span>
      </span>

      <ChevronDown :size="16" class="zen-select__chevron" aria-hidden="true" />
    </button>

    <Teleport to="body">
      <Transition name="zen-dropdown">
        <ul
          v-if="isOpen"
          :id="dropdownId"
          ref="dropdownRef"
          class="zen-select__dropdown"
          :style="dropdownStyle"
          role="listbox"
          :aria-label="label"
          tabindex="-1"
        >
          <template
            v-for="(group, groupIndex) in groupedOptions"
            :key="group.group"
          >
            <li
              v-if="group.group"
              class="zen-select__group-header"
              role="presentation"
            >
              {{ group.group }}
            </li>
            <li
              v-for="(option, optionIndex) in group.options"
              :id="`${dropdownId}-option-${getFlatIndex(groupIndex, optionIndex)}`"
              :key="option"
              :ref="(el) => setOptionRef(el as HTMLLIElement, getFlatIndex(groupIndex, optionIndex))"
              role="option"
              class="zen-select__option"
              :class="{
                'zen-select__option--selected': option === modelValue,
                'zen-select__option--highlighted': getFlatIndex(groupIndex, optionIndex) === highlightedIndex,
              }"
              :aria-selected="option === modelValue"
              @click="select(option)"
              @mouseenter="highlightedIndex = getFlatIndex(groupIndex, optionIndex)"
            >
              <Check
                v-if="option === modelValue"
                :size="14"
                class="zen-select__check"
                aria-hidden="true"
              />
              <span class="zen-select__option-text">
                {{ option }}
                <Sparkles
                  v-if="isAITheme(option)"
                  :size="12"
                  class="zen-select__ai-badge"
                  aria-hidden="true"
                />
              </span>
            </li>
          </template>
        </ul>
      </Transition>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
.zen-select {
  --zen-select-text: var(--gutenku-text-zen, oklch(0.35 0.03 85));
  --zen-select-text-muted: var(--gutenku-text-muted, oklch(0.5 0.02 85));
  --zen-select-border: var(--gutenku-zen-primary, oklch(0.42 0.06 192));
  --zen-select-bg: var(--gutenku-paper-bg, oklch(0.97 0.01 85));
  --zen-select-hover: oklch(0.42 0.06 192 / 0.08);
  --zen-select-shadow: 0 4px 12px oklch(0 0 0 / 0.1), 0 2px 4px oklch(0 0 0 / 0.05);

  position: relative;
  display: inline-flex;
  min-width: 10rem;
}

.zen-select__trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--zen-select-border);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.875rem;
  color: var(--zen-select-text);
  text-align: left;
  transition: border-color 0.2s ease;

  &:hover:not(:disabled) {
    border-color: var(--gutenku-zen-accent, oklch(0.5 0.08 192));
  }

  &:focus-visible {
    outline: none;
    border-color: var(--gutenku-zen-accent);
    box-shadow: 0 2px 0 var(--gutenku-zen-accent);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.zen-select__icon {
  display: flex;
  align-items: center;
  color: var(--zen-select-border);
  flex-shrink: 0;
}

.zen-select__label-value {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.zen-select__label {
  font-size: 0.7rem;
  color: var(--zen-select-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.125rem;
}

.zen-select__value {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: var(--zen-select-text);
  text-transform: capitalize;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.zen-select__ai-badge {
  color: var(--gutenku-zen-accent, oklch(0.65 0.12 45));
  flex-shrink: 0;
  animation: sparkle-pulse 2s ease-in-out infinite;
}

@keyframes sparkle-pulse {
  0%, 100% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.zen-select__chevron {
  flex-shrink: 0;
  color: var(--zen-select-text-muted);
  transition: transform 0.2s ease;

  .zen-select--open & {
    transform: rotate(180deg);
  }
}


// Loading state
.zen-select--loading {
  .zen-select__trigger {
    cursor: wait;
  }

  .zen-select__value {
    animation: zen-pulse 1.5s ease-in-out infinite;
  }
}

@keyframes zen-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// Dark mode for trigger
[data-theme='dark'] .zen-select {
  --zen-select-text: var(--gutenku-text-primary);
  --zen-select-text-muted: var(--gutenku-text-muted);
  --zen-select-border: var(--gutenku-zen-primary);
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .zen-select__chevron {
    transition: none;
  }

  .zen-select__option {
    transition: none;
  }

  .zen-dropdown-enter-active,
  .zen-dropdown-leave-active {
    transition: none;
  }

  .zen-select--loading .zen-select__value {
    animation: none;
  }
}
</style>

<style lang="scss">
// Global styles for teleported dropdown
.zen-select__dropdown {
  --zen-select-text: var(--gutenku-text-zen, oklch(0.35 0.03 85));
  --zen-select-border: var(--gutenku-zen-primary, oklch(0.42 0.06 192));
  --zen-select-bg: var(--gutenku-paper-bg, oklch(0.97 0.01 85));
  --zen-select-hover: oklch(0.42 0.06 192 / 0.08);
  --zen-select-shadow: 0 4px 12px oklch(0 0 0 / 0.1), 0 2px 4px oklch(0 0 0 / 0.05);

  margin: 0;
  padding: 0.25rem;
  list-style: none;
  background: var(--zen-select-bg);
  border: 1px solid oklch(0 0 0 / 0.1);
  border-radius: var(--gutenku-radius-md, 0.5rem);
  box-shadow: var(--zen-select-shadow);
  max-height: 12rem;
  overflow-y: auto;

  // Paper texture
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(
      circle at 30% 40%,
      oklch(0.5 0.02 85 / 0.05) 0%,
      transparent 50%
    );
    border-radius: inherit;
    pointer-events: none;
  }
}

.zen-select__group-header {
  padding: 0.375rem 0.75rem 0.25rem;
  font-size: 0.65rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--zen-select-text-muted, oklch(0.5 0.02 85));
  border-bottom: 1px solid oklch(0 0 0 / 0.06);
  margin-bottom: 0.25rem;

  &:not(:first-child) {
    margin-top: 0.5rem;
    border-top: 1px solid oklch(0 0 0 / 0.06);
    padding-top: 0.5rem;
  }
}

.zen-select__option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--gutenku-radius-sm, 0.25rem);
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--zen-select-text);
  text-transform: capitalize;
  transition: background-color 0.15s ease;

  &:hover,
  &--highlighted {
    background: var(--zen-select-hover);
  }

  &--selected {
    color: var(--zen-select-border);
    font-weight: 500;
  }
}

.zen-select__check {
  flex-shrink: 0;
  color: var(--zen-select-border);
}

.zen-select__option-text {
  flex: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.zen-select__option .zen-select__ai-badge {
  color: var(--gutenku-zen-accent, oklch(0.65 0.12 45));
  flex-shrink: 0;
  animation: sparkle-pulse 2s ease-in-out infinite;
}

@keyframes sparkle-pulse {
  0%, 100% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

// Dark mode for teleported dropdown
[data-theme='dark'] .zen-select__dropdown {
  --zen-select-text: var(--gutenku-text-primary);
  --zen-select-border: var(--gutenku-zen-primary);
  --zen-select-bg: var(--gutenku-paper-bg);
  --zen-select-hover: var(--gutenku-zen-water);
  --zen-select-shadow: var(--gutenku-shadow-zen);

  border-color: var(--gutenku-border-visible);

  &::before {
    background-image: radial-gradient(
      circle at 30% 40%,
      oklch(1 0 0 / 0.05) 0%,
      transparent 50%
    );
  }

  .zen-select__group-header {
    color: var(--gutenku-text-muted);
    border-color: oklch(1 0 0 / 0.1);
  }

  .zen-select__option {
    color: var(--gutenku-text-primary);

    &:hover,
    &--highlighted {
      background: var(--gutenku-zen-primary);
      color: var(--gutenku-paper-bg);
    }

    &--selected {
      color: var(--gutenku-zen-accent);
      font-weight: 600;
    }
  }

  .zen-select__check {
    color: var(--gutenku-zen-accent);
  }
}

// Dropdown transitions (global)
.zen-dropdown-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.zen-dropdown-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}

.zen-dropdown-enter-from,
.zen-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

@media (prefers-reduced-motion: reduce) {
  .zen-select__option {
    transition: none;
  }

  .zen-dropdown-enter-active,
  .zen-dropdown-leave-active {
    transition: none;
  }
}
</style>
