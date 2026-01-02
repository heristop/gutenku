<script lang="ts" setup>
import { computed, type Component } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import {
  ChevronDown,
  ChevronUp,
  Smile,
  BookOpen,
  Clock,
  Quote,
  Type,
  Globe,
  User,
  Calendar,
  Hash,
  MapPin,
  Drama,
  HelpCircle,
} from 'lucide-vue-next';
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

const hintIcons: Record<string, Component> = {
  emoticons: Smile,
  genre: BookOpen,
  era: Clock,
  quote: Quote,
  first_letter: Type,
  author_nationality: Globe,
  author_name: User,
  publication_century: Calendar,
  title_word_count: Hash,
  setting: MapPin,
  protagonist: Drama,
};

const hintIcon = computed(() => {
  if (!latestHint.value) {return HelpCircle;}
  return hintIcons[latestHint.value.type] || HelpCircle;
});

const hintLabel = computed(() => {
  if (!latestHint.value) {return '';}
  const labels: Record<string, string> = {
    emoticons: t('game.hints.emoticons'),
    genre: t('game.hints.genre'),
    era: t('game.hints.era'),
    quote: t('game.hints.quote'),
    first_letter: t('game.hints.firstLetter'),
    author_nationality: t('game.hints.authorNationality'),
    author_name: t('game.hints.authorName'),
    publication_century: t('game.hints.publicationCentury'),
    title_word_count: t('game.hints.titleWordCount'),
    setting: t('game.hints.setting'),
    protagonist: t('game.hints.protagonist'),
  };
  return labels[latestHint.value.type] || t('game.hints.unknown');
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
        <component :is="hintIcon" :size="20" class="sticky-hint__icon" />
        <span class="sticky-hint__label">{{ hintLabel }}</span>
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

          <!-- Genre -->
          <div v-else-if="latestHint.type === 'genre'" class="genre-era-inline">
            <span class="tag tag--genre">{{ latestHint.content }}</span>
          </div>

          <!-- Era -->
          <div v-else-if="latestHint.type === 'era'" class="genre-era-inline">
            <span class="tag tag--era">{{ latestHint.content }}</span>
          </div>

          <!-- Quote -->
          <div v-else-if="latestHint.type === 'quote'" class="quote-inline">
            "{{ latestHint.content }}"
          </div>

          <!-- First Letter -->
          <div
            v-else-if="latestHint.type === 'first_letter'"
            class="first-letter-inline"
          >
            <span
              class="letter-circle"
              >{{ latestHint.content.charAt(0) }}</span
            >
            <span class="letter-dots">...</span>
          </div>

          <!-- Author Nationality -->
          <div
            v-else-if="latestHint.type === 'author_nationality'"
            class="nationality-inline"
          >
            <span class="nationality-text">{{ latestHint.content }}</span>
          </div>

          <!-- Author name -->
          <div
            v-else-if="latestHint.type === 'author_name'"
            class="author-inline"
          >
            <span class="author-name">{{ latestHint.content }}</span>
          </div>

          <!-- Publication century -->
          <div
            v-else-if="latestHint.type === 'publication_century'"
            class="century-inline"
          >
            <span class="tag tag--year">{{ latestHint.content }}</span>
          </div>

          <!-- Title word count -->
          <div
            v-else-if="latestHint.type === 'title_word_count'"
            class="word-count-inline"
          >
            <span class="word-count-value">{{ latestHint.content }}</span>
            <span
              class="word-count-label"
              >{{ t('game.hints.wordsInTitle') }}</span
            >
          </div>

          <!-- Setting -->
          <div v-else-if="latestHint.type === 'setting'" class="setting-inline">
            {{ latestHint.content }}
          </div>

          <!-- Protagonist -->
          <div
            v-else-if="latestHint.type === 'protagonist'"
            class="protagonist-inline"
          >
            <span class="protagonist-name">{{ latestHint.content }}</span>
            <span
              class="protagonist-label"
              >{{ t('game.hints.protagonist') }}</span
            >
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
  flex-shrink: 0;
  color: oklch(0.5 0.12 195);
  filter: drop-shadow(0 0 3px oklch(0.5 0.12 195 / 0.3));
}

[data-theme='dark'] .sticky-hint__icon {
  color: oklch(0.6 0.14 195);
  filter: drop-shadow(0 0 4px oklch(0.6 0.14 195 / 0.4));
}

.sticky-hint__label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gutenku-text-primary);
  opacity: 0.85;
  flex-shrink: 0;
}

[data-theme='dark'] .sticky-hint__label {
  opacity: 0.9;
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

.first-letter-inline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;

  .letter-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--gutenku-zen-primary);
    background: var(--gutenku-zen-water);
    border: 2px solid var(--gutenku-zen-primary);
    border-radius: var(--gutenku-radius-full);
  }

  .letter-dots {
    font-size: 1.25rem;
    color: var(--gutenku-text-muted);
    letter-spacing: 0.1em;
  }
}

[data-theme='dark'] .first-letter-inline .letter-circle {
  background: oklch(0.25 0.03 60);
  border-color: var(--gutenku-zen-accent);
}

.nationality-inline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  .nationality-text {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--gutenku-text-primary);
    padding: 0.5rem 1rem;
    background: oklch(0.96 0.02 70);
    border-left: 3px solid var(--gutenku-zen-accent);
    border-radius: var(--gutenku-radius-sm);
  }
}

[data-theme='dark'] .nationality-inline .nationality-text {
  background: oklch(0.22 0.02 65);
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

.century-inline {
  display: flex;
  justify-content: center;

  .tag--year {
    padding: 0.375rem 0.75rem;
    border-radius: var(--gutenku-radius-sm);
    font-size: 0.85rem;
    font-weight: 500;
    background: oklch(0.88 0.04 65);
    color: oklch(0.42 0.06 55);
  }
}

[data-theme='dark'] .century-inline .tag--year {
  background: oklch(0.30 0.04 60);
  color: oklch(0.85 0.03 65);
}

.word-count-inline {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;

  .word-count-value {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--gutenku-zen-primary);
  }

  .word-count-label {
    font-size: 0.7rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--gutenku-text-muted);
  }
}

.setting-inline {
  font-size: 0.95rem;
  color: var(--gutenku-text-primary);
}

.protagonist-inline {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;

  .protagonist-name {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 1.1rem;
    font-weight: 500;
    font-style: italic;
    color: var(--gutenku-zen-primary);
  }

  .protagonist-label {
    font-size: 0.7rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--gutenku-text-muted);
  }
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
