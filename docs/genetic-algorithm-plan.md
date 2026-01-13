# Genetic Algorithm for Haiku Selection - Exhaustive Implementation Plan

## Table of Contents

1. [Overview](#overview)
2. [Problem Analysis](#problem-analysis)
3. [Architecture Design](#architecture-design)
4. [Data Structures](#data-structures)
5. [GA Operators - Detailed](#ga-operators---detailed)
6. [Implementation Phases](#implementation-phases)
7. [File-by-File Implementation](#file-by-file-implementation)
8. [Integration Points](#integration-points)
9. [Configuration & Environment](#configuration--environment)
10. [Error Handling](#error-handling)
11. [Performance Optimization](#performance-optimization)
12. [Testing Strategy](#testing-strategy)
13. [Monitoring & Observability](#monitoring--observability)
14. [Rollback Strategy](#rollback-strategy)
15. [Future Enhancements](#future-enhancements)

---

## 1. Overview

### Goal

Integrate a deterministic genetic algorithm (GA) as a pre-filter before GPT selection to improve haiku quality through evolutionary optimization of verse combinations.

### Current Flow

```
Extract quotes → Random verse selection → Score (14 metrics) → Top 5 → GPT selection
```

### Proposed Flow

```
Extract quotes → Build verse pools → GA evolution (N generations) → Top 5 evolved → GPT selection
```

### Expected Benefits

- Better exploration of combinatorial search space
- Escape local optima through mutation
- Combine quality traits via crossover
- Deterministic reproducibility with seeded PRNG

---

## 2. Problem Analysis

### Search Space Size

Given typical extraction yields:

- ~100-200 valid 5-syllable quotes per book
- ~80-150 valid 7-syllable quotes per book
- Combinatorial space: 100 × 80 × 99 = **792,000 possible haikus** per book

Current approach samples ~50-100 randomly, missing vast majority of combinations.

### Why GA is Appropriate

| GA Requirement        | Haiku Problem Fit                     |
| --------------------- | ------------------------------------- |
| Large search space    | ✅ ~800K combinations                 |
| Computable fitness    | ✅ 14-metric totalScore               |
| Meaningful crossover  | ✅ Verse swapping preserves structure |
| No gradient available | ✅ Discrete combinatorial             |

### Constraints

- Must integrate with existing `HaikuValidatorService`
- Must support deterministic mode for daily puzzles
- Must not significantly increase generation latency
- Must maintain backwards compatibility

---

## 3. Architecture Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    OpenAIGeneratorService                        │
│  ┌─────────────┐    ┌──────────────────┐    ┌────────────────┐  │
│  │ Extract     │───▶│ GeneticAlgorithm │───▶│ GPT Selection  │  │
│  │ VersePools  │    │ Service          │    │ (existing)     │  │
│  └─────────────┘    └──────────────────┘    └────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  GeneticAlgorithmService                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Population   │  │ Operators    │  │ FitnessEvaluator     │   │
│  │ Manager      │  │ (S/C/M)      │  │ (wraps Validator)    │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│         │                 │                     │                │
│         ▼                 ▼                     ▼                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Chromosome   │  │ Selection    │  │ HaikuValidatorService│   │
│  │ Factory      │  │ Crossover    │  │ (existing)           │   │
│  │              │  │ Mutation     │  │                      │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
packages/server/src/domain/services/genetic/
├── index.ts                      # Public exports
├── types.ts                      # All interfaces and types
├── constants.ts                  # Default configs, magic numbers
├── GeneticAlgorithmService.ts    # Main orchestration
├── PopulationManager.ts          # Population lifecycle
├── ChromosomeFactory.ts          # Create/decode chromosomes
├── FitnessEvaluator.ts           # Fitness calculation wrapper
├── operators/
│   ├── index.ts                  # Operator exports
│   ├── SelectionOperator.ts      # Tournament, roulette, rank
│   ├── CrossoverOperator.ts      # Single-point, uniform, PMX
│   └── MutationOperator.ts       # Random reset, swap, scramble
├── strategies/
│   ├── index.ts                  # Strategy exports
│   ├── StandardGAStrategy.ts     # Default evolution strategy
│   ├── ElitistGAStrategy.ts      # Heavy elitism variant
│   └── AdaptiveGAStrategy.ts     # Self-tuning parameters
└── utils/
    ├── index.ts                  # Utility exports
    ├── SeededRandom.ts           # Deterministic PRNG wrapper
    ├── Statistics.ts             # Population statistics
    └── Diversity.ts              # Diversity metrics
```

---

## 4. Data Structures

### Core Types

```typescript
// types.ts

/**
 * Verse pools extracted from a book chapter
 */
export interface VersePools {
  fiveSyllable: VerseCandidate[]; // All valid 5-syllable verses
  sevenSyllable: VerseCandidate[]; // All valid 7-syllable verses
  bookId: string;
  chapterId: string;
}

/**
 * A single verse candidate with metadata
 */
export interface VerseCandidate {
  text: string;
  syllableCount: 5 | 7;
  sourceIndex: number; // Position in original text
  precomputedMetrics?: {
    sentiment: number;
    grammar: number;
    phonetics: number;
  };
}

/**
 * Chromosome representing a haiku
 * Genes are indices into verse pools
 */
export interface HaikuChromosome {
  id: string; // Unique identifier for caching
  genes: [number, number, number]; // [5-syl idx, 7-syl idx, 5-syl idx]
  fitness: number; // Cached totalScore
  metrics: QualityMetrics | null; // Full metrics breakdown
  generation: number; // Birth generation
  parentIds: [string, string] | null; // For lineage tracking
}

/**
 * Population state at a given generation
 */
export interface Population {
  chromosomes: HaikuChromosome[];
  generation: number;
  statistics: PopulationStatistics;
  history: GenerationSnapshot[]; // For convergence analysis
}

/**
 * Statistics for a population
 */
export interface PopulationStatistics {
  bestFitness: number;
  worstFitness: number;
  averageFitness: number;
  medianFitness: number;
  standardDeviation: number;
  diversity: number; // Unique chromosomes ratio
  improvementRate: number; // vs previous generation
}

/**
 * Snapshot for history tracking
 */
export interface GenerationSnapshot {
  generation: number;
  bestFitness: number;
  averageFitness: number;
  diversity: number;
  timestamp: number;
}

/**
 * GA configuration
 */
export interface GAConfig {
  // Population parameters
  populationSize: number; // default: 50
  elitismCount: number; // default: 2

  // Evolution parameters
  maxGenerations: number; // default: 30
  convergenceThreshold: number; // default: 0.001
  convergenceWindow: number; // default: 5 (generations)

  // Operator parameters
  selectionMethod: 'tournament' | 'roulette' | 'rank';
  tournamentSize: number; // default: 3
  crossoverRate: number; // default: 0.8
  crossoverMethod: 'single_point' | 'uniform' | 'pmx';
  mutationRate: number; // default: 0.1
  mutationMethod: 'random_reset' | 'swap' | 'scramble';

  // Determinism
  seed?: string; // For reproducible runs

  // Performance
  parallelEvaluation: boolean; // default: false
  cacheEvaluations: boolean; // default: true

  // Output
  returnCount: number; // default: 5 (for GPT selection)
  trackLineage: boolean; // default: false
  recordHistory: boolean; // default: true
}

/**
 * Result of GA evolution
 */
export interface EvolutionResult {
  topCandidates: DecodedHaiku[];
  finalPopulation: Population;
  convergenceGeneration: number;
  totalEvaluations: number;
  executionTimeMs: number;
}

/**
 * Decoded haiku ready for GPT selection
 */
export interface DecodedHaiku {
  verses: [string, string, string];
  metrics: QualityMetrics;
  fitness: number;
  chromosomeId: string;
}
```

### Constants

```typescript
// constants.ts

export const DEFAULT_GA_CONFIG: GAConfig = {
  // Population
  populationSize: 50,
  elitismCount: 2,

  // Evolution
  maxGenerations: 30,
  convergenceThreshold: 0.001,
  convergenceWindow: 5,

  // Operators
  selectionMethod: 'tournament',
  tournamentSize: 3,
  crossoverRate: 0.8,
  crossoverMethod: 'single_point',
  mutationRate: 0.1,
  mutationMethod: 'random_reset',

  // Performance
  parallelEvaluation: false,
  cacheEvaluations: true,

  // Output
  returnCount: 5,
  trackLineage: false,
  recordHistory: true,
};

// Minimum viable pool sizes for GA to be effective
export const MIN_FIVE_SYLLABLE_POOL = 20;
export const MIN_SEVEN_SYLLABLE_POOL = 15;

// Fallback to random sampling if pools are too small
export const GA_POOL_THRESHOLD = 10;

// Maximum fitness evaluations before forced termination
export const MAX_EVALUATIONS = 5000;

// Diversity threshold for restart
export const MIN_DIVERSITY_THRESHOLD = 0.1;
```

---

## 5. GA Operators - Detailed

### 5.1 Selection Operators

#### Tournament Selection (Default)

```typescript
// operators/SelectionOperator.ts

export class SelectionOperator {
  constructor(
    private readonly config: GAConfig,
    private readonly rng: SeededRandom,
  ) {}

  /**
   * Tournament selection: Pick k random individuals, return best
   * Pros: Adjustable selection pressure, simple
   * Cons: May lose diversity with large tournament size
   */
  tournamentSelect(population: Population): HaikuChromosome {
    const { tournamentSize } = this.config;
    const { chromosomes } = population;

    let best: HaikuChromosome | null = null;

    for (let i = 0; i < tournamentSize; i++) {
      const idx = this.rng.nextInt(0, chromosomes.length);
      const candidate = chromosomes[idx];

      if (!best || candidate.fitness > best.fitness) {
        best = candidate;
      }
    }

    return best!;
  }

  /**
   * Roulette wheel selection: Probability proportional to fitness
   * Pros: Fitness-proportionate, maintains diversity
   * Cons: Can be dominated by super-fit individuals
   */
  rouletteSelect(population: Population): HaikuChromosome {
    const { chromosomes } = population;

    // Handle negative fitness values by shifting
    const minFitness = Math.min(...chromosomes.map((c) => c.fitness));
    const shift = minFitness < 0 ? Math.abs(minFitness) + 1 : 0;

    const totalFitness = chromosomes.reduce(
      (sum, c) => sum + c.fitness + shift,
      0,
    );

    let threshold = this.rng.next() * totalFitness;
    let cumulative = 0;

    for (const chromosome of chromosomes) {
      cumulative += chromosome.fitness + shift;
      if (cumulative >= threshold) {
        return chromosome;
      }
    }

    return chromosomes[chromosomes.length - 1];
  }

  /**
   * Rank selection: Probability based on rank, not raw fitness
   * Pros: Prevents super-fit domination, consistent pressure
   * Cons: Ignores fitness magnitude differences
   */
  rankSelect(population: Population): HaikuChromosome {
    const { chromosomes } = population;

    // Sort by fitness (worst to best)
    const sorted = [...chromosomes].sort((a, b) => a.fitness - b.fitness);

    // Assign ranks (1 = worst, n = best)
    const n = sorted.length;
    const totalRank = (n * (n + 1)) / 2;

    let threshold = this.rng.next() * totalRank;
    let cumulative = 0;

    for (let i = 0; i < n; i++) {
      cumulative += i + 1; // rank
      if (cumulative >= threshold) {
        return sorted[i];
      }
    }

    return sorted[n - 1];
  }

  /**
   * Main selection method dispatcher
   */
  select(population: Population): HaikuChromosome {
    switch (this.config.selectionMethod) {
      case 'tournament':
        return this.tournamentSelect(population);
      case 'roulette':
        return this.rouletteSelect(population);
      case 'rank':
        return this.rankSelect(population);
      default:
        return this.tournamentSelect(population);
    }
  }
}
```

#### 5.2 Crossover Operators

```typescript
// operators/CrossoverOperator.ts

export class CrossoverOperator {
  constructor(
    private readonly config: GAConfig,
    private readonly rng: SeededRandom,
    private readonly chromosomeFactory: ChromosomeFactory,
  ) {}

  /**
   * Single-point crossover: Split at random point, swap tails
   * For haiku: swap verses after crossover point
   *
   * Parent1: [A1, B1, C1]  →  Child1: [A1, B2, C2]
   * Parent2: [A2, B2, C2]  →  Child2: [A2, B1, C1]
   *                ^crossover point
   */
  singlePointCrossover(
    parent1: HaikuChromosome,
    parent2: HaikuChromosome,
    generation: number,
  ): [HaikuChromosome, HaikuChromosome] {
    const crossPoint = this.rng.nextInt(0, 3); // 0, 1, or 2

    const child1Genes: [number, number, number] = [...parent1.genes];
    const child2Genes: [number, number, number] = [...parent2.genes];

    for (let i = crossPoint; i < 3; i++) {
      [child1Genes[i], child2Genes[i]] = [child2Genes[i], child1Genes[i]];
    }

    return [
      this.chromosomeFactory.create(child1Genes, generation, [
        parent1.id,
        parent2.id,
      ]),
      this.chromosomeFactory.create(child2Genes, generation, [
        parent2.id,
        parent1.id,
      ]),
    ];
  }

  /**
   * Uniform crossover: Each gene independently from either parent
   * More disruptive, better exploration
   *
   * Parent1: [A1, B1, C1]  →  Child: [A1, B2, C1] (each gene 50/50)
   */
  uniformCrossover(
    parent1: HaikuChromosome,
    parent2: HaikuChromosome,
    generation: number,
  ): [HaikuChromosome, HaikuChromosome] {
    const child1Genes: [number, number, number] = [0, 0, 0];
    const child2Genes: [number, number, number] = [0, 0, 0];

    for (let i = 0; i < 3; i++) {
      if (this.rng.next() < 0.5) {
        child1Genes[i] = parent1.genes[i];
        child2Genes[i] = parent2.genes[i];
      } else {
        child1Genes[i] = parent2.genes[i];
        child2Genes[i] = parent1.genes[i];
      }
    }

    return [
      this.chromosomeFactory.create(child1Genes, generation, [
        parent1.id,
        parent2.id,
      ]),
      this.chromosomeFactory.create(child2Genes, generation, [
        parent2.id,
        parent1.id,
      ]),
    ];
  }

  /**
   * PMX (Partially Mapped Crossover): Preserves relative ordering
   * Less relevant for haiku (no ordering constraint) but included for completeness
   */
  pmxCrossover(
    parent1: HaikuChromosome,
    parent2: HaikuChromosome,
    generation: number,
  ): [HaikuChromosome, HaikuChromosome] {
    // For 3-gene chromosomes, PMX reduces to segment swap
    // Simplified implementation
    const start = this.rng.nextInt(0, 2);
    const end = this.rng.nextInt(start + 1, 3);

    const child1Genes: [number, number, number] = [...parent1.genes];
    const child2Genes: [number, number, number] = [...parent2.genes];

    for (let i = start; i <= end; i++) {
      [child1Genes[i], child2Genes[i]] = [child2Genes[i], child1Genes[i]];
    }

    return [
      this.chromosomeFactory.create(child1Genes, generation, [
        parent1.id,
        parent2.id,
      ]),
      this.chromosomeFactory.create(child2Genes, generation, [
        parent2.id,
        parent1.id,
      ]),
    ];
  }

  /**
   * Main crossover dispatcher
   */
  crossover(
    parent1: HaikuChromosome,
    parent2: HaikuChromosome,
    generation: number,
  ): [HaikuChromosome, HaikuChromosome] {
    // Check if crossover should occur
    if (this.rng.next() > this.config.crossoverRate) {
      // No crossover - return clones
      return [
        this.chromosomeFactory.clone(parent1, generation),
        this.chromosomeFactory.clone(parent2, generation),
      ];
    }

    switch (this.config.crossoverMethod) {
      case 'single_point':
        return this.singlePointCrossover(parent1, parent2, generation);
      case 'uniform':
        return this.uniformCrossover(parent1, parent2, generation);
      case 'pmx':
        return this.pmxCrossover(parent1, parent2, generation);
      default:
        return this.singlePointCrossover(parent1, parent2, generation);
    }
  }
}
```

#### 5.3 Mutation Operators

```typescript
// operators/MutationOperator.ts

export class MutationOperator {
  constructor(
    private readonly config: GAConfig,
    private readonly rng: SeededRandom,
    private readonly versePools: VersePools,
  ) {}

  /**
   * Random reset mutation: Replace gene with random valid value
   * Most common for this problem type
   */
  randomResetMutate(chromosome: HaikuChromosome): HaikuChromosome {
    const mutatedGenes: [number, number, number] = [...chromosome.genes];
    let mutated = false;

    for (let i = 0; i < 3; i++) {
      if (this.rng.next() < this.config.mutationRate) {
        const pool =
          i === 1
            ? this.versePools.sevenSyllable
            : this.versePools.fiveSyllable;

        mutatedGenes[i] = this.rng.nextInt(0, pool.length);
        mutated = true;
      }
    }

    if (mutated) {
      return {
        ...chromosome,
        id: this.generateId(mutatedGenes),
        genes: mutatedGenes,
        fitness: 0, // Needs re-evaluation
        metrics: null,
      };
    }

    return chromosome;
  }

  /**
   * Swap mutation: Swap two genes (only for same syllable count)
   * Swaps verse 1 and verse 3 (both 5-syllable)
   */
  swapMutate(chromosome: HaikuChromosome): HaikuChromosome {
    if (this.rng.next() >= this.config.mutationRate) {
      return chromosome;
    }

    // Can only swap positions 0 and 2 (both 5-syllable)
    const mutatedGenes: [number, number, number] = [
      chromosome.genes[2], // Swap
      chromosome.genes[1], // Keep middle
      chromosome.genes[0], // Swap
    ];

    return {
      ...chromosome,
      id: this.generateId(mutatedGenes),
      genes: mutatedGenes,
      fitness: 0,
      metrics: null,
    };
  }

  /**
   * Scramble mutation: Randomly reorder genes
   * More disruptive, use sparingly
   */
  scrambleMutate(chromosome: HaikuChromosome): HaikuChromosome {
    if (this.rng.next() >= this.config.mutationRate) {
      return chromosome;
    }

    // Only scramble positions 0 and 2 (same syllable count)
    // Position 1 must stay (different syllable count)
    const shouldSwap = this.rng.next() < 0.5;

    const mutatedGenes: [number, number, number] = shouldSwap
      ? [chromosome.genes[2], chromosome.genes[1], chromosome.genes[0]]
      : [...chromosome.genes];

    return {
      ...chromosome,
      id: this.generateId(mutatedGenes),
      genes: mutatedGenes,
      fitness: 0,
      metrics: null,
    };
  }

  /**
   * Adaptive mutation: Higher rate when fitness is low
   */
  adaptiveMutate(
    chromosome: HaikuChromosome,
    populationStats: PopulationStatistics,
  ): HaikuChromosome {
    // Calculate adaptive rate based on fitness relative to population
    const fitnessRatio = chromosome.fitness / populationStats.bestFitness;
    const adaptiveRate = this.config.mutationRate * (2 - fitnessRatio);

    const mutatedGenes: [number, number, number] = [...chromosome.genes];
    let mutated = false;

    for (let i = 0; i < 3; i++) {
      if (this.rng.next() < adaptiveRate) {
        const pool =
          i === 1
            ? this.versePools.sevenSyllable
            : this.versePools.fiveSyllable;

        mutatedGenes[i] = this.rng.nextInt(0, pool.length);
        mutated = true;
      }
    }

    if (mutated) {
      return {
        ...chromosome,
        id: this.generateId(mutatedGenes),
        genes: mutatedGenes,
        fitness: 0,
        metrics: null,
      };
    }

    return chromosome;
  }

  /**
   * Main mutation dispatcher
   */
  mutate(chromosome: HaikuChromosome): HaikuChromosome {
    switch (this.config.mutationMethod) {
      case 'random_reset':
        return this.randomResetMutate(chromosome);
      case 'swap':
        return this.swapMutate(chromosome);
      case 'scramble':
        return this.scrambleMutate(chromosome);
      default:
        return this.randomResetMutate(chromosome);
    }
  }

  private generateId(genes: [number, number, number]): string {
    return `${genes[0]}-${genes[1]}-${genes[2]}`;
  }
}
```

---

## 6. Implementation Phases

### Phase 1: Core Infrastructure (Foundation)

**Files to create:**

- `types.ts` - All interfaces
- `constants.ts` - Default configurations
- `utils/SeededRandom.ts` - Deterministic PRNG
- `ChromosomeFactory.ts` - Chromosome creation

**Deliverable:** Chromosome creation and deterministic randomness

### Phase 2: Fitness Evaluation

**Files to create:**

- `FitnessEvaluator.ts` - Wrapper around existing validator

**Integration:** Connect to `HaikuValidatorService.calculateQualityMetrics()`

**Deliverable:** Fitness evaluation for any chromosome

### Phase 3: GA Operators

**Files to create:**

- `operators/SelectionOperator.ts`
- `operators/CrossoverOperator.ts`
- `operators/MutationOperator.ts`

**Deliverable:** All genetic operators working independently

### Phase 4: Population Management

**Files to create:**

- `PopulationManager.ts` - Population lifecycle
- `utils/Statistics.ts` - Statistical calculations
- `utils/Diversity.ts` - Diversity metrics

**Deliverable:** Population initialization, evolution, statistics

### Phase 5: Main Service

**Files to create:**

- `GeneticAlgorithmService.ts` - Main orchestration
- `index.ts` - Public exports

**Deliverable:** Complete GA service ready for integration

### Phase 6: Integration

**Files to modify:**

- `OpenAIGeneratorService.ts` - Add GA integration point
- `HaikuGeneratorService.ts` - Add verse pool extraction

**Deliverable:** GA integrated into haiku generation pipeline

### Phase 7: Testing & Validation

**Files to create:**

- `__tests__/GeneticAlgorithmService.test.ts`
- `__tests__/operators/*.test.ts`

**Deliverable:** Comprehensive test suite

### Phase 8: Monitoring & Tuning

**Files to create/modify:**

- Add logging and metrics
- Tune default parameters based on results

**Deliverable:** Production-ready GA with observability

---

## 7. File-by-File Implementation

### 7.1 `utils/SeededRandom.ts`

```typescript
import seedrandom from 'seedrandom';

export class SeededRandom {
  private rng: seedrandom.PRNG;
  private callCount: number = 0;

  constructor(seed?: string) {
    this.rng = seed ? seedrandom(seed) : seedrandom();
  }

  /**
   * Random float [0, 1)
   */
  next(): number {
    this.callCount++;
    return this.rng();
  }

  /**
   * Random integer [min, max)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  /**
   * Random boolean with probability p
   */
  nextBool(p: number = 0.5): boolean {
    return this.next() < p;
  }

  /**
   * Shuffle array in place (Fisher-Yates)
   */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Sample k items from array without replacement
   */
  sample<T>(array: T[], k: number): T[] {
    const shuffled = this.shuffle(array);
    return shuffled.slice(0, k);
  }

  /**
   * Get call count for debugging/testing
   */
  getCallCount(): number {
    return this.callCount;
  }

  /**
   * Reset with new seed
   */
  reset(seed?: string): void {
    this.rng = seed ? seedrandom(seed) : seedrandom();
    this.callCount = 0;
  }
}
```

### 7.2 `ChromosomeFactory.ts`

```typescript
import { HaikuChromosome, VersePools } from './types';
import { SeededRandom } from './utils/SeededRandom';

export class ChromosomeFactory {
  constructor(
    private readonly versePools: VersePools,
    private readonly rng: SeededRandom,
  ) {}

  /**
   * Create chromosome with specific genes
   */
  create(
    genes: [number, number, number],
    generation: number,
    parentIds?: [string, string],
  ): HaikuChromosome {
    return {
      id: this.generateId(genes),
      genes,
      fitness: 0,
      metrics: null,
      generation,
      parentIds: parentIds ?? null,
    };
  }

  /**
   * Create random chromosome
   */
  createRandom(generation: number): HaikuChromosome {
    const genes: [number, number, number] = [
      this.rng.nextInt(0, this.versePools.fiveSyllable.length),
      this.rng.nextInt(0, this.versePools.sevenSyllable.length),
      this.rng.nextInt(0, this.versePools.fiveSyllable.length),
    ];

    return this.create(genes, generation);
  }

  /**
   * Clone chromosome for next generation
   */
  clone(chromosome: HaikuChromosome, generation: number): HaikuChromosome {
    return {
      ...chromosome,
      id: chromosome.id, // Keep same ID
      generation,
      parentIds: [chromosome.id, chromosome.id],
    };
  }

  /**
   * Decode chromosome to haiku verses
   */
  decode(chromosome: HaikuChromosome): [string, string, string] {
    return [
      this.versePools.fiveSyllable[chromosome.genes[0]].text,
      this.versePools.sevenSyllable[chromosome.genes[1]].text,
      this.versePools.fiveSyllable[chromosome.genes[2]].text,
    ];
  }

  /**
   * Check if chromosome is valid (genes within bounds)
   */
  isValid(chromosome: HaikuChromosome): boolean {
    const [g0, g1, g2] = chromosome.genes;
    return (
      g0 >= 0 &&
      g0 < this.versePools.fiveSyllable.length &&
      g1 >= 0 &&
      g1 < this.versePools.sevenSyllable.length &&
      g2 >= 0 &&
      g2 < this.versePools.fiveSyllable.length
    );
  }

  /**
   * Generate unique ID from genes
   */
  private generateId(genes: [number, number, number]): string {
    return `${genes[0]}-${genes[1]}-${genes[2]}`;
  }
}
```

### 7.3 `FitnessEvaluator.ts`

```typescript
import { HaikuChromosome, VersePools, QualityMetrics } from './types';
import { HaikuValidatorService } from '../HaikuValidatorService';
import { ChromosomeFactory } from './ChromosomeFactory';

export class FitnessEvaluator {
  private cache: Map<string, { fitness: number; metrics: QualityMetrics }>;
  private evaluationCount: number = 0;

  constructor(
    private readonly validator: HaikuValidatorService,
    private readonly chromosomeFactory: ChromosomeFactory,
    private readonly useCache: boolean = true,
  ) {
    this.cache = new Map();
  }

  /**
   * Evaluate fitness of a single chromosome
   */
  evaluate(chromosome: HaikuChromosome): HaikuChromosome {
    // Check cache first
    if (this.useCache && this.cache.has(chromosome.id)) {
      const cached = this.cache.get(chromosome.id)!;
      return {
        ...chromosome,
        fitness: cached.fitness,
        metrics: cached.metrics,
      };
    }

    // Decode chromosome to haiku
    const verses = this.chromosomeFactory.decode(chromosome);
    const haiku = {
      verses: [
        { text: verses[0], syllables: 5 },
        { text: verses[1], syllables: 7 },
        { text: verses[2], syllables: 5 },
      ],
    };

    // Calculate metrics using existing validator
    const metrics = this.validator.calculateQualityMetrics(haiku);
    const fitness = metrics.totalScore;

    this.evaluationCount++;

    // Cache result
    if (this.useCache) {
      this.cache.set(chromosome.id, { fitness, metrics });
    }

    return {
      ...chromosome,
      fitness,
      metrics,
    };
  }

  /**
   * Evaluate entire population
   */
  evaluatePopulation(chromosomes: HaikuChromosome[]): HaikuChromosome[] {
    return chromosomes.map((c) => (c.fitness === 0 ? this.evaluate(c) : c));
  }

  /**
   * Get evaluation statistics
   */
  getStats(): {
    evaluationCount: number;
    cacheSize: number;
    cacheHitRate: number;
  } {
    const cacheHits = this.evaluationCount - this.cache.size;
    return {
      evaluationCount: this.evaluationCount,
      cacheSize: this.cache.size,
      cacheHitRate:
        this.evaluationCount > 0 ? cacheHits / this.evaluationCount : 0,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}
```

### 7.4 `PopulationManager.ts`

```typescript
import {
  Population,
  HaikuChromosome,
  PopulationStatistics,
  GenerationSnapshot,
  GAConfig,
} from './types';
import { ChromosomeFactory } from './ChromosomeFactory';
import { FitnessEvaluator } from './FitnessEvaluator';
import { SelectionOperator } from './operators/SelectionOperator';
import { CrossoverOperator } from './operators/CrossoverOperator';
import { MutationOperator } from './operators/MutationOperator';

export class PopulationManager {
  constructor(
    private readonly config: GAConfig,
    private readonly chromosomeFactory: ChromosomeFactory,
    private readonly fitnessEvaluator: FitnessEvaluator,
    private readonly selectionOperator: SelectionOperator,
    private readonly crossoverOperator: CrossoverOperator,
    private readonly mutationOperator: MutationOperator,
  ) {}

  /**
   * Initialize random population
   */
  initialize(): Population {
    const chromosomes: HaikuChromosome[] = [];

    for (let i = 0; i < this.config.populationSize; i++) {
      chromosomes.push(this.chromosomeFactory.createRandom(0));
    }

    // Evaluate initial fitness
    const evaluated = this.fitnessEvaluator.evaluatePopulation(chromosomes);
    const statistics = this.calculateStatistics(evaluated);

    return {
      chromosomes: evaluated,
      generation: 0,
      statistics,
      history: [this.createSnapshot(0, statistics)],
    };
  }

  /**
   * Evolve population to next generation
   */
  evolve(population: Population): Population {
    const nextGeneration = population.generation + 1;
    const nextChromosomes: HaikuChromosome[] = [];

    // Elitism: preserve top performers
    const sorted = [...population.chromosomes].sort(
      (a, b) => b.fitness - a.fitness,
    );

    for (let i = 0; i < this.config.elitismCount; i++) {
      nextChromosomes.push(
        this.chromosomeFactory.clone(sorted[i], nextGeneration),
      );
    }

    // Fill rest with offspring
    while (nextChromosomes.length < this.config.populationSize) {
      // Selection
      const parent1 = this.selectionOperator.select(population);
      const parent2 = this.selectionOperator.select(population);

      // Crossover
      let [child1, child2] = this.crossoverOperator.crossover(
        parent1,
        parent2,
        nextGeneration,
      );

      // Mutation
      child1 = this.mutationOperator.mutate(child1);
      child2 = this.mutationOperator.mutate(child2);

      nextChromosomes.push(child1);
      if (nextChromosomes.length < this.config.populationSize) {
        nextChromosomes.push(child2);
      }
    }

    // Evaluate new chromosomes
    const evaluated = this.fitnessEvaluator.evaluatePopulation(nextChromosomes);
    const statistics = this.calculateStatistics(evaluated);

    return {
      chromosomes: evaluated,
      generation: nextGeneration,
      statistics,
      history: [
        ...population.history,
        this.createSnapshot(nextGeneration, statistics),
      ],
    };
  }

  /**
   * Check if population has converged
   */
  hasConverged(population: Population): boolean {
    if (population.history.length < this.config.convergenceWindow) {
      return false;
    }

    const recent = population.history.slice(-this.config.convergenceWindow);
    const improvements = recent.map((s, i) =>
      i === 0 ? 0 : s.bestFitness - recent[i - 1].bestFitness,
    );

    const avgImprovement =
      improvements.reduce((a, b) => a + b, 0) / improvements.length;
    return Math.abs(avgImprovement) < this.config.convergenceThreshold;
  }

  /**
   * Get top N chromosomes
   */
  getTopChromosomes(population: Population, n: number): HaikuChromosome[] {
    return [...population.chromosomes]
      .sort((a, b) => b.fitness - a.fitness)
      .slice(0, n);
  }

  /**
   * Calculate population statistics
   */
  private calculateStatistics(
    chromosomes: HaikuChromosome[],
  ): PopulationStatistics {
    const fitnesses = chromosomes.map((c) => c.fitness);
    const sorted = [...fitnesses].sort((a, b) => a - b);

    const sum = fitnesses.reduce((a, b) => a + b, 0);
    const avg = sum / fitnesses.length;

    const variance =
      fitnesses.reduce((acc, f) => acc + Math.pow(f - avg, 2), 0) /
      fitnesses.length;

    // Diversity: unique chromosomes / total
    const uniqueIds = new Set(chromosomes.map((c) => c.id));

    return {
      bestFitness: sorted[sorted.length - 1],
      worstFitness: sorted[0],
      averageFitness: avg,
      medianFitness: sorted[Math.floor(sorted.length / 2)],
      standardDeviation: Math.sqrt(variance),
      diversity: uniqueIds.size / chromosomes.length,
      improvementRate: 0, // Calculated separately
    };
  }

  /**
   * Create generation snapshot for history
   */
  private createSnapshot(
    generation: number,
    stats: PopulationStatistics,
  ): GenerationSnapshot {
    return {
      generation,
      bestFitness: stats.bestFitness,
      averageFitness: stats.averageFitness,
      diversity: stats.diversity,
      timestamp: Date.now(),
    };
  }
}
```

### 7.5 `GeneticAlgorithmService.ts`

```typescript
import {
  GAConfig,
  VersePools,
  EvolutionResult,
  DecodedHaiku,
  Population,
} from './types';
import {
  DEFAULT_GA_CONFIG,
  MIN_FIVE_SYLLABLE_POOL,
  MIN_SEVEN_SYLLABLE_POOL,
  MAX_EVALUATIONS,
} from './constants';
import { SeededRandom } from './utils/SeededRandom';
import { ChromosomeFactory } from './ChromosomeFactory';
import { FitnessEvaluator } from './FitnessEvaluator';
import { PopulationManager } from './PopulationManager';
import { SelectionOperator } from './operators/SelectionOperator';
import { CrossoverOperator } from './operators/CrossoverOperator';
import { MutationOperator } from './operators/MutationOperator';
import { HaikuValidatorService } from '../HaikuValidatorService';
import { Logger } from '../../infrastructure/Logger';

export class GeneticAlgorithmService {
  private readonly config: GAConfig;
  private readonly logger: Logger;

  constructor(
    private readonly validator: HaikuValidatorService,
    config: Partial<GAConfig> = {},
    logger?: Logger,
  ) {
    this.config = { ...DEFAULT_GA_CONFIG, ...config };
    this.logger = logger ?? new Logger('GeneticAlgorithmService');
  }

  /**
   * Main evolution entry point
   */
  async evolve(versePools: VersePools): Promise<EvolutionResult> {
    const startTime = Date.now();

    // Validate pools
    if (!this.validatePools(versePools)) {
      throw new Error(
        `Insufficient verse pools: need ${MIN_FIVE_SYLLABLE_POOL} 5-syllable and ` +
          `${MIN_SEVEN_SYLLABLE_POOL} 7-syllable verses`,
      );
    }

    // Initialize components
    const rng = new SeededRandom(this.config.seed);
    const chromosomeFactory = new ChromosomeFactory(versePools, rng);
    const fitnessEvaluator = new FitnessEvaluator(
      this.validator,
      chromosomeFactory,
      this.config.cacheEvaluations,
    );
    const selectionOperator = new SelectionOperator(this.config, rng);
    const crossoverOperator = new CrossoverOperator(
      this.config,
      rng,
      chromosomeFactory,
    );
    const mutationOperator = new MutationOperator(this.config, rng, versePools);
    const populationManager = new PopulationManager(
      this.config,
      chromosomeFactory,
      fitnessEvaluator,
      selectionOperator,
      crossoverOperator,
      mutationOperator,
    );

    // Initialize population
    this.logger.info('Initializing population', {
      populationSize: this.config.populationSize,
      poolSizes: {
        fiveSyllable: versePools.fiveSyllable.length,
        sevenSyllable: versePools.sevenSyllable.length,
      },
    });

    let population = populationManager.initialize();
    let convergenceGeneration = this.config.maxGenerations;

    // Evolution loop
    for (let gen = 0; gen < this.config.maxGenerations; gen++) {
      // Check termination conditions
      if (populationManager.hasConverged(population)) {
        this.logger.info('Population converged', { generation: gen });
        convergenceGeneration = gen;
        break;
      }

      const evalStats = fitnessEvaluator.getStats();
      if (evalStats.evaluationCount >= MAX_EVALUATIONS) {
        this.logger.warn('Max evaluations reached', {
          evaluations: evalStats.evaluationCount,
        });
        convergenceGeneration = gen;
        break;
      }

      // Evolve to next generation
      population = populationManager.evolve(population);

      // Log progress
      if (gen % 5 === 0 || gen === this.config.maxGenerations - 1) {
        this.logger.debug('Generation complete', {
          generation: gen,
          bestFitness: population.statistics.bestFitness,
          avgFitness: population.statistics.averageFitness,
          diversity: population.statistics.diversity,
        });
      }
    }

    // Extract top candidates
    const topChromosomes = populationManager.getTopChromosomes(
      population,
      this.config.returnCount,
    );

    const topCandidates: DecodedHaiku[] = topChromosomes.map((c) => ({
      verses: chromosomeFactory.decode(c),
      metrics: c.metrics!,
      fitness: c.fitness,
      chromosomeId: c.id,
    }));

    const evalStats = fitnessEvaluator.getStats();
    const executionTimeMs = Date.now() - startTime;

    this.logger.info('Evolution complete', {
      generations: population.generation,
      convergenceGeneration,
      bestFitness: population.statistics.bestFitness,
      totalEvaluations: evalStats.evaluationCount,
      cacheHitRate: evalStats.cacheHitRate,
      executionTimeMs,
    });

    return {
      topCandidates,
      finalPopulation: population,
      convergenceGeneration,
      totalEvaluations: evalStats.evaluationCount,
      executionTimeMs,
    };
  }

  /**
   * Validate verse pools have minimum required sizes
   */
  private validatePools(versePools: VersePools): boolean {
    return (
      versePools.fiveSyllable.length >= MIN_FIVE_SYLLABLE_POOL &&
      versePools.sevenSyllable.length >= MIN_SEVEN_SYLLABLE_POOL
    );
  }
}
```

---

## 8. Integration Points

### 8.1 Modify `OpenAIGeneratorService.ts`

**Location:** `packages/server/src/domain/services/OpenAIGeneratorService.ts`

**Current code (around lines 333-353):**

```typescript
// Generate multiple haikus
const haikus = await this.generateMultipleHaikus(selectionCount, variables);

// Sort by score and take top candidates
const sortedHaikus = haikus.sort(
  (a, b) => b.metrics.totalScore - a.metrics.totalScore,
);
const candidates = sortedHaikus.slice(0, GPT_SELECTION_POOL_SIZE);
```

**New code with GA integration:**

```typescript
// Check if GA is enabled
if (this.config.useGeneticAlgorithm) {
  // Extract verse pools from chapter
  const versePools = await this.extractVersePools(variables);

  // Run GA evolution
  const gaService = new GeneticAlgorithmService(this.validator, {
    seed: variables.deterministicSeed,
    populationSize: this.config.gaPopulationSize ?? 50,
    maxGenerations: this.config.gaMaxGenerations ?? 30,
  });

  const evolutionResult = await gaService.evolve(versePools);
  candidates = evolutionResult.topCandidates;
} else {
  // Fallback to current implementation
  const haikus = await this.generateMultipleHaikus(selectionCount, variables);
  const sortedHaikus = haikus.sort(
    (a, b) => b.metrics.totalScore - a.metrics.totalScore,
  );
  candidates = sortedHaikus.slice(0, GPT_SELECTION_POOL_SIZE);
}
```

### 8.2 Add Verse Pool Extraction

**Add to `HaikuGeneratorService.ts`:**

```typescript
/**
 * Extract verse pools from chapter for GA consumption
 */
async extractVersePools(variables: HaikuVariables): Promise<VersePools> {
  const chapter = await this.chapterRepository.findById(variables.chapterId);

  if (!chapter) {
    throw new Error(`Chapter not found: ${variables.chapterId}`);
  }

  // Extract all quotes
  const allQuotes = this.extractQuotes(chapter.content, variables);

  // Separate by syllable count
  const fiveSyllable: VerseCandidate[] = [];
  const sevenSyllable: VerseCandidate[] = [];

  for (let i = 0; i < allQuotes.length; i++) {
    const quote = allQuotes[i];
    const syllableCount = syllable(quote.text);

    // Validate quote passes basic filters
    if (!this.validator.passesBasicFilters(quote)) {
      continue;
    }

    const candidate: VerseCandidate = {
      text: quote.text,
      syllableCount: syllableCount as 5 | 7,
      sourceIndex: i,
    };

    if (syllableCount === 5) {
      fiveSyllable.push(candidate);
    } else if (syllableCount === 7) {
      sevenSyllable.push(candidate);
    }
  }

  return {
    fiveSyllable,
    sevenSyllable,
    bookId: chapter.bookId,
    chapterId: chapter.id,
  };
}
```

### 8.3 Configuration Extension

**Add to environment/config:**

```typescript
// .env additions
GA_ENABLED = true;
GA_POPULATION_SIZE = 50;
GA_MAX_GENERATIONS = 30;
GA_CROSSOVER_RATE = 0.8;
GA_MUTATION_RATE = 0.1;
GA_SELECTION_METHOD = tournament;
GA_TOURNAMENT_SIZE = 3;

// Config interface extension
interface OpenAIConfig {
  // ... existing config
  useGeneticAlgorithm: boolean;
  gaPopulationSize?: number;
  gaMaxGenerations?: number;
  gaCrossoverRate?: number;
  gaMutationRate?: number;
  gaSelectionMethod?: 'tournament' | 'roulette' | 'rank';
  gaTournamentSize?: number;
}
```

---

## 9. Configuration & Environment

### 9.1 Environment Variables

```bash
# .env

# GA Feature Flag
GA_ENABLED=true

# Population Parameters
GA_POPULATION_SIZE=50          # Number of individuals per generation
GA_ELITISM_COUNT=2             # Top N preserved unchanged

# Evolution Parameters
GA_MAX_GENERATIONS=30          # Maximum evolution cycles
GA_CONVERGENCE_THRESHOLD=0.001 # Stop if improvement below this
GA_CONVERGENCE_WINDOW=5        # Generations to check for convergence

# Operator Parameters
GA_SELECTION_METHOD=tournament # tournament | roulette | rank
GA_TOURNAMENT_SIZE=3           # For tournament selection
GA_CROSSOVER_RATE=0.8          # Probability of crossover
GA_CROSSOVER_METHOD=single_point # single_point | uniform | pmx
GA_MUTATION_RATE=0.1           # Probability of mutation per gene
GA_MUTATION_METHOD=random_reset # random_reset | swap | scramble

# Performance
GA_CACHE_EVALUATIONS=true      # Cache fitness calculations
GA_PARALLEL_EVALUATION=false   # Future: parallel fitness calc

# Output
GA_RETURN_COUNT=5              # Candidates for GPT selection
GA_TRACK_LINEAGE=false         # Track parent relationships
GA_RECORD_HISTORY=true         # Record generation statistics
```

### 9.2 Runtime Configuration Override

```typescript
// Allow per-request configuration override
interface HaikuVariables {
  // ... existing variables

  gaConfig?: Partial<GAConfig>;
  deterministicSeed?: string;  // For daily puzzle reproducibility
}

// Usage in GraphQL mutation
mutation GenerateHaiku {
  generateHaiku(
    bookId: "123",
    gaConfig: {
      populationSize: 100,
      maxGenerations: 50,
      mutationRate: 0.15
    }
  ) {
    verses
    metrics
  }
}
```

---

## 10. Error Handling

### 10.1 Error Types

```typescript
// errors.ts

export class GAError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'GAError';
  }
}

export class InsufficientPoolError extends GAError {
  constructor(
    public readonly fiveCount: number,
    public readonly sevenCount: number,
  ) {
    super(
      `Insufficient verse pools: ${fiveCount} 5-syllable (need ${MIN_FIVE_SYLLABLE_POOL}), ` +
        `${sevenCount} 7-syllable (need ${MIN_SEVEN_SYLLABLE_POOL})`,
      'INSUFFICIENT_POOL',
    );
  }
}

export class ConvergenceError extends GAError {
  constructor(public readonly generation: number) {
    super(
      `GA failed to produce valid candidates after ${generation} generations`,
      'CONVERGENCE_FAILURE',
    );
  }
}

export class MaxEvaluationsError extends GAError {
  constructor(public readonly evaluations: number) {
    super(
      `Maximum evaluations (${evaluations}) reached without convergence`,
      'MAX_EVALUATIONS',
    );
  }
}

export class InvalidChromosomeError extends GAError {
  constructor(public readonly chromosomeId: string) {
    super(`Invalid chromosome detected: ${chromosomeId}`, 'INVALID_CHROMOSOME');
  }
}
```

### 10.2 Error Recovery Strategies

```typescript
// In GeneticAlgorithmService.evolve()

async evolve(versePools: VersePools): Promise<EvolutionResult> {
  try {
    // Validate pools
    if (!this.validatePools(versePools)) {
      // Fallback: return random sampling instead of failing
      this.logger.warn('Pools too small for GA, falling back to random sampling');
      return this.fallbackRandomSampling(versePools);
    }

    // ... GA evolution ...

    // Check for degenerate population (all identical)
    if (population.statistics.diversity < MIN_DIVERSITY_THRESHOLD) {
      this.logger.warn('Population diversity too low, injecting random individuals');
      population = this.injectDiversity(population, versePools);
    }

    // Validate final candidates
    const validCandidates = topCandidates.filter(c =>
      this.validator.isValidHaiku(c.verses)
    );

    if (validCandidates.length === 0) {
      throw new ConvergenceError(population.generation);
    }

    return { topCandidates: validCandidates, /* ... */ };

  } catch (error) {
    if (error instanceof GAError) {
      this.logger.error('GA error, falling back', { error });
      return this.fallbackRandomSampling(versePools);
    }
    throw error;
  }
}

/**
 * Fallback when GA cannot run
 */
private fallbackRandomSampling(versePools: VersePools): EvolutionResult {
  const candidates: DecodedHaiku[] = [];
  const rng = new SeededRandom(this.config.seed);

  for (let i = 0; i < this.config.returnCount; i++) {
    const verses: [string, string, string] = [
      versePools.fiveSyllable[rng.nextInt(0, versePools.fiveSyllable.length)].text,
      versePools.sevenSyllable[rng.nextInt(0, versePools.sevenSyllable.length)].text,
      versePools.fiveSyllable[rng.nextInt(0, versePools.fiveSyllable.length)].text,
    ];

    const metrics = this.validator.calculateQualityMetrics({ verses });
    candidates.push({
      verses,
      metrics,
      fitness: metrics.totalScore,
      chromosomeId: `fallback-${i}`,
    });
  }

  return {
    topCandidates: candidates,
    finalPopulation: null as any,
    convergenceGeneration: 0,
    totalEvaluations: this.config.returnCount,
    executionTimeMs: 0,
  };
}
```

---

## 11. Performance Optimization

### 11.1 Performance Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Performance Layers                               │
├─────────────────────────────────────────────────────────────────────────┤
│  Layer 1: Algorithmic Optimization                                       │
│  ├── Fitness caching (memoization)                                      │
│  ├── Lazy evaluation (skip already-evaluated)                           │
│  ├── Early termination (convergence detection)                          │
│  └── Adaptive population sizing                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  Layer 2: Computational Optimization                                     │
│  ├── Worker threads for parallel fitness evaluation                     │
│  ├── Batch processing of chromosomes                                    │
│  ├── Memory pooling for chromosome objects                              │
│  └── Typed arrays for gene representation                               │
├─────────────────────────────────────────────────────────────────────────┤
│  Layer 3: Infrastructure Optimization                                    │
│  ├── Redis caching for cross-request fitness cache                      │
│  ├── Pre-computed verse metrics                                         │
│  ├── Connection pooling for validator service                           │
│  └── Response streaming for large evolutions                            │
└─────────────────────────────────────────────────────────────────────────┘
```

### 11.2 Fitness Caching

```typescript
// Multi-level caching strategy

// Level 1: In-memory LRU cache (per-request)
import LRU from 'lru-cache';

class FitnessCache {
  private readonly memoryCache: LRU<string, CachedFitness>;
  private readonly redisClient?: Redis;

  constructor(options: CacheOptions) {
    this.memoryCache = new LRU({
      max: options.maxMemoryEntries ?? 10000,
      ttl: options.memoryTtlMs ?? 1000 * 60 * 5, // 5 minutes
      updateAgeOnGet: true,
    });

    if (options.redisUrl) {
      this.redisClient = new Redis(options.redisUrl);
    }
  }

  async get(chromosomeId: string): Promise<CachedFitness | null> {
    // Check memory first (fastest)
    const memoryHit = this.memoryCache.get(chromosomeId);
    if (memoryHit) {
      this.metrics.memoryCacheHits++;
      return memoryHit;
    }

    // Check Redis (if configured)
    if (this.redisClient) {
      const redisHit = await this.redisClient.get(`ga:fitness:${chromosomeId}`);
      if (redisHit) {
        const parsed = JSON.parse(redisHit);
        this.memoryCache.set(chromosomeId, parsed); // Promote to memory
        this.metrics.redisCacheHits++;
        return parsed;
      }
    }

    this.metrics.cacheMisses++;
    return null;
  }

  async set(chromosomeId: string, result: CachedFitness): Promise<void> {
    this.memoryCache.set(chromosomeId, result);

    if (this.redisClient) {
      await this.redisClient.setex(
        `ga:fitness:${chromosomeId}`,
        60 * 60 * 24, // 24 hour TTL
        JSON.stringify(result),
      );
    }
  }
}
```

### 11.3 Lazy Evaluation

```typescript
// Only evaluate chromosomes that need it
evaluatePopulation(chromosomes: HaikuChromosome[]): HaikuChromosome[] {
  return chromosomes.map(c =>
    c.fitness === 0 ? this.evaluate(c) : c  // Skip already evaluated
  );
}
```

### 11.4 Early Termination

```typescript
// Multiple termination conditions

interface TerminationConditions {
  maxGenerations: number; // Hard limit
  convergenceThreshold: number; // Fitness improvement threshold
  convergenceWindow: number; // Generations to check
  maxEvaluations: number; // Total fitness evaluations
  maxTimeMs: number; // Wall clock time limit
  targetFitness?: number; // Stop if fitness reached
}

class TerminationChecker {
  private startTime: number;
  private evaluationCount: number = 0;

  constructor(private readonly conditions: TerminationConditions) {
    this.startTime = Date.now();
  }

  shouldTerminate(population: Population): TerminationReason | null {
    // Check time limit
    const elapsed = Date.now() - this.startTime;
    if (elapsed >= this.conditions.maxTimeMs) {
      return { reason: 'time_limit', details: { elapsedMs: elapsed } };
    }

    // Check generation limit
    if (population.generation >= this.conditions.maxGenerations) {
      return {
        reason: 'max_generations',
        details: { generation: population.generation },
      };
    }

    // Check evaluation limit
    if (this.evaluationCount >= this.conditions.maxEvaluations) {
      return {
        reason: 'max_evaluations',
        details: { evaluations: this.evaluationCount },
      };
    }

    // Check target fitness
    if (
      this.conditions.targetFitness &&
      population.statistics.bestFitness >= this.conditions.targetFitness
    ) {
      return {
        reason: 'target_reached',
        details: { fitness: population.statistics.bestFitness },
      };
    }

    // Check convergence
    if (this.hasConverged(population)) {
      return {
        reason: 'converged',
        details: { generation: population.generation },
      };
    }

    return null;
  }

  private hasConverged(population: Population): boolean {
    if (population.history.length < this.conditions.convergenceWindow) {
      return false;
    }

    const recent = population.history.slice(-this.conditions.convergenceWindow);
    const improvements = recent.map((s, i) =>
      i === 0 ? 0 : s.bestFitness - recent[i - 1].bestFitness,
    );

    const avgImprovement =
      improvements.reduce((a, b) => a + b, 0) / improvements.length;
    return Math.abs(avgImprovement) < this.conditions.convergenceThreshold;
  }
}
```

### 11.5 Parallel Evaluation with Worker Threads

```typescript
// workers/fitnessWorker.ts
import { parentPort, workerData } from 'worker_threads';
import { HaikuValidatorService } from '../HaikuValidatorService';

const validator = new HaikuValidatorService(workerData.config);

parentPort?.on('message', (batch: ChromosomeBatch) => {
  const results = batch.chromosomes.map((chromosome) => {
    const haiku = decodeChromosome(chromosome, batch.versePools);
    const metrics = validator.calculateQualityMetrics(haiku);
    return {
      id: chromosome.id,
      fitness: metrics.totalScore,
      metrics,
    };
  });

  parentPort?.postMessage({ batchId: batch.id, results });
});

// ParallelFitnessEvaluator.ts
import { Worker } from 'worker_threads';
import os from 'os';

export class ParallelFitnessEvaluator {
  private workers: Worker[] = [];
  private readonly workerCount: number;
  private pendingBatches: Map<string, PendingBatch> = new Map();

  constructor(options: ParallelOptions = {}) {
    this.workerCount = options.workerCount ?? Math.max(1, os.cpus().length - 1);
    this.initializeWorkers();
  }

  private initializeWorkers(): void {
    for (let i = 0; i < this.workerCount; i++) {
      const worker = new Worker('./workers/fitnessWorker.js', {
        workerData: { config: this.validatorConfig },
      });

      worker.on('message', (result: BatchResult) => {
        this.handleBatchResult(result);
      });

      worker.on('error', (error) => {
        this.logger.error('Worker error', { workerId: i, error });
        this.restartWorker(i);
      });

      this.workers.push(worker);
    }
  }

  async evaluatePopulation(
    chromosomes: HaikuChromosome[],
    versePools: VersePools,
  ): Promise<HaikuChromosome[]> {
    // Filter chromosomes that need evaluation
    const toEvaluate = chromosomes.filter((c) => c.fitness === 0);

    if (toEvaluate.length === 0) {
      return chromosomes;
    }

    // Split into batches
    const batchSize = Math.ceil(toEvaluate.length / this.workerCount);
    const batches = this.createBatches(toEvaluate, batchSize, versePools);

    // Distribute to workers
    const results = await Promise.all(
      batches.map((batch, i) => this.submitBatch(batch, i % this.workerCount)),
    );

    // Merge results
    const resultMap = new Map(results.flatMap((r) => r.map((c) => [c.id, c])));

    return chromosomes.map((c) => resultMap.get(c.id) ?? c);
  }

  private async submitBatch(
    batch: ChromosomeBatch,
    workerId: number,
  ): Promise<EvaluatedChromosome[]> {
    return new Promise((resolve, reject) => {
      const batchId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      this.pendingBatches.set(batchId, { resolve, reject, timeout: null });

      // Set timeout for batch
      const timeout = setTimeout(() => {
        this.pendingBatches.delete(batchId);
        reject(new Error(`Batch ${batchId} timed out`));
      }, 30000);

      this.pendingBatches.get(batchId)!.timeout = timeout;

      this.workers[workerId].postMessage({ ...batch, id: batchId });
    });
  }

  async shutdown(): Promise<void> {
    await Promise.all(this.workers.map((w) => w.terminate()));
    this.workers = [];
  }
}
```

### 11.6 Memory Optimization

```typescript
// Use typed arrays for memory-efficient gene storage
class CompactChromosome {
  // Store genes as Uint16Array (supports up to 65535 verses per pool)
  private static readonly GENE_SIZE = 3;
  private readonly genes: Uint16Array;

  constructor(g0: number, g1: number, g2: number) {
    this.genes = new Uint16Array(CompactChromosome.GENE_SIZE);
    this.genes[0] = g0;
    this.genes[1] = g1;
    this.genes[2] = g2;
  }

  get(index: number): number {
    return this.genes[index];
  }

  set(index: number, value: number): void {
    this.genes[index] = value;
  }

  // Efficient ID generation without string concatenation
  getId(): number {
    // Pack 3 genes into single number (works for pools up to ~1000)
    return this.genes[0] * 1000000 + this.genes[1] * 1000 + this.genes[2];
  }
}

// Memory pool for chromosome reuse
class ChromosomePool {
  private readonly pool: CompactChromosome[] = [];
  private readonly maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  acquire(g0: number, g1: number, g2: number): CompactChromosome {
    if (this.pool.length > 0) {
      const chromosome = this.pool.pop()!;
      chromosome.set(0, g0);
      chromosome.set(1, g1);
      chromosome.set(2, g2);
      return chromosome;
    }
    return new CompactChromosome(g0, g1, g2);
  }

  release(chromosome: CompactChromosome): void {
    if (this.pool.length < this.maxSize) {
      this.pool.push(chromosome);
    }
  }

  clear(): void {
    this.pool.length = 0;
  }
}
```

### 11.7 Pre-computed Verse Metrics

```typescript
// Pre-compute expensive per-verse metrics once during pool extraction
interface PrecomputedVerseMetrics {
  sentiment: number;
  grammar: number;
  phonetics: number;
  wordCount: number;
  uniqueWords: Set<string>;
  hasVerb: boolean;
  hasNatureWord: boolean;
  startsWithWeakWord: boolean;
}

class VerseCacheService {
  private readonly cache: Map<string, PrecomputedVerseMetrics> = new Map();

  async precomputeForPools(versePools: VersePools): Promise<void> {
    const allVerses = [...versePools.fiveSyllable, ...versePools.sevenSyllable];

    // Batch compute all verse metrics
    await Promise.all(
      allVerses.map(async (verse) => {
        if (!this.cache.has(verse.text)) {
          const metrics = await this.computeVerseMetrics(verse.text);
          this.cache.set(verse.text, metrics);
        }
      }),
    );
  }

  // Fast haiku fitness using pre-computed verse metrics
  computeHaikuFitnessFast(
    verses: [string, string, string],
    verseIndices: [number, number, number],
  ): number {
    const v1 = this.cache.get(verses[0])!;
    const v2 = this.cache.get(verses[1])!;
    const v3 = this.cache.get(verses[2])!;

    // Aggregate pre-computed metrics
    const avgSentiment = (v1.sentiment + v2.sentiment + v3.sentiment) / 3;
    const avgGrammar = (v1.grammar + v2.grammar + v3.grammar) / 3;

    // Count nature words across haiku
    const natureWordCount = [v1, v2, v3].filter((v) => v.hasNatureWord).length;

    // Check for repeated words
    const allWords = new Set([
      ...v1.uniqueWords,
      ...v2.uniqueWords,
      ...v3.uniqueWords,
    ]);
    const totalWords = v1.wordCount + v2.wordCount + v3.wordCount;
    const repeatedWords = totalWords - allWords.size;

    // Compute verse distance (still need indices)
    const verseDistance = this.computeVerseDistance(verseIndices);

    // Fast fitness calculation
    return (
      +natureWordCount * 2 -
      repeatedWords * 3 +
      (avgSentiment - 0.5) * 4 +
      avgGrammar * 2 +
      verseDistance * 4
    );
  }
}
```

### 11.8 Adaptive Population Sizing

```typescript
// Dynamically adjust population based on search space and time budget
class AdaptivePopulationManager {
  computeOptimalPopulation(
    versePools: VersePools,
    timeBudgetMs: number,
  ): number {
    // Estimate search space size
    const searchSpace =
      versePools.fiveSyllable.length *
      versePools.sevenSyllable.length *
      (versePools.fiveSyllable.length - 1);

    // Estimate time per evaluation (from historical data)
    const avgEvalTimeMs = this.getAverageEvalTime();

    // Calculate how many evaluations we can afford
    const maxEvaluations = Math.floor(timeBudgetMs / avgEvalTimeMs);

    // Population size heuristics
    // Rule of thumb: explore at least 0.1% of search space
    const minExploration = Math.ceil(searchSpace * 0.001);

    // But cap based on time budget
    const timeBasedCap = Math.floor(maxEvaluations / 30); // Assume 30 generations

    // Also consider diminishing returns
    const practicalCap = Math.min(200, Math.sqrt(searchSpace));

    return Math.max(
      20, // Minimum viable population
      Math.min(minExploration, timeBasedCap, practicalCap),
    );
  }

  // Adjust during evolution based on observed diversity
  adjustPopulationDynamic(
    currentPop: Population,
    targetDiversity: number = 0.3,
  ): number {
    const currentDiversity = currentPop.statistics.diversity;

    if (currentDiversity < targetDiversity * 0.5) {
      // Diversity too low - increase population
      return Math.min(currentPop.chromosomes.length * 1.2, 200);
    } else if (currentDiversity > targetDiversity * 1.5) {
      // Diversity too high - can reduce population
      return Math.max(currentPop.chromosomes.length * 0.8, 20);
    }

    return currentPop.chromosomes.length;
  }
}
```

### 11.9 Performance Profiling Integration

```typescript
// Built-in profiling for performance analysis
import { performance, PerformanceObserver } from 'perf_hooks';

class GAProfiler {
  private marks: Map<string, number[]> = new Map();
  private enabled: boolean;

  constructor(enabled: boolean = false) {
    this.enabled = enabled;
  }

  startMark(name: string): void {
    if (!this.enabled) return;
    performance.mark(`${name}-start`);
  }

  endMark(name: string): void {
    if (!this.enabled) return;
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);

    const entries = performance.getEntriesByName(name, 'measure');
    const duration = entries[entries.length - 1]?.duration ?? 0;

    if (!this.marks.has(name)) {
      this.marks.set(name, []);
    }
    this.marks.get(name)!.push(duration);

    // Cleanup marks
    performance.clearMarks(`${name}-start`);
    performance.clearMarks(`${name}-end`);
    performance.clearMeasures(name);
  }

  getReport(): PerformanceReport {
    const report: PerformanceReport = {};

    for (const [name, durations] of this.marks) {
      const sorted = [...durations].sort((a, b) => a - b);
      report[name] = {
        count: durations.length,
        total: durations.reduce((a, b) => a + b, 0),
        avg: durations.reduce((a, b) => a + b, 0) / durations.length,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)],
      };
    }

    return report;
  }

  clear(): void {
    this.marks.clear();
  }
}

// Usage in GeneticAlgorithmService
class GeneticAlgorithmService {
  private readonly profiler: GAProfiler;

  async evolve(versePools: VersePools): Promise<EvolutionResult> {
    this.profiler.startMark('total_evolution');

    // Initialize
    this.profiler.startMark('initialization');
    let population = this.populationManager.initialize();
    this.profiler.endMark('initialization');

    for (let gen = 0; gen < this.config.maxGenerations; gen++) {
      // Selection
      this.profiler.startMark('selection');
      const parents = this.selectParents(population);
      this.profiler.endMark('selection');

      // Crossover
      this.profiler.startMark('crossover');
      const offspring = this.crossoverOperator.crossoverAll(parents);
      this.profiler.endMark('crossover');

      // Mutation
      this.profiler.startMark('mutation');
      const mutated = this.mutationOperator.mutateAll(offspring);
      this.profiler.endMark('mutation');

      // Fitness evaluation (usually the bottleneck)
      this.profiler.startMark('fitness_evaluation');
      population = await this.evaluatePopulation(mutated);
      this.profiler.endMark('fitness_evaluation');
    }

    this.profiler.endMark('total_evolution');

    // Include profiling report in result if enabled
    const performanceReport = this.profiler.getReport();
    this.logger.info('Performance report', performanceReport);

    return { /* ... */, performanceReport };
  }
}
```

### 11.10 Performance Benchmarks & Targets

| Metric                        | Target | Critical | Notes                           |
| ----------------------------- | ------ | -------- | ------------------------------- |
| **Population init**           | <50ms  | <100ms   | Random chromosome generation    |
| **Single fitness eval**       | <5ms   | <10ms    | Depends on validator complexity |
| **Generation evolution**      | <100ms | <200ms   | For pop=50                      |
| **Total evolution (30 gen)**  | <2s    | <5s      | Full GA run                     |
| **Memory per chromosome**     | <1KB   | <2KB     | Compact representation          |
| **Peak memory (pop=100)**     | <50MB  | <100MB   | Including caches                |
| **Cache hit rate**            | >60%   | >40%     | After first few generations     |
| **Worker thread utilization** | >80%   | >60%     | When parallel enabled           |

### 11.11 Performance Testing Suite

```typescript
// __tests__/performance/ga.perf.test.ts

describe('GA Performance', () => {
  const WARMUP_RUNS = 3;
  const MEASURED_RUNS = 10;

  async function benchmark(
    name: string,
    fn: () => Promise<void>,
  ): Promise<BenchmarkResult> {
    // Warmup
    for (let i = 0; i < WARMUP_RUNS; i++) {
      await fn();
    }

    // Force GC if available
    if (global.gc) global.gc();

    // Measured runs
    const times: number[] = [];
    for (let i = 0; i < MEASURED_RUNS; i++) {
      const start = performance.now();
      await fn();
      times.push(performance.now() - start);
    }

    return {
      name,
      avg: times.reduce((a, b) => a + b) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      stdDev: calculateStdDev(times),
    };
  }

  it('should meet fitness evaluation performance target', async () => {
    const versePools = createLargeVersePools(200, 150);
    const evaluator = new FitnessEvaluator(validator, chromosomeFactory);

    const result = await benchmark('fitness_evaluation', async () => {
      const chromosome = chromosomeFactory.createRandom(0);
      evaluator.evaluate(chromosome);
    });

    expect(result.avg).toBeLessThan(5); // <5ms target
    console.log('Fitness evaluation:', result);
  });

  it('should meet full evolution performance target', async () => {
    const versePools = createLargeVersePools(200, 150);
    const service = new GeneticAlgorithmService(validator, {
      populationSize: 50,
      maxGenerations: 30,
    });

    const result = await benchmark('full_evolution', async () => {
      await service.evolve(versePools);
    });

    expect(result.avg).toBeLessThan(2000); // <2s target
    console.log('Full evolution:', result);
  });

  it('should benefit from caching', async () => {
    const versePools = createLargeVersePools(100, 80);

    // Without cache
    const noCacheResult = await benchmark('no_cache', async () => {
      const service = new GeneticAlgorithmService(validator, {
        cacheEvaluations: false,
        populationSize: 30,
        maxGenerations: 10,
      });
      await service.evolve(versePools);
    });

    // With cache
    const cacheResult = await benchmark('with_cache', async () => {
      const service = new GeneticAlgorithmService(validator, {
        cacheEvaluations: true,
        populationSize: 30,
        maxGenerations: 10,
      });
      await service.evolve(versePools);
    });

    expect(cacheResult.avg).toBeLessThan(noCacheResult.avg * 0.8);
    console.log(
      'Cache speedup:',
      (noCacheResult.avg / cacheResult.avg).toFixed(2) + 'x',
    );
  });

  it('should scale linearly with population size', async () => {
    const versePools = createLargeVersePools(150, 120);
    const results: BenchmarkResult[] = [];

    for (const popSize of [25, 50, 100]) {
      const result = await benchmark(`pop_${popSize}`, async () => {
        const service = new GeneticAlgorithmService(validator, {
          populationSize: popSize,
          maxGenerations: 10,
        });
        await service.evolve(versePools);
      });
      results.push(result);
    }

    // Check scaling is roughly linear (not quadratic)
    const ratio_50_25 = results[1].avg / results[0].avg;
    const ratio_100_50 = results[2].avg / results[1].avg;

    expect(ratio_50_25).toBeLessThan(2.5); // Should be ~2x, allow some overhead
    expect(ratio_100_50).toBeLessThan(2.5);

    console.log('Population scaling:', results);
  });
});
```

### 11.12 Memory Profiling

```typescript
// Memory leak detection and profiling
class MemoryProfiler {
  private snapshots: MemorySnapshot[] = [];

  takeSnapshot(label: string): void {
    if (global.gc) global.gc(); // Force GC for accurate measurement

    const usage = process.memoryUsage();
    this.snapshots.push({
      label,
      timestamp: Date.now(),
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      arrayBuffers: usage.arrayBuffers,
    });
  }

  getReport(): MemoryReport {
    const report: MemoryReport = {
      snapshots: this.snapshots,
      leakDetected: false,
      leakDetails: null,
    };

    // Check for memory growth pattern (potential leak)
    if (this.snapshots.length >= 3) {
      const first = this.snapshots[0].heapUsed;
      const last = this.snapshots[this.snapshots.length - 1].heapUsed;
      const growth = (last - first) / first;

      if (growth > 0.5) { // >50% growth
        report.leakDetected = true;
        report.leakDetails = {
          initialHeap: first,
          finalHeap: last,
          growthPercent: growth * 100,
        };
      }
    }

    return report;
  }

  clear(): void {
    this.snapshots = [];
  }
}

// Usage in evolution
async evolve(versePools: VersePools): Promise<EvolutionResult> {
  const memProfiler = new MemoryProfiler();
  memProfiler.takeSnapshot('start');

  // ... evolution loop ...

  for (let gen = 0; gen < maxGenerations; gen++) {
    if (gen % 10 === 0) {
      memProfiler.takeSnapshot(`gen_${gen}`);
    }
    // ...
  }

  memProfiler.takeSnapshot('end');

  const memReport = memProfiler.getReport();
  if (memReport.leakDetected) {
    this.logger.warn('Potential memory leak detected', memReport.leakDetails);
  }

  return { /* ... */, memoryReport: memReport };
}
```

---

## 12. Testing Strategy

### 12.1 Unit Tests

```typescript
// __tests__/operators/SelectionOperator.test.ts

describe('SelectionOperator', () => {
  describe('tournamentSelect', () => {
    it('should return the fittest from tournament', () => {
      const population = createTestPopulation([
        { fitness: 1 }, { fitness: 5 }, { fitness: 3 }
      ]);
      const operator = new SelectionOperator(
        { ...DEFAULT_CONFIG, tournamentSize: 3 },
        new SeededRandom('test')
      );

      // With tournament size = population size, always returns best
      const selected = operator.tournamentSelect(population);
      expect(selected.fitness).toBe(5);
    });

    it('should be deterministic with same seed', () => {
      const population = createTestPopulation([...]);
      const op1 = new SelectionOperator(config, new SeededRandom('seed1'));
      const op2 = new SelectionOperator(config, new SeededRandom('seed1'));

      const result1 = op1.tournamentSelect(population);
      const result2 = op2.tournamentSelect(population);

      expect(result1.id).toBe(result2.id);
    });
  });
});
```

### 12.2 Integration Tests

```typescript
// __tests__/GeneticAlgorithmService.integration.test.ts

describe('GeneticAlgorithmService Integration', () => {
  it('should improve fitness over generations', async () => {
    const versePools = createTestVersePools(100, 80);
    const service = new GeneticAlgorithmService(validator, {
      populationSize: 20,
      maxGenerations: 10,
    });

    const result = await service.evolve(versePools);

    // Best fitness should be better than random average
    const randomBaseline = calculateRandomBaseline(versePools, validator);
    expect(result.topCandidates[0].fitness).toBeGreaterThan(randomBaseline);
  });

  it('should converge on small pools', async () => {
    const smallPools = createTestVersePools(25, 20);
    const service = new GeneticAlgorithmService(validator);

    const result = await service.evolve(smallPools);

    expect(result.convergenceGeneration).toBeLessThan(30);
  });

  it('should be deterministic with seed', async () => {
    const versePools = createTestVersePools(50, 40);

    const result1 = await new GeneticAlgorithmService(validator, {
      seed: 'deterministic-test',
    }).evolve(versePools);

    const result2 = await new GeneticAlgorithmService(validator, {
      seed: 'deterministic-test',
    }).evolve(versePools);

    expect(result1.topCandidates[0].chromosomeId).toBe(
      result2.topCandidates[0].chromosomeId,
    );
  });
});
```

### 12.3 A/B Comparison Test

```typescript
// __tests__/comparison.test.ts

describe('GA vs Random Sampling Comparison', () => {
  it('should produce higher quality haikus than random', async () => {
    const versePools = createRealVersePools(); // From actual book

    // GA approach
    const gaService = new GeneticAlgorithmService(validator, {
      populationSize: 50,
      maxGenerations: 30,
    });
    const gaResult = await gaService.evolve(versePools);

    // Random sampling (current approach)
    const randomResults = [];
    for (let i = 0; i < 50; i++) {
      const haiku = generateRandomHaiku(versePools);
      const metrics = validator.calculateQualityMetrics(haiku);
      randomResults.push(metrics.totalScore);
    }
    const randomBest = Math.max(...randomResults);
    const randomAvg =
      randomResults.reduce((a, b) => a + b) / randomResults.length;

    // GA should beat random
    expect(gaResult.topCandidates[0].fitness).toBeGreaterThan(randomBest);

    // Log comparison for analysis
    console.log({
      gaBest: gaResult.topCandidates[0].fitness,
      gaAvgTop5: gaResult.topCandidates.reduce((a, c) => a + c.fitness, 0) / 5,
      randomBest,
      randomAvg,
      improvement: `${(((gaResult.topCandidates[0].fitness - randomBest) / randomBest) * 100).toFixed(1)}%`,
    });
  });
});
```

### 12.4 Property-Based Tests

```typescript
// __tests__/properties.test.ts

import fc from 'fast-check';

describe('GA Properties', () => {
  it('elitism should preserve best individuals', () => {
    fc.assert(
      fc.property(
        fc.array(fc.float({ min: -10, max: 100 }), {
          minLength: 10,
          maxLength: 100,
        }),
        (fitnesses) => {
          const population = createPopulationWithFitnesses(fitnesses);
          const evolved = populationManager.evolve(population);

          const originalBest = Math.max(...fitnesses);
          const evolvedBest = evolved.statistics.bestFitness;

          // Elitism guarantees best is never lost
          return evolvedBest >= originalBest;
        },
      ),
    );
  });

  it('mutation should preserve chromosome validity', () => {
    fc.assert(
      fc.property(
        fc.record({
          gene0: fc.integer({ min: 0, max: 99 }),
          gene1: fc.integer({ min: 0, max: 79 }),
          gene2: fc.integer({ min: 0, max: 99 }),
        }),
        (genes) => {
          const chromosome = createChromosome([
            genes.gene0,
            genes.gene1,
            genes.gene2,
          ]);
          const mutated = mutationOperator.mutate(chromosome);

          // Mutated chromosome should still have valid gene indices
          return chromosomeFactory.isValid(mutated);
        },
      ),
    );
  });
});
```

---

## 13. Monitoring & Observability

### 13.1 Structured Logging

```typescript
// Log format for each GA run
{
  "level": "info",
  "service": "GeneticAlgorithmService",
  "event": "evolution_complete",
  "data": {
    "bookId": "gutenberg-1234",
    "chapterId": "chapter-5",
    "poolSizes": { "fiveSyllable": 150, "sevenSyllable": 120 },
    "generations": 25,
    "convergenceGeneration": 22,
    "initialBestFitness": 3.2,
    "finalBestFitness": 8.7,
    "improvement": "171.9%",
    "totalEvaluations": 1250,
    "cacheHitRate": 0.72,
    "executionTimeMs": 1450,
    "diversity": { "initial": 1.0, "final": 0.34 }
  }
}
```

### 13.2 Metrics Export

```typescript
// Prometheus metrics
const gaGenerationsTotal = new Counter({
  name: 'haiku_ga_generations_total',
  help: 'Total GA generations executed',
});

const gaEvolutionDuration = new Histogram({
  name: 'haiku_ga_evolution_duration_seconds',
  help: 'GA evolution duration',
  buckets: [0.1, 0.5, 1, 2, 5],
});

const gaFitnessImprovement = new Gauge({
  name: 'haiku_ga_fitness_improvement_ratio',
  help: 'Ratio of final to initial best fitness',
});

const gaConvergenceGeneration = new Histogram({
  name: 'haiku_ga_convergence_generation',
  help: 'Generation at which GA converged',
  buckets: [5, 10, 15, 20, 25, 30],
});
```

### 13.3 Debug Mode

```typescript
// Enable detailed evolution tracking
const DEBUG_CONFIG: Partial<GAConfig> = {
  trackLineage: true,
  recordHistory: true,
};

// Output per-generation state for analysis
interface DebugEvolutionResult extends EvolutionResult {
  generationDetails: Array<{
    generation: number;
    population: HaikuChromosome[];
    statistics: PopulationStatistics;
    operations: {
      selections: number;
      crossovers: number;
      mutations: number;
    };
  }>;
}
```

---

## 14. Feature Toggle & Backward Compatibility

### 14.1 Zero-Impact When Disabled

**Core Principle:** When `GA_ENABLED=false`, the system behaves **exactly** as it does today. No code paths change, no performance impact, no new dependencies loaded.

```typescript
// OpenAIGeneratorService.ts - Integration point

export class OpenAIGeneratorService {
  private gaService?: GeneticAlgorithmService;

  constructor(/* ... */) {
    // Only instantiate GA service if enabled
    // When disabled, gaService remains undefined - zero memory/CPU overhead
    if (process.env.GA_ENABLED === 'true') {
      this.gaService = new GeneticAlgorithmService(
        this.validator,
        this.loadGAConfig(),
      );
    }
  }

  async fetchHaikus(variables: HaikuVariables): Promise<Haiku[]> {
    // CURRENT SYSTEM - unchanged when GA disabled
    if (!this.gaService) {
      // ┌─────────────────────────────────────────────────┐
      // │  EXISTING CODE PATH - COMPLETELY UNCHANGED      │
      // │  This is your current implementation            │
      // └─────────────────────────────────────────────────┘
      const haikus = await this.generateMultipleHaikus(
        selectionCount,
        variables,
      );
      const sortedHaikus = haikus.sort(
        (a, b) => b.metrics.totalScore - a.metrics.totalScore,
      );
      return sortedHaikus.slice(0, GPT_SELECTION_POOL_SIZE);
    }

    // NEW CODE PATH - only when GA explicitly enabled
    const versePools = await this.extractVersePools(variables);
    const evolutionResult = await this.gaService.evolve(versePools);
    return evolutionResult.topCandidates;
  }
}
```

### 14.2 Feature Flag Architecture

```typescript
// config/features.ts

export interface FeatureFlags {
  // Master toggle - when false, GA code is never executed
  GA_ENABLED: boolean;

  // Sub-features (only relevant when GA_ENABLED=true)
  GA_PARALLEL_ENABLED: boolean; // Worker threads
  GA_REDIS_CACHE_ENABLED: boolean; // Cross-request caching
  GA_PROFILING_ENABLED: boolean; // Performance profiling
}

export function loadFeatureFlags(): FeatureFlags {
  return {
    GA_ENABLED: process.env.GA_ENABLED === 'true',
    GA_PARALLEL_ENABLED: process.env.GA_PARALLEL_ENABLED === 'true',
    GA_REDIS_CACHE_ENABLED: process.env.GA_REDIS_CACHE_ENABLED === 'true',
    GA_PROFILING_ENABLED: process.env.GA_PROFILING_ENABLED === 'true',
  };
}

// Default .env (GA disabled)
// GA_ENABLED=false
// GA_PARALLEL_ENABLED=false
// GA_REDIS_CACHE_ENABLED=false
// GA_PROFILING_ENABLED=false
```

### 14.3 Conditional Import Pattern

```typescript
// Lazy loading - GA module only loaded when needed
// Prevents bundle size increase when GA disabled

export class OpenAIGeneratorService {
  private gaService?: GeneticAlgorithmService;

  private async initGAIfEnabled(): Promise<void> {
    if (process.env.GA_ENABLED !== 'true') {
      return; // No import, no instantiation
    }

    // Dynamic import - only loads GA code when enabled
    const { GeneticAlgorithmService } =
      await import('./genetic/GeneticAlgorithmService');
    this.gaService = new GeneticAlgorithmService(
      this.validator,
      this.loadGAConfig(),
    );
  }
}
```

### 14.4 Backward Compatibility Guarantees

| Aspect             | When GA Disabled   | When GA Enabled                 |
| ------------------ | ------------------ | ------------------------------- |
| **Code path**      | 100% unchanged     | New GA path                     |
| **Output format**  | Identical          | Identical (same `Haiku[]` type) |
| **API contracts**  | Unchanged          | Unchanged                       |
| **Performance**    | No overhead        | ~2s additional                  |
| **Memory**         | No overhead        | +50-100MB for GA                |
| **Dependencies**   | No new deps loaded | GA deps loaded                  |
| **Database**       | No changes         | No changes                      |
| **GraphQL schema** | Unchanged          | Unchanged                       |

### 14.5 Runtime Toggle (Optional Enhancement)

```typescript
// Allow toggling without restart via admin endpoint or GraphQL

// GraphQL mutation (admin only)
mutation ToggleGA($enabled: Boolean!) {
  toggleGeneticAlgorithm(enabled: $enabled) {
    success
    previousState
    newState
  }
}

// Implementation
class FeatureFlagService {
  private flags: FeatureFlags;

  constructor() {
    this.flags = loadFeatureFlags();
  }

  isGAEnabled(): boolean {
    return this.flags.GA_ENABLED;
  }

  // Runtime toggle (persists until restart)
  setGAEnabled(enabled: boolean): void {
    this.flags.GA_ENABLED = enabled;
    this.logger.info('GA feature toggled', { enabled });
  }
}
```

### 14.6 Testing Both Modes

```typescript
// Ensure tests cover both GA enabled and disabled

describe('Haiku Generation', () => {
  describe('with GA disabled (current behavior)', () => {
    beforeAll(() => {
      process.env.GA_ENABLED = 'false';
    });

    it('should use random sampling', async () => {
      const service = new OpenAIGeneratorService(/* ... */);
      const haikus = await service.fetchHaikus(variables);

      // Verify current behavior unchanged
      expect(haikus).toHaveLength(GPT_SELECTION_POOL_SIZE);
      // ... existing assertions
    });
  });

  describe('with GA enabled', () => {
    beforeAll(() => {
      process.env.GA_ENABLED = 'true';
    });

    it('should use genetic algorithm', async () => {
      const service = new OpenAIGeneratorService(/* ... */);
      const haikus = await service.fetchHaikus(variables);

      // Verify GA path
      expect(haikus).toHaveLength(GPT_SELECTION_POOL_SIZE);
      // ... GA-specific assertions
    });
  });
});
```

### 14.7 Migration Path

```
Phase 1: Deploy with GA_ENABLED=false (zero risk)
         └── GA code exists but never executes
         └── Current system unchanged

Phase 2: Enable GA_ENABLED=true in staging
         └── Full testing in non-production
         └── Compare quality metrics

Phase 3: Gradual rollout in production
         └── Start with GA_ROLLOUT_PCT=5
         └── Monitor quality and performance
         └── Increase percentage over time

Phase 4: Full rollout or rollback
         └── If successful: GA_ENABLED=true, remove rollout logic
         └── If issues: GA_ENABLED=false, investigate
```

### 14.8 Instant Rollback

```bash
# Immediate rollback - no deployment needed
# Just change environment variable and restart

# Option 1: Environment variable
export GA_ENABLED=false
pm2 restart haiku-server

# Option 2: Config file
echo "GA_ENABLED=false" >> .env
pm2 restart haiku-server

# Option 3: Runtime toggle (if implemented)
curl -X POST https://api.gutenku.com/admin/toggle-ga \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"enabled": false}'

# Verification
curl https://api.gutenku.com/health | jq '.features.ga_enabled'
# Output: false
```

---

## 15. Future Enhancements

### 15.1 Adaptive Parameters

```typescript
// Self-tuning mutation rate based on diversity
adaptMutationRate(population: Population): number {
  const diversity = population.statistics.diversity;

  if (diversity < 0.2) {
    // Low diversity: increase mutation to explore
    return Math.min(this.config.mutationRate * 1.5, 0.3);
  } else if (diversity > 0.8) {
    // High diversity: decrease mutation to converge
    return Math.max(this.config.mutationRate * 0.7, 0.05);
  }

  return this.config.mutationRate;
}
```

### 15.2 Island Model

```typescript
// Multiple sub-populations with periodic migration
interface IslandConfig extends GAConfig {
  islandCount: number; // Number of sub-populations
  migrationInterval: number; // Generations between migrations
  migrationRate: number; // Fraction to migrate
}

class IslandGAService {
  async evolve(versePools: VersePools): Promise<EvolutionResult> {
    // Initialize islands
    const islands = Array(config.islandCount)
      .fill(null)
      .map(() => this.initializeIsland(versePools));

    for (let gen = 0; gen < config.maxGenerations; gen++) {
      // Evolve each island
      islands.forEach((island, i) => {
        islands[i] = this.evolveIsland(island);
      });

      // Periodic migration
      if (gen % config.migrationInterval === 0) {
        this.migrate(islands);
      }
    }

    // Return best from all islands
    return this.selectGlobalBest(islands);
  }
}
```

### 15.3 Multi-Objective (NSGA-II)

```typescript
// Pareto optimization across multiple metrics
interface MultiObjectiveChromosome extends HaikuChromosome {
  objectives: number[]; // [sentiment, flow, imagery, ...]
  rank: number; // Pareto rank
  crowdingDistance: number; // Diversity measure
}

// Instead of single totalScore, optimize across dimensions
// Return Pareto front candidates for GPT to choose from
```

### 15.4 Learned Fitness Function

```typescript
// Train small model on human preferences
interface LearnedFitnessConfig {
  modelPath: string;
  features: string[]; // Which metrics to use as features
  threshold: number; // Min confidence to use prediction
}

class LearnedFitnessEvaluator extends FitnessEvaluator {
  private model: tf.LayersModel;

  async evaluate(chromosome: HaikuChromosome): Promise<HaikuChromosome> {
    // Get base metrics
    const base = await super.evaluate(chromosome);

    // Predict human preference
    const features = this.extractFeatures(base.metrics);
    const prediction = this.model.predict(features);

    // Blend predicted and calculated fitness
    const blendedFitness = 0.7 * prediction + 0.3 * base.fitness;

    return { ...base, fitness: blendedFitness };
  }
}
```

### 15.5 Real-Time Evolution Streaming

```typescript
// GraphQL subscription for evolution progress
subscription WatchEvolution {
  evolutionProgress(requestId: "abc") {
    generation
    bestFitness
    averageFitness
    diversity
    topCandidate {
      verses
      fitness
    }
  }
}

// Emit progress during evolution
for (let gen = 0; gen < maxGenerations; gen++) {
  population = populationManager.evolve(population);

  pubsub.publish('EVOLUTION_PROGRESS', {
    requestId,
    generation: gen,
    bestFitness: population.statistics.bestFitness,
    // ...
  });
}
```

---

## Summary

This plan provides a comprehensive blueprint for implementing a genetic algorithm for haiku selection. Key points:

1. **Modular design** - Each component (operators, evaluator, manager) is independent and testable
2. **Leverages existing infrastructure** - Uses current `HaikuValidatorService` and metrics
3. **Configurable** - All parameters adjustable via environment or runtime config
4. **Deterministic option** - Seeded PRNG for reproducible daily puzzles
5. **Graceful degradation** - Falls back to random sampling if GA fails
6. **Observable** - Comprehensive logging and metrics
7. **Extensible** - Clear paths for future enhancements

Estimated implementation effort: 5 phases over multiple sessions, with core functionality achievable in phases 1-5.
