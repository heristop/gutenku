#!/usr/bin/env node
// Builds src/core/components/icons/ink/IconGallery.html from paths.ts.
// Requires Node >= 22.18 (native TypeScript type stripping).
// Usage: node packages/front/scripts/build-ink-gallery.mjs

import { existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const inkDir = join(here, '../src/core/components/icons/ink');
const { INK_PATHS, INK_ALIASES } = await import(
  pathToFileURL(join(inkDir, 'paths.ts')).href
);

const SIZES = [16, 20, 24, 48];
const STROKE = 1.75;

const svg = (paths, size) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths
    .map((d) => `<path d="${d}"/>`)
    .join('')}</svg>`;

const aliasesOf = (name) =>
  Object.entries(INK_ALIASES)
    .filter(([, target]) => target === name)
    .map(([alias]) => alias);

const cell = ([name, paths]) => {
  const aliases = aliasesOf(name);

  return `<figure class="cell">
  <div class="row">${SIZES.map((s) => `<span class="s s${s}">${svg(paths, s)}</span>`).join('')}</div>
  <figcaption>${name}${aliases.length ? `<small>${aliases.join(' · ')}</small>` : ''}</figcaption>
</figure>`;
};

const entries = Object.entries(INK_PATHS).sort(([a], [b]) =>
  a.localeCompare(b),
);
const grid = entries.map(cell).join('\n');

// In-context strip: icons at 16/20px beside typewriter text, as they ship.
const inline = [
  'Sparkles',
  'BookOpen',
  'Search',
  'Check',
  'X',
  'ChevronRight',
  'Share2',
  'Loader2',
]
  .map((n) => `<span class="chip">${svg(INK_PATHS[n], 16)}${n}</span>`)
  .join('');

// App / brand icons from build-app-icons.mjs, if they have been generated.
const front = join(here, '..');
const rel = '../../../../..';
const appIcons = [
  ['public/favicon.svg', 16],
  ['public/favicon.svg', 32],
  ['public/favicon-16x16.png', 16],
  ['public/favicon-32x32.png', 32],
  ['public/android-chrome-48x48.png', 48],
  ['public/mstile-150x150.png', 75],
  ['public/apple-touch-icon.png', 90],
  ['public/android-chrome-192x192.png', 96],
  ['public/android-chrome-512x512-maskable.png', 128],
  ['public/safari-pinned-tab.svg', 64],
  ['resources/icon-only.png', 128],
  ['resources/icon-foreground.png', 128],
  ['resources/splash.png', 180],
  ['resources/splash-dark.png', 180],
].filter(([file]) => existsSync(join(front, file)));
const appSection = appIcons.length
  ? `<section class="sheet paper"><header><h2>App and brand icons</h2><p class="meta">public/ and resources/ · build-app-icons.mjs</p></header>
  <div class="apps">${appIcons
    .map(
      ([file, px]) =>
        `<figure><img src="${rel}/${file}" width="${px}" height="${px}" alt=""${file.includes('safari') ? ' class="mono"' : ''}><figcaption>${file.split('/').pop()}<small>shown at ${px}px</small></figcaption></figure>`,
    )
    .join('')}</div>
  <img class="og" src="${rel}/public/og-image.png" width="600" height="315" alt="og-image.png">
</section>`
  : '';

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ink icons · GutenKu Ex Libris</title>
<style>
  @font-face { font-family: 'JMH Typewriter'; src: url('../../../../assets/fonts/JMH Typewriter.woff2') format('woff2'); font-display: swap; }
  :root { --type: 'JMH Typewriter', ui-monospace, monospace; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: var(--type); }
  .sheet { padding: 40px clamp(20px, 4vw, 56px) 56px; }
  .paper { background: #f5efe3; color: #27221f; }
  .dark { background: #26231f; color: #ece6da; }
  header { display: flex; align-items: baseline; justify-content: space-between; gap: 24px; flex-wrap: wrap; margin-bottom: 28px; }
  h1, h2 { font-weight: 700; margin: 0; letter-spacing: 0.02em; }
  h1 { font-size: 26px; }
  h2 { font-size: 18px; }
  .meta { font-size: 13px; opacity: 0.72; }
  .stamp { color: #bc2d29; }
  .dark .stamp { color: #e0675f; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(196px, 1fr)); gap: 0; border-top: 1px dashed currentColor; border-left: 1px dashed currentColor; border-color: rgb(127 117 105 / 0.35); }
  .cell { margin: 0; padding: 14px 14px 10px; border-right: 1px dashed rgb(127 117 105 / 0.35); border-bottom: 1px dashed rgb(127 117 105 / 0.35); }
  .row { display: flex; align-items: flex-end; gap: 14px; min-height: 52px; }
  .s { display: inline-flex; }
  figcaption { margin-top: 10px; font-size: 12px; letter-spacing: 0.03em; }
  figcaption small { display: block; font-size: 10px; opacity: 0.6; margin-top: 2px; }
  .strip { display: flex; flex-wrap: wrap; gap: 10px 22px; margin: 0 0 28px; font-size: 14px; }
  .chip { display: inline-flex; align-items: center; gap: 6px; }
  .indigo { color: #264348; }
  .dark .indigo { color: #9fbcc2; }
  .apps { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 28px; margin-bottom: 28px; }
  .apps figure { margin: 0; }
  .apps img.mono { filter: brightness(0.15); }
  .og { display: block; border: 1px dashed rgb(127 117 105 / 0.35); }
  .spin svg { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
</head>
<body>
<section class="sheet paper">
  <header>
    <h1>Ink icons <span class="stamp">·</span> Ex Libris</h1>
    <p class="meta">${entries.length} glyphs · 16 / 20 / 24 / 48 px · stroke ${STROKE} · generated from paths.ts</p>
  </header>
  <div class="strip">${inline}<span class="chip indigo">${svg(INK_PATHS.ArrowRight, 20)}Continue</span><span class="chip spin">${svg(INK_PATHS.Loader2, 20)}</span></div>
  <div class="grid">
${grid}
  </div>
</section>
<section class="sheet dark">
  <header><h2>On dark</h2><p class="meta">#ece6da on #26231f</p></header>
  <div class="strip">${inline}<span class="chip indigo">${svg(INK_PATHS.ArrowRight, 20)}Continue</span></div>
  <div class="grid">
${grid}
  </div>
</section>
${appSection}
</body>
</html>
`;

const out = join(inkDir, 'IconGallery.html');
writeFileSync(out, html);
console.log(`Wrote ${out} (${entries.length} icons)`);
