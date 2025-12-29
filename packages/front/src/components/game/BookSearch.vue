<script lang="ts" setup>
import { ref, computed, useId } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { Search, Send, Loader2 } from 'lucide-vue-next';
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

function selectBook(book: BookValue) {
  selectedBook.value = book;
  searchQuery.value = book.title || '';
  isMenuOpen.value = false;
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
  isMenuOpen.value = searchQuery.value.length > 0;
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && canSubmit.value) {
    event.preventDefault();
    submitGuess();
  }
}
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
          :placeholder="t('game.searchPlaceholder')"
          :disabled="loading || isSubmitting"
          @input="handleInput"
          @focus="isMenuOpen = searchQuery.length > 0"
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

      <v-menu
        v-model="isMenuOpen"
        :close-on-content-click="false"
        activator="parent"
        location="bottom"
        :max-height="300"
      >
        <v-list
          :id="listboxId"
          class="book-list"
          density="compact"
          role="listbox"
        >
          <v-list-item
            v-for="book in filteredBooks"
            :key="book.reference"
            class="book-item"
            role="option"
            :aria-selected="selectedBook?.reference === book.reference"
            @click="selectBook(book)"
          >
            <template #prepend>
              <span class="book-emoticons">{{ book.emoticons }}</span>
            </template>
            <v-list-item-title class="book-title">
              {{ book.title }}
            </v-list-item-title>
            <v-list-item-subtitle class="book-author">
              {{ book.author }}
            </v-list-item-subtitle>
          </v-list-item>

          <v-list-item v-if="filteredBooks.length === 0" disabled>
            <v-list-item-title class="text-center gutenku-text-muted">
              {{ t('game.noResults') }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.book-search {
  padding: 1rem 1.25rem;
  margin-bottom: 0.5rem;

  // Hide Vuetify's menu close button
  :deep(.v-menu > .v-overlay__content > .v-btn),
  :deep(.v-btn--icon),
  :deep(.v-field__clearable),
  :deep(.v-input__append),
  :deep(.v-field__append-inner) {
    display: none !important;
  }

  .search-wrapper :deep(.v-btn:not(.submit-btn)) {
    display: none !important;
  }
}

.attempts-counter {
  font-size: 0.75rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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

.book-list {
  background: var(--gutenku-paper-bg) !important;
  border: 1px solid var(--gutenku-paper-border);
  border-radius: var(--gutenku-radius-md);
  box-shadow: var(--gutenku-shadow-zen);
}

.book-item {
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    background: var(--gutenku-zen-water);
    transform: translateX(4px);
  }

  &:active {
    transform: translateX(2px);
  }
}

.book-emoticons {
  font-size: 1.25rem;
  min-width: 2.5rem;
}

.book-title {
  font-weight: 500;
  color: var(--gutenku-text-primary);
}

.book-author {
  color: var(--gutenku-text-muted);
  font-size: 0.8rem;
}

@media (prefers-reduced-motion: reduce) {
  .search-input-container,
  .book-item {
    transition: none;
  }

  .book-item:hover {
    transform: none;
  }
}
</style>
