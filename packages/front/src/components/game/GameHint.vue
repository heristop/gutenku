<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { BookOpen, Clock, Globe, Feather } from 'lucide-vue-next';
import type { PuzzleHint } from '@gutenku/shared';

const props = defineProps<{
  hint: PuzzleHint;
  round: number;
}>();

const { t } = useI18n();

const hintIcon = computed(() => {
  const icons: Record<string, string> = {
    emoticons: '😀',
    haiku: '🎭',
    genre_era: '📖',
    quote: '💬',
    letter_author: '🔤',
    author_name: '👤',
  };
  return icons[props.hint.type] || '❓';
});

const hintLabel = computed(() => {
  const labels: Record<string, string> = {
    emoticons: t('game.hints.emoticons'),
    haiku: t('game.hints.haiku'),
    genre_era: t('game.hints.genreEra'),
    quote: t('game.hints.quote'),
    letter_author: t('game.hints.letterAuthor'),
    author_name: t('game.hints.authorName'),
  };
  return labels[props.hint.type] || t('game.hints.unknown');
});

const isHaiku = computed(() => props.hint.type === 'haiku');
const isEmoticons = computed(() => props.hint.type === 'emoticons');
const isGenreEra = computed(() => props.hint.type === 'genre_era');
const isQuote = computed(() => props.hint.type === 'quote');
const isLetterAuthor = computed(() => props.hint.type === 'letter_author');
const isAuthorName = computed(() => props.hint.type === 'author_name');

// Split emoticons into individual characters for animated display
const emoticonsArray = computed(() => {
  if (!isEmoticons.value) {return [];}
  // Use spread to properly handle emoji (including multi-codepoint ones)
  return [...props.hint.content].filter((char) => char.trim());
});

// Parse genre and era from content (format: "Genre, Era" or "Genre\nEra")
const genreEraData = computed(() => {
  if (!isGenreEra.value) {return { genre: '', era: '' };}
  const content = props.hint.content;
  // Try splitting by newline first, then comma
  const parts = content.includes('\n')
    ? content.split('\n').map((s) => s.trim())
    : content.split(',').map((s) => s.trim());
  return {
    genre: parts[0] || content,
    era: parts[1] || '',
  };
});

// Parse first letter and nationality (format: "P... by a Scottish author")
const letterAuthorData = computed(() => {
  if (!isLetterAuthor.value) {return { letter: '', nationality: '' };}
  const content = props.hint.content;

  // Format: "P... by a Scottish author" or "A... by an American author"
  const letterMatch = content.match(/^([A-Z])\.\.\./i);
  const nationalityMatch = content.match(/by an? (.+?) author/i);

  return {
    letter: letterMatch ? letterMatch[1].toUpperCase() : content.charAt(0).toUpperCase(),
    nationality: nationalityMatch ? nationalityMatch[1] : '',
  };
});
</script>

