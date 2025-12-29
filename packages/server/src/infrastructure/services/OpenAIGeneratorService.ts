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

type ReasoningEffort = 'none' | 'low' | 'medium' | 'high';

@singleton()
export default class OpenAIGeneratorService implements IGenerator {
  private readonly MAX_SELECTION_COUNT: number = 20;

  private haikuSelection: HaikuValue[] = [];
  private openai: IOpenAIClient;

  private selectionCount: number;

  private get model(): string {
    return process.env.OPENAI_GPT_MODEL || 'gpt-4o';
  }

  private get supportsReasoning(): boolean {
    // Only o1, o3, and gpt-5 models support reasoning_effort
    return /^(o1|o3|gpt-5)/.test(this.model);
  }

  private get reasoningEffort(): ReasoningEffort | undefined {
    if (!this.supportsReasoning) {
      return undefined;
    }
    return (process.env.OPENAI_REASONING_EFFORT as ReasoningEffort) || 'low';
  }

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

    temperature.description =
      temperature.description ??
      Number.parseFloat(process.env.OPENAI_DESCRIPTION_TEMPERATURE || '0.3');
    log.info({ temperature }, 'OpenAI temperature settings');

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
          model: this.model,
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
        model: this.model,
        temperature: 0.7,
        ...(this.reasoningEffort && { reasoning_effort: this.reasoningEffort }),
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
        this.generateBookmojis(haiku.book.title),
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

      if (emojisResult.status === 'fulfilled') {
        haiku.book.emoticons = emojisResult.value;
      } else {
        haiku.book.emoticons = '📚✨🌸';
      }

      return haiku;
    } catch (error) {
      log.error({ err: error }, 'OpenAI API error');
      this.haikuSelection = [];
      throw error;
    }
  }

  private async generateSelectionPrompt(): Promise<string> {
    const prompt = `Please select the most relevant haiku from the following list of ${this.selectionCount}, considering factors such as correct grammatical structure, consistency between the three lines, the ability to capture the beauty of nature, the conveyance of tranquility and peace, and the presentation of a profound moment of insight`;

    const haikus = await this.fetchHaikus();

    return `${prompt} (Use the following format: {"id":[Id],"reason":"<brief explanation of why this haiku instead of others>"})\n${haikus.join('\n')}\nSTOP\n`;
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
      model: this.model,
      temperature: 0.7,
      ...(this.reasoningEffort && { reasoning_effort: this.reasoningEffort }),
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
      model: this.model,
      temperature: 0.7,
      ...(this.reasoningEffort && { reasoning_effort: this.reasoningEffort }),
    });

    const answer = completion.choices[0].message.content;
    return JSON.parse(answer);
  }

  private async generateBookmojis(bookTitle: string): Promise<string> {
    const prompt = `Generate 3-5 emoticons that represent the book "${bookTitle}". Respond with only the emoticons, no text or explanation.`;

    const completion = await this.openai.chatCompletionsCreate({
      max_completion_tokens: 20,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: this.model,
      temperature: 0.7,
      ...(this.reasoningEffort && { reasoning_effort: this.reasoningEffort }),
    });

    return completion.choices[0].message.content.replaceAll(/[\n\s]+/g, '');
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

    this.haikuSelection.forEach((haiku, i: number) => {
      const verses = `[Id]: ${i}\n[Verses]: ${haiku.verses.join('\n')}\n`;
      log.debug({ id: i, verses: haiku.verses }, 'Haiku candidate');
      haikus.push(verses);
    });

    return haikus;
  }
}
