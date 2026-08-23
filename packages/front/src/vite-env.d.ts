/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_APP_URL?: string;
  readonly VITE_SERVER_HOST?: string;
  readonly VITE_WEBSOCKET_HOST?: string;
  readonly VITE_GA_MEASUREMENT_ID?: string;
  readonly VITE_UMAMI_SRC?: string;
  readonly VITE_UMAMI_WEBSITE_ID?: string;
  readonly VITE_UMAMI_HOST_URL?: string;
  /**
   * Cloudflare Web Analytics token. Cookieless like Umami and cheaper — nothing
   * to host — but page views only: the vendor has no event API.
   */
  readonly VITE_CLOUDFLARE_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}
