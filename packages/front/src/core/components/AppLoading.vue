<script lang="ts" setup>
import { computed, ref, watch, type PropType, type Component } from 'vue';
import { useI18n } from 'vue-i18n';
import { CloudOff, RefreshCw, Sparkles } from 'lucide-vue-next';
import ZenButton from '@/core/components/ui/ZenButton.vue';
import InkDropLoader from '@/core/components/InkDropLoader.vue';
import SumieCat from '@/core/components/decorative/SumieCat.vue';
import {
  useLoadingMessages,
  type LoadingMessage,
} from '@/core/composables/loading-messages';
import { useTheme } from '@/core/composables/theme';
import logoUrl from '@/assets/img/logo/gutenku-logo-300.png';

const { t } = useI18n();

const props = defineProps({
  splash: {
    type: Boolean,
    required: false,
    default: false,
  },
  text: {
    type: String,
    required: false,
    default: '',
  },
  error: {
    type: Boolean,
    required: false,
    default: false,
  },
  onRetry: {
    type: Function as PropType<() => void>,
    required: false,
    default: null,
  },
  retryLabel: {
    type: String,
    required: false,
    default: '',
  },
});

const { message: randomMessage } = useLoadingMessages({ context: 'default' });

const defaultMessage: LoadingMessage = { icon: Sparkles, text: '' };

const displayMessage = computed<LoadingMessage>(() => {
  if (props.text) {
    return { icon: Sparkles, text: props.text };
  }
  return randomMessage.value ?? defaultMessage;
});

const { isDarkMode } = useTheme();

// Track message changes for transitions
const currentMessage = ref<LoadingMessage>(displayMessage.value);
const messageKey = ref(0);

watch(displayMessage, (newMessage) => {
  if (newMessage.text !== currentMessage.value.text) {
    messageKey.value++;
    currentMessage.value = newMessage;
  }
});

const currentIcon = computed<Component>(() => currentMessage.value.icon);
</script>

<template>
  <div
    class="loading"
    :class="{ 'loading--dark': isDarkMode }"
    role="dialog"
    aria-modal="true"
    aria-busy="true"
    aria-labelledby="loading-text"
  >
    <!-- Backdrop -->
    <div
      v-motion
      :initial="{ opacity: 0 }"
      :enter="{
        opacity: 1,
        transition: { duration: 600, ease: 'easeOut' },
      }"
      class="loading-backdrop"
      aria-hidden="true"
    />

    <!-- Main content -->
    <div
      v-motion
      :initial="{ opacity: 0, y: 20, scale: 0.95 }"
      :enter="{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 600, delay: 150, ease: [0.25, 0.8, 0.25, 1] },
      }"
      class="loading-content"
    >
      <!-- Inline mode (non-splash) -->
      <div v-if="!splash" class="loading-inline" aria-hidden="true">
        <CloudOff
          v-if="error"
          :size="48"
          class="loading-icon loading-icon--error"
        />
        <InkDropLoader v-else :size="80" />
      </div>

      <!-- Splash mode -->
      <div v-if="displayMessage.text" class="loading-splash-wrapper">
        <SumieCat v-if="!error" :duration="20" />
        <div class="loading-splash">
        <div class="loading-particles" aria-hidden="true">
          <div v-for="i in 6" :key="i" :class="`particle particle-${i}`" />
        </div>

        <!-- Logo -->
        <div class="logo-container" aria-hidden="true">
          <img
            :src="logoUrl"
            alt=""
            class="loading-logo"
            :style="{ viewTransitionName: 'gutenku-logo' }"
          />
        </div>

        <!-- Loader -->
        <div class="loading-loader" aria-hidden="true">
          <InkDropLoader v-if="!error" :size="70" />
          <CloudOff v-else :size="52" class="loading-icon--error" />
        </div>

        <!-- Progress bar -->
        <div
          v-if="!error"
          class="loading-progress"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Loading progress"
        />

        <!-- Message -->
        <div class="loading-message-container">
          <Transition name="message-fade" mode="out-in">
            <p
              :key="messageKey"
              class="loading-message"
              :class="{ 'loading-message--error': error }"
            >
              <component
                v-if="!error"
                :is="currentIcon"
                :size="16"
                class="loading-message-icon"
                aria-hidden="true"
              />
              <output id="loading-text" aria-live="polite">
                {{ currentMessage.text }}
              </output>
            </p>
          </Transition>
        </div>

        <!-- Brush stroke divider -->
        <div v-if="!error" class="loading-divider" aria-hidden="true" />

        <!-- Retry button for errors -->
        <ZenButton
          v-if="error && onRetry"
          class="loading-retry"
          @click="onRetry"
        >
          <template #icon-left>
            <RefreshCw :size="18" />
          </template>
          {{ retryLabel || t('common.retry') }}
        </ZenButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// Base layout
