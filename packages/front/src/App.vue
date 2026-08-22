<script lang="ts" setup>
import { onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import PwaInstallBanner from '@/core/components/ui/PwaInstallBanner.vue';
import CookieConsentBanner from '@/core/components/ui/CookieConsentBanner.vue';
import { useCookieConsent } from '@/core/composables/cookie-consent';
import { isAnalyticsEnabled } from '@/services/analytics/config';
import { isNative, isIOS, platform } from '@/utils/capacitor';

const router = useRouter();
const { analyticsAllowed, isConsentRequired } = useCookieConsent();
// No provider configured: loading the chunk would buy nothing but a no-op.
const analyticsEnabled = isAnalyticsEnabled();

const startAnalytics = () =>
  import('@/services/analytics').then(({ initAnalytics }) =>
    initAnalytics(router),
  );

// initAnalytics guards against a second call, so scheduling twice is harmless.
function scheduleAnalytics() {
  if ('requestIdleCallback' in globalThis) {
    // Without the timeout the callback can simply never fire: a page that
    // animates continuously never reports an idle period to the browser.
    requestIdleCallback(() => startAnalytics(), { timeout: 2000 });

    return;
  }

  setTimeout(startAnalytics, 2000);
}

// Accepting mid-session takes effect at once, with no reload and no idle wait.
// Only reachable under a provider that asks; the others start on their own.
watch(analyticsAllowed, (allowed) => {
  if (!allowed || !analyticsEnabled) {
    return;
  }

  startAnalytics().catch(() => {
    // A blocked analytics chunk must never take the page down with it.
  });
});

onMounted(async () => {
  // Native platform initialization
  if (isNative) {
    // Set platform attribute for CSS targeting
    document.documentElement.dataset.platform = platform;

    // For iOS, set the safe area manually since env() doesn't work
    // when webview is not in edge-to-edge mode
    if (isIOS) {
      document.documentElement.style.setProperty(
        '--native-safe-area-top',
        '59px',
      );
    }

    await SplashScreen.hide();

    // Set status bar style
    if (isIOS) {
      await StatusBar.setStyle({ style: Style.Light });
    }
  }

  // Analytics is opt-in for as long as the tag needs a cookie. A cookieless,
  // self-hosted provider is asked no question and starts straight away.
  if (
    analyticsEnabled &&
    (!isConsentRequired.value || analyticsAllowed.value)
  ) {
    scheduleAnalytics();
  }
});
</script>

<template>
  <router-view />
  <client-only>
    <PwaInstallBanner />
    <CookieConsentBanner />
  </client-only>
</template>
