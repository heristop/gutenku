import log from 'loglevel';
import { promises as fs } from 'fs';
import FormData from 'form-data';
import axios from 'axios';
import { HaikuValue } from '../../shared/types';

export default class DiscordService {
  static async post(haiku: HaikuValue) {
    const bookTitle = haiku.book.title;
    const vowels = 'aeiouyAEIOUY';

    let nonMaskedVowel: string;

    // Find a random vowel in the title
    do {
      nonMaskedVowel = bookTitle.charAt(
        Math.floor(Math.random() * bookTitle.length),
      );
    } while (!vowels.includes(nonMaskedVowel));

    // Mask all letters except the random vowel
    const maskedTitle = bookTitle.replace(
      new RegExp(`[^ ${nonMaskedVowel}]`, 'gi'),
      '*',
    );

    if (null === haiku.title) {
      //throw new Error('Missing Title');
    }

    const hashtagAuthor = haiku.book.author
      .toLowerCase()
      .replaceAll(/\s|,|-|\.|\(|\)/g, '');

    const caption = `
🌸 “${haiku.title}” 🗻
📖 Quotes extracted from: ${maskedTitle}

📔 Bookmojis: ${haiku.book.emoticons}

---

🇫🇷
${haiku.translations?.fr}

🇯🇵
${haiku.translations?.jp}

🇪🇸
${haiku.translations?.es}

---

🏷️ ${haiku.hashtags} #${hashtagAuthor} ${process.env.DISCORD_HASHTAGS}

---

👩‍🏫 “${haiku.description}”

🤖✒️ Analysis Written by BotenKu, Your devoted Bot Literature Teacher

---
`;

    log.info(caption);

    if (process.env.DISCORD_WEBHOOK_URL) {
      await this.publish(haiku, caption);
    }
  }

  static async publish(haiku: HaikuValue, caption: string): Promise<void> {
    if (!caption) {
      throw new Error('Caption cannot be empty');
    }

    // Read the image file into a buffer
    const imageBuffer = await fs.readFile(haiku.imagePath);

    // Create a FormData instance
    const form = new FormData();

    // Append the image file; note the third parameter options which include the filename and contentType
    form.append('file', imageBuffer, {
      filename: 'image.jpg',
      contentType: 'image/jpeg',
      knownLength: imageBuffer.length,
    });

    // Append the caption (content of the message)
    form.append('content', caption);

    // Prepare the headers, including multipart form boundaries
    const formHeaders = form.getHeaders();

    try {
      await axios.post(process.env.DISCORD_WEBHOOK_URL, form, {
        headers: formHeaders,
      });

      log.info('Message posted successfully');
    } catch (error) {
      log.error('Failed to send message:', error);
    }
  }
}
