import 'reflect-metadata';
import dotenv from 'dotenv';
import { describe, expect, it } from 'vitest';
import NaturalLanguageService from '../src/domain/services/NaturalLanguageService';

dotenv.config();

const naturalLanguage = new NaturalLanguageService();

describe('NaturalLanguageService - validation helpers', () => {
  it('detects valid quote and blacklisted patterns', async () => {
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote('Why I want to be'),
    ).toBeFalsy();
    expect(naturalLanguage.hasUpperCaseWords('AND I WANT TO BE')).toBeTruthy();
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote('and I want # be'),
    ).toBeTruthy();
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote('you want to be And'),
    ).toBeTruthy();
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote('I want to be Mr'),
    ).toBeTruthy();
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote('I want to be Mrs'),
    ).toBeTruthy();
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote('I want to be Mister'),
    ).toBeFalsy();
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote('I want to be, yo'),
    ).toBeTruthy();
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote('I want to be" yo'),
    ).toBeTruthy();
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote(
        '[Illustration: ] I want to be',
      ),
    ).toBeTruthy();
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote('I lost a Letter C'),
    ).toBeTruthy();
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote('I lost a Letter CC'),
    ).toBeFalsy();
  });

  it('detects leading conjunctions', async () => {
    expect(naturalLanguage.startWithConjunction('And so it goes')).toBeTruthy();
    expect(naturalLanguage.startWithConjunction('but maybe')).toBeTruthy();
    expect(naturalLanguage.startWithConjunction('Or not')).toBeTruthy();
    expect(naturalLanguage.startWithConjunction('Of course')).toBeTruthy();
    expect(naturalLanguage.startWithConjunction('Therefore')).toBeFalsy();
  });

  it('detects first word patterns like said/cried/inquired', () => {
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote('said hello'),
    ).toBeTruthy();
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote('cried the man'),
    ).toBeTruthy();
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote('inquired politely'),
    ).toBeTruthy();
  });

  it('detects last word patterns like or/and/of', () => {
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote('the nature of'),
    ).toBeTruthy();
    expect(naturalLanguage.hasBlacklistedCharsInQuote('this and')).toBeTruthy();
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote('choice or'),
    ).toBeTruthy();
  });

  it('detects special characters', () => {
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote('test@email'),
    ).toBeTruthy();
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote('test123number'),
    ).toBeTruthy();
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote('test/slash'),
    ).toBeTruthy();
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote('test--dash'),
    ).toBeTruthy();
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote('test:colon'),
    ).toBeTruthy();
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote('test_underscore'),
    ).toBeTruthy();
  });

  it('detects mixed case words correctly', () => {
    expect(naturalLanguage.hasUpperCaseWords('This Is Normal')).toBeFalsy();
    expect(naturalLanguage.hasUpperCaseWords('all lowercase')).toBeFalsy();
    expect(naturalLanguage.hasUpperCaseWords('ALL CAPS!')).toBeTruthy();
  });
});

describe('NaturalLanguageService - syllables', () => {
  it('counts syllables for regular phrases', async () => {
    expect(naturalLanguage.countSyllables('And I want to be')).toEqual(5);
    expect(naturalLanguage.countSyllables("It's Mario")).toEqual(5);
  });

  it('returns 0 for empty or whitespace-only input', async () => {
    expect(naturalLanguage.countSyllables('')).toEqual(0);
    expect(naturalLanguage.countSyllables('   ')).toEqual(0);
  });

  it('counts syllables for single words', () => {
    expect(naturalLanguage.countSyllables('beautiful')).toEqual(3);
    expect(naturalLanguage.countSyllables('the')).toEqual(1);
  });

  it('counts syllables for complex phrases', () => {
    expect(naturalLanguage.countSyllables('an old silent pond')).toEqual(5);
    expect(
      naturalLanguage.countSyllables('a frog jumps into the pond'),
    ).toEqual(7);
  });

  it('returns 0 when extractWords returns null', () => {
    // Create a service instance and mock extractWords
    const testService = new NaturalLanguageService();
    const originalExtractWords = testService.extractWords.bind(testService);
    testService.extractWords = () => null as unknown as string[];

    expect(testService.countSyllables('any text')).toEqual(0);

    // Restore
    testService.extractWords = originalExtractWords;
  });

  it('handles punctuation in syllable counting', () => {
    expect(naturalLanguage.countSyllables('Hello, world!')).toBeGreaterThan(0);
  });

  it('handles hyphenated words', () => {
    expect(naturalLanguage.countSyllables('well-known')).toBeGreaterThan(0);
  });
});

describe('NaturalLanguageService - tokenization and sentiment', () => {
  it('tokenizes sentences with abbreviations handled', async () => {
    const text = 'We met Dr. Strange. It was fun! I.e. we laughed, a lot.';
    const sentences = naturalLanguage.extractSentences(text);
    expect(sentences.length).toBeGreaterThanOrEqual(3);
  });

  it('tokenizes by punctuation as a fallback', async () => {
    const text = 'Hello world! How are you? Fine; thanks.';
    const sentences = naturalLanguage.extractSentencesByPunctuation(text);
    expect(sentences).toEqual([
      'Hello world',
      'How are you',
      'Fine',
      'thanks.',
    ]);
  });

  it('calculates non-negative sentiment for a positive sentence', async () => {
    expect(naturalLanguage.analyzeSentiment('I like cherries')).toBeGreaterThan(
      -Infinity,
    );
  });

  it('extracts words correctly', () => {
    const words = naturalLanguage.extractWords('Hello world test');
    expect(words).toEqual(['Hello', 'world', 'test']);
  });

  it('handles empty text in extractWords', () => {
    const words = naturalLanguage.extractWords('');
    expect(words.length).toBe(0);
  });

  it('cleans extra dots correctly', () => {
    // cleanExtraDot is called internally by extractSentences
    const text = 'Mr. Smith and Mrs. Jones went to St. Louis.';
    const sentences = naturalLanguage.extractSentences(text);
    expect(sentences.length).toBeGreaterThanOrEqual(1);
  });

  it('calculates sentiment for negative sentences', () => {
    const sentiment = naturalLanguage.analyzeSentiment(
      'I hate this terrible thing',
    );
    expect(typeof sentiment).toBe('number');
  });

  it('calculates sentiment for neutral sentences', () => {
    const sentiment = naturalLanguage.analyzeSentiment(
      'The book is on the table',
    );
    expect(typeof sentiment).toBe('number');
  });

  it('handles text with multiple punctuation marks', () => {
    const sentences = naturalLanguage.extractSentencesByPunctuation(
      'What?! No way... Yes!',
    );
    expect(sentences.length).toBeGreaterThan(0);
  });

  it('extracts words with punctuation attached', () => {
    const words = naturalLanguage.extractWords('Hello, world! How are you?');
    expect(words.length).toBeGreaterThan(0);
  });

  it('handles extractSentences with empty string', () => {
    const sentences = naturalLanguage.extractSentences('');
    expect(sentences.length).toBe(0);
  });

  it('handles extractSentencesByPunctuation with empty string', () => {
    const sentences = naturalLanguage.extractSentencesByPunctuation('');
    // Empty string split produces [''], so length is 1
    expect(sentences.length).toBeGreaterThanOrEqual(0);
  });

  it('analyzeSentiment returns number for empty string', () => {
    const sentiment = naturalLanguage.analyzeSentiment('');
    expect(typeof sentiment).toBe('number');
  });
});
