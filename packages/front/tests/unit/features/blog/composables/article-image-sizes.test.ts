// @vitest-environment node
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import sizes from '@/features/blog/composables/article-image-sizes.json';

const DIR = resolve(process.cwd(), 'public/article');

// Regenerate with `pnpm generate:image-sizes` after adding or changing one
describe('article image sizes', () => {
  it('knows every article image, at its real size', async () => {
    const files = readdirSync(DIR).filter((f) => /\.(webp|png|jpe?g)$/.test(f));

    for (const file of files) {
      const { width, height } = await sharp(resolve(DIR, file)).metadata();

      expect((sizes as Record<string, number[]>)[`/article/${file}`]).toEqual([
        width,
        height,
      ]);
    }
  });
});
