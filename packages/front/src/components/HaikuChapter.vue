<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { load } from '@fingerprintjs/botd';
import { storeToRefs } from 'pinia';
import { useHaikuStore } from '@/store/haiku';
import HighLightText from '@/components/HighLightText.vue';

const { haiku, loading } = storeToRefs(useHaikuStore());

const blackMarker = ref(true);
const isCompacted = ref(true);

function toggle(): void {
  blackMarker.value = !blackMarker.value;
}

function toggleCompactedView(): void {
  isCompacted.value = !isCompacted.value;
}

function getCompactedText(): string {
  if (!haiku.value?.chapter.content || !haiku.value?.rawVerses) return '';

  const content = haiku.value.chapter.content;
  const verses = haiku.value.rawVerses;

  // Split content into sentences/lines
  const lines = content
    .split(/[.!?]+/)
    .filter((line) => line.trim().length > 0);

  let compactedSections: string[] = [];

  verses.forEach((verse) => {
    // Find the line containing this verse
    const verseLineIndex = lines.findIndex((line) =>
      line.includes(verse.trim()),
    );

    if (verseLineIndex !== -1) {
      // Get line before, verse line, and line after
      const prevLine =
        verseLineIndex > 0 ? lines[verseLineIndex - 1].trim() : '';
      const verseLine = lines[verseLineIndex].trim();
      const nextLine =
        verseLineIndex < lines.length - 1
          ? lines[verseLineIndex + 1].trim()
          : '';

      // Create compacted section
      let section = '';
      if (prevLine) section += prevLine + '. ';
      section += verseLine + '.';
      if (nextLine) section += ' ' + nextLine + '.';

      compactedSections.push(section);
    }
  });

  return compactedSections.join('\n\n');
}

onMounted(() => {
  const botdPromise = load();

  botdPromise.then((botd) => {
    if (true === botd.detect().bot) {
      blackMarker.value = false;
    }
  });
});
</script>

<template>
  <v-card v-if="haiku" :loading="loading" class="book-page gutenku-card">
    <!-- Book Header with Toggles -->
    <div class="book-header">
      <div class="disclosure-text">
        Disclose chapter where quotes were extracted
      </div>
      <div class="header-controls">
        <!-- Stabilo Toggle -->
        <v-tooltip
          :disabled="!blackMarker"
          text="Disclose / Hide"
          location="bottom"
          aria-label="Disclose / Hide"
        >
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              :icon="blackMarker ? 'mdi-lightbulb-on' : 'mdi-lightbulb-off'"
              @click="toggle()"
              class="toggle-btn stabilo-toggle"
              alt="Disclose / Hide"
              aria-label="Disclose / Hide"
              title="Disclose / Hide"
              data-cy="light-toggle-btn"
              size="small"
              variant="outlined"
            />
          </template>
        </v-tooltip>

        <!-- Compacted View Toggle -->
        <v-tooltip
          :text="isCompacted ? 'Show Full Chapter' : 'Show Compacted View'"
          location="bottom"
        >
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              :icon="
                isCompacted
                  ? 'mdi-unfold-more-horizontal'
                  : 'mdi-unfold-less-horizontal'
              "
              @click="toggleCompactedView()"
              class="toggle-btn expand-toggle"
              :title="isCompacted ? 'Show Full Chapter' : 'Show Compacted View'"
              size="small"
              variant="outlined"
            />
          </template>
        </v-tooltip>
      </div>
    </div>

    <!-- Book Content -->
    <div class="book-content" @click="toggle()">
      <!-- Book Title -->
      <h1
        :class="{
          'dark-theme': blackMarker,
          'light-theme': !blackMarker,
        }"
        class="book-title"
      >
        {{ haiku.book.title }}
      </h1>

      <!-- Book Author -->
      <div
        :class="{
          'dark-theme': blackMarker,
          'light-theme': !blackMarker,
        }"
        class="book-author"
      >
        {{ haiku.book.author }}
      </div>

      <!-- Chapter Content -->
      <div class="chapter-content">
        <v-expand-transition>
          <div v-if="haiku.chapter.content" class="chapter-sheet">
            <p
              :class="{
                'dark-theme': blackMarker,
                'light-theme': !blackMarker,
              }"
              class="chapter-text"
            >
              <high-light-text
                :text="isCompacted ? getCompactedText() : haiku.chapter.content"
                :lines="haiku.rawVerses"
              />
            </p>
          </div>
        </v-expand-transition>
      </div>
    </div>

    <!-- Optional page number -->
    <div class="page-number">— {{ Math.floor(Math.random() * 200) + 1 }} —</div>
  </v-card>
</template>

