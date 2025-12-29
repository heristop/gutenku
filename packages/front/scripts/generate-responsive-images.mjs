#!/usr/bin/env node
import sharp from 'sharp';
import { readdir, stat } from 'node:fs/promises';
import { join, basename, extname } from 'node:path';

const ASSETS_DIR = new URL('../src/assets/img', import.meta.url).pathname;

// Image configurations: source file -> target widths
const imageConfigs = [
  // Background images - need multiple sizes for different screens
  { file: 'zen-bg-light.webp', widths: [640, 1024, 1920] },
  { file: 'zen-bg-dark.webp', widths: [640, 1024, 1920] },
  // Content images - smaller range
  { file: 'sumi-e-haiku.webp', widths: [320, 640, 1024] },
  { file: 'sumi-e-books.webp', widths: [320, 640] },
];

async function generateResponsiveImages() {
  console.log('Generating responsive image variants...\n');

  for (const config of imageConfigs) {
    const sourcePath = join(ASSETS_DIR, config.file);
    const name = basename(config.file, extname(config.file));

    try {
      const originalStats = await stat(sourcePath);
      console.log(
        `Processing ${config.file} (${(originalStats.size / 1024).toFixed(1)} KB):`,
      );

      for (const width of config.widths) {
        const outputPath = join(ASSETS_DIR, `${name}-${width}.webp`);

        await sharp(sourcePath)
          .resize(width, null, { withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(outputPath);

        const newStats = await stat(outputPath);
        console.log(
          `  → ${name}-${width}.webp (${(newStats.size / 1024).toFixed(1)} KB)`,
        );
      }
      console.log('');
    } catch (error) {
      console.error(`  Error processing ${config.file}:`, error.message);
    }
  }

  console.log('Done!');
}

generateResponsiveImages();
