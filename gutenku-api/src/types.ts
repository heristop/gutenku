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
    image_path?: string;
    title?: string;
    description?: string;
}

export interface HaikuResponseData {
    haiku: HaikuValue;
}

export interface OpenAIOptions {
    apiKey: string;
    selectionCount?: number;
}
