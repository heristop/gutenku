<script lang="ts" setup>
import { onMounted } from 'vue';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import PwaInstallBanner from '@/core/components/ui/PwaInstallBanner.vue';
import { isNative, isIOS, platform } from '@/utils/capacitor';

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

  // Defer analytics to idle callback (client-side only)
  if ('requestIdleCallback' in globalThis) {
    requestIdleCallback(() => import('./analytics-setup'));
    return;
  }

  setTimeout(() => import('./analytics-setup'), 2000);
});
</script>

<template>
  <router-view />
  <client-only>
    <PwaInstallBanner />
  </client-only>
</template>
