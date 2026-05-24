import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useImageDownload } from '@/core/composables/image-download';

describe('useImageDownload', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('sanitizes filenames by lowercasing and replacing separators', () => {
    const { sanitizeFilename } = useImageDownload();

    expect(sanitizeFilename('My Book; Title, v1.0')).toBe(
      'my_book__title__v1_0',
    );
  });

  it('starts with inProgress false', () => {
    const { inProgress } = useImageDownload();
    expect(inProgress.value).toBeFalsy();
  });

  it('triggers a download link click and resolves true after the delay', async () => {
    const click = vi.fn();
    const anchor = {
      href: '',
      download: '',
      target: '',
      click,
    } as unknown as HTMLAnchorElement;
    const createSpy = vi
      .spyOn(document, 'createElement')
      .mockReturnValue(anchor);

    const { download, inProgress } = useImageDownload(500);

    const promise = download('data:image/png;base64,AAA', {
      filename: 'Cover Image',
      extension: '.png',
    });

    expect(inProgress.value).toBeTruthy();
    expect(click).toHaveBeenCalledOnce();
    expect(anchor.download).toBe('cover_image.png');
    expect(anchor.href).toBe('data:image/png;base64,AAA');

    await vi.advanceTimersByTimeAsync(500);
    const result = await promise;

    expect(result).toBeTruthy();
    expect(inProgress.value).toBeFalsy();
    createSpy.mockRestore();
  });

  it('uses default filename/extension when options are omitted', async () => {
    const anchor = {
      href: '',
      download: '',
      target: '',
      click: vi.fn(),
    } as unknown as HTMLAnchorElement;
    vi.spyOn(document, 'createElement').mockReturnValue(anchor);

    const { download } = useImageDownload(0);
    const promise = download('data:image/png;base64,AAA');
    await vi.advanceTimersByTimeAsync(0);
    await promise;

    expect(anchor.download).toBe('image');
  });

  it('returns false and resets state when the DOM operation throws', async () => {
    vi.spyOn(document, 'createElement').mockImplementation(() => {
      throw new Error('boom');
    });

    const { download, inProgress } = useImageDownload();
    const result = await download('data:image/png;base64,AAA');

    expect(result).toBeFalsy();
    expect(inProgress.value).toBeFalsy();
  });
});
