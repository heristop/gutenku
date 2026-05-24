/**
 * Helpers for post-haiku CLI: GraphQL query/variables construction,
 * quality score display, candidate display, and translation display.
 */
import pc from 'picocolors';
import { capitalizeVerse } from '~/shared/helpers/HaikuHelper';
import type { HaikuResponseData } from '~/shared/types';

type Haiku = NonNullable<HaikuResponseData['haiku']>;

export const GRAPHQL_QUERY = `
    query Query(
        $useAi: Boolean,
        $useCache: Boolean,
        $appendImg: Boolean,
        $useImageAI: Boolean,
        $selectionCount: Int,
        $fromDb: Int,
        $liveCount: Int,
        $theme: String
    ) {
        haiku(
            useAI: $useAi,
            useCache: $useCache,
            appendImg: $appendImg,
            useImageAI: $useImageAI,
            selectionCount: $selectionCount,
            fromDb: $fromDb,
            liveCount: $liveCount,
            theme: $theme
        ) {
            book {
                title
                author
                emoticons
            }
            verses
            title
            description
            image
            hashtags
            translations {
                fr
                jp
                es
                it
                de
            }
            quality {
                natureWords
                repeatedWords
                weakStarts
                blacklistedVerses
                properNouns
                sentiment
                grammar
                trigramFlow
                markovFlow
                uniqueness
                alliteration
                verseDistance
                lineLengthBalance
                imageryDensity
                semanticCoherence
                verbPresence
                totalScore
            }
            selectionInfo {
                requestedCount
                generatedCount
                selectedIndex
                reason
            }
            candidates {
                verses
                book {
                    title
                    author
                }
                quality {
                    natureWords
                    repeatedWords
                    weakStarts
                    sentiment
                    markovFlow
                    totalScore
                }
            }
        }
    }
`;

export interface CliOptions {
  selectionCount?: string;
  fromDb?: string;
  live?: string;
  theme?: string;
  aiDescription?: boolean;
  withImageAi?: boolean;
  cache?: boolean;
}

export interface QueryVariables {
  appendImg: boolean;
  selectionCount: number | undefined;
  fromDb: number | undefined;
  liveCount: number | undefined;
  theme: string | undefined;
  useAi: boolean | undefined;
  useImageAI: boolean | undefined;
  useCache: boolean | undefined;
}

export function buildVariables(options: CliOptions): QueryVariables {
  return {
    appendImg: true,
    selectionCount: options.selectionCount
      ? Number.parseInt(options.selectionCount, 10)
      : undefined,
    fromDb: options.fromDb ? Number.parseInt(options.fromDb, 10) : undefined,
    liveCount: options.live ? Number.parseInt(options.live, 10) : undefined,
    theme: options.theme,
    useAi: options.aiDescription,
    useImageAI: options.withImageAi,
    useCache: options.cache,
  };
}

export function displayCandidates(
  haiku: Haiku,
  cacheEnabled: boolean,
): void {
  const shouldShow =
    haiku.candidates &&
    haiku.candidates.length > 0 &&
    (!cacheEnabled || haiku.selectionInfo);

  if (!shouldShow || !haiku.candidates) {
    return;
  }

  const headerText = !cacheEnabled
    ? `Top ${haiku.candidates.length} Candidates (scored & filtered)`
    : 'All Candidates';
  console.log(pc.bold(`\n═══ ${headerText} ═══\n`));

  const selectedIndex = haiku.selectionInfo?.selectedIndex ?? -1;

  haiku.candidates.forEach((candidate, i) => {
    const isSelected = i === selectedIndex;
    const marker = isSelected ? pc.green('★ SELECTED') : '';
    const indexStr = isSelected
      ? pc.green(pc.bold(`#${i + 1}`))
      : pc.dim(`#${i + 1}`);
    const bookInfo = pc.dim(`(${candidate.book.title})`);

    const q = candidate.quality;
    const scoreInfo = q
      ? pc.magenta(
          ` [score: ${q.totalScore?.toFixed(1)} | nature: ${q.natureWords} | flow: ${q.markovFlow?.toFixed(1)} | sentiment: ${q.sentiment?.toFixed(2)}]`,
        )
      : '';

    console.log(`${indexStr} ${marker} ${bookInfo}${scoreInfo}`);
    candidate.verses.forEach((verse) => {
      const displayVerse = capitalizeVerse(verse);
      const verseText = isSelected
        ? pc.cyan(`  ${displayVerse}`)
        : pc.dim(`  ${displayVerse}`);
      console.log(verseText);
    });
    console.log();
  });

  if (haiku.selectionInfo?.reason) {
    console.log(pc.yellow('💡 Selection reason:'));
    console.log(pc.italic(`   ${haiku.selectionInfo.reason}\n`));
  }
}

