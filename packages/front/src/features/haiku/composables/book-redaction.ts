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

  return { redacted, reveal, toggle };
}
