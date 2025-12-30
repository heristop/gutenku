<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { BookOpen, Clock, Sparkles, Calendar, MapPin, Hash } from 'lucide-vue-next';
import type { PuzzleHint } from '@gutenku/shared';
import ScoreStars from '@/components/ui/ScoreStars.vue';

const props = withDefaults(
  defineProps<{
    hint: PuzzleHint;
    round: number;
    /** Visible emoticon count including scratched */
    visibleEmoticonCount?: number;
    /** Can scratch more emoticons */
    canScratch?: boolean;
    /** Guesses remaining */
    attemptsRemaining?: number;
    /** Star rating 0-6 */
    score?: number;
    /** Point score 0-100 */
    numericScore?: number;
  }>(),
  {
    visibleEmoticonCount: 2,
    canScratch: false,
    attemptsRemaining: 6,
    score: 5,
    numericScore: 100,
  },
);

const emit = defineEmits<{
  scratch: [];
}>();

const { t } = useI18n();
const isScratching = ref(false);

const isEmoticons = computed(() => props.hint.type === 'emoticons');
const isGenre = computed(() => props.hint.type === 'genre');
const isEra = computed(() => props.hint.type === 'era');
const isQuote = computed(() => props.hint.type === 'quote');
const isLetterAuthor = computed(() => props.hint.type === 'letter_author');
const isAuthorName = computed(() => props.hint.type === 'author_name');
const isPublicationCentury = computed(() => props.hint.type === 'publication_century');
const isTitleWordCount = computed(() => props.hint.type === 'title_word_count');
const isSetting = computed(() => props.hint.type === 'setting');
const isProtagonist = computed(() => props.hint.type === 'protagonist');

// Split emoticons using grapheme segmentation for multi-codepoint emoji support
function splitEmojis(str: string): string[] {
  const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
  return [...segmenter.segment(str)].map((s) => s.segment).filter((char) => char.trim());
}

// Split emoticons into individual characters with random offsets
// Server sends emoticons pre-shuffled
const allEmoticons = computed(() => {
  if (!isEmoticons.value) {return [];}
  const emojis = splitEmojis(props.hint.content);

  // Generate deterministic offsets for each emoji
  return emojis.map((emoji, index) => ({
    emoji,
    offsetX: Math.sin(index * 2.5) * 6, // -6px to +6px
    offsetY: Math.cos(index * 3.1) * 4, // -4px to +4px
    rotation: Math.sin(index * 1.7) * 8, // -8deg to +8deg
  }));
});

// Visible emoticons (first N based on visibleEmoticonCount)
const visibleEmoticons = computed(() =>
  allEmoticons.value.slice(0, props.visibleEmoticonCount),
);

// Hidden emoticons (remaining that can be scratched)
const hiddenEmoticons = computed(() =>
  allEmoticons.value.slice(props.visibleEmoticonCount),
);

// Scratch action with animation delay
async function handleScratch() {
  if (!props.canScratch || isScratching.value) {return;}
  isScratching.value = true;
  // Small delay for visual feedback
  await new Promise((resolve) => {
    setTimeout(resolve, 150);
  });
  emit('scratch');
  isScratching.value = false;
}


