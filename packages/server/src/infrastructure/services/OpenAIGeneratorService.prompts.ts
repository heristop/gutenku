import { createLogger } from '~/infrastructure/services/Logger';
import type { IOpenAIClient } from '~/domain/gateways/IOpenAIClient';

const log = createLogger('openai');

const SELECTION_CRITERIA =
  'Nature imagery, word variety, opening strength, sentiment, grammar, flow (markov/trigram), sound patterns (alliteration), narrative coherence (verse distance), imagery density, line balance, verb usage, and overall tranquility/insight.';

/**
 * Build the candidate selection prompt sent to the chat model.
 */
export function buildSelectionPrompt(
  candidateCount: number,
  formattedHaikus: string[],
): string {
  const prompt = `Select the best haiku from ${candidateCount} candidates. Criteria: ${SELECTION_CRITERIA}`;

  return `${prompt}\n(Format: {"id": <index_number>, "reason": "<why this haiku>"})\n${formattedHaikus.join('\n')}\nSTOP\n`;
}

export interface ParsedSelection {
  index: number;
  reason: string;
}

/**
 * Parse the model's JSON selection response. Falls back to top-scored haiku
 * (index 0) when the response cannot be parsed as JSON.
 */
export function parseSelectionAnswer(answer: string | null): ParsedSelection {
  try {
    const jsonMatch = answer?.match(/\{[\s\S]*"id"[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : answer;
    const output = JSON.parse(jsonStr ?? '');

    return {
      index: output.id,
      reason: output.reason || '',
    };
  } catch (parseError) {
    log.warn(
      { rawAnswer: answer, err: parseError },
      'JSON parse failed, using top-scored haiku',
    );

    return {
      index: 0,
      reason: 'Selected by score (parse error)',
    };
  }
}

const DEFAULT_DESCRIPTION = {
  title: 'Untitled Haiku',
  description: 'A beautiful haiku',
  hashtags: '#haiku #poetry #nature #zen #peaceful #gutenku',
};

export type DescriptionResult = typeof DEFAULT_DESCRIPTION;

export async function generateDescription(
  openai: IOpenAIClient,
  model: string,
  temperature: number,
  verses: string[],
): Promise<DescriptionResult> {
  const prompt = `Act as an English Literature Teacher and describe the Haiku: "${verses.join('\\n')}"`;
  const outputFormat =
    '{"title":"<Give a creative short title to describe the haiku>","description":"<Describe and explain the haiku>","hashtags":"<Give 6 lowercase hashtags>"}';

  const completion = await openai.chatCompletionsCreate({
    max_completion_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: `${prompt} (Use the following format: ${outputFormat})`,
      },
    ],
    model,
    temperature,
  });

  const answer = completion.choices[0].message.content;
  try {
    const parsed = JSON.parse(answer ?? '');

    return {
      title:
        typeof parsed.title === 'string' ? parsed.title : DEFAULT_DESCRIPTION.title,
      description:
        typeof parsed.description === 'string'
          ? parsed.description
          : DEFAULT_DESCRIPTION.description,
      hashtags:
        typeof parsed.hashtags === 'string'
          ? parsed.hashtags
          : DEFAULT_DESCRIPTION.hashtags,
    };
  } catch (err) {
    log.warn(
      { rawAnswer: answer, err },
      'generateDescription JSON parse failed, using defaults',
    );

    return { ...DEFAULT_DESCRIPTION };
  }
}

export type TranslationsResult = {
  fr: string;
  jp: string;
  es: string;
  it: string;
  de: string;
};

export async function generateTranslations(
  openai: IOpenAIClient,
  model: string,
  temperature: number,
  verses: string[],
): Promise<TranslationsResult> {
  const outputFormat =
    '{"fr":"<french>","jp":"<rōmaji>","es":"<spanish>","it":"<italian>","de":"<german>"}';
  const prompt = `Translate this haiku (\\n separator): "${verses.join('\\n')}" (Format: ${outputFormat})`;
  const completion = await openai.chatCompletionsCreate({
    max_completion_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
    model,
    temperature,
  });
  const fallback = verses.join(' / ');
  const fallbackAll: TranslationsResult = {
    fr: fallback,
    jp: fallback,
    es: fallback,
    it: fallback,
    de: fallback,
  };
  try {
    const raw = completion.choices[0].message.content;
    const parsed = JSON.parse(raw ?? '');

    return {
      fr: typeof parsed.fr === 'string' ? parsed.fr : fallback,
      jp: typeof parsed.jp === 'string' ? parsed.jp : fallback,
      es: typeof parsed.es === 'string' ? parsed.es : fallback,
      it: typeof parsed.it === 'string' ? parsed.it : fallback,
      de: typeof parsed.de === 'string' ? parsed.de : fallback,
    };
  } catch (err) {
    log.warn(
      { err },
      'generateTranslations JSON parse failed, using verse fallback',
    );

    return fallbackAll;
  }
}

export async function generateBookmojis(
  openai: IOpenAIClient,
  model: string,
  temperature: number,
  book: { title: string; author: string },
): Promise<string> {
  log.info(
    { bookTitle: book.title, bookAuthor: book.author },
    'Generating bookmojis',
  );

  const completion = await openai.chatCompletionsCreate({
    max_completion_tokens: 20,
    messages: [
      {
        role: 'system',
        content:
          'You are an emoji generator. Respond ONLY with 3-5 emojis that visually represent the given book. No text, no spaces, just emojis.',
      },
      {
        role: 'user',
        content: `"${book.title}" by ${book.author}`,
      },
    ],
    model,
    temperature,
  });

  const rawContent = completion.choices[0]?.message?.content;
  const emoticons = rawContent?.replaceAll(/[\n\s]+/g, '') || '';

  log.info(
    {
      book: `${book.title} by ${book.author}`,
      rawContent,
      emoticons,
    },
    'Bookmojis generation result',
  );

  return emoticons;
}
