import { readdir } from 'fs/promises';
import { join } from 'path';
import Canvas from 'canvas';
import { HaikuValue } from '../types';

export default {
    async create(haiku: HaikuValue): Promise<Canvas.Canvas> {
        const verses = haiku.verses;
        Canvas.registerFont('./src/assets/fonts/JMH Typewriter.ttf', { family: 'Typewriter' });

        const canvas = Canvas.createCanvas(1200, 1200);
        const ctx = canvas.getContext('2d');

        const folderPath = './src/shared/assets/themes/paper/backgrounds';
        const files = await readdir(folderPath);

        const randomIndex = Math.floor(Math.random() * files.length);
        const randomFile = files[randomIndex];
        const imagePath = join(folderPath, randomFile);

        const background = new Canvas.Image();
        background.src = imagePath;
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Load the logo
        const logo = new Canvas.Image();
        logo.src = './src/shared/assets/themes/paper/logo/gutenku_white.png';

        // Draw the logo
        ctx.globalAlpha = 0.25;
        ctx.drawImage(
            logo,
            canvas.width - logo.width - 10,
            canvas.height - logo.height - 10,
            logo.width,
            logo.height
        );
        ctx.globalAlpha = 1;

        // Set the font and background color
        ctx.font = '56px Typewriter';
        ctx.fillStyle = '#fff';

        // Draw the text
        ctx.globalAlpha = 0.8;

        const x = 122;
        let y = canvas.height / 3.5;
        verses.map(verse => {
            ctx.fillText(verse, x, y);
            y = y + 220;
        });

        return canvas;
    }
}
