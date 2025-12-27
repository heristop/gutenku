import type { Types } from 'mongoose';

// Re-export shared types
export type {
  BookValue,
  ChapterValue,
  ContextVerses,
  HaikuValue,
  Translations,
  HaikuResponseData,
  ChapterResponseData,
} from '@gutenku/shared';

// Server-only types
export interface BookValueWithChapters {
  reference: string;
  title: string;
  author: string;
  chapters?: string[] | Types.ObjectId[];
  emoticons?: string;
}

export interface HaikuDocument {
  book: BookValueWithChapters;
  chapter: {
    title?: string;
    content: string;
  };
  verses: string[];
  rawVerses: string[];
}

export interface HaikuVariables {
  useAI: boolean;
  useCache: boolean;
  appendImg: boolean;
  selectionCount: number;
  theme: string;
  filter: string;
  sentimentMinScore: number;
  markovMinScore: number;
  posMinScore: number;
  trigramMinScore: number;
  tfidfMinScore: number;
  phoneticsMinScore: number;
  descriptionTemperature: number;
}

export interface OpenAIOptions {
  apiKey: string;
  selectionCount?: number;
  temperature: {
    description?: number;
  };
}
