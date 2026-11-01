<script lang="ts" setup>
// A vermilion ribbon on the sheet's left edge, drawn down as the page is read.
// Decorative. Put it inside a positioned sheet whose root runs useScrollReveal:
// that sets `--read` (0 to 1) on the root, which this inherits.
</script>

<template>
  <span class="read-ribbon" aria-hidden="true" />
</template>

<style lang="scss" scoped>
.read-ribbon {
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  overflow: hidden;
  border-radius: var(--gk-radius-paper) 0 0 var(--gk-radius-paper);
  background: var(--gk-ink-faint);
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--gk-stamp);
    transform: scaleY(var(--read, 0));
    transform-origin: 50% 0;
  }
}
</style>
