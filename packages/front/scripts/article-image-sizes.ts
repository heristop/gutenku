// Measures every article image so the rendered <img> can carry its width and
// height: the browser then reserves the plate before it loads, and the text
// never jumps under the reader. Run after adding or changing an image:
//   pnpm generate:image-sizes

import { readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';

const ROOT = resolve(import.meta.dirname, '..');
const DIR = resolve(ROOT, 'public/article');
const OUT = resolve(
  ROOT,
  'src/features/blog/composables/article-image-sizes.json',
);

const files = readdirSync(DIR)
  .filter((file) => /\.(webp|png|jpe?g)$/.test(file))
  .sort();
const sizes: Record<string, [number, number]> = {};

for (const file of files) {
  const { width, height } = await sharp(resolve(DIR, file)).metadata();

  if (width && height) {
    sizes[`/article/${file}`] = [width, height];
  }
}

writeFileSync(OUT, `${JSON.stringify(sizes, null, 2)}\n`);
console.log(`${Object.keys(sizes).length} article images measured`);
