<script lang="ts" setup>
import { ref, watch, onMounted, type Component } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Lightbulb,
  Sparkles,
  Trophy,
  Lock,
  Smile,
  HelpCircle,
  Clock,
  Calendar,
  MapPin,
  Drama,
  Quote,
  Hash,
  Type,
  User,
  Star,
} from 'lucide-vue-next';
import ZenModal from '@/components/ui/ZenModal.vue';
import ZenButton from '@/components/ui/ZenButton.vue';

const modelValue = defineModel<boolean>({ default: false });

const emit = defineEmits<{
  'first-visit-complete': [];
}>();

const { t } = useI18n();
const currentStep = ref(0);
const isFirstVisit = ref(false);

const steps = [
  {
    icon: BookOpen,
    titleKey: 'game.help.step1Title',
    descriptionKey: 'game.help.step1Description',
  },
  {
    icon: Lightbulb,
    titleKey: 'game.help.step2Title',
    descriptionKey: 'game.help.step2Description',
    showHintProgression: true,
  },
  {
    icon: Sparkles,
    titleKey: 'game.help.step3Title',
    descriptionKey: 'game.help.step3Description',
    showLifelines: true,
  },
  {
    icon: Trophy,
    titleKey: 'game.help.step4Title',
    descriptionKey: 'game.help.step4Description',
    showScoring: true,
  },
];

// Hint progression demo (Bookmoji first, then 5 locked random hints)
const hintProgression: Array<{ icon: Component; labelKey: string; unlocked: boolean }> = [
  { icon: Smile, labelKey: 'game.hints.emoticonsShort', unlocked: true },
  { icon: HelpCircle, labelKey: 'game.help.randomHint', unlocked: false },
  { icon: HelpCircle, labelKey: 'game.help.randomHint', unlocked: false },
  { icon: HelpCircle, labelKey: 'game.help.randomHint', unlocked: false },
  { icon: HelpCircle, labelKey: 'game.help.randomHint', unlocked: false },
  { icon: HelpCircle, labelKey: 'game.help.randomHint', unlocked: false },
];

// All possible hint types that can appear randomly (9 types, 5 picked daily)
const possibleHintTypes: Array<{ icon: Component; labelKey: string }> = [
  { icon: BookOpen, labelKey: 'game.hints.genreShort' },
  { icon: Clock, labelKey: 'game.hints.eraShort' },
  { icon: Calendar, labelKey: 'game.hints.centuryShort' },
  { icon: MapPin, labelKey: 'game.hints.settingShort' },
  { icon: Drama, labelKey: 'game.hints.protagonistShort' },
  { icon: Quote, labelKey: 'game.hints.quoteShort' },
  { icon: Hash, labelKey: 'game.hints.countShort' },
  { icon: Type, labelKey: 'game.hints.letterShort' },
  { icon: User, labelKey: 'game.hints.authorShort' },
];

onMounted(() => {
  const hasSeenHelp = localStorage.getItem('gutenguess-help-seen');
  isFirstVisit.value = !hasSeenHelp;
});

watch(modelValue, (isOpen) => {
  if (isOpen) {
    currentStep.value = 0;
  }
});

function nextStep() {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++;
  } else {
    close();
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
}

function close() {
  localStorage.setItem('gutenguess-help-seen', 'true');
  if (isFirstVisit.value) {
    emit('first-visit-complete');
    isFirstVisit.value = false;
  }
  modelValue.value = false;
}
</script>

