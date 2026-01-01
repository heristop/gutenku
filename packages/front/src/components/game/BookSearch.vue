<script lang="ts" setup>
import { ref, computed, useId, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { Search, Send } from 'lucide-vue-next';
import { useGameStore } from '@/store/game';
import type { BookValue } from '@gutenku/shared';
import ZenButton from '@/components/ui/ZenButton.vue';

const props = defineProps<{
  loading: boolean;
}>();

const { t } = useI18n();
const gameStore = useGameStore();
const { availableBooks, attemptsRemaining } = storeToRefs(gameStore);

const listboxId = useId();

const searchQuery = ref('');
const selectedBook = ref<BookValue | null>(null);
const isMenuOpen = ref(false);
const isSubmitting = ref(false);

// Dropdown positioning refs
const inputRef = ref<HTMLInputElement | null>(null);
const dropdownRef = ref<HTMLUListElement | null>(null);
const highlightedIndex = ref(-1);
const dropdownStyle = ref<Record<string, string>>({});
const optionRefs = ref<HTMLLIElement[]>([]);

const filteredBooks = computed(() => {
  if (!searchQuery.value.trim()) {return availableBooks.value;}

  const query = searchQuery.value.toLowerCase();
  return availableBooks.value.filter(
    (book) =>
      book.title?.toLowerCase().includes(query) ||
      book.author?.toLowerCase().includes(query),
  );
});

const canSubmit = computed(
  () => selectedBook.value && !props.loading && !isSubmitting.value,
);

// Dropdown positioning
const updateDropdownPosition = () => {
  if (!inputRef.value) {return;}

  const rect = inputRef.value.getBoundingClientRect();
  dropdownStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    maxHeight: '300px',
    zIndex: '9999',
  };
};

function selectBook(book: BookValue) {
  selectedBook.value = book;
  searchQuery.value = book.title || '';
  isMenuOpen.value = false;
  highlightedIndex.value = -1;
}

async function submitGuess() {
  if (!selectedBook.value?.reference || isSubmitting.value) {return;}

  isSubmitting.value = true;
  try {
    await gameStore.submitGuess(
      selectedBook.value.reference,
      selectedBook.value.title || '',
    );
    searchQuery.value = '';
    selectedBook.value = null;
  } finally {
    isSubmitting.value = false;
  }
}

function handleInput() {
  selectedBook.value = null;
  highlightedIndex.value = -1;
  isMenuOpen.value = searchQuery.value.length > 0;
  if (isMenuOpen.value) {
    nextTick(updateDropdownPosition);
  }
}

function handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      if (!isMenuOpen.value && filteredBooks.value.length > 0) {
        isMenuOpen.value = true;
        highlightedIndex.value = 0;
        nextTick(updateDropdownPosition);
      } else if (isMenuOpen.value) {
        highlightedIndex.value = Math.min(
          highlightedIndex.value + 1,
          filteredBooks.value.length - 1,
        );
      }
      break;

    case 'ArrowUp':
      event.preventDefault();
      if (isMenuOpen.value) {
        highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0);
      }
      break;

    case 'Enter':
      event.preventDefault();
      if (isMenuOpen.value && highlightedIndex.value >= 0) {
        selectBook(filteredBooks.value[highlightedIndex.value]);
      } else if (canSubmit.value) {
        submitGuess();
      }
      break;

    case 'Escape':
      if (isMenuOpen.value) {
        event.preventDefault();
        isMenuOpen.value = false;
        highlightedIndex.value = -1;
      }
      break;

    case 'Tab':
      isMenuOpen.value = false;
      highlightedIndex.value = -1;
      break;
  }
}

function handleFocus() {
  if (searchQuery.value.length > 0) {
    isMenuOpen.value = true;
    nextTick(updateDropdownPosition);
  }
}

// Scroll highlighted option into view
watch(highlightedIndex, (index) => {
  if (index >= 0 && optionRefs.value[index]) {
    optionRefs.value[index].scrollIntoView({ block: 'nearest' });
  }
});

// Click outside handler
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  const inputContainer = inputRef.value?.closest('.search-input-container');

  if (
    inputContainer &&
    !inputContainer.contains(target) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(target)
  ) {
    isMenuOpen.value = false;
    highlightedIndex.value = -1;
  }
};

