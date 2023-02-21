import InstagramPublisher from 'instagram-publisher';

const PATH = './.cache/haiku_generated.png';

const client = new InstagramPublisher({
    email: '',
    password: '',
    verbose: true, // default: false
});

const image_data = {
    image_path: PATH,
    caption: 'Image caption',
};

const created = await client.createSingleImage(image_data);