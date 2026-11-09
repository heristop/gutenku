import { describe, expect, it, vi } from 'vitest';
import { bookmojiId } from '@gutenku/shared';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import { gameEnabled } from './game-enabled';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params && typeof params === 'object'
        ? `${key} ${JSON.stringify(params)}`
        : key,
    locale: ref('en'),
  }),
}));

vi.mock('@/locales', () => ({
  i18n: { global: { t: (key: string) => key } },
}));

describe.runIf(gameEnabled)('emoji clue helpers', () => {
  async function hint() {
    const GameHint = (await import('@/features/game/components/GameHint.vue'))
      .default;

    return mount(GameHint, {
      props: {
        hint: { type: 'emoticons', content: '⚖✝🏛📜🕯', round: 1 },
        round: 1,
        emoticonCount: 5,
        visibleIndices: [0, 1],
        scratchedPositions: [],
        canScratch: true,
        offerScratch: true,
        skipAnimation: true,
      },
      global: {
        stubs: {
          ZenTooltip: { template: '<span><slot /></span>' },
          MalusBadge: true,
        },
      },
    });
  }

  it('prints only the visible motifs and adds the scratched motif at its own position', async () => {
    const clue = await hint();
    await clue.setProps({
      hint: { type: 'emoticons', content: '🏴‍☠️⚖', round: 1 },
      visibleIndices: [1, 4],
    });
    const cells = () => clue.findAll('.emoji-row .emoji');
    expect(cells().map((cell) => cell.find('use').exists())).toEqual([
      false,
      true,
      false,
      false,
      true,
    ]);
    expect(cells()[1].get('use').attributes('href')).toContain(
      '#' + bookmojiId('🏴‍☠️'),
    );
    expect(cells()[4].get('use').attributes('href')).toContain(
      '#' + bookmojiId('⚖'),
    );
    await cells()[2].trigger('click');
    expect(clue.emitted('scratch')).toEqual([[2]]);
    await clue.setProps({
      hint: {
        type: 'emoticons',
        content: ['🏴‍☠️', '⚖', '🦊'].map(bookmojiId).join(' '),
        round: 1,
      },
      scratchedPositions: [2],
    });
    await vi.waitFor(() =>
      expect(cells()[2].get('use').attributes('href')).toContain(
        '#' + bookmojiId('🦊'),
      ),
    );
    expect(clue.get('[aria-live]').text()).toContain('🏴‍☠️ 🦊 ⚖');
  });

  it('names each hidden tile by its place in the row', async () => {
    const labels = (await hint())
      .findAll('button.emoji--hidden')
      .map((b) => b.attributes('aria-label'));

    expect(labels).toEqual([
      'game.hints.revealEmojiLabel {"n":3,"total":5}',
      'game.hints.revealEmojiLabel {"n":4,"total":5}',
      'game.hints.revealEmojiLabel {"n":5,"total":5}',
    ]);
  });

  it('says plainly what to do', async () => {
    const en = (await import('@/features/game/locales/en.json')).default as {
      game: { hints: Record<string, string>; stats: Record<string, string> };
    };

    expect(en.game.hints.scratchNote).toBe('Tap a ? to reveal it');
    expect(en.game.hints.revealEmojiLabel).toBe(
      'Reveal emoji {n} of {total}, costs 2 points',
    );
    // What players read says "emoji" (key names may keep the old word)
    const values: string[] = [];
    const walk = (node: unknown): void => {
      if (typeof node === 'string') {
        values.push(node);

        return;
      }

      if (node && typeof node === 'object') {
        Object.values(node).forEach(walk);
      }
    };

    walk(en);
    expect(values.filter((v) => /emoticon/i.test(v))).toEqual([]);
  });
});
