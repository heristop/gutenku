<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';
import { storeToRefs } from 'pinia';
import { MessageSquare, ChevronUp, Copy, Check } from 'lucide-vue-next';
import { useHaikuStore } from '@/store/haiku';
import { useExpandedState } from '@/composables/local-storage';
import { useInView } from '@/composables/in-view';
import { useClipboard } from '@/composables/clipboard';
import ZenCard from '@/components/ui/ZenCard.vue';

const cardRef = useTemplateRef<HTMLElement>('cardRef');
const { isInView } = useInView(cardRef, { delay: 300 });

const store = useHaikuStore();
const { haiku } = storeToRefs(store);

const { value: expanded, toggle: togglePanel } = useExpandedState('discordPanel-expanded');
const { copy, copied } = useClipboard();

const maskedTitle = computed(() => {
  if (!haiku.value?.book?.title) {return '';}
  const bookTitle = haiku.value.book.title;
  const vowels = 'aeiouyAEIOUY';
  let nonMaskedVowel = '';

  for (const char of bookTitle) {
    if (vowels.includes(char)) {
      nonMaskedVowel = char;
      break;
    }
  }

  if (!nonMaskedVowel) {return bookTitle;}

  return bookTitle.replaceAll(
    new RegExp(`[^ ${nonMaskedVowel}]`, 'gi'),
    '*',
  );
});

const hashtagAuthor = computed(() => {
  if (!haiku.value?.book?.author) {return '';}
  return haiku.value.book.author
    .toLowerCase()
    .replaceAll(/\s|,|-|\.|\(|\)/g, '');
});

const caption = computed(() => {
  if (!haiku.value) {return '';}

  const h = haiku.value;
  const lines = [
    `🌸 "${h.title || 'Untitled'}" 🗻`,
    `✨ A haiku woven from the words of ${maskedTitle.value} by ${h.book?.author || 'Unknown'}`,
    `📔 Bookmojis: ${h.book?.emoticons || '📚'}`,
    '',
    '---',
    '',
  ];

  if (h.translations?.fr) {
    lines.push('🇫🇷', h.translations.fr, '');
  }
  if (h.translations?.jp) {
    lines.push('🇯🇵', h.translations.jp, '');
  }
  if (h.translations?.es) {
    lines.push('🇪🇸', h.translations.es, '');
  }

  if (h.translations?.fr || h.translations?.jp || h.translations?.es) {
    lines.push('---', '');
  }

  if (h.hashtags) {
    lines.push(`🏷️ ${h.hashtags} #${hashtagAuthor.value} #gutenku #haiku #poetry #literature`, '');
    lines.push('---', '');
  }

  if (h.description) {
    lines.push(`👩‍🏫 "${h.description}"`, '');
    lines.push('🤖✒️ Analysis Written by BotenKu, Your devoted Bot Literature Teacher', '');
    lines.push('---');
  }

  return lines.join('\n');
});

function copyCaption() {
  copy(caption.value);
}
</script>

<template>
  <ZenCard
    ref="cardRef"
    variant="panel"
    aria-label="Discord Preview"
    class="discord-panel discord-panel--card pa-5 mb-6 animate-in"
    :class="{ 'is-visible': isInView }"
  >
    <button
      type="button"
      class="discord-panel__header d-flex align-center mb-2"
      :aria-expanded="expanded"
      aria-controls="discord-panel-content"
      aria-label="Discord Preview"
      @click="togglePanel"
    >
      <MessageSquare
        :size="28"
        class="discord-panel__icon discord-panel__icon--main mr-2 text-primary"
      />
      <div class="discord-panel__header-content flex-grow-1">
        <div class="discord-panel__title text-subtitle-1">Discord Preview</div>
        <div class="discord-panel__subtitle text-body-2 text-medium-emphasis">
          Dev mode only
        </div>
      </div>
      <ChevronUp
        :size="24"
        class="discord-panel__toggle-icon text-primary"
        :class="{ 'discord-panel__toggle-icon--rotated': !expanded }"
      />
    </button>

    <v-expand-transition>
      <div
        v-show="expanded"
        id="discord-panel-content"
        class="discord-panel__content"
      >
        <div class="discord-panel__preview">
          <div class="discord-panel__caption">
            <pre class="discord-panel__caption-text">{{ caption }}</pre>
          </div>
          <v-btn
            class="discord-panel__copy-btn mt-3"
            :color="copied ? 'success' : 'primary'"
            variant="elevated"
            block
            @click="copyCaption"
          >
            <component :is="copied ? Check : Copy" :size="18" class="mr-2" />
            {{ copied ? 'Copied!' : 'Copy Caption' }}
          </v-btn>
        </div>
      </div>
    </v-expand-transition>
  </ZenCard>
</template>

<style scoped lang="scss">
.discord-panel {
  position: relative;

  &__header {
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: var(--gutenku-radius-sm);

    &:hover {
      background: color-mix(in oklch, var(--gutenku-theme-primary-oklch) 5%, transparent);
    }

    &:focus-visible {
      outline: 2px solid var(--gutenku-zen-primary);
      outline-offset: 2px;
    }
  }

  &__title {
    font-family: 'JMH Typewriter', monospace !important;
    letter-spacing: 0.5px;
  }

  &__toggle-icon {
    transition: transform 0.2s ease;

    &--rotated {
      transform: rotate(180deg);
    }
  }

  &__content {
    padding-top: 0.5rem;
  }

  &__preview {
    background: #36393f;
    border-radius: var(--gutenku-radius-md);
    padding: 1rem;
    border: 1px solid #202225;
  }

  &__caption {
    max-height: 400px;
    overflow-y: auto;
  }

  &__caption-text {
    font-family: 'Whitney', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 0.9rem;
    line-height: 1.4;
    color: #dcddde;
    white-space: pre-wrap;
    word-break: break-word;
    margin: 0;
    background: transparent;
  }

  &__copy-btn {
    width: 100%;
  }
}
</style>
