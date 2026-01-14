import type { Types } from 'mongoose';
import type {
  HaikuQualityScore as SharedHaikuQualityScore,
  ExtractionMethod as SharedExtractionMethod,
} from '@gutenku/shared';

// Re-export shared types
export type {
  BookValue,
  ChapterValue,
  ContextVerses,
  HaikuValue,
  HaikuQualityScore,
  Translations,
  HaikuResponseData,
  ChapterResponseData,
  ExtractionMethod,
} from '@gutenku/shared';

// Server extends shared ExtractionMethod

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
  quality?: SharedHaikuQualityScore;
  extractionMethod?: SharedExtractionMethod;
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
  extractionMethod?: 'punctuation' | 'chunk' | 'ga';
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
