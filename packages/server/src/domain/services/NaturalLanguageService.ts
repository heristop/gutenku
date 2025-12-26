import natural, {
  type SentenceTokenizer,
  type SentimentAnalyzer,
  type WordTokenizer,
} from 'natural';
import { syllable } from 'syllable';
import { singleton } from 'tsyringe';

@singleton()
export default class NaturalLanguageService {
  private sentenceTokenizer: SentenceTokenizer;
  private wordTokenizer: WordTokenizer;
  private sentimentAnalyzer: SentimentAnalyzer;

  constructor() {
    const { PorterStemmer } = natural;

    const abbreviations = ['i.e.', 'e.g.', 'Dr.'];
    this.sentenceTokenizer = new natural.SentenceTokenizer(abbreviations);
    this.wordTokenizer = new natural.WordTokenizer();
    this.sentimentAnalyzer = new natural.SentimentAnalyzer(
      'English',
      PorterStemmer,
      'senticon',
    );
  }

  extractWords(text: string): string[] {
    return this.wordTokenizer.tokenize(text);
  }

  extractSentences(text: string): string[] {
    return this.sentenceTokenizer.tokenize(this.cleanExtraDot(text));
  }

  extractSentencesByPunctuation(text: string): string[] {
    return this.cleanExtraDot(text).split(/[.?!,;]+[\s]+/g);
  }

  cleanExtraDot(text: string): string {
    return text.replaceAll(/(Mr|Mrs|Dr|St)\./g, '$1');
  }

  analyzeSentiment(quote: string): number {
    const words = this.extractWords(quote);

    return this.sentimentAnalyzer.getSentiment(words);
  }

  hasUpperCaseWords(quote: string): boolean {
    return /^[A-Z\s!:.?]+$/g.test(quote);
  }

  hasBlacklistedCharsInQuote(text: string): boolean {
    const firstWordsRegex = /^(said|cried|inquired)/i; // Skip discussions
    const lastWordsRegex = /(or|and|of)$/i;
    const specialCharsRegex =
      /(@|[0-9]|Mr|Mrs|Dr|#|\[|\|\(|\)|"|“|”|‘|’|\/|--|:|,|_|—|\+|=|{|}|\]|\*|\$|%|\r|\n|;|~|&|\/)/g;
    const lostLetter = /\b[A-Z]\b$/;

    const regexList = [
      firstWordsRegex,
      lastWordsRegex,
      specialCharsRegex,
      lostLetter,
    ];

    for (const regex of regexList) {
      if (regex.test(text)) {
        return true;
      }
    }

    return false;
  }

  startWithConjunction(text: string): boolean {
    return /^(and|but|or|of)/i.test(text);
  }

  countSyllables(quote: string): number {
    const words = this.extractWords(quote);

    if (!words) {
      return 0;
    }

    return words.reduce((count, word) => count + syllable(word), 0);
  }
}
