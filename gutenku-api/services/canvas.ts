import Canvas from 'canvas';
import fs from 'fs';
import { promisify } from 'util';

const PATH = './.cache/haiku_generated.png';

export default {
    async createPng(verses: string[]) {
        const canvas = Canvas.createCanvas(1200, 1200);
        const ctx = canvas.getContext('2d');

        // Set the color for the background rectangle
        //const colors = ['#0A2647', '#144272', '#205295', '#2C74B3'];
        //const colors = ['#fcbb6d', '#d8737f', '#ab6c82', '#685d79', '#475c7a'];
        const colors = [
            '#E57373', '#F48FB1', '#CE93D8',
            '#D1C4E9', '#9FA8DA', '#90CAF9',
            '#81D4FA', '#80CBC4', '#A5D6A7',
            '#BCAAA4',
        ];

        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];

        // Draw the background rectangle
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const background = new Canvas.Image();
        background.src = './src/assets/img/pf-s100-a02-mockup_blue.jpg';
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Load the logo
        const logo = new Canvas.Image();
        logo.src = './src/assets/img/logo.png/gutenku_white.png';

        // Draw the logo
        ctx.globalAlpha = 0.2;
        ctx.drawImage(logo, canvas.width - logo.width - 10, canvas.height - logo.height - 10, logo.width, logo.height);
        ctx.globalAlpha = 1;

        // Set the font and background color
        ctx.font = '56px Garamond';
        ctx.fillStyle = '#fff';

        // Draw the text
        ctx.globalAlpha = 0.8;

        const x = 120;
        let y = canvas.height / 3.5;
        verses.map(verse => {
            ctx.fillText(verse, x, y);
            y = y + 220;
        });

        // Set transparency value
        //ctx.globalAlpha = 0.02;
        // Draw transparent circles
        //for (let i = 0; i < 9; i++) {
        //    ctx.beginPath();
        //    ctx.arc(750, 750, 100 + 100 * i, 0, Math.PI * 2, true);
        //    ctx.fill();
        //}

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
