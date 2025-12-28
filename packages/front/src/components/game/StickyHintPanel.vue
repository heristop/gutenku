<script lang="ts" setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { ChevronDown, ChevronUp } from 'lucide-vue-next';
import { useGameStore } from '@/store/game';
import type { PuzzleHint } from '@gutenku/shared';

const props = withDefaults(defineProps<{
  expanded?: boolean;
}>(), {
  expanded: false,
});

const emit = defineEmits<{
  'update:expanded': [value: boolean];
}>();

const { t } = useI18n();
const gameStore = useGameStore();
const { revealedHints, currentGame } = storeToRefs(gameStore);

const latestHint = computed<PuzzleHint | null>(() => {
  const hints = revealedHints.value;
  return hints.length > 0 ? hints.at(-1)! : null;
});

const attemptsRemaining = computed(() => {
  const guesses = currentGame.value?.guesses.length ?? 0;
  return 6 - guesses;
});

const hintIcons: Record<string, string> = {
  emoticons: '😀',
  haiku: '🎭',
  genre_era: '📖',
  quote: '💬',
  letter_author: '🔤',
  author_name: '👤',
};

const hintIcon = computed(() => {
  if (!latestHint.value) {return '❓';}
  return hintIcons[latestHint.value.type] || '❓';
});

const hintLabel = computed(() => {
  if (!latestHint.value) {return '';}
  const labels: Record<string, string> = {
    emoticons: t('game.hints.emoticons'),
    haiku: t('game.hints.haiku'),
    genre_era: t('game.hints.genreEra'),
    quote: t('game.hints.quote'),
    letter_author: t('game.hints.letterAuthor'),
    author_name: t('game.hints.authorName'),
  };
  return labels[latestHint.value.type] || t('game.hints.unknown');
});

// Get a preview of the hint content (truncated for compact view)
const hintPreview = computed(() => {
  if (!latestHint.value) {return '';}
  const content = latestHint.value.content;

  // For emoticons, show as-is
  if (latestHint.value.type === 'emoticons') {
    return content;
  }

  // For haiku, show first line only
  if (latestHint.value.type === 'haiku') {
    const firstLine = content.split('\n')[0];
    return `"${firstLine}..."`;
  }

  // For genre_era, show formatted
  if (latestHint.value.type === 'genre_era') {
    return content.replace('\n', ' • ');
  }

  // For quote, truncate
  if (latestHint.value.type === 'quote') {
    const maxLen = 40;
    if (content.length > maxLen) {
      return `"${content.slice(0, maxLen)}..."`;
    }
    return `"${content}"`;
  }

  // Default: truncate if too long
  const maxLen = 30;
  if (content.length > maxLen) {
    return `${content.slice(0, maxLen)}...`;
  }
  return content;
});

function toggleExpanded() {
  emit('update:expanded', !props.expanded);
}
</script>

<template>
  <div class="sticky-hint" :class="{ 'sticky-hint--expanded': expanded }">
    <button
      class="sticky-hint__header"
      :aria-expanded="expanded"
      @click="toggleExpanded"
    >
      <div class="sticky-hint__info">
        <span class="sticky-hint__icon">{{ hintIcon }}</span>
        <span class="sticky-hint__label">{{ hintLabel }}</span>
        <span class="sticky-hint__preview">{{ hintPreview }}</span>
      </div>

      <div class="sticky-hint__meta">
        <!-- Attempts indicator dots -->
        <div
          class="sticky-hint__attempts"
          :aria-label="t('game.attemptsRemaining', { count: attemptsRemaining })"
        >
          <span
            v-for="i in 6"
            :key="i"
            class="sticky-hint__dot"
            :class="{ 'sticky-hint__dot--filled': i <= attemptsRemaining }"
          />
        </div>

        <component
          :is="expanded ? ChevronUp : ChevronDown"
          :size="18"
          class="sticky-hint__chevron"
        />
      </div>
    </button>

    <!-- Expanded content -->
    <Transition name="expand">
      <div v-if="expanded && latestHint" class="sticky-hint__content">
        <div
          class="sticky-hint__full-hint"
          :class="`sticky-hint__hint--${latestHint.type}`"
        >
          <!-- Emoticons -->
          <div v-if="latestHint.type === 'emoticons'" class="emoticons-inline">
            <span
              v-for="(emoji, idx) in [...latestHint.content].filter(c => c.trim())"
              :key="idx"
              class="emoji-char"
            >
              {{ emoji }}
            </span>
          </div>

          <!-- Haiku -->
          <div v-else-if="latestHint.type === 'haiku'" class="haiku-inline">
            <p v-for="(line, idx) in latestHint.content.split('\n')" :key="idx">
              {{ line }}
            </p>
          </div>

          <!-- Genre & Era -->
          <div
            v-else-if="latestHint.type === 'genre_era'"
            class="genre-era-inline"
          >
            <span
              class="tag tag--genre"
              >{{ latestHint.content.split(/[\n,]/)[0]?.trim() }}</span
            >
            <span
              v-if="latestHint.content.split(/[\n,]/)[1]"
              class="tag tag--era"
            >
              {{ latestHint.content.split(/[\n,]/)[1]?.trim() }}
            </span>
          </div>

          <!-- Quote -->
          <div v-else-if="latestHint.type === 'quote'" class="quote-inline">
            "{{ latestHint.content }}"
          </div>

          <!-- Letter & Author -->
          <div
            v-else-if="latestHint.type === 'letter_author'"
            class="letter-author-inline"
          >
            {{ latestHint.content }}
          </div>

          <!-- Author name -->
          <div
            v-else-if="latestHint.type === 'author_name'"
            class="author-inline"
          >
            <span class="author-name">{{ latestHint.content }}</span>
          </div>

          <!-- Default -->
          <div v-else>
            {{ latestHint.content }}
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.sticky-hint {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--gutenku-paper-bg-aged);
  border-bottom: 1px solid var(--gutenku-paper-border);
  box-shadow: 0 2px 8px oklch(0 0 0 / 0.05);
  transition: box-shadow 0.2s ease;

  &--expanded {
    box-shadow: 0 4px 16px oklch(0 0 0 / 0.1);
  }
}

