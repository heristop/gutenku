#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read .env file manually
const envPath = path.join(__dirname, '../../server/.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach((line) => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim().replaceAll(/^["']|["']$/g, '');
  }
});

const OPENAI_API_KEY = envVars.OPENAI_API_KEY;

const banners = [
  {
    name: 'GutenGuess',
    output: 'sumi-e-books.png',
    prompt: `Japanese sumi-e ink wash painting: Scholar contemplating an open book, stack of antique books beside them. Pine branch in background with falling leaves. Traditional brushwork with simple flowing lines. Generous negative space. Monochromatic warm sepia/cream tones with subtle ink gradients. Light, minimal composition. Horizontal banner format.`,
  },
  {
    name: 'GutenKu',
    output: 'sumi-e-haiku.png',
    prompt: `Japanese sumi-e ink wash painting: Person writing with calligraphy brush on paper. Ink stone nearby. Bamboo leaves on one side, crescent moon above. Cherry blossom petals floating gently. Traditional brushwork with simple flowing lines. Generous negative space. Monochromatic warm sepia/cream tones with subtle ink gradients. Light, minimal composition. Horizontal banner format.`,
  },
];

async function generateBanner(banner) {
  console.log(`\n🎨 Generating ${banner.name} banner...`);
  console.log(`📝 Output: ${banner.output}`);

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1.5',
      prompt: banner.prompt,
      n: 1,
      size: '1536x1024',
      quality: 'high',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error for ${banner.name}: ${error}`);
  }

  const data = await response.json();
  const imageData = data.data[0];
  const outputPath = path.join(__dirname, '../src/assets/img/', banner.output);

  if (imageData.b64_json) {
    fs.writeFileSync(outputPath, Buffer.from(imageData.b64_json, 'base64'));
  } else if (imageData.url) {
    const imageResponse = await fetch(imageData.url);
    fs.writeFileSync(
      outputPath,
      Buffer.from(await imageResponse.arrayBuffer()),
    );
  }

  console.log(`✅ Saved: ${outputPath}`);

  // Generate WebP versions
  await generateWebp(outputPath, banner.output);

  return outputPath;
}

async function generateWebp(pngPath, filename) {
  const baseName = filename.replace('.png', '');
  const dir = path.dirname(pngPath);
  const sizes = baseName.includes('haiku') ? [1024, 640, 320] : [640, 320];

  console.log(`🔄 Converting to WebP...`);

  // Main WebP
  const mainWebp = path.join(dir, `${baseName}.webp`);
  execSync(`cwebp -q 85 "${pngPath}" -o "${mainWebp}"`, { stdio: 'pipe' });
  console.log(`   ✅ ${baseName}.webp`);

  // Responsive sizes
  for (const size of sizes) {
    const resizedWebp = path.join(dir, `${baseName}-${size}.webp`);
    execSync(`cwebp -q 85 -resize ${size} 0 "${pngPath}" -o "${resizedWebp}"`, {
      stdio: 'pipe',
    });
    console.log(`   ✅ ${baseName}-${size}.webp`);
  }
}

async function main() {
  console.log('🖼️  Card Banner Generator');
  console.log('========================');

  // Sequential generation
  for (const banner of banners) {
    await generateBanner(banner);
  }

  console.log('\n🎉 All banners generated with WebP variants!');
}

main().catch(console.error);
