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
  type IHaikuRepository,
  IHaikuRepositoryToken,
} from '~/domain/repositories/IHaikuRepository';
import {
  GeneticAlgorithmService,
  type GAConfig,
  DEFAULT_GA_CONFIG,
} from '~/domain/services/genetic';
import {
  buildSelectionPrompt,
  generateBookmojis,
  generateDescription,
  generateTranslations,
  parseSelectionAnswer,
  type DescriptionResult,
  type TranslationsResult,
} from '~/infrastructure/services/OpenAIGeneratorService.prompts';
import {
  convertGAResultToHaikuValue,
  formatHaikuCandidate,
} from '~/infrastructure/services/OpenAIGeneratorService.formatters';

@singleton()
export default class OpenAIGeneratorService implements IGenerator {
  private readonly MAX_SELECTION_COUNT: number = 50;
  private readonly GPT_SELECTION_POOL_SIZE: number = 5;
  private readonly MODEL = process.env.OPENAI_GPT_MODEL || 'gpt-5.4-mini';
  private readonly DEFAULT_TEMPERATURE = 0.7;
  private readonly EMOTICONS_TEMPERATURE = 0.1;

  private haikuSelection: HaikuValue[] = [];
  private openai: IOpenAIClient;
  private selectionCount!: number;
  private fromDb: number = 0;
  private liveCount: number = 0;
  private temperature: number = this.DEFAULT_TEMPERATURE;
  private gaConfig: Partial<GAConfig> = {};

  constructor(
    @inject(HaikuGeneratorService)
    private readonly haikuGeneratorService: HaikuGeneratorService,
    @inject(IOpenAIClientToken) openaiClient: IOpenAIClient,
    @inject(IHaikuRepositoryToken)
    private readonly haikuRepository: IHaikuRepository,
  ) {
    this.openai = openaiClient;
  }

