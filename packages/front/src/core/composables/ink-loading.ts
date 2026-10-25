import {
  computed,
  getCurrentScope,
  onScopeDispose,
  ref,
  toValue,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
} from 'vue';

// One loading indicator for the whole site: components report that they are
// busy and the layout shows a single writing book instead of per-card loaders.
const busySources = ref(new Set<symbol>());
// A view whose own progress already speaks (the haiku toolbar while crafting)
// can hush the book, so the page never shows two loaders for one wait
const quietSources = ref(new Set<symbol>());

export const isInkLoading: ComputedRef<boolean> = computed(
  () => busySources.value.size > 0 && quietSources.value.size === 0,
);

function track(
  sources: typeof busySources,
  active: MaybeRefOrGetter<boolean | undefined>,
): void {
  const id = Symbol('ink-loading');

  function set(isActive: boolean): void {
    const next = new Set(sources.value);
    next[isActive ? 'add' : 'delete'](id);
    sources.value = next;
  }

  watch(() => Boolean(toValue(active)), set, { immediate: true });

  if (getCurrentScope()) {
    onScopeDispose(() => set(false));
  }
}

/** Report `busy` to the global indicator for as long as the caller's scope lives. */
export function useInkLoading(
  busy: MaybeRefOrGetter<boolean | undefined>,
): void {
  track(busySources, busy);
}

/** Hide the global indicator while `quiet` holds, for as long as the caller's scope lives. */
export function useInkLoadingQuiet(
  quiet: MaybeRefOrGetter<boolean | undefined>,
): void {
  track(quietSources, quiet);
}
