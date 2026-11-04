<script lang="ts" setup>
import { nextTick, onBeforeUnmount, ref, useTemplateRef } from 'vue';
import InkPlate from '@/core/components/ink/InkPlate.vue';

// Keep the player and source in the initial HTML so crawlers can discover it.
// The native poster is visible immediately; media playback starts on request.
withDefaults(
  defineProps<{
    src: string;
    poster: string;
    alt: string;
    playLabel: string;
    caption?: string;
    duration?: string;
    width?: number;
    height?: number;
  }>(),
  {
    caption: '',
    duration: '',
    width: 1280,
    height: 720,
  },
);

const playing = ref(false);
const video = useTemplateRef<HTMLVideoElement>('video');

async function play(): Promise<void> {
  playing.value = true;
  await nextTick();

  try {
    await video.value?.play();
  } catch {
    // Autoplay refused: the native controls are on screen, the reader presses play
  }
}

onBeforeUnmount(() => video.value?.pause());
</script>

<template>
  <div class="film-plate">
    <InkPlate :caption="caption">
      <div
        class="film-plate__frame"
        :style="{ aspectRatio: `${width} / ${height}` }"
      >
        <video
          ref="video"
          class="film-plate__video"
          :src="src"
          :poster="poster"
          :width="width"
          :height="height"
          :aria-label="alt"
          controls
          controlslist="nodownload"
          playsinline
          preload="none"
          @ended="playing = false"
        />
        <!-- The whole poster is the key: anywhere on it plays the film -->
        <button
          v-if="!playing"
          type="button"
          class="film-plate__poster-key"
          @click="play"
        >
          <span class="film-plate__play">
            <svg
              class="film-plate__glyph"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M7 4.5 19.5 12 7 19.5Z" fill="currentColor" />
            </svg>
            <span class="film-plate__label">{{ playLabel }}</span>
          </span>
          <span
            v-if="duration"
            class="film-plate__duration"
            aria-hidden="true"
            >{{ duration }}</span
          >
        </button>
      </div>
    </InkPlate>
  </div>
</template>

<style lang="scss" scoped>
.film-plate {
  width: 100%;

  &__frame {
    position: relative;
    width: 100%;
    background: var(--gk-paper);
  }

  &__video {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  // The poster is one target; a soft veil under the key on hover, 1px press
  &__poster-key {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 3px;
    }

    @media (hover: hover) {
      &:hover .film-plate__play {
        box-shadow: 0 3px 0 var(--gk-indigo-edge);
        translate: -50% -1px;
      }
    }

    &:active .film-plate__play {
      box-shadow: 0 1px 0 var(--gk-indigo-edge);
      translate: -50% 1px;
    }
  }

  // The indigo key, as everywhere: a 2px edge under it, 1px down while pressed
  &__play {
    position: absolute;
    left: 50%;
    bottom: 1.25rem;
    display: inline-flex;
    align-items: center;
    gap: 0.625rem;
    width: max-content;
    max-width: calc(100% - 2rem);
    min-height: 2.75rem;
    padding: 0 1.25rem 0 1rem;
    border-radius: var(--gk-radius-control);
    background: var(--gk-indigo-fill);
    color: var(--gk-on-indigo-fill);
    font-family: var(--gk-font);
    font-size: 0.9375rem;
    font-weight: 700;
    white-space: nowrap;
    box-shadow: 0 2px 0 var(--gk-indigo-edge);
    translate: -50% 0;
    transition:
      translate var(--gk-dur-press) var(--gk-ease-out),
      box-shadow var(--gk-dur-press) var(--gk-ease-out);
  }

  // A fixed size: no inherited svg rule may stretch the glyph
  &__play &__glyph {
    flex: none;
    display: block;
    width: 1.125rem;
    height: 1.125rem;
  }

  // The running time, typed like a catalogue number on the plate's corner
  &__duration {
    position: absolute;
    right: 0.75rem;
    bottom: 0.75rem;
    padding: 0.125rem 0.5rem;
    background: var(--gk-paper-raised);
    border-radius: 2px;
    box-shadow: var(--gk-lift);
    font-family: var(--gk-font);
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    color: var(--gk-ink);
    font-variant-numeric: tabular-nums;
  }
}

@media (prefers-reduced-motion: reduce) {
  .film-plate__play {
    transition: none;
  }
}
</style>
