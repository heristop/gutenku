#!/usr/bin/env node
/**
 * Filter Analytics Script
 * Tests various filter threshold configurations against haiku quality and success rate.
 */
import dotenv from 'dotenv';
dotenv.config();

import 'reflect-metadata';
import pc from 'picocolors';
import { container } from 'tsyringe';
import mongoose from 'mongoose';
import HaikuGeneratorService from '~/domain/services/HaikuGeneratorService';
import '~/infrastructure/di/container';
import { FILTER_CONFIGS } from './filter-analytics-configs';
import {
  type AnalyticsResult,
  evaluateConfig,
} from './filter-analytics-helpers';
import {
  findOptimalConfig,
  printDetailedResults,
} from './filter-analytics-reporting';

async function runAnalytics(iterations: number = 50): Promise<void> {
  console.log(pc.bold('\n' + '='.repeat(70)));
  console.log(pc.bold(pc.cyan('  HAIKU FILTER ANALYTICS')));
  console.log(pc.bold('='.repeat(70)));
  console.log(`\nRunning ${iterations} iterations per configuration...\n`);

  // Connect to MongoDB
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error(pc.red('MONGODB_URI not set'));
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log(pc.green('Connected to MongoDB\n'));

  const generator = container.resolve(HaikuGeneratorService);
  await generator.prepare();
  console.log(pc.green('Generator prepared\n'));

  const results: AnalyticsResult[] = [];

  for (const config of FILTER_CONFIGS) {
    results.push(await evaluateConfig(generator, config, iterations));
  }

  // Print detailed results
  printDetailedResults(results);

  // Find optimal configuration
  findOptimalConfig(results);

  await mongoose.disconnect();
  console.log(pc.green('\nDisconnected from MongoDB'));
}

// Parse arguments
const args = process.argv.slice(2);
const iterations = args.includes('--iterations')
  ? Number.parseInt(args[args.indexOf('--iterations') + 1], 10)
  : 50;

runAnalytics(iterations).catch((error) => {
  console.error(pc.red('Fatal error:'), error);
  process.exit(1);
});
