#!/usr/bin/env node
// Builds every GutenKu brand asset from the mark in
// src/core/components/ink/brand-mark.ts (open book, haiku on the right page,
// small vermilion stamp): favicons, PWA and Apple icons, Windows tile, Safari
// pinned tab, the social share image and the GitHub social preview, plus the
// Capacitor sources in resources/ (then run `npx capacitor-assets generate`).
//
//   node packages/front/scripts/build-app-icons.mjs
//
// Needs sharp (hoisted from the server package) and Node 22.18+ (imports the
// .ts mark directly). Text is converted from the bundled JMH Typewriter TTF to
// paths, so nothing depends on an installed font.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { loadFont, textPath } from './ttf-text-path.mjs';
import {
  MARK_DARK,
  MARK_LIGHT,
  SUMI,
  SUMI_NIGHT,
  markMonochrome,
  markSvg,
} from '../src/core/components/ink/brand-mark.ts';

const here = dirname(fileURLToPath(import.meta.url));
const front = join(here, '..');
const repo = join(front, '../..');
const out = join(front, 'public');
const fontfile = join(front, 'src/assets/fonts/JMH Typewriter.ttf');
mkdirSync(out, { recursive: true });

const font = loadFont(fontfile);
const L = MARK_LIGHT;
const D = MARK_DARK;
const INK_SOFT = '#5D544C';

const f = (n) => Math.round(n * 100) / 100;

// Ink bleed for large renders only: small sizes stay crisp
const BLEED = `<filter id="bleed" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="0.7" xChannelSelector="R" yChannelSelector="G"/></filter>`;

/**
 * Square icon. `fit` scales the mark inside the canvas, `bg` paints a full
 * bleed background (iOS/maskable add their own corner mask), `tile` keeps the
 * mark's own rounded paper tile.
 */
function iconSvg({
  px,
  size = 'full',
  fit = 1,
  bg = null,
  tile = true,
  colors = L,
  bleed = false,
}) {
  const s = f(fit);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 100 100">${
    bleed ? `<defs>${BLEED}</defs>` : ''
  }${bg ? `<rect width="100" height="100" fill="${bg}"/>` : ''}<g transform="translate(50 50) scale(${s}) translate(-50 -50)">${markSvg(
    {
      size,
      colors,
      tile,
      filter: bleed ? 'bleed' : '',
    },
  )}</g></svg>`;
}

const png = (svg, px) =>
  sharp(Buffer.from(svg), { density: 72 * Math.max(1, px / 100) })
    .resize(px, px)
    .png({ compressionLevel: 9 })
    .toBuffer();

// ------------------------------------------------------------------ web icons

const written = [];
async function emit(dir, name, data) {
  writeFileSync(join(dir, name), data);
  written.push(
    join(dir === out ? 'public' : dir.replace(`${repo}/`, ''), name),
  );
}

// SVG favicon follows the browser scheme: dark tile in dark mode
await emit(
  out,
  'favicon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>@media (prefers-color-scheme: dark){.l{display:none}}@media (prefers-color-scheme: light),(prefers-color-scheme: no-preference){.d{display:none}}</style><g class="l">${markSvg({ size: 'small', colors: L })}</g><g class="d">${markSvg({ size: 'small', colors: D })}</g></svg>`,
);

await emit(
  out,
  'safari-pinned-tab.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${markMonochrome()}</svg>`,
);

const fav16 = await png(iconSvg({ px: 16, size: 'small' }), 16);
const fav32 = await png(iconSvg({ px: 32, size: 'small' }), 32);
const fav48 = await png(iconSvg({ px: 48, size: 'small' }), 48);
await emit(out, 'favicon-16x16.png', fav16);
await emit(out, 'favicon-32x32.png', fav32);

