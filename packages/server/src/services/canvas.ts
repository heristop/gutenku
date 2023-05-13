import fs from "fs";
import { promisify } from "util";
import Canvas from "canvas";
import { HaikuValue } from "../types";
import colored from "./themes/colored";
import greentea from "./themes/greentea";
import watermark from "./themes/watermark";

export default class CanvasService {
    private readonly DATA_DIRECTORY = "./data";
    private theme: string;

    constructor(theme: string) {
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
