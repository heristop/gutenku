# GutenKu

## 🌸 Daily Haiku Card 🗻

<img src="/assets/img/daily_haiku_card.jpg?t=1767312002" width="300" alt="Daily Haiku Card">

Last Snapshot: `Fri, 02 Jan 2026 00:00:02 +0000`

> 👩‍🏫 “This haiku captures a moment of blissful tranquility, evoking the serene atmosphere of a paradise. The 'Paradisal air' suggests an idyllic setting filled with peace and purity. This evokes the idea that such joys are timeless and seek to last forever, as they inherently arise from an origin of boundless beauty and perfection. The poem reflects on the desire for such moments to be eternal, emphasizing the transient yet profound impact of pure happiness.”
>
> 🤖✒️ _Analysis Written by BotenKu, Your devoted Bot Literature Teacher_

Want more? Visit 🔗[gutenku.xyz](https://gutenku.xyz) or come back tomorrow 😉

---

## Description

GutenKu is a literature-inspired project that uses Natural Language Processing (NLP), Markov Chain algorithms, Vue.js, and MongoDB to generate haiku poetry. The project processes selected text data from Project Gutenberg to extract quotes, generate unique haiku, and offer sentiment analysis. GutenKu employs OpenAI to improve selection and provide descriptions for each haiku.

## How it works

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

## Ecosystem

[![Api](https://github.com/heristop/gutenku/actions/workflows/api.yaml/badge.svg)](https://github.com/heristop/gutenku/actions/workflows/api.yaml) [![Vue](https://github.com/heristop/gutenku/actions/workflows/vue.yaml/badge.svg)](https://github.com/heristop/gutenku/actions/workflows/vue.yaml)

| Application                                     | Env                                                                    |
| ----------------------------------------------- | ---------------------------------------------------------------------- |
| [Api](/packages/server/README.md#installation)  | TypeScript, GraphQL / Apollo Server, MongoDB, OpenAI                   |
| [Front](/packages/front/README.md#installation) | TypeScript, GraphQL / Apollo Client, Vue 3 / Tailwind / Pinia, Cypress |

## Acknowledgments

Thanks to the creators and maintainers of Project Gutenberg for providing the texts

---

<footer>
    <p>© 2023-2025 heristop / <a href="https://instagram.com/gutenku.poem" target="_blank">@gutenku.poem</a>. All rights reserved.</p>
</footer>