.loading {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-backdrop {
  position: absolute;
  inset: 0;
  background-color: var(--gutenku-app-bg);
  background-image: var(--gutenku-app-bg-image);
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  transition: var(--gutenku-transition-zen);
}

.loading-content {
  position: relative;
  z-index: 2;
  text-align: center;
}

// Inline mode (non-splash)
.loading-inline {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gutenku-zen-primary);
}

// Splash wrapper for cat positioning
.loading-splash-wrapper {
  position: relative;
}

// Splash card
.loading-splash {
  position: relative;
  background: var(--gutenku-paper-bg);
  border-radius: var(--gutenku-radius-xl);
  padding: 2rem 2.5rem;
  box-shadow: var(--gutenku-shadow-zen);
  border: 1px solid var(--gutenku-paper-border);
  min-width: 20rem;
  max-width: 24rem;
  backdrop-filter: blur(12px);
  overflow: hidden;
  margin: 0 1.5rem;

  @media (min-width: 600px) {
    margin: 0;
  }
}

.loading-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: var(--gutenku-zen-ink, oklch(0.3 0.02 260));
  border-radius: 50%;
  opacity: 0;
  animation: particle-float var(--duration) ease-in-out infinite;
  animation-delay: var(--delay);
  left: var(--start-x);
  top: var(--start-y);
}

.particle-1 {
  --delay: 0s;
  --duration: 18s;
  --start-x: 15%;
  --start-y: 25%;
  --drift-x: 12px;
  --drift-y: -8px;
}

.particle-2 {
  --delay: 2.5s;
  --duration: 20s;
  --start-x: 75%;
  --start-y: 35%;
  --drift-x: -15px;
  --drift-y: 6px;
}

.particle-3 {
  --delay: 5s;
  --duration: 22s;
  --start-x: 45%;
  --start-y: 65%;
  --drift-x: 8px;
  --drift-y: -12px;
}

.particle-4 {
  --delay: 7.5s;
  --duration: 24s;
  --start-x: 85%;
  --start-y: 55%;
  --drift-x: -10px;
  --drift-y: -5px;
}

.particle-5 {
  --delay: 10s;
  --duration: 26s;
  --start-x: 25%;
  --start-y: 75%;
  --drift-x: 14px;
  --drift-y: 10px;
}

.particle-6 {
  --delay: 12.5s;
  --duration: 28s;
  --start-x: 60%;
  --start-y: 20%;
  --drift-x: -8px;
  --drift-y: 12px;
}

@keyframes particle-float {
  0%,
  100% {
    opacity: 0;
    transform: translate(0, 0) scale(0.5);
  }
  10% {
    opacity: 0.15;
  }
  50% {
    opacity: 0.1;
    transform: translate(var(--drift-x), var(--drift-y)) scale(1);
  }
  90% {
    opacity: 0.15;
  }
}

// Logo
.logo-container {
  background: var(--gutenku-paper-bg-warm);
  border-radius: var(--gutenku-radius-md);
  padding: 1rem 1.5rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 1px 2px oklch(0 0 0 / 0.05);
}

.loading-logo {
  height: 52px;
  width: auto;
}

// Loader section
.loading-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 0 1.25rem;
  min-height: 100px;
  color: var(--gutenku-zen-primary);
}

// Progress bar (ink wash style)
.loading-progress {
  height: 4px;
  margin: 0 1rem 1rem;
  border-radius: var(--gutenku-radius-sm);
  position: relative;
  overflow: hidden;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--gutenku-zen-primary) 15%,
    var(--gutenku-zen-primary) 85%,
    transparent 100%
  );
  animation: progress-breathe 4s ease-in-out infinite;

  // Soft glow
  &::after {
    content: '';
    position: absolute;
    inset: -2px;
    background: inherit;
    filter: blur(4px);
    opacity: 0.4;
    z-index: -1;
  }
}

