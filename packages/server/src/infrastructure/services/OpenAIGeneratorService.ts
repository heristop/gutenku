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
  private temperature: number = this.DEFAULT_TEMPERATURE;

  // GA configuration (always enabled)
  private gaConfig: Partial<GAConfig> = {};

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
    }

    if (selectionCount === null || selectionCount <= 0) {
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

    // Configure GA using constants (always enabled)
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

    if (descResult.status === 'fulfilled') {
      haiku.title = descResult.value.title;
      haiku.description = descResult.value.description;
      haiku.hashtags = descResult.value.hashtags;
    }

    if (descResult.status !== 'fulfilled') {
      haiku.title = 'Untitled Haiku';
      haiku.description = 'A beautiful haiku';
      haiku.hashtags = '#haiku #poetry #nature #zen #peaceful #gutenku';
    }

    if (transResult.status === 'fulfilled') {
      haiku.translations = transResult.value;
    }

    if (transResult.status !== 'fulfilled') {
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
    }

    if (emojisResult.status !== 'fulfilled' || !emojisResult.value) {
      haiku.book.emoticons = '';
    }
  }

  private async generateSelectionPrompt(): Promise<string> {
    const haikus = await this.fetchHaikus();

    const prompt = `Select the best haiku from these ${this.haikuSelection.length} top-scored candidates (pre-filtered from ${this.selectionCount}). Evaluation criteria:
- Nature imagery (nature_words: count of seasonal/natural terms)
- Word variety (repeated_words: repetition count, uniqueness: ratio of unique words)
- Opening strength (weak_starts: count of weak opening words)
- Sentiment (sentiment: 0-1 scale)
- Grammar (grammar: noun+verb presence)
- Flow (markov_flow, trigram_flow: transition probability scores)
- Sound patterns (alliteration: phonetic repetition score)
- Narrative coherence (verse_distance: quote proximity, coherence: word overlap)
- Imagery (imagery: sensory word density)
- Line balance (line_balance: character length consistency)
- Verb usage (verb_presence: active verb count)
- Overall: tranquility and moment of insight`;

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
    // Always use GA for haiku selection (faster + better quality)
    return this.fetchHaikusWithGA();
  }

  /**
   * Traditional haiku fetching - random sampling from multiple generations
   */
  private async fetchHaikusTraditional(): Promise<string[]> {
    const haikus: string[] = [];

    log.info(
      { selectionCount: this.selectionCount },
      'Generating haikus for AI selection (traditional)',
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
        }

        if (!haiku) {
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

    // Sort by totalScore descending
    this.haikuSelection.sort((a, b) => {
      const scoreA = a.quality?.totalScore ?? 0;
      const scoreB = b.quality?.totalScore ?? 0;
      return scoreB - scoreA;
    });

    const topCandidates = this.haikuSelection.slice(
      0,
      this.GPT_SELECTION_POOL_SIZE,
    );

    log.info(
      {
        totalGenerated: this.haikuSelection.length,
        topCandidatesCount: topCandidates.length,
        topScores: topCandidates.map((h) => h.quality?.totalScore ?? 0),
      },
      'Selected top candidates for GPT',
    );

    this.haikuSelection = topCandidates;

    // Format candidates with quality metrics
    for (const [i, haiku] of this.haikuSelection.entries()) {
      const entry = this.formatHaikuCandidate(haiku, i);
      haikus.push(entry);
    }

    return haikus;
  }

  /**
   * Fetch haikus using Genetic Algorithm for optimized selection
   */
  private async fetchHaikusWithGA(): Promise<string[]> {
    const haikus: string[] = [];

    log.info(
      { gaConfig: this.gaConfig },
      'Generating haikus using Genetic Algorithm',
    );

    try {
      // First, generate one haiku traditionally to get a book/chapter context
      const seedHaiku = await this.haikuGeneratorService.buildFromDb();

      if (!seedHaiku || !seedHaiku.chapter) {
        log.warn(
          'Failed to get seed haiku for GA, falling back to traditional',
        );
        return this.fetchHaikusTraditional();
      }

      // Extract verse pools from the same chapter
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

      // Create and run the GA
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

      // Convert GA results to HaikuValue format
      this.haikuSelection = evolutionResult.topCandidates.map((candidate) =>
        this.convertGAResultToHaikuValue(candidate, seedHaiku),
      );

      // Format candidates with quality metrics
      for (const [i, haiku] of this.haikuSelection.entries()) {
        const entry = this.formatHaikuCandidate(haiku, i);
        haikus.push(entry);
      }

      return haikus;
    } catch (err) {
      log.error({ err }, 'GA evolution failed, falling back to traditional');
      return this.fetchHaikusTraditional();
    }
  }

  /**
   * Convert GA DecodedHaiku to HaikuValue format
   */
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
