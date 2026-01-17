#!/usr/bin/env node
/**
 * ML Training CLI with Visual Representation
 *
 * Provides a game-like real-time visualization of the neural network training
 * for haiku quality prediction using triplet loss.
 */
import 'reflect-metadata';
import dotenv from 'dotenv';
import pc from 'picocolors';
import { program } from 'commander';
import logUpdate from 'log-update';
import stringWidth from 'string-width';
import { existsSync } from 'node:fs';
import { readFile, mkdir } from 'node:fs/promises';
import ora from 'ora';

dotenv.config();

// Filter out standalone '--' from argv (pnpm passes it through)
const argv = process.argv.filter((arg) => arg !== '--');

import { HaikuEmbeddingModel } from '~/domain/ml/HaikuEmbeddingModel';
import {
  SiameseTrainer,
  type TrainingProgress,
} from '~/domain/ml/SiameseTrainer';
import type { TrainingConfig } from '~/config/ml';
import type { EvolutionDataset, Triplet } from '@gutenku/shared';

program
  .name('ml-train')
  .description(
    'Train neural network for haiku quality prediction with visual feedback',
  )
  .option('-e, --epochs <number>', 'number of training epochs', '50')
  .option('-b, --batch-size <number>', 'batch size', '32')
  .option('-t, --triplets <number>', 'number of triplets to generate', '10000')
  .option('-m, --margin <number>', 'triplet loss margin', '0.5')
  .option('-l, --learning-rate <number>', 'learning rate', '0.001')
  .option(
    '-d, --data <path>',
    'path to evolution data',
    'data/evolution-samples.json',
  )
  .option(
    '-o, --output <path>',
    'output model directory',
    'models/haiku-embedding',
  )
  .option('--no-animation', 'disable animation')
  .option('--delay <number>', 'animation delay in ms', '100')
  .parse(argv);

const opts = program.opts();

const config: TrainingConfig = {
  epochs: Math.max(1, Number.parseInt(opts.epochs, 10) || 50),
  batchSize: Math.max(1, Number.parseInt(opts.batchSize, 10) || 32),
  tripletCount: Math.max(100, Number.parseInt(opts.triplets, 10) || 10000),
  margin: Math.max(0.1, Number.parseFloat(opts.margin) || 0.5),
  learningRate: Math.max(0.0001, Number.parseFloat(opts.learningRate) || 0.001),
};

const dataPath = opts.data || 'data/evolution-samples.json';
const outputDir = opts.output || 'models/haiku-embedding';
const showAnimation = opts.animation !== false;
// Note: --delay option is parsed but animation uses real-time updates

// ============================================================================
// UI CONSTANTS AND HELPERS
// ============================================================================

const BOX_WIDTH = 70;
const INNER_WIDTH = BOX_WIDTH - 4;

function fitToWidth(str: string, width: number): string {
  const visWidth = stringWidth(str);
  if (visWidth === width) {
    return str;
  }
  if (visWidth > width) {
    let result = '';
    let currentWidth = 0;
    for (const char of str) {
      const charWidth = stringWidth(char);
      if (currentWidth + charWidth > width - 3) {
        break;
      }
      result += char;
      currentWidth += charWidth;
    }
    return result + '...';
  }
  return str + ' '.repeat(width - visWidth);
}

function boxLine(content: string): string {
  return (
    pc.bold('║') + ' ' + fitToWidth(content, INNER_WIDTH) + ' ' + pc.bold('║')
  );
}

function boxTop(): string {
  return pc.bold('╔' + '═'.repeat(BOX_WIDTH - 2) + '╗');
}

function boxBottom(): string {
  return pc.bold('╚' + '═'.repeat(BOX_WIDTH - 2) + '╝');
}

function boxSep(): string {
  return pc.bold('╠' + '═'.repeat(BOX_WIDTH - 2) + '╣');
}

function progressBar(current: number, total: number, width: number): string {
  const pct = Math.min(1, current / total);
  const filled = Math.round(pct * width);
  const empty = width - filled;
  const bar = pc.green('█'.repeat(filled)) + pc.dim('░'.repeat(empty));
  return bar + ' ' + pc.cyan((pct * 100).toFixed(0).padStart(3) + '%');
}

function sparkline(values: number[], width: number): string {
  if (values.length === 0) {
    return ' '.repeat(width);
  }

  const blocks = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  // Sample values to fit width
  const sampled: number[] = [];
  for (let i = 0; i < width; i++) {
    const idx = Math.floor((i / width) * values.length);
    sampled.push(values[idx]);
  }

  return sampled
    .map((v) => {
      const normalized = (v - min) / range;
      const blockIdx = Math.min(
        blocks.length - 1,
        Math.floor(normalized * blocks.length),
      );
      return pc.cyan(blocks[blockIdx]);
    })
    .join('');
}

