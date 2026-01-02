import { ref, onUnmounted } from 'vue';

export interface TypewriterOptions {
  speed?: number;
  startDelay?: number;
  onComplete?: () => void;
}

export function useTypewriter(text: string, options: TypewriterOptions = {}) {
  const { speed = 150, startDelay = 0, onComplete } = options;

  const displayText = ref('');
  const isTyping = ref(false);
  const showCursor = ref(true);

  let timeout: NodeJS.Timeout | null = null;
  let charIndex = 0;

  const typeNextChar = () => {
    if (charIndex < text.length) {
      displayText.value += text.charAt(charIndex);
      charIndex++;
      timeout = setTimeout(typeNextChar, speed);
    } else {
      isTyping.value = false;
      showCursor.value = false;
      onComplete?.();
    }
  };

  const start = () => {
    stop();
    displayText.value = '';
    charIndex = 0;
    isTyping.value = true;
    showCursor.value = true;

    if (startDelay > 0) {
      timeout = setTimeout(typeNextChar, startDelay);
    } else {
      typeNextChar();
    }
  };

  const stop = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    isTyping.value = false;
  };

  onUnmounted(stop);

  return {
    displayText,
    showCursor,
    start,
  };
}
