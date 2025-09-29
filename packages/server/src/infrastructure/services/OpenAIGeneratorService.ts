import log from 'loglevel';
import { inject, singleton } from 'tsyringe';
import { HaikuValue, OpenAIOptions } from '../../shared/types';
import HaikuGeneratorService from '../../domain/services/HaikuGeneratorService';
import { IGenerator } from '../../domain/interfaces/IGenerator';
import {
  IOpenAIClient,
  IOpenAIClientToken,
} from '../../domain/gateways/IOpenAIClient';

@singleton()
export default class OpenAIGeneratorService implements IGenerator {
  private readonly MAX_SELECTION_COUNT: number = 100;

  private haikuSelection: HaikuValue[] = [];
  private openai: IOpenAIClient;

  private selectionCount: number;
  private descriptionTemperature: number;

  constructor(
    @inject(HaikuGeneratorService)
    private readonly haikuGeneratorService: HaikuGeneratorService,
    @inject(IOpenAIClientToken) openaiClient: IOpenAIClient,
  ) {
    this.openai = openaiClient;
  }

  configure(options: OpenAIOptions): OpenAIGeneratorService {
    const { apiKey, selectionCount, temperature } = options;

    if (undefined === selectionCount) {
      this.selectionCount = parseInt(process.env.OPENAI_SELECTION_COUNT);
    }

    if (selectionCount > 0) {
      this.selectionCount = Math.min(selectionCount, this.MAX_SELECTION_COUNT);
    }

    temperature.description =
      temperature.description ??
      parseFloat(process.env.OPENAI_DESCRIPTION_TEMPERATURE || '0.3');
    log.info('temperature', temperature);

    this.descriptionTemperature = temperature.description;

    this.openai.configure(apiKey);

    return this;
  }

  async generate(): Promise<HaikuValue | null> {
    let haiku: HaikuValue;

    try {
      const prompt = await this.generateSelectionPrompt();

      const completion = await this.openai.chatCompletionsCreate({
        model: process.env.OPENAI_GPT5_MODEL || 'gpt-4o-mini',
        temperature: 0.7,
        max_completion_tokens: 1200,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const answer = completion.choices[0].message.content;

      const output = JSON.parse(answer);
      const index = output.id;

      haiku = this.haikuSelection[index];
      this.haikuSelection = [];

      haiku = await this.addDescription(haiku);
      haiku = await this.addTranslations(haiku);
      haiku = await this.addBookmojis(haiku);

      return haiku;
    } catch (error) {
      log.error('OpenAI API error:', error);
    } finally {
      this.haikuSelection = [];
      haiku = null;
    }

    return await this.haikuGeneratorService.generate();
  }

  private async generateSelectionPrompt(): Promise<string> {
    const prompt = `Please select the most relevant haiku from the following list of ${this.selectionCount}, considering factors such as correct grammatical structure, consistency between the three lines, the ability to capture the beauty of nature, the conveyance of tranquility and peace, and the presentation of a profound moment of insight`;

    const haikus = await this.fetchHaikus();

    return `${prompt} (Use the following format: {"id":[Id]})\n${haikus.join('\n')}\nSTOP\n`;
  }

  private async addDescription(haiku: HaikuValue): Promise<HaikuValue> {
    try {
      const prompt = `Act as an English Literature Teacher and describe the Haiku: "${haiku.verses.join('\\n')}"`;
      const outputFormat =
        '{"title":"<Give a creative short title to describe the haiku>","description":"<Describe and explain the haiku>","hashtags":"<Give 6 lowercase hashtags>"}';

      const completion = await this.openai.chatCompletionsCreate({
        model: process.env.OPENAI_GPT5_MODEL || 'gpt-4o-mini',
        temperature: 0.7,
        max_completion_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `${prompt} (Use the following format: ${outputFormat})`,
          },
        ],
      });

      const answer = completion.choices[0].message.content;
      const output = JSON.parse(answer);

      haiku.title = output.title;
      haiku.description = output.description;
      haiku.hashtags = output.hashtags;
    } catch (error) {
      log.error('GPT-5 description generation error:', error);
      haiku.title = 'Untitled Haiku';
      haiku.description = 'A beautiful haiku';
      haiku.hashtags = '#haiku #poetry #nature #zen #peaceful #gutenku';
    }

    return haiku;
  }

  private async addTranslations(haiku: HaikuValue): Promise<HaikuValue> {
    try {
      let prompt = `Act as a Poem Translator and translate this haiku using \\n separator: "${haiku.verses.join('\\n')}"`;
      let outputFormat = '';
      outputFormat += '"fr":"<Translate the Haiku in french>",';
      outputFormat += '"jp":"<Translate the Haiku in rōmaji>",';
      outputFormat += '"es":"<Translate the Haiku in spanish>",';
      outputFormat += '"it":"<Translate the Haiku in italian>",';
      outputFormat += '"de":"<Translate the Haiku in german>"';
      prompt = `${prompt} (Use the following format: {${outputFormat}})`;

      const completion = await this.openai.chatCompletionsCreate({
        model: process.env.OPENAI_GPT5_MODEL || 'gpt-4o-mini',
        temperature: 0.7,
        max_completion_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const answer = completion.choices[0].message.content;
      const output = JSON.parse(answer);

      haiku.translations = {
        fr: output.fr,
        jp: output.jp,
        es: output.es,
        it: output.it,
        de: output.de,
      };
    } catch (error) {
      log.error('GPT-5 translation generation error:', error);
      haiku.translations = {
        fr: haiku.verses.join(' / '),
        jp: haiku.verses.join(' / '),
        es: haiku.verses.join(' / '),
        it: haiku.verses.join(' / '),
        de: haiku.verses.join(' / '),
      };
    }

    return haiku;
  }

  private async addBookmojis(haiku: HaikuValue): Promise<HaikuValue> {
    try {
      const prompt = `Generate 3-5 emoticons that represent the book "${haiku.book.title}". Respond with only the emoticons, no text or explanation.`;

      const completion = await this.openai.chatCompletionsCreate({
        model: process.env.OPENAI_GPT5_MODEL || 'gpt-4o-mini',
        temperature: 0.7,
        max_completion_tokens: 20,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const answer = completion.choices[0].message.content.replace(
        /[\n\s]+/g,
        '',
      );

      haiku.book.emoticons = answer;
    } catch (error) {
      log.error('GPT-5 emoticons generation error:', error);
      haiku.book.emoticons = '📚✨🌸';
    }

    return haiku;
  }

  private async fetchHaikus(): Promise<string[]> {
    const haikus: string[] = [];

    // Fetch haikus from the cache using the service
    this.haikuSelection = await this.haikuGeneratorService.extractFromCache(
      this.selectionCount,
    );

    if (0 === this.haikuSelection.length) {
      // Generate and append new haikus to the selection
      for (let i = 0; i < this.selectionCount; i++) {
        const haiku = await this.haikuGeneratorService.buildFromDb();
        this.haikuSelection.push(haiku);

        const verses = `[Id]: ${i}\n[Verses]: ${haiku.verses.join('\n')}\n`;
        log.info(verses);
        haikus.push(verses);
      }
    }

    // Log and append details of each haiku in the selection
    this.haikuSelection.forEach((haiku, i: number) => {
      const verses = `[Id]: ${i}\n[Verses]: ${haiku.verses.join('\n')}\n`;
      log.info(verses);
      haikus.push(verses);
    });

    return haikus;
  }
}
