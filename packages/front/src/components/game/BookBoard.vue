<script lang="ts" setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { Search, X as CloseIcon, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { useGameStore } from '@/store/game';
import { useTouchGestures } from '@/composables/touch-gestures';
import BookCard, { type CardState } from './BookCard.vue';
import SwipeHint from '@/components/ui/SwipeHint.vue';
import type { BookValue } from '@gutenku/shared';

const ITEMS_PER_PAGE = 10; // 2 rows × 5 columns on desktop

const emit = defineEmits<{
  select: [book: BookValue];
}>();

const { t } = useI18n();
const gameStore = useGameStore();
const { availableBooks, currentGame, loading } = storeToRefs(gameStore);

const searchQuery = ref('');
const selectedBook = ref<BookValue | null>(null);
const eliminatedBooks = ref<Set<string>>(new Set());
const currentPage = ref(0);
const pageDirection = ref<'next' | 'prev'>('next');

const filteredBooks = computed(() => {
  if (!searchQuery.value.trim()) {
    return availableBooks.value;
  }

  const query = searchQuery.value.toLowerCase();
  return availableBooks.value.filter(
    (book) =>
      book.title?.toLowerCase().includes(query) ||
      book.author?.toLowerCase().includes(query),
  );
});

// Pagination
const totalPages = computed(() => Math.ceil(filteredBooks.value.length / ITEMS_PER_PAGE));
const paginatedBooks = computed(() => {
  const start = currentPage.value * ITEMS_PER_PAGE;
  return filteredBooks.value.slice(start, start + ITEMS_PER_PAGE);
});

// Reset page when search changes
watch(searchQuery, () => {
  currentPage.value = 0;
});

function nextPage() {
  if (currentPage.value < totalPages.value - 1) {
    pageDirection.value = 'next';
    currentPage.value++;
  }
}

function prevPage() {
  if (currentPage.value > 0) {
    pageDirection.value = 'prev';
    currentPage.value--;
  }
}

// Swipe navigation
const containerRef = ref<HTMLElement | null>(null);
const { isTouchDevice } = useTouchGestures(containerRef, {
  onSwipeLeft: nextPage,
  onSwipeRight: prevPage,
  threshold: 50,
});

// Keyboard navigation
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft') {
    prevPage();
  } else if (event.key === 'ArrowRight') {
    nextPage();
  }
}

onMounted(() => {
  globalThis.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  globalThis.removeEventListener('keydown', handleKeydown);
});

const guessedBookIds = computed(() => {
  if (!currentGame.value) {return new Set<string>();}
  return new Set(currentGame.value.guesses.map((g) => g.bookId));
});

function getCardState(book: BookValue): CardState {
  const guess = currentGame.value?.guesses.find((g) => g.bookId === book.reference);

  if (guess?.isCorrect) {
    return 'correct';
  }
  if (guess && !guess.isCorrect) {
    return 'wrong';
  }
  if (selectedBook.value?.reference === book.reference) {
    return 'selected';
  }
  if (eliminatedBooks.value.has(book.reference)) {
    return 'eliminated';
  }
  return 'normal';
}

function isCardDisabled(book: BookValue): boolean {
  return loading.value || guessedBookIds.value.has(book.reference);
}

function handleSelect(book: BookValue) {
  if (selectedBook.value?.reference === book.reference) {
    // Deselect if already selected
    selectedBook.value = null;
  } else {
    selectedBook.value = book;
    emit('select', book);
  }
}

function handleEliminate(book: BookValue) {
  if (eliminatedBooks.value.has(book.reference)) {
    eliminatedBooks.value.delete(book.reference);
  } else {
    eliminatedBooks.value.add(book.reference);
  }
  // Force reactivity
  eliminatedBooks.value = new Set(eliminatedBooks.value);
}

function clearSearch() {
  searchQuery.value = '';
}

function clearEliminated() {
  eliminatedBooks.value = new Set();
}

function clearSelection() {
  selectedBook.value = null;
}

// Expose methods for parent components
defineExpose({
  selectedBook,
  clearSelection,
  clearEliminated,
});
</script>

