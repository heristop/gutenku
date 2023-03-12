import { expect, it } from '@jest/globals';
import haiku from '../services/haiku';

it('detect valid quote', async () => {
    expect(haiku.isFirstQuoteInvalid('And I want to be')).toStrictEqual(true);
    expect(haiku.hasUpperCaseChars('AND I WANT TO BE')).toStrictEqual(true);
    expect(haiku.hasUnexpectedCharsInQuote('and I want # be')).toStrictEqual(true);
    expect(haiku.hasUnexpectedCharsInQuote('you want to be And')).toStrictEqual(true);
    expect(haiku.hasUnexpectedCharsInQuote('And I want to be')).toStrictEqual(false);
    expect(haiku.countSyllables('And I want to be')).toEqual(5);
});
