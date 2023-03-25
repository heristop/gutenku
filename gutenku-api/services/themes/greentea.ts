import { readdir } from 'fs/promises';
import { join } from 'path';
import Canvas from 'canvas';

export default {
    async create(verses: string[]): Promise<Canvas.Canvas> {
        Canvas.registerFont('./src/assets/fonts/JMH Typewriter.ttf', { family: 'Typewriter' });

        const canvas = Canvas.createCanvas(1200, 1200);
        const ctx = canvas.getContext('2d');

        const folderPath = './src/assets/themes/greentea/backgrounds';
        const files = await readdir(folderPath);

        const randomIndex = Math.floor(Math.random() * files.length);
        const randomFile = files[randomIndex];
        const imagePath = join(folderPath, randomFile);

        const background = new Canvas.Image();
        background.src = imagePath;

        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Set the font and background color
        ctx.font = '56px Typewriter';
        ctx.fillStyle = '#2F5D62';

        // Draw the text
        ctx.globalAlpha = 0.84;

        const x = 122;
        let y = canvas.height / 3.6;
        verses.map(verse => {
            ctx.fillText(verse, x, y);
            y = y + 220;
        });

        // Load pic
        const logo = new Canvas.Image();
        logo.src = await this.catchNaturePic();

        // Draw pic
        ctx.globalAlpha = 0.95;
        ctx.drawImage(
            logo,
            canvas.width - logo.width + 150,
            canvas.height - logo.height + 90,
            logo.width / 2,
            logo.height / 2
        );

        // Draw signature
        ctx.font = '54px Typewriter';
        ctx.globalAlpha = 0.6;
        ctx.fillText('GutenKu.', canvas.width - 350, canvas.height - 100);

        return canvas;
    },

    async catchNaturePic() {
        const folderPath = './src/assets/themes/greentea/nature';
        const files = await readdir(folderPath);

        const randomIndex = Math.floor(Math.random() * files.length);
        const randomFile = files[randomIndex];

        return join(folderPath, randomFile);
    }
}
