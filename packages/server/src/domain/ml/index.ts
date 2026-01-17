/**
 * Machine Learning Domain Module
 *
 * Exports the core ML components for haiku quality prediction:
 * - HaikuEmbeddingModel: Character-level CNN for haiku embeddings
 * - VerseEmbeddingService: Service for computing verse embeddings
 * - SiameseTrainer: Triplet loss training for the embedding model
 */

export { HaikuEmbeddingModel } from './HaikuEmbeddingModel';
export { VerseEmbeddingService } from './VerseEmbeddingService';
export type { EnhancedVersePools } from './VerseEmbeddingService';
export { SiameseTrainer } from './SiameseTrainer';
export type { TrainingProgress, TrainingResult } from './SiameseTrainer';
