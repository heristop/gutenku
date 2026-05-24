import { parentPort, workerData } from 'node:worker_threads';
import natural from 'natural';

interface WorkerData {
  chapters: string[];
}

interface WorkerResult {
  bigrams: [string, [string, number][]][];
  trigrams: [string, [string, number][]][];
  bigramTotals: [string, number][];
  trigramTotals: [string, number][];
  totalBigrams: number;
  totalTrigrams: number;
  vocabulary: string[];
}

const FANBOYS_SET = new Set(['for', 'and', 'nor', 'but', 'or', 'yet', 'so']);

// Tokenizers for worker thread context
const abbreviations = ['i.e.', 'e.g.', 'Dr.'];
const sentenceTokenizer = new natural.SentenceTokenizer(abbreviations);
const wordTokenizer = new natural.WordTokenizer();

function cleanExtraDot(text: string): string {
  return text.replaceAll(/(Mr|Mrs|Dr|St)\./g, '$1');
}

function extractSentences(text: string): string[] {
  return sentenceTokenizer.tokenize(cleanExtraDot(text));
}

function extractWords(text: string): string[] {
  return wordTokenizer.tokenize(text);
}

function buildWordList(
  sentence: string,
  vocabulary: Set<string>,
): string[] {
  const words = extractWords(sentence);
  const wordList: string[] = [];

  for (const word of words) {
    const lowerWord = word.toLowerCase();

    if (!FANBOYS_SET.has(lowerWord)) {
      wordList.push(lowerWord);
      vocabulary.add(lowerWord);
    }
  }

  return wordList;
}

function incrementTransition(
  store: Map<string, Map<string, number>>,
  totals: Map<string, number>,
  from: string,
  to: string,
): void {
  let transitions = store.get(from);

  if (!transitions) {
    transitions = new Map();
    store.set(from, transitions);
  }

  transitions.set(to, (transitions.get(to) || 0) + 1);
  totals.set(from, (totals.get(from) || 0) + 1);
}

interface NGramAccumulator {
  bigrams: Map<string, Map<string, number>>;
  trigrams: Map<string, Map<string, number>>;
  bigramTotals: Map<string, number>;
  trigramTotals: Map<string, number>;
  totalBigrams: number;
  totalTrigrams: number;
}

function accumulateFromWordList(
  acc: NGramAccumulator,
  wordList: string[],
): void {
  for (let i = 0; i < wordList.length - 1; i++) {
    incrementTransition(
      acc.bigrams,
      acc.bigramTotals,
      wordList[i],
      wordList[i + 1],
    );
    acc.totalBigrams++;
  }

  for (let i = 0; i < wordList.length - 2; i++) {
    const key = `${wordList[i]} ${wordList[i + 1]}`;
    incrementTransition(acc.trigrams, acc.trigramTotals, key, wordList[i + 2]);
    acc.totalTrigrams++;
  }
}

function trainWorker(chapters: string[]): WorkerResult {
  const acc: NGramAccumulator = {
    bigrams: new Map(),
    trigrams: new Map(),
    bigramTotals: new Map(),
    trigramTotals: new Map(),
    totalBigrams: 0,
    totalTrigrams: 0,
  };
  const vocabulary = new Set<string>();

  for (const content of chapters) {
    const sentences = extractSentences(content.replaceAll('\n', ' '));

    for (const sentence of sentences) {
      const wordList = buildWordList(sentence, vocabulary);
      accumulateFromWordList(acc, wordList);
    }
  }

  // Serialize Maps for transfer
  return {
    bigrams: [...acc.bigrams].map(([k, v]) => [k, [...v]]),
    trigrams: [...acc.trigrams].map(([k, v]) => [k, [...v]]),
    bigramTotals: [...acc.bigramTotals],
    trigramTotals: [...acc.trigramTotals],
    totalBigrams: acc.totalBigrams,
    totalTrigrams: acc.totalTrigrams,
    vocabulary: [...vocabulary],
  };
}

// Main worker execution
const data = workerData as WorkerData;
const result = trainWorker(data.chapters);
parentPort?.postMessage(result);