function neuralNetworkDiagram(epoch: number, totalEpochs: number): string[] {
  // Compact ASCII art representation of the neural network
  const activation = (epoch / totalEpochs) * 100;
  const levels = [
    activation > 10 ? pc.green('●') : pc.dim('○'),
    activation > 30 ? pc.green('●') : pc.dim('○'),
    activation > 50 ? pc.green('●') : pc.dim('○'),
    activation > 70 ? pc.green('●') : pc.dim('○'),
    activation > 90 ? pc.green('●') : pc.dim('○'),
  ];

  return [
    `   Input     Embed    Conv3   Conv5    Dense   Output`,
    `   ┌───┐    ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐`,
    `   │ ${levels[0]} │────│ ${levels[1]} │───│ ${levels[2]} │───│ ${levels[2]} │───│ ${levels[3]} │───│ ${levels[4]} │`,
    `   │chr│    │32d│   │64f│   │64f│   │128│   │64d│`,
    `   └───┘    └───┘   └───┘   └───┘   └───┘   └───┘`,
  ];
}

function tripletDiagram(accuracy: number): string[] {
  const goodEmoji = accuracy > 80 ? '✓' : '○';
  const badEmoji = accuracy > 80 ? '✗' : '○';

  return [
    `   Triplet Loss: d(A,P) < d(A,N) + margin`,
    ``,
    `       [Anchor] ──┬── [${pc.green(goodEmoji)} Positive] ${pc.green('Elite')}`,
    `                  └── [${pc.red(badEmoji)} Negative] ${pc.red('Eliminated')}`,
  ];
}

// ============================================================================
// TRAINING VISUALIZATION
// ============================================================================

interface TrainingState {
  epoch: number;
  totalEpochs: number;
  loss: number;
  accuracy: number;
  lossHistory: number[];
  accuracyHistory: number[];
  startTime: number;
  samplesProcessed: number;
  totalSamples: number;
}

