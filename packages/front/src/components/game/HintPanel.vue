<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Lock } from 'lucide-vue-next';
import type { PuzzleHint } from '@gutenku/shared';
import GameHint from './GameHint.vue';

// Unique key for hint content transition
const hintKey = ref(0);

// Track magnetic animation state
const magneticChip = ref<string | null>(null);

// Hint type metadata (icons and labels) - all possible types
const hintTypeMeta: Record<string, { icon: string; labelKey: string }> = {
  emoticons: { icon: '😀', labelKey: 'game.hints.emoticonsShort' },
  genre: { icon: '📖', labelKey: 'game.hints.genreShort' },
  era: { icon: '🕐', labelKey: 'game.hints.eraShort' },
  quote: { icon: '💬', labelKey: 'game.hints.quoteShort' },
  first_letter: { icon: '🔤', labelKey: 'game.hints.letterShort' },
  author_nationality: { icon: '🌍', labelKey: 'game.hints.nationalityShort' },
  author_name: { icon: '👤', labelKey: 'game.hints.authorShort' },
  publication_century: { icon: '📅', labelKey: 'game.hints.centuryShort' },
  title_word_count: { icon: '#️⃣', labelKey: 'game.hints.countShort' },
  setting: { icon: '📍', labelKey: 'game.hints.settingShort' },
  protagonist: { icon: '🦸', labelKey: 'game.hints.protagonistShort' },
};

type HintStatus = 'unlocked' | 'current' | 'locked';

interface TimelineItem {
  type: string;
  icon: string;
  labelKey: string;
  status: HintStatus;
  hint: PuzzleHint | null;
}

const props = defineProps<{
  hints: PuzzleHint[];
  currentRound: number;
  /** Visible emoticon count including scratched */
  visibleEmoticonCount?: number;
  /** Can scratch more emoticons */
  canScratch?: boolean;
  /** Guesses remaining */
  attemptsRemaining?: number;
  /** Star rating 0-5 */
  score?: number;
  /** Point score 0-100 */
  numericScore?: number;
  /** Game completion status */
  isGameComplete?: boolean;
}>();

const emit = defineEmits<{
  scratch: [];
}>();

const { t } = useI18n();

// Track which hint is currently displayed (defaults to latest)
const selectedHintType = ref<string | null>(null);

const latestHint = computed(() => {
  return props.hints.length > 0 ? props.hints.at(-1)! : null;
});

// Select latest hint by default
watch(latestHint, (newHint) => {
  if (newHint) {
    selectedHintType.value = newHint.type;
  }
}, { immediate: true });

// The hint to display in the main panel
const displayedHint = computed(() => {
  if (!selectedHintType.value) {return latestHint.value;}
  return props.hints.find((h) => h.type === selectedHintType.value) || latestHint.value;
});

// Unified timeline derived from revealed hints (sorted by round)
const hintTimeline = computed((): TimelineItem[] => {
  // Sort hints by round to show progression
  const sortedHints = [...props.hints].sort((a, b) => a.round - b.round);

  return sortedHints.map((hint) => {
    const meta = hintTypeMeta[hint.type] || { icon: '❓', labelKey: 'game.hints.unknown' };
    const status: HintStatus = hint.type === selectedHintType.value ? 'current' : 'unlocked';

    return {
      type: hint.type,
      icon: meta.icon,
      labelKey: meta.labelKey,
      status,
      hint,
    };
  });
});

function selectHint(item: TimelineItem) {
  if (item.status === 'locked' || !item.hint) {return;}
  if (selectedHintType.value !== item.type) {
    hintKey.value++;
    magneticChip.value = item.type;
    selectedHintType.value = item.type;
    // Reset magnetic state after animation
    setTimeout(() => {
      magneticChip.value = null;
    }, 400);
  }
}
</script>

<template>
  <div class="hint-panel">
    <!-- Hint timeline navigation -->
    <div class="hint-timeline">
      <div class="hint-timeline__chips">
        <button
          v-for="item in hintTimeline"
          :key="item.type"
          class="hint-chip"
          :class="[
            `hint-chip--${item.status}`,
            { 'hint-chip--magnetic': magneticChip === item.type }
          ]"
          :disabled="item.status === 'locked'"
          :aria-label="t(item.labelKey)"
          :aria-current="item.status === 'current' ? 'step' : undefined"
          @click="selectHint(item)"
        >
          <span class="hint-chip__icon">{{ item.icon }}</span>
          <span class="hint-chip__label">{{ t(item.labelKey) }}</span>
          <Lock
            v-if="item.status === 'locked'"
            :size="12"
            class="hint-chip__status-icon"
          />
        </button>
      </div>
    </div>

    <!-- Selected hint content with transition -->
    <Transition name="hint-fade" mode="out-in">
      <div v-if="displayedHint" :key="hintKey" class="hint-panel__current">
        <GameHint
          :hint="displayedHint"
          :round="displayedHint.round"
          :visible-emoticon-count="visibleEmoticonCount"
          :can-scratch="canScratch && displayedHint.type === 'emoticons'"
          :attempts-remaining="attemptsRemaining"
          :score="score"
          :numeric-score="numericScore"
          @scratch="emit('scratch')"
        />
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
// Hint content transition
.hint-fade-enter-active,
.hint-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.hint-fade-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}