<style lang="scss" scoped>
// Import JMH Typewriter font
@font-face {
  font-family: 'JMH Typewriter';
  src: url('@/assets/fonts/JMH Typewriter.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

.book-page {
  box-shadow:
    0 2px 4px -1px rgba(0, 0, 0, 0.2),
    0 4px 5px 0 rgba(0, 0, 0, 0.14),
    0 1px 10px 0 rgba(0, 0, 0, 0.12);

  // Book page background - solid color eliminates highlighting interference
  background: #f8f6f0;
  position: relative;
  padding: 3rem 2rem 2rem 3rem; // More left margin for binding
  margin-bottom: 1.5rem;
  min-height: 500px;
  border-radius: 4px;
  overflow: visible;

  // Page curl effect at bottom-right corner
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

  // Page curl corner fold
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: radial-gradient(
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

  // Subtle page curl at bottom-right
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

  .disclosure-text {
    font-family: 'JMH Typewriter', monospace;
    font-size: 0.9rem;
    color: #5a5a5a;
    font-style: italic;
    margin-bottom: 1rem;
  }

  .header-controls {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    align-items: center;
  }

  .toggle-btn {
    background: rgba(139, 69, 19, 0.1) !important;
    border: 1px solid rgba(139, 69, 19, 0.3);
    transition: all 0.2s ease;

    &:hover {
      background: rgba(139, 69, 19, 0.2) !important;
      transform: scale(1.05);
    }

    &.expand-toggle {
      background: rgba(34, 139, 34, 0.1) !important;
      border: 1px solid rgba(34, 139, 34, 0.3);

      &:hover {
        background: rgba(34, 139, 34, 0.2) !important;
      }
    }
  }
}

.book-content {
  position: relative;
  z-index: 2;
  font-family: 'JMH Typewriter', monospace;
}

.book-title {
  font-family: 'JMH Typewriter', monospace;
  font-size: 2rem;
  font-weight: bold;
  color: #2c1810;
  text-align: center;
  margin: 2rem 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);

  &.dark-theme {
    opacity: 0.3;
    filter: blur(2px);
    transition: all 0.3s ease;
  }

  &.light-theme {
    opacity: 1;
    filter: blur(0);
    transition: all 0.3s ease;
  }
}

.book-author {
  font-family: 'JMH Typewriter', monospace;
  font-size: 1.2rem;
  color: #4a4a4a;
  text-align: center;
  margin-bottom: 2.5rem;
  font-style: italic;

  &::before {
    content: 'by ';
    font-style: normal;
    opacity: 0.7;
  }

  &.dark-theme {
    opacity: 0.3;
    filter: blur(2px);
    transition: all 0.3s ease;
  }

  &.light-theme {
    opacity: 1;
    filter: blur(0);
    transition: all 0.3s ease;
  }
}

.chapter-content {
  max-width: 100%;
  margin: 0 auto;

  .chapter-sheet {
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;

    .chapter-text {
      font-family: 'JMH Typewriter', monospace;
      font-size: 1rem;
      line-height: 1.8;
      color: #2c2c2c;
      text-align: justify;
      margin: 0;
      padding: 1.5rem 0;
      position: relative;

      &.dark-theme {
        // Stabilo marker blackout effect - make text invisible
        color: transparent !important;
        text-shadow: none !important;
        background: linear-gradient(to right, #000 0%, #1a1a1a 100%);
        background-clip: text;
        -webkit-background-clip: text;
        position: relative;
        transition: all 0.5s ease;

        // Create stabilo marker bars over the text
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            transparent,
            transparent 0.1em,
            #000 0.1em,
            #000 1.1em,
            transparent 1.1em,
            transparent 1.2em
          );
          background-size: 100% 1.2em;
          pointer-events: none;
          z-index: 1;
          opacity: 0.8;
        }

        // Hidden mode - haiku verses with completely solid white background
        :deep(mark) {
          background: #ffffff !important;
          background-image: none !important;
          background-clip: border-box !important;
          color: #2c2c2c !important;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: bold;
          position: relative;
          z-index: 20;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          isolation: isolate;
          display: inline-block;
        }

        :deep(.highlight) {
          background: #ffffff !important;
          background-image: none !important;
          background-clip: border-box !important;
          color: #2c2c2c !important;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: bold;
          position: relative;
          z-index: 20;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          isolation: isolate;
          display: inline-block;
        }
      }

      &.light-theme {
        opacity: 1;
        filter: blur(0);
        transition: all 0.5s ease;

        &::before {
          display: none;
        }

        // Revealed mode - haiku verses with completely solid yellow highlighting
        :deep(mark) {
          background: #ffd700 !important;
          background-image: none !important;
          background-clip: border-box !important;
          color: #2c2c2c !important;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: bold;
          position: relative;
          z-index: 20;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          isolation: isolate;
          display: inline-block;
        }

        :deep(.highlight) {
          background: #ffd700 !important;
          background-image: none !important;
          background-clip: border-box !important;
          color: #2c2c2c !important;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: bold;
          position: relative;
          z-index: 20;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          isolation: isolate;
          display: inline-block;
        }
      }
    }
  }
}

// Page number (optional decoration)
.page-number {
  position: absolute;
  bottom: 1rem;
  right: 2rem;
  font-family: 'JMH Typewriter', monospace;
  font-size: 0.8rem;
  color: #888;
  z-index: 3;
}

// Responsive adjustments
@media (max-width: 768px) {
  .book-page {
    padding: 2rem 1.5rem 1.5rem 2rem;
    min-height: 400px;
  }

  .book-title {
    font-size: 1.5rem;
  }

  .book-author {
    font-size: 1rem;
  }

  .chapter-text {
    font-size: 0.9rem;
    line-height: 1.6;
  }
}
</style>
