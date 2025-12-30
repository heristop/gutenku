// Audio feedback for game events
import { ref, computed } from 'vue';

const SOUND_MUTED_KEY = 'gutenguess-sound-muted';

// Lazy-loaded audio element
let victoryAudio: HTMLAudioElement | null = null;
let isPreloaded = false;

function loadMutedPreference(): boolean {
  try {
    return localStorage.getItem(SOUND_MUTED_KEY) === 'true';
  } catch {
    return false;
  }
}

function saveMutedPreference(muted: boolean): void {
  try {
    localStorage.setItem(SOUND_MUTED_KEY, String(muted));
  } catch {
    // Silently fail if localStorage not available
  }
}

// Shared reactive state
const isMutedState = ref(loadMutedPreference());

export function useAudioFeedback() {
  const isMuted = computed(() => isMutedState.value);

  function getVictoryAudio(): HTMLAudioElement | null {
    if (victoryAudio) {
      return victoryAudio;
    }

    try {
      // Dynamic import of audio file
      const audioUrl = new URL(
        '../assets/audio/victory-meow.mp3',
        import.meta.url,
      ).href;
      victoryAudio = new Audio(audioUrl);
      victoryAudio.volume = 0.6;
      victoryAudio.preload = 'auto';
    } catch {
      // Audio file may not exist yet
      return null;
    }

    return victoryAudio;
  }

  function preload(): void {
    if (isPreloaded) {
      return;
    }

    const audio = getVictoryAudio();
    if (audio) {
      // Trigger browser to load the audio
      audio.load();
      isPreloaded = true;
    }
  }

  async function playVictory(): Promise<void> {
    if (isMutedState.value) {
      return;
    }

    const audio = getVictoryAudio();
    if (!audio) {
      return;
    }

    try {
      // Reset to start if already playing
      audio.currentTime = 0;
      await audio.play();
    } catch {
      // Silently fail if playback fails (e.g., autoplay policy)
    }
  }

  function toggleMute(): void {
    isMutedState.value = !isMutedState.value;
    saveMutedPreference(isMutedState.value);
  }

  function setMuted(muted: boolean): void {
    isMutedState.value = muted;
    saveMutedPreference(muted);
  }

  return {
    isMuted,
    playVictory,
    toggleMute,
    setMuted,
    preload,
  };
}
