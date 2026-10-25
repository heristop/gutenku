import { ref, onMounted, onUnmounted } from 'vue';

export function useReadingProgress(scrollThreshold = 400) {
  const readingProgress = ref(0);
  const showBackToTop = ref(false);

  let lastScrollTop = 0;

  function handleScroll() {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    readingProgress.value = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    // On a phone the key would sit on the text being read: it steps aside
    // while the reader goes down and comes back on the way up
    const narrow =
      globalThis.matchMedia?.('(max-width: 600px)').matches ?? false;
    const readingDown = scrollTop > lastScrollTop;

    showBackToTop.value =
      scrollTop > scrollThreshold && !(narrow && readingDown);
    lastScrollTop = scrollTop;
  }

  function scrollToTop() {
    const reduceMotion =
      globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ??
      false;

    globalThis.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
  });

  return {
    readingProgress,
    showBackToTop,
    scrollToTop,
  };
}
