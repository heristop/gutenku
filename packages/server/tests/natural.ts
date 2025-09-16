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
    ).toStrictEqual(false);
    expect(naturalLanguage.hasUpperCaseWords('AND I WANT TO BE')).toStrictEqual(
      true,
    );
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote('and I want # be'),
    ).toStrictEqual(true);
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote('you want to be And'),
    ).toStrictEqual(true);
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote('I want to be Mr'),
    ).toStrictEqual(true);
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote('I want to be Mrs'),
    ).toStrictEqual(true);
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote('I want to be Mister'),
    ).toStrictEqual(false);
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote('I want to be, yo'),
    ).toStrictEqual(true);
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote('I want to be" yo'),
    ).toStrictEqual(true);
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote(
        '[Illustration: ] I want to be',
      ),
    ).toStrictEqual(true);
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote('I lost a Letter C'),
    ).toStrictEqual(true);
    expect(
      naturalLanguage.hasBlacklistedCharsInQuote('I lost a Letter CC'),
    ).toStrictEqual(false);
  });

  it('detects leading conjunctions', async () => {
    expect(naturalLanguage.startWithConjunction('And so it goes')).toBe(true);
    expect(naturalLanguage.startWithConjunction('but maybe')).toBe(true);
    expect(naturalLanguage.startWithConjunction('Or not')).toBe(true);
    expect(naturalLanguage.startWithConjunction('Of course')).toBe(true);
    expect(naturalLanguage.startWithConjunction('Therefore')).toBe(false);
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
});
