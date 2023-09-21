import fs from 'fs';
import Canvas from 'canvas';
import { promisify } from 'util';
import { singleton } from 'tsyringe';
import { HaikuValue } from '../../shared/types';
import colored from '../../shared/themes/colored';
import greentea from '../../shared/themes/greentea';
import watermark from '../../shared/themes/watermark';

@singleton()
export default class CanvasService {
    private readonly DATA_DIRECTORY = "./data";
    private theme: string;

    useTheme(theme: string): void {
        this.theme = theme;
    }

    async create(haiku: HaikuValue): Promise<string> {
        let createCanvas = null;

        switch (this.theme) {
        case 'colored':
            createCanvas = colored.create;
            break;
        case 'greentea':
            createCanvas = greentea.create;
            break;
        case 'watermark':
            createCanvas = watermark.create;
            break;
        default:
            throw new Error(`Unsupported theme: ${this.theme}`);
        }

        try {
            const canvas = await createCanvas(haiku);

            // Save the image
            return this.save(canvas);
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async save(canvas: Canvas.Canvas): Promise<string> {
        return new Promise<string>((resolve) => {
            const imagePath = `${this.DATA_DIRECTORY}/haiku_${(Math.random() + 1)
                .toString(36)
                .substring(7)}.jpg`;

            const stream = canvas.createJPEGStream();
            const out = fs.createWriteStream(imagePath);

            stream.pipe(out);
            out.on("finish", () => {
                console.log(`Image ${imagePath} created!`);

                resolve(imagePath);
            });
        });
    }

    async read(
        imagePath: string
    ): Promise<{ data: Buffer; contentType: string }> {
        const readFile = promisify(fs.readFile);
        const data = await readFile(imagePath);

        return {
            data: data,
            contentType: "image/jpeg",
        };
    }
}