<template>
  <ZenModal
    v-model="modelValue"
    :max-width="440"
    :persistent="isFirstVisit"
    variant="book"
    title="How to Play"
    description="Step-by-step guide on how to play GutenGuess"
    content-class="game-help"
    @close="close"
  >
    <!-- Step indicator dots -->
    <div class="game-help__dots" aria-hidden="true">
      <button
        v-for="(_, index) in steps"
        :key="index"
        class="dot"
        :class="{ 'dot--active': index === currentStep, 'dot--completed': index < currentStep }"
        @click="currentStep = index"
      />
    </div>

    <!-- Step content -->
    <Transition name="slide" mode="out-in">
      <div :key="currentStep" class="game-help__content">
        <div class="game-help__icon-wrapper">
          <component
            :is="steps[currentStep].icon"
            :size="48"
            class="game-help__icon"
          />
        </div>

        <h2 class="game-help__title gutenku-text-primary">
          {{ t(steps[currentStep].titleKey) }}
        </h2>

        <p class="game-help__description gutenku-text-muted">
          {{ t(steps[currentStep].descriptionKey) }}
        </p>

        <!-- Step 2: Hint progression with locks -->
        <div
          v-if="steps[currentStep].showHintProgression"
          class="game-help__hints"
        >
          <!-- Hint timeline showing progression -->
          <div class="hint-timeline">
            <div
              v-for="(hint, index) in hintProgression"
              :key="index"
              class="hint-chip"
              :class="[
                  hint.unlocked ? 'hint-chip--unlocked' : 'hint-chip--locked'
                ]"
              :style="{ '--delay': index }"
            >
              <component :is="hint.icon" :size="16" class="hint-chip__icon" />
              <span class="hint-chip__label">{{ t(hint.labelKey) }}</span>
              <Lock v-if="!hint.unlocked" :size="12" class="hint-chip__lock" />
            </div>
          </div>
          <!-- Possible hint types -->
          <div class="hint-pool">
            <span
              class="hint-pool__intro"
              >{{ t('game.help.possibleHints') }}</span
            >
            <div class="hint-pool__grid">
              <div
                v-for="(hint, index) in possibleHintTypes"
                :key="index"
                class="hint-pool__item"
                :style="{ '--delay': index }"
              >
                <component :is="hint.icon" :size="14" class="hint-pool__icon" />
                <span class="hint-pool__label">{{ t(hint.labelKey) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Lifelines -->
        <div
          v-if="steps[currentStep].showLifelines"
          class="game-help__lifelines"
        >
          <div class="lifeline-item">
            <Sparkles
              :size="20"
              class="lifeline-icon lifeline-icon--sparkles"
            />
            <span
              class="lifeline-text"
              >{{ t('game.help.step3Lifeline1') }}</span
            >
          </div>
          <div class="lifeline-item">
            <Drama :size="20" class="lifeline-icon lifeline-icon--drama" />
            <span
              class="lifeline-text"
              >{{ t('game.help.step3Lifeline2') }}</span
            >
          </div>
          <div class="lifeline-cost">{{ t('game.help.step3Cost') }}</div>
        </div>

        <!-- Step 4: Scoring -->
        <div v-if="steps[currentStep].showScoring" class="game-help__scoring">
          <div class="scoring-stars">
            <Star v-for="i in 5" :key="i" :size="24" class="scoring-star" />
          </div>
          <div class="scoring-legend">
            <span class="scoring-item"
              ><span class="scoring-dot scoring-dot--good" />Fewer guesses</span
            >
            <span class="scoring-item"
              ><span class="scoring-dot scoring-dot--good" />Fewer
              lifelines</span
            >
            <span class="scoring-item"
              ><span class="scoring-dot scoring-dot--bad" />More hints
              used</span
            >
          </div>
        </div>
      </div>
    </Transition>

    <!-- Navigation -->
    <div class="game-help__actions">
      <ZenButton v-if="currentStep > 0" variant="ghost" @click="prevStep">
        <template #icon-left>
          <ChevronLeft :size="18" />
        </template>
        {{ t('common.back') }}
      </ZenButton>
      <div v-else />

      <ZenButton @click="nextStep">
        {{ currentStep < steps.length - 1 ? t('common.next') : t('game.help.startPlaying') }}
        <template #icon-right>
          <ChevronRight :size="18" />
        </template>
      </ZenButton>
    </div>

    <!-- Footer -->
    <p class="game-help__footer gutenku-text-muted">
      {{ t('game.help.footer') }}
    </p>
  </ZenModal>
</template>

<style lang="scss" scoped>
:deep(.game-help) {
  text-align: center;
}

.game-help__dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.dot {
  width: 8px;
  height: 8px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: var(--gutenku-paper-border);
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;

  &:hover {
    background: var(--gutenku-zen-accent);
    opacity: 0.7;
  }

  &--active {
    background: var(--gutenku-zen-accent);
    transform: scale(1.25);
  }

  &--completed {
    background: var(--gutenku-zen-primary);
  }
}

.game-help__content {
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.game-help__icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin-bottom: 1.5rem;
  background: var(--gutenku-zen-water);
  border-radius: var(--gutenku-radius-full);
  color: var(--gutenku-zen-accent);
}

.game-help__icon {
  animation: icon-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes icon-bounce {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.game-help__title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
}

.game-help__description {
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
  max-width: 340px;
}

// Step 2: Hint types display
.game-help__hints {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 1.25rem;
  width: 100%;
  max-width: 380px;
}

// Hint timeline with chips
.hint-timeline {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.35rem;
}

// Base hint chip
.hint-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.5rem;
  border-radius: var(--gutenku-radius-md);
  font-size: 0.7rem;
  font-weight: 600;
  opacity: 0;
  animation: hint-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: calc(var(--delay) * 80ms + 150ms);
}

.hint-chip__icon {
  flex-shrink: 0;
  color: oklch(0.55 0.12 195);
}

.hint-chip--unlocked .hint-chip__icon {
  color: white;
  filter: drop-shadow(0 0 2px oklch(1 0 0 / 0.3));
}

.hint-chip--locked .hint-chip__icon {
  color: oklch(0.55 0.02 55);
  opacity: 0.5;
}

.hint-chip__label {
  white-space: nowrap;
}

.hint-chip__lock {
  flex-shrink: 0;
  opacity: 0.7;
}

// Unlocked state
.hint-chip--unlocked {
  background: oklch(0.4 0.1 195 / 0.85);
  border: 1px solid oklch(0.35 0.1 195 / 0.6);
  color: white;
}

[data-theme='dark'] .hint-chip--unlocked {
  background: oklch(0.45 0.1 195 / 0.7);
  border-color: oklch(0.5 0.1 195 / 0.5);

  .hint-chip__icon {
    color: oklch(0.95 0.05 195);
  }
}

[data-theme='dark'] .hint-pool__icon {
  color: oklch(0.6 0.12 195);
}

[data-theme='dark'] .scoring-star {
  color: oklch(0.82 0.18 75);
  fill: oklch(0.85 0.2 75);
  filter:
    drop-shadow(0 0 4px oklch(0.85 0.2 70 / 0.6))
    drop-shadow(0 0 8px oklch(0.7 0.15 60 / 0.3));
}

// Locked state
.hint-chip--locked {
  background: transparent;
  border: 1px dashed oklch(0.7 0.02 55);
  color: oklch(0.55 0.02 55);

  .hint-chip__icon {
    opacity: 0.5;
    filter: grayscale(0.4);
  }
}

[data-theme='dark'] .hint-chip--locked {
  background: oklch(0.2 0.01 55);
  border-color: oklch(0.35 0.02 55);
  color: oklch(0.55 0.02 55);
}

// Possible hints pool
.hint-pool {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.hint-pool__intro {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--gutenku-text-muted);
}

.hint-pool__grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.35rem;
}

.hint-pool__item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.3rem 0.5rem;
  background: oklch(0.95 0.02 55 / 0.5);
  border: 1px solid var(--gutenku-paper-border);
  border-radius: var(--gutenku-radius-xs);
  opacity: 0;
  animation: hint-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: calc(var(--delay) * 50ms + 200ms);
}

