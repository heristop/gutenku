import { describe, expect, it } from 'vitest';
import {
  hasNonAsciiChars,
  isEnglish,
  normalizeTitle,
  extractTopBooksFromHtml,
  extractBooksFromBookshelfHtml,
  getNextPageUrl,
  removeDuplicates,
  type GutenbergBook,
} from '../src/utils/gutenberg-parser';

describe('Gutenberg Parser Utilities', () => {
  describe('hasNonAsciiChars', () => {
    it('returns false for ASCII text', () => {
      expect(hasNonAsciiChars('Hello World')).toBeFalsy();
    });

    it('returns false for extended Latin characters', () => {
      expect(hasNonAsciiChars('café résumé naïve')).toBeFalsy();
    });

    it('returns true for Chinese characters', () => {
      expect(hasNonAsciiChars('你好')).toBeTruthy();
    });

    it('returns true for Japanese characters', () => {
      expect(hasNonAsciiChars('こんにちは')).toBeTruthy();
    });

    it('returns true for Cyrillic characters', () => {
      expect(hasNonAsciiChars('Привет')).toBeTruthy();
    });

    it('returns true for Arabic characters', () => {
      expect(hasNonAsciiChars('مرحبا')).toBeTruthy();
    });
  });

  describe('isEnglish', () => {
    it('returns true for English book', () => {
      const book: GutenbergBook = {
        id: 1,
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
      };
      expect(isEnglish(book)).toBeTruthy();
    });

    it('returns false for Spanish book', () => {
      const book: GutenbergBook = {
        id: 2,
        title: 'Don Quixote (Spanish)',
        author: 'Cervantes',
      };
      expect(isEnglish(book)).toBeFalsy();
    });

    it('returns false for French book', () => {
      const book: GutenbergBook = {
        id: 3,
        title: 'Les Misérables (French)',
        author: 'Victor Hugo',
      };
      expect(isEnglish(book)).toBeFalsy();
    });

    it('returns false for German book', () => {
      const book: GutenbergBook = {
        id: 4,
        title: 'Faust (German)',
        author: 'Goethe',
      };
      expect(isEnglish(book)).toBeFalsy();
    });

    it('returns false for book with non-ASCII title', () => {
      const book: GutenbergBook = {
        id: 5,
        title: '日本語の本',
        author: 'Unknown',
      };
      expect(isEnglish(book)).toBeFalsy();
    });

    it('returns false for Latin book', () => {
      const book: GutenbergBook = {
        id: 6,
        title: 'Aeneid (Latin)',
        author: 'Virgil',
      };
      expect(isEnglish(book)).toBeFalsy();
    });

    it('returns false for Greek book', () => {
      const book: GutenbergBook = {
        id: 7,
        title: 'The Iliad (Ancient Greek)',
        author: 'Homer',
      };
      expect(isEnglish(book)).toBeFalsy();
    });
  });

  describe('normalizeTitle', () => {
    it('converts to lowercase', () => {
      expect(normalizeTitle('PRIDE AND PREJUDICE')).toBe('pride and prejudice');
    });

    it('removes leading articles', () => {
      expect(normalizeTitle('The Great Gatsby')).toBe('great gatsby');
      expect(normalizeTitle('A Tale of Two Cities')).toBe('tale of two cities');
      expect(normalizeTitle('An Inspector Calls')).toBe('inspector calls');
    });

    it('removes parenthetical content', () => {
      expect(normalizeTitle('Moby Dick (Illustrated)')).toBe('moby dick');
    });

    it('removes content after colon', () => {
      expect(normalizeTitle('War and Peace: A Novel')).toBe('war and peace');
    });

    it('removes content after semicolon', () => {
      expect(normalizeTitle('Pride and Prejudice; A Novel')).toBe(
        'pride and prejudice',
      );
    });

    it('removes translation suffix', () => {
      expect(normalizeTitle('Don Quixote translated by John Ormsby')).toBe(
        'don quixote',
      );
    });

    it('removes punctuation', () => {
      expect(normalizeTitle("Alice's Adventures in Wonderland")).toBe(
        'alices adventures in wonderland',
      );
    });

    it('normalizes whitespace', () => {
      expect(normalizeTitle('War  and   Peace')).toBe('war and peace');
    });

    it('handles empty string', () => {
      expect(normalizeTitle('')).toBe('');
    });
  });

  describe('extractTopBooksFromHtml', () => {
    it('extracts books from top 100 list HTML', () => {
      const html = `
        <h2>Top 100 EBooks last 7 days</h2>
        <ol>
          <li><a href="/ebooks/1342">Pride and Prejudice by Jane Austen (12345)</a></li>
          <li><a href="/ebooks/11">Alice's Adventures in Wonderland by Lewis Carroll (5678)</a></li>
        </ol>
      `;

      const books = extractTopBooksFromHtml(html);

      expect(books).toHaveLength(2);
      expect(books[0]).toEqual({
        id: 1342,
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        downloads: 12345,
      });
      expect(books[1]).toEqual({
        id: 11,
        title: "Alice's Adventures in Wonderland",
        author: 'Lewis Carroll',
        downloads: 5678,
      });
    });

    it('handles books without author', () => {
      const html = `
        <h2>Top 100 EBooks last 7 days</h2>
        <ol>
          <li><a href="/ebooks/999">Anonymous Work (100)</a></li>
        </ol>
      `;

      const books = extractTopBooksFromHtml(html);

      expect(books).toHaveLength(1);
      expect(books[0].author).toBe('Unknown');
    });

    it('skips duplicate IDs', () => {
      const html = `
        <h2>Top 100 EBooks last 7 days</h2>
        <ol>
          <li><a href="/ebooks/1342">Pride and Prejudice by Jane Austen (100)</a></li>
          <li><a href="/ebooks/1342">Pride and Prejudice by Jane Austen (200)</a></li>
        </ol>
      `;

      const books = extractTopBooksFromHtml(html);

      expect(books).toHaveLength(1);
    });

    it('returns empty array when section not found', () => {
      const html = '<html><body>No top 100 list here</body></html>';
      const books = extractTopBooksFromHtml(html);
      expect(books).toHaveLength(0);
    });
  });

  describe('extractBooksFromBookshelfHtml', () => {
    it('extracts books from bookshelf HTML', () => {
      const html = `
        <li class="booklink">
          <a href="/ebooks/1342">
            <span class="title">Pride and Prejudice</span>
            <span class="subtitle">Jane Austen</span>
            <span class="extra">12345 downloads</span>
          </a>
        </li>
        <li class="booklink">
          <a href="/ebooks/11">
            <span class="title">Alice's Adventures in Wonderland</span>
            <span class="subtitle">Lewis Carroll</span>
            <span class="extra">5678 downloads</span>
          </a>
        </li>
      `;

      const books = extractBooksFromBookshelfHtml(html);

      expect(books).toHaveLength(2);
      expect(books[0]).toEqual({
        id: 1342,
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        downloads: 12345,
      });
    });

    it('handles missing author', () => {
      const html = `
        <li class="booklink">
          <a href="/ebooks/999">
            <span class="title">Anonymous Work</span>
          </a>
        </li>
      `;

      const books = extractBooksFromBookshelfHtml(html);

      expect(books).toHaveLength(1);
      expect(books[0].author).toBe('Unknown');
    });

    it('handles missing downloads', () => {
      const html = `
        <li class="booklink">
          <a href="/ebooks/999">
            <span class="title">Some Book</span>
            <span class="subtitle">Some Author</span>
          </a>
        </li>
      `;

      const books = extractBooksFromBookshelfHtml(html);

      expect(books).toHaveLength(1);
      expect(books[0].downloads).toBe(0);
    });

    it('skips items without ebook link', () => {
      const html = `
        <li class="booklink">
          <a href="/authors/123">
            <span class="title">Author Page</span>
          </a>
        </li>
      `;

      const books = extractBooksFromBookshelfHtml(html);
      expect(books).toHaveLength(0);
    });
  });

  describe('getNextPageUrl', () => {
    it('extracts next page URL from HTML', () => {
      const html = '<a href="/ebooks/bookshelf/649?start_index=26">Next</a>';
      const url = getNextPageUrl(html);
      expect(url).toBe(
        'https://www.gutenberg.org/ebooks/bookshelf/649?start_index=26',
      );
    });

    it('returns full URL if already absolute', () => {
      const html =
        '<a href="https://www.gutenberg.org/ebooks/bookshelf/649?start_index=26">Next</a>';
      const url = getNextPageUrl(html);
      expect(url).toBe(
        'https://www.gutenberg.org/ebooks/bookshelf/649?start_index=26',
      );
    });

    it('returns null when no next link', () => {
      const html = '<a href="/previous">Previous</a>';
      const url = getNextPageUrl(html);
      expect(url).toBeNull();
    });
  });

  describe('removeDuplicates', () => {
    it('removes books with same normalized title', () => {
      const books: GutenbergBook[] = [
        { id: 1342, title: 'Pride and Prejudice', author: 'Jane Austen' },
        {
          id: 9999,
          title: 'The Pride and Prejudice',
          author: 'Jane Austen',
        },
      ];

      const result = removeDuplicates(books);

      expect(result.unique).toHaveLength(1);
      expect(result.duplicateCount).toBe(1);
      expect(result.unique[0].id).toBe(1342); // Keeps lowest ID
    });

    it('keeps books with different titles', () => {
      const books: GutenbergBook[] = [
        { id: 1342, title: 'Pride and Prejudice', author: 'Jane Austen' },
        { id: 11, title: "Alice's Adventures in Wonderland", author: 'Carroll' },
      ];

      const result = removeDuplicates(books);

      expect(result.unique).toHaveLength(2);
      expect(result.duplicateCount).toBe(0);
    });

    it('tracks duplicates in map', () => {
      const books: GutenbergBook[] = [
        { id: 1, title: 'The Great Gatsby', author: 'Fitzgerald' },
        { id: 2, title: 'Great Gatsby', author: 'Fitzgerald' },
        { id: 3, title: 'A Great Gatsby', author: 'Fitzgerald' },
      ];

      const result = removeDuplicates(books);

      expect(result.unique).toHaveLength(1);
      expect(result.duplicateCount).toBe(2);
      expect(result.duplicates.get('great gatsby')).toHaveLength(2);
    });

    it('handles empty array', () => {
      const result = removeDuplicates([]);

      expect(result.unique).toHaveLength(0);
      expect(result.duplicateCount).toBe(0);
    });
  });
});
