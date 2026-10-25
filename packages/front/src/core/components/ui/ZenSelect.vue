<script lang="ts" setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
  useSlots,
  nextTick,
} from 'vue';
import { ChevronDown, Check, Sparkles } from '@/core/components/icons/ink';

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
  if (!triggerRef.value) {
    return;
  }

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
  if (props.disabled || props.loading) {
    return;
  }

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

const openDropdown = () => {
  isOpen.value = true;
  highlightedIndex.value = selectedIndex.value >= 0 ? selectedIndex.value : 0;
  nextTick(updateDropdownPosition);
};

const handleEnterSpace = (event: KeyboardEvent) => {
  event.preventDefault();

  if (isOpen.value && highlightedIndex.value >= 0) {
    select(flatOptions.value[highlightedIndex.value]);

    return;
  }

  toggle();
};

const handleArrowDown = (event: KeyboardEvent) => {
  event.preventDefault();

  if (!isOpen.value) {
    openDropdown();

    return;
  }

  highlightedIndex.value = Math.min(
    highlightedIndex.value + 1,
    flatOptions.value.length - 1,
  );
};

const handleArrowUp = (event: KeyboardEvent) => {
  event.preventDefault();

  if (isOpen.value) {
    highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0);
  }
};

const handleEscape = (event: KeyboardEvent) => {
  event.preventDefault();
  close();
  triggerRef.value?.focus();
};

const handleHome = (event: KeyboardEvent) => {
  if (isOpen.value) {
    event.preventDefault();
    highlightedIndex.value = 0;
  }
};

const handleEnd = (event: KeyboardEvent) => {
  if (isOpen.value) {
    event.preventDefault();
    highlightedIndex.value = flatOptions.value.length - 1;
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled || props.loading) {
    return;
  }

  const handlers: Record<string, (e: KeyboardEvent) => void> = {
    Enter: handleEnterSpace,
    ' ': handleEnterSpace,
    ArrowDown: handleArrowDown,
    ArrowUp: handleArrowUp,
    Escape: handleEscape,
    Tab: close,
    Home: handleHome,
    End: handleEnd,
  };

  handlers[event.key]?.(event);
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
              :ref="
                (el) =>
                  setOptionRef(
                    el as HTMLLIElement,
                    getFlatIndex(groupIndex, optionIndex),
                  )
              "
              role="option"
              class="zen-select__option"
              :class="{
                'zen-select__option--selected': option === modelValue,
                'zen-select__option--highlighted':
                  getFlatIndex(groupIndex, optionIndex) === highlightedIndex,
              }"
              :aria-selected="option === modelValue"
              @click="select(option)"
              @mouseenter="
                highlightedIndex = getFlatIndex(groupIndex, optionIndex)
              "
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
// Ex Libris: a typed value sitting on a ruled line, like a form field on a slip.
.zen-select {
  position: relative;
  display: inline-flex;
  min-width: 10rem;
}

.zen-select__trigger {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  min-height: 2.75rem;
  padding: 0.375rem 0;
  background: transparent;
  border: none;
  border-bottom: 1.5px solid var(--gk-ink-faint);
  cursor: pointer;
  font-family: var(--gk-font);
  font-size: 0.875rem;
  color: var(--gk-ink);
  text-align: left;
  transition: border-color var(--gk-dur-fast) var(--gk-ease-out);

  @media (hover: hover) {
    &:hover:not(:disabled) {
      border-bottom-color: var(--gk-ink);
    }
  }

  &:focus-visible {
    outline: 2px solid var(--gk-indigo);
    outline-offset: 3px;
    border-bottom-color: var(--gk-ink);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.zen-select--open .zen-select__trigger {
  border-bottom-color: var(--gk-ink);
}

.zen-select__icon {
  display: flex;
  align-items: center;
  color: var(--gk-ink-soft);
  flex-shrink: 0;
}

.zen-select__label-value {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.zen-select__label {
  font-size: 0.6875rem;
  color: var(--gk-ink-soft);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  margin-bottom: 0.125rem;
}

.zen-select__value {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: var(--gk-ink);
  text-transform: capitalize;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.zen-select__ai-badge {
  color: var(--gk-ink-soft);
  flex-shrink: 0;
}

.zen-select__chevron {
  flex-shrink: 0;
  color: var(--gk-ink-soft);
  transition: transform var(--gk-dur-fast) var(--gk-ease-out);

  .zen-select--open & {
    transform: rotate(180deg);
  }
}

.zen-select--loading {
  .zen-select__trigger {
    cursor: wait;
  }

  .zen-select__value {
    opacity: 0.55;
  }
}

@media (prefers-reduced-motion: reduce) {
  .zen-select__chevron,
  .zen-select__trigger {
    transition: none;
  }
}
</style>

<style lang="scss">
// Teleported dropdown: an index card of options, ruled between groups
.zen-select__dropdown {
  margin: 0;
  padding: 0.25rem;
  list-style: none;
  background: var(--gk-paper-raised);
  border-radius: var(--gk-radius-paper);
  box-shadow:
    inset 0 0 0 1.5px var(--gk-ink),
    var(--gk-lift);
  max-height: 12rem;
  overflow-y: auto;
  font-family: var(--gk-font);
  scrollbar-width: thin;
  scrollbar-color: var(--gk-ink-faint) transparent;
}

.zen-select__group-header {
  padding: 0.5rem 0.75rem 0.25rem;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--gk-ink-soft);

  &:not(:first-child) {
    margin-top: 0.25rem;
    border-top: 1px dashed var(--gk-ink-faint);
  }
}

.zen-select__option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.75rem;
  padding: 0.375rem 0.75rem;
  border-radius: var(--gk-radius-control);
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--gk-ink);
  text-transform: capitalize;
  transition: background-color var(--gk-dur-fast) var(--gk-ease-out);

  &--highlighted {
    background: var(--gk-ink-faint);
  }

  @media (hover: hover) {
    &:hover {
      background: var(--gk-ink-faint);
    }
  }

  &--selected {
    font-weight: 700;
  }
}

.zen-select__check {
  flex-shrink: 0;
  color: var(--gk-indigo);
}

.zen-select__option-text {
  flex: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.zen-select__option .zen-select__ai-badge {
  color: var(--gk-ink-soft);
  flex-shrink: 0;
}

.zen-dropdown-enter-active,
.zen-dropdown-leave-active {
  transition:
    opacity var(--gk-dur-fast) var(--gk-ease-out),
    transform var(--gk-dur-fast) var(--gk-ease-out);
}

.zen-dropdown-enter-from,
.zen-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .zen-select__option {
    transition: none;
  }

  .zen-dropdown-enter-from,
  .zen-dropdown-leave-to {
    transform: none;
  }
}

@media (forced-colors: active) {
  .zen-select__dropdown {
    border: 2px solid CanvasText;
  }
}
</style>
