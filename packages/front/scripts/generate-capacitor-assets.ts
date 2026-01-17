import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESOURCES_DIR = join(__dirname, '../resources');
const ASSETS_DIR = join(__dirname, '../src/assets/img/logo');
const BACKGROUND_COLOR = '#2f5d62';

async function generateAssets() {
  await mkdir(RESOURCES_DIR, { recursive: true });

  console.log('Generating Capacitor assets...');

  // 1. Generate icon-only.png (1024x1024) from gutenku_rounded.png
  await sharp(join(ASSETS_DIR, 'gutenku_rounded.png'))
    .resize(1024, 1024, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(join(RESOURCES_DIR, 'icon-only.png'));
  console.log('  ✓ icon-only.png');

  // 2. Generate icon-foreground.png (1024x1024) - same as icon with padding for adaptive
  await sharp(join(ASSETS_DIR, 'gutenku_rounded.png'))
    .resize(768, 768, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .extend({
      top: 128,
      bottom: 128,
      left: 128,
      right: 128,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(join(RESOURCES_DIR, 'icon-foreground.png'));
  console.log('  ✓ icon-foreground.png');

  // 3. Generate icon-background.png (1024x1024) - solid teal
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: BACKGROUND_COLOR,
    },
  })
    .png()
    .toFile(join(RESOURCES_DIR, 'icon-background.png'));
  console.log('  ✓ icon-background.png');

  // 4. Generate splash.png (2732x2732) - full logo centered on teal background
  const logo = await sharp(join(ASSETS_DIR, 'gutenku-logo.png'))
    .resize(1200, 1200, {
      fit: 'inside',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  await sharp({
    create: {
      width: 2732,
      height: 2732,
      channels: 4,
      background: BACKGROUND_COLOR,
    },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(join(RESOURCES_DIR, 'splash.png'));
  console.log('  ✓ splash.png');

  // 5. Generate splash-dark.png (same as splash for now)
  await sharp({
    create: {
      width: 2732,
      height: 2732,
      channels: 4,
      background: BACKGROUND_COLOR,
    },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(join(RESOURCES_DIR, 'splash-dark.png'));
  console.log('  ✓ splash-dark.png');

  console.log('\n✓ Capacitor assets generated in resources/');
}

generateAssets().catch(console.error);
