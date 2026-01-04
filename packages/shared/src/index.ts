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

export interface SelectionInfo {
  requestedCount: number;
  generatedCount: number;
  selectedIndex: number;
  reason?: string;
}

export interface HaikuCandidate {
  verses: string[];
  book: { title: string; author: string };
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
  selectionInfo?: SelectionInfo;
  candidates?: HaikuCandidate[];
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
  /** Correct book (revealed after game ends) */
  correctBook?: BookValue;
  /** Count of scratched emoticons beyond base 2 */
  scratchedEmoticons: number;
  /** Player-revealed haikus */
  revealedHaikus: string[];
  /** Whether all emoticons have been revealed via scratch */
  allEmoticonsRevealed: boolean;
  /** Whether books selection has been reduced (50 -> 30) */
  hasReducedBooks?: boolean;
  /** Books eliminated by the player */
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
  /** Full hint set (revealed after game ends) */
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

// Caption Generator Utilities

export function maskBookTitle(title: string): string {
  const vowels = 'aeiouyAEIOUY';
  let nonMaskedVowel = '';

  for (const char of title) {
    if (vowels.includes(char)) {
      nonMaskedVowel = char;
      break;
    }
  }

  if (!nonMaskedVowel) {
    return title;
  }

  return title.replaceAll(new RegExp(`[^ ${nonMaskedVowel}]`, 'gi'), '*');
}

export function formatAuthorHashtag(author: string): string {
  return author.toLowerCase().replaceAll(/\s|,|-|\.|\(|\)/g, '');
}

export interface SocialCaptionOptions {
  extraHashtags?: string;
}

export function generateSocialCaption(
  haiku: HaikuValue,
  options?: SocialCaptionOptions,
): string {
  if (!haiku.title || !haiku.book?.emoticons) {
    return '';
  }

  const bookTitle = haiku.book.title;
  const firstLetter = bookTitle[0].toUpperCase();
  const authorFirstName = haiku.book.author.split(' ')[0];
  const hashtagAuthor = formatAuthorHashtag(haiku.book.author);
  const extraHashtags = options?.extraHashtags
    ? ` ${options.extraHashtags}`
    : '';

  return `🌸 “${haiku.title}” 🗻

📚 Guess the book! 👇

~~~

💡 Hint 1 (Bookmoji):
${haiku.book.emoticons}

💡 Hint 2 (First letter of the book):
${firstLetter}...

💡 Hint 3 (Author):
${authorFirstName}...

・
・
・
・

📗 ${bookTitle} by ${haiku.book.author}

~~~

${haiku.verses.join('\n')}

~~~

🇫🇷 ${haiku.translations?.fr || ''}

🇯🇵 ${haiku.translations?.jp || ''}

~~~

#gutenku #bookstagram #guessthebook #${hashtagAuthor}${extraHashtags} ${haiku.hashtags || ''}
`.trim();
}
