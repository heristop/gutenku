#!/usr/bin/env tsx
/**
 * Backfills `daily_haikus` from the git history of the daily post: every
 * commit touching assets/social-preview-description.txt is one published
 * haiku (date = commit UTC day). The reading and the card are taken from the
 * same commit only when that commit changed them (otherwise they belong to
 * an earlier day). Existing days are never touched (insertIfAbsent).
 *
 * Usage (from packages/server):
 *   pnpm backfill:daily-haiku [--dry-run] [--since YYYY-MM-DD] [--allow-remote]
 *
 * Refuses non-local MongoDB URIs unless --allow-remote is given.
 */
import 'reflect-metadata';
import dotenv from 'dotenv';
import { execFileSync } from 'node:child_process';
import mongoose from 'mongoose';
import type { DailyHaikuEntity } from '~/domain/repositories/IDailyHaikuRepository';
import {
  isValidDailyHaikuDate,
  toUtcDateString,
} from '~/domain/services/DailyHaikuSchedule';
import DailyHaikuRepository from '~/infrastructure/repositories/DailyHaikuRepository';
import MongoConnection from '~/infrastructure/services/MongoConnection';

dotenv.config();

const CAPTION_PATH = 'assets/social-preview-description.txt';
const READING_PATH = 'assets/description.txt';
const CARD_PATH = 'assets/img/daily_haiku_card.jpg';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', 'mongo']);

interface Commit {
  sha: string;
  date: Date;
}

export interface ParsedCaption {
  title?: string;
  verses: string[];
  bookTitle?: string;
  author?: string;
  authorHint?: string;
  firstLetter?: string;
  emoticons?: string;
}

interface BookDoc {
  _id: { toString(): string };
  title: string;
  author: string;
  reference?: string;
}

type Outcome =
  | { kind: 'inserted' | 'exists' | 'would-insert'; date: string }
  | { kind: 'skipped'; date: string; reason: string };

function parseArgs() {
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  const sinceIndex = args.indexOf('--since');
  const since = sinceIndex === -1 ? undefined : args[sinceIndex + 1];

  if (since !== undefined && !isValidDailyHaikuDate(since)) {
    throw new Error(`Invalid --since ${since} (expected YYYY-MM-DD)`);
  }

  return {
    dryRun: args.includes('--dry-run'),
    allowRemote: args.includes('--allow-remote'),
    since,
  };
}

function git(args: string[], cwd: string): Buffer {
  return execFileSync('git', args, { cwd, maxBuffer: 64 * 1024 * 1024 });
}

function gitText(args: string[], cwd: string): string {
  return git(args, cwd).toString('utf8');
}

function listCommits(root: string): Commit[] {
  return gitText(['log', '--format=%H %aI', '--', CAPTION_PATH], root)
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [sha, iso] = line.split(' ');

      return { sha, date: new Date(iso) };
    });
}

function changedFiles(root: string, sha: string): Set<string> {
  return new Set(
    gitText(['show', '--name-only', '--format=', '--no-renames', sha], root)
      .split('\n')
      .filter(Boolean),
  );
}

function readAt(root: string, sha: string, path: string): Buffer | null {
  try {
    return git(['show', `${sha}:${path}`], root);
  } catch {
    return null;
  }
}

function hintValue(caption: string, label: RegExp): string | undefined {
  const match = new RegExp(
    String.raw`Hint \d+ \(${label.source}\):\s*\n\s*(.+)`,
    'i',
  ).exec(caption);

  return match?.[1]?.trim() || undefined;
}

/** Tolerant parser for the captions produced by generateSocialCaption. */
export function parseCaption(caption: string): ParsedCaption {
  const text = caption.replaceAll('\r\n', '\n');
  const sections = text.split(/^\s*~~~\s*$/m).map((s) => s.trim());
  const bookIndex = sections.findIndex((s) => /^📗\s/m.test(s));
  const bookLine =
    bookIndex === -1
      ? undefined
      : /^📗\s+(.+)$/m.exec(sections[bookIndex])?.[1]?.trim();
  const by = bookLine?.lastIndexOf(' by ') ?? -1;
  const verses = (bookIndex === -1 ? '' : (sections[bookIndex + 1] ?? ''))
    .split('\n')
    .map((verse) => verse.trim())
    .filter(Boolean);

  return {
    title: /[“"](.+?)[”"]/.exec(text.split('\n')[0] ?? '')?.[1]?.trim(),
    verses,
    bookTitle: bookLine && by > 0 ? bookLine.slice(0, by).trim() : undefined,
    author: bookLine && by > 0 ? bookLine.slice(by + 4).trim() : undefined,
    authorHint: hintValue(text, /Author/)?.replace(/\.{3}$|…$/, ''),
    firstLetter: hintValue(text, /First letter of the book/)?.charAt(0),
    emoticons: hintValue(text, /Bookmoji/),
  };
}

const escapeRegex = (value: string) =>
  value.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

