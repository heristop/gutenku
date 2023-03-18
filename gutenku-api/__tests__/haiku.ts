import { expect, it } from '@jest/globals';
import HaikuService from '../services/haiku';

const haikuService = new HaikuService();

it('detect valid quote', async () => {
    expect(haikuService.hasUnexpectedCharsInQuote('And I want to be')).toStrictEqual(true);
    expect(haikuService.hasUnexpectedCharsInQuote('Or I want to be')).toStrictEqual(true);
    expect(haikuService.hasUnexpectedCharsInQuote('Why I want to be')).toStrictEqual(false);
    expect(haikuService.hasUpperCaseChars('AND I WANT TO BE')).toStrictEqual(true);
    expect(haikuService.hasUnexpectedCharsInQuote('and I want # be')).toStrictEqual(true);
    expect(haikuService.hasUnexpectedCharsInQuote('you want to be And')).toStrictEqual(true);
    expect(haikuService.hasUnexpectedCharsInQuote('I want to be Mr')).toStrictEqual(true);
    expect(haikuService.hasUnexpectedCharsInQuote('I want to be Mrs')).toStrictEqual(true);
    expect(haikuService.hasUnexpectedCharsInQuote('I want to be Mister')).toStrictEqual(false);
    expect(haikuService.hasUnexpectedCharsInQuote('I want to be, yo')).toStrictEqual(true);
    expect(haikuService.hasUnexpectedCharsInQuote('I want to be" yo')).toStrictEqual(true);
    expect(haikuService.hasUnexpectedCharsInQuote('[Illustration: ] I want to be')).toStrictEqual(true);
});

it('count syllabes', async () => {
    expect(haikuService.countSyllables('And I want to be')).toEqual(5);
    expect(haikuService.countSyllables('It\'s Mario')).toEqual(5);
});
