import { describe, expect, it } from 'vitest';
import { effectScope, nextTick, ref } from 'vue';
import {
  isInkLoading,
  useInkLoading,
  useInkLoadingQuiet,
} from '@/core/composables/ink-loading';

describe('useInkLoading', () => {
  it('shows one book while anything is busy, until its scope ends', async () => {
    const busy = ref(true);
    const scope = effectScope();
    scope.run(() => useInkLoading(busy));

    expect(isInkLoading.value).toBeTruthy();

    busy.value = false;
    await nextTick();
    expect(isInkLoading.value).toBeFalsy();

    busy.value = true;
    await nextTick();
    expect(isInkLoading.value).toBeTruthy();

    // A component that goes away takes its busy report with it
    scope.stop();
    expect(isInkLoading.value).toBeFalsy();
  });

  it('is hushed while a view says its own progress speaks', async () => {
    const busyScope = effectScope();
    busyScope.run(() => useInkLoading(true));
    const quiet = ref(true);
    const quietScope = effectScope();
    quietScope.run(() => useInkLoadingQuiet(quiet));

    expect(isInkLoading.value).toBeFalsy();

    quiet.value = false;
    await nextTick();
    expect(isInkLoading.value).toBeTruthy();

    busyScope.stop();
    quietScope.stop();
    expect(isInkLoading.value).toBeFalsy();
  });

  it('still reports from outside any scope (it then lasts for the page)', async () => {
    const busy = ref(true);
    useInkLoading(busy);

    expect(isInkLoading.value).toBeTruthy();

    busy.value = false;
    await nextTick();
    expect(isInkLoading.value).toBeFalsy();
  });
});
