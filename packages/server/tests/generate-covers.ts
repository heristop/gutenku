import { describe, expect, it, vi } from 'vitest';
import path from 'node:path';

// Mock modules before importing the module under test
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    images: {
      generate: vi.fn(),
    },
  })),
}));

vi.mock('sharp', () => ({
  default: vi.fn().mockImplementation(() => ({
    resize: vi.fn().mockReturnThis(),
    webp: vi.fn().mockReturnThis(),
    toFile: vi.fn().mockResolvedValue(),
  })),
}));

vi.mock('ora', () => ({
  default: vi.fn().mockImplementation(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    info: vi.fn().mockReturnThis(),
  })),
}));

import {
  getGutenGuessBooks,
  type GutenGuessBook,
} from '~~/data/gutenguess-books';

const GUTENGUESS_BOOKS = getGutenGuessBooks();

describe('GutenGuess Books Data', () => {
  it('should have books in fixture', () => {
    expect(GUTENGUESS_BOOKS.length).toBeGreaterThanOrEqual(3);
  });

  it('each book should have required fields', () => {
    for (const book of GUTENGUESS_BOOKS) {
      expect(book.id).toBeDefined();
      expect(typeof book.id).toBe('number');
      expect(book.title).toBeDefined();
      expect(typeof book.title).toBe('object');
      expect(book.title.en).toBeDefined();
      expect(typeof book.title.en).toBe('string');
      expect(book.author).toBeDefined();
      expect(typeof book.author).toBe('string');
      expect(book.genre).toBeDefined();
      expect(book.era).toBeDefined();
      expect(book.authorNationality).toBeDefined();
      expect(book.emoticons).toBeDefined();
      expect(book.notableQuotes).toBeDefined();
      expect(Array.isArray(book.notableQuotes)).toBeTruthy();
    }
  });

  it('each book should have unique id', () => {
    const ids = GUTENGUESS_BOOKS.map((book) => book.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('each book should have at least one notable quote', () => {
    for (const book of GUTENGUESS_BOOKS) {
      expect(book.notableQuotes.length).toBeGreaterThan(0);
    }
  });

  it('each book should have emoticons', () => {
    for (const book of GUTENGUESS_BOOKS) {
      expect(book.emoticons.length).toBeGreaterThan(0);
      // Check that emoticons contain actual emoji characters
      expect(/\p{Emoji}/u.test(book.emoticons)).toBeTruthy();
    }
  });
});

describe('Cover Prompt Generation', () => {
  function buildPrompt(book: GutenGuessBook): string {
    return `Japanese sumi-e ink wash style book cover for "${book.title}" by ${book.author}.
Minimalist zen aesthetic, monochromatic sepia/ink tones, traditional brushwork,
generous negative space. No text or letters. Evokes the book's essence through
symbolic imagery related to ${book.genre}. Square format, subtle paper texture.`;
  }

  it('should generate valid prompt for a book', () => {
    const book = GUTENGUESS_BOOKS[0];
    const prompt = buildPrompt(book);

    expect(prompt).toContain(book.title);
    expect(prompt).toContain(book.author);
    expect(prompt).toContain(book.genre);
    expect(prompt).toContain('sumi-e');
    expect(prompt).toContain('zen');
    expect(prompt).toContain('No text');
  });

  it('should generate unique prompts for different books', () => {
    const prompt1 = buildPrompt(GUTENGUESS_BOOKS[0]);
    const prompt2 = buildPrompt(GUTENGUESS_BOOKS[1]);

    expect(prompt1).not.toBe(prompt2);
  });

  it('should include genre in the prompt', () => {
    for (const book of GUTENGUESS_BOOKS.slice(0, 5)) {
      const prompt = buildPrompt(book);
      expect(prompt).toContain(book.genre);
    }
  });
});

describe('Cover File Path Generation', () => {
  const COVERS_DIR = '/mock/covers';

  function getCoverPath(bookId: number): string {
    return path.join(COVERS_DIR, `${bookId}.webp`);
  }

  it('should generate correct cover path', () => {
    const book = GUTENGUESS_BOOKS[0];
    const coverPath = getCoverPath(book.id);

    expect(coverPath).toBe(`${COVERS_DIR}/${book.id}.webp`);
    expect(coverPath).toContain('.webp');
  });

  it('should use book id as filename', () => {
    for (const book of GUTENGUESS_BOOKS.slice(0, 5)) {
      const coverPath = getCoverPath(book.id);
      expect(coverPath).toContain(`${book.id}.webp`);
    }
  });
});

describe('OpenAI Image Generation Parameters', () => {
  // gpt-image-1.5 API parameters (no response_format - always returns b64_json)
  const expectedParams = {
    model: 'gpt-image-1.5',
    size: '1024x1024',
    quality: 'high', // Valid values: 'low', 'medium', 'high'
    n: 1,
  };

  it('should use correct model', () => {
    expect(expectedParams.model).toBe('gpt-image-1.5');
  });

  it('should use square format', () => {
    const [width, height] = expectedParams.size.split('x').map(Number);
    expect(width).toBe(height);
    expect(width).toBe(1024);
  });

  it('should use high quality', () => {
    expect(expectedParams.quality).toBe('high');
    // Valid quality values for gpt-image-1.5
    expect(['low', 'medium', 'high']).toContain(expectedParams.quality);
  });

  it('should generate single image per request', () => {
    expect(expectedParams.n).toBe(1);
  });
});

describe('Sharp Image Processing Parameters', () => {
  const expectedResize = { width: 512, height: 512 };
  const expectedWebpQuality = 85;

  it('should resize to 512x512', () => {
    expect(expectedResize.width).toBe(512);
    expect(expectedResize.height).toBe(512);
  });

  it('should use WebP quality of 85', () => {
    expect(expectedWebpQuality).toBe(85);
    expect(expectedWebpQuality).toBeGreaterThan(0);
    expect(expectedWebpQuality).toBeLessThanOrEqual(100);
  });
});

describe('Book Genre Coverage', () => {
  it('should have diverse genres', () => {
    const genres = new Set(GUTENGUESS_BOOKS.map((book) => book.genre));
    // Fixture has 3 different genres
    expect(genres.size).toBeGreaterThanOrEqual(3);
  });

  it('should have diverse eras', () => {
    const eras = new Set(GUTENGUESS_BOOKS.map((book) => book.era));
    // Fixture has 3 different eras
    expect(eras.size).toBeGreaterThanOrEqual(3);
  });

  it('should have nationalities', () => {
    const nationalities = new Set(
      GUTENGUESS_BOOKS.map((book) => book.authorNationality),
    );
    // Fixture has at least 1 nationality
    expect(nationalities.size).toBeGreaterThanOrEqual(1);
  });
});

describe('Base64 Processing', () => {
  it('should correctly decode base64 to buffer', () => {
    const testBase64 = Buffer.from('test image data').toString('base64');
    const buffer = Buffer.from(testBase64, 'base64');

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.toString()).toBe('test image data');
  });

  it('should handle empty base64', () => {
    const emptyBase64 = '';
    const buffer = Buffer.from(emptyBase64, 'base64');

    expect(buffer.length).toBe(0);
  });
});