@keyframes progress-breathe {
  0%,
  100% {
    opacity: 0.7;
    transform: scaleX(0.92);
  }
  50% {
    opacity: 1;
    transform: scaleX(1);
  }
}

// Message
.loading-message-container {
  position: relative;
  min-height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.5rem;
}

.loading-message {
  font-size: 0.95rem;
  font-weight: 400;
  font-style: italic;
  line-height: 1.5;
  color: var(--gutenku-text-zen, oklch(0.4 0.02 60));
  margin: 0;
  padding: 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &--error {
    color: oklch(0.5 0.12 30);
    font-style: normal;
    font-weight: 500;
  }
}

.loading-message-icon {
  flex-shrink: 0;
  opacity: 0.7;
  color: var(--gutenku-zen-primary);
}

// Message transition
.message-fade-enter-active,
.message-fade-leave-active {
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;
}

.message-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.message-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

// Brush stroke divider
.loading-divider {
  height: 2px;
  margin: 0.75rem 2rem 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--gutenku-zen-ink, oklch(0.35 0.02 260 / 0.3)) 20%,
    var(--gutenku-zen-ink, oklch(0.35 0.02 260 / 0.5)) 50%,
    var(--gutenku-zen-ink, oklch(0.35 0.02 260 / 0.3)) 80%,
    transparent 100%
  );
  border-radius: 1px;
  animation: divider-draw 1.2s ease-out forwards;
  transform-origin: center;
}

@keyframes divider-draw {
  0% {
    transform: scaleX(0);
    opacity: 0;
  }
  100% {
    transform: scaleX(1);
    opacity: 1;
  }
}

// Error state (ink bleed style)
.loading-icon--error {
  color: oklch(0.5 0.1 35);
  animation: ink-bleed 3s ease-in-out infinite;
}

@keyframes ink-bleed {
  0%,
  100% {
    filter: blur(0);
    transform: scale(1);
    opacity: 0.85;
  }
  50% {
    filter: blur(0.5px);
    transform: scale(1.03);
    opacity: 1;
  }
}

// Retry button
.loading-retry {
  margin-top: 1.25rem;

  :deep(svg) {
    transition: transform 0.3s ease;
  }

  &:hover :deep(svg) {
    transform: rotate(45deg);
  }

  &:active :deep(svg) {
    transform: rotate(360deg);
    transition: transform 0.5s ease;
  }
}

// Dark theme
.loading--dark {
  .loading-splash {
    box-shadow:
      var(--gutenku-shadow-zen),
      0 0 60px oklch(0 0 0 / 0.3);
  }

  .logo-container {
    box-shadow: inset 0 1px 2px oklch(0 0 0 / 0.2);
  }

  .particle {
    background: var(--gutenku-zen-accent, oklch(0.7 0.04 195));
  }

  .loading-message {
    color: var(--gutenku-text-zen, oklch(0.75 0.02 60));

    &--error {
      color: oklch(0.65 0.12 30);
    }
  }

  .loading-divider {
    background: linear-gradient(
      90deg,
      transparent 0%,
      oklch(0.6 0.03 195 / 0.25) 20%,
      oklch(0.6 0.03 195 / 0.4) 50%,
      oklch(0.6 0.03 195 / 0.25) 80%,
      transparent 100%
    );
  }

  .loading-icon--error {
    color: oklch(0.6 0.12 35);
  }
}

// Non-splash mode (inline loading)
.loading:not(:has(.loading-splash)) {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);

  .loading-backdrop {
    display: none;
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .loading-progress {
    animation: none;
    opacity: 0.85;
    transform: scaleX(1);
  }

  .particle {
    animation: none !important;
    opacity: 0.1;
  }

  .loading-divider {
    animation: none;
    opacity: 1;
    transform: scaleX(1);
  }

  .loading-icon--error {
    animation: none;
    opacity: 1;
    filter: none;
  }

  .message-fade-enter-active,
  .message-fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .message-fade-enter-from,
  .message-fade-leave-to {
    transform: none;
  }
}
</style>
