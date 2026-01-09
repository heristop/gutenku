import { inject, singleton } from 'tsyringe';
import { createLogger } from '~/infrastructure/services/Logger';

const log = createLogger('openai');
import type { HaikuValue, OpenAIOptions } from '~/shared/types';
import HaikuGeneratorService from '~/domain/services/HaikuGeneratorService';
import type { IGenerator } from '~/domain/interfaces/IGenerator';
import {
  type IOpenAIClient,
  IOpenAIClientToken,
} from '~/domain/gateways/IOpenAIClient';
import {
  calculateHaikuQuality,
  type HaikuQualityScore,
} from '~/shared/constants/validation';

@singleton()
export default class OpenAIGeneratorService implements IGenerator {
  private readonly MAX_SELECTION_COUNT: number = 20;
  private readonly MODEL = 'gpt-5.2';
  private readonly DEFAULT_TEMPERATURE = 0.7;
  private readonly EMOTICONS_TEMPERATURE = 0.1;

  private haikuSelection: HaikuValue[] = [];
  private openai: IOpenAIClient;
  private selectionCount: number;
  private temperature: number = this.DEFAULT_TEMPERATURE;

  constructor(
    @inject(HaikuGeneratorService)
    private readonly haikuGeneratorService: HaikuGeneratorService,
    @inject(IOpenAIClientToken) openaiClient: IOpenAIClient,
  ) {
    this.openai = openaiClient;
  }

  configure(options: OpenAIOptions): OpenAIGeneratorService {
    const { apiKey, selectionCount, temperature } = options;

    if (selectionCount !== null && selectionCount > 0) {
      this.selectionCount = Math.min(selectionCount, this.MAX_SELECTION_COUNT);
    } else {
      this.selectionCount = Number.parseInt(
        process.env.OPENAI_SELECTION_COUNT || '1',
        10,
      );
    }

    log.info(
      {
        selectionCount: this.selectionCount,
        inputSelectionCount: selectionCount,
      },
      'OpenAI selection configured',
    );

    this.temperature = temperature.description ?? this.DEFAULT_TEMPERATURE;
    log.info({ temperature: this.temperature }, 'OpenAI temperature settings');

    this.openai.configure(apiKey);

    return this;
  }

  async generate(): Promise<HaikuValue | null> {
    let haiku: HaikuValue;

    try {
      const prompt = await this.generateSelectionPrompt();

      log.info(
        {
          promptLength: prompt.length,
          haikuCount: this.haikuSelection.length,
          model: this.MODEL,
        },
        'Sending selection prompt to OpenAI',
      );

      const completion = await this.openai.chatCompletionsCreate({
        max_completion_tokens: 1200,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: this.MODEL,
        temperature: this.temperature,
      });

      const answer = completion.choices[0].message.content;

      log.info(
        { responseLength: answer?.length, rawAnswer: answer },
        'OpenAI selection response received',
      );

      const output = JSON.parse(answer);
      const index = output.id;
      const reason = output.reason || '';

      log.info({ selectedIndex: index, reason }, 'Selected haiku index');

      const generatedCount = this.haikuSelection.length;

      // Store candidates before clearing
      const allCandidates = this.haikuSelection.map((h) => ({
        verses: h.verses,
        book: { title: h.book.title, author: h.book.author },
      }));

      haiku = this.haikuSelection[index];
      this.haikuSelection = [];

      haiku.selectionInfo = {
        requestedCount: this.selectionCount,
        generatedCount,
        selectedIndex: index,
        reason,
      };

      haiku.candidates = allCandidates;

      const [descResult, transResult, emojisResult] = await Promise.allSettled([
        this.generateDescription(haiku.verses),
        this.generateTranslations(haiku.verses),
        this.generateBookmojis(haiku.book),
      ]);

      if (descResult.status === 'fulfilled') {
        haiku.title = descResult.value.title;
        haiku.description = descResult.value.description;
        haiku.hashtags = descResult.value.hashtags;
      } else {
        haiku.title = 'Untitled Haiku';
        haiku.description = 'A beautiful haiku';
        haiku.hashtags = '#haiku #poetry #nature #zen #peaceful #gutenku';
      }

      if (transResult.status === 'fulfilled') {
        haiku.translations = transResult.value;
      } else {
        haiku.translations = {
          de: haiku.verses.join(' / '),
          es: haiku.verses.join(' / '),
          fr: haiku.verses.join(' / '),
          it: haiku.verses.join(' / '),
          jp: haiku.verses.join(' / '),
        };
      }

      log.info(
        {
          emojisStatus: emojisResult.status,
          emojisValue:
            emojisResult.status === 'fulfilled' ? emojisResult.value : null,
          emojisReason:
            emojisResult.status === 'rejected'
              ? (emojisResult.reason as Error)?.message
              : null,
        },
        'Emoticons result from Promise.allSettled',
      );

      if (emojisResult.status === 'fulfilled' && emojisResult.value) {
        haiku.book.emoticons = emojisResult.value;
      } else {
        haiku.book.emoticons = '';
      }

      return haiku;
    } catch (error) {
      log.error({ err: error }, 'OpenAI API error');
      this.haikuSelection = [];
      throw error;
    }
  }

