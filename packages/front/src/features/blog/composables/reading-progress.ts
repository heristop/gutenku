import { ref, onMounted, onUnmounted } from 'vue';

export function useReadingProgress(scrollThreshold = 400) {
  const readingProgress = ref(0);
  const showBackToTop = ref(false);

  function handleScroll() {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    readingProgress.value = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    showBackToTop.value = scrollTop > scrollThreshold;
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
