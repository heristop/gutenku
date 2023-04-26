import fs from "fs";
import { promisify } from "util";
import Canvas from "canvas";
import greentea from "./themes/greentea";
import colored from "./themes/colored";

export default class CanvasService {
    private readonly DATA_DIRECTORY = "./data";
    private theme: string;

    constructor(theme: string) {
        this.theme = theme;
    }

    async create(verses: string[]): Promise<string> {
        let canvas: Canvas.Canvas;

        try {
            if ("colored" === this.theme) {
                canvas = await colored.create(verses);
            }

            if ("greentea" === this.theme) {
                canvas = await greentea.create(verses);
            }
        } catch (err) {
            console.log(err);
        }

        // Save the image
        return await this.save(canvas);
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
