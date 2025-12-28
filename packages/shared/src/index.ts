export interface BookValue {
  reference: string;
  title: string;
  author: string;
  emoticons?: string;
}

export interface ChapterValue {
  title?: string;
  content: string;
}

export interface Translations {
  fr?: string;
  jp?: string;
  es?: string;
  it?: string;
  de?: string;
}

export interface ContextVerses {
  wordsBefore?: string;
  sentenceBefore?: string;
  wordsAfter?: string;
  sentenceAfter?: string;
}

export interface HaikuValue {
  book: BookValue;
  chapter: ChapterValue;
  verses: string[];
  rawVerses: string[];
  context?: ContextVerses[];
  image?: string;
  imagePath?: string;
  title?: string;
  description?: string;
  hashtags?: string;
  translations?: Translations;
  cacheUsed: boolean;
  executionTime?: number;
}

export interface HaikuResponseData {
  haiku: HaikuValue;
}

export interface ChapterResponseData {
  chapters: ChapterValue[];
}

// GutenGuess Game Types
export type HintType =
  | 'emoticons'
  | 'haiku'
  | 'genre_era'
  | 'quote'
  | 'letter_author'
  | 'author_name';

export interface PuzzleHint {
  round: number;
  type: HintType;
  content: string;
}

export interface DailyPuzzle {
  date: string;
  puzzleNumber: number;
  hints: PuzzleHint[];
}

export interface GameGuess {
  bookId: string;
  bookTitle: string;
  isCorrect: boolean;
  round: number;
}

export interface GameState {
  puzzleNumber: number;
  date: string;
  guesses: GameGuess[];
  currentRound: number;
  isComplete: boolean;
  isWon: boolean;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate: string | null;
  guessDistribution: Record<number, number>;
}

export interface GuessResult {
  isCorrect: boolean;
  correctBook?: BookValue;
  nextHint?: PuzzleHint;
}

export interface DailyPuzzleResponse {
  puzzle: DailyPuzzle;
  availableBooks: BookValue[];
}

export interface GlobalStats {
  totalHaikusGenerated: number;
  totalGamesPlayed: number;
  totalGamesWon: number;
}
