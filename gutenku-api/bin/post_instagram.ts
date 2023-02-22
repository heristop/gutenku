import InstagramPublisher from 'instagram-publisher';
//import OpenAI from '../services/openai';
import Haiku from '../services/haiku';

const PATH = './.cache/haiku_generated.png';

/*async function generate() {
    if (undefined !== process.env.OPENAI_API_KEY) {
        return await OpenAI.generate();
    }

    return Haiku.generateWithImage();
}*/

/*async function generate() {
    return new Promise(async (resolve, reject) => {
        const result = await Haiku.generateWithImage();

        console.log('result', result);

        resolve(result);
    });
}

const result = await generate();

console.log('Image generated!');*/

const client = new InstagramPublisher({
    email: '',
    password: '',
    verbose: true,
});

const image_data = {
    image_path: PATH,
    caption: 'Image caption',
};

//await client.createSingleImage(image_data);

console.log('Image sent!');