// ICO with embedded PNGs (16, 32, 48)
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const dir = Buffer.alloc(16 * images.length);
  let offset = 6 + dir.length;
  images.forEach(({ size, data }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o);
    dir.writeUInt8(size >= 256 ? 0 : size, o + 1);
    dir.writeUInt8(0, o + 2);
    dir.writeUInt8(0, o + 3);
    dir.writeUInt16LE(1, o + 4);
    dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(data.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += data.length;
  });

  return Buffer.concat([header, dir, ...images.map((im) => im.data)]);
}
await emit(
  out,
  'favicon.ico',
  ico([
    { size: 16, data: fav16 },
    { size: 32, data: fav32 },
    { size: 48, data: fav48 },
  ]),
);

// iOS: full-bleed paper, the OS rounds the corners
await emit(
  out,
  'apple-touch-icon.png',
  await png(
    iconSvg({ px: 180, fit: 0.86, bg: L.paper, tile: false, bleed: true }),
    180,
  ),
);

// Android / PWA: the mark keeps its own paper tile on transparency
for (const px of [48, 144, 192, 256, 512]) {
  await emit(
    out,
    `android-chrome-${px}x${px}.png`,
    await png(
      iconSvg({ px, size: px < 64 ? 'small' : 'full', bleed: px >= 144 }),
      px,
    ),
  );
}
// Maskable: the book inside the 80% safe zone on full-bleed paper
for (const px of [192, 512]) {
  await emit(
    out,
    `android-chrome-${px}x${px}-maskable.png`,
    await png(
      iconSvg({ px, fit: 0.72, bg: L.paper, tile: false, bleed: true }),
      px,
    ),
  );
}

await emit(
  out,
  'mstile-150x150.png',
  await png(
    iconSvg({ px: 150, fit: 0.72, bg: L.paper, tile: false, bleed: true }),
    150,
  ),
);

// ------------------------------------------------------------------ banners

const BRUSH =
  'M0 4.6 C 40 3.2, 120 2.6, 200 3.6 L 200 4.4 C 120 5.6, 40 5.4, 0 4.9 Z';

/** Laid paper: fibres + laid lines + two chain lines, deterministic. */
function laidPaper(w, h, ink, alpha = 1) {
  const chains = [w * 0.25, w * 0.75].map((x) => `M${f(x)} 0V${h}`).join('');

  return `<defs><filter id="fibre" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.5" numOctaves="2" seed="7" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.15 0 0 0 0 0.13 0 0 0 0 0.11 0 0 0 ${0.06 * alpha} 0"/></filter><pattern id="laid" width="${w}" height="3" patternUnits="userSpaceOnUse"><path d="M0 .5H${w}" stroke="${ink}" stroke-opacity="${0.035 * alpha}"/></pattern></defs><rect width="${w}" height="${h}" filter="url(#fibre)"/><rect width="${w}" height="${h}" fill="url(#laid)"/><path d="${chains}" stroke="${ink}" stroke-opacity="${0.028 * alpha}"/>`;
}

