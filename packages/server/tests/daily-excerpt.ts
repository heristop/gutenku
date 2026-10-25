import { describe, expect, it, vi } from 'vitest';
import { loadDailyExcerpt } from '~/presentation/graphql/daily-excerpt';

const record = {
  verses: ['the golden marvel'],
  rawVerses: ['golden marvel'],
  chapterId: 'c1',
};

describe('loadDailyExcerpt', () => {
  it("cuts the excerpt from the day's chapter, by its raw verses", async () => {
    const getChapter = vi.fn(async () => ({
      content: 'And the golden marvel shone.',
    }));

    await expect(loadDailyExcerpt(record, getChapter)).resolves.toEqual({
      text: 'And the golden marvel shone.',
      verses: ['golden marvel'],
    });
    expect(getChapter).toHaveBeenCalledWith('c1');
  });

  it('falls back to the published verses without raw ones', async () => {
    const excerpt = await loadDailyExcerpt(
      { ...record, rawVerses: undefined },
      async () => ({ content: 'And the golden marvel shone.' }),
    );

    expect(excerpt?.verses).toEqual(['the golden marvel']);
  });

  it('never fails the day: no chapter, a missing one or an error give null', async () => {
    const getChapter = vi.fn();

    await expect(
      loadDailyExcerpt({ ...record, chapterId: undefined }, getChapter),
    ).resolves.toBe(null);
    expect(getChapter).not.toHaveBeenCalled();
    await expect(loadDailyExcerpt(record, async () => null)).resolves.toBe(
      null,
    );
    await expect(
      loadDailyExcerpt(record, async () => {
        throw new Error('db down');
      }),
    ).resolves.toBe(null);
  });
});