<template>
  <div class="game-hint">
    <div class="hint-header d-flex align-center justify-space-between mb-3">
      <div class="hint-type d-flex align-center ga-2">
        <span class="hint-icon">{{ hintIcon }}</span>
        <span class="hint-label gutenku-text-muted">{{ hintLabel }}</span>
      </div>
      <div class="round-indicator gutenku-text-muted">{{ round }}/6</div>
    </div>

    <div
      class="hint-content"
      :class="{
        'hint-emoticons': isEmoticons,
        'hint-haiku': isHaiku,
        'hint-genre-era': isGenreEra,
        'hint-quote': isQuote,
        'hint-letter-author': isLetterAuthor,
        'hint-author-name': isAuthorName,
      }"
    >
      <!-- Emoticons display as individual bubbles -->
      <template v-if="isEmoticons">
        <div class="emoticons-grid">
          <span
            v-for="(emoji, index) in emoticonsArray"
            :key="index"
            class="emoticon-bubble"
            :style="{ '--index': index }"
          >
            {{ emoji }}
          </span>
        </div>
      </template>
      <!-- Haiku display with zen aesthetic -->
      <template v-else-if="isHaiku">
        <div class="haiku-container">
          <!-- Decorative brush stroke accent -->
          <div class="haiku-accent" aria-hidden="true" />
          <div class="haiku-verses">
            <p
              v-for="(line, index) in hint.content.split('\n')"
              :key="index"
              class="haiku-line"
              :style="{ '--line-index': index }"
            >
              {{ line }}
            </p>
          </div>
          <!-- Decorative seal/stamp -->
          <div class="haiku-seal" aria-hidden="true">詩</div>
        </div>
      </template>
      <!-- Genre & Era display with tags -->
      <template v-else-if="isGenreEra">
        <div class="genre-era-container">
          <div class="genre-era-tag genre-tag" style="--tag-index: 0">
            <BookOpen :size="16" class="tag-icon" />
            <span class="tag-label">{{ genreEraData.genre }}</span>
          </div>
          <div
            v-if="genreEraData.era"
            class="genre-era-tag era-tag"
            style="--tag-index: 1"
          >
            <Clock :size="16" class="tag-icon" />
            <span class="tag-label">{{ genreEraData.era }}</span>
          </div>
        </div>
      </template>
      <!-- Famous quote with typewriter effect -->
      <template v-else-if="isQuote">
        <div class="quote-container">
          <span class="quote-mark quote-mark--open" aria-hidden="true">"</span>
          <p class="quote-text">
            <span
              v-for="(char, index) in hint.content"
              :key="index"
              class="quote-char"
              :style="{ '--char-index': index }"
              >{{ char }}</span
            >
          </p>
          <span class="quote-mark quote-mark--close" aria-hidden="true">"</span>
        </div>
      </template>
      <!-- First Letter & Nationality display -->
      <template v-else-if="isLetterAuthor">
        <div class="letter-author-container">
          <!-- Large letter display -->
          <div v-if="letterAuthorData.letter" class="letter-display">
            <span class="letter-char">{{ letterAuthorData.letter }}</span>
            <span class="letter-label">{{ t('game.hints.firstLetter') }}</span>
          </div>
          <!-- Nationality badge -->
          <div v-if="letterAuthorData.nationality" class="nationality-badge">
            <Globe :size="16" class="nationality-icon" />
            <span
              class="nationality-text"
              >{{ letterAuthorData.nationality }}</span
            >
          </div>
          <!-- Fallback: show raw content if parsing failed -->
          <p
            v-if="!letterAuthorData.letter && !letterAuthorData.nationality"
            class="hint-text"
          >
            {{ hint.content }}
          </p>
        </div>
      </template>
      <!-- Author's First Name - final hint with dramatic reveal -->
      <template v-else-if="isAuthorName">
        <div class="author-name-container">
          <div class="author-name-card">
            <Feather :size="20" class="author-icon" />
            <span class="author-name">{{ hint.content }}</span>
          </div>
          <span
            class="author-label"
            >{{ t('game.hints.authorFirstName') }}</span
          >
        </div>
      </template>
      <!-- Default text display -->
      <template v-else>
        <p class="hint-text">{{ hint.content }}</p>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.game-hint {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--gutenku-paper-border);
  animation: hint-reveal 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  transition: background-color 0.3s ease;

  &:hover {
    background: oklch(0.5 0.05 55 / 0.03);
  }
}

[data-theme='dark'] .game-hint:hover {
  background: oklch(1 0 0 / 0.02);
}

@keyframes hint-reveal {
  0% {
    opacity: 0;
    transform: translateY(-8px);
    filter: blur(2px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

.hint-icon {
  font-size: 1.25rem;
}

.hint-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gutenku-text-primary);
}

.round-indicator {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gutenku-zen-primary);
}

.hint-content {
  text-align: center;
}

// Emoticons grid layout
.emoticons-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.emoticon-bubble {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  font-size: 1.75rem;
  background: var(--gutenku-zen-water);
  border: 1px solid var(--gutenku-paper-border);
  border-radius: var(--gutenku-radius-md);
  box-shadow:
    0 2px 4px oklch(0 0 0 / 0.05),
    inset 0 1px 0 oklch(1 0 0 / 0.5);
  opacity: 0;
  transform: scale(0.5) translateY(-10px);
  animation: emoticon-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: calc(var(--index) * 0.08s + 0.1s);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: scale(1.1) translateY(-2px);
    box-shadow:
      0 4px 8px oklch(0 0 0 / 0.1),
      inset 0 1px 0 oklch(1 0 0 / 0.5);
  }
}

[data-theme='dark'] .emoticon-bubble {
  box-shadow:
    0 2px 4px oklch(0 0 0 / 0.2),
    inset 0 1px 0 oklch(1 0 0 / 0.1);

  &:hover {
    box-shadow:
      0 4px 8px oklch(0 0 0 / 0.3),
      inset 0 1px 0 oklch(1 0 0 / 0.1);
  }
}

