import OpenAI from 'openai';
import Canvas from 'canvas';
import { HaikuValue } from '../types';

export default {
  async create(haiku: HaikuValue): Promise<Canvas.Canvas> {
    const verses = haiku.verses;
    Canvas.registerFont('./src/shared/assets/fonts/IndieFlower-Regular.ttf', {
      family: 'IndieFlower',
    });

    const canvas = Canvas.createCanvas(2400, 2400);
    const ctx = canvas.getContext('2d');

    const background = await Canvas.loadImage(await generateImage(haiku));

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
      y = y + 440;
    });

    // Draw signature
    ctx.font = '134px IndieFlower';
    ctx.globalAlpha = 0.6;
    ctx.fillText('- GutenKu', canvas.width - 784, canvas.height - 240);

    return canvas;
  },
};

async function generateImage(haiku: HaikuValue): Promise<string> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `Generate a traditional Japanese landscape inspired by the following haiku: "${haiku.verses.join(' ')}"`;

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: prompt,
    n: 1,
    size: '1024x1024',
  });

  const imageUrl = response.data[0].url;

  if (typeof imageUrl === 'undefined') {
    throw new Error('No image URL returned from DALL-E API');
  }

  return imageUrl;
}
