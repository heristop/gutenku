import { Types } from 'mongoose';

export interface BookValue {
    reference: string;
    title: string;
    author: string;
    chapters?: string[] | Types.ObjectId[];
}

export interface HaikuValue {
    book: BookValue;
    chapter: {
        title: string;
        content: string;
    };
    verses: Array<string>;
    rawVerses: Array<string>;
    image?: string;
    imagePath?: string;
    title?: string;
    description?: string;
    hashtags?: string;
    fr?: string;
    es?: string;
}

export interface HaikuResponseData {
    haiku: HaikuValue;
}

export interface OpenAIOptions {
    apiKey: string;
    selectionCount?: number;
}
