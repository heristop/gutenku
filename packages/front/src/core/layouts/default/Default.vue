<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useHead } from '@unhead/vue';
import { useMediaQuery } from '@vueuse/core';
import DefaultView from './View.vue';
import ZenToast from '@/core/components/ui/ZenToast.vue';
import ThemeToggle from '@/core/components/ThemeToggle.vue';
import AppFooter from '@/core/components/AppFooter.vue';
import InkBrushNav from '@/core/components/ui/InkBrushNav.vue';
import { useLocaleSeo } from '@/core/composables/locale-seo';

const route = useRoute();
const { hreflangLinks, ogLocale, ogLocaleAlternates, htmlLang } =
  useLocaleSeo();

// Disable floating particles for reduced motion or mobile
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
const isMobile = useMediaQuery('(max-width: 767px)');
const showParticles = computed(
  () => !prefersReducedMotion.value && !isMobile.value,
);

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

const canonicalUrl = computed(
  () => `https://gutenku.xyz${route.path === '/' ? '' : route.path}`,
);

// Preload LCP hero image on home page only
const shouldPreloadHeroImage = computed(() => route.path === '/');

useHead({
  title: computed(() => (route.meta.title as string) || 'GutenKu'),
  htmlAttrs: {
    lang: htmlLang,
  },
  link: computed(() => {
    const links: Array<Record<string, string>> = [
      { rel: 'canonical', href: canonicalUrl.value },
      // hreflang alternate links for i18n SEO
      ...hreflangLinks.value,
    ];

    if (shouldPreloadHeroImage.value) {
      links.push({
        rel: 'preload',
        as: 'image',
        href: '/gutenmage-640.webp',
        imagesrcset:
          '/gutenmage-320.webp 320w, /gutenmage-640.webp 640w, /gutenmage-1024.webp 1024w',
        imagesizes: '(max-width: 600px) 240px, (max-width: 768px) 280px, 320px',
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
      // og:locale for current language
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

    // og:locale:alternate for other languages
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
      <ZenToast />
      <header role="banner" class="site-header">
        <ThemeToggle />
      </header>
      <div class="light-beam-overlay" aria-hidden="true" />

      <!-- Floating particles (disabled on mobile and reduced motion) -->
      <div v-if="showParticles" class="floating-particles" aria-hidden="true">
        <div class="floating-particles__particle" />
        <div class="floating-particles__particle" />
        <div class="floating-particles__particle" />
        <div class="floating-particles__particle" />
        <div class="floating-particles__particle" />
        <div class="floating-particles__particle" />
        <div class="floating-particles__particle" />
        <div class="floating-particles__particle" />
      </div>

      <a href="#main-content" class="skip-link" @click.prevent="skipToMain">
        {{ $t('layout.skipLink') }}
      </a>
      <InkBrushNav />
      <default-view />
      <footer role="contentinfo">
        <AppFooter />
      </footer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// CSS containment for decorative elements
.floating-particles {
  contain: strict;
  content-visibility: auto;
}

.light-beam-overlay {
  contain: strict;
}

.gutenku-app__wrap {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: var(--gutenku-app-bg);
  background-image: var(--gutenku-app-bg-image);
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
}

.site-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1000;
  // Let ThemeToggle handle its own positioning
  display: contents;
}

.skip-link {
  position: absolute;
  top: -100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  padding: 0.75rem 1.5rem;
  background: var(--gutenku-zen-primary);
  color: #fff;
  text-decoration: none;
  border-radius: 0 0 8px 8px;
  font-weight: 500;
  transition: top 0.2s ease;

  &:focus {
    top: 0;
    outline: 2px solid var(--gutenku-zen-accent);
    outline-offset: 2px;
  }
}
</style>
