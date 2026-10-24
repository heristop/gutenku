<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  useId,
  watch,
  type CSSProperties,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { Check } from '@/core/components/icons/ink';
import { useLocale, type SupportedLocale } from '@/core/composables/locale';
import { LOCALE_CONFIG } from '@/locales/config';

// The language key of the reader preferences: a ruled "EN" key that opens a
// small paper leaf listing each language in its own name. The root element is
// the trigger itself, so the parent keeps owning the key's ruled look.
const { t } = useI18n();
const { currentLocale, availableLocales, setLocale, getLocaleLabel } =
  useLocale();

const VIEWPORT_MARGIN = 8;
const GAP = 6;

const uid = useId();
const listboxId = `ink-lang-${uid}`;
const optionId = (index: number) => `${listboxId}-opt-${index}`;

const triggerRef = ref<HTMLButtonElement | null>(null);
const listboxRef = ref<HTMLUListElement | null>(null);
const isOpen = ref(false);
const activeIndex = ref(-1);
const keyboardActive = ref(false);
const placement = ref<'below' | 'above'>('below');
const align = ref<'start' | 'end'>('end');
const position = ref<CSSProperties>({});

const options = computed(() =>
  availableLocales.map((code) => ({
    code,
    label: getLocaleLabel(code),
    lang: LOCALE_CONFIG[code].htmlLang,
  })),
);

const selectedIndex = computed(() =>
  Math.max(
    0,
    options.value.findIndex((o) => o.code === currentLocale.value),
  ),
);

const triggerLabel = computed(
  () => `${t('locale.switch')}: ${getLocaleLabel(currentLocale.value)}`,
);

const leafStyle = computed<CSSProperties>(() => ({
  ...position.value,
  transformOrigin: `${placement.value === 'below' ? 'top' : 'bottom'} ${
    align.value === 'end' ? 'right' : 'left'
  }`,
}));

type Side = 'below' | 'above';

// Below by default, above in the colophon footer; flip only when the
// preferred side lacks room and the other side has more.
function pickSide(trigger: HTMLElement, rect: DOMRect, height: number): Side {
  const room: Record<Side, number> = {
    below: window.innerHeight - rect.bottom - GAP - VIEWPORT_MARGIN,
    above: rect.top - GAP - VIEWPORT_MARGIN,
  };
  const preferred: Side = trigger.closest('footer') ? 'above' : 'below';
  const other: Side = preferred === 'below' ? 'above' : 'below';

  return height > room[preferred] && room[other] > room[preferred]
    ? other
    : preferred;
}

// Align the leaf's right edge to the key unless that runs off the left edge,
// then clamp it inside the viewport.
function pickLeft(rect: DOMRect, width: number) {
  const vw = document.documentElement.clientWidth || window.innerWidth;
  const endAligned = rect.right - width;

  align.value = endAligned < VIEWPORT_MARGIN ? 'start' : 'end';

  const left = align.value === 'end' ? endAligned : rect.left;
  const maxLeft = Math.max(VIEWPORT_MARGIN, vw - width - VIEWPORT_MARGIN);

  return Math.min(Math.max(left, VIEWPORT_MARGIN), maxLeft);
}

// Anchor the leaf to the key, kept inside the viewport.
function updatePosition() {
  const trigger = triggerRef.value;
  const leaf = listboxRef.value;

  if (!trigger || !leaf) {
    return;
  }

  const rect = trigger.getBoundingClientRect();
  const height = leaf.offsetHeight;
  const side = pickSide(trigger, rect, height);
  const top = side === 'below' ? rect.bottom + GAP : rect.top - GAP - height;

  placement.value = side;
  position.value = {
    top: `${Math.max(VIEWPORT_MARGIN, top)}px`,
    left: `${pickLeft(rect, leaf.offsetWidth)}px`,
  };
}

function handleViewportChange() {
  if (isOpen.value) {
    updatePosition();
  }
}

function handlePointerDownOutside(event: PointerEvent) {
  const target = event.target as Node;

  if (
    triggerRef.value?.contains(target) ||
    listboxRef.value?.contains(target)
  ) {
    return;
  }

  close();
}

