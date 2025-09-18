<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue';
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

// Handle keyboard accessibility
function handleKeydown(event: KeyboardEvent): void {
  if (event.code === 'Space' || event.code === 'Enter') {
    event.preventDefault();
    toggle();
  }
}

// Generate consistent page number based on haiku data
const pageNumber = computed(() => {
  if (!haiku.value?.book?.title || !haiku.value?.chapter?.title) return 1;

  // Create a simple hash from book and chapter titles for consistency
  const combined = haiku.value.book.title + haiku.value.chapter.title;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash % 200) + 1;
});

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
        {{
          blackMarker
            ? 'Click anywhere on the text to reveal content'
            : 'Click anywhere to hide content'
        }}
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
              :class="{
                'icon-white': blackMarker,
                'icon-black': !blackMarker,
              }"
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
    <div
      class="book-content"
      @click="toggle()"
      @keydown="handleKeydown"
      tabindex="0"
      role="button"
      :aria-label="
        blackMarker
          ? 'Click to reveal hidden text content'
          : 'Click to hide text content'
      "
      :aria-pressed="!blackMarker"
    >
      <!-- Book Title -->
      <h1
        :class="{
          'stabilo-hidden': blackMarker,
          'stabilo-visible': !blackMarker,
        }"
        class="book-title"
      >
        {{ haiku.book.title }}
      </h1>

      <!-- Book Author -->
      <div
        :class="{
          'stabilo-hidden': blackMarker,
          'stabilo-visible': !blackMarker,
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
                'stabilo-hidden': blackMarker,
                'stabilo-visible': !blackMarker,
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
    <div class="page-number">— {{ pageNumber }} —</div>
  </v-card>
</template>

<style lang="scss" scoped>
.book-page {
  box-shadow:
    0 2px 4px -1px rgba(0, 0, 0, 0.2),
    0 4px 5px 0 rgba(0, 0, 0, 0.14),
    0 1px 10px 0 rgba(0, 0, 0, 0.12);

  // Book page background - solid color eliminates highlighting interference
  background: var(--gutenku-paper-bg);
  position: relative;
  padding: 3rem 2rem 2rem 3rem;
  margin-bottom: 1.5rem;
  min-height: 500px;
  border-radius: 4px;
  overflow: visible;
  transition: all 0.3s ease;
  cursor: pointer;

  // Enhanced hover effect for entire card
  &:hover {
    transform: translateY(-3px) scale(1.01);
    box-shadow:
      0 8px 25px rgba(0, 0, 0, 0.3),
      0 4px 10px rgba(0, 0, 0, 0.2);

    // Light mode hover brightening
    background: color-mix(in srgb, var(--gutenku-paper-bg) 92%, white 8%);
  }

  // Active state for entire card
  &:active {
    transform: translateY(-1px) scale(0.99);
    transition: all 0.1s ease;
  }

  // Dark mode specific enhancements
  [data-theme='dark'] & {
    &:hover {
      background: color-mix(in srgb, var(--gutenku-paper-bg) 88%, white 12%);
      box-shadow:
        0 12px 35px rgba(0, 0, 0, 0.4),
        0 6px 15px rgba(0, 0, 0, 0.3);
    }
  }

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
  border-bottom: 1px solid var(--gutenku-border-visible);
  padding-bottom: 1rem;

  .disclosure-text {
    font-size: 0.9rem;
    color: var(--gutenku-text-muted);
    text-transform: uppercase;
    margin-bottom: 1rem;
  }

  .header-controls {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    align-items: center;
  }

  .toggle-btn {
    background: var(--gutenku-btn-subtle-bg) !important;
    border: 1px solid var(--gutenku-border-visible);
    color: var(--gutenku-text-contrast) !important;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    box-shadow: var(--gutenku-shadow-light);
    transition: var(--gutenku-transition-zen);
    cursor: pointer !important;

    &,
    *,
    .v-icon,
    .v-icon::before,
    .v-icon::after {
      cursor: pointer !important;
    }

    &:hover {
      background: var(--gutenku-btn-subtle-hover) !important;
      border-color: var(--gutenku-border-visible-hover);
      transform: translateY(-2px) scale(1.05);
      box-shadow: var(--gutenku-shadow-ink);
    }

    &:active {
      transform: translateY(0) scale(0.95);
      transition: var(--gutenku-transition-fast);
    }

    &:focus-visible {
      outline: 2px solid var(--gutenku-zen-accent);
      outline-offset: 2px;
    }

    .v-icon {
      transition: var(--gutenku-transition-zen);
    }

    &:hover .v-icon {
      transform: rotate(12deg) scale(1.1);
    }

    &.expand-toggle {
      background: var(--gutenku-btn-expand-bg) !important;
      border: 1px solid var(--gutenku-border-visible);

      &:hover {
        background: var(--gutenku-btn-expand-hover) !important;
        border-color: var(--gutenku-border-visible-hover);
      }

      // Dynamic icon colors based on stabilo mode
      &.icon-white .v-icon {
        color: #ffffff !important;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
      }

      &.icon-black .v-icon {
        color: #000000 !important;
        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
      }
    }
  }
}