.sticky-hint__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: oklch(0.5 0.05 55 / 0.05);
  }
}

.sticky-hint__info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  flex: 1;
}

.sticky-hint__icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.sticky-hint__label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gutenku-text-muted);
  flex-shrink: 0;
}

.sticky-hint__preview {
  font-size: 0.85rem;
  color: var(--gutenku-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.8;
}

.sticky-hint__meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.sticky-hint__attempts {
  display: flex;
  gap: 0.25rem;
}

.sticky-hint__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: oklch(0.88 0.03 65);
  border: 1px solid oklch(0.75 0.04 60);
  transition: all 0.2s ease;

  &--filled {
    background: var(--gutenku-zen-primary);
    border-color: var(--gutenku-zen-primary);
  }
}

[data-theme='dark'] .sticky-hint__dot {
  background: oklch(0.35 0.03 60);
  border-color: oklch(0.45 0.03 55);

  &--filled {
    background: var(--gutenku-zen-primary);
    border-color: var(--gutenku-zen-primary);
  }
}

.sticky-hint__chevron {
  color: var(--gutenku-text-muted);
  transition: transform 0.2s ease;
}

.sticky-hint__content {
  padding: 0 1rem 1rem;
  overflow: hidden;
}

.sticky-hint__full-hint {
  padding: 1rem;
  background: oklch(0.93 0.025 68);
  border-radius: var(--gutenku-radius-md);
  text-align: center;
}

[data-theme='dark'] .sticky-hint__full-hint {
  background: oklch(0.25 0.02 65);
}

// Inline hint styles
.emoticons-inline {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;

  .emoji-char {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    aspect-ratio: 1;
    font-size: 1.5rem;
    background: oklch(0.96 0.02 70);
    border-radius: var(--gutenku-radius-sm);
    border: 1px solid oklch(0.80 0.03 65);
  }
}

[data-theme='dark'] .emoticons-inline .emoji-char {
  background: oklch(0.22 0.02 65);
  border-color: oklch(0.35 0.03 60);
}

.haiku-inline {
  font-style: italic;
  line-height: 1.8;

  p {
    margin: 0;
  }
}

.genre-era-inline {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;

  .tag {
    padding: 0.375rem 0.75rem;
    border-radius: var(--gutenku-radius-sm);
    font-size: 0.85rem;
    font-weight: 500;
  }

  .tag--genre {
    background: oklch(0.90 0.04 65);
    color: oklch(0.40 0.06 55);
  }

  .tag--era {
    background: oklch(0.87 0.03 70);
    color: oklch(0.42 0.05 60);
  }
}

[data-theme='dark'] .genre-era-inline {
  .tag--genre {
    background: oklch(0.30 0.04 60);
    color: oklch(0.85 0.03 65);
  }

  .tag--era {
    background: oklch(0.28 0.03 65);
    color: oklch(0.82 0.03 70);
  }
}

.quote-inline {
  font-family: Georgia, 'Times New Roman', serif;
  font-style: italic;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--gutenku-text-primary);
}

.letter-author-inline {
  font-size: 1rem;
  color: var(--gutenku-text-primary);
}

.author-inline {
  .author-name {
    font-family: 'Brush Script MT', 'Segoe Script', cursive, Georgia, serif;
    font-size: 1.5rem;
    color: oklch(0.50 0.08 50);
  }
}

[data-theme='dark'] .author-inline .author-name {
  color: oklch(0.75 0.06 55);
}

// Expand transition
.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 200px;
}

@media (prefers-reduced-motion: reduce) {
  .sticky-hint,
  .sticky-hint__chevron,
  .sticky-hint__dot {
    transition: none;
  }

  .expand-enter-active,
  .expand-leave-active {
    transition: none;
  }
}
</style>
