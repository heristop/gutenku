<script lang="ts" setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
  useSlots,
  useId,
  nextTick,
  type CSSProperties,
} from 'vue';
import { ChevronDown, Check, Sparkles } from '@/core/components/icons/ink';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface OptionGroup {
  group: string;
  options: (string | SelectOption)[];
}

type OptionsInput = (string | SelectOption)[] | OptionGroup[];

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    modelValue: string;
    options: OptionsInput;
    label?: string;
    ariaLabel?: string;
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

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const groupedOptions = computed(() => {
  const groups = props.options.map((option) =>
    typeof option === 'object' && 'group' in option
      ? option
      : { group: '', options: [option] },
  );
  let index = 0;

  return groups.map((group) => ({
    group: group.group,
    options: group.options.map((option) => ({
      ...(typeof option === 'string'
        ? { value: option, label: option }
        : option),
      index: index++,
    })),
  }));
});
const flatOptions = computed(() =>
  groupedOptions.value.flatMap((group) => group.options),
);
const selectedIndex = computed(() =>
  flatOptions.value.findIndex((option) => option.value === props.modelValue),
);
const selectedLabel = computed(
  () => flatOptions.value[selectedIndex.value]?.label ?? props.modelValue,
);
const accessibleName = computed(
  () => props.ariaLabel || props.label || selectedLabel.value,
);
const unavailable = computed(() => props.disabled || props.loading);
const slots = useSlots();
const hasIcon = computed(() => !!slots.icon);
const isAITheme = (value: string) => props.aiThemes.includes(value);

const isOpen = ref(false);
const keyboardInteraction = ref(false);
const highlightedIndex = ref(-1);
const triggerRef = ref<HTMLButtonElement | null>(null);
const dropdownRef = ref<HTMLUListElement | null>(null);
const dropdownStyle = ref<CSSProperties>({});
const dropdownId = `zen-select-dropdown-${useId()}`;
let positionFrame: number | undefined;
let typedPrefix = '';
let lastTypedAt = 0;

const enabledIndices = computed(() =>
  flatOptions.value
    .filter((option) => !option.disabled)
    .map((option) => option.index),
);
const firstEnabled = () => enabledIndices.value[0] ?? -1;
const lastEnabled = () => enabledIndices.value.at(-1) ?? -1;
const selectedEnabled = () =>
  selectedIndex.value >= 0 && !flatOptions.value[selectedIndex.value].disabled
    ? selectedIndex.value
    : -1;

const close = () => {
  isOpen.value = false;
  highlightedIndex.value = -1;
  typedPrefix = '';

  if (positionFrame !== undefined) {
    cancelAnimationFrame(positionFrame);
    positionFrame = undefined;
  }
};

const viewportBounds = () => {
  const viewport = window.visualViewport;
  const left = viewport?.offsetLeft ?? 0;
  const top = viewport?.offsetTop ?? 0;

  return {
    left,
    top,
    right: left + (viewport?.width ?? window.innerWidth),
    bottom: top + (viewport?.height ?? window.innerHeight),
  };
};

// Fixed coordinates keep the paper card clear of clipped or scrolling docks.
const updateDropdownPosition = () => {
  if (!isOpen.value || !triggerRef.value || !dropdownRef.value) {
    return;
  }

  const rect = triggerRef.value.getBoundingClientRect();
  const viewport = viewportBounds();
  const margin = 8;
  const gap = 4;
  const width = Math.min(
    Math.max(rect.width, 180),
    Math.max(0, viewport.right - viewport.left - margin * 2),
  );
  const left = Math.max(
    viewport.left + margin,
    Math.min(rect.left, viewport.right - margin - width),
  );
  const above = Math.max(0, rect.top - viewport.top - margin - gap);
  const below = Math.max(0, viewport.bottom - rect.bottom - margin - gap);
  dropdownRef.value.style.width = `${width}px`;
  const contentHeight = dropdownRef.value.scrollHeight;
  const desiredHeight = Math.min(contentHeight, 288);
  const opensAbove = below < desiredHeight && above > below;
  const maxHeight = Math.min(288, opensAbove ? above : below);
  const height = Math.min(contentHeight, maxHeight);
  const top = opensAbove
    ? Math.max(viewport.top + margin, rect.top - gap - height)
    : Math.max(viewport.top + margin, rect.bottom + gap);

  dropdownStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    maxHeight: `${maxHeight}px`,
    transformOrigin: opensAbove ? 'bottom left' : 'top left',
    '--zen-select-enter-y': opensAbove ? '4px' : '-4px',
    zIndex: 9999,
  };
};