@keyframes emoticon-pop {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(-10px);
  }
  70% {
    transform: scale(1.1) translateY(0);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

// Haiku zen aesthetic
.haiku-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(
    135deg,
    var(--gutenku-zen-water) 0%,
    transparent 100%
  );
  border-radius: var(--gutenku-radius-md);
  border-left: 3px solid var(--gutenku-zen-accent);
}

.haiku-accent {
  position: absolute;
  left: -1px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  background: linear-gradient(
    180deg,
    transparent 0%,
    var(--gutenku-zen-accent) 20%,
    var(--gutenku-zen-accent) 80%,
    transparent 100%
  );
  border-radius: 2px;
  opacity: 0;
  animation: accent-fade 0.6s ease-out 0.3s forwards;
}

@keyframes accent-fade {
  to {
    opacity: 1;
  }
}

.haiku-verses {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.haiku-line {
  font-style: italic;
  font-size: 1.15rem;
  line-height: 1.9;
  color: var(--gutenku-text-primary);
  margin: 0;
  opacity: 0;
  transform: translateX(-8px);
  animation: ink-brush 0.5s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
  animation-delay: calc(var(--line-index) * 0.2s + 0.1s);

  &:nth-child(2) {
    padding-left: 1rem;
  }

  &:nth-child(3) {
    padding-left: 0.5rem;
  }
}

@keyframes ink-brush {
  0% {
    opacity: 0;
    transform: translateX(-8px);
    filter: blur(2px);
  }
  60% {
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
    filter: blur(0);
  }
}

.haiku-seal {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: oklch(0.45 0.15 25);
  background: oklch(0.55 0.18 25 / 0.12);
  border: 1px solid oklch(0.55 0.18 25 / 0.2);
  border-radius: 4px;
  transform: rotate(5deg);
  opacity: 0;
  animation: seal-stamp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: 0.8s;
  flex-shrink: 0;
}

[data-theme='dark'] .haiku-seal {
  color: oklch(0.7 0.12 25);
  background: oklch(0.55 0.15 25 / 0.15);
  border-color: oklch(0.55 0.15 25 / 0.25);
}

@keyframes seal-stamp {
  0% {
    opacity: 0;
    transform: rotate(5deg) scale(1.5);
  }
  100% {
    opacity: 1;
    transform: rotate(5deg) scale(1);
  }
}

// Genre & Era chips
.genre-era-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.genre-era-tag {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--gutenku-radius-md);
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  opacity: 0;
  transform: translateY(8px) scale(0.96);
  animation: chip-reveal 0.5s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
  animation-delay: calc(var(--tag-index) * 0.12s + 0.1s);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
  overflow: hidden;

  // Subtle inner shine
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      oklch(1 0 0 / 0.15) 0%,
      transparent 50%
    );
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-2px) scale(1.02);
  }
}

.tag-icon {
  flex-shrink: 0;
  position: relative;
}

.tag-label {
  white-space: nowrap;
  position: relative;
}

// Genre chip (warm amber gradient)
.genre-tag {
  background: linear-gradient(
    135deg,
    oklch(0.92 0.06 50) 0%,
    oklch(0.88 0.08 60) 100%
  );
  border: 1px solid oklch(0.78 0.1 55 / 0.5);
  color: oklch(0.35 0.1 50);
  box-shadow:
    0 2px 8px oklch(0.6 0.15 55 / 0.15),
    inset 0 -1px 0 oklch(0 0 0 / 0.05);

  .tag-icon {
    color: oklch(0.5 0.15 55);
  }

  &:hover {
    box-shadow:
      0 4px 16px oklch(0.6 0.15 55 / 0.25),
      inset 0 -1px 0 oklch(0 0 0 / 0.05);
  }
}

// Era chip (cool blue gradient)
.era-tag {
  background: linear-gradient(
    135deg,
    oklch(0.92 0.05 220) 0%,
    oklch(0.88 0.07 240) 100%
  );
  border: 1px solid oklch(0.78 0.08 230 / 0.5);
  color: oklch(0.35 0.08 230);
  box-shadow:
    0 2px 8px oklch(0.6 0.12 230 / 0.15),
    inset 0 -1px 0 oklch(0 0 0 / 0.05);

  .tag-icon {
    color: oklch(0.5 0.12 230);
  }

  &:hover {
    box-shadow:
      0 4px 16px oklch(0.6 0.12 230 / 0.25),
      inset 0 -1px 0 oklch(0 0 0 / 0.05);
  }
}

