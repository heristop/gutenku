<script lang="ts" setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useMediaQuery } from '@vueuse/core';
import { Search, SearchX, X as CloseIcon, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { useGameStore } from '@/features/game/store/game';
import { useTouchGestures } from '@/core/composables/touch-gestures';
import BookCard, { type CardState } from './BookCard.vue';
import SwipeHint from '@/core/components/ui/SwipeHint.vue';
import ZenButton from '@/core/components/ui/ZenButton.vue';
import ZenTooltip from '@/core/components/ui/ZenTooltip.vue';
import ZenPaginationDots from '@/core/components/ui/ZenPaginationDots.vue';
import type { BookValue } from '@gutenku/shared';

const emit = defineEmits<{
  select: [book: BookValue];
}>();

const { t } = useI18n();
const gameStore = useGameStore();
const { availableBooks, currentGame, loading, revealingCorrectBook, correctBookReference } = storeToRefs(gameStore);

const isDesktop = useMediaQuery('(min-width: 600px)');
const itemsPerPage = computed(() => isDesktop.value ? 10 : 9);

const searchQuery = ref('');
const selectedBook = ref<BookValue | null>(null);
const eliminatedBooks = ref<string[]>([]);
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

const totalPages = computed(() => Math.ceil(filteredBooks.value.length / itemsPerPage.value));
const paginatedBooks = computed(() => {
  const start = currentPage.value * itemsPerPage.value;
  return filteredBooks.value.slice(start, start + itemsPerPage.value);
});

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

function goToPage(page: number) {
  if (page >= 0 && page < totalPages.value && page !== currentPage.value) {
    pageDirection.value = page > currentPage.value ? 'next' : 'prev';
    currentPage.value = page;
  }
}

const containerRef = ref<HTMLElement | null>(null);
const { isTouchDevice } = useTouchGestures(containerRef, {
  onSwipeLeft: nextPage,
  onSwipeRight: prevPage,
  threshold: 50,
});

function handleKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement;
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
    return;
  }

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
  if (eliminatedBooks.value.includes(book.reference)) {
    return 'eliminated';
  }
  return 'normal';
}

function isCardDisabled(book: BookValue): boolean {
  return loading.value || guessedBookIds.value.has(book.reference);
}

function handleSelect(book: BookValue) {
  if (selectedBook.value?.reference === book.reference) {
    selectedBook.value = null;
  } else {
    selectedBook.value = book;
    emit('select', book);
  }
}

function handleEliminate(book: BookValue) {
  const index = eliminatedBooks.value.indexOf(book.reference);
  if (index !== -1) {
    eliminatedBooks.value.splice(index, 1);
  } else {
    eliminatedBooks.value.push(book.reference);
  }
}

function clearSearch() {
  searchQuery.value = '';
}

function revertLastEliminated() {
  eliminatedBooks.value.pop();
}

function clearSelection() {
  selectedBook.value = null;
}

defineExpose({
  selectedBook,
  clearSelection,
  revertLastEliminated,
});
</script>

