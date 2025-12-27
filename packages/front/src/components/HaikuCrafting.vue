<script lang="ts" setup>
import { Sparkles, PenTool } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import { useLoadingMessages } from '@/composables/loading-messages';

interface Message {
  text: string;
  timestamp: number;
  emoji: string;
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
  <v-card
    class="book-page gutenku-card haiku-crafting"
    :aria-label="t('haikuCrafting.title')"
    aria-busy="true"
  >
    <!-- Book Header Style for Crafting -->
    <div class="book-header">
      <div class="crafting-text">
        {{ craftingMessage }}
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
                v-motion
                :initial="{ opacity: 0, y: -20 }"
                :enter="{
                  opacity: index > 2 ? 0.6 : 1,
                  y: 0,
                  transition: {
                    duration: 400,
                    delay: index * 50,
                    ease: [0.4, 0, 0.2, 1],
                  },
                }"
                :leave="{
                  opacity: 0,
                  y: 10,
                  transition: { duration: 200, ease: [0.4, 0, 1, 1] },
                }"
                class="craft-message"
                :class="{
                  'latest-message': index === 0,
                  'fade-message': index > 2,
                }"
              >
                <span class="message-emoji">
                  <PenTool
                    v-if="message.emoji === '✨'"
                    :size="18"
                    class="text-primary"
                  />
                  <span v-else>{{ message.emoji }}</span>
                </span>
                <span class="message-text">{{ message.text }}</span>
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="progress-container">
            <v-progress-linear
              indeterminate
              color="primary"
              height="4"
              class="craft-progress"
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
  </v-card>
</template>

<style lang="scss" scoped>
.haiku-crafting.book-page {
  // Book page styling
  box-shadow:
    0 2px 4px -1px oklch(0 0 0 / 0.2),
    0 4px 5px 0 oklch(0 0 0 / 0.14),
    0 1px 10px 0 oklch(0 0 0 / 0.12);

  background: var(--gutenku-paper-bg);
  position: relative;
  padding: 3rem 2rem 2rem 3rem;
  margin-bottom: 1.5rem;
  min-height: 31.25rem;
  border-radius: 4px;
  overflow: visible;

  // Book binding effect
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 2px;
    height: 100%;
    background: linear-gradient(
      to bottom,
      oklch(0 0 0 / 0.1) 0%,
      oklch(0 0 0 / 0.05) 50%,
      oklch(0 0 0 / 0.1) 100%
    );
    box-shadow: 0 0 5px oklch(0 0 0 / 0.2);
    z-index: 1;
  }

  // Page texture
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      radial-gradient(
        circle at 20% 50%,
        oklch(0.51 0.02 85 / 0.3) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 80% 20%,
        oklch(0.51 0.02 85 / 0.3) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 40% 80%,
        oklch(0.51 0.02 85 / 0.3) 0%,
        transparent 50%
      );
    opacity: 0.1;
    pointer-events: none;
    z-index: 1;
  }

  &:hover::before {
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
  padding: 0.75rem 1rem;
  margin: 0;
  background: oklch(1 0 0 / 0.3);
  border-radius: 8px;
  border-left: 3px solid transparent;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.9rem;
  line-height: 1.8;
  color: var(--gutenku-text-primary);
  width: 100%;
  box-sizing: border-box;

  &.latest-message {
    background: oklch(0.65 0.18 145 / 0.15);
    border-left-color: oklch(0.65 0.18 145);
    box-shadow: 0 2px 8px oklch(0.65 0.18 145 / 0.2);

    .message-emoji {
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

.message-emoji {
  font-size: 1.2rem;
  min-width: 2rem;
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
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

.progress-container {
  margin-top: 2rem;
  text-align: center;

  .craft-progress {
    margin: 1rem 0;
    border-radius: 2px;
  }

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

// Animations
@keyframes craft-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

@media (max-width: 768px) {
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
  }

  .message-emoji {
    font-size: 1rem;
    min-width: 1.5rem;
    margin-right: 0.5rem;
  }
}
</style>