  private async generateSelectionPrompt(): Promise<string> {
    const prompt = `Please select the best haiku from the following list of ${this.selectionCount}. Consider:
- Grammatical structure and flow between lines
- Nature imagery (higher nature_words score is better)
- No repeated words (lower repeated_words is better)
- Strong opening (lower weak_starts is better)
- Overall quality score (higher is better)
- The ability to capture tranquility and a profound moment of insight`;

    const haikus = await this.fetchHaikus();

    return `${prompt}\n(Use the following format: {"id":[Id],"reason":"<brief explanation of why this haiku instead of others>"})\n${haikus.join('\n')}\nSTOP\n`;
  }

  private async generateDescription(
    verses: string[],
  ): Promise<{ title: string; description: string; hashtags: string }> {
    const prompt = `Act as an English Literature Teacher and describe the Haiku: "${verses.join('\\n')}"`;
    const outputFormat =
      '{"title":"<Give a creative short title to describe the haiku>","description":"<Describe and explain the haiku>","hashtags":"<Give 6 lowercase hashtags>"}';

    const completion = await this.openai.chatCompletionsCreate({
      max_completion_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `${prompt} (Use the following format: ${outputFormat})`,
        },
      ],
      model: this.MODEL,
      temperature: this.temperature,
    });

    const answer = completion.choices[0].message.content;
    return JSON.parse(answer);
  }

  private async generateTranslations(verses: string[]): Promise<{
    fr: string;
    jp: string;
    es: string;
    it: string;
    de: string;
  }> {
    let prompt = `Act as a Poem Translator and translate this haiku using \\n separator: "${verses.join('\\n')}"`;
    let outputFormat = '';
    outputFormat += '"fr":"<Translate the Haiku in french>",';
    outputFormat += '"jp":"<Translate the Haiku in rōmaji>",';
    outputFormat += '"es":"<Translate the Haiku in spanish>",';
    outputFormat += '"it":"<Translate the Haiku in italian>",';
    outputFormat += '"de":"<Translate the Haiku in german>"';
    prompt = `${prompt} (Use the following format: {${outputFormat}})`;

    const completion = await this.openai.chatCompletionsCreate({
      max_completion_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: this.MODEL,
      temperature: this.temperature,
    });

    const answer = completion.choices[0].message.content;
    return JSON.parse(answer);
  }

  private async generateBookmojis(book: {
    title: string;
    author: string;
  }): Promise<string> {
    log.info(
      { bookTitle: book.title, bookAuthor: book.author },
      'Generating bookmojis',
    );

    const completion = await this.openai.chatCompletionsCreate({
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
      model: this.MODEL,
      temperature: this.EMOTICONS_TEMPERATURE,
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

  private async fetchHaikus(): Promise<string[]> {
    const haikus: string[] = [];

    log.info(
      { selectionCount: this.selectionCount },
      'Generating haikus for AI selection',
    );

    for (let i = 0; i < this.selectionCount; i++) {
      try {
        log.info(
          { iteration: i + 1, total: this.selectionCount },
          'Generating haiku',
        );
        const haiku = await this.haikuGeneratorService.buildFromDb();
        if (haiku) {
          this.haikuSelection.push(haiku);
          log.info(
            { iteration: i + 1, verses: haiku.verses },
            'Haiku generated',
          );
        } else {
          log.warn({ iteration: i + 1 }, 'Haiku generation returned null');
        }
      } catch (err) {
        log.error({ err, iteration: i + 1 }, 'Failed to generate haiku');
      }
    }

    log.info(
      { totalGenerated: this.haikuSelection.length },
      'Haiku generation complete',
    );

    // Calculate quality scores and format for LLM selection
    this.haikuSelection.forEach((haiku, i: number) => {
      const quality = calculateHaikuQuality(haiku.verses);
      const entry = [
        `[Id]: ${i}`,
        `[Verses]: ${haiku.verses.join(' / ')}`,
        `[Quality]: nature_words=${quality.natureWords}, repeated_words=${quality.repeatedWords}, weak_starts=${quality.weakStarts}, score=${quality.totalScore}`,
        '',
      ].join('\n');

      log.debug(
        { id: i, verses: haiku.verses, quality },
        'Haiku candidate with quality score',
      );
      haikus.push(entry);
    });

    return haikus;
  }
}
