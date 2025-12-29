<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { BookOpen, Clock } from 'lucide-vue-next';
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
      <!-- Famous quote with gradient reveal -->
      <template v-else-if="isQuote">
        <div class="quote-container">
          <p class="quote-text">{{ hint.content }}</p>
        </div>
      </template>
      <!-- First Letter & Nationality display - unified clue card -->
      <template v-else-if="isLetterAuthor">
        <div class="letter-author-container">
          <!-- Clue card with corner fold -->
          <div class="clue-card">
            <div v-if="letterAuthorData.letter" class="letter-char">
              {{ letterAuthorData.letter }}
            </div>
            <span v-if="letterAuthorData.nationality" class="nationality-text">
              {{ letterAuthorData.nationality }} {{ t('game.hints.author') }}
            </span>
            <!-- Fallback: show raw content if parsing failed -->
            <p
              v-if="!letterAuthorData.letter && !letterAuthorData.nationality"
              class="hint-text"
            >
              {{ hint.content }}
            </p>
          </div>
        </div>
      </template>
      <!-- Author's First Name - final hint with signature reveal -->
      <template v-else-if="isAuthorName">
        <div class="author-name-container">
          <span class="author-name">{{ hint.content }}</span>
          <div class="signature-line" aria-hidden="true" />
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
  padding: 0.5rem 0.75rem;
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

// Emoticons - paper slip reveal
.emoticons-grid {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
}

.emoticon-bubble {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  font-size: 1.5rem;
  background: linear-gradient(
    135deg,
    var(--gutenku-paper-bg) 0%,
    var(--gutenku-paper-bg-aged) 100%
  );
  border: 1px solid var(--gutenku-paper-border);
  border-radius: var(--gutenku-radius-sm);
  // Torn paper edge effect
  clip-path: polygon(2% 0, 100% 0, 98% 100%, 0 100%);
  opacity: 0;
  animation: slip-reveal 0.35s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
  animation-delay: calc(var(--index) * 80ms + 100ms);
  transition: filter 0.2s ease;

  &:hover {
    filter: drop-shadow(0 2px 4px oklch(0 0 0 / 0.15));
  }
}

[data-theme='dark'] .emoticon-bubble {
  background: linear-gradient(
    135deg,
    oklch(0.25 0.02 55) 0%,
    oklch(0.22 0.025 50) 100%
  );

  &:hover {
    filter: drop-shadow(0 2px 6px oklch(0 0 0 / 0.3));
  }
}

@keyframes slip-reveal {
  0% {
    opacity: 0;
    transform: translateY(12px) rotate(-3deg);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotate(0deg);
  }
}

// Haiku zen aesthetic - ink brushstroke reveal
.haiku-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.25rem;
  background: linear-gradient(
    135deg,
    var(--gutenku-zen-water) 0%,
    transparent 100%
  );
  border-radius: var(--gutenku-radius-md);
  border-left: 3px solid var(--gutenku-zen-accent);
}

.haiku-verses {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.haiku-line {
  font-style: italic;
  font-size: 1.15rem;
  line-height: 2;
  color: var(--gutenku-text-primary);
  margin: 0;
  text-shadow: 0 0 1px var(--gutenku-text-primary);
  clip-path: inset(0 100% 0 0);
  animation: verse-write 0.45s ease-out forwards;
  animation-delay: calc(var(--line-index) * 250ms + 150ms);

  &:nth-child(2) {
    padding-left: 1rem;
  }

  &:nth-child(3) {
    padding-left: 0.5rem;
  }
}

@keyframes verse-write {
  to {
    clip-path: inset(0 0 0 0);
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
  animation: seal-stamp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  // Delay: wait for all 3 verses (3 * 250ms + 150ms base + 200ms buffer)
  animation-delay: 1.1s;
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
    transform: rotate(5deg) scale(1.4);
  }
  100% {
    opacity: 1;
    transform: rotate(5deg) scale(1);
  }
}

// Genre & Era - catalog cards
.genre-era-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.625rem;
  padding: 0.5rem 0;
}

.genre-era-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 1.25rem;
  background: var(--gutenku-zen-water);
  border: 1px solid var(--gutenku-paper-border);
  border-left: 3px solid var(--gutenku-zen-accent);
  border-radius: var(--gutenku-radius-sm);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--gutenku-zen-primary);
  opacity: 0;
  animation: card-file 0.4s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
  animation-delay: calc(var(--tag-index) * 150ms + 100ms);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px oklch(0.45 0.08 195 / 0.12);
  }
}

.tag-icon {
  flex-shrink: 0;
  color: var(--gutenku-zen-accent);
}

.tag-label {
  white-space: nowrap;
}

