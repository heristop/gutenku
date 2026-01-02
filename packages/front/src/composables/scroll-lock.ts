import { ref, onUnmounted } from 'vue';

export function useScrollLock() {
  const isLocked = ref(false);
  let scrollY = 0;

  function lock() {
    if (isLocked.value) {
      return;
    }

    scrollY = globalThis.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';
    isLocked.value = true;
  }

  function unlock() {
    if (!isLocked.value) {
      return;
    }

    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.overflow = '';
    globalThis.scrollTo(0, scrollY);
    isLocked.value = false;
  }

  onUnmounted(() => {
    if (isLocked.value) {
      unlock();
    }
  });

  return {
    isLocked,
    lock,
    unlock,
  };
}
