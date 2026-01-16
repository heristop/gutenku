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
  type DecodedHaiku,
  DEFAULT_GA_CONFIG,
} from '~/domain/services/genetic';

@singleton()
export default class OpenAIGeneratorService implements IGenerator {
  private readonly MAX_SELECTION_COUNT: number = 50;
  private readonly GPT_SELECTION_POOL_SIZE: number = 5;
  private readonly MODEL = 'gpt-5.2';
  private readonly DEFAULT_TEMPERATURE = 0.7;
  private readonly EMOTICONS_TEMPERATURE = 0.1;

  private haikuSelection: HaikuValue[] = [];
  private openai: IOpenAIClient;
  private selectionCount: number;
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

    if (selectionCount !== null && selectionCount > 0) {
      this.selectionCount = Math.min(selectionCount, this.MAX_SELECTION_COUNT);
    }

    if (selectionCount === null || selectionCount <= 0) {
      this.selectionCount = Number.parseInt(
        process.env.OPENAI_SELECTION_COUNT || '1',
        10,
      );
    }

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

      let index: number;
      let reason: string;

      try {
        // Extract JSON from response (may contain surrounding text)
        const jsonMatch = answer?.match(/\{[\s\S]*"id"[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : answer;
        const output = JSON.parse(jsonStr);
        index = output.id;
        reason = output.reason || '';
      } catch (parseError) {
        // Fallback: use first haiku (highest score from sorting)
        log.warn(
          { rawAnswer: answer, err: parseError },
          'JSON parse failed, using top-scored haiku',
        );
        index = 0;
        reason = 'Selected by score (parse error)';
      }

      // Validate index is within bounds
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

      // Store candidates with quality scores
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

    haiku.title = descResult.status === 'fulfilled' ? descResult.value.title : 'Untitled Haiku';
    haiku.description = descResult.status === 'fulfilled' ? descResult.value.description : 'A beautiful haiku';
    haiku.hashtags = descResult.status === 'fulfilled' ? descResult.value.hashtags : '#haiku #poetry #nature #zen #peaceful #gutenku';

    haiku.translations = transResult.status === 'fulfilled'
      ? transResult.value
      : { de: verseFallback, es: verseFallback, fr: verseFallback, it: verseFallback, jp: verseFallback };

    haiku.book.emoticons = (emojisResult.status === 'fulfilled' && emojisResult.value) ? emojisResult.value : '';
  }

  private async generateSelectionPrompt(): Promise<string> {
    const haikus = await this.fetchHaikus();
    const criteria = 'Nature imagery, word variety, opening strength, sentiment, grammar, flow (markov/trigram), sound patterns (alliteration), narrative coherence (verse distance), imagery density, line balance, verb usage, and overall tranquility/insight.';
    const prompt = `Select the best haiku from ${this.haikuSelection.length} candidates. Criteria: ${criteria}`;
    return `${prompt}\n(Format: {"id": <index_number>, "reason": "<why this haiku>"})\n${haikus.join('\n')}\nSTOP\n`;
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

  private async generateTranslations(verses: string[]): Promise<{ fr: string; jp: string; es: string; it: string; de: string }> {
    const outputFormat = '{"fr":"<french>","jp":"<rōmaji>","es":"<spanish>","it":"<italian>","de":"<german>"}';
    const prompt = `Translate this haiku (\\n separator): "${verses.join('\\n')}" (Format: ${outputFormat})`;
    const completion = await this.openai.chatCompletionsCreate({
      max_completion_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
      model: this.MODEL,
      temperature: this.temperature,
    });
    return JSON.parse(completion.choices[0].message.content);
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
    const dbCandidates: HaikuValue[] = [];
    const liveCandidates: HaikuValue[] = [];

    // Fetch from DB if requested
    if (this.fromDb > 0) {
      log.info({ fromDb: this.fromDb }, 'Fetching haikus from database (top 10%)');
      const dbHaikus = await this.haikuRepository.extractTopScored(this.fromDb);
      dbCandidates.push(...dbHaikus);
      log.info({ count: dbCandidates.length }, 'Fetched haikus from database');
    }

    // Generate live haikus with GA if requested
    if (this.liveCount > 0) {
      log.info({ liveCount: this.liveCount }, 'Generating live haikus with GA');
      const liveHaikus = await this.fetchHaikusWithGAInternal();
      liveCandidates.push(...liveHaikus);
      log.info({ count: liveCandidates.length }, 'Generated live haikus');
    }

    // Combine candidates
    const allCandidates = [...dbCandidates, ...liveCandidates];

    // Sort by totalScore descending
    allCandidates.sort((a, b) => {
      const scoreA = a.quality?.totalScore ?? 0;
      const scoreB = b.quality?.totalScore ?? 0;
      return scoreB - scoreA;
    });

    // Take top N for GPT selection
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

    // Format candidates with quality metrics
    for (const [i, haiku] of this.haikuSelection.entries()) {
      const entry = this.formatHaikuCandidate(haiku, i);
      haikus.push(entry);
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
        this.convertGAResultToHaikuValue(candidate, seedHaiku),
      );
    } catch (err) {
      log.error({ err }, 'GA evolution failed');
      return [];
    }
  }

  private convertGAResultToHaikuValue(
    gaResult: DecodedHaiku,
    seedHaiku: HaikuValue,
  ): HaikuValue {
    return {
      book: {
        reference: seedHaiku.book.reference,
        title: seedHaiku.book.title,
        author: seedHaiku.book.author,
        emoticons: seedHaiku.book.emoticons,
      },
      cacheUsed: false,
      chapter: seedHaiku.chapter,
      context: [], // Empty context for GA-generated haikus
      executionTime: 0,
      rawVerses: [...gaResult.verses],
      verses: [...gaResult.verses],
      quality: {
        totalScore: gaResult.fitness,
        natureWords: gaResult.metrics.natureWords,
        repeatedWords: gaResult.metrics.repeatedWords,
        weakStarts: gaResult.metrics.weakStarts,
        blacklistedVerses: gaResult.metrics.blacklistedVerses ?? 0,
        properNouns: gaResult.metrics.properNouns ?? 0,
        sentiment: gaResult.metrics.sentiment,
        grammar: gaResult.metrics.grammar,
        markovFlow: gaResult.metrics.markovFlow,
        trigramFlow: gaResult.metrics.trigramFlow,
        uniqueness: gaResult.metrics.uniqueness,
        alliteration: gaResult.metrics.alliteration,
        verseDistance: gaResult.metrics.verseDistance,
        lineLengthBalance: gaResult.metrics.lineLengthBalance,
        imageryDensity: gaResult.metrics.imageryDensity,
        semanticCoherence: gaResult.metrics.semanticCoherence,
        verbPresence: gaResult.metrics.verbPresence,
      },
      extractionMethod: 'genetic_algorithm',
    };
  }

  private formatHaikuCandidate(haiku: HaikuValue, index: number): string {
    const q = haiku.quality;
    const qualityDetails = this.formatQualityDetails(q);

    log.debug(
      { id: index, verses: haiku.verses, quality: q },
      'Haiku candidate with quality score',
    );

    return `[Id]: ${index}\n[Verses]: ${haiku.verses.join(' / ')}\n[Quality]: ${qualityDetails}\n`;
  }

  private formatQualityDetails(q?: HaikuValue['quality']): string {
    if (!q) {
      return 'nature_words=0, repeated_words=0, weak_starts=0, sentiment=0.50, grammar=0.00, markov_flow=0.00, trigram_flow=0.00, uniqueness=0.00, alliteration=0.00, verse_distance=0.00, line_balance=0.00, imagery=0.00, coherence=0.00, verb_presence=0.00, total_score=0.00';
    }
    const parts = [
      `nature_words=${q.natureWords}`,
      `repeated_words=${q.repeatedWords}`,
      `weak_starts=${q.weakStarts}`,
      `sentiment=${q.sentiment.toFixed(2)}`,
      `grammar=${q.grammar.toFixed(2)}`,
      `markov_flow=${q.markovFlow.toFixed(2)}`,
      `trigram_flow=${q.trigramFlow.toFixed(2)}`,
      `uniqueness=${q.uniqueness.toFixed(2)}`,
      `alliteration=${q.alliteration.toFixed(2)}`,
      `verse_distance=${q.verseDistance.toFixed(2)}`,
      `line_balance=${q.lineLengthBalance.toFixed(2)}`,
      `imagery=${q.imageryDensity.toFixed(2)}`,
      `coherence=${q.semanticCoherence.toFixed(2)}`,
      `verb_presence=${q.verbPresence.toFixed(2)}`,
      `total_score=${q.totalScore.toFixed(2)}`,
    ];
    return parts.join(', ');
  }
}
