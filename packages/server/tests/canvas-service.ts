import 'reflect-metadata';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock canvas module
vi.mock('canvas', () => ({
  default: {
    deregisterAllFonts: vi.fn(),
  },
}));

// Mock fs module
vi.mock('node:fs', () => {
  const mockWriteStream = {
    on: vi.fn((event: string, callback: () => void) => {
      if (event === 'finish') {
        setTimeout(callback, 0);
      }
      return mockWriteStream;
    }),
  };

  return {
    default: {
      createWriteStream: vi.fn(() => mockWriteStream),
      readFile: vi.fn(
        (path: string, callback: (err: Error | null, data: Buffer) => void) => {
          callback(null, Buffer.from('test-image-data'));
        },
      ),
    },
    createWriteStream: vi.fn(() => mockWriteStream),
    readFile: vi.fn(
      (path: string, callback: (err: Error | null, data: Buffer) => void) => {
        callback(null, Buffer.from('test-image-data'));
      },
    ),
  };
});

// Mock theme modules
vi.mock('~/shared/themes/colored', () => ({
  default: {
    create: vi.fn(async () => ({
      createJPEGStream: vi.fn(() => ({ pipe: vi.fn() })),
    })),
  },
}));

vi.mock('~/shared/themes/greentea', () => ({
  default: {
    create: vi.fn(async () => ({
      createJPEGStream: vi.fn(() => ({ pipe: vi.fn() })),
    })),
  },
}));

vi.mock('~/shared/themes/watermark', () => ({
  default: {
    create: vi.fn(async () => ({
      createJPEGStream: vi.fn(() => ({ pipe: vi.fn() })),
    })),
  },
}));

vi.mock('~/shared/themes/nihonga', () => ({
  default: {
    create: vi.fn(async () => ({
      createJPEGStream: vi.fn(() => ({ pipe: vi.fn() })),
    })),
  },
}));

import CanvasService from '../src/infrastructure/services/CanvasService';

describe('CanvasService', () => {
  let canvasService: CanvasService;

  beforeEach(() => {
    canvasService = new CanvasService();
    vi.clearAllMocks();
  });

  it('can be instantiated', () => {
    expect(canvasService).toBeDefined();
  });

  it('useTheme sets the theme', () => {
    canvasService.useTheme('colored');
    // @ts-expect-error - accessing private property
    expect(canvasService.theme).toBe('colored');
  });

  it('useTheme accepts different themes', () => {
    canvasService.useTheme('greentea');
    // @ts-expect-error - accessing private property
    expect(canvasService.theme).toBe('greentea');

    canvasService.useTheme('watermark');
    // @ts-expect-error - accessing private property
    expect(canvasService.theme).toBe('watermark');

    canvasService.useTheme('nihonga');
    // @ts-expect-error - accessing private property
    expect(canvasService.theme).toBe('nihonga');
  });

  it('read returns buffer and content type', async () => {
    const result = await canvasService.read('/test/path.jpg');

    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('contentType');
    expect(result.contentType).toBe('image/jpeg');
    expect(result.data).toBeInstanceOf(Buffer);
  });
});

describe('CanvasService - create', () => {
  let canvasService: CanvasService;

  const mockHaiku = {
    book: { title: 'Test Book', author: 'Test Author', reference: 'test-ref' },
    chapter: { content: 'Test chapter content' },
    verses: ['Line one here', 'Line two is here now', 'Line three ends'],
    rawVerses: ['Line one here', 'Line two is here now', 'Line three ends'],
    cacheUsed: false,
    executionTime: 100,
    context: [],
  };

  beforeEach(() => {
    canvasService = new CanvasService();
    vi.clearAllMocks();
  });

  it('throws error for unsupported theme', async () => {
    canvasService.useTheme('unsupported');

    // @ts-expect-error - test with partial haiku
    await expect(canvasService.create(mockHaiku)).rejects.toThrow(
      'Unsupported theme: unsupported',
    );
  });

  it('creates image with colored theme', async () => {
    canvasService.useTheme('colored');
    // @ts-expect-error - test with partial haiku
    const result = await canvasService.create(mockHaiku);
    expect(typeof result).toBe('string');
  });

  it('creates image with greentea theme', async () => {
    canvasService.useTheme('greentea');
    // @ts-expect-error - test with partial haiku
    const result = await canvasService.create(mockHaiku);
    expect(typeof result).toBe('string');
  });

  it('creates image with watermark theme', async () => {
    canvasService.useTheme('watermark');
    // @ts-expect-error - test with partial haiku
    const result = await canvasService.create(mockHaiku);
    expect(typeof result).toBe('string');
  });

  it('creates image with nihonga theme', async () => {
    canvasService.useTheme('nihonga');
    // @ts-expect-error - test with partial haiku
    const result = await canvasService.create(mockHaiku);
    expect(typeof result).toBe('string');
  });

  it('handles random theme selection', async () => {
    canvasService.useTheme('random');
    vi.spyOn(Math, 'random').mockReturnValue(0); // Will select 'colored'

    // @ts-expect-error - test with partial haiku
    const result = await canvasService.create(mockHaiku);
    expect(typeof result).toBe('string');
  });
});

describe('CanvasService - save', () => {
  let canvasService: CanvasService;

  beforeEach(() => {
    canvasService = new CanvasService();
    vi.clearAllMocks();
  });

  it('saves canvas to file and returns path', async () => {
    const mockCanvas = {
      createJPEGStream: vi.fn(() => ({
        pipe: vi.fn(
          (stream: { on: (event: string, cb: () => void) => void }) => {
            setTimeout(() => stream.on('finish', () => {}), 0);
          },
        ),
      })),
    };

    // @ts-expect-error - test with mock canvas
    const resultPromise = canvasService.save(mockCanvas);

    expect(resultPromise).toBeInstanceOf(Promise);
  });
});
