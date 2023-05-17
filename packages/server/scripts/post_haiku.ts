import dotenv from "dotenv";
import fetch from "node-fetch";
import fs from "fs/promises";
import sharp from "sharp";
import { program } from "commander";
import { createInterface } from "readline";
import { HaikuResponseData } from "../src/types";
import Instagram from "../src/services/instagram";
import terminalImage from "terminal-image";

dotenv.config();

const DATA_DIRECTORY = "./data";

program
    .option(
        "-c, --selection-count <type>",
        "number of haiku selection",
        process.env.OPENAI_SELECTION_COUNT
    )
    .option("--no-interaction")
    .option("--no-openai");

program.parse();

const options = program.opts();

const query = `
    query Query(
        $useAi: Boolean, 
        $appendImg: Boolean,
        $selectionCount: Int
    ) {
        haiku(
            useAI: $useAi, 
            appendImg: $appendImg,
            selectionCount: $selectionCount
        ) {
            book {
                title
                author
                emoticons
            }
            verses
            title
            description
            image
            hashtags
            translations {
                fr
                es
                jp
            }
        }
    }
`;

const variables = {
    useAi: options.openai,
    appendImg: true,
    selectionCount: parseInt(options.selectionCount),
    theme: 'watermark',
};

const body = {
    query: query,
    variables: variables,
    timeout: 100,
};

fetch(process.env.SERVER_URI || "http://localhost:4000/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
}).then((response) => response.json()).then(async (response: {
    data: HaikuResponseData 
}) => {
    const haiku = response.data?.haiku;

    if (null === haiku) {
        console.error(response);
    
        throw new Error('Haiku fetch error');
    }

    const imageData = Buffer.from(haiku.image, "base64");

    haiku.imagePath = `${DATA_DIRECTORY}/preview_haiku.jpg`;

    await fs.writeFile(haiku.imagePath, imageData);

    console.log(await terminalImage.file(haiku.imagePath, { width: 20 }));
    console.log({
        book: haiku.book,
        verses: haiku.verses,
        title: haiku.title,
        description: haiku.description,
        hashtags: haiku.hashtags,
        translations: haiku.translations,
    });

    const imageBuffer = await fs.readFile(haiku.imagePath);

    // Resize generated image for Readme Daily Haiku Card section
    const resizedImageBuffer = await sharp(imageBuffer)
        .resize(1000, 1000)
        .toBuffer();

    await fs.writeFile(
        `${DATA_DIRECTORY}/daily_haiku_card.jpg`,
        resizedImageBuffer
    );

    if (false === options.interaction) {
        Instagram.post(haiku);
    } else {
        const rl = createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question(
            "\nPost on Instagram? (y/n) \x1b[33m[n]\x1b[0m ",
            (answer: string) => {
                if ("y" === answer || "yes" === answer) {
                    Instagram.post(haiku);
                }

                rl.close();
            }
        );
    }
});