async function resolveBook(
  parsed: ParsedCaption,
): Promise<BookDoc | { ambiguous: true } | null> {
  const books = mongoose.connection.collection<BookDoc>('books');

  if (parsed.bookTitle && parsed.author) {
    const exact = await books
      .find({ title: parsed.bookTitle, author: parsed.author })
      .limit(2)
      .toArray();

    if (exact.length === 1) {
      return exact[0];
    }
  }

  const author = parsed.author ?? parsed.authorHint;
  const letter = parsed.bookTitle?.charAt(0) ?? parsed.firstLetter;

  if (!author || !letter) {
    return null;
  }

  const candidates = await books
    .find({
      author: { $regex: `^${escapeRegex(author)}`, $options: 'i' },
      title: { $regex: `^${escapeRegex(letter)}`, $options: 'i' },
    })
    .limit(5)
    .toArray();

  if (candidates.length > 1) {
    return { ambiguous: true };
  }

  return candidates[0] ?? null;
}

async function buildEntity(
  root: string,
  commit: Commit,
): Promise<DailyHaikuEntity | string> {
  const caption = readAt(root, commit.sha, CAPTION_PATH)?.toString('utf8');

  if (!caption) {
    return 'caption unreadable';
  }

  const parsed = parseCaption(caption);

  if (parsed.verses.length !== 3) {
    return `expected 3 verses, found ${parsed.verses.length}`;
  }

  const book = await resolveBook(parsed);

  if (book && 'ambiguous' in book) {
    return 'ambiguous book (author + first letter)';
  }

  const title = parsed.bookTitle ?? book?.title;
  const author = parsed.author ?? book?.author;

  if (!title || !author) {
    return 'book not resolved';
  }

  const changed = changedFiles(root, commit.sha);
  const reading = changed.has(READING_PATH)
    ? readAt(root, commit.sha, READING_PATH)?.toString('utf8').trim()
    : undefined;
  const card = changed.has(CARD_PATH)
    ? readAt(root, commit.sha, CARD_PATH)
    : null;

  const entity: DailyHaikuEntity = {
    date: toUtcDateString(commit.date),
    publishedAt: commit.date,
    verses: parsed.verses,
    book: {
      title,
      author,
      ...(book?.reference ? { reference: book.reference } : {}),
      ...(parsed.emoticons ? { emoticons: parsed.emoticons } : {}),
    },
    socialCaption: caption,
    source: 'backfill',
    ...(parsed.title ? { title: parsed.title } : {}),
    ...(reading ? { description: reading } : {}),
    ...(card?.length
      ? { card: { contentType: 'image/jpeg', data: card } }
      : {}),
    ...(book ? { bookId: book._id.toString() } : {}),
  };

  return entity;
}

function assertLocalMongo(allowRemote: boolean) {
  const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017';
  const hosts = uri
    .replace(/^mongodb(\+srv)?:\/\//, '')
    .split('/')[0]
    .split('@')
    .at(-1)!
    .split(',')
    .map((host) => host.replace(/:\d+$/, ''));

  if (!allowRemote && !hosts.every((host) => LOCAL_HOSTS.has(host))) {
    throw new Error(
      'MONGODB_URI is not local; pass --allow-remote to backfill it',
    );
  }
}

async function main() {
  const { dryRun, allowRemote, since } = parseArgs();
  assertLocalMongo(allowRemote);

  const root = gitText(['rev-parse', '--show-toplevel'], process.cwd()).trim();
  const connection = new MongoConnection();

  if (!(await connection.connect())) {
    throw new Error('MongoDB unreachable');
  }

  const repository = new DailyHaikuRepository(connection);
  const seen = new Set<string>();
  const outcomes: Outcome[] = [];
  // Newest first: when a day has several commits, the last one wins.
  const commits = listCommits(root).filter(
    (c) => !since || toUtcDateString(c.date) >= since,
  );

  for (const commit of commits) {
    const date = toUtcDateString(commit.date);
    const label = `${date} ${commit.sha.slice(0, 8)}`;

    if (seen.has(date)) {
      outcomes.push({
        kind: 'skipped',
        date: label,
        reason: 'later commit same day',
      });
      continue;
    }

    const entity = await buildEntity(root, commit);

    if (typeof entity === 'string') {
      outcomes.push({ kind: 'skipped', date: label, reason: entity });
      continue;
    }

    seen.add(date);

    if (dryRun) {
      const existing = await repository.findByDate(date);
      outcomes.push({ kind: existing ? 'exists' : 'would-insert', date });
      continue;
    }

    outcomes.push({ kind: await repository.insertIfAbsent(entity), date });
  }

  const count = (kind: Outcome['kind']) =>
    outcomes.filter((o) => o.kind === kind).length;

  console.log(
    `${dryRun ? '[dry-run] ' : ''}${commits.length} commits: ` +
      `${count(dryRun ? 'would-insert' : 'inserted')} ${dryRun ? 'to insert' : 'inserted'}, ` +
      `${count('exists')} already recorded, ${count('skipped')} skipped`,
  );

  for (const outcome of outcomes) {
    if (outcome.kind === 'skipped') {
      console.log(`  skipped ${outcome.date}: ${outcome.reason}`);
    }
  }
}

try {
  await main();
} finally {
  await mongoose.disconnect().catch(() => {});
}
