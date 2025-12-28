#!/usr/bin/env node
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import pc from 'picocolors';
import ora from 'ora';
import type { HaikuResponseData } from '~/shared/types';

dotenv.config();

try {
  console.log(pc.bold('\n🎋 Haiku Extraction\n'));

  // Fetch haiku with spinner
  const spinner = ora('Generating haiku...').start();

  const query = `
    query Query(
        $useAi: Boolean,
        $useCache: Boolean,
        $appendImg: Boolean
    ) {
        haiku(
            useAI: $useAi,
            useCache: $useCache,
            appendImg: $appendImg
        ) {
            book {
                title
                author
            }
            verses,
            rawVerses
            context
            chapter {
                title,
                content
            }
            executionTime
        }
    }
  `;

  const variables = {
    appendImg: false,
    useAi: false,
    useCache: false,
  };

  const body = {
    query: query,
    variables: variables,
  };

  const response = await fetch(
    process.env.SERVER_URI || 'http://localhost:4000/graphql',
    {
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    },
  );

  const data = (await response.json()) as { data: HaikuResponseData };
  const haiku = data.data?.haiku;

  if (!haiku) {
    spinner.fail(pc.red('Failed to generate haiku'));
    console.error(pc.red('\nError response:'), data);
    process.exit(1);
  }

  spinner.succeed(pc.green('Haiku generated'));

  // Display haiku
  console.log(pc.bold('\n═══ Generated Haiku ═══\n'));

  console.log(pc.cyan('  ' + haiku.verses.join('\n  ')));

  console.log(pc.dim(`\n  — ${haiku.book.title}`));
  console.log(pc.dim(`    by ${haiku.book.author}`));

  // Summary
  console.log(pc.bold('\n═══ Details ═══\n'));
  console.log(
    `${pc.dim('Execution time:')} ${pc.yellow(haiku.executionTime + 's')}`,
  );

  console.log(pc.bold(pc.green('\n✨ Done!\n')));
  process.exit(0);
} catch (error) {
  console.error(pc.red('\n✗ Fatal error:'), error);
  process.exit(1);
}
