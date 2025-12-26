import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const OpenAI = require('openai').default;
import Canvas from 'canvas';
import type { HaikuValue } from '~/shared/types';

export default {
  async create(haiku: HaikuValue): Promise<Canvas.Canvas> {
    const verses = haiku.verses;
    Canvas.registerFont('./src/shared/assets/fonts/IndieFlower-Regular.ttf', {
      family: 'IndieFlower',
    });

    const canvas = Canvas.createCanvas(2400, 2400);
    const ctx = canvas.getContext('2d');

    const backgroundImageData = await generateImageWithGPTImage1(haiku);
    const background = await Canvas.loadImage(backgroundImageData);

    ctx.globalAlpha = 1;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalAlpha = 0.7;
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#DFEEEA';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalAlpha = 0.6;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set the font
    ctx.font = '130px IndieFlower';
    ctx.fillStyle = '#2F5D62';

    // Draw the text
    ctx.globalAlpha = 1;

    const x = 244;
    let y = canvas.height / 3.6;
    verses.map((verse) => {
      ctx.fillText(verse, x, y);
      y += 440;
    });

    // Draw signature
    ctx.font = '134px IndieFlower';
    ctx.globalAlpha = 0.6;
    ctx.fillText('- GutenKu', canvas.width - 784, canvas.height - 240);

    return canvas;
  },
};

async function generateImageWithGPTImage1(haiku: HaikuValue): Promise<Buffer> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Prompt for GPT-Image-1
  const prompt = `Create a serene traditional Japanese landscape inspired by this haiku: "${haiku.verses.join(' / ')}"

Style: Traditional Japanese art, peaceful atmosphere, soft colors, minimalist composition
Elements: Nature scenes that reflect the mood and imagery of the haiku
Quality: High artistic quality with attention to traditional Japanese aesthetics`;

  const response = await openai.images.generate({
    model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1.5',
    n: 1,
    output_format: 'png',
    prompt: prompt,
    quality: process.env.OPENAI_IMAGE_QUALITY || 'high',
    size: '1024x1024',
    user: 'gutenku-haiku-generator',
  });

  // GPT-Image-1 always returns base64-encoded images
  const imageBase64 = response.data[0].b64_json;

  if (!imageBase64) {
    throw new Error('No image data returned from GPT-Image-1 API');
  }

  // Convert base64 to Buffer for Canvas.loadImage
  return Buffer.from(imageBase64, 'base64');
}
