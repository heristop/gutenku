# GutenKu

<p align="center">
  <img src="/assets/img/gutenmage.webp" width="280" alt="GutenMage illustration">
</p>

<p align="center">
  <em>Haiku poetry crafted from classic literature</em>
</p>

<p align="center">
  <a href="https://github.com/heristop/gutenku/actions/workflows/server.yaml"><img src="https://github.com/heristop/gutenku/actions/workflows/server.yaml/badge.svg" alt="Server"></a>
  <a href="https://github.com/heristop/gutenku/actions/workflows/front.yaml"><img src="https://github.com/heristop/gutenku/actions/workflows/front.yaml/badge.svg" alt="Front"></a>
  <a href="https://github.com/heristop/gutenku/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-GPL--3.0-blue.svg" alt="License"></a>
</p>

<p align="center">
  <a href="https://gutenku.xyz">gutenku.xyz</a>
</p>

---

## Daily Haiku Card

<img src="/assets/img/daily_haiku_card.jpg?t=1767139201" width="300" alt="Daily Haiku Card">

<details>
<summary>Read AI Analysis</summary>

> "This haiku captures a moment of profound emotional release and acceptance. The first line, 'His soul was at peace,' suggests a deep sense of inner tranquility and reconciliation with one's circumstances or emotions. The imagery of 'his head tilted far back' evokes a physical gesture often associated with surrender or openness to the universe, perhaps signaling a connection to something greater than oneself. Finally, 'Through a film of tears' introduces a poignant contrast, as tears typically represent sorrow or emotional turmoil. However, within this context, they also signify a cleansing or cathartic experience, suggesting that peace can coexist with sadness, and that through embracing one's vulnerability, one can find serenity."
>
> _— BotenKu, Your devoted Bot Literature Teacher_

</details>

---

## About

GutenKu transforms classic literature from Project Gutenberg into haiku poetry using NLP, Markov Chain algorithms, and OpenAI for enhanced selection and descriptions.

## Features

- **AI-Powered Selection** — OpenAI refines haiku choices and generates poetic narratives
- **Daily Puzzle Game** — Guess the source book from haiku clues
- **Shareable Cards** — Generate beautiful image cards for social media
- **Sentiment Analysis** — Score and filter haikus by emotional tone

## How It Works

1. **Scrape** — Collect texts from a curated whitelist of eBooks on Project Gutenberg
2. **Process** — Apply Markov Chain to sequence sentences with highest transition probabilities
3. **Structure** — Enforce traditional 5-7-5 syllable structure via NLP
4. **Enhance** — Refine selection and generate narratives with OpenAI
5. **Generate** — Create shareable image cards

## Quick Start

```bash
git clone https://github.com/heristop/gutenku.git
cd gutenku
make install
make dev
```

Run `make help` for all available commands.

## Tech Stack

| Package                              | Technologies                                        |
| ------------------------------------ | --------------------------------------------------- |
| [Server](/packages/server/README.md) | TypeScript, GraphQL, Apollo Server, MongoDB, OpenAI |
| [Front](/packages/front/README.md)   | TypeScript, Vue 3, Pinia, URQL, Cypress             |

## Acknowledgments

Thanks to the creators and maintainers of [Project Gutenberg](https://www.gutenberg.org/) for providing the texts.

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  © 2023-2026 heristop / <a href="https://instagram.com/gutenku.poem">@gutenku.poem</a>
</p>
