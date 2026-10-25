#!/usr/bin/env node
// Rewrites `@lucide/vue` imports to the in-house ink icon set.
//
//   node packages/front/scripts/swap-lucide-to-ink.mjs [--dry-run] [root ...]
//
// Roots default to the host front and the private game front. Every name
// imported from @lucide/vue must exist in icons/ink/index.ts, otherwise the
// script lists the missing names and exits 1 without writing anything.
// Remaining "lucide" mentions (vite chunks, test mocks, package.json, comments)
// are listed for manual follow-up.

import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const FROM = '@lucide/vue';
const TO = '@/core/components/icons/ink';

const here = dirname(fileURLToPath(import.meta.url));
const front = resolve(here, '..');
const repo = resolve(front, '../..');
const game = resolve(repo, 'private/gutenguess/packages/front');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const userRoots = args.filter((a) => !a.startsWith('--'));

const roots = userRoots.length
  ? userRoots.map((r) => resolve(process.cwd(), r))
  : [
      join(front, 'src'),
      join(front, 'tests'),
      join(front, 'cypress'),
      ...['components', 'views', 'composables', 'store', 'tests'].map((d) =>
        join(game, d),
      ),
    ];

// Config files that may reference lucide outside import statements.
const configFiles = [
  ...[
    'vite.config.mts',
    'vitest.config.ts',
    'vitest.setup.ts',
    'package.json',
    'tsconfig.json',
    '.oxlintrc.json',
  ].map((f) => join(front, f)),
  ...[
    'vitest.config.ts',
    'vitest.setup.ts',
    'package.json',
    'tsconfig.json',
    'config.ts',
    'index.ts',
  ].map((f) => join(game, f)),
];

const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  '.git',
  'ios',
  'android',
  '.lighthouseci',
  'coverage',
]);
const inkDir = join(front, 'src/core/components/icons/ink');

function walk(dir, out = []) {
  if (!existsSync(dir)) {
    return out;
  }

  if (statSync(dir).isFile()) {
    return [...out, dir];
  }

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) {
      continue;
    }
    const p = join(dir, entry.name);

    if (p.startsWith(inkDir)) {
      continue;
    }

    if (entry.isDirectory()) {
      walk(p, out);
      continue;
    }

    if (/\.(vue|ts|tsx|mts|js|mjs)$/.test(entry.name)) {
      out.push(p);
    }
  }

  return out;
}

// The bare names in an import list: `type X`, `X as Y` -> X.
function importedNames(list) {
  return list
    .split(',')
    .map((part) =>
      part
        .trim()
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/)[0]
        .trim(),
    )
    .filter(Boolean);
}

// Names the ink index exports (values and types).
function inkExports() {
  const src = readFileSync(join(inkDir, 'index.ts'), 'utf8');
  const names = new Set();

  for (const m of src.matchAll(
    /export\s+(?:const|function|class|type|interface)\s+([A-Za-z_$][\w$]*)/g,
  )) {
    names.add(m[1]);
  }

  for (const m of src.matchAll(/export\s+(?:type\s+)?\{([^}]*)\}/g)) {
    for (const part of m[1].split(',')) {
      const spec = part.trim().replace(/^type\s+/, '');

      if (!spec) {
        continue;
      }
      const [, alias] = spec.split(/\s+as\s+/);
      names.add((alias ?? spec).trim());
    }
  }

  return names;
}

const quoted = (s) => s.replaceAll(/[.*+?^${}()|[\]\\/]/g, '\\$&');
const IMPORT_RE = new RegExp(
  String.raw`import\s+(type\s+)?\{([^}]*)\}\s*from\s*(['"])${quoted(FROM)}\3`,
  'g',
);
const STAR_RE = new RegExp(
  String.raw`import\s+\*\s+as\s+(\w+)\s+from\s*(['"])${quoted(FROM)}\2`,
  'g',
);
const DYN_RE = new RegExp(
  String.raw`(?:import|vi\.mock|vi\.doMock|jest\.mock)\(\s*(['"])${quoted(FROM)}\1`,
  'g',
);
const SPECIFIER_RE = new RegExp(String.raw`(['"])${quoted(FROM)}\1`, 'g');

const exported = inkExports();
const files = roots.flatMap((r) => walk(r));
const changes = [];
const missing = new Map();

// An imported icon the ink set doesn't export yet, with where it's used.
function noteMissing(name, file) {
  if (exported.has(name)) {
    return;
  }

  if (!missing.has(name)) {
    missing.set(name, new Set());
  }
  missing.get(name).add(relative(repo, file));
}
const namespaceImports = [];

for (const file of files) {
  const src = readFileSync(file, 'utf8');

  if (!src.includes(FROM)) {
    continue;
  }

  for (const m of src.matchAll(IMPORT_RE)) {
    for (const name of importedNames(m[2])) {
      noteMissing(name, file);
    }
  }

  for (const m of src.matchAll(STAR_RE)) {
    namespaceImports.push(`${relative(repo, file)} (import * as ${m[1]})`);
  }

  const count = (src.match(SPECIFIER_RE) || []).length;
  const dynamic = (src.match(DYN_RE) || []).length;
  const next = src.replaceAll(SPECIFIER_RE, (_all, q) => `${q}${TO}${q}`);

  if (count) {
    changes.push({ file, next, count, dynamic });
  }
}

console.log(`${dryRun ? '[dry-run] ' : ''}ink icon swap: ${FROM} -> ${TO}`);
console.log(
  `Scanned ${files.length} files under ${roots.length} roots; ${changes.length} import ${FROM}.`,
);

for (const c of changes) {
  console.log(
    `  ${relative(repo, c.file)}  (${c.count} specifier${c.count > 1 ? 's' : ''}${c.dynamic ? `, ${c.dynamic} dynamic/mock` : ''})`,
  );
}

if (namespaceImports.length) {
  console.log('\nNamespace imports (check usages by hand):');

  for (const n of namespaceImports) {
    console.log(`  ${n}`);
  }
}

// Remaining mentions outside the rewritten specifiers.
const leftovers = [];

for (const file of [...files, ...configFiles.filter(existsSync)]) {
  const change = changes.find((c) => c.file === file);
  const text = change ? change.next : readFileSync(file, 'utf8');
  text.split('\n').forEach((line, i) => {
    // LucideIcon / LucideProps stay valid: the ink index re-exports both types.
    if (/lucide/i.test(line.replaceAll(/\bLucide(Icon|Props)\b/g, ''))) {
      leftovers.push(`${relative(repo, file)}:${i + 1}: ${line.trim()}`);
    }
  });
}

console.log(`\nMissing names: ${missing.size}`);

for (const [name, where] of missing) {
  console.log(`  ${name}  <- ${[...where].join(', ')}`);
}

console.log(
  `\nRemaining "lucide" mentions for manual follow-up: ${leftovers.length}`,
);

for (const l of leftovers) {
  console.log(`  ${l}`);
}

if (missing.size) {
  console.error(
    '\nAborting: add the missing names to icons/ink/paths.ts and index.ts first.',
  );
  process.exit(1);
}

if (!dryRun) {
  for (const c of changes) {
    writeFileSync(c.file, c.next);
  }
  console.log(`\nRewrote ${changes.length} files.`);
}
