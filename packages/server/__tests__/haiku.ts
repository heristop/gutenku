import dotenv from 'dotenv';
import { expect, it } from '@jest/globals';
import HaikuService from '../src/services/haiku';

dotenv.config();

const haikuService = new HaikuService();

it('detect valid quote', async () => {
    expect(haikuService.hasForbiddenCharsInQuote('And I want to be')).toStrictEqual(true);
    expect(haikuService.hasForbiddenCharsInQuote('Or I want to be')).toStrictEqual(true);
    expect(haikuService.hasForbiddenCharsInQuote('Why I want to be')).toStrictEqual(false);
    expect(haikuService.hasUpperCaseChars('AND I WANT TO BE')).toStrictEqual(true);
    expect(haikuService.hasForbiddenCharsInQuote('and I want # be')).toStrictEqual(true);
    expect(haikuService.hasForbiddenCharsInQuote('you want to be And')).toStrictEqual(true);
    expect(haikuService.hasForbiddenCharsInQuote('I want to be Mr')).toStrictEqual(true);
    expect(haikuService.hasForbiddenCharsInQuote('I want to be Mrs')).toStrictEqual(true);
    expect(haikuService.hasForbiddenCharsInQuote('I want to be Mister')).toStrictEqual(false);
    expect(haikuService.hasForbiddenCharsInQuote('I want to be, yo')).toStrictEqual(true);
    expect(haikuService.hasForbiddenCharsInQuote('I want to be" yo')).toStrictEqual(true);
    expect(haikuService.hasForbiddenCharsInQuote('[Illustration: ] I want to be')).toStrictEqual(true);
    expect(haikuService.hasForbiddenCharsInQuote('I lost a Letter C')).toStrictEqual(true);
    expect(haikuService.hasForbiddenCharsInQuote('I lost a Letter CC')).toStrictEqual(false);
});

it('count syllabes', async () => {
    expect(haikuService.countSyllables('And I want to be')).toEqual(5);
    expect(haikuService.countSyllables('It\'s Mario')).toEqual(5);
});
