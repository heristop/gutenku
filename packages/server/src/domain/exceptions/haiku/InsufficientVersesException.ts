import { ErrorCode } from '../ErrorCode';
import {
  type HaikuGenerationMetadata,
  HaikuGenerationException,
} from './HaikuGenerationException';

export interface InsufficientVersesMetadata extends HaikuGenerationMetadata {
  versesFound: number;
  requiredVerses: number;
  thresholdScores?: {
    sentiment?: number;
    markov?: number;
    pos?: number;
    trigram?: number;
    tfidf?: number;
    phonetics?: number;
  };
}

export class InsufficientVersesException extends HaikuGenerationException {
  constructor(options: {
    versesFound: number;
    requiredVerses?: number;
    thresholdScores?: InsufficientVersesMetadata['thresholdScores'];
    cause?: Error;
  }) {
    const required = options.requiredVerses ?? 3;
    const message = `Insufficient verses found: ${options.versesFound}/${required}. Scoring thresholds may be too restrictive.`;

    super(message, {
      cause: options.cause,
      metadata: {
        versesFound: options.versesFound,
        requiredVerses: required,
        thresholdScores: options.thresholdScores,
      },
    });

    (this as { code: ErrorCode }).code = ErrorCode.INSUFFICIENT_VERSES;
  }
}