<template>
  <div class="book-board">
    <!-- Search bar -->
    <div class="book-board__search">
      <div class="book-board__search-input">
        <Search class="book-board__search-icon" :size="18" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('game.searchPlaceholder')"
          :disabled="loading"
        />
        <button
          v-if="searchQuery"
          class="book-board__search-clear"
          :aria-label="t('common.close')"
          @click="clearSearch"
        >
          <CloseIcon :size="16" />
        </button>
      </div>

      <button
        v-if="eliminatedBooks.size > 0"
        class="book-board__reset-btn"
        :aria-label="t('game.resetEliminated')"
        @click="clearEliminated"
      >
        <RotateCcw :size="16" />
        <span>{{ eliminatedBooks.size }}</span>
      </button>
    </div>

    <!-- Book grid with pagination -->
    <div ref="containerRef" class="book-board__container">
      <!-- Left chevron -->
      <button
        class="book-board__nav book-board__nav--prev"
        :disabled="currentPage === 0"
        :aria-label="t('common.previous')"
        @click="prevPage"
      >
        <ChevronLeft :size="24" />
      </button>

      <!-- Grid -->
      <TransitionGroup
        name="zen-card"
        tag="div"
        class="book-board__grid"
        :class="`book-board__grid--${pageDirection}`"
        role="grid"
        :aria-label="t('game.bookGrid')"
      >
        <BookCard
          v-for="book in paginatedBooks"
          :key="book.reference"
          :book="book"
          :state="getCardState(book)"
          :disabled="isCardDisabled(book)"
          @select="handleSelect"
          @eliminate="handleEliminate"
        />

        <div
          v-if="filteredBooks.length === 0"
          key="empty"
          class="book-board__empty"
        >
          {{ t('game.noResults') }}
        </div>
      </TransitionGroup>

      <!-- Right chevron -->
      <button
        class="book-board__nav book-board__nav--next"
        :disabled="currentPage >= totalPages - 1"
        :aria-label="t('common.next')"
        @click="nextPage"
      >
        <ChevronRight :size="24" />
      </button>
    </div>

    <!-- Page indicator + swipe hint -->
    <div v-if="totalPages > 1" class="book-board__pagination">
      <span>{{ currentPage + 1 }} / {{ totalPages }}</span>
      <SwipeHint v-if="isTouchDevice" variant="subtle" />
    </div>

    <!-- Hint for eliminate -->
    <div class="book-board__hint">
      {{ t('game.eliminateHint') }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.book-board {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.book-board__search {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0 0.5rem;

  @media (min-width: 600px) {
    padding: 0;
  }
}

.book-board__search-input {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--gutenku-zen-water);
  border: 1px solid var(--gutenku-paper-border);
  border-radius: var(--gutenku-radius-md);
  padding: 0.5rem 0.75rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:focus-within {
    border-color: var(--gutenku-zen-accent);
    box-shadow: 0 0 0 3px var(--gutenku-zen-mist);
  }

  input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-family: inherit;
    font-size: 0.875rem;
    color: var(--gutenku-text-primary);

    &::placeholder {
      color: var(--gutenku-text-muted);
    }
  }
}

.book-board__search-icon {
  color: var(--gutenku-text-muted);
  flex-shrink: 0;
}

.book-board__search-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: var(--gutenku-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--gutenku-zen-mist);
    color: var(--gutenku-text-primary);
  }
}

.book-board__reset-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: var(--gutenku-zen-water);
  border: 1px solid var(--gutenku-paper-border);
  border-radius: var(--gutenku-radius-md);
  font-size: 0.75rem;
  color: var(--gutenku-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--gutenku-zen-mist);
    color: var(--gutenku-text-primary);
    border-color: var(--gutenku-zen-accent);
  }

  span {
    font-weight: 600;
  }
}

.book-board__container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.book-board__nav {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  padding: 0;
  background: var(--gutenku-zen-water);
  border: 1px solid var(--gutenku-paper-border);
  border-radius: 50%;
  color: var(--gutenku-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--gutenku-zen-mist);
    border-color: var(--gutenku-zen-accent);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  @media (min-width: 600px) {
    width: 40px;
    height: 40px;
  }
}

.book-board__grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  justify-items: center;
  min-height: 180px;

  @media (min-width: 480px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.625rem;
    min-height: 200px;
  }

  @media (min-width: 600px) {
    grid-template-columns: repeat(5, 1fr);
    gap: 0.75rem;
    min-height: 260px;
  }
}

.book-board__empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 2rem;
  color: var(--gutenku-text-muted);
  font-style: italic;
}

.book-board__pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--gutenku-text-muted);
  padding: 0.25rem 0;
}

.book-board__hint {
  text-align: center;
  font-size: 0.7rem;
  color: var(--gutenku-text-muted);
  opacity: 0.7;
}

// Zen card transitions with staggered animation
.zen-card-move {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.zen-card-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.zen-card-leave-active {
  transition: all 0.25s ease-in;
  position: absolute;
}

// Staggered entrance delay for each card
@for $i from 1 through 12 {
  .zen-card-enter-active:nth-child(#{$i}) {
    transition-delay: #{($i - 1) * 0.03}s;
  }
}

// Direction-aware animations
.book-board__grid--next {
  .zen-card-enter-from {
    opacity: 0;
    transform: translateX(20px) scale(0.92);
    filter: blur(4px);
  }

  .zen-card-leave-to {
    opacity: 0;
    transform: translateX(-20px) scale(0.95);
    filter: blur(2px);
  }
}

.book-board__grid--prev {
  .zen-card-enter-from {
    opacity: 0;
    transform: translateX(-20px) scale(0.92);
    filter: blur(4px);
  }

  .zen-card-leave-to {
    opacity: 0;
    transform: translateX(20px) scale(0.95);
    filter: blur(2px);
  }
}

// Default state (no direction yet)
.zen-card-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.95);
  filter: blur(3px);
}

.zen-card-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

@media (prefers-reduced-motion: reduce) {
  .zen-card-move,
  .zen-card-enter-active,
  .zen-card-leave-active {
    transition: opacity 0.15s ease;
    filter: none !important;
  }

  .zen-card-enter-from,
  .zen-card-leave-to {
    transform: none;
    filter: none;
  }
}
</style>
