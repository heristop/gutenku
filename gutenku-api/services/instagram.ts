import dotenv from 'dotenv';
import { unlink } from 'fs';
import { HaikuValue } from '../src/types';
import InstagramPublisher from 'instagram-publisher';

dotenv.config();

export default {
    post(haiku: HaikuValue) {
        const bookTitle = haiku.book.title;
        const vowels = "aeiouyAEIOUY";

        let nonMaskedVowel: string;

        // Find a random vowel in the title
        do {
            nonMaskedVowel = bookTitle.charAt(Math.floor(Math.random() * bookTitle.length));
        } while (!vowels.includes(nonMaskedVowel));

        // Mask all letters except the random vowel
        const maskedTitle = bookTitle.replace(new RegExp(`[^ ${nonMaskedVowel}]`, "gi"), "*");

        const postTitle = haiku.title;

        if (null === postTitle) {
            throw new Error('Missing Title');
        }

        const hashtagAuthor = haiku.book.author
            .toLowerCase()
            .replaceAll(/\s|,|\.|\(|\)/g, '');

        const caption = `
🌸🗻 “${postTitle}” 
📖 Reference Book: ${maskedTitle}
~~~
🇫🇷
${haiku.fr}

🇪🇸
${haiku.es}
~~~
${haiku.hashtags} #${hashtagAuthor} ${process.env.INSTAGRAM_HASHTAGS}
`;

        console.log(caption);

        if (process.env.INSTAGRAM_API_USER) {
            const client = new InstagramPublisher({
                email: process.env.INSTAGRAM_API_USER,
                password: process.env.INSTAGRAM_API_PASSWORD,
                verbose: true,
            });

            const imageData = {
                image_path: haiku.imagePath,
                caption: caption,
            };

            client.createSingleImage(imageData).then(() => {
                unlink(imageData.image_path, (err: NodeJS.ErrnoException | null) => {
                    if (err) {
                        throw err;
                    }
                });

                console.log('Image sent!');
            });
        }
    }
}