const scheduleDropdownPosition = (event: Event) => {
  if (
    !isOpen.value ||
    positionFrame !== undefined ||
    (event.target instanceof Node && dropdownRef.value?.contains(event.target))
  ) {
    return;
  }

  positionFrame = requestAnimationFrame(() => {
    positionFrame = undefined;
    updateDropdownPosition();
  });
};

const scrollHighlightedIntoView = () => {
  const list = dropdownRef.value;
  const option = list?.querySelector<HTMLElement>(
    `[data-index="${highlightedIndex.value}"]`,
  );

  if (!list || !option) {
    return;
  }

  const optionRect = option.getBoundingClientRect();
  const listRect = list.getBoundingClientRect();

  if (optionRect.top < listRect.top) {
    list.scrollTop -= listRect.top - optionRect.top;

    return;
  }

  if (optionRect.bottom > listRect.bottom) {
    list.scrollTop += optionRect.bottom - listRect.bottom;
  }
};

const openDropdown = (direction: 'first' | 'last' = 'first') => {
  if (unavailable.value || flatOptions.value.length === 0) {
    return;
  }

  isOpen.value = true;
  const fallback = direction === 'last' ? lastEnabled() : firstEnabled();
  highlightedIndex.value =
    selectedEnabled() >= 0 ? selectedEnabled() : fallback;
  triggerRef.value?.focus({ preventScroll: true });
  nextTick(() => {
    updateDropdownPosition();
    nextTick(scrollHighlightedIntoView);
  });
};

const toggle = () => (isOpen.value ? close() : openDropdown());
const select = (option: SelectOption) => {
  if (unavailable.value || option.disabled) {
    return;
  }

  emit('update:modelValue', option.value);
  close();
  triggerRef.value?.focus({ preventScroll: true });
};
const highlight = (index: number) => {
  if (!flatOptions.value[index]?.disabled) {
    highlightedIndex.value = index;
  }
};
const moveHighlight = (direction: 1 | -1) => {
  const indices = enabledIndices.value;
  const current = indices.indexOf(highlightedIndex.value);
  const fallback = direction === 1 ? 0 : indices.length - 1;
  const next =
    current < 0
      ? fallback
      : Math.max(0, Math.min(indices.length - 1, current + direction));
  highlightedIndex.value = indices[next] ?? -1;
};

const typeahead = (character: string) => {
  const now = Date.now();
  const previous = now - lastTypedAt < 700 ? typedPrefix : '';
  const letter = character.toLocaleLowerCase();
  let prefix = previous + letter;

  if ([...prefix].every((value) => value === letter)) {
    prefix = letter;
  }
  lastTypedAt = now;

  if (!isOpen.value) {
    openDropdown();
  }

  const findMatch = (query: string) => {
    const count = flatOptions.value.length;
    const start = highlightedIndex.value + (query.length === 1 ? 1 : 0);

    for (let offset = 0; offset < count; offset++) {
      const index = (Math.max(0, start) + offset) % count;
      const option = flatOptions.value[index];

      if (
        !option.disabled &&
        option.label.trim().toLocaleLowerCase().startsWith(query)
      ) {
        return index;
      }
    }

    return -1;
  };
  let match = findMatch(prefix);

  if (match < 0 && prefix.length > 1) {
    prefix = letter;
    match = findMatch(prefix);
  }
  typedPrefix = prefix;

  if (match >= 0) {
    highlightedIndex.value = match;
  }
};

