import { Types } from 'mongoose';

export interface BookValue {
    reference: string;
    title: string;
    author: string;
    chapters?: string[] | Types.ObjectId[];
    emoticons?: string;
}

export interface ChapterValue {
    content: string;
}

export interface Translations {
    fr?: string;
    jp?: string;
    es?: string;
    it?: string;
    de?: string;
}

export interface HaikuDocument {
    book: BookValue;
    chapter: {
        title?: string;
        content: string;
    };
    verses: Array<string>;
    rawVerses: Array<string>;
}

export interface HaikuValue {
    book: BookValue;
    chapter: {
        title?: string;
        content: string;
    };
    verses: Array<string>;
    rawVerses: Array<string>;
    context?: ContextVerses[];
    image?: string;
    imagePath?: string;
    title?: string;
    description?: string;
    hashtags?: string;
    translations?: Translations
    cacheUsed: boolean;
    executionTime?: number;
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
    descriptionTemperature: number;
}

export interface HaikuResponseData {
    haiku: HaikuValue;
}

export interface ChapterResponseData {
    chapters: ChapterValue[];
}

export interface OpenAIOptions {
    apiKey: string;
    selectionCount?: number;
    temperature: {
        prompt?: number;
        description?: number;
    };
}

export interface ContextVerses {
    wordsBefore?: string,
    sentenceBefore?: string,
    wordsAfter?: string,
    sentenceAfter?: string
}