// Dark mode
[data-theme='dark'] {
  .genre-tag {
    background: linear-gradient(
      135deg,
      oklch(0.32 0.08 50) 0%,
      oklch(0.28 0.1 60) 100%
    );
    border-color: oklch(0.45 0.1 55 / 0.5);
    color: oklch(0.9 0.06 55);
    box-shadow:
      0 2px 8px oklch(0 0 0 / 0.3),
      0 0 0 1px oklch(1 0 0 / 0.03) inset;

    .tag-icon {
      color: oklch(0.75 0.12 55);
    }

    &:hover {
      box-shadow:
        0 4px 16px oklch(0.5 0.15 55 / 0.3),
        0 0 0 1px oklch(1 0 0 / 0.05) inset;
    }
  }

  .era-tag {
    background: linear-gradient(
      135deg,
      oklch(0.32 0.06 220) 0%,
      oklch(0.28 0.08 240) 100%
    );
    border-color: oklch(0.45 0.08 230 / 0.5);
    color: oklch(0.9 0.05 230);
    box-shadow:
      0 2px 8px oklch(0 0 0 / 0.3),
      0 0 0 1px oklch(1 0 0 / 0.03) inset;

    .tag-icon {
      color: oklch(0.75 0.1 230);
    }

    &:hover {
      box-shadow:
        0 4px 16px oklch(0.5 0.12 230 / 0.3),
        0 0 0 1px oklch(1 0 0 / 0.05) inset;
    }
  }

  .genre-era-tag::before {
    background: linear-gradient(
      180deg,
      oklch(1 0 0 / 0.08) 0%,
      transparent 50%
    );
  }
}

@keyframes chip-reveal {
  0% {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

// Famous Quote with typewriter effect
.quote-container {
  position: relative;
  padding: 1rem 2rem;
  background: linear-gradient(
    135deg,
    var(--gutenku-zen-water) 0%,
    oklch(0.97 0.01 55 / 0.5) 100%
  );
  border-radius: var(--gutenku-radius-md);
  border: 1px solid var(--gutenku-paper-border);
}

.quote-mark {
  position: absolute;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1;
  color: var(--gutenku-zen-accent);
  opacity: 0.25;
  user-select: none;

  &--open {
    top: 0.25rem;
    left: 0.5rem;
  }

  &--close {
    bottom: -0.5rem;
    right: 0.5rem;
  }
}

.quote-text {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.1rem;
  font-style: italic;
  line-height: 1.7;
  color: var(--gutenku-text-primary);
  margin: 0;
  text-align: left;
}

.quote-char {
  opacity: 0;
  animation: typewriter-char 0.03s ease-out forwards;
  animation-delay: calc(var(--char-index) * 0.025s + 0.2s);
}

@keyframes typewriter-char {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

// Add blinking cursor at the end
.quote-text::after {
  content: '|';
  font-style: normal;
  font-weight: 300;
  color: var(--gutenku-zen-accent);
  animation: cursor-blink 0.8s ease-in-out infinite;
  animation-delay: calc(var(--total-chars, 100) * 0.025s + 0.5s);
}

@keyframes cursor-blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

[data-theme='dark'] .quote-container {
  background: linear-gradient(
    135deg,
    oklch(0.22 0.02 55 / 0.5) 0%,
    oklch(0.2 0.015 45 / 0.3) 100%
  );
}

// First Letter & Nationality
.letter-author-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 0.5rem 0;
}

.letter-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  opacity: 0;
  transform: scale(0.8);
  animation: letter-reveal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: 0.1s;
}

.letter-char {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--gutenku-zen-primary);
  background: linear-gradient(
    145deg,
    oklch(0.98 0.01 55) 0%,
    oklch(0.94 0.03 55) 100%
  );
  border: 2px solid var(--gutenku-zen-accent);
  border-radius: var(--gutenku-radius-md);
  box-shadow:
    0 4px 12px oklch(0.5 0.1 55 / 0.15),
    inset 0 2px 0 oklch(1 0 0 / 0.5);
  text-shadow: 0 1px 2px oklch(0 0 0 / 0.1);
}

.letter-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gutenku-text-muted);
}