function addGlobalListeners() {
  document.addEventListener('pointerdown', handlePointerDownOutside, true);
  window.addEventListener('scroll', handleViewportChange, true);
  window.addEventListener('resize', handleViewportChange);
}

function removeGlobalListeners() {
  document.removeEventListener('pointerdown', handlePointerDownOutside, true);
  window.removeEventListener('scroll', handleViewportChange, true);
  window.removeEventListener('resize', handleViewportChange);
}

async function open(startIndex = selectedIndex.value) {
  if (isOpen.value) {
    return;
  }

  activeIndex.value = startIndex;
  isOpen.value = true;
  addGlobalListeners();
  await nextTick();
  updatePosition();
  listboxRef.value?.focus({ preventScroll: true });
}

function close({ returnFocus = false } = {}) {
  if (!isOpen.value) {
    return;
  }

  isOpen.value = false;
  activeIndex.value = -1;
  removeGlobalListeners();

  if (returnFocus) {
    triggerRef.value?.focus();
  }
}

function toggle() {
  if (isOpen.value) {
    close({ returnFocus: true });

    return;
  }

  keyboardActive.value = false;
  open();
}

function select(index: number) {
  const option = options.value[index];

  if (option && option.code !== currentLocale.value) {
    setLocale(option.code as SupportedLocale);
  }

  close({ returnFocus: true });
}

function handleTriggerKeydown(event: KeyboardEvent) {
  const openKeys: Record<string, () => number> = {
    ArrowDown: () => selectedIndex.value,
    ArrowUp: () => selectedIndex.value,
    Enter: () => selectedIndex.value,
    ' ': () => selectedIndex.value,
  };

  if (event.key === 'Escape' && isOpen.value) {
    event.preventDefault();
    close({ returnFocus: true });

    return;
  }

  const start = openKeys[event.key];

  if (start && !isOpen.value) {
    event.preventDefault();
    keyboardActive.value = true;
    open(start());
  }
}

// First-letter typeahead over each language's own name and its code,
// cycling through matches from the current option.
function typeahead(char: string) {
  const needle = char.toLocaleLowerCase();
  const count = options.value.length;

  for (let step = 1; step <= count; step++) {
    const index = (activeIndex.value + step) % count;
    const option = options.value[index];

    if (
      option.label.toLocaleLowerCase().startsWith(needle) ||
      option.code.startsWith(needle)
    ) {
      activeIndex.value = index;

      return;
    }
  }
}

const lastIndex = () => options.value.length - 1;

const listboxKeys: Record<string, () => void> = {
  ArrowDown: () => {
    activeIndex.value = Math.min(activeIndex.value + 1, lastIndex());
  },
  ArrowUp: () => {
    activeIndex.value = Math.max(activeIndex.value - 1, 0);
  },
  Home: () => {
    activeIndex.value = 0;
  },
  End: () => {
    activeIndex.value = lastIndex();
  },
  Enter: () => select(activeIndex.value),
  ' ': () => select(activeIndex.value),
  Escape: () => close({ returnFocus: true }),
};

function isTypeaheadKey(event: KeyboardEvent) {
  return (
    event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey
  );
}

function handleListboxKeydown(event: KeyboardEvent) {
  keyboardActive.value = true;

  // Hand focus back to the key without preventing Tab, so focus continues
  // onward from it.
  if (event.key === 'Tab') {
    close({ returnFocus: true });

    return;
  }

  const action = listboxKeys[event.key];

  if (action) {
    event.preventDefault();
    action();

    return;
  }

  if (isTypeaheadKey(event)) {
    typeahead(event.key);
  }
}

function handleOptionPointerMove(index: number) {
  keyboardActive.value = false;
  activeIndex.value = index;
}

watch(activeIndex, (index) => {
  if (index >= 0) {
    document
      .getElementById(optionId(index))
      ?.scrollIntoView?.({ block: 'nearest' });
  }
});

onBeforeUnmount(removeGlobalListeners);

defineExpose({ open, close, isOpen });
</script>