const letterAuthorData = computed(() => {
  if (!isLetterAuthor.value) {return { letter: '', nationality: '' };}
  const content = props.hint.content;

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
    <div class="hint-header">
      <div class="hint-header__indicators">
        <!-- Attempts dots -->
        <div class="hint-indicator">
          <span class="hint-indicator__label">{{ $t('game.attempts') }}</span>
          <div class="hint-dots">
            <span
              v-for="i in 6"
              :key="i"
              class="hint-dot"
              :class="{ 'hint-dot--filled': i <= attemptsRemaining }"
            />
          </div>
        </div>
        <!-- Score stars -->
        <div class="hint-indicator">
          <span class="hint-indicator__label">{{ $t('game.score') }}</span>
          <div class="hint-score-display">
            <ScoreStars :score="score" size="md" />
            <span class="hint-score-pts">{{ numericScore }}/100</span>
          </div>
        </div>
      </div>
    </div>

    <div
      class="hint-content"
      :class="{
        'hint-emoticons': isEmoticons,
        'hint-genre': isGenre,
        'hint-era': isEra,
        'hint-quote': isQuote,
        'hint-letter-author': isLetterAuthor,
        'hint-author-name': isAuthorName,
        'hint-publication-century': isPublicationCentury,
        'hint-title-word-count': isTitleWordCount,
        'hint-setting': isSetting,
        'hint-protagonist': isProtagonist,
      }"
    >
      <!-- Emoticons display as individual bubbles with scratch-to-reveal -->
      <template v-if="isEmoticons">
        <div class="emoticons-grid">
          <!-- Visible emoticons -->
          <span
            v-for="(item, index) in visibleEmoticons"
            :key="`visible-${index}`"
            class="emoticon-bubble"
            :style="{
              '--index': index,
              '--offset-x': `${item.offsetX}px`,
              '--offset-y': `${item.offsetY}px`,
              '--rotation': `${item.rotation}deg`,
            }"
          >
            {{ item.emoji }}
          </span>

          <!-- Scratch overlay for hidden emoticons -->
          <button
            v-if="hiddenEmoticons.length > 0"
            class="scratch-overlay"
            :class="{ 'scratch-overlay--active': isScratching, 'scratch-overlay--disabled': !canScratch }"
            :disabled="!canScratch"
            :aria-label="t('game.scratchToReveal')"
            @click="handleScratch"
          >
            <div class="scratch-overlay__foil">
              <span class="scratch-overlay__count"
                >+{{ hiddenEmoticons.length }}</span
              >
              <Sparkles :size="16" class="scratch-overlay__icon" />
            </div>
            <span class="scratch-overlay__cost">-2 pts</span>
          </button>
        </div>
      </template>
      <!-- Genre display with tag -->
      <template v-else-if="isGenre">
        <div class="single-tag-container">
          <div class="genre-era-tag genre-tag" style="--tag-index: 0">
            <BookOpen :size="16" class="tag-icon" />
            <span class="tag-label">{{ hint.content }}</span>
          </div>
        </div>
      </template>
      <!-- Era display with tag -->
      <template v-else-if="isEra">
        <div class="single-tag-container">
          <div class="genre-era-tag era-tag" style="--tag-index: 0">
            <Clock :size="16" class="tag-icon" />
            <span class="tag-label">{{ hint.content }}</span>
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
      <!-- Publication Century - calendar display -->
      <template v-else-if="isPublicationCentury">
        <div class="single-tag-container">
          <div class="genre-era-tag year-tag" style="--tag-index: 0">
            <Calendar :size="16" class="tag-icon" />
            <span class="tag-label">{{ hint.content }}</span>
          </div>
        </div>
      </template>
      <!-- Title Word Count - counter display -->
      <template v-else-if="isTitleWordCount">
        <div class="word-count-container">
          <div class="word-count-badge">
            <Hash :size="18" class="word-count-icon" />
            <span class="word-count-number">{{ hint.content }}</span>
          </div>
          <span
            class="word-count-label"
            >{{ t('game.hints.wordsInTitle') }}</span
          >
        </div>
      </template>
      <!-- Setting - location display -->
      <template v-else-if="isSetting">
        <div class="setting-container">
          <div class="setting-card">
            <MapPin :size="20" class="setting-icon" />
            <span class="setting-text">{{ hint.content }}</span>
          </div>
        </div>
      </template>
      <!-- Protagonist - silhouette mystery reveal -->
      <template v-else-if="isProtagonist">
        <div class="protagonist-mystery">
          <div class="silhouette-spotlight" aria-hidden="true" />
          <div class="silhouette-figure" aria-hidden="true" />
          <span class="protagonist-name">{{ hint.content }}</span>
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

.hint-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.hint-header__indicators {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 0.5rem 0.75rem;
  background: oklch(0.5 0.02 55 / 0.05);
  border-radius: var(--gutenku-radius-sm);
}

[data-theme='dark'] .hint-header__indicators {
  background: oklch(1 0 0 / 0.03);
}

.hint-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.hint-indicator__label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gutenku-text-muted);
}

