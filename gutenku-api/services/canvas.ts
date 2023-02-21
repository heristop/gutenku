import Canvas from 'canvas';
import fs from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { readdir } from 'fs/promises';

const PATH = './.cache/haiku_generated.png';

export default {
    async createPng(verses: string[]) {
        const canvas = Canvas.createCanvas(1200, 1200);
        const ctx = canvas.getContext('2d');

        const folderPath = './src/assets/img/background';
        const files = await readdir(folderPath);

        const randomIndex = Math.floor(Math.random() * files.length);
        const randomFile = files[randomIndex];
        const imagePath = join(folderPath, randomFile);

        const background = new Canvas.Image();
        background.src = imagePath;

        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Load the logo
        const logo = new Canvas.Image();
        logo.src = './src/assets/img/logo.png/gutenku_white.png';

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
        ctx.font = '56px Garamond, Georgia, serif';
        ctx.fillStyle = '#fff';

        // Draw the text
        ctx.globalAlpha = 0.8;

        const x = 122;
        let y = canvas.height / 3.5;
        verses.map(verse => {
            ctx.fillText(verse, x, y);
            y = y + 220;
        });

        // Save the image
        const stream = canvas.createPNGStream();
        const out = fs.createWriteStream(PATH);

        stream.pipe(out);
        out.on('finish', async () => {
            // Image generated
        });
    },

    async readPng() {
        const readFile = promisify(fs.readFile);
        const data = await readFile(PATH);

        return {
            data: data,
            contentType: 'image/png',
        };
    }
}
