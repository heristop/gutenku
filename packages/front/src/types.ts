export interface HaikuValue {
    book: {
        reference: string;
        title: string;
        author: string;
    };
    chapter: {
        title: string;
        content: string;
    };
    useCache: boolean;
    verses: Array<string>;
    rawVerses: Array<string>;
    image: string;
    title: string;
    description: string;
}