function renderTrainingScreen(state: TrainingState): string {
  const {
    epoch,
    totalEpochs,
    loss,
    accuracy,
    lossHistory,
    accuracyHistory,
    startTime,
    samplesProcessed,
    totalSamples,
  } = state;

  const elapsed = Date.now() - startTime;
  const elapsedStr = formatDuration(elapsed);
  const estimatedTotal = epoch > 0 ? (elapsed / epoch) * totalEpochs : 0;
  const remaining = Math.max(0, estimatedTotal - elapsed);
  const remainingStr = epoch > 0 ? formatDuration(remaining) : '???';

  const nn = neuralNetworkDiagram(epoch, totalEpochs);
  const triplet = tripletDiagram(accuracy);

  const lines: string[] = [
    '',
    boxTop(),
    boxLine(
      pc.bold(pc.cyan('🧠 Neural Network Training - Haiku Quality Prediction')),
    ),
    boxSep(),
    boxLine(''),
    boxLine(pc.bold('Network Architecture:')),
    ...nn.map((l) => boxLine(l)),
    boxLine(''),
    boxSep(),
    boxLine(''),
    boxLine(pc.bold('Training Progress:')),
    boxLine(''),
    boxLine(
      `  Epoch: ${pc.yellow(String(epoch).padStart(3))} / ${totalEpochs}`,
    ),
    boxLine(`  ${progressBar(epoch, totalEpochs, 40)}`),
    boxLine(''),
    boxLine(
      `  Loss:     ${pc.red(loss.toFixed(4).padStart(8))}  ${sparkline(lossHistory.slice(-30), 25)}`,
    ),
    boxLine(
      `  Accuracy: ${pc.green((accuracy.toFixed(1) + '%').padStart(7))}  ${sparkline(accuracyHistory.slice(-30), 25)}`,
    ),
    boxLine(''),
    boxLine(
      `  Samples: ${pc.cyan(String(samplesProcessed).padStart(6))} / ${totalSamples}`,
    ),
    boxLine(
      `  Elapsed: ${pc.dim(elapsedStr.padStart(8))}  |  Remaining: ${pc.dim(remainingStr.padStart(8))}`,
    ),
    boxLine(''),
    boxSep(),
    boxLine(''),
    boxLine(pc.bold('Triplet Learning:')),
    ...triplet.map((l) => boxLine(l)),
    boxLine(''),
    boxBottom(),
    '',
  ];

  return lines.join('\n');
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  console.log(pc.bold('\n🧠 Haiku Quality Neural Network Trainer\n'));

  // Check for training data
  const spinner = ora('Checking for training data...').start();

  if (!existsSync(dataPath)) {
    spinner.fail(pc.red(`Training data not found: ${dataPath}`));
    console.log(pc.dim('\nTo collect training data, run:'));
    console.log(
      pc.cyan('  pnpm extract -m ga -n 100 --collect-training-data\n'),
    );
    process.exit(1);
  }

  // Load training data
  spinner.text = 'Loading evolution data...';
  const dataContent = await readFile(dataPath, 'utf-8');
  const dataset = JSON.parse(dataContent) as EvolutionDataset;
  spinner.succeed(
    pc.green(`Loaded ${pc.cyan(String(dataset.totalSamples))} samples`),
  );

  console.log(pc.dim(`  Positive (elite): ${dataset.positiveSamples}`));
  console.log(pc.dim(`  Negative (eliminated): ${dataset.negativeSamples}\n`));

  // Check sample counts (minimum 10 positive and 50 negative for triplet generation)
  if (dataset.positiveSamples < 10 || dataset.negativeSamples < 50) {
    console.log(pc.yellow('⚠ Not enough samples for training.'));
    console.log(
      pc.dim('  Need at least 10 positive and 50 negative samples.\n'),
    );
    process.exit(1);
  }

  // Generate triplets
  const tripletSpinner = ora('Generating training triplets...').start();

  // Generate triplets from dataset
  const positives = dataset.samples.filter((s) => s.wasElite);
  const negatives = dataset.samples.filter(
    (s) => s.generationDied > 0 && s.generationDied <= 10,
  );

  const triplets: Triplet[] = [];
  const tripletCount = Math.min(
    config.tripletCount,
    positives.length * negatives.length,
  );

  for (let i = 0; i < tripletCount; i++) {
    const anchorIdx = Math.floor(Math.random() * positives.length);
    let positiveIdx = Math.floor(Math.random() * positives.length);
    while (positiveIdx === anchorIdx && positives.length > 1) {
      positiveIdx = Math.floor(Math.random() * positives.length);
    }
    const negativeIdx = Math.floor(Math.random() * negatives.length);

    triplets.push({
      anchor: positives[anchorIdx].haikuText,
      positive: positives[positiveIdx].haikuText,
      negative: negatives[negativeIdx].haikuText,
    });
  }

  tripletSpinner.succeed(
    pc.green(`Generated ${pc.cyan(String(triplets.length))} triplets`),
  );

  // Initialize model
  const modelSpinner = ora('Building embedding model...').start();
  const embeddingModel = new HaikuEmbeddingModel();
  embeddingModel.buildModel();
  const paramCount = embeddingModel.getParameterCount();
  modelSpinner.succeed(
    pc.green(`Model built: ${pc.cyan(paramCount.toLocaleString())} parameters`),
  );

  // Create trainer
  const trainer = new SiameseTrainer(
    embeddingModel,
    {
      modelDir: outputDir,
      weightsPath: `${outputDir}/model.json`,
      metadataPath: `${outputDir}/metadata.json`,
      centroidPath: `${outputDir}/centroid.json`,
    },
    config,
  );

  // Training state
  const state: TrainingState = {
    epoch: 0,
    totalEpochs: config.epochs,
    loss: 1,
    accuracy: 50,
    lossHistory: [],
    accuracyHistory: [],
    startTime: Date.now(),
    samplesProcessed: 0,
    totalSamples: triplets.length * config.epochs,
  };

  console.log(pc.dim('\nStarting training...\n'));

  // Train with progress callback
  const result = await trainer.train(triplets, (progress: TrainingProgress) => {
    state.epoch = progress.epoch;
    state.loss = progress.loss;
    state.accuracy = progress.tripletAccuracy;
    state.lossHistory.push(progress.loss);
    state.accuracyHistory.push(progress.tripletAccuracy);
    state.samplesProcessed = progress.epoch * triplets.length;

    // Always log epoch progress (visible in all terminals/environments)
    console.log(
      `[Epoch ${progress.epoch}/${config.epochs}] Loss: ${progress.loss.toFixed(4)} | Accuracy: ${progress.tripletAccuracy.toFixed(1)}%`,
    );

    if (showAnimation) {
      logUpdate(renderTrainingScreen(state));
    }
  });

  if (showAnimation) {
    logUpdate.done();
  }

  // Compute survivor centroid
  const centroidSpinner = ora('Computing survivor centroid...').start();
  const eliteHaikus = positives.slice(0, 100).map((s) => s.haikuText);
  const centroid = await trainer.computeSurvivorCentroid(eliteHaikus);
  centroidSpinner.succeed(
    pc.green(
      `Centroid computed from ${pc.cyan(String(centroid.sampleCount))} elite haikus`,
    ),
  );

  // Save model
  const saveSpinner = ora('Saving model...').start();
  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }
  await trainer.save();
  saveSpinner.succeed(pc.green(`Model saved to ${pc.cyan(outputDir)}`));

  // Summary
  console.log('\n' + pc.bold('═══ Training Complete ═══\n'));
  console.log(`  Epochs:        ${pc.cyan(String(result.epochs))}`);
  console.log(`  Final Loss:    ${pc.red(result.finalLoss.toFixed(4))}`);
  console.log(
    `  Final Accuracy: ${pc.green(result.tripletAccuracy.toFixed(1) + '%')}`,
  );
  console.log(
    `  Training Time: ${pc.dim(formatDuration(result.trainingTimeMs))}`,
  );
  console.log('');
  console.log(pc.green('✨ Model ready for hybrid scoring!'));
  console.log(pc.dim('\nTo use hybrid scoring, set:'));
  console.log(pc.cyan('  ML_SCORING_MODE=hybrid\n'));

  // Cleanup
  trainer.dispose();
}

main().catch((err) => {
  console.error(pc.red('\n✗ Training failed:'), err.message);
  process.exit(1);
});
