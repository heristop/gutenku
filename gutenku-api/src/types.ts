export interface BookValue {
    reference: string;
    title: string;
    author: string;
}

export interface HaikuLogValue {
    book_reference: string;
    book_title: string;
    book_author: string;
    haiku_title: string;
    haiku_description: string;
    haiku_verses: Array<string>;
    haiku_image: string;
    created_at: string;
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
