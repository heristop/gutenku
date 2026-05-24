import { describe, it, expect } from 'vitest';
import { useMouseParallax } from '@/core/composables/parallax';

function makeMouseEvent(clientX: number, clientY: number): MouseEvent {
  const target = {
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
    }),
  } as unknown as HTMLElement;

  return { clientX, clientY, currentTarget: target } as unknown as MouseEvent;
}

describe('useMouseParallax', () => {
  it('starts centered at zero', () => {
    const { translateX, translateY } = useMouseParallax();
    expect(translateX.value).toBe(0);
    expect(translateY.value).toBe(0);
  });

  it('computes offset from center scaled by intensity', () => {
    const { translateX, translateY, handleMouseMove } = useMouseParallax(20);

    // center of the 100x100 rect -> offset 0
    handleMouseMove(makeMouseEvent(50, 50));
    expect(translateX.value).toBe(0);
    expect(translateY.value).toBe(0);

    // top-left corner -> offset (-0.5, -0.5) * 20 = -10
    handleMouseMove(makeMouseEvent(0, 0));
    expect(translateX.value).toBe(-10);
    expect(translateY.value).toBe(-10);

    // bottom-right corner -> offset (0.5, 0.5) * 20 = 10
    handleMouseMove(makeMouseEvent(100, 100));
    expect(translateX.value).toBe(10);
    expect(translateY.value).toBe(10);
  });

  it('resets to zero on mouse leave', () => {
    const { translateX, translateY, handleMouseMove, handleMouseLeave } =
      useMouseParallax();

    handleMouseMove(makeMouseEvent(0, 0));
    expect(translateX.value).not.toBe(0);

    handleMouseLeave();
    expect(translateX.value).toBe(0);
    expect(translateY.value).toBe(0);
  });
});
