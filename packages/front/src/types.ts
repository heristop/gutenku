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
  verses: Array<string>;
  rawVerses: Array<string>;
  image: string;
  title: string;
  description: string;
  cacheUsed: boolean;
  executionTime?: number;
}
