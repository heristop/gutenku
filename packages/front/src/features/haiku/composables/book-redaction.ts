import { ref } from 'vue';

// The book title is redacted with a black marker until the reader reveals it.
// Shared so the poem signature and the chapter page reveal together.
const redacted = ref(true);

export function useBookRedaction() {
  function reveal(): void {
    redacted.value = false;
  }

  function toggle(): void {
    redacted.value = !redacted.value;
  }

  // Each new haiku keeps its book to itself until the reader asks again
  function hideAgain(): void {
    redacted.value = true;
  }

  return { redacted, reveal, toggle, hideAgain };
}
