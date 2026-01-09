import type { HaikuValue } from '../types/haiku';

export function maskBookTitle(title: string): string {
  const vowels = 'aeiouyAEIOUY';
  let nonMaskedVowel = '';

  for (const char of title) {
    if (vowels.includes(char)) {
      nonMaskedVowel = char;
      break;
    }
  }

  if (!nonMaskedVowel) {
    return title;
  }

  return title.replaceAll(new RegExp(`[^ ${nonMaskedVowel}]`, 'gi'), '*');
}

export function formatAuthorHashtag(author: string): string {
  return author.toLowerCase().replaceAll(/\s|,|-|\.|\(|\)/g, '');
}

export interface SocialCaptionOptions {
  extraHashtags?: string;
}

export function generateSocialCaption(
  haiku: HaikuValue,
  options?: SocialCaptionOptions,
): string {
  if (!haiku.title) {
    return '';
  }

  const bookTitle = haiku.book.title;
  const firstLetter = bookTitle[0].toUpperCase();
  const authorFirstName = haiku.book.author.split(' ')[0];
  const hashtagAuthor = formatAuthorHashtag(haiku.book.author);
  const extraHashtags = options?.extraHashtags
    ? ` ${options.extraHashtags}`
    : '';

  const hasEmoticons = !!haiku.book?.emoticons;
  let hintNumber = 1;

  const hints: string[] = [];

  if (hasEmoticons) {
    hints.push(`💡 Hint ${hintNumber++} (Bookmoji):\n${haiku.book.emoticons}`);
  }

  hints.push(
    `💡 Hint ${hintNumber++} (First letter of the book):\n${firstLetter}...`,
  );
  hints.push(`💡 Hint ${hintNumber++} (Author):\n${authorFirstName}...`);

  return `🌸 "${haiku.title}" 🗻

📚 Guess the book! 👇

~~~

${hints.join('\n\n')}

・
・
・
・

📗 ${bookTitle} by ${haiku.book.author}

~~~

${haiku.verses.join('\n')}

~~~

🇫🇷 ${haiku.translations?.fr || ''}

🇯🇵 ${haiku.translations?.jp || ''}

~~~

#gutenku #bookstagram #guessthebook #${hashtagAuthor}${extraHashtags} ${haiku.hashtags || ''}
`.trim();
}