[data-theme='dark'] .hint-pool__item {
  background: oklch(0.25 0.02 55 / 0.5);
}

.hint-pool__icon {
  flex-shrink: 0;
  color: oklch(0.5 0.1 195);
}

.hint-pool__label {
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--gutenku-text-secondary);
}

@keyframes hint-pop {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

// Step 3: Lifelines
.game-help__lifelines {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.25rem;
  width: 100%;
  max-width: 280px;
}

.lifeline-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--gutenku-zen-water);
  border: 1px solid var(--gutenku-paper-border);
  border-radius: var(--gutenku-radius-sm);
  width: 100%;

  &--free {
    border-color: var(--gutenku-zen-primary);
    background: oklch(0.55 0.12 145 / 0.1);
  }
}

.lifeline-icon {
  flex-shrink: 0;

  &--sparkles {
    color: oklch(0.65 0.2 85);
    filter: drop-shadow(0 0 4px oklch(0.7 0.2 85 / 0.5));
  }

  &--drama {
    color: oklch(0.55 0.15 280);
    filter: drop-shadow(0 0 4px oklch(0.6 0.15 280 / 0.4));
  }
}

.lifeline-text {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--gutenku-text-primary);
}

.lifeline-cost {
  font-size: 0.7rem;
  font-weight: 600;
  color: oklch(0.55 0.15 45);
  margin-top: 0.25rem;
}

// Step 4: Scoring
.game-help__scoring {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.scoring-stars {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
}

.scoring-star {
  color: oklch(0.78 0.16 75);
  fill: oklch(0.8 0.18 75);
  filter:
    drop-shadow(0 0 3px oklch(0.8 0.2 70 / 0.5))
    drop-shadow(0 1px 2px oklch(0.6 0.15 60 / 0.4));
  animation: stars-glow 2s ease-in-out infinite;
}

@keyframes stars-glow {
  0%, 100% {
    filter:
      drop-shadow(0 0 3px oklch(0.8 0.2 70 / 0.5))
      drop-shadow(0 1px 2px oklch(0.6 0.15 60 / 0.4));
    opacity: 1;
  }
  50% {
    filter:
      drop-shadow(0 0 6px oklch(0.85 0.22 70 / 0.7))
      drop-shadow(0 0 12px oklch(0.7 0.18 60 / 0.4));
    opacity: 0.95;
  }
}

.scoring-legend {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-start;
}

.scoring-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--gutenku-text-secondary);
}

.scoring-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;

  &--good {
    background: var(--gutenku-zen-primary);
  }

  &--bad {
    background: oklch(0.6 0.15 25);
  }
}

.game-help__actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  gap: 1rem;
}

.game-help__footer {
  font-size: 0.8rem;
  font-style: italic;
  margin: 1rem 0 0;
  text-align: center;
}

// Slide transition
.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

@media (prefers-reduced-motion: reduce) {
  .game-help__icon,
  .hint-chip,
  .hint-pool__item,
  .scoring-stars,
  .dot,
  .slide-enter-active,
  .slide-leave-active {
    animation: none;
    transition: none;
    opacity: 1;
    transform: none;
  }
}
</style>
