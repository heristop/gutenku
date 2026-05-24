import { SENSORY_WORDS_01 } from './validation-sensory-01';
import { SENSORY_WORDS_02 } from './validation-sensory-02';
import { SENSORY_WORDS_03 } from './validation-sensory-03';

export const ALLOWED_REPEATS = new Set([
  'the',
  'a',
  'an',
  'in',
  'on',
  'of',
  'to',
  'and',
  'is',
  'was',
  'with',
  'for',
  'at',
  'by',
  'from',
  'as',
]);

export const TITLES = new Set([
  'mr',
  'mrs',
  'ms',
  'dr',
  'sir',
  'lord',
  'lady',
  'miss',
  'prof',
  'rev',
]);

export const SENSORY_WORDS = new Set<string>([
  ...SENSORY_WORDS_01,
  ...SENSORY_WORDS_02,
  ...SENSORY_WORDS_03,
]);
