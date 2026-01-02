<script lang="ts" setup>
import { ref, computed, watch, type Component } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  Lock,
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
import type { PuzzleHint } from '@gutenku/shared';
import GameHint from './GameHint.vue';

// Unique key for hint content transition
const hintKey = ref(0);

// Track magnetic animation state
const magneticChip = ref<string | null>(null);

// Hint type metadata (icons and labels) - all possible types
const hintTypeMeta: Record<string, { icon: Component; labelKey: string }> = {
  emoticons: { icon: Smile, labelKey: 'game.hints.emoticonsShort' },
  genre: { icon: BookOpen, labelKey: 'game.hints.genreShort' },
  era: { icon: Clock, labelKey: 'game.hints.eraShort' },
  quote: { icon: Quote, labelKey: 'game.hints.quoteShort' },
  first_letter: { icon: Type, labelKey: 'game.hints.letterShort' },
  author_nationality: { icon: Globe, labelKey: 'game.hints.nationalityShort' },
  author_name: { icon: User, labelKey: 'game.hints.authorShort' },
  publication_century: { icon: Calendar, labelKey: 'game.hints.centuryShort' },
  title_word_count: { icon: Hash, labelKey: 'game.hints.countShort' },
  setting: { icon: MapPin, labelKey: 'game.hints.settingShort' },
  protagonist: { icon: Drama, labelKey: 'game.hints.protagonistShort' },
};

type HintStatus = 'unlocked' | 'current' | 'locked';

interface TimelineItem {
  type: string;
  icon: Component;
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
    const meta = hintTypeMeta[hint.type] || { icon: HelpCircle, labelKey: 'game.hints.unknown' };
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
    <!-- Hint timeline navigation - horizontal scroll on mobile -->
    <div class="hint-timeline">
      <div
        class="hint-timeline__chips"
        role="tablist"
        :aria-label="t('game.hintProgress')"
      >
        <button
          v-for="(item, index) in hintTimeline"
          :key="item.type"
          class="hint-chip"
          :class="[
            `hint-chip--${item.status}`,
            { 'hint-chip--magnetic': magneticChip === item.type }
          ]"
          role="tab"
          :disabled="item.status === 'locked'"
          :aria-label="`${index + 1}. ${t(item.labelKey)}`"
          :aria-selected="item.status === 'current'"
          @click="selectHint(item)"
        >
          <!-- Numbered badge -->
          <span class="hint-chip__number">{{ index + 1 }}</span>
          <component :is="item.icon" :size="16" class="hint-chip__icon" />
          <span class="hint-chip__label">{{ t(item.labelKey) }}</span>
          <Lock
            v-if="item.status === 'locked'"
            :size="12"
            class="hint-chip__status-icon"
          />
          <!-- Active underline indicator - handmade ink stroke -->
          <svg
            v-if="item.status === 'current'"
            class="hint-chip__underline"
            viewBox="0 0 60 6"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M2 3 C12 2.6, 25 3.4, 35 2.8 S50 3.2, 58 3"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
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

// Unified hint timeline - horizontal scroll on mobile
.hint-timeline {
  position: relative;
  padding: 0.5rem 0;

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
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;

  // Horizontal scroll on mobile
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 600px) {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.25rem 0;
    overflow-x: visible;
  }
}

// Base hint chip - larger touch targets
.hint-chip {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  min-height: 2.75rem; // 44px for WCAG touch target
  padding: 0.5rem 0.75rem;
  border-radius: var(--gutenku-radius-lg);
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
  scroll-snap-align: start;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;

  @media (min-width: 600px) {
    gap: 0.375rem;
    min-height: 2.5rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    scroll-snap-align: unset;
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-accent);
    outline-offset: 2px;
  }
}

// Numbered badge
.hint-chip__number {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.25rem;
  font-size: 0.625rem;
  font-weight: 700;
  border-radius: 9999px;
  background: oklch(0 0 0 / 0.1);
  color: inherit;

  @media (min-width: 600px) {
    min-width: 1.375rem;
    height: 1.375rem;
    font-size: 0.6875rem;
  }
}

.hint-chip--current .hint-chip__number {
  background: oklch(1 0 0 / 0.25);
}

[data-theme='dark'] .hint-chip--current .hint-chip__number {
  background: oklch(0 0 0 / 0.25);
}

// Underline indicator for active state - handmade ink stroke
.hint-chip__underline {
  position: absolute;
  bottom: 0.05rem;
  left: 50%;
  transform: translateX(-50%);
  width: 65%;
  height: 6px;
  opacity: 0.35;
  overflow: visible;

  path {
    stroke-dasharray: 60;
    stroke-dashoffset: 60;
    animation: ink-draw 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
}

@keyframes ink-draw {
  from {
    stroke-dashoffset: 60;
  }
  to {
    stroke-dashoffset: 0;
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

  &:active {
    transform: translateY(0) scale(0.97);
    box-shadow: none;
    background: oklch(0.85 0.04 55 / 0.9);
  }
}

[data-theme='dark'] .hint-chip--unlocked {
  background: oklch(0.28 0.02 55 / 0.5);
  border-color: oklch(0.38 0.02 55 / 0.5);

  &:hover {
    background: oklch(0.32 0.03 55 / 0.7);
    box-shadow: 0 2px 4px oklch(0 0 0 / 0.2);
  }

  &:active {
    transform: translateY(0) scale(0.97);
    background: oklch(0.35 0.04 55 / 0.8);
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

  &:active {
    transform: scale(0.97);
    background: oklch(0.35 0.12 195 / 0.95);
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

  &:active {
    transform: scale(0.97);
    background: oklch(0.42 0.12 195 / 0.9);
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
  flex-shrink: 0;
  color: oklch(0.5 0.1 195);

  @media (min-width: 600px) {
    width: 18px;
    height: 18px;
  }
}

.hint-chip--current .hint-chip__icon {
  color: white;
  filter: drop-shadow(0 0 2px oklch(1 0 0 / 0.3));
}

.hint-chip--unlocked .hint-chip__icon {
  color: oklch(0.45 0.08 195);
}

.hint-chip--locked .hint-chip__icon {
  color: oklch(0.55 0.02 55);
  opacity: 0.5;
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

  .hint-chip__underline path {
    animation: none;
    stroke-dashoffset: 0;
  }

  .hint-fade-enter-active,
  .hint-fade-leave-active {
    transition: none;
  }

  .hint-timeline__chips {
    scroll-snap-type: none;
  }
}
</style>
