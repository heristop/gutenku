import log from 'loglevel';
import { promises as fs } from 'node:fs';
import FormData from 'form-data';
import axios from 'axios';
import type { HaikuValue } from '~/shared/types';

export async function post(haiku: HaikuValue) {
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
  const maskedTitle = bookTitle.replaceAll(
    new RegExp(`[^ ${nonMaskedVowel}]`, 'gi'),
    '*',
  );

  if (haiku.title === null) {
    throw new Error('Missing Title');
  }

  const hashtagAuthor = haiku.book.author
    .toLowerCase()
    .replaceAll(/\s|,|-|\.|\(|\)/g, '');

  const caption = `
🌸 "${haiku.title}" 🗻
✨ A haiku woven from the words of ${maskedTitle} by ${haiku.book.author}
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

👩‍🏫 "${haiku.description}"

🤖✒️ Analysis Written by BotenKu, Your devoted Bot Literature Teacher

---
`;

  log.info(caption);

  if (process.env.DISCORD_WEBHOOK_URL) {
    await publish(haiku, caption);
  }
}

export async function publish(
  haiku: HaikuValue,
  caption: string,
): Promise<void> {
  if (!caption) {
    throw new Error('Caption cannot be empty');
  }

  // Read the image file into a buffer
  const imageBuffer = await fs.readFile(haiku.imagePath);

  // Create a FormData instance
  const form = new FormData();

  // Append image file with filename and content type
  const formattedTitle = haiku.title.replaceAll(/\s/g, '_').toLowerCase();
  form.append('file', imageBuffer, {
    contentType: 'image/jpeg',
    filename: `${formattedTitle}.jpg`,
    knownLength: imageBuffer.length,
  });

  // Append the caption (content of the message)
  form.append('content', caption);

  // Get multipart form headers
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