.hint-score-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.hint-score-pts {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--gutenku-text-muted);
  opacity: 0.8;
}

.hint-dots {
  display: flex;
  gap: 0.25rem;
}

.hint-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: oklch(0.85 0.02 55);
  border: 1px solid var(--gutenku-paper-border);
  transition: all 0.2s ease;

  &--filled {
    background: var(--gutenku-zen-primary);
    border-color: var(--gutenku-zen-primary);
  }
}

[data-theme='dark'] .hint-dot {
  background: oklch(0.45 0.02 55);
  border-color: oklch(0.55 0.02 55);

  &--filled {
    background: var(--gutenku-zen-primary);
    border-color: var(--gutenku-zen-primary);
  }
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
  // Random position and rotation offsets for scattered layout
  --offset-x: 0px;
  --offset-y: 0px;
  --rotation: 0deg;
  transform: translate(var(--offset-x), var(--offset-y)) rotate(var(--rotation));
  transition: filter 0.2s ease, transform 0.2s ease;

  &:hover {
    filter: drop-shadow(0 2px 4px oklch(0 0 0 / 0.15));
    transform: translate(var(--offset-x), var(--offset-y)) rotate(0deg) scale(1.1);
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
    transform: translate(var(--offset-x), calc(var(--offset-y) + 12px)) rotate(calc(var(--rotation) - 3deg));
  }
  100% {
    opacity: 1;
    transform: translate(var(--offset-x), var(--offset-y)) rotate(var(--rotation));
  }
}

// Scratch overlay for hidden emoticons
.scratch-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  min-width: 3.5rem;
  height: 2.75rem;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(
    135deg,
    oklch(0.75 0.12 85) 0%,
    oklch(0.65 0.15 70) 50%,
    oklch(0.75 0.12 85) 100%
  );
  border: 2px dashed oklch(0.55 0.1 70 / 0.5);
  border-radius: var(--gutenku-radius-sm);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
  animation: shimmer 2s infinite ease-in-out;

  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 12px oklch(0.65 0.15 70 / 0.4);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-accent);
    outline-offset: 2px;
  }

  &--active {
    animation: scratch-reveal 0.3s ease-out;
  }

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    animation: none;
  }
}

@keyframes shimmer {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.1);
  }
}

@keyframes scratch-reveal {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1) rotate(5deg);
  }
  100% {
    transform: scale(0.9);
    opacity: 0.7;
  }
}

.scratch-overlay__foil {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.scratch-overlay__count {
  font-size: 0.9rem;
  font-weight: 700;
  color: oklch(0.25 0.05 70);
}

.scratch-overlay__icon {
  color: oklch(0.35 0.1 70);
}

.scratch-overlay__cost {
  font-size: 0.6rem;
  font-weight: 600;
  color: oklch(0.35 0.08 70);
}

[data-theme='dark'] .scratch-overlay {
  background: linear-gradient(
    135deg,
    oklch(0.45 0.1 85) 0%,
    oklch(0.35 0.12 70) 50%,
    oklch(0.45 0.1 85) 100%
  );
  border-color: oklch(0.55 0.1 70 / 0.4);

  &:hover:not(:disabled) {
    box-shadow: 0 4px 12px oklch(0.5 0.12 70 / 0.5);
  }
}

[data-theme='dark'] .scratch-overlay__count {
  color: oklch(0.9 0.05 70);
}

[data-theme='dark'] .scratch-overlay__icon {
  color: oklch(0.85 0.08 70);
}

[data-theme='dark'] .scratch-overlay__cost {
  color: oklch(0.8 0.06 70);
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
.single-tag-container {
  display: flex;
  justify-content: center;
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

// Word Count - counter badge display
.word-count-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0;
}

.word-count-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(
    135deg,
    var(--gutenku-zen-water) 0%,
    var(--gutenku-paper-bg) 100%
  );
  border: 1px solid var(--gutenku-paper-border);
  border-radius: var(--gutenku-radius-md);
  opacity: 0;
  animation: badge-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: 0.1s;
}

.word-count-icon {
  color: var(--gutenku-zen-accent);
}

.word-count-number {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gutenku-zen-primary);
}

