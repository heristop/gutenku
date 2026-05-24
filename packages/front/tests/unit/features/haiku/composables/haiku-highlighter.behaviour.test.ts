import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useHaikuHighlighter } from '@/features/haiku/composables/haiku-highlighter';

describe('useHaikuHighlighter (apply behaviour)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    delete (globalThis as Record<string, unknown>).requestIdleCallback;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('applies highlight styles to matching elements (setTimeout path)', () => {
    const { applyToAllHighlights } = useHaikuHighlighter();

    const root = document.createElement('div');
    root.className = 'chapter-text';
    const mark1 = document.createElement('mark');
    const mark2 = document.createElement('mark');
    root.append(mark1, mark2);
    document.body.append(root);

    applyToAllHighlights();
    vi.advanceTimersByTime(100);

    expect(mark1.style.getPropertyValue('--unique-highlighter-bg')).toContain(
      'data:image/svg+xml',
    );
    expect(mark1.style.getPropertyValue('--unique-transform')).toContain(
      'translateY',
    );
    expect(mark2.style.getPropertyValue('--unique-highlighter-bg')).toContain(
      'data:image/svg+xml',
    );

    root.remove();
  });

  it('does nothing when there are no highlights', () => {
    const { applyToAllHighlights } = useHaikuHighlighter();
    expect(() => {
      applyToAllHighlights('.no-such-selector');
      vi.advanceTimersByTime(100);
    }).not.toThrow();
  });

  it('uses requestIdleCallback when available', () => {
    const idle = vi.fn((cb: () => void) => {
      cb();
      
return 1;
    });
    (globalThis as Record<string, unknown>).requestIdleCallback = idle;

    const { applyToAllHighlights } = useHaikuHighlighter();
    const root = document.createElement('div');
    root.className = 'chapter-text';
    const mark = document.createElement('mark');
    root.append(mark);
    document.body.append(root);

    applyToAllHighlights();

    expect(idle).toHaveBeenCalled();
    expect(mark.style.getPropertyValue('--unique-highlighter-bg')).toContain(
      'data:image/svg+xml',
    );

    root.remove();
    delete (globalThis as Record<string, unknown>).requestIdleCallback;
  });

  it('processes large highlight sets across batches via rAF', () => {
    const rafSpy = vi
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation((cb) => {
        cb(0);
        
return 1;
      });

    const { applyToAllHighlights } = useHaikuHighlighter();
    const root = document.createElement('div');
    root.className = 'chapter-text';
    
for (let i = 0; i < 12; i++) {
      root.append(document.createElement('mark'));
    }
    document.body.append(root);

    applyToAllHighlights();
    vi.advanceTimersByTime(100);

    expect(rafSpy).toHaveBeenCalled();
    
for (const mark of root.querySelectorAll('mark')) {
      expect(
        (mark as HTMLElement).style.getPropertyValue('--unique-highlighter-bg'),
      ).toContain('data:image/svg+xml');
    }

    root.remove();
  });

  it('respects custom config dimensions', () => {
    const { applyToAllHighlights } = useHaikuHighlighter({
      width: 50,
      height: 10,
      primaryColor: '#000000',
      secondaryColor: '#111111',
    });

    const root = document.createElement('div');
    root.className = 'chapter-text';
    const mark = document.createElement('mark');
    root.append(mark);
    document.body.append(root);

    applyToAllHighlights();
    vi.advanceTimersByTime(100);

    const bg = decodeURIComponent(
      mark.style.getPropertyValue('--unique-highlighter-bg'),
    );
    expect(bg).toContain('width="50"');
    expect(bg).toContain('#000000');

    root.remove();
  });
});
