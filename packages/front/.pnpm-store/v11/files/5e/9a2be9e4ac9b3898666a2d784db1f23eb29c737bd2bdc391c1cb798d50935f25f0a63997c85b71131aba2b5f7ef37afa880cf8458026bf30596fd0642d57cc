import { createHead as createHead$1 } from '@unhead/vue/client';
import { createHead } from '@unhead/vue/server';
import { createSSRApp, createApp } from 'vue';
import { createRouter, createMemoryHistory, createWebHistory } from 'vue-router';
import { C as ClientOnly, d as documentReady } from './shared/vite-ssg.ETIvV-80.mjs';
import { d as deserializeState } from './shared/vite-ssg.C6pK7rvr.mjs';

function ViteSSG(App, routerOptions, fn, options) {
  const {
    transformState,
    registerComponents = true,
    useHead = true,
    rootContainer = "#app"
  } = options ?? {};
  async function createApp$1(routePath) {
    const app = import.meta.env.SSR || options?.hydration ? createSSRApp(App) : createApp(App);
    let head;
    if (useHead) {
      app.use(head = import.meta.env.SSR ? createHead() : createHead$1());
    }
    const router = createRouter({
      history: import.meta.env.SSR ? createMemoryHistory(routerOptions.base) : createWebHistory(routerOptions.base),
      ...routerOptions
    });
    const { routes } = routerOptions;
    if (registerComponents)
      app.component("ClientOnly", ClientOnly);
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
      router,
      routes,
      onSSRAppRendered,
      triggerOnSSRAppRendered,
      initialState: {},
      transformState,
      routePath
    };
    if (!import.meta.env.SSR) {
      await documentReady();
      context.initialState = transformState?.(window.__INITIAL_STATE__ || {}) || deserializeState(window.__INITIAL_STATE__);
    }
    await fn?.(context);
    app.use(router);
    let entryRoutePath;
    let isFirstRoute = true;
    router.beforeEach((to, from, next) => {
      if (isFirstRoute || entryRoutePath && entryRoutePath === to.path) {
        isFirstRoute = false;
        entryRoutePath = to.path;
        to.meta.state = context.initialState;
      }
      next();
    });
    if (import.meta.env.SSR) {
      const route = context.routePath ?? "/";
      router.push(route);
      await router.isReady();
      context.initialState = router.currentRoute.value.meta.state || {};
    }
    const initialState = context.initialState;
    return {
      ...context,
      initialState
    };
  }
  if (!import.meta.env.SSR) {
    (async () => {
      const { app, router } = await createApp$1();
      await router.isReady();
      app.mount(rootContainer, true);
    })();
  }
  return createApp$1;
}

export { ViteSSG };