const fmt = (value: number | undefined, digits = 3): string =>
  value === undefined ? '' : value.toFixed(digits);

const intOrZero = (value: number | undefined): string => String(value ?? 0);

export function displayQuality(haiku: Haiku): void {
  if (!haiku.quality) {
    return;
  }

  const q = haiku.quality;
  console.log(pc.bold('\n═══ Quality Score ═══\n'));
  console.log(pc.green(`  Total Score: ${fmt(q.totalScore, 2)}`));
  console.log(pc.dim('  ─────────────────────────────────'));
  console.log(`  ${pc.dim('Nature Words:')}     ${q.natureWords}`);
  console.log(`  ${pc.dim('Repeated Words:')}   ${q.repeatedWords}`);
  console.log(`  ${pc.dim('Weak Starts:')}      ${q.weakStarts}`);
  console.log(`  ${pc.dim('Blacklisted:')}      ${intOrZero(q.blacklistedVerses)}`);
  console.log(`  ${pc.dim('Proper Nouns:')}     ${intOrZero(q.properNouns)}`);
  console.log(pc.dim('  ─────────────────────────────────'));
  console.log(`  ${pc.dim('Sentiment:')}        ${fmt(q.sentiment)}`);
  console.log(`  ${pc.dim('Grammar:')}          ${fmt(q.grammar)}`);
  console.log(`  ${pc.dim('Markov Flow:')}      ${fmt(q.markovFlow)}`);
  console.log(`  ${pc.dim('Trigram Flow:')}     ${fmt(q.trigramFlow)}`);
  console.log(`  ${pc.dim('Uniqueness:')}       ${fmt(q.uniqueness)}`);
  console.log(`  ${pc.dim('Alliteration:')}     ${fmt(q.alliteration)}`);
  console.log(`  ${pc.dim('Verse Distance:')}   ${fmt(q.verseDistance)}`);
  console.log(`  ${pc.dim('Line Balance:')}     ${fmt(q.lineLengthBalance)}`);
  console.log(`  ${pc.dim('Imagery Density:')}  ${fmt(q.imageryDensity)}`);
  console.log(`  ${pc.dim('Sem. Coherence:')}   ${fmt(q.semanticCoherence)}`);
  console.log(`  ${pc.dim('Verb Presence:')}    ${fmt(q.verbPresence)}`);
}

export function displayTranslations(haiku: Haiku): void {
  if (!haiku.translations) {
    return;
  }

  console.log(pc.bold('\n═══ Translations ═══\n'));

  if (haiku.translations.fr) {
    console.log(`${pc.dim('FR:')} ${haiku.translations.fr}`);
  }

  if (haiku.translations.jp) {
    console.log(`${pc.dim('JP:')} ${haiku.translations.jp}`);
  }

  if (haiku.translations.es) {
    console.log(`${pc.dim('ES:')} ${haiku.translations.es}`);
  }

  if (haiku.translations.it) {
    console.log(`${pc.dim('IT:')} ${haiku.translations.it}`);
  }

  if (haiku.translations.de) {
    console.log(`${pc.dim('DE:')} ${haiku.translations.de}`);
  }
}
