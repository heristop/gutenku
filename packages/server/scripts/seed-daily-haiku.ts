#!/usr/bin/env tsx
/**
 * DEV ONLY - seeds today's DailyHaiku in the local MongoDB from the files the
 * `post` CLI leaves in ./data (daily_haiku_card.jpg, description.txt,
 * social-preview-description.txt), so `/api/daily-haiku` can be exercised
 * without generating a new haiku.
 *
 * Usage (from packages/server):
 *   pnpm seed:daily-haiku [--date YYYY-MM-DD] [--force]
 * Without --force, a day already published by the CLI/backfill is kept.
 */
import 'reflect-metadata';
import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import { publishDailyHaiku } from '~/cli/daily-haiku-publisher';
import { isValidDailyHaikuDate } from '~/domain/services/DailyHaikuSchedule';

dotenv.config();

const DATA_DIRECTORY = path.resolve('data');

interface ParsedCaption {
  title?: string;
  verses: string[];
  book: { title: string; author: string; emoticons?: string };
}

// Parses the caption produced by generateSocialCaption (@gutenku/shared).
function parseSocialCaption(caption: string): ParsedCaption {
  const sections = caption.split(/^~~~$/m).map((section) => section.trim());
  const bookSectionIndex = sections.findIndex((s) => s.includes('📗 '));

  if (bookSectionIndex === -1 || !sections[bookSectionIndex + 1]) {
    throw new Error('Unrecognized social-preview-description.txt format');
  }

  const bookLine = sections[bookSectionIndex]
    .split('\n')
    .find((line) => line.startsWith('📗 '))!
    .slice('📗 '.length);
  const bySeparator = bookLine.lastIndexOf(' by ');
  const emoticons = /Bookmoji\):\n(.+)/.exec(caption)?.[1]?.trim();

  return {
    title: /“(.+)”/.exec(caption)?.[1],
    verses: sections[bookSectionIndex + 1].split('\n').map((v) => v.trim()),
    book: {
      title: bookLine.slice(0, bySeparator),
      author: bookLine.slice(bySeparator + ' by '.length),
      emoticons,
    },
  };
}

function parseDateArg(): Date {
  const index = process.argv.indexOf('--date');
  const value = index === -1 ? undefined : process.argv[index + 1];

  if (!value) {
    return new Date();
  }

  if (!isValidDailyHaikuDate(value)) {
    throw new Error(`Invalid --date ${value} (expected YYYY-MM-DD)`);
  }

  return new Date(`${value}T10:00:00.000Z`);
}

const [card, description, caption] = await Promise.all([
  fs.readFile(path.join(DATA_DIRECTORY, 'daily_haiku_card.jpg')),
  fs.readFile(path.join(DATA_DIRECTORY, 'description.txt'), 'utf8'),
  fs.readFile(
    path.join(DATA_DIRECTORY, 'social-preview-description.txt'),
    'utf8',
  ),
]);

const parsed = parseSocialCaption(caption);
const published = await publishDailyHaiku(
  {
    haiku: { ...parsed, description: description.trim() },
    card,
    socialCaption: caption,
    now: parseDateArg(),
    source: 'seed',
  },
  console,
  { force: process.argv.includes('--force') },
);

if (!published) {
  process.exit(1);
}

console.log(
  `Daily haiku for ${published.date} ${published.result}: ${parsed.verses.join(' / ')}`,
);
