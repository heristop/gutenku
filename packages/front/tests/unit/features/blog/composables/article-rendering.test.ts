import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const render = vi.fn(async (id: string) => ({
  svg: `<svg id="${id}">d</svg>`,
}));
const initialize = vi.fn();
const renderToString = vi.fn((tex: string) => `<math>${tex}</math>`);

vi.mock('mermaid', () => ({ default: { initialize, render } }));
vi.mock('katex', () => ({ default: { renderToString } }));
vi.mock('katex/dist/katex.min.css', () => ({}));

const { renderMathFormulas, renderMermaidDiagrams, watchThemeForDiagrams } =
  await import('@/features/blog/composables/article-rendering');

function body(html: string): HTMLElement {
  const el = document.createElement('article');
  el.className = 'blog-article__body';
  el.innerHTML = html;
  document.body.append(el);

  return el;
}

describe('article rendering', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    render.mockClear();
    initialize.mockClear();
    renderToString.mockClear();
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  describe('renderMathFormulas', () => {
    it('does nothing without an article on the page', async () => {
      await renderMathFormulas();

      expect(renderToString).not.toHaveBeenCalled();
    });

    it('sets display maths, and leaves a formula that fails readable as code', async () => {
      const el = body(
        '<p>$$a^2$$</p><ul><li>no maths here</li></ul><table><tr><td>$$bad$$</td></tr></table>',
      );
      renderToString.mockImplementation((tex: string) => {
        if (tex === 'bad') {
          throw new Error('parse');
        }

        return `<math>${tex}</math>`;
      });

      await renderMathFormulas();

      expect(el.querySelector('.katex-display')?.innerHTML).toBe(
        '<math>a^2</math>',
      );
      expect(el.querySelector('.katex-error')?.textContent).toBe('bad');
      expect(el.querySelector('li')?.textContent).toBe('no maths here');
    });
  });

  describe('renderMermaidDiagrams', () => {
    it('draws a source block once, then redraws it from its kept source', async () => {
      const el = body(
        '<pre><code class="language-mermaid">graph TD; A-->B</code></pre><pre><code class="language-mermaid"></code></pre>',
      );

      await renderMermaidDiagrams();

      const drawn = el.querySelector<HTMLElement>('.mermaid-diagram');
      expect(drawn?.dataset.source).toBe('graph TD; A-->B');
      expect(drawn?.querySelector('svg')).toBeTruthy();
      // An empty block is skipped, not drawn
      expect(render).toHaveBeenCalledOnce();
      expect(initialize).toHaveBeenCalledOnce();

      await renderMermaidDiagrams();

      // The same plate, redrawn in place
      expect(el.querySelectorAll('.mermaid-diagram')).toHaveLength(1);
      expect(render).toHaveBeenCalledTimes(2);
      expect(render.mock.calls[1][1]).toBe('graph TD; A-->B');
    });
  });

  describe('watchThemeForDiagrams', () => {
    it('redraws the diagrams when the theme changes, and only then', async () => {
      body('<div class="mermaid-diagram" data-source="graph TD; A-->B"></div>');
      document.documentElement.setAttribute('data-theme', 'light');
      const stop = watchThemeForDiagrams();

      // Another attribute write with the same theme: nothing to redraw
      document.documentElement.setAttribute('data-theme', 'light');
      await vi.waitFor(() => Promise.resolve());
      expect(render).not.toHaveBeenCalled();

      document.documentElement.setAttribute('data-theme', 'dark');
      await vi.waitFor(() => expect(render).toHaveBeenCalledOnce());

      stop();
      document.documentElement.setAttribute('data-theme', 'light');
      await new Promise((resolve) => {
        setTimeout(resolve, 20);
      });
      expect(render).toHaveBeenCalledOnce();
    });

    it('does not draw when the page has no diagram', async () => {
      document.documentElement.setAttribute('data-theme', 'light');
      const stop = watchThemeForDiagrams();

      document.documentElement.setAttribute('data-theme', 'dark');
      await new Promise((resolve) => {
        setTimeout(resolve, 20);
      });

      expect(render).not.toHaveBeenCalled();
      stop();
    });

    it('is a harmless no-op where MutationObserver is missing', () => {
      const observer = globalThis.MutationObserver;
      Reflect.deleteProperty(globalThis, 'MutationObserver');

      try {
        const stop = watchThemeForDiagrams();

        expect(() => stop()).not.toThrow();
      } finally {
        globalThis.MutationObserver = observer;
      }
    });
  });
});
