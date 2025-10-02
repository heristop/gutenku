# GutenKu

## 🌸 Daily Haiku Card 🗻

<img src="/assets/img/daily_haiku_card.jpg?t=1759363202" width="300" alt="Daily Haiku Card">

Last Snapshot: `Thu, 02 Oct 2025 00:00:02 +0000`

> 👩‍🏫 “This haiku captures a moment of reflection and subjective interpretation. The speaker observes a day that appears to be filled with pleasantness, suggesting an appreciation for the beauty in simplicity. The phrase 'as it seemed to me' introduces a personal lens, indicating that this perception may not be universally shared. The repetition of 'very pleasant' emphasizes the joy found in the moment, while 'however perfect' introduces a hint of irony or contemplation, suggesting that perfection is elusive or perhaps unattainable. This juxtaposition invites readers to consider the nature of happiness and the subjective experience of reality, prompting deeper thought about the meaning of a 'perfect' day. Overall, the haiku invites readers to reflect on their own perceptions and the fleeting nature of bliss.”
>
> 🤖✒️ _Analysis Written by BotenKu, Your devoted Bot Literature Teacher_

Want more? Visit 🔗[gutenku.xyz](https://gutenku.xyz) or come back tomorrow 😉

---

## Description

GutenKu is a creative, literature-inspired project that uses Natural Language Processing (NLP), Markov Chain algorithms, Vue.js, and MongoDB to generate haiku poetry. The project scrapes selected text data from Project Gutenberg, a vast online library of free eBooks. This data is then processed to extract quotes, generate unique haiku, and offer sentiment analysis of the created poems. Furthermore, GutenKu employs OpenAI to improve selection and provide descriptions for each haiku. Ultimately, the application generates images of the haikus.

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

### Architecture & DI docs

See the server’s DDD and DI documentation, interface tokens, and event flow:

- packages/server/README.md#architecture--di-ddd

## Acknowledgments

Thanks to the creators and maintainers of Project Gutenberg for providing the texts

---

<footer>
    <p>© 2023-2025 heristop / <a href="https://instagram.com/gutenku.poem" target="_blank">@gutenku.poem</a>. All rights reserved.</p>
</footer>
