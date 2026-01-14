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
  ExtractionMethod,
} from '@gutenku/shared';

// Server extends shared ExtractionMethod with additional types
// Note: 'genetic_algorithm' is now defined in @gutenku/shared

export interface BookValueWithChapters {
  reference: string;
  title: string;
  author: string;
  chapters?: string[] | Types.ObjectId[];
  emoticons?: string;
}

export interface ChapterWithBook {
  _id?: Types.ObjectId | string;
  title?: string;
  content: string;
  book: BookValueWithChapters;
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
  useDaily: boolean;
  date?: string;
  appendImg: boolean;
  useImageAI: boolean;
  selectionCount: number;
  theme: string;
  filter: string;
  sentimentMinScore: number;
  markovMinScore: number;
  posMinScore: number;
  trigramMinScore: number;
  tfidfMinScore: number;
  phoneticsMinScore: number;
  uniquenessMinScore: number;
  verseDistanceMinScore: number;
  lineLengthBalanceMinScore: number;
  imageryDensityMinScore: number;
  semanticCoherenceMinScore: number;
  verbPresenceMinScore: number;
  descriptionTemperature: number;
}

export interface OpenAIOptions {
  apiKey: string;
  selectionCount?: number;
  temperature: {
    description?: number;
  };
}