<template>
  <div class="book-board">
    <div class="book-board__search">
      <div
        class="book-board__search-input"
        :class="{ 'book-board__search-input--active': searchQuery }"
      >
        <Search class="book-board__search-icon" :size="18" aria-hidden="true" />
        <label
          for="book-search"
          class="sr-only"
          >{{ t('game.searchLabel') }}</label
        >
        <input
          id="book-search"
          v-model="searchQuery"
          type="search"
          :aria-label="t('game.searchLabel')"
          :placeholder="t('game.searchPlaceholder', { count: availableBooks.length })"
          :disabled="loading"
          autocomplete="off"
          aria-describedby="search-results-status"
        />
        <!-- Screen reader live region for search results -->
        <span
          id="search-results-status"
          class="sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          <template v-if="searchQuery">
            {{ filteredBooks.length === 0
              ? t('game.noResults')
              : t('game.searchResults', { count: filteredBooks.length })
            }}
          </template>
        </span>
        <!-- Results count badge -->
        <Transition name="badge-fade">
          <span
            v-if="searchQuery && filteredBooks.length > 0"
            class="book-board__results-badge"
            aria-hidden="true"
          >
            {{ filteredBooks.length }}
          </span>
        </Transition>
        <button
          v-if="searchQuery"
          class="book-board__search-clear"
          :aria-label="t('common.close')"
          @click="clearSearch"
        >
          <CloseIcon :size="16" />
        </button>
      </div>

      <Transition name="btn-slide">
        <button
          v-if="eliminatedBooks.length > 0"
          class="book-board__reset-btn"
          :aria-label="t('game.resetEliminated')"
          @click="revertLastEliminated"
        >
          <RotateCcw :size="14" />
          <span>{{ eliminatedBooks.length }}</span>
        </button>
      </Transition>
    </div>

    <div ref="containerRef" class="book-board__container">
      <ZenTooltip :text="t('common.previous')" position="bottom">
        <ZenButton
          variant="ghost"
          size="sm"
          spring
          :disabled="currentPage === 0"
          :aria-label="t('common.previous')"
          aria-describedby="book-board-pagination"
          @click="prevPage"
        >
          <template #icon-left>
            <ChevronLeft :size="18" />
          </template>
        </ZenButton>
      </ZenTooltip>

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
          :spotlight="revealingCorrectBook && book.reference === correctBookReference"
          @select="handleSelect"
          @eliminate="handleEliminate"
        />

        <div
          v-if="filteredBooks.length === 0"
          key="empty"
          class="book-board__empty"
        >
          <div class="book-board__empty-icon-wrapper">
            <SearchX :size="36" class="book-board__empty-icon" />
          </div>
          <span class="book-board__empty-title">{{ t('game.noResults') }}</span>
          <span
            class="book-board__empty-hint"
            >{{ t('game.noResultsHint') }}</span
          >
        </div>
      </TransitionGroup>

      <ZenTooltip :text="t('common.next')" position="bottom">
        <ZenButton
          class="book-board__nav-next"
          variant="ghost"
          size="sm"
          :disabled="currentPage >= totalPages - 1"
          :aria-label="t('common.next')"
          aria-describedby="book-board-pagination"
          @click="nextPage"
        >
          <template #icon-left>
            <ChevronRight :size="18" />
          </template>
        </ZenButton>
      </ZenTooltip>
    </div>

    <div
      v-if="totalPages > 1"
      class="book-board__pagination"
      id="book-board-pagination"
    >
      <ZenPaginationDots
        :model-value="currentPage"
        :total="totalPages"
        :aria-label="t('common.pageNavigation')"
        :item-label="t('common.page')"
        @update:model-value="goToPage"
      />
      <SwipeHint v-if="isTouchDevice" variant="pill" />
    </div>

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
  margin-bottom: 0.25rem;

  @media (min-width: 600px) {
    padding: 0;
    margin-bottom: 0.5rem;
  }
}

.book-board__search-input {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.75rem;
  background: var(--gutenku-paper-bg);
  border: 1.5px solid var(--gutenku-paper-border);
  border-radius: 9999px; // Pill shape
  padding: 0.375rem 0.75rem 0.375rem 1rem;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease,
    background 0.3s ease;

  @media (min-width: 600px) {
    min-height: 3rem;
    padding: 0.5rem 1rem 0.5rem 1.25rem;
  }

  &:focus-within {
    border-color: var(--gutenku-zen-accent);
    box-shadow:
      0 0 0 3px oklch(0.76 0.04 175 / 0.15),
      0 4px 12px oklch(0.45 0.08 195 / 0.1);
    background: var(--gutenku-zen-water);
  }

  &--active {
    border-color: var(--gutenku-zen-primary);
    background: var(--gutenku-zen-water);
  }

  input {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    outline: none;
    font-family: inherit;
    font-size: 0.8125rem;
    color: var(--gutenku-text-primary);

    @media (min-width: 600px) {
      font-size: 0.875rem;
    }

    &::placeholder {
      color: var(--gutenku-text-muted);
    }

    // Hide native clear button
    &::-webkit-search-cancel-button {
      display: none;
    }
  }
}

.book-board__search-icon {
  color: var(--gutenku-text-muted);
  flex-shrink: 0;
  transition: color 0.2s ease, transform 0.2s ease;

  .book-board__search-input:focus-within & {
    color: var(--gutenku-zen-primary);
    transform: scale(1.1);
  }
}