  configure(options: OpenAIOptions): OpenAIGeneratorService {
    const { apiKey, selectionCount, fromDb, liveCount, temperature } = options;

    this.selectionCount =
      selectionCount !== undefined && selectionCount > 0
        ? Math.min(selectionCount, this.MAX_SELECTION_COUNT)
        : Number.parseInt(process.env.OPENAI_SELECTION_COUNT || '1', 10);

    this.fromDb = fromDb ?? 0;
    this.liveCount = liveCount ?? 0;

    if (this.fromDb === 0 && this.liveCount === 0) {
      this.liveCount = this.selectionCount;
    }

    log.info(
      {
        selectionCount: this.selectionCount,
        fromDb: this.fromDb,
        liveCount: this.liveCount,
        inputSelectionCount: selectionCount,
      },
      'OpenAI selection configured',
    );

    this.temperature = temperature.description ?? this.DEFAULT_TEMPERATURE;
    log.info({ temperature: this.temperature }, 'OpenAI temperature settings');

    this.openai.configure(apiKey);

    this.gaConfig = {
      ...DEFAULT_GA_CONFIG,
      returnCount: this.GPT_SELECTION_POOL_SIZE,
    };
    log.info({ gaConfig: this.gaConfig }, 'Genetic Algorithm configured');

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
        messages: [{ role: 'user', content: prompt }],
        model: this.MODEL,
        temperature: this.temperature,
      });

      const answer = completion.choices[0].message.content;

      log.info(
        { responseLength: answer?.length, rawAnswer: answer },
        'OpenAI selection response received',
      );

      const parsed = parseSelectionAnswer(answer);
      let { index, reason } = parsed;

      if (index < 0 || index >= this.haikuSelection.length) {
        log.warn(
          { index, haikuCount: this.haikuSelection.length },
          'Invalid index from GPT, falling back to first haiku',
        );
        index = 0;
        reason = `Default selection: index ${index} out of bounds`;
      }

      log.info({ selectedIndex: index, reason }, 'Selected haiku index');

      const generatedCount = this.haikuSelection.length;
      const allCandidates = this.haikuSelection.map((h) => ({
        verses: h.verses,
        book: { title: h.book.title, author: h.book.author },
        quality: h.quality,
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

      await this.enrichHaikuWithMetadata(haiku);

      return haiku;
    } catch (error) {
      log.error({ err: error }, 'OpenAI API error');
      this.haikuSelection = [];
      throw error;
    }
  }

  async enrichHaikuWithMetadata(haiku: HaikuValue): Promise<void> {
    const [descResult, transResult, emojisResult] = await Promise.allSettled([
      this.generateDescription(haiku.verses),
      this.generateTranslations(haiku.verses),
      this.generateBookmojis(haiku.book),
    ]);

    const verseFallback = haiku.verses.join(' / ');

    haiku.title =
      descResult.status === 'fulfilled'
        ? descResult.value.title
        : 'Untitled Haiku';
    haiku.description =
      descResult.status === 'fulfilled'
        ? descResult.value.description
        : 'A beautiful haiku';
    haiku.hashtags =
      descResult.status === 'fulfilled'
        ? descResult.value.hashtags
        : '#haiku #poetry #nature #zen #peaceful #gutenku';

    haiku.translations =
      transResult.status === 'fulfilled'
        ? transResult.value
        : {
            de: verseFallback,
            es: verseFallback,
            fr: verseFallback,
            it: verseFallback,
            jp: verseFallback,
          };

    haiku.book.emoticons =
      emojisResult.status === 'fulfilled' && emojisResult.value
        ? emojisResult.value
        : '';
  }

  private async generateSelectionPrompt(): Promise<string> {
    const haikus = await this.fetchHaikus();

    return buildSelectionPrompt(this.haikuSelection.length, haikus);
  }

  private async generateDescription(
    verses: string[],
  ): Promise<DescriptionResult> {
    return generateDescription(
      this.openai,
      this.MODEL,
      this.temperature,
      verses,
    );
  }

  private async generateTranslations(
    verses: string[],
  ): Promise<TranslationsResult> {
    return generateTranslations(
      this.openai,
      this.MODEL,
      this.temperature,
      verses,
    );
  }

  private async generateBookmojis(book: {
    title: string;
    author: string;
  }): Promise<string> {
    return generateBookmojis(
      this.openai,
      this.MODEL,
      this.EMOTICONS_TEMPERATURE,
      book,
    );
  }

  private async fetchHaikus(): Promise<string[]> {
    const haikus: string[] = [];
    const dbCandidates: HaikuValue[] = [];
    const liveCandidates: HaikuValue[] = [];

    if (this.fromDb > 0) {
      log.info(
        { fromDb: this.fromDb },
        'Fetching haikus from database (top 10%)',
      );
      const dbHaikus = await this.haikuRepository.extractTopScored(this.fromDb);
      dbCandidates.push(...dbHaikus);
      log.info({ count: dbCandidates.length }, 'Fetched haikus from database');
    }

    if (this.liveCount > 0) {
      log.info({ liveCount: this.liveCount }, 'Generating live haikus with GA');
      const liveHaikus = await this.fetchHaikusWithGAInternal();
      liveCandidates.push(...liveHaikus);
      log.info({ count: liveCandidates.length }, 'Generated live haikus');
    }

    const allCandidates = [...dbCandidates, ...liveCandidates];

    allCandidates.sort((a, b) => {
      const scoreA = a.quality?.totalScore ?? 0;
      const scoreB = b.quality?.totalScore ?? 0;

      return scoreB - scoreA;
    });

    this.haikuSelection = allCandidates.slice(0, this.GPT_SELECTION_POOL_SIZE);

    log.info(
      {
        dbCount: dbCandidates.length,
        liveCount: liveCandidates.length,
        totalCandidates: allCandidates.length,
        selectedForGPT: this.haikuSelection.length,
        topScores: this.haikuSelection.map((h) => h.quality?.totalScore ?? 0),
      },
      'Combined candidates for GPT selection',
    );

    for (const [i, haiku] of this.haikuSelection.entries()) {
      haikus.push(formatHaikuCandidate(haiku, i));
    }

    return haikus;
  }

  private async fetchHaikusWithGAInternal(): Promise<HaikuValue[]> {
    try {
      const seedHaiku = await this.haikuGeneratorService.buildFromDb();

      if (!seedHaiku || !seedHaiku.chapter) {
        log.warn('Failed to get seed haiku for GA');

        return [];
      }

      const versePools =
        this.haikuGeneratorService.extractVersePoolsFromContent(
          seedHaiku.chapter.content,
          seedHaiku.book.reference,
          seedHaiku.chapter.title || 'unknown',
        );

      log.info(
        {
          fiveCount: versePools.fiveSyllable.length,
          sevenCount: versePools.sevenSyllable.length,
          bookRef: seedHaiku.book.reference,
        },
        'Verse pools extracted for GA',
      );

      const gaService = new GeneticAlgorithmService(
        this.haikuGeneratorService.getNaturalLanguageService(),
        this.haikuGeneratorService.getMarkovEvaluator(),
        this.gaConfig,
      );

      const evolutionResult = await gaService.evolve(versePools);

      log.info(
        {
          generations: evolutionResult.finalPopulation.generation,
          convergenceGen: evolutionResult.convergenceGeneration,
          totalEvaluations: evolutionResult.totalEvaluations,
          executionTimeMs: evolutionResult.executionTimeMs,
          topFitness: evolutionResult.topCandidates[0]?.fitness ?? 0,
        },
        'GA evolution complete',
      );

      return evolutionResult.topCandidates.map((candidate) =>
        convertGAResultToHaikuValue(candidate, seedHaiku),
      );
    } catch (err) {
      log.error({ err }, 'GA evolution failed');

      return [];
    }
  }
}
