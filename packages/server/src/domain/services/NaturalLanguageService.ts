import natural, {
  type BrillPOSTagger,
  type Lexicon,
  type Metaphone,
  type RuleSet,
  type SentenceTokenizer,
  type SentimentAnalyzer,
  type TfIdf,
  type WordTokenizer,
} from 'natural';
import { syllable } from 'syllable';
import { singleton } from 'tsyringe';

export interface GrammarAnalysis {
  hasNoun: boolean;
  hasVerb: boolean;
  hasAdjective: boolean;
  score: number;
}

export interface PhoneticsAnalysis {
  alliterationScore: number;
  uniqueSounds: number;
  totalWords: number;
}

@singleton()
export default class NaturalLanguageService {
  private sentenceTokenizer: SentenceTokenizer;
  private wordTokenizer: WordTokenizer;
  private sentimentAnalyzer: SentimentAnalyzer;
  private posTagger: BrillPOSTagger;
  private tfidf: TfIdf | null = null;
  private metaphone: Metaphone;

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

    const lexicon = new natural.Lexicon('EN', 'N', 'NNP') as Lexicon;
    const ruleSet = new natural.RuleSet('EN') as RuleSet;
    this.posTagger = new natural.BrillPOSTagger(
      lexicon,
      ruleSet,
    ) as BrillPOSTagger;

    this.metaphone = new natural.Metaphone() as Metaphone;
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
    const firstWordsRegex = /^(said|cried|inquired)/i;
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

  analyzeGrammar(quote: string): GrammarAnalysis {
    const words = this.extractWords(quote);

    if (!words || words.length === 0) {
      return { hasNoun: false, hasVerb: false, hasAdjective: false, score: 0 };
    }

    const tagged = this.posTagger.tag(words);
    let hasNoun = false;
    let hasVerb = false;
    let hasAdjective = false;

    for (const { tag } of tagged.taggedWords) {
      if (tag.startsWith('NN')) {
        hasNoun = true;
      }
      if (tag.startsWith('VB')) {
        hasVerb = true;
      }
      if (tag.startsWith('JJ')) {
        hasAdjective = true;
      }
    }

    let score = 0;
    if (hasNoun && hasVerb) {
      score = 1;
    } else if (hasNoun && hasAdjective) {
      score = 0.8;
    } else if (hasNoun) {
      score = 0.5;
    } else if (hasVerb) {
      score = 0.3;
    }

    return { hasNoun, hasVerb, hasAdjective, score };
  }

  initTfIdf(corpus: string[]): void {
    this.tfidf = new natural.TfIdf() as TfIdf;
    for (const doc of corpus) {
      this.tfidf.addDocument(doc);
    }
  }

  scoreDistinctiveness(quote: string, documentIndex = 0): number {
    if (!this.tfidf) {
      return 0;
    }

    const words = this.extractWords(quote);

    if (!words || words.length === 0) {
      return 0;
    }

    let totalScore = 0;
    for (const word of words) {
      totalScore += this.tfidf.tfidf(word.toLowerCase(), documentIndex);
    }

    const avgScore = totalScore / words.length;
    return Math.tanh(avgScore / 5);
  }

  analyzePhonetics(verses: string[]): PhoneticsAnalysis {
    const allWords: string[] = [];

    for (const verse of verses) {
      const words = this.extractWords(verse);
      if (words) {
        allWords.push(...words);
      }
    }

    if (allWords.length < 2) {
      return { alliterationScore: 0, uniqueSounds: 0, totalWords: 0 };
    }

    const phoneCodes: string[] = [];
    for (const word of allWords) {
      if (word.length > 0) {
        const code = this.metaphone.process(word);
        if (code.length > 0) {
          phoneCodes.push(code[0]);
        }
      }
    }

    const soundCounts = new Map<string, number>();
    for (const code of phoneCodes) {
      soundCounts.set(code, (soundCounts.get(code) || 0) + 1);
    }

    let repeatedCount = 0;
    for (const count of soundCounts.values()) {
      if (count > 1) {
        repeatedCount += count;
      }
    }

    const alliterationScore =
      phoneCodes.length > 0 ? repeatedCount / phoneCodes.length : 0;

    return {
      alliterationScore,
      uniqueSounds: soundCounts.size,
      totalWords: allWords.length,
    };
  }
}
