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
