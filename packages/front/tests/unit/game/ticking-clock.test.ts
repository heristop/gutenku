import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { gameEnabled } from './game-enabled';

describe.runIf(gameEnabled)('TickingClock', () => {
  it('sets every character in its own fixed cell, so the clock never changes width', async () => {
    const TickingClock = (
      await import('@/features/game/components/TickingClock.vue')
    ).default;
    const wrapper = mount(TickingClock, { props: { time: '05:46:38' } });
    const cells = wrapper.findAll('.ticking-clock__cell');

    expect(cells).toHaveLength(8);
    expect(
      cells.filter((c) => c.classes('ticking-clock__cell--sep')),
    ).toHaveLength(2);
    // Read out whole, not character by character
    expect(wrapper.attributes('aria-label')).toBe('05:46:38');
    expect(
      cells.every((c) => c.attributes('aria-hidden') === 'true'),
    ).toBeTruthy();
  });
});
