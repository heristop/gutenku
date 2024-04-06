import dotenv from 'dotenv';
import { IgApiClient } from 'instagram-private-api';
import { promises as fs } from 'fs';
import { HaikuValue } from '../../shared/types';

dotenv.config();

interface PublishPhotoResponse {
    media: {
        id: string;
        code: string;
        user: {
            username: string;
        };
    };
    status: string;
}

export default class InstagramService {

    static async loginToInstagram(): Promise<IgApiClient> {
        const ig = new IgApiClient();
        ig.state.generateDevice(process.env.INSTAGRAM_API_USER);
        await ig.account.login(process.env.INSTAGRAM_API_USER, process.env.INSTAGRAM_API_PASSWORD);

        return ig;
    }
    
    static async publish(ig: IgApiClient, imagePath: string, caption: string): Promise<PublishPhotoResponse> {
        const imageBuffer = await fs.readFile(imagePath);
        const publishResult = await ig.publish.photo({
            file: imageBuffer,
            caption,
        });

        return publishResult;
    }

    static async post(haiku: HaikuValue) {
        const bookTitle = haiku.book.title;
        const vowels = "aeiouyAEIOUY";

        let nonMaskedVowel: string;

        // Find a random vowel in the title
        do {
            nonMaskedVowel = bookTitle.charAt(Math.floor(Math.random() * bookTitle.length));
        } while (!vowels.includes(nonMaskedVowel));

        // Mask all letters except the random vowel
        const maskedTitle = bookTitle.replace(new RegExp(`[^ ${nonMaskedVowel}]`, "gi"), "*");

        if (null === haiku.title) {
            throw new Error('Missing Title');
        }

        const hashtagAuthor = haiku.book.author
            .toLowerCase()
            .replaceAll(/\s|,|-|\.|\(|\)/g, '');

        const caption = `
🌸 “${haiku.title}” 🗻
📖 Quotes extracted from: ${maskedTitle}

📔 Bookmojis: ${haiku.book.emoticons}
~~~
🇫🇷
${haiku.translations.fr}

🇯🇵
${haiku.translations.jp}

🇪🇸
${haiku.translations.es}
~~~
🏷️ ${haiku.hashtags} #${hashtagAuthor} ${process.env.INSTAGRAM_HASHTAGS}
`;

        console.log(caption);

        if (process.env.INSTAGRAM_API_USER) {
            const ig = await this.loginToInstagram();

            await this.publish(ig, haiku.imagePath, caption);
        }
    }
}
