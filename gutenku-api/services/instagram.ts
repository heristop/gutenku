import { unlink } from 'fs';
import { HaikuValue } from '../src/types';
import InstagramPublisher from 'instagram-publisher';

export default {
    post(haiku: HaikuValue) {
        const bookTitle = haiku.book.title.charAt(0) + haiku.book.title.slice(1).replace(/[a-zA-Z]/g, "*");

        const caption = `
🌸🗻 “${haiku.title}” 
📖 Book Title: ${bookTitle}
~~~
#gutenku #gutenberg #projectgutenberg #haiku #poetry #poem #haikupoetry #haikulover #haikusofinstagram #haikumoments #haikucommunity #japanesepoetry #naturepoetry #micropoetry #minimalistpoetry #zenpoetry #buddhistpoetry #meditativepoetry
`;

        console.log(caption);

        if (process.env.INSTAGRAM_API_USER) {
            const client = new InstagramPublisher({
                email: process.env.INSTAGRAM_API_USER,
                password: process.env.INSTAGRAM_API_PASSWORD,
                verbose: true,
            });

            const imageData = {
                image_path: haiku.image_path,
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