@keyframes card-file {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  70% {
    transform: translateX(4px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

// Dark mode for genre-era
[data-theme='dark'] .genre-era-tag {
  background: oklch(0.25 0.03 195 / 0.4);
  border-color: oklch(0.4 0.04 195 / 0.5);
  color: oklch(0.9 0.04 195);

  &:hover {
    box-shadow: 0 2px 8px oklch(0.45 0.08 195 / 0.2);
  }
}

[data-theme='dark'] .tag-icon {
  color: oklch(0.7 0.1 195);
}

// Famous Quote - gradient text reveal
.quote-container {
  position: relative;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(
    135deg,
    var(--gutenku-paper-bg-aged) 0%,
    var(--gutenku-paper-bg) 100%
  );
  border-radius: var(--gutenku-radius-md);
  border-left: 2px solid var(--gutenku-zen-accent);
  animation: container-emerge 0.3s ease-out;
}

@keyframes container-emerge {
  0% {
    opacity: 0;
    transform: translateY(4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.quote-text {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.05rem;
  font-style: italic;
  line-height: 1.7;
  margin: 0;
  text-align: left;
  color: var(--gutenku-text-primary);
  animation: text-reveal 1.2s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
  animation-delay: 0.15s;

  // Inline quote marks
  &::before {
    content: '\201C';
    color: var(--gutenku-zen-accent);
    margin-right: 0.125rem;
  }

  &::after {
    content: '\201D';
    color: var(--gutenku-zen-accent);
    margin-left: 0.125rem;
  }
}

@keyframes text-reveal {
  0% {
    opacity: 0;
    filter: blur(4px);
  }
  100% {
    opacity: 1;
    filter: blur(0);
  }
}

[data-theme='dark'] .quote-container {
  background: linear-gradient(
    135deg,
    oklch(0.22 0.02 55 / 0.6) 0%,
    oklch(0.18 0.015 45 / 0.4) 100%
  );
}

// First Letter & Nationality - unified clue card
.letter-author-container {
  display: flex;
  justify-content: center;
  padding: 0.5rem 0;
}

.clue-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 2rem;
  background: var(--gutenku-paper-bg);
  border: 1px solid var(--gutenku-paper-border);
  border-radius: var(--gutenku-radius-md);
  animation: card-unfold 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);

  // Corner fold decoration
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 1.5rem;
    height: 1.5rem;
    background: linear-gradient(
      135deg,
      transparent 50%,
      var(--gutenku-paper-border) 50%
    );
  }
}

@keyframes card-unfold {
  0% {
    opacity: 0;
    transform: scale(0.95) rotateX(5deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotateX(0);
  }
}

.letter-char {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 2rem;
  font-weight: 600;
  color: var(--gutenku-zen-primary);
  background: var(--gutenku-zen-water);
  border-radius: var(--gutenku-radius-full);
  opacity: 0;
  animation: letter-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: 0.15s;
}

@keyframes letter-pop {
  0% {
    opacity: 0;
    transform: scale(0.7);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.nationality-text {
  font-size: 0.9rem;
  color: var(--gutenku-text-secondary);
  opacity: 0;
  animation: fade-up 0.35s ease-out forwards;
  animation-delay: 0.35s;
}

@keyframes fade-up {
  0% {
    opacity: 0;
    transform: translateY(4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

// Dark mode for letter-author
[data-theme='dark'] .clue-card {
  background: oklch(0.22 0.02 55);

  &::before {
    background: linear-gradient(
      135deg,
      transparent 50%,
      oklch(0.35 0.02 55) 50%
    );
  }
}

[data-theme='dark'] .letter-char {
  background: oklch(0.28 0.04 195);
  color: oklch(0.92 0.04 195);
}

// Author's First Name - CLIMAX signature reveal
.author-name-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  padding: 1.5rem 2rem;
  background: radial-gradient(
    ellipse at center,
    var(--gutenku-zen-water) 0%,
    transparent 70%
  );
  animation: spotlight-glow 0.6s ease-out;
}

@keyframes spotlight-glow {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.author-name {
  font-family: Georgia, 'Times New Roman', serif;
  font-style: italic;
  font-size: 2rem;
  font-weight: 500;
  color: var(--gutenku-zen-primary);
  letter-spacing: 0.03em;
  opacity: 0;
  animation: signature-write 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
  animation-delay: 0.3s;
}

@keyframes signature-write {
  0% {
    opacity: 0;
    transform: translateY(8px);
    filter: blur(4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

.signature-line {
  width: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--gutenku-zen-accent),
    transparent
  );
  animation: line-draw 0.5s ease-out forwards;
  animation-delay: 1s;
}

@keyframes line-draw {
  to {
    width: 100%;
  }
}

.author-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gutenku-text-secondary);
  opacity: 0;
  animation: fade-in-up 0.4s ease-out forwards;
  animation-delay: 1.2s;
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
[data-theme='dark'] .author-name-container {
  background: radial-gradient(
    ellipse at center,
    oklch(0.25 0.03 195 / 0.5) 0%,
    transparent 70%
  );
}

[data-theme='dark'] .author-name {
  color: oklch(0.92 0.04 195);
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
  .haiku-seal,
  .emoticon-bubble,
  .genre-era-tag,
  .quote-container,
  .quote-text,
  .clue-card,
  .letter-char,
  .nationality-text,
  .author-name-container,
  .author-name,
  .signature-line,
  .author-label {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
    clip-path: none !important;
  }

  .haiku-seal {
    transform: rotate(5deg) !important;
  }

  .signature-line {
    width: 100% !important;
  }

  .emoticon-bubble:hover,
  .genre-era-tag:hover {
    transform: none;
  }
}
</style>
