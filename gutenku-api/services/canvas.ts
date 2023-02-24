import Canvas from 'canvas';
import fs from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { readdir } from 'fs/promises';

const CACHE_DIRECTORY = './.cache';

export default {
    async create(verses: string[]): Promise<string> {
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
        return await this.save(canvas);
    },

    save(canvas: Canvas.Canvas) {
        return new Promise<string>(resolve => {
            const imagePath = `${CACHE_DIRECTORY}/haiku_${(Math.random() + 1).toString(36).substring(7)}.jpg`;

            const stream = canvas.createJPEGStream();
            const out = fs.createWriteStream(imagePath);

            stream.pipe(out);
            out.on('finish', () => {
                console.log(`Image ${imagePath} created!`);

                resolve(imagePath);
            });
        });
    },

    async read(imagePath: string) {
        const readFile = promisify(fs.readFile);
        const data = await readFile(imagePath);

        return {
            data: data,
            contentType: 'image/jpeg',
        };
    }
}