<template>
  <button
    ref="triggerRef"
    type="button"
    :aria-label="triggerLabel"
    :title="t('locale.switch')"
    aria-haspopup="listbox"
    :aria-expanded="isOpen"
    :aria-controls="listboxId"
    @click="toggle"
    @keydown="handleTriggerKeydown"
  >
    <span class="ink-lang__code" aria-hidden="true">
      {{ currentLocale.toUpperCase() }}
    </span>

    <Teleport to="body">
      <Transition name="ink-lang-leaf">
        <ul
          v-if="isOpen"
          :id="listboxId"
          ref="listboxRef"
          class="ink-lang__leaf"
          :class="[
            `ink-lang__leaf--${placement}`,
            { 'ink-lang__leaf--keyboard': keyboardActive },
          ]"
          :style="leafStyle"
          role="listbox"
          tabindex="-1"
          :aria-label="t('locale.switch')"
          :aria-activedescendant="
            activeIndex >= 0 ? optionId(activeIndex) : undefined
          "
          @keydown="handleListboxKeydown"
        >
          <li
            v-for="(option, index) in options"
            :id="optionId(index)"
            :key="option.code"
            role="option"
            class="ink-lang__option"
            :class="{
              'ink-lang__option--active': index === activeIndex,
              'ink-lang__option--selected': option.code === currentLocale,
            }"
            :lang="option.lang"
            :aria-selected="option.code === currentLocale"
            @pointermove="handleOptionPointerMove(index)"
            @click="select(index)"
          >
            <span class="ink-lang__name">{{ option.label }}</span>
            <Check
              v-if="option.code === currentLocale"
              class="ink-lang__check"
              :size="15"
              :stroke-width="2"
              aria-hidden="true"
            />
          </li>
        </ul>
      </Transition>
    </Teleport>
  </button>
</template>

<style lang="scss" scoped>
.ink-lang__code {
  pointer-events: none;
  letter-spacing: 0.04em;
}
</style>

<style lang="scss">
// Teleported leaf: a small slip of raised paper with a hairline edge, typed
// language names, and the current one inked bold with an indigo tick.
.ink-lang__leaf {
  --ink-lang-shift: -4px;

  position: fixed;
  z-index: 1100;
  min-width: 10rem;
  max-width: calc(100vw - 16px);
  margin: 0;
  padding: 0.25rem;
  list-style: none;
  background: var(--gk-paper-raised);
  border-radius: var(--gk-radius-paper);
  box-shadow:
    inset 0 0 0 1px var(--gk-ink-faint),
    var(--gk-lift);
  font-family: var(--gk-font);
  color: var(--gk-ink);

  &--above {
    --ink-lang-shift: 4px;
  }

  &:focus {
    outline: none;
  }
}

.ink-lang__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 2.75rem;
  padding: 0 0.75rem;
  border-radius: var(--gk-radius-control);
  font-size: 0.875rem;
  line-height: 1.2;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  &--active {
    background: var(--gk-ink-faint);
  }

  &--selected {
    font-weight: 700;
  }
}

// Keyboard travel adds the site's indigo focus ring to the washed row.
.ink-lang__leaf--keyboard .ink-lang__option--active {
  outline: 2px solid var(--gk-indigo);
  outline-offset: -2px;
}

// Pointer hover only paints a wash on devices that truly hover.
@media (hover: none) {
  .ink-lang__leaf:not(.ink-lang__leaf--keyboard) .ink-lang__option--active {
    background: transparent;
  }
}

.ink-lang__check {
  flex-shrink: 0;
  color: var(--gk-indigo);
}

.ink-lang-leaf-enter-active {
  transition:
    opacity var(--gk-dur-fast) var(--gk-ease-out),
    transform var(--gk-dur-fast) var(--gk-ease-out);
}

.ink-lang-leaf-leave-active {
  transition:
    opacity var(--gk-dur-press) var(--gk-ease-out),
    transform var(--gk-dur-press) var(--gk-ease-out);
}

.ink-lang-leaf-enter-from,
.ink-lang-leaf-leave-to {
  opacity: 0;
  transform: translateY(var(--ink-lang-shift)) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .ink-lang-leaf-enter-from,
  .ink-lang-leaf-leave-to {
    transform: none;
  }
}

@media (forced-colors: active) {
  .ink-lang__leaf {
    border: 1px solid CanvasText;
  }

  .ink-lang__option--active {
    forced-color-adjust: none;
    background: Highlight;
    color: HighlightText;
  }
}
</style>