const handleEnterSpace = (event: KeyboardEvent) => {
  event.preventDefault();

  if (!isOpen.value) {
    openDropdown();

    return;
  }

  const option = flatOptions.value[highlightedIndex.value];

  if (option) {
    select(option);

    return;
  }

  close();
};
const handleArrow = (event: KeyboardEvent, direction: 1 | -1) => {
  event.preventDefault();

  if (!isOpen.value) {
    openDropdown(direction === 1 ? 'first' : 'last');

    return;
  }

  moveHighlight(direction);
};
const handleBoundary = (event: KeyboardEvent) => {
  event.preventDefault();

  if (!isOpen.value) {
    openDropdown();
  }

  highlightedIndex.value =
    event.key === 'Home' ? firstEnabled() : lastEnabled();
};
const handleEscape = (event: KeyboardEvent) => {
  if (isOpen.value) {
    event.preventDefault();
    close();
  }
};
const keyHandlers: Record<string, (event: KeyboardEvent) => void> = {
  Enter: handleEnterSpace,
  ' ': handleEnterSpace,
  ArrowDown: (event) => handleArrow(event, 1),
  ArrowUp: (event) => handleArrow(event, -1),
  Home: handleBoundary,
  End: handleBoundary,
  Escape: handleEscape,
  Tab: close,
};
const handleKeydown = (event: KeyboardEvent) => {
  if (unavailable.value) {
    return;
  }
  keyboardInteraction.value = true;

  const handler = keyHandlers[event.key];

  if (handler) {
    handler(event);

    return;
  }

  if (
    event.key.length === 1 &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey
  ) {
    event.preventDefault();
    typeahead(event.key);
  }
};

watch(highlightedIndex, scrollHighlightedIntoView, { flush: 'post' });
watch(unavailable, (value) => {
  if (value) {
    close();
  }
});
watch([flatOptions, () => props.modelValue], () => {
  if (isOpen.value) {
    highlightedIndex.value =
      selectedEnabled() >= 0 ? selectedEnabled() : firstEnabled();
    nextTick(updateDropdownPosition);
  }
});

const handleClickOutside = (event: Event) => {
  if (
    isOpen.value &&
    event.target instanceof Node &&
    !triggerRef.value?.contains(event.target) &&
    !dropdownRef.value?.contains(event.target)
  ) {
    close();
  }
};
let removeListeners = () => {};
onMounted(() => {
  const viewport = window.visualViewport;
  document.addEventListener('pointerdown', handleClickOutside);
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('scroll', scheduleDropdownPosition, true);
  window.addEventListener('resize', scheduleDropdownPosition);
  viewport?.addEventListener('scroll', scheduleDropdownPosition);
  viewport?.addEventListener('resize', scheduleDropdownPosition);
  removeListeners = () => {
    document.removeEventListener('pointerdown', handleClickOutside);
    document.removeEventListener('click', handleClickOutside);
    window.removeEventListener('scroll', scheduleDropdownPosition, true);
    window.removeEventListener('resize', scheduleDropdownPosition);
    viewport?.removeEventListener('scroll', scheduleDropdownPosition);
    viewport?.removeEventListener('resize', scheduleDropdownPosition);
  };
});
onUnmounted(() => {
  removeListeners();

  if (positionFrame !== undefined) {
    cancelAnimationFrame(positionFrame);
  }
});
</script>

<template>
  <div
    class="zen-select"
    :class="[
      $attrs.class,
      {
        'zen-select--open': isOpen,
        'zen-select--disabled': disabled,
        'zen-select--loading': loading,
        'zen-select--keyboard': keyboardInteraction,
      },
    ]"
  >
    <button
      ref="triggerRef"
      v-bind="$attrs"
      type="button"
      class="zen-select__trigger"
      role="combobox"
      :aria-label="accessibleName"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      :aria-controls="dropdownId"
      :aria-activedescendant="
        isOpen && highlightedIndex >= 0
          ? `${dropdownId}-option-${highlightedIndex}`
          : undefined
      "
      :aria-disabled="unavailable"
      :disabled="disabled"
      @click="toggle"
      @pointerdown="keyboardInteraction = false"
      @keydown="handleKeydown"
      @blur="close"
    >
      <span v-if="hasIcon" class="zen-select__icon" aria-hidden="true">
        <slot name="icon" />
      </span>
      <span class="zen-select__label-value">
        <span v-if="label" class="zen-select__label">{{ label }}</span>
        <span class="zen-select__value">
          {{ selectedLabel }}
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
      <Transition name="zen-dropdown" :css="!keyboardInteraction">
        <ul
          v-if="isOpen"
          :id="dropdownId"
          ref="dropdownRef"
          class="zen-select__dropdown"
          :class="{ 'zen-select__dropdown--instant': keyboardInteraction }"
          :style="dropdownStyle"
          role="listbox"
          :aria-label="accessibleName"
        >
          <template
            v-for="(group, groupIndex) in groupedOptions"
            :key="groupIndex"
          >
            <li
              v-if="group.group"
              class="zen-select__group-header"
              role="presentation"
            >
              {{ group.group }}
            </li>
            <li
              v-for="option in group.options"
              :id="`${dropdownId}-option-${option.index}`"
              :key="option.value"
              :data-value="option.value"
              :data-index="option.index"
              role="option"
              class="zen-select__option"
              :class="{
                'zen-select__option--selected': option.value === modelValue,
                'zen-select__option--highlighted':
                  option.index === highlightedIndex,
                'zen-select__option--disabled': option.disabled,
              }"
              :aria-selected="option.value === modelValue"
              :aria-disabled="option.disabled || undefined"
              @pointerdown.prevent
              @mousedown.prevent
              @click="select(option)"
              @mouseenter="highlight(option.index)"
            >
              <Check
                v-if="option.value === modelValue"
                :size="14"
                class="zen-select__check"
                aria-hidden="true"
              />
              <span class="zen-select__option-text">
                {{ option.label }}
                <Sparkles
                  v-if="isAITheme(option.value)"
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
  min-width: 0;
  max-width: 100%;
  width: 100%;
}

