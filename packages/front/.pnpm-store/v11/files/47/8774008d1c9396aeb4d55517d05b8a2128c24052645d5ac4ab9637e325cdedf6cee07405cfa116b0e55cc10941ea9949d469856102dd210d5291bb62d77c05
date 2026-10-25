import { createHead as createHead$1 } from '@unhead/vue/client';
import { createHead } from '@unhead/vue/server';
import { createSSRApp, createApp } from 'vue';
import { C as ClientOnly, d as documentReady } from '../shared/vite-ssg.ETIvV-80.mjs';
import { d as deserializeState } from '../shared/vite-ssg.C6pK7rvr.mjs';

function ViteSSG(App, fn, options) {
  const {
    transformState,
    registerComponents = true,
    useHead = true,
    rootContainer = "#app"
  } = options ?? {};
  async function createApp$1() {
    const app = import.meta.env.SSR || options?.hydration ? createSSRApp(App) : createApp(App);
    let head;
    if (useHead) {
      app.use(head = import.meta.env.SSR ? createHead() : createHead$1());
    }
    const appRenderCallbacks = [];
    const onSSRAppRendered = import.meta.env.SSR ? (cb) => appRenderCallbacks.push(cb) : () => {
    };
    const triggerOnSSRAppRendered = () => {
      return Promise.all(appRenderCallbacks.map((cb) => cb()));
    };
    const context = {
      app,
      head,
      isClient: !import.meta.env.SSR,
      router: void 0,
      routes: void 0,
      initialState: {},
      onSSRAppRendered,
      triggerOnSSRAppRendered,
      transformState
    };
    if (registerComponents)
      app.component("ClientOnly", ClientOnly);
    if (!import.meta.env.SSR) {
      await documentReady();
      context.initialState = transformState?.(window.__INITIAL_STATE__ || {}) || deserializeState(window.__INITIAL_STATE__);
    }
    await fn?.(context);
    const initialState = context.initialState;
    return {
      ...context,
      initialState
    };
  }
  if (!import.meta.env.SSR) {
    (async () => {
      const { app } = await createApp$1();
      app.mount(rootContainer, true);
    })();
  }
  return createApp$1;
}

export { ViteSSG };
