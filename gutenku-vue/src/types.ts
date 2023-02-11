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
    raw_verses: Array<string>;
}
