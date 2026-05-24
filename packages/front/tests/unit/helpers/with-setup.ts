import { createApp, type App } from 'vue';

/**
 * Runs a composable inside a real component setup() so that lifecycle hooks
 * (onMounted, onUnmounted, watchEffect cleanup, etc.) fire deterministically.
 *
 * Returns the composable result plus an `unmount` to trigger teardown.
 */
export function withSetup<T>(composable: () => T): {
  result: T;
  app: App;
  unmount: () => void;
} {
  let result!: T;

  const app = createApp({
    setup() {
      result = composable();
      
return () => null;
    },
  });

  const root = document.createElement('div');
  app.mount(root);

  return {
    result,
    app,
    unmount: () => app.unmount(),
  };
}
