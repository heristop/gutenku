export interface BookValue {
  reference: string;
  title: string;
  author: string;
  emoticons?: string;
  summary?: string;
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

export interface HaikuQualityScore {
  natureWords: number;
  repeatedWords: number;
  weakStarts: number;
  totalScore: number;
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
  quality?: HaikuQualityScore;
}

export interface HaikuResponseData {
  haiku: HaikuValue;
}

export interface HaikuVersion {
  date: string;
  version: string;
}

export interface ChapterResponseData {
  chapters: ChapterValue[];
}
