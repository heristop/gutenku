import type { BookValue } from './haiku';

export type HintType =
  | 'emoticons'
  | 'genre'
  | 'era'
  | 'quote'
  | 'first_letter'
  | 'author_nationality'
  | 'author_name'
  | 'publication_century'
  | 'title_word_count'
  | 'setting'
  | 'protagonist';

export interface PuzzleHint {
  round: number;
  type: HintType;
  content: string;
}

export interface DailyPuzzle {
  date: string;
  puzzleNumber: number;
  hints: PuzzleHint[];
  haikus: string[];
  emoticonCount: number;
  nextPuzzleAvailableAt: string;
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
  correctBook?: BookValue;
  scratchedEmoticons: number;
  revealedHaikus: string[];
  allEmoticonsRevealed: boolean;
  hasReducedBooks?: boolean;
  eliminatedBooks?: string[];
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
  allHints?: PuzzleHint[];
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

export interface PuzzleVersion {
  puzzleNumber: number;
  version: string;
}
