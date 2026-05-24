export interface ScoreConfig {
  sentiment: number;
  markovChain: number;
  pos: number;
  trigram: number;
  phonetics: number;
  uniqueness: number;
  verseDistance: number;
  lineLengthBalance: number;
  imageryDensity: number;
  semanticCoherence: number;
  verbPresence: number;
}

export interface FilterConfig {
  name: string;
  score: ScoreConfig;
}

// Test configurations based on baseline averages:
// Verse Distance avg: 0.145, Line Balance avg: 0.849, Imagery avg: 0.017, Coherence avg: 0.023, Verb avg: 0.711
export const FILTER_CONFIGS: FilterConfig[] = [
  // No filters - baseline
  {
    name: 'No Filters',
    score: {
      sentiment: 0,
      markovChain: 0,
      pos: 0,
      trigram: 0,
      phonetics: 0,
      uniqueness: 0,
      verseDistance: 0,
      lineLengthBalance: 0,
      imageryDensity: 0,
      semanticCoherence: 0,
      verbPresence: 0,
    },
  },
  // Original defaults only (no new KPIs)
  {
    name: 'Original Defaults Only',
    score: {
      sentiment: 0.5,
      markovChain: 0.1,
      pos: 0.3,
      trigram: 0.5,
      phonetics: 0.2,
      uniqueness: 0.6,
      verseDistance: 0,
      lineLengthBalance: 0,
      imageryDensity: 0,
      semanticCoherence: 0,
      verbPresence: 0,
    },
  },
  // Minimal new KPIs (very lenient)
  {
    name: 'Minimal New KPIs',
    score: {
      sentiment: 0.5,
      markovChain: 0.1,
      pos: 0.3,
      trigram: 0.5,
      phonetics: 0.2,
      uniqueness: 0.6,
      verseDistance: 0.05,
      lineLengthBalance: 0.5,
      imageryDensity: 0,
      semanticCoherence: 0,
      verbPresence: 0.3,
    },
  },
  // Light new KPIs
  {
    name: 'Light New KPIs',
    score: {
      sentiment: 0.5,
      markovChain: 0.1,
      pos: 0.3,
      trigram: 0.5,
      phonetics: 0.2,
      uniqueness: 0.6,
      verseDistance: 0.1,
      lineLengthBalance: 0.6,
      imageryDensity: 0,
      semanticCoherence: 0,
      verbPresence: 0.4,
    },
  },
  // Moderate new KPIs
  {
    name: 'Moderate New KPIs',
    score: {
      sentiment: 0.5,
      markovChain: 0.1,
      pos: 0.3,
      trigram: 0.5,
      phonetics: 0.2,
      uniqueness: 0.6,
      verseDistance: 0.15,
      lineLengthBalance: 0.7,
      imageryDensity: 0,
      semanticCoherence: 0,
      verbPresence: 0.5,
    },
  },
  // Balance + Line focus
  {
    name: 'Line Balance Focus',
    score: {
      sentiment: 0.5,
      markovChain: 0.1,
      pos: 0.3,
      trigram: 0.5,
      phonetics: 0.2,
      uniqueness: 0.6,
      verseDistance: 0,
      lineLengthBalance: 0.75,
      imageryDensity: 0,
      semanticCoherence: 0,
      verbPresence: 0,
    },
  },
  // Verb presence focus
  {
    name: 'Verb Presence Focus',
    score: {
      sentiment: 0.5,
      markovChain: 0.1,
      pos: 0.3,
      trigram: 0.5,
      phonetics: 0.2,
      uniqueness: 0.6,
      verseDistance: 0,
      lineLengthBalance: 0,
      imageryDensity: 0,
      semanticCoherence: 0,
      verbPresence: 0.5,
    },
  },
];
