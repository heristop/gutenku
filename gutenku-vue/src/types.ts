export interface HaikuValue {
    book: {
        title: string;
        author: string;
    };
    chapter: {
        title: string;
        content: string;
    };
    verses: Array<string>;
    rawVerses: Array<string>;
    image: string;
    title: string;
    description: string;
}
