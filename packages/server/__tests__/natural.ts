import 'reflect-metadata';
import dotenv from 'dotenv';
import { expect, it } from '@jest/globals';
import NaturalLanguageService from '../src/application/services/NaturalLanguageService';

dotenv.config();

const naturalLanguage = new NaturalLanguageService();

it('detect valid quote', async () => {
    expect(naturalLanguage.hasBlacklistedCharsInQuote('Why I want to be')).toStrictEqual(false);
    expect(naturalLanguage.hasUpperCaseWords('AND I WANT TO BE')).toStrictEqual(true);
    expect(naturalLanguage.hasBlacklistedCharsInQuote('and I want # be')).toStrictEqual(true);
    expect(naturalLanguage.hasBlacklistedCharsInQuote('you want to be And')).toStrictEqual(true);
    expect(naturalLanguage.hasBlacklistedCharsInQuote('I want to be Mr')).toStrictEqual(true);
    expect(naturalLanguage.hasBlacklistedCharsInQuote('I want to be Mrs')).toStrictEqual(true);
    expect(naturalLanguage.hasBlacklistedCharsInQuote('I want to be Mister')).toStrictEqual(false);
    expect(naturalLanguage.hasBlacklistedCharsInQuote('I want to be, yo')).toStrictEqual(true);
    expect(naturalLanguage.hasBlacklistedCharsInQuote('I want to be" yo')).toStrictEqual(true);
    expect(naturalLanguage.hasBlacklistedCharsInQuote('[Illustration: ] I want to be')).toStrictEqual(true);
    expect(naturalLanguage.hasBlacklistedCharsInQuote('I lost a Letter C')).toStrictEqual(true);
    expect(naturalLanguage.hasBlacklistedCharsInQuote('I lost a Letter CC')).toStrictEqual(false);
});

it('count syllabes', async () => {
    expect(naturalLanguage.countSyllables('And I want to be')).toEqual(5);
    expect(naturalLanguage.countSyllables('It\'s Mario')).toEqual(5);
});

it('calculate sentiment score', async () => {
    expect(naturalLanguage.analyzeSentiment('I like cherries')).toBeGreaterThanOrEqual(0);
});
