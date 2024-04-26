# GutenKu

## 🌸 Daily Haiku Card 🗻

<img src="/assets/img/daily_haiku_card.jpg?t=1714089601" width="300" alt="Daily Haiku Card">

Last Snapshot: `Fri, 26 Apr 2024 00:00:01 +0000`

> 👩‍🏫 “This haiku captures a moment of reflection and satisfaction following an event that has just concluded. The first line, 'I am done with that,' suggests a sense of completion or closure, indicating that the speaker has finished an experience or task. The brevity of the line, coupled with the finality of 'done,' emphasizes a clean break from what has passed. The second line, 'It was a glorious night,' introduces a nostalgic tone, as the speaker reminisces about the night's splendor. The word 'glorious' conveys a sense of grandeur and joy, hinting that the event was deeply fulfilling or enjoyable. The third line, 'Must be delightful,' shifts the perspective slightly, suggesting a contemplative stance. It could be interpreted as the speaker reassuring themselves of the night's delight or perhaps speculating that others would also find joy in such an experience. The haiku leaves the nature of the 'glorious night' to the reader's imagination, allowing for a personal connection to the sentiment expressed.”
>
> _Analysis Written by BotenKu, your devoted Literature Teacher_

Want more? Visit 🔗[gutenku.xyz](https://gutenku.xyz) or come back tomorrow 😉

---

## Description

GutenKu is a creative, literature-inspired project that uses Natural Language Processing (NLP), Markov Chain algorithms, Vue.js, and MongoDB to generate haiku poetry. The project scrapes selected text data from Project Gutenberg, a vast online library of free eBooks. This data is then processed to extract quotes, generate unique haiku, and offer sentiment analysis of the created poems. Furthermore, GutenKu employs OpenAI to improve selection and provide descriptions for each haiku. Ultimately, the application generates images of the haikus.

![Preview](https://github.com/heristop/gutenku/blob/main/assets/img/homepage.jpg?raw=true)

## How it works

GutenKu operates by leveraging Python to scrape textual data from a curated whitelist of eBooks on Project Gutenberg. This gathered data is then processed through a Markov Chain, a probabilistic model that transitions from one state to another based on defined rules. The model is employed to identify and sequence sentences with the highest transition probabilities.

Once sentences are generated, Natural Language Processing (NLP) techniques come into play. These techniques disassemble sentences into words, conduct sentiment analysis, and enforce the traditional 5-7-5 syllable structure of a haiku. The syllable counting is facilitated by the syllable library.

The processed chapters are stored in a MongoDB database, along with the generated haikus, improving the application's performance with a cache system based on TTL principles. GutenKu also incorporates OpenAI api to enhance haiku selection and to generate descriptive narratives for each haiku. In the final stage, the application creates ready-to-post images of the haikus.

The user-facing side of the application is powered by Vue.js 3, providing an interactive interface that not only displays the generated haikus. It also offers an advanced mode for more personalized and unique results.

## API Endpoint

GutenKu provides a GraphQL API for interacting with the service. The server is built using Apollo Server, a community-driven, open-source GraphQL server that works with any GraphQL schema.

## Ecosystem

[![Api](https://github.com/heristop/gutenku/actions/workflows/api.yaml/badge.svg)](https://github.com/heristop/gutenku/actions/workflows/api.yaml) [![Vue](https://github.com/heristop/gutenku/actions/workflows/vue.yaml/badge.svg)](https://github.com/heristop/gutenku/actions/workflows/vue.yaml)

| Application                                     | Env                                                                        |
| ----------------------------------------------- | -------------------------------------------------------------------------- |
| [Api](/packages/server/README.md#installation)  | TypeScript, GraphQL / Apollo Server, MongoDB, Python, OpenAI 4             |
| [Front](/packages/front/README.md#installation) | TypeScript, GraphQL / Apollo Client, Vue 3 / Vuetify 3 / Pinia, Cypress.io |

## Acknowledgments

Thanks to the creators and maintainers of Project Gutenberg for providing the texts

---

![GutenKu Logo](/assets/logo/gutenku.png)

<footer>
    <p>© 2023 heristop / <a href="https://instagram.com/gutenku.poem" target="_blank">@gutenku.poem</a>. All rights reserved.</p>
</footer>