.book-board__results-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.375rem;
  background: var(--gutenku-zen-primary);
  color: white;
  font-size: 0.6875rem;
  font-weight: 700;
  border-radius: 9999px;
  flex-shrink: 0;
}

.badge-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.badge-fade-leave-active {
  transition: all 0.2s ease-out;
}

.badge-fade-enter-from {
  opacity: 0;
  transform: scale(0.6);
}

.badge-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.book-board__search-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: var(--gutenku-text-muted);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;

  &:hover {
    background: oklch(0.5 0.02 85 / 0.15);
    color: var(--gutenku-text-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-accent);
    outline-offset: 2px;
  }
}

.book-board__reset-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  min-height: 2.25rem;
  padding: 0.375rem 0.625rem;
  background: oklch(0.6 0.18 25 / 0.1);
  border: 1px solid oklch(0.6 0.18 25 / 0.3);
  border-radius: 9999px;
  font-size: 0.75rem;
  color: oklch(0.5 0.15 25);
  cursor: pointer;
  transition: all 0.2s ease;

  @media (min-width: 600px) {
    min-height: 2.5rem;
    padding: 0.5rem 0.75rem;
    gap: 0.375rem;
  }

  &:hover {
    background: oklch(0.6 0.18 25 / 0.2);
    border-color: oklch(0.5 0.18 25 / 0.5);
    transform: scale(1.02);
  }

  &:focus-visible {
    outline: 2px solid oklch(0.6 0.18 25);
    outline-offset: 2px;
  }

  span {
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
}

.btn-slide-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-slide-leave-active {
  transition: all 0.2s ease-out;
}

.btn-slide-enter-from {
  opacity: 0;
  transform: translateX(8px) scale(0.9);
}

.btn-slide-leave-to {
  opacity: 0;
  transform: translateX(8px) scale(0.9);
}

[data-theme='dark'] .book-board__reset-btn {
  background: oklch(0.55 0.15 25 / 0.15);
  border-color: oklch(0.55 0.15 25 / 0.35);
  color: oklch(0.75 0.12 25);

  &:hover {
    background: oklch(0.55 0.15 25 / 0.25);
    border-color: oklch(0.55 0.15 25 / 0.5);
  }
}

.book-board__container {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  // Hide pagination buttons on mobile (use swipe instead)
  > :deep(.zen-btn) {
    display: none;

    @media (min-width: 600px) {
      display: flex;
    }
  }
}

.book-board__nav-next:hover:not(:disabled):not([aria-disabled='true']) :deep(svg) {
  transform: translateX(3px) !important;
}

.book-board__grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem 0.5rem;
  justify-items: center;
  align-items: start;
  min-height: 180px;

  @media (min-width: 400px) {
    gap: 0.75rem;
  }

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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem 2rem;
  animation: empty-fade-in 0.5s ease-out;
}

.book-board__empty-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  background: var(--gutenku-zen-water);
  border-radius: 50%;
  animation: empty-float 3s ease-in-out infinite;
}

.book-board__empty-icon {
  color: var(--gutenku-text-muted);
  opacity: 0.7;
}

.book-board__empty-title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--gutenku-text-secondary);
}

.book-board__empty-hint {
  font-size: 0.8125rem;
  color: var(--gutenku-text-muted);
}

@keyframes empty-fade-in {
  from {
    opacity: 0;
    transform: translateY(-12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes empty-float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

.book-board__pagination {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
}

.book-board__hint {
  text-align: center;
  font-size: 0.75rem;
  color: var(--gutenku-text-primary);
  opacity: 0.7;
}

[data-theme='dark'] .book-board__hint {
  opacity: 0.8;
}

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

@for $i from 1 through 12 {
  .zen-card-enter-active:nth-child(#{$i}) {
    transition-delay: #{($i - 1) * 0.03}s;
  }
}

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

  .book-board__empty-icon-wrapper {
    animation: none;
  }

  .badge-fade-enter-active,
  .badge-fade-leave-active,
  .btn-slide-enter-active,
  .btn-slide-leave-active {
    transition: none;
  }

  .book-board__search-icon {
    transition: none;
  }
}
</style>
