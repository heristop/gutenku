<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import InkStamp from '@/core/components/ink/InkStamp.vue';
import { useHaikuStore } from '@/features/haiku/store/haiku';
import { useBookRedaction } from '@/features/haiku/composables/book-redaction';
import { getVerseContext } from '@/features/haiku/composables/verse-sources';

const ROMAN = ['i', 'ii', 'iii', 'iv', 'v'];

const { t } = useI18n();
const { haiku, loading, isDailyHaiku } = storeToRefs(useHaikuStore());
const { redacted, reveal } = useBookRedaction();

const label = computed(() =>
  isDailyHaiku.value ? t('haiku.dailyHaiku') : t('haiku.poem.label'),
);

const chapterTitle = computed(() => haiku.value?.chapter?.title?.trim() ?? '');

// Each verse cites where it was cut from: the words around it in the chapter
const sources = computed(() => {
  const value = haiku.value;

  if (!value?.verses?.length || !value.chapter?.content) {
    return [];
  }

  return value.verses.map((verse, index) => ({
    numeral: ROMAN[index] ?? String(index + 1),
    context: getVerseContext(
      value.chapter.content,
      value.rawVerses?.[index] ?? verse,
    ),
  }));
});

const hasSources = computed(() =>
  sources.value.some((source) => source.context !== null),
);

// Re-keys the arrival choreography so every new haiku is typed and stamped anew
const arrivalKey = computed(() => haiku.value?.verses?.join('|') ?? '');

// Redaction bar keeps roughly the title's length without revealing it
const redactedWidth = computed(
  () =>
    `min(${Math.min(Math.max(haiku.value?.book?.title?.length ?? 8, 6), 22)}ch, 45vw)`,
);
</script>

