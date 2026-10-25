import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      `${key} ${JSON.stringify(params)}`,
    locale: ref('en'),
  }),
}));

const ArticleColophon = (
  await import('@/features/blog/components/ArticleColophon.vue')
).default;

describe('ArticleColophon', () => {
  it('closes the article with its number, its type and its date', () => {
    const wrapper = mount(ArticleColophon, {
      props: { issue: 12, date: new Date('2026-01-18T09:00:00Z') },
    });
    const line = wrapper.get('.article-colophon__line').text();

    expect(line).toContain('blog.colophon');
    expect(line).toContain('"number":"XII"');
    expect(line).toContain('"date":"18 January 2026"');
    expect(wrapper.find('.article-colophon__seal').exists()).toBeTruthy();
  });
});
