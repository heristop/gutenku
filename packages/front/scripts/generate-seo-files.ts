import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.VITE_APP_URL || 'https://gutenku.xyz';

function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /
Crawl-delay: 1

Sitemap: ${BASE_URL}/sitemap.xml
`;
}

function generateLlmsTxt(): string {
  return `# GutenKu - AI Haiku Generator & Literary Guessing Game
# ${BASE_URL}

> GutenKu generates haikus from classic literature using AI and features GutenGuess, a daily book guessing game.

## Features
- AI haiku generation from Project Gutenberg classics
- Daily literary guessing game with emoji hints
- Share haikus on social media

## Main Pages
- /: Homepage with haiku generator and game preview
- /haiku: Generate haikus from classic literature themes
- /game: GutenGuess daily book guessing game

## Sitemap
${BASE_URL}/sitemap.xml
`;
}

const robotsTxt = generateRobotsTxt();
const llmsTxt = generateLlmsTxt();

const robotsPath = resolve(__dirname, '../public/robots.txt');
const llmsPath = resolve(__dirname, '../public/llms.txt');

writeFileSync(robotsPath, robotsTxt);
writeFileSync(llmsPath, llmsTxt);

console.log(`Generated ${robotsPath}`);
console.log(`Generated ${llmsPath}`);
