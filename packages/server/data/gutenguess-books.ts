/**
 * GutenGuess book fixture for tests.
 * Real book data is in @gutenguess/server package.
 */

/**
 * Localized string with English as required, other locales optional.
 * Fallback: If locale not available, use English.
 */
export interface LocalizedString {
  en: string;
  fr?: string;
  ja?: string;
}

export interface GutenGuessBook {
  id: number;
  title: LocalizedString;
  author: string;
  genre: string;
  era: string;
  authorNationality: string;
  emoticons: string;
  notableQuotes: LocalizedString[];
  publicationYear: number;
  setting: string;
  protagonist: LocalizedString;
  summary: LocalizedString;
  wordCount: number;
}

const GUTENGUESS_BOOKS: readonly GutenGuessBook[] = [
  {
    id: 11,
    title: { en: "Alice's Adventures in Wonderland", fr: 'Les Aventures d\'Alice au pays des merveilles', ja: '不思議の国のアリス' },
    author: 'Lewis Carroll',
    genre: 'Fantasy',
    era: 'Victorian',
    authorNationality: 'British',
    emoticons: '🐰🎩🍄🃏👸',
    notableQuotes: [
      {
        en: "We're all mad here.",
        fr: 'Nous sommes tous fous ici.',
        ja: 'ここではみんな狂っている。',
      },
      {
        en: 'Curiouser and curiouser!',
        fr: 'De plus en plus curieux !',
        ja: 'ますます不思議だわ！',
      },
    ],
    publicationYear: 1865,
    setting: 'Wonderland',
    protagonist: { en: 'Young girl', fr: 'Jeune fille', ja: '少女' },
    summary: {
      en: 'A young girl tumbles down a rabbit hole into a realm where logic bends like willow branches.',
      fr: 'Une jeune fille tombe dans un terrier de lapin vers un royaume où la logique se plie comme des branches de saule.',
      ja: '少女がウサギの穴に落ち、論理が柳の枝のように曲がる世界へと迷い込む。',
    },
    wordCount: 29564,
  },
  {
    id: 84,
    title: { en: 'Frankenstein', fr: 'Frankenstein', ja: 'フランケンシュタイン' },
    author: 'Mary Shelley',
    genre: 'Gothic Horror',
    era: 'Romantic',
    authorNationality: 'British',
    emoticons: '⚡🧟💀🏔️🔬',
    notableQuotes: [
      {
        en: 'Beware; for I am fearless, and therefore powerful.',
        fr: 'Prends garde ; car je suis sans peur, et donc puissant.',
        ja: '気をつけろ。私は恐れを知らない、ゆえに強いのだ。',
      },
      {
        en: 'Nothing is so painful to the human mind as a great and sudden change.',
        fr: "Rien n'est aussi douloureux pour l'esprit humain qu'un changement grand et soudain.",
        ja: '人間の心にとって、大きく突然の変化ほど苦痛なものはない。',
      },
    ],
    publicationYear: 1818,
    setting: 'Europe',
    protagonist: { en: 'Scientist', fr: 'Scientifique', ja: '科学者' },
    summary: {
      en: 'A young scientist dares to create life, only to abandon his creation in horror.',
      fr: 'Un jeune scientifique ose créer la vie, pour abandonner sa création dans l\'horreur.',
      ja: '若き科学者が命を創造することに挑むが、恐怖のあまりその創造物を見捨てる。',
    },
    wordCount: 78101,
  },
  {
    id: 1342,
    title: { en: 'Pride and Prejudice', fr: 'Orgueil et Préjugés', ja: '高慢と偏見' },
    author: 'Jane Austen',
    genre: 'Romance',
    era: 'Regency',
    authorNationality: 'British',
    emoticons: '💃🎩💕📝🏛️',
    notableQuotes: [
      {
        en: 'It is a truth universally acknowledged...',
        fr: "C'est une vérité universellement reconnue...",
        ja: '世間一般に認められた真理である…',
      },
      {
        en: 'You have bewitched me, body and soul.',
        fr: 'Vous m\'avez ensorcelé, corps et âme.',
        ja: 'あなたは私を魅了した、体も心も。',
      },
    ],
    publicationYear: 1813,
    setting: 'England',
    protagonist: { en: 'Young woman', fr: 'Jeune femme', ja: '若い女性' },
    summary: {
      en: 'In the drawing rooms of Regency England, a quick-witted young woman and a proud gentleman spar with words.',
      fr: "Dans les salons de l'Angleterre de la Régence, une jeune femme à l'esprit vif et un gentleman orgueilleux se livrent à des joutes verbales.",
      ja: '摂政時代のイギリスの応接間で、機知に富んだ若い女性と誇り高い紳士が言葉で火花を散らす。',
    },
    wordCount: 130410,
  },
] as const;

export const GUTENGUESS_BOOK_COUNT = GUTENGUESS_BOOKS.length;

export function getGutenGuessBooks(): readonly GutenGuessBook[] {
  return GUTENGUESS_BOOKS;
}

export { GUTENGUESS_BOOKS };
