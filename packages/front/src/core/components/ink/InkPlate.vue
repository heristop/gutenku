<script lang="ts" setup>
// An illustration "tipped in" like a plate in a library book: drawn on its own
// light leaf with a thin ink rule, even in Night mode. Pass an image (src/srcset)
// or draw inline SVG in the default slot.
withDefaults(
  defineProps<{
    src?: string;
    srcset?: string;
    sizes?: string;
    alt?: string;
    width?: number;
    height?: number;
    caption?: string;
    eager?: boolean;
  }>(),
  {
    src: '',
    srcset: undefined,
    sizes: undefined,
    alt: '',
    width: undefined,
    height: undefined,
    caption: '',
    eager: false,
  },
);
</script>

<template>
  <figure class="ink-plate">
    <div class="ink-plate__leaf">
      <img
        v-if="src"
        class="ink-plate__img"
        :src="src"
        :srcset="srcset"
        :sizes="sizes"
        :alt="alt"
        :width="width"
        :height="height"
        :loading="eager ? 'eager' : 'lazy'"
        decoding="async"
        draggable="false"
      />
      <slot v-else />
    </div>
    <figcaption v-if="caption" class="ink-plate__caption">
      {{ caption }}
    </figcaption>
  </figure>
</template>

<style lang="scss" scoped>
.ink-plate {
  // The plate stays a light printed leaf in both themes
  --plate-leaf: var(--gk-plate-leaf);
  --plate-ink: #27221f;

  margin: 0;
  color: var(--plate-ink);

  &__leaf {
    position: relative;
    padding: 0.625rem;
    background: var(--plate-leaf);
    border-radius: 2px;
    box-shadow: var(--gk-lift);

    // Inner printer's rule
    &::after {
      content: '';
      position: absolute;
      inset: 0.3125rem;
      border: 1px solid rgb(39 34 31 / 0.22);
      pointer-events: none;
    }
  }

  &__img,
  :slotted(svg) {
    display: block;
    width: 100%;
    height: auto;
  }

  &__img {
    mix-blend-mode: multiply;
  }

  &__caption {
    margin-top: 0.5rem;
    font-family: var(--gk-font);
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-align: center;
    color: var(--gk-ink-soft);
  }
}

.ink-plate__leaf {
  // Tipped-in plates read dimmed against night paper
  filter: var(--gk-plate-filter);
}
</style>