.word-count-label {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gutenku-text-muted);
  opacity: 0;
  animation: fade-up 0.35s ease-out forwards;
  animation-delay: 0.35s;
}

@keyframes badge-pop {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

[data-theme='dark'] .word-count-badge {
  background: linear-gradient(
    135deg,
    oklch(0.25 0.03 195 / 0.5) 0%,
    oklch(0.22 0.02 55) 100%
  );
}

[data-theme='dark'] .word-count-number {
  color: oklch(0.92 0.04 195);
}

// Setting - location card display
.setting-container {
  display: flex;
  justify-content: center;
  padding: 0.5rem 0;
}

.setting-card {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(
    135deg,
    var(--gutenku-paper-bg-aged) 0%,
    var(--gutenku-paper-bg) 100%
  );
  border: 1px solid var(--gutenku-paper-border);
  border-left: 3px solid var(--gutenku-zen-accent);
  border-radius: var(--gutenku-radius-md);
  opacity: 0;
  animation: card-slide 0.45s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
  animation-delay: 0.1s;
}

@keyframes card-slide {
  0% {
    opacity: 0;
    transform: translateX(-15px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.setting-icon {
  flex-shrink: 0;
  color: var(--gutenku-zen-accent);
}

.setting-text {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--gutenku-zen-primary);
}

[data-theme='dark'] .setting-card {
  background: linear-gradient(
    135deg,
    oklch(0.22 0.02 55 / 0.6) 0%,
    oklch(0.25 0.02 55) 100%
  );
}

[data-theme='dark'] .setting-text {
  color: oklch(0.9 0.03 195);
}

// Protagonist - silhouette mystery reveal
.protagonist-mystery {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem 0.75rem;
}

.silhouette-spotlight {
  position: absolute;
  top: 0.25rem;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 50px;
  background: radial-gradient(
    ellipse 100% 100% at 50% 60%,
    oklch(0.55 0.1 195 / 0.12) 0%,
    transparent 70%
  );
  opacity: 0;
  animation: spotlight-appear 0.3s ease-out forwards;
  pointer-events: none;
}

@keyframes spotlight-appear {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.silhouette-figure {
  position: relative;
  width: 24px;
  height: 32px;
  opacity: 0;
  animation: silhouette-materialize 0.4s ease-out forwards;
  animation-delay: 0.1s;

  // Minimalist head - simple circle
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 14px;
    height: 14px;
    background: var(--gutenku-zen-primary);
    border-radius: 50%;
    opacity: 0.7;
  }

  // Stylized body - single brushstroke shape
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 16px;
    background: var(--gutenku-zen-primary);
    opacity: 0.5;
    border-radius: 10px 10px 4px 4px;
    clip-path: polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%);
  }
}

@keyframes silhouette-materialize {
  0% {
    opacity: 0;
    transform: translateY(-4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.protagonist-mystery .protagonist-name {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.15rem;
  font-weight: 500;
  font-style: italic;
  color: var(--gutenku-zen-primary);
  letter-spacing: 0.02em;
  opacity: 0;
  animation: name-reveal 0.4s ease-out forwards;
  animation-delay: 0.35s;
}

@keyframes name-reveal {
  0% {
    opacity: 0;
    transform: translateY(4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

// Dark mode
[data-theme='dark'] .silhouette-spotlight {
  background: radial-gradient(
    ellipse 100% 100% at 50% 60%,
    oklch(0.6 0.12 195 / 0.15) 0%,
    transparent 70%
  );
}

[data-theme='dark'] .silhouette-figure {
  &::before {
    background: oklch(0.85 0.06 195);
    opacity: 0.6;
  }

  &::after {
    background: oklch(0.85 0.06 195);
    opacity: 0.4;
  }
}

[data-theme='dark'] .protagonist-mystery .protagonist-name {
  color: oklch(0.92 0.04 195);
}

@media (prefers-reduced-motion: reduce) {
  .game-hint,
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
  .author-label,
  .word-count-badge,
  .word-count-label,
  .setting-card,
  .silhouette-spotlight,
  .silhouette-figure,
  .protagonist-mystery .protagonist-name {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
    clip-path: none !important;
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
