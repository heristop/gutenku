<script lang="ts" setup>
import type { Component } from 'vue';
import { Sparkles } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import { useLoadingMessages } from '@/core/composables/loading-messages';
import ZenCard from '@/core/components/ui/ZenCard.vue';
import ZenProgress from '@/core/components/ui/ZenProgress.vue';
import ZenHaiku from '@/core/components/ui/ZenHaiku.vue';

interface Message {
  text: string;
  timestamp: number;
  icon: Component;
  verses?: string[];
  score?: number;
}

defineProps<{
  messages: Message[];
}>();

const { t } = useI18n();

const { message: craftingMessage } = useLoadingMessages({
  context: 'craft',
  intervalMs: 3000,
});
</script>

<template>
  <ZenCard
    variant="book"
    class="haiku-crafting"
    :aria-label="t('haikuCrafting.title')"
    :loading="true"
  >
    <!-- Book Header Style for Crafting y -->
    <div class="book-header">
      <div v-if="craftingMessage" class="crafting-text">
        <component
          :is="craftingMessage.icon"
          :size="14"
          class="crafting-text-icon"
          aria-hidden="true"
        />
        {{ craftingMessage.text }}
      </div>

      <div class="header-controls" aria-hidden="true">
        <div class="craft-icon-container">
          <Sparkles :size="32" class="craft-icon-svg" />
        </div>
      </div>
    </div>

    <!-- Book Content Style for Messages -->
    <div class="book-content">
      <!-- Crafting Title -->
      <h2 class="craft-title">
        {{ t('haikuCrafting.title') }}
      </h2>

      <!-- Real-time Message Feed -->
      <div class="chapter-content">
        <div class="chapter-sheet">
          <div
            class="message-feed"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            <div class="message-container">
              <div
                v-for="(message, index) in messages"
                :key="`${message.timestamp}-${index}`"
                class="craft-message animate-slide-in"
                :class="{
                  'latest-message': index === 0,
                  'fade-message': index > 2,
                  'has-verses': message.verses?.length,
                }"
                :style="{ animationDelay: `${index * 50}ms` }"
              >
                <span class="message-icon" aria-hidden="true">
                  <component :is="message.icon" :size="18" />
                </span>

                <!-- Verse messages: use ZenHaiku -->
                <ZenHaiku
                  v-if="message.verses?.length"
                  :lines="message.verses"
                  size="sm"
                  :animated="index === 0"
                  class="message-haiku"
                />

                <!-- Regular text messages -->
                <span v-else class="message-text">{{ message.text }}</span>
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="progress-container">
            <ZenProgress
              indeterminate
              :height="4"
              :aria-label="t('haikuCrafting.progress')"
            />
            <div class="progress-text">
              {{ t('haikuCrafting.progress') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Page number style -->
    <div class="page-number">
      {{ t('haikuCrafting.pageNumber') }}
    </div>
  </ZenCard>
</template>

<style lang="scss" scoped>
.haiku-crafting {
  margin-bottom: 1.5rem;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;

  &:hover :deep(.zen-card__paper) {
    opacity: 0.15;
    transition: opacity 0.3s ease;
  }
}

.book-header {
  position: relative;
  z-index: 2;
  text-align: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid oklch(0 0 0 / 0.1);
  padding-bottom: 1rem;

  .crafting-text {
    font-size: 0.9rem;
    color: var(--gutenku-text-muted);
    text-transform: uppercase;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .crafting-text-icon {
    opacity: 0.7;
  }

  .header-controls {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .craft-icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 4rem;
    height: 4rem;
    background: oklch(0.65 0.18 145 / 0.1);
    border: 1px solid oklch(0.65 0.18 145 / 0.3);
    border-radius: 50%;
    animation: craft-pulse 2s ease-in-out infinite;
  }

  .craft-icon-svg {
    color: #2f8a5a;
  }
}

.book-content {
  position: relative;
  z-index: 2;
}

.craft-title {
  font-size: 2rem;
  font-weight: bold;
  color: var(--gutenku-text-primary);
  text-align: center;
  margin: 2rem 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-shadow: 1px 1px 2px oklch(0 0 0 / 0.1);
}

.chapter-content {
  max-width: 100%;
  margin: 0 auto;

  .chapter-sheet {
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
  }
}

.message-feed {
  height: 21.25rem;
  overflow: hidden;
  padding: 1.5rem 0;
  display: flex;
  flex-direction: column-reverse;
}

.message-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.craft-message {
  display: flex;
  align-items: flex-start;
  padding: 0.75rem 1rem 0.75rem 1.25rem;
  margin: 0;
  background: oklch(1 0 0 / 0.3);
  border-radius: var(--gutenku-radius-md);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.9rem;
  line-height: 1.8;
  color: var(--gutenku-text-primary);
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;

  &.latest-message {
    background: oklch(0.65 0.18 145 / 0.12);
    box-shadow: 0 2px 12px oklch(0.65 0.18 145 / 0.15);

    .message-icon {
      animation: craft-pulse 1.5s ease-in-out infinite;
    }

    .message-text {
      font-weight: bold;
      color: var(--gutenku-text-accent);
    }
  }

  &.fade-message {
    opacity: 0.6;
  }
}

.message-icon {
  min-width: 2rem;
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gutenku-zen-primary);
  opacity: 0.8;
}

.message-text {
  flex: 1;
  word-break: break-word;
  text-align: justify;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  max-width: calc(100% - 3rem);
}

.message-haiku {
  flex: 1;
  max-width: calc(100% - 3rem);

  :deep(.zen-haiku) {
    padding: 0.25rem 0;
    background: transparent;
    min-height: auto;
  }

  :deep(.haiku-line) {
    font-size: 0.95rem;
    line-height: 1.6;
  }
}

.craft-message.has-verses {
  align-items: flex-start;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;

  &.latest-message {
    .message-haiku :deep(.haiku-line) {
      font-weight: 500;
    }
  }
}

.progress-container {
  margin-top: 2rem;
  text-align: center;

  .progress-text {
    font-size: 0.9rem;
    color: var(--gutenku-text-muted);
    font-style: italic;
  }
}

.page-number {
  position: absolute;
  bottom: 1rem;
  right: 2rem;
  font-size: 0.8rem;
  color: var(--gutenku-text-muted);
  z-index: 3;
}

@keyframes craft-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes ink-appear {
  0% {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
    filter: blur(2px);
  }
  60% {
    opacity: 0.8;
    transform: translateY(2px) scale(1.01);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes stroke-reveal {
  from {
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
}

.animate-slide-in {
  animation: ink-appear 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: oklch(0.65 0.18 145 / 0.6);
    transform-origin: top;
    animation: stroke-reveal 0.3s ease-out 0.2s forwards;
    transform: scaleY(0);
    border-radius: var(--gutenku-radius-xs);
  }

  &.latest-message::before {
    background: oklch(0.65 0.18 145);
    box-shadow: 0 0 8px oklch(0.65 0.18 145 / 0.4);
  }
}

@media (max-width: 768px) {
  .haiku-crafting {
    width: 100%;
    max-width: 100%;
  }

  .haiku-crafting.book-page {
    padding: 2rem 1.5rem 1.5rem 2rem;
    min-height: 25rem;
  }

  .craft-title {
    font-size: 1.5rem;
  }

  .message-feed {
    height: 11.25rem;
  }

  .craft-message {
    padding: 0.5rem 0.75rem;
    margin: 0.3rem 0;
    font-size: 0.9rem;
    line-height: 1.6;
    max-width: 100%;
  }

  .message-icon {
    min-width: 1.5rem;
    margin-right: 0.5rem;
  }

  .message-text,
  .message-haiku {
    max-width: calc(100% - 2.5rem);
  }

  .progress-container {
    margin-bottom: 1.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .book-header .craft-icon-container {
    animation: none;
  }

  .craft-message.latest-message .message-icon {
    animation: none;
  }

  .animate-slide-in {
    animation: none;
    opacity: 1;
    filter: none;

    &::before {
      animation: none;
      transform: scaleY(1);
    }
  }
}
</style>