<template>
  <section
    v-if="haiku?.verses?.length"
    class="haiku-poem"
    :class="{
      'haiku-poem--busy': loading,
      'haiku-poem--with-sources': hasSources,
    }"
    :aria-busy="loading"
  >
    <div class="haiku-poem__stage">
      <h1 class="sr-only">{{ label }}</h1>

      <p class="haiku-poem__verses" data-cy="haiku-verses">
        <span
          v-for="(verse, index) in haiku.verses"
          :key="`${index}-${verse}`"
          class="haiku-poem__verse"
          :style="{ '--verse-index': index }"
        >
          {{ verse }}
        </span>
      </p>

      <p class="haiku-poem__signature">
        <span v-if="isDailyHaiku" class="haiku-poem__daily">{{ label }}</span>
        <span class="haiku-poem__cut">
          <i18n-t
            :keypath="
              chapterTitle
                ? 'haiku.poem.signature'
                : 'haiku.poem.signatureNoChapter'
            "
            tag="span"
            scope="global"
          >
            <template #book>
              <button
                v-if="redacted"
                type="button"
                class="haiku-poem__redacted"
                :style="{ width: redactedWidth }"
                :aria-label="t('haiku.poem.reveal')"
                @click="reveal"
              />
              <b v-else class="haiku-poem__book">{{ haiku.book.title }}</b>
            </template>
            <template #chapter
              ><span class="haiku-poem__chapter">{{
                chapterTitle
              }}</span></template
            >
          </i18n-t>
        </span>
        <InkStamp
          :key="arrivalKey"
          label="GK"
          :size="42"
          :tilt="-3"
          stamp
          class="haiku-poem__stamp"
        />
      </p>
    </div>

    <div
      v-if="hasSources"
      role="group"
      class="haiku-poem__sources"
      :aria-label="t('haiku.poem.sources')"
    >
      <h2 class="haiku-poem__sources-title">{{ t('haiku.poem.sources') }}</h2>
      <ol class="haiku-poem__source-list">
        <li
          v-for="source in sources"
          :key="source.numeral"
          class="haiku-poem__source"
        >
          <span class="haiku-poem__numeral">{{ source.numeral }}</span>
          <q v-if="source.context" class="haiku-poem__quote"
            ><template v-if="source.context.clippedStart">…</template
            >{{ source.context.before
            }}<span class="haiku-poem__match">{{ source.context.match }}</span
            >{{ source.context.after
            }}<template v-if="source.context.clippedEnd">…</template></q
          >
          <span v-else class="haiku-poem__quote haiku-poem__quote--none">
            {{ t('haiku.poem.notFound') }}
          </span>
        </li>
      </ol>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.haiku-poem {
  --haiku-redaction-ink: var(--gk-ink);

  display: grid;
  grid-template-columns: minmax(0, 1fr);
  background: var(--gk-paper-raised);
  border-radius: var(--gk-radius-paper);
  box-shadow: var(--gk-lift);
  color: var(--gk-ink);
  font-family: var(--gk-font);
  overflow: clip;
  transition: opacity var(--gk-dur-base) var(--gk-ease-out);

  &--with-sources {
    @media (min-width: 900px) {
      grid-template-columns: minmax(0, 1fr) 300px;
    }
  }

  &--busy {
    opacity: 0.72;
  }

  &__stage {
    container-type: inline-size;
    display: grid;
    align-content: center;
    gap: 1.5rem;
    min-width: 0;
    padding: 2.25rem 2.5rem 2.5rem;

    @media (max-width: 600px) {
      padding: 1.5rem 1.125rem 1.75rem;
      gap: 1.25rem;
    }
  }

  &__daily {
    margin-right: auto;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--gk-ink-soft);
  }

  &__verses {
    display: grid;
    margin: 0;
    // Sized by the leaf, not the window: the stage narrows beside the sources
    // column, and a verse should not fold there
    font-size: clamp(1.375rem, 6.2cqi, 2.25rem);
    line-height: 1.45;
    letter-spacing: -0.025em;
    overflow-wrap: anywhere;
  }

  // Arrival: each line is typed onto the leaf in turn, 60ms apart
  &__verse {
    display: block;
    // A verse that must fold splits into even halves, never one word alone
    text-wrap: balance;
    animation: haiku-verse-in var(--gk-dur-base) var(--gk-ease-out) backwards;
    animation-delay: calc(var(--verse-index, 0) * 60ms);

    &:nth-child(2) {
      padding-left: 2.4em;
    }

    &:nth-child(3) {
      padding-left: 1.2em;
    }

    @media (max-width: 600px) {
      &:nth-child(2) {
        padding-left: 1.4em;
      }

      &:nth-child(3) {
        padding-left: 0.7em;
      }
    }
  }

  &__signature {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 0.875rem;
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--gk-ink-soft);
    text-align: right;

    // Phones: the credit reads from the left, the stamp following it on the
    // same line rather than stranded under it
    @media (max-width: 600px) {
      justify-content: flex-start;
      text-align: left;
    }
  }

  // Revealed title lifts out from under the marker, left to right
  &__book {
    color: var(--gk-ink);
    animation: haiku-ink-lift var(--gk-dur-base) var(--gk-ease-out) backwards;
  }

  // The GK stamp lands once the last line is down (impact at ~430ms)
  & &__stamp {
    animation-delay: 180ms;
  }

  &__chapter {
    white-space: nowrap;
  }

  // A sumi marker stroke over the title; the button keeps a 44px hit area
  &__redacted {
    position: relative;
    display: inline-block;
    max-width: 100%;
    height: 0.95em;
    margin: 0 0.15em;
    padding: 0;
    vertical-align: -0.12em;
    border: 0;
    border-radius: 1px;
    background: transparent;
    cursor: pointer;
    transition: opacity var(--gk-dur-fast) var(--gk-ease-out);

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--haiku-redaction-ink);
      clip-path: polygon(
        0 18%,
        4% 4%,
        50% 10%,
        97% 0,
        100% 80%,
        60% 100%,
        3% 92%
      );
    }

    &::after {
      content: '';
      position: absolute;
      inset: -0.875rem -0.25rem;
    }

    @media (hover: hover) {
      &:hover {
        opacity: 0.8;
      }
    }

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 3px;
    }
  }

  &__sources {
    display: grid;
    gap: 1.125rem;
    align-content: start;
    min-width: 0;
    padding: 1.5rem;
    // A margin note on the same leaf, not a second box
    border-top: var(--gk-rule-faint);

    @media (max-width: 600px) {
      gap: 0.875rem;
      padding: 1.25rem 1.125rem 1.5rem;
    }

    @media (min-width: 900px) {
      border-top: 0;
      border-left: var(--gk-rule-faint);
    }
  }

  &__sources-title {
    margin: 0;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--gk-ink-soft);
  }

  &__source-list {
    display: grid;
    gap: 1rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__source {
    display: grid;
    grid-template-columns: 2em minmax(0, 1fr);
    font-size: 0.875rem;
    line-height: 1.6;
  }

  &__numeral {
    font-weight: 700;
    color: var(--gk-ink);
  }

  &__quote {
    color: var(--gk-ink-soft);
    quotes: none;

    &--none {
      font-style: italic;
    }
  }

  &__match {
    color: var(--gk-ink);
    text-decoration: underline;
    text-decoration-color: var(--gk-ink-faint);
    text-decoration-thickness: 1.5px;
    text-underline-offset: 0.2em;
  }
}

// Night paper: the marker stays sumi-dark instead of turning into a light block
[data-theme='dark'] .haiku-poem {
  --haiku-redaction-ink: color-mix(in oklch, var(--gk-paper-deep), black 55%);
}

@keyframes haiku-verse-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
}

@keyframes haiku-ink-lift {
  from {
    clip-path: inset(0 100% 0 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .haiku-poem,
  .haiku-poem__redacted {
    transition: none;
  }

  .haiku-poem__verse {
    animation-name: haiku-verse-fade;
  }

  .haiku-poem__book {
    animation: none;
  }

  @keyframes haiku-verse-fade {
    from {
      opacity: 0;
    }
  }
}
</style>
