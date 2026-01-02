#!/usr/bin/env node
/**
 * One-shot script to optimize all PNG images in packages/front/public
 * - Generates responsive WebP variants for gutenmage.png
 * - Generates og-image.png (1200x630) from gutenmage.png for SEO
 * - Optimizes large OG images to WebP variants
 */

import sharp from 'sharp';
import { stat } from 'node:fs/promises';
import { join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PUBLIC_DIR = join(__dirname, '../public');

// Configuration for responsive images
const responsiveConfigs = [
  {
    source: 'gutenmage.png',
    widths: [320, 640, 1024],
    quality: 85,
  },
];

// OG Image generation config (1200x630 is standard OG size)
const ogImageConfig = {
  source: 'gutenmage.png',
  output: 'og-image.png',
  width: 1200,
  height: 630,
};

async function generateResponsiveWebP(config) {
  const sourcePath = join(PUBLIC_DIR, config.source);
  const name = basename(config.source, extname(config.source));

  try {
    const originalStats = await stat(sourcePath);
    console.log(
      `\n📸 Processing ${config.source} (${(originalStats.size / 1024).toFixed(1)} KB)`,
    );

    // Generate base WebP
    const baseWebpPath = join(PUBLIC_DIR, `${name}.webp`);
    await sharp(sourcePath)
      .webp({ quality: config.quality })
      .toFile(baseWebpPath);
    const baseStats = await stat(baseWebpPath);
    console.log(`  → ${name}.webp (${(baseStats.size / 1024).toFixed(1)} KB)`);

    // Generate responsive variants
    for (const width of config.widths) {
      const outputPath = join(PUBLIC_DIR, `${name}-${width}.webp`);
      await sharp(sourcePath)
        .resize(width, null, { withoutEnlargement: true })
        .webp({ quality: config.quality })
        .toFile(outputPath);

      const newStats = await stat(outputPath);
      console.log(
        `  → ${name}-${width}.webp (${(newStats.size / 1024).toFixed(1)} KB)`,
      );
    }
  } catch (error) {
    console.error(`  ❌ Error processing ${config.source}:`, error.message);
  }
}

async function generateOgImage() {
  const sourcePath = join(PUBLIC_DIR, ogImageConfig.source);
  const outputPath = join(PUBLIC_DIR, ogImageConfig.output);

  try {
    const originalStats = await stat(sourcePath);
    console.log(`\n🖼️  Generating OG image from ${ogImageConfig.source}`);
    console.log(`   Source: ${(originalStats.size / 1024).toFixed(1)} KB`);

    const resizeOptions = {
      width: ogImageConfig.width,
      height: ogImageConfig.height,
      fit: 'cover',
      position: 'center',
    };

    // Create OG image with proper aspect ratio (1200x630)
    await sharp(sourcePath)
      .resize(resizeOptions)
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(outputPath);

    const newStats = await stat(outputPath);
    console.log(
      `  → ${ogImageConfig.output} (${(newStats.size / 1024).toFixed(1)} KB)`,
    );
    console.log(
      `   Dimensions: ${ogImageConfig.width}x${ogImageConfig.height}`,
    );
  } catch (error) {
    console.error(`  ❌ Error generating OG image:`, error.message);
  }
}

async function main() {
  console.log('🚀 Public Images Optimizer');
  console.log('==========================');

  // 1. Generate OG image from gutenmage.png
  await generateOgImage();

  // 2. Generate responsive WebP variants
  for (const config of responsiveConfigs) {
    await generateResponsiveWebP(config);
  }

  console.log('\n✅ All images optimized!');
  console.log('\n📋 Summary of generated files:');
  console.log('   - og-image.png (1200x630) - SEO meta image for all pages');
  console.log('   - gutenmage.webp + responsive variants (320/640/1024)');
}

main().catch(console.error);
