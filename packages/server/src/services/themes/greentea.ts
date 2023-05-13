import { readdir } from 'fs/promises';
import { join } from 'path';
import Canvas from 'canvas';
import { HaikuValue } from '../../types';

export default {
    async create(haiku: HaikuValue): Promise<Canvas.Canvas> {
        const { verses } = haiku;
        Canvas.registerFont('./src/assets/fonts/JMH Typewriter.ttf', { family: 'Typewriter' });

        const canvas = Canvas.createCanvas(2400, 2400);
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
        ctx.font = '112px Typewriter';
        ctx.fillStyle = '#2F5D62';

        // Draw the text
        ctx.globalAlpha = 0.84;

        const x = 244;
        let y = canvas.height / 3.6;
        verses.map(verse => {
            ctx.fillText(verse, x, y);
            y = y + 440;
        });

        // Load decor
        const decor = new Canvas.Image();
        decor.src = './src/assets/themes/greentea/decoration/torn_paper.png';

        // Draw decor
        ctx.globalAlpha = 1.0;
        ctx.drawImage(decor, 0, 0, canvas.width, canvas.height);

        // Load pic
        const logo = new Canvas.Image();
        logo.src = await this.catchNaturePic();

        // Draw pic
        ctx.globalAlpha = 0.92;
        ctx.drawImage(
            logo,
            canvas.width - logo.width - 100,
            canvas.height - logo.height - 300,
            logo.width / 1.2,
            logo.height / 1.2
        );

        // Draw signature
        ctx.font = '108px Typewriter';
        ctx.globalAlpha = 0.6;
        ctx.fillText('- GutenKu', canvas.width - 750, canvas.height - 250);

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
