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

function trainWorker(chapters: string[]): WorkerResult {
  const bigrams = new Map<string, Map<string, number>>();
  const trigrams = new Map<string, Map<string, number>>();
  const bigramTotals = new Map<string, number>();
  const trigramTotals = new Map<string, number>();
  const vocabulary = new Set<string>();
  let totalBigrams = 0;
  let totalTrigrams = 0;

  for (const content of chapters) {
    const sentences = extractSentences(content.replaceAll('\n', ' '));

    for (const sentence of sentences) {
      const words = extractWords(sentence);
      const wordList: string[] = [];

      for (const word of words) {
        const lowerWord = word.toLowerCase();

        if (!FANBOYS_SET.has(lowerWord)) {
          wordList.push(lowerWord);
          vocabulary.add(lowerWord);
        }
      }

      for (let i = 0; i < wordList.length - 1; i++) {
        const from = wordList[i];
        const to = wordList[i + 1];

        let transitions = bigrams.get(from);

        if (!transitions) {
          transitions = new Map();
          bigrams.set(from, transitions);
        }

        transitions.set(to, (transitions.get(to) || 0) + 1);
        bigramTotals.set(from, (bigramTotals.get(from) || 0) + 1);
        totalBigrams++;
      }

      for (let i = 0; i < wordList.length - 2; i++) {
        const key = `${wordList[i]} ${wordList[i + 1]}`;
        const next = wordList[i + 2];

        let transitions = trigrams.get(key);

        if (!transitions) {
          transitions = new Map();
          trigrams.set(key, transitions);
        }

        transitions.set(next, (transitions.get(next) || 0) + 1);
        trigramTotals.set(key, (trigramTotals.get(key) || 0) + 1);
        totalTrigrams++;
      }
    }
  }

  // Serialize Maps for transfer
  return {
    bigrams: [...bigrams].map(([k, v]) => [k, [...v]]),
    trigrams: [...trigrams].map(([k, v]) => [k, [...v]]),
    bigramTotals: [...bigramTotals],
    trigramTotals: [...trigramTotals],
    totalBigrams,
    totalTrigrams,
    vocabulary: [...vocabulary],
  };
}

// Main worker execution
const data = workerData as WorkerData;
const result = trainWorker(data.chapters);
parentPort?.postMessage(result);
