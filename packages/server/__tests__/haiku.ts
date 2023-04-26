import dotenv from 'dotenv';
import { expect, it } from '@jest/globals';
import HaikuService from '../src/services/haiku';

dotenv.config();

const haikuService = new HaikuService();

it('detect valid quote', async () => {
    expect(haikuService.hasBlacklistedCharsInQuote('Why I want to be')).toStrictEqual(false);
    expect(haikuService.hasUpperCaseWords('AND I WANT TO BE')).toStrictEqual(true);
    expect(haikuService.hasBlacklistedCharsInQuote('and I want # be')).toStrictEqual(true);
    expect(haikuService.hasBlacklistedCharsInQuote('you want to be And')).toStrictEqual(true);
    expect(haikuService.hasBlacklistedCharsInQuote('I want to be Mr')).toStrictEqual(true);
    expect(haikuService.hasBlacklistedCharsInQuote('I want to be Mrs')).toStrictEqual(true);
    expect(haikuService.hasBlacklistedCharsInQuote('I want to be Mister')).toStrictEqual(false);
    expect(haikuService.hasBlacklistedCharsInQuote('I want to be, yo')).toStrictEqual(true);
    expect(haikuService.hasBlacklistedCharsInQuote('I want to be" yo')).toStrictEqual(true);
    expect(haikuService.hasBlacklistedCharsInQuote('[Illustration: ] I want to be')).toStrictEqual(true);
    expect(haikuService.hasBlacklistedCharsInQuote('I lost a Letter C')).toStrictEqual(true);
    expect(haikuService.hasBlacklistedCharsInQuote('I lost a Letter CC')).toStrictEqual(false);
});

it('count syllabes', async () => {
    expect(haikuService.countSyllables('And I want to be')).toEqual(5);
    expect(haikuService.countSyllables('It\'s Mario')).toEqual(5);
});
