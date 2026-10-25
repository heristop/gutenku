<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useHead } from '@unhead/vue';
import DefaultView from './View.vue';
import ZenToast from '@/core/components/ui/ZenToast.vue';
import AppFooter from '@/core/components/AppFooter.vue';
import InkBrushNav from '@/core/components/ui/InkBrushNav.vue';
import InkSpine from '@/core/components/ui/InkSpine.vue';
import InkLoadingIndicator from '@/core/components/ui/InkLoadingIndicator.vue';
import { useLocaleSeo } from '@/core/composables/locale-seo';
import { SITE_URL } from '@/locales/config';

const route = useRoute();
const { hreflangLinks, ogLocale, ogLocaleAlternates, htmlLang } =
  useLocaleSeo();

function skipToMain(): void {
  const targets = [
    'preview-grid',
    'book-page',
    'start-gate',
    'game-hints',
    'main-content',
  ];

  for (const id of targets) {
    const el = document.getElementById(id);

    if (el) {
      el.focus();

      return;
    }
  }
}

const canonicalUrl = computed(() => `${SITE_URL}${route.path}`);

const shouldPreloadHeroImage = computed(() => route.path === '/');

useHead({
  title: computed(() => (route.meta.title as string) || 'GutenKu'),
  htmlAttrs: {
    lang: htmlLang,
  },
  link: computed(() => {
    const links: Array<Record<string, string>> = [
      { rel: 'canonical', href: canonicalUrl.value },
      ...hreflangLinks.value,
    ];

    if (shouldPreloadHeroImage.value) {
      // Must mirror the frontispiece <img> in Home.vue (srcset and sizes):
      // a preload that picks another candidate is fetched for nothing and
      // the image is downloaded twice.
      links.push({
        rel: 'preload',
        as: 'image',
        href: '/gutenmage-320.webp',
        imagesrcset: '/gutenmage-320.webp 320w, /gutenmage-640.webp 640w',
        imagesizes: '(max-width: 600px) 170px, 330px',
      });
    }

    return links;
  }),
  meta: computed(() => {
    const baseMeta: Array<Record<string, string>> = [
      {
        name: 'description',
        content:
          (route.meta.description as string) ||
          'AI Haiku Generator & Literary Games',
      },
      {
        property: 'og:title',
        content: (route.meta.title as string) || 'GutenKu',
      },
      {
        property: 'og:description',
        content:
          (route.meta.description as string) ||
          'AI Haiku Generator & Literary Games',
      },
      {
        property: 'og:url',
        content: canonicalUrl.value,
      },
      {
        property: 'og:locale',
        content: ogLocale.value,
      },
      {
        name: 'twitter:title',
        content: (route.meta.title as string) || 'GutenKu',
      },
      {
        name: 'twitter:description',
        content:
          (route.meta.description as string) ||
          'AI Haiku Generator & Literary Games',
      },
    ];

    for (const altLocale of ogLocaleAlternates.value) {
      baseMeta.push({
        property: 'og:locale:alternate',
        content: altLocale,
      });
    }

    if (route.meta.robots) {
      baseMeta.push({
        name: 'robots',
        content: route.meta.robots as string,
      });
    }

    return baseMeta;
  }),
});
</script>

<template>
  <div class="gutenku-app">
    <div class="gutenku-app__wrap">
      <a href="#main-content" class="skip-link" @click.prevent="skipToMain">
        {{ $t('layout.skipLink') }}
      </a>
      <ZenToast />
      <InkSpine />
      <InkLoadingIndicator />
      <header role="banner" class="site-header">
        <InkBrushNav />
      </header>
      <default-view />
      <AppFooter />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.gutenku-app__wrap {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: var(--gutenku-app-bg);
  background-image: var(--gutenku-app-bg-image);
  background-size: 240px 240px;
  background-repeat: repeat;
  // Safe area padding for landscape orientation (notch sides)
  // Top safe area is handled directly by InkBrushNav component
  padding-left: var(--safe-area-inset-left, env(safe-area-inset-left, 0px));
  padding-right: var(--safe-area-inset-right, env(safe-area-inset-right, 0px));

  // Reserve the left margin for the spine so it never covers content
  @media (min-width: 1024px) {
    padding-left: calc(var(--gk-safe-left) + var(--gk-spine-width));
    --gk-safe-left: var(--safe-area-inset-left, env(safe-area-inset-left, 0px));
  }
}

.site-header {
  position: relative;
  z-index: 10;
}

.skip-link {
  position: absolute;
  top: -100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  padding: 0.75rem 1.5rem;
  background: var(--gk-indigo);
  color: var(--gk-on-indigo);
  font-family: var(--gk-font);
  font-weight: 700;
  text-decoration: none;
  border-radius: 0 0 var(--gk-radius-control) var(--gk-radius-control);
  transition: top var(--gk-dur-fast) var(--gk-ease-out);

  &:focus {
    top: 0;
    outline: 2px solid var(--gk-indigo);
    outline-offset: 2px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skip-link {
    transition: none;
  }
}
</style>
