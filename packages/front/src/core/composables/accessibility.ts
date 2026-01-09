import { ref, computed, watchEffect } from 'vue';

const DYSLEXIA_STORAGE_KEY = 'gutenku-dyslexia-enabled';

// Shared state (singleton pattern)
const dyslexiaEnabled = ref(false);
let isInitialized = false;
let fontLoaded = false;

// Lazy load OpenDyslexic font only when needed
async function loadOpenDyslexicFont() {
  if (fontLoaded || import.meta.env.SSR) {
    return;
  }

  try {
    // Dynamically import the font URL (Vite will handle the path)
    const fontModule =
      await import('@/assets/fonts/OpenDyslexic-Regular.woff2');
    const fontUrl = fontModule.default;

    const fontFace = new FontFace('OpenDyslexic', `url(${fontUrl})`, {
      weight: 'normal',
      style: 'normal',
      display: 'swap',
    });

    await fontFace.load();
    document.fonts.add(fontFace);
    fontLoaded = true;
  } catch {
    // Font loading failed silently - fallback fonts will be used
  }
}

function initializeFromStorage() {
  if (import.meta.env.SSR || isInitialized) {
    return;
  }

  const savedDyslexia = localStorage.getItem(DYSLEXIA_STORAGE_KEY);
  dyslexiaEnabled.value = savedDyslexia === 'true';

  isInitialized = true;
}

async function applyDyslexia(enabled: boolean) {
  if (import.meta.env.SSR) {
    return;
  }

  // Load font on-demand when enabling dyslexia mode
  if (enabled) {
    await loadOpenDyslexicFont();
  }

  document.documentElement.setAttribute('data-dyslexia', enabled.toString());
  localStorage.setItem(DYSLEXIA_STORAGE_KEY, enabled.toString());
}

export function useAccessibility() {
  // SSR fallback values
  if (import.meta.env.SSR) {
    return {
      dyslexiaEnabled: computed(() => false),
      toggleDyslexia: () => {},
      setDyslexia: (_enabled: boolean) => {},
    };
  }

  // Initialize on first use
  initializeFromStorage();

  // Watch and apply changes
  watchEffect(() => {
    applyDyslexia(dyslexiaEnabled.value);
  });

  const toggleDyslexia = () => {
    dyslexiaEnabled.value = !dyslexiaEnabled.value;
  };

  const setDyslexia = (enabled: boolean) => {
    dyslexiaEnabled.value = enabled;
  };

  return {
    dyslexiaEnabled: computed(() => dyslexiaEnabled.value),
    toggleDyslexia,
    setDyslexia,
  };
}