// Update position on scroll/resize
const handleScrollResize = () => {
  if (isMenuOpen.value) {
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
</script>

<template>
  <div class="book-search">
    <div id="attempts-counter" class="attempts-counter gutenku-text-muted">
      {{ t('game.attemptsRemaining', { count: attemptsRemaining }) }}
    </div>

    <div class="search-wrapper">
      <div class="search-input-container">
        <Search class="search-icon" :size="20" />
        <input
          ref="inputRef"
          v-model="searchQuery"
          type="text"
          class="search-input"
          role="combobox"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          :aria-label="t('game.searchLabel')"
          :aria-expanded="isMenuOpen"
          :aria-controls="listboxId"
          aria-haspopup="listbox"
          aria-autocomplete="list"
          :aria-activedescendant="
            isMenuOpen && highlightedIndex >= 0
              ? `${listboxId}-option-${highlightedIndex}`
              : undefined
          "
          :placeholder="t('game.searchPlaceholder', { count: availableBooks.length })"
          :disabled="loading || isSubmitting"
          @input="handleInput"
          @focus="handleFocus"
          @keydown="handleKeydown"
        />
        <ZenButton
          variant="text"
          size="sm"
          class="submit-btn"
          :disabled="!canSubmit"
          :loading="isSubmitting"
          :aria-label="t('game.submit')"
          aria-describedby="attempts-counter"
          @click="submitGuess"
        >
          <template #icon-left>
            <Send :size="18" />
          </template>
        </ZenButton>
      </div>

      <Teleport to="body">
        <Transition name="zen-dropdown">
          <ul
            v-if="isMenuOpen"
            :id="listboxId"
            ref="dropdownRef"
            class="book-dropdown"
            :style="dropdownStyle"
            role="listbox"
            :aria-label="t('game.searchLabel')"
            tabindex="-1"
          >
            <li
              v-for="(book, index) in filteredBooks"
              :id="`${listboxId}-option-${index}`"
              :key="book.reference"
              :ref="(el) => setOptionRef(el as HTMLLIElement, index)"
              role="option"
              class="book-dropdown__item"
              :class="{ 'book-dropdown__item--highlighted': index === highlightedIndex }"
              :aria-selected="selectedBook?.reference === book.reference"
              @click="selectBook(book)"
              @mouseenter="highlightedIndex = index"
            >
              <span class="book-dropdown__emoticons">{{ book.emoticons }}</span>
              <div class="book-dropdown__text">
                <span class="book-dropdown__title">{{ book.title }}</span>
                <span class="book-dropdown__author">{{ book.author }}</span>
              </div>
            </li>

            <li
              v-if="filteredBooks.length === 0"
              class="book-dropdown__empty"
              role="status"
              aria-live="polite"
            >
              {{ t('game.noResults') }}
              <span
                class="book-dropdown__empty-hint"
                >{{ t('game.noResultsHint') }}</span
              >
            </li>
          </ul>
        </Transition>
      </Teleport>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.book-search {
  padding: 1rem 1.25rem;
  margin-bottom: 0.5rem;
}

.attempts-counter {
  font-size: 0.75rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.search-input-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 3rem;
  background: var(--gutenku-zen-water);
  border: 1px solid var(--gutenku-paper-border);
  border-radius: var(--gutenku-radius-md);
  padding: 0.5rem 0.75rem;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease,
    transform 0.2s ease;

  &:hover:not(:focus-within) {
    border-color: oklch(0.5 0.05 55 / 0.3);
  }

  &:focus-within {
    border-color: var(--gutenku-zen-accent);
    box-shadow:
      0 0 0 3px var(--gutenku-zen-mist),
      0 4px 12px oklch(0.5 0.1 55 / 0.1);
  }
}

.search-icon {
  color: var(--gutenku-text-muted);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  height: 1.5rem;
  line-height: 1.5rem;
  padding: 0;
  background: transparent;
  border: none;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  font-family: inherit;
  font-size: 1rem;
  color: var(--gutenku-text-primary);

  // Hide browser's native clear button
  &::-webkit-search-cancel-button,
  &::-webkit-search-decoration,
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button,
  &::-ms-clear,
  &::-ms-reveal {
    display: none;
    -webkit-appearance: none;
    appearance: none;
  }

  &::placeholder {
    color: var(--gutenku-text-muted);
  }

  &:disabled {
    opacity: 0.6;
  }
}

.submit-btn {
  flex-shrink: 0;
  color: var(--gutenku-zen-primary);
  transition: var(--gutenku-transition-zen);

  &:not(:disabled):hover {
    color: var(--gutenku-btn-generate-text);
    transform: scale(1.1);
  }

  &:disabled {
    opacity: 0.4;
  }
}

@media (prefers-reduced-motion: reduce) {
  .search-input-container {
    transition: none;
  }
}
</style>

<style lang="scss">
// Global styles for teleported dropdown
.book-dropdown {
  margin: 0;
  padding: 0.25rem;
  list-style: none;
  background: var(--gutenku-paper-bg);
  border: 1px solid var(--gutenku-paper-border);
  border-radius: var(--gutenku-radius-md);
  box-shadow: var(--gutenku-shadow-zen);
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

.book-dropdown__item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--gutenku-radius-sm);
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    transform 0.15s ease;

  &:hover,
  &--highlighted {
    background: var(--gutenku-zen-water);
    transform: translateX(4px);
  }

  &:active {
    transform: translateX(2px);
  }
}

.book-dropdown__emoticons {
  font-size: 1.25rem;
  min-width: 2.5rem;
  flex-shrink: 0;
}

.book-dropdown__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.book-dropdown__title {
  font-weight: 500;
  color: var(--gutenku-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-dropdown__author {
  color: var(--gutenku-text-muted);
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-dropdown__empty {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  text-align: center;
  color: var(--gutenku-text-muted);
  font-style: italic;
}

.book-dropdown__empty-hint {
  font-size: 0.75rem;
  font-style: normal;
  opacity: 0.8;
}

// Dropdown transitions
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

// Dark mode
[data-theme='dark'] .book-dropdown {
  background: var(--gutenku-paper-bg);
  border-color: var(--gutenku-border-visible);

  &::before {
    background-image: radial-gradient(
      circle at 30% 40%,
      oklch(1 0 0 / 0.05) 0%,
      transparent 50%
    );
  }

  .book-dropdown__item {
    &:hover,
    &--highlighted {
      background: var(--gutenku-zen-primary);
      color: var(--gutenku-paper-bg);

      .book-dropdown__title {
        color: var(--gutenku-paper-bg);
      }

      .book-dropdown__author {
        color: oklch(1 0 0 / 0.7);
      }
    }
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .book-dropdown__item {
    transition: none;

    &:hover,
    &--highlighted {
      transform: none;
    }
  }

  .zen-dropdown-enter-active,
  .zen-dropdown-leave-active {
    transition: none;
  }
}
</style>
