#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read .env file manually
const envPath = path.join(__dirname, '../packages/server/.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach((line) => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }
});

const OPENAI_API_KEY = envVars.OPENAI_API_KEY;

const banners = [
  {
    name: 'GutenGuess',
    output: 'sumi-e-books.png',
    prompt: `A charming hand-drawn illustration for a literary guessing game.

Scene: A cozy reading nook with a person holding an open classic book, surrounded by floating question marks, book icons, theater masks, and a glowing lightbulb moment. Stacks of vintage books nearby.

Style: Minimalist hand-drawn sketch style with clean black outlines. Warm sepia and cream color palette with subtle terracotta/rust accent colors. Soft, cozy aesthetic inspired by vintage bookshops.

Composition: Horizontal banner format. Light cream/beige background. No text.

Mood: Intellectual, playful, warm - the joy of literary discovery and guessing games.`,
  },
  {
    name: 'GutenKu',
    output: 'sumi-e-haiku.png',
    prompt: `A charming hand-drawn illustration for a haiku poetry generator.

Scene: A serene zen moment - a person with a calligraphy brush writing on paper, surrounded by floating cherry blossom petals, bamboo leaves, a crescent moon, and gentle ink brush strokes. A small ink stone nearby.

Style: Minimalist hand-drawn sketch style with clean black outlines. Warm sepia and cream color palette with subtle terracotta/rust accent colors. Soft, contemplative aesthetic inspired by Japanese zen gardens.

Composition: Horizontal banner format. Light cream/beige background. No text.

Mood: Zen, poetic, peaceful - the tranquility of haiku creation and nature.`,
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
  const outputPath = path.join(
    __dirname,
    '../packages/front/src/assets/img/',
    banner.output,
  );

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
  return outputPath;
}

async function main() {
  console.log('🖼️  Card Banner Generator');
  console.log('========================');

  // Sequential generation
  for (const banner of banners) {
    await generateBanner(banner);
  }

  console.log('\n🎉 All banners generated!');
  console.log('\n📦 Next step: Run responsive image generation:');
  console.log('   node packages/front/scripts/generate-responsive-images.mjs');
}

main().catch(console.error);