/** Share card: the book drawn straight on the paper, wordmark and a real haiku beside it. */
function bannerSvg(W, H) {
  const pad = Math.round(H * 0.1);
  const markPx = Math.round(H * 0.74);
  const mx = pad;
  const my = Math.round((H - markPx) / 2);
  const tx = mx + markPx + Math.round(W * 0.06);
  const wordSize = Math.round(H * 0.17);
  const word = textPath(font, 'GutenKu', {
    x: tx,
    y: Math.round(H * 0.4),
    size: wordSize,
  });
  const tag = textPath(font, 'Old books, new haiku.', {
    x: tx + 3,
    y: Math.round(H * 0.4 + wordSize * 0.9),
    size: Math.round(H * 0.058),
  });
  const lines = [
    'Lines from old novels',
    'cut and set as a haiku,',
    'signed with a red stamp.',
  ];
  // The haiku's stepped indent: second line deepest, third halfway
  const VERSE_INDENTS = [0, 2, 1];
  const lineSize = Math.round(H * 0.04);
  const ly = Math.round(H * 0.4 + wordSize * 0.9 + H * 0.12);
  const verse = lines
    .map(
      (l, i) =>
        textPath(font, l, {
          x: tx + 3 + VERSE_INDENTS[i] * lineSize,
          y: ly + i * lineSize * 1.7,
          size: lineSize,
        }).d,
    )
    .join('');
  const urlText = textPath(font, 'gutenku.xyz', {
    x: tx + 3,
    y: H - pad * 0.9,
    size: Math.round(H * 0.034),
  });
  const ruleY = Math.round(H * 0.4 + wordSize * 0.25);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${L.paper}"/>
  ${laidPaper(W, H, SUMI)}
  <defs>${BLEED}</defs>
  <g transform="translate(${mx} ${my}) scale(${markPx / 100})">${markSvg({ size: 'full', colors: L, tile: false, filter: 'bleed' })}</g>
  <path d="${word.d}" fill="${SUMI}"/>
  <g transform="translate(${tx} ${ruleY}) scale(${f((word.width * 1.02) / 200)} 2.4)"><path d="${BRUSH}" fill="${SUMI}" opacity="0.5"/></g>
  <path d="${tag.d}" fill="${INK_SOFT}"/>
  <path d="${verse}" fill="${SUMI}" opacity="0.85"/>
  <path d="${urlText.d}" fill="${INK_SOFT}"/>
</svg>`;
}

await emit(
  out,
  'og-image.png',
  await sharp(Buffer.from(bannerSvg(1200, 630)))
    .png({ compressionLevel: 9 })
    .toBuffer(),
);
// GitHub social preview (Settings → Social preview), 1280×640
const repoAssets = join(repo, 'assets/img');
mkdirSync(repoAssets, { recursive: true });
await emit(
  repoAssets,
  'social-preview.png',
  await sharp(Buffer.from(bannerSvg(1280, 640)))
    .png({ compressionLevel: 9 })
    .toBuffer(),
);

// ------------------------------------------------------------------ capacitor sources
// Same names and pixel sizes as packages/front/resources (1024 icons, 2732 splash).

const resOut = join(front, 'resources');
mkdirSync(resOut, { recursive: true });

await emit(
  resOut,
  'icon-only.png',
  await png(
    iconSvg({ px: 1024, fit: 0.84, bg: L.paper, tile: false, bleed: true }),
    1024,
  ),
);
// Adaptive foreground: within the central 66% safe zone, transparent
await emit(
  resOut,
  'icon-foreground.png',
  await png(iconSvg({ px: 1024, fit: 0.66, tile: false, bleed: true }), 1024),
);
await emit(
  resOut,
  'icon-background.png',
  await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: L.paper },
  })
    .png()
    .toBuffer(),
);

function splashSvg(colors) {
  const S = 2732;
  const markPx = 620;
  const size = 120;
  const word = textPath(font, 'GutenKu', { size });
  const placed = textPath(font, 'GutenKu', {
    x: (S - word.width) / 2,
    y: S / 2 + markPx / 2 + 40 + size * 0.75,
    size,
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}"><defs>${BLEED}</defs>
  <rect width="${S}" height="${S}" fill="${colors.paper}"/>
  <g transform="translate(${(S - markPx) / 2} ${(S - markPx) / 2 - 60}) scale(${markPx / 100})">${markSvg({ size: 'full', colors, tile: false, filter: 'bleed' })}</g>
  <path d="${placed.d}" fill="${colors === D ? SUMI_NIGHT : SUMI}"/>
</svg>`;
}

await emit(
  resOut,
  'splash.png',
  await sharp(Buffer.from(splashSvg(L)))
    .png({ compressionLevel: 9 })
    .toBuffer(),
);
await emit(
  resOut,
  'splash-dark.png',
  await sharp(Buffer.from(splashSvg(D)))
    .png({ compressionLevel: 9 })
    .toBuffer(),
);

console.log(`Wrote ${written.length} files:\n  ${written.join('\n  ')}`);
