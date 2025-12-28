# GutenKu

## 🌸 Daily Haiku Card 🗻

<img src="/assets/img/daily_haiku_card.jpg?t=1766880001" width="300" alt="Daily Haiku Card">

Last Snapshot: `Sun, 28 Dec 2025 00:00:01 +0000`

> 👩‍🏫 “This haiku explores the tension between the pursuit of wisdom and the inherent contradictions within oneself. The speaker expresses a desire to learn from a higher source, perhaps nature or a spiritual being, as indicated by 'Thee'. The phrase 'To thy inward melody' suggests an appreciation of the deeper truths and harmonies within life that can guide personal growth. However, the concluding line, 'Perverseness too great', introduces a sense of struggle, acknowledging that the journey towards understanding is complicated by one's own flaws and contradictions. Overall, the haiku encapsulates the complexity of seeking enlightenment while grappling with the darker aspects of the self, presenting a poignant reflection on the human experience.”
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