.hint-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

.hint-panel {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.hint-panel__current {
  position: relative;
  padding: 0.5rem;
  background: oklch(0.97 0.02 68 / 0.3);

  @media (min-width: 600px) {
    padding: 0.75rem;
  }

  // Ink wash separator
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--gutenku-zen-accent) 20%,
      var(--gutenku-zen-accent) 80%,
      transparent 100%
    );
    opacity: 0.4;
  }
}

[data-theme='dark'] .hint-panel__current {
  background: oklch(0.22 0.02 65 / 0.3);
}

// Unified hint timeline
.hint-timeline {
  position: relative;
  padding: 0.5rem;

  @media (min-width: 600px) {
    padding: 0.5rem 0.75rem;
  }

  // Ink wash separator
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--gutenku-zen-accent) 20%,
      var(--gutenku-zen-accent) 80%,
      transparent 100%
    );
    opacity: 0.4;
  }
}

.hint-timeline__chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.25rem;

  @media (min-width: 600px) {
    gap: 0.375rem;
  }
}

// Base hint chip
.hint-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.5rem;
  border-radius: var(--gutenku-radius-md);
  font-size: 0.7rem;
  font-weight: 600;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;

  @media (min-width: 600px) {
    gap: 0.35rem;
    padding: 0.4rem 0.6rem;
    font-size: 0.75rem;
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-accent);
    outline-offset: 2px;
  }
}

// Magnetic snap animation
.hint-chip--magnetic {
  animation: magnetic-snap 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes magnetic-snap {
  0% {
    transform: scale(0.92);
  }
  40% {
    transform: scale(1.08);
  }
  70% {
    transform: scale(0.98);
  }
  100% {
    transform: scale(1);
  }
}

// Unlocked state - previously viewed hints
.hint-chip--unlocked {
  background: oklch(0.92 0.02 55 / 0.6);
  border: 1px solid oklch(0.85 0.02 55 / 0.5);
  color: var(--gutenku-text-primary);
  cursor: pointer;

  &:hover {
    background: oklch(0.88 0.03 55 / 0.8);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px oklch(0 0 0 / 0.08);
  }
}

[data-theme='dark'] .hint-chip--unlocked {
  background: oklch(0.28 0.02 55 / 0.5);
  border-color: oklch(0.38 0.02 55 / 0.5);

  &:hover {
    background: oklch(0.32 0.03 55 / 0.7);
    box-shadow: 0 2px 4px oklch(0 0 0 / 0.2);
  }
}

// Current state - active hint (highlighted)
.hint-chip--current {
  background: oklch(0.4 0.1 195 / 0.85);
  border: 1px solid oklch(0.35 0.1 195 / 0.6);
  color: white;
  cursor: pointer;
  box-shadow: 0 0 0 2px oklch(0.4 0.1 195 / 0.12);

  &:hover {
    background: oklch(0.38 0.1 195 / 0.9);
    box-shadow: 0 0 0 2px oklch(0.4 0.1 195 / 0.18);
  }
}

[data-theme='dark'] .hint-chip--current {
  background: oklch(0.45 0.1 195 / 0.7);
  border-color: oklch(0.5 0.1 195 / 0.5);
  box-shadow: 0 0 0 2px oklch(0.5 0.1 195 / 0.15);

  &:hover {
    background: oklch(0.5 0.1 195 / 0.8);
    box-shadow: 0 0 0 2px oklch(0.5 0.1 195 / 0.2);
  }
}

// Locked state - upcoming hints
.hint-chip--locked {
  background: transparent;
  border: 1px dashed oklch(0.7 0.02 55);
  color: oklch(0.55 0.02 55);
  cursor: not-allowed;

  .hint-chip__status-icon {
    color: oklch(0.6 0.02 55);
  }

  .hint-chip__icon {
    opacity: 0.5;
    filter: grayscale(0.4);
  }
}

[data-theme='dark'] .hint-chip--locked {
  background: oklch(0.2 0.01 55);
  border-color: oklch(0.35 0.02 55);
  color: oklch(0.55 0.02 55);

  .hint-chip__status-icon {
    color: oklch(0.45 0.02 55);
  }
}

.hint-chip__icon {
  font-size: 0.875rem;

  @media (min-width: 600px) {
    font-size: 1rem;
  }
}

.hint-chip__label {
  white-space: nowrap;
}

.hint-chip__status-icon {
  flex-shrink: 0;
}

@media (prefers-reduced-motion: reduce) {
  .hint-chip {
    transition: none;
  }

  .hint-chip--magnetic {
    animation: none;
  }

  .hint-fade-enter-active,
  .hint-fade-leave-active {
    transition: none;
  }
}
</style>
