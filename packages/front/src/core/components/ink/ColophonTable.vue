<script lang="ts" setup>
import InkStamp from './InkStamp.vue';

// The closing page of a book: a ruled record plus a "Stamped" box.
// With `stampLabel` the box is stamped; without it, it shows `emptyLabel`.
withDefaults(
  defineProps<{
    rows: Array<{ label: string; value: string }>;
    boxLabel: string;
    stampLabel?: string;
    emptyLabel?: string;
    animate?: boolean;
  }>(),
  {
    stampLabel: '',
    emptyLabel: '',
    animate: false,
  },
);
</script>

<template>
  <div class="colophon">
    <dl class="colophon__rows">
      <template v-for="row in rows" :key="row.label">
        <dt>{{ row.label }}</dt>
        <dd>
          <slot :name="`value-${row.label}`" :row="row">{{ row.value }}</slot>
        </dd>
      </template>
    </dl>
    <div class="colophon__box" :class="{ 'colophon__box--empty': !stampLabel }">
      <span class="colophon__box-label">{{ boxLabel }}</span>
      <InkStamp
        v-if="stampLabel"
        :label="stampLabel"
        :size="64"
        :tilt="-7"
        :stamp="animate"
        class="colophon__stamp"
      />
      <span v-else class="colophon__empty">{{ emptyLabel }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.colophon {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  border: 3px double var(--gk-ink);
  color: var(--gk-ink);

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }

  &__rows {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    margin: 0;
    font-size: 0.8125rem;

    dt,
    dd {
      padding: 0.5625rem 0.75rem;
      border-bottom: 1px solid var(--gk-ink-faint);
    }

    dt {
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--gk-ink-soft);
      border-right: 1px solid var(--gk-ink-faint);
    }

    dd {
      margin: 0;
      font-variant-numeric: tabular-nums;
      overflow-wrap: anywhere;
    }

    > :nth-last-child(-n + 2) {
      border-bottom: 0;
    }
  }

  &__box {
    display: grid;
    grid-template-rows: auto 1fr;
    place-items: center;
    width: 6.5rem;
    border-left: 3px double var(--gk-ink);

    @media (max-width: 480px) {
      grid-template-rows: none;
      grid-template-columns: auto 1fr;
      width: auto;
      min-height: 5.75rem;
      border-left: 0;
      border-top: 3px double var(--gk-ink);
    }
  }

  &__box-label {
    width: 100%;
    padding: 0.375rem 0;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-align: center;
    text-transform: uppercase;
    border-bottom: 1px solid var(--gk-ink-faint);

    @media (max-width: 480px) {
      display: grid;
      place-items: center;
      align-self: stretch;
      width: auto;
      padding: 0 0.875rem;
      border-bottom: 0;
      border-right: 1px solid var(--gk-ink-faint);
    }
  }

  &__stamp {
    margin: 0.75rem;
  }

  &__empty {
    display: grid;
    place-items: center;
    width: 4rem;
    height: 4rem;
    margin: 0.75rem;
    font-size: 0.75rem;
    line-height: 1.3;
    text-align: center;
    color: var(--gk-ink-soft);
    border: 1.5px dashed var(--gk-ink-faint);
    border-radius: 17%;
    transform: rotate(3deg);
  }
}
</style>
