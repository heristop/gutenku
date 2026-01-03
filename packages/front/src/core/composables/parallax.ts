import { ref } from 'vue';

export function useMouseParallax(intensity = 12) {
  const translateX = ref(0);
  const translateY = ref(0);

  function handleMouseMove(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    // Calculate offset from center (-0.5 to 0.5)
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    // Apply intensity
    translateX.value = x * intensity;
    translateY.value = y * intensity;
  }

  function handleMouseLeave() {
    translateX.value = 0;
    translateY.value = 0;
  }

  return {
    translateX,
    translateY,
    handleMouseMove,
    handleMouseLeave,
  };
}
