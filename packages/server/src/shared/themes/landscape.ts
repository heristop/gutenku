import Canvas from 'canvas';
import { HaikuValue } from '../types';

export default {
    async create(haiku: HaikuValue): Promise<Canvas.Canvas> {
        const verses = haiku.verses;
        Canvas.registerFont('./src/shared/assets/fonts/IndieFlower-Regular.ttf', { family: 'IndieFlower' });

        const canvas = Canvas.createCanvas(2400, 2400);
        const ctx = canvas.getContext('2d');

        const imagePath =  './src/shared/assets/themes/landscape/background.png';

        const background = new Canvas.Image();
        background.src = imagePath;

        ctx.globalAlpha = 1;
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        ctx.globalAlpha = 0.7;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Set the font
        ctx.font = '130px IndieFlower';
        ctx.fillStyle = '#2F5D62';

        // Draw the text
        ctx.globalAlpha = 1;

        const x = 244;
        let y = canvas.height / 3.6;
        verses.map(verse => {
            ctx.fillText(verse, x, y);
            y = y + 440;
        });

        // Load the logo
        const logo = new Canvas.Image();
        logo.src = './src/shared/assets/themes/landscape/gutenku.png';

        // Draw the logo
        ctx.globalAlpha = 0.25;
        ctx.drawImage(
            logo,
            canvas.width - logo.width - 60,
            canvas.height - logo.height - 200,
            logo.width * 0.6,
            logo.height * 0.6
        );
        ctx.globalAlpha = 1;

        // Draw signature
        ctx.font = '134px IndieFlower';
        ctx.globalAlpha = 0.6;
        ctx.fillText('- GutenKu', canvas.width - 784, canvas.height - 240);

        return canvas;
    }
}