.zen-select__trigger {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  min-width: 0;
  max-width: 100%;
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
  letter-spacing: 0.14em;
  margin-bottom: 0.125rem;
  text-transform: uppercase;
}

.zen-select__value {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: var(--gk-ink);
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
.zen-select--keyboard .zen-select__chevron {
  transition: none;
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
  box-sizing: border-box;
  margin: 0;
  padding: 0.25rem;
  list-style: none;
  background: var(--gk-paper-raised);
  border-radius: var(--gk-radius-paper);
  box-shadow:
    inset 0 0 0 1.5px var(--gk-ink),
    var(--gk-lift);
  max-height: 18rem;
  overscroll-behavior: contain;
  overflow-y: auto;
  font-family: var(--gk-font);
  scrollbar-width: thin;
  scrollbar-color: var(--gk-ink-faint) transparent;
}

.zen-select__group-header {
  padding: 0.5rem 0.75rem 0.25rem;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: var(--gk-ink-soft);
  text-transform: uppercase;

  &:not(:first-child) {
    margin-top: 0.25rem;
    border-top: 1px dashed var(--gk-ink-faint);
  }
}

.zen-select__option {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.75rem;
  padding: 0.375rem 0.75rem 0.375rem 2.125rem;
  border-radius: var(--gk-radius-control);
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--gk-ink);
  transition: background-color var(--gk-dur-fast) var(--gk-ease-out);

  &--highlighted {
    background: var(--gk-ink-faint);
  }

  @media (hover: hover) {
    &:not(.zen-select__option--disabled):hover {
      background: var(--gk-ink-faint);
    }
  }

  &--selected {
    font-weight: 700;
  }

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.zen-select__check {
  position: absolute;
  left: 0.75rem;
  flex-shrink: 0;
  color: var(--gk-indigo);
}

.zen-select__option-text {
  flex: 1;
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  overflow-wrap: anywhere;
}
.zen-select__dropdown--instant .zen-select__option {
  transition: none;
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
  transform: translateY(var(--zen-select-enter-y, -4px));
}

@media (prefers-reduced-motion: reduce) {
  .zen-select__option,
  .zen-dropdown-enter-active,
  .zen-dropdown-leave-active {
    transition: none;
  }

  .zen-dropdown-enter-from,
  .zen-dropdown-leave-to {
    transform: none;
  }
}

@media (forced-colors: active) {
  .zen-select__trigger {
    border-bottom-color: ButtonText;
  }

  .zen-select__trigger:focus-visible {
    outline-color: Highlight;
  }

  .zen-select__dropdown {
    color: CanvasText;
    background: Canvas;
    border: 2px solid CanvasText;
    box-shadow: none;
  }

  .zen-select__option--highlighted {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }

  .zen-select__option--disabled {
    color: GrayText;
    opacity: 1;
  }

  .zen-select__check {
    color: Highlight;
  }
}
</style>