.nationality-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: linear-gradient(
    135deg,
    oklch(0.92 0.04 160) 0%,
    oklch(0.88 0.06 180) 100%
  );
  border: 1px solid oklch(0.78 0.08 170 / 0.5);
  border-radius: var(--gutenku-radius-md);
  box-shadow:
    0 2px 8px oklch(0.5 0.1 170 / 0.15),
    inset 0 1px 0 oklch(1 0 0 / 0.3);
  opacity: 0;
  transform: translateX(-10px);
  animation: nationality-slide 0.4s ease-out forwards;
  animation-delay: 0.3s;
}

.nationality-icon {
  color: oklch(0.45 0.12 170);
}

.nationality-text {
  font-size: 0.95rem;
  font-weight: 500;
  color: oklch(0.35 0.08 170);
}

@keyframes letter-reveal {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes nationality-slide {
  0% {
    opacity: 0;
    transform: translateX(-10px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

// Dark mode for letter-author
[data-theme='dark'] {
  .letter-char {
    background: linear-gradient(
      145deg,
      oklch(0.3 0.03 55) 0%,
      oklch(0.25 0.04 55) 100%
    );
    color: oklch(0.9 0.06 55);
    box-shadow:
      0 4px 12px oklch(0 0 0 / 0.3),
      inset 0 1px 0 oklch(1 0 0 / 0.1);
  }

  .nationality-badge {
    background: linear-gradient(
      135deg,
      oklch(0.3 0.05 160) 0%,
      oklch(0.25 0.06 180) 100%
    );
    border-color: oklch(0.45 0.08 170 / 0.5);
    box-shadow:
      0 2px 8px oklch(0 0 0 / 0.3),
      inset 0 1px 0 oklch(1 0 0 / 0.05);
  }

  .nationality-icon {
    color: oklch(0.7 0.1 170);
  }

  .nationality-text {
    color: oklch(0.88 0.05 170);
  }
}

// Author's First Name - Final hint with signature style
.author-name-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0;
}

.author-name-card {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(
    135deg,
    oklch(0.97 0.02 300) 0%,
    oklch(0.94 0.04 330) 100%
  );
  border: 1px solid oklch(0.8 0.08 315 / 0.4);
  border-radius: var(--gutenku-radius-md);
  box-shadow:
    0 4px 16px oklch(0.6 0.15 315 / 0.15),
    inset 0 1px 0 oklch(1 0 0 / 0.4);
  opacity: 0;
  transform: scale(0.9);
  animation: author-reveal 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: 0.15s;
}

.author-icon {
  color: oklch(0.5 0.15 315);
  opacity: 0;
  transform: rotate(-20deg);
  animation: feather-write 0.5s ease-out forwards;
  animation-delay: 0.4s;
}

@keyframes feather-write {
  0% {
    opacity: 0;
    transform: rotate(-20deg) translateX(-5px);
  }
  100% {
    opacity: 1;
    transform: rotate(0deg) translateX(0);
  }
}

.author-name {
  font-family: 'Brush Script MT', 'Segoe Script', cursive, Georgia, serif;
  font-size: 1.75rem;
  font-weight: 400;
  color: oklch(0.3 0.1 315);
  letter-spacing: 0.02em;
}

.author-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gutenku-text-muted);
  opacity: 0;
  animation: fade-in-up 0.4s ease-out forwards;
  animation-delay: 0.5s;
}

@keyframes author-reveal {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

// Dark mode for author name
[data-theme='dark'] .author-name-card {
  background: linear-gradient(
    135deg,
    oklch(0.28 0.04 300) 0%,
    oklch(0.24 0.06 330) 100%
  );
  border-color: oklch(0.45 0.1 315 / 0.4);
  box-shadow:
    0 4px 16px oklch(0 0 0 / 0.3),
    inset 0 1px 0 oklch(1 0 0 / 0.08);
}

[data-theme='dark'] .author-icon {
  color: oklch(0.7 0.12 315);
}

[data-theme='dark'] .author-name {
  color: oklch(0.9 0.06 315);
}

.hint-text {
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--gutenku-text-primary);
  margin: 0;
}

@media (prefers-reduced-motion: reduce) {
  .game-hint,
  .haiku-line,
  .haiku-accent,
  .haiku-seal,
  .emoticon-bubble,
  .genre-era-tag,
  .quote-char,
  .letter-display,
  .nationality-badge,
  .author-name-card,
  .author-icon,
  .author-label {
    animation: none;
    opacity: 1;
    transform: none;
    filter: none;
  }

  .haiku-seal {
    transform: rotate(5deg);
  }

  .emoticon-bubble:hover,
  .genre-era-tag:hover {
    transform: none;
  }

  .quote-text::after {
    display: none;
  }
}
</style>
