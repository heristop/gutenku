import { ref, computed, watchEffect } from 'vue';

const DYSLEXIA_STORAGE_KEY = 'gutenku-dyslexia-enabled';

// Shared state (singleton pattern)
const dyslexiaEnabled = ref(false);
let isInitialized = false;

function initializeFromStorage() {
  if (import.meta.env.SSR || isInitialized) {
    return;
  }

  const savedDyslexia = localStorage.getItem(DYSLEXIA_STORAGE_KEY);
  dyslexiaEnabled.value = savedDyslexia === 'true';

  isInitialized = true;
}

function applyDyslexia(enabled: boolean) {
  if (import.meta.env.SSR) {
    return;
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
