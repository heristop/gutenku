/**
 * GutenGuess book fixture for tests.
 * Real book data is in @gutenguess/server package.
 */

export interface GutenGuessBook {
  id: number;
  title: string;
  author: string;
  genre: string;
  era: string;
  authorNationality: string;
  emoticons: string;
  notableQuotes: string[];
  publicationYear: number;
  setting: string;
  protagonist: string;
}

const GUTENGUESS_BOOKS: readonly GutenGuessBook[] = [
  {
    id: 11,
    title: "Alice's Adventures in Wonderland",
    author: 'Lewis Carroll',
    genre: 'Fantasy',
    era: 'Victorian',
    authorNationality: 'British',
    emoticons: '🐰🎩🍄🃏👸',
    notableQuotes: ["We're all mad here.", 'Curiouser and curiouser!'],
    publicationYear: 1865,
    setting: 'Wonderland',
    protagonist: 'Young girl',
  },
  {
    id: 84,
    title: 'Frankenstein',
    author: 'Mary Shelley',
    genre: 'Gothic Horror',
    era: 'Romantic',
    authorNationality: 'British',
    emoticons: '⚡🧟💀🏔️🔬',
    notableQuotes: [
      'Beware; for I am fearless, and therefore powerful.',
      'Nothing is so painful to the human mind as a great and sudden change.',
    ],
    publicationYear: 1818,
    setting: 'Europe',
    protagonist: 'Scientist',
  },
  {
    id: 1342,
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    genre: 'Romance',
    era: 'Regency',
    authorNationality: 'British',
    emoticons: '💃🎩💕📝🏛️',
    notableQuotes: [
      'It is a truth universally acknowledged...',
      'You have bewitched me, body and soul.',
    ],
    publicationYear: 1813,
    setting: 'England',
    protagonist: 'Young woman',
  },
] as const;

export const GUTENGUESS_BOOK_COUNT = GUTENGUESS_BOOKS.length;

export function getGutenGuessBooks(): readonly GutenGuessBook[] {
  return GUTENGUESS_BOOKS;
}

export { GUTENGUESS_BOOKS };
