<script lang="ts" setup>
import { useLoadingMessages } from '@/composables/useLoadingMessages';
interface Message {
  text: string;
  timestamp: number;
  emoji: string;
}

defineProps<{
  messages: Message[];
}>();

const { message: craftingMessage } = useLoadingMessages({
  context: 'craft',
  intervalMs: 3000,
});
</script>

<template>
  <v-card class="book-page gutenku-card haiku-crafting">
    <!-- Book Header Style for Crafting -->
    <div class="book-header">
      <div class="crafting-text">{{ craftingMessage }}</div>

      <div class="header-controls">
        <v-icon class="craft-icon" color="primary" size="large">
          mdi-creation
        </v-icon>
      </div>
    </div>

    <!-- Book Content Style for Messages -->
    <div class="book-content">
      <!-- Crafting Title -->
      <h1 class="craft-title">Crafting Your Haiku</h1>

      <!-- Real-time Message Feed -->
      <div class="chapter-content">
        <div class="chapter-sheet">
          <div class="message-feed">
            <TransitionGroup
              name="craft-message"
              tag="div"
              class="message-container"
            >
              <div
                v-for="(message, index) in messages"
                :key="`${message.timestamp}-${index}`"
                class="craft-message"
                :class="{
                  'latest-message': index === 0,
                  'fade-message': index > 2,
                }"
              >
                <span class="message-emoji">
                  <v-icon
                    v-if="message.emoji === '✨'"
                    size="small"
                    color="primary"
                  >
                    mdi-fountain-pen-tip
                  </v-icon>
                  <span v-else>{{ message.emoji }}</span>
                </span>
                <span class="message-text">{{ message.text }}</span>
              </div>
            </TransitionGroup>
          </div>

          <!-- Progress Bar -->
          <div class="progress-container">
            <v-progress-linear
              indeterminate
              color="primary"
              height="4"
              class="craft-progress"
            />
            <div class="progress-text">Generation in progress...</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Page number style -->
    <div class="page-number">— Crafting —</div>
  </v-card>
</template>

<style lang="scss" scoped>
// Import JMH Typewriter font (same as HaikuChapter)
@font-face {
  font-family: 'JMH Typewriter';
  src: url('@/assets/fonts/JMH Typewriter.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

.haiku-crafting.book-page {
  // Same book page styling as HaikuChapter
  box-shadow:
    0 2px 4px -1px rgba(0, 0, 0, 0.2),
    0 4px 5px 0 rgba(0, 0, 0, 0.14),
    0 1px 10px 0 rgba(0, 0, 0, 0.12);

  background: #f8f6f0;
  position: relative;
  padding: 3rem 2rem 2rem 3rem;
  margin-bottom: 1.5rem;
  min-height: 500px;
  border-radius: 4px;
  overflow: visible;

  // Same book binding effect
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 2px;
    height: 100%;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.1) 0%,
      rgba(0, 0, 0, 0.05) 50%,
      rgba(0, 0, 0, 0.1) 100%
    );
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
    z-index: 1;
  }

  // Same page texture
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
        rgba(120, 119, 108, 0.3) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 80% 20%,
        rgba(120, 119, 108, 0.3) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 40% 80%,
        rgba(120, 119, 108, 0.3) 0%,
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
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 1rem;

  .crafting-text {
    font-family: 'JMH Typewriter', monospace;
    font-size: 0.9rem;
    color: #5a5a5a;
    text-transform: uppercase;
    margin-bottom: 1rem;
  }

  .header-controls {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .craft-icon {
    background: rgba(76, 175, 80, 0.1);
    border: 1px solid rgba(76, 175, 80, 0.3);
    border-radius: 50%;
    padding: 1.5rem;
    animation: craft-pulse 2s ease-in-out infinite;
  }
}

.book-content {
  position: relative;
  z-index: 2;
  font-family: 'JMH Typewriter', monospace;
}

.craft-title {
  font-family: 'JMH Typewriter', monospace;
  font-size: 2rem;
  font-weight: bold;
  color: #2c1810;
  text-align: center;
  margin: 2rem 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
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
  font-family: 'JMH Typewriter', monospace;
  height: 340px;
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
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  border-left: 3px solid transparent;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.9rem;
  line-height: 1.8;
  color: #2c2c2c;
  width: 100%;
  box-sizing: border-box;

  &.latest-message {
    background: rgba(76, 175, 80, 0.15);
    border-left-color: rgb(76, 175, 80);
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);

    .message-emoji {
      animation: craft-pulse 1.5s ease-in-out infinite;
    }

    .message-text {
      font-weight: bold;
      color: #1b5e20;
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
  font-family: 'JMH Typewriter', monospace;
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
    font-family: 'JMH Typewriter', monospace;
    font-size: 0.9rem;
    color: #5a5a5a;
    font-style: italic;
  }
}

.page-number {
  position: absolute;
  bottom: 1rem;
  right: 2rem;
  font-family: 'JMH Typewriter', monospace;
  font-size: 0.8rem;
  color: #888;
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

// Transition animations for top-entry messages
.craft-message-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.craft-message-leave-active {
  transition: all 0.3s ease-in;
}

.craft-message-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.craft-message-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

// Responsive adjustments (same as HaikuChapter)
@media (max-width: 768px) {
  .haiku-crafting.book-page {
    padding: 2rem 1.5rem 1.5rem 2rem;
    min-height: 400px;
  }

  .craft-title {
    font-size: 1.5rem;
  }

  .message-feed {
    height: 180px;
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