@media (max-width: 768px) {
  .book-header {
    .toggle-btn {
      width: 36px;
      height: 36px;
    }
  }
}

.book-content {
  position: relative;
  z-index: 2;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;

  // Theme-aware cursor colors
  &:hover {
    cursor:
      url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>'),
      auto;
  }

  // Dark mode cursor
  [data-theme='dark'] & {
    &:hover {
      cursor:
        url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>'),
        auto;
    }
  }

  &:focus {
    outline: none;
  }
}

.book-title {
  font-size: 2rem;
  font-weight: bold;
  color: var(--gutenku-text-primary);
  text-align: center;
  margin: 2rem 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);

  &.stabilo-hidden {
    opacity: 0.3;
    filter: blur(2px);
    transition: all 0.3s ease;
  }

  &.stabilo-visible {
    opacity: 1;
    filter: blur(0);
    transition: all 0.3s ease;
  }
}

.book-author {
  font-size: 1.2rem;
  color: var(--gutenku-text-secondary);
  text-align: center;
  margin-bottom: 2.5rem;
  font-style: italic;

  &::before {
    content: 'by ';
    font-style: normal;
    opacity: 0.7;
  }

  &.stabilo-hidden {
    opacity: 0.3;
    filter: blur(2px);
    transition: all 0.3s ease;
  }

  &.stabilo-visible {
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
      font-size: 1rem;
      line-height: 1.8;
      color: var(--gutenku-text-primary);
      text-align: justify;
      margin: 0;
      padding: 1.5rem 0;
      position: relative;

      &.stabilo-hidden {
        // Stabilo effect that works in both light and dark themes
        position: relative;
        transition: all 0.5s ease;
        opacity: 0.8;

        // Remove any container-level styling that affects empty areas
        background: none !important;

        // Apply stabilo effect only to actual text content - hide text behind black lines
        :deep(*:not(br):not(:empty)) {
          background: repeating-linear-gradient(
            transparent,
            transparent 0.1em,
            #000 0.1em,
            #000 1.1em,
            transparent 1.1em,
            transparent 1.2em
          );
          background-size: 100% 1.2em;
          color: transparent;
          text-shadow: 0 0 0 #000;
          display: inline;
        }

        // Ensure empty elements get no styling
        :deep(br),
        :deep(:empty) {
          background: none !important;
        }

        // Remove the overlay that creates black lines everywhere
        &::before {
          display: none !important;
        }

        // Hidden mode - haiku verses with theme-aware background
        :deep(mark) {
          background: var(--gutenku-paper-bg) !important;
          background-image: none !important;
          background-clip: border-box !important;
          color: var(--gutenku-text-primary) !important;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: bold;
          position: relative;
          z-index: 20;
          text-shadow: none !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          isolation: isolate;
          display: inline-block;
        }

        :deep(.highlight) {
          background: var(--gutenku-paper-bg) !important;
          background-image: none !important;
          background-clip: border-box !important;
          color: var(--gutenku-text-primary) !important;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: bold;
          position: relative;
          z-index: 20;
          text-shadow: none !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          isolation: isolate;
          display: inline-block;
        }
      }

      &.stabilo-visible {
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
          padding: 2px 8px;
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
          padding: 2px 8px;
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

// Page number
.page-number {
  position: absolute;
  bottom: 1rem;
  right: 2rem;
  font-size: 0.8rem;
  color: var(--gutenku-text-muted);
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
