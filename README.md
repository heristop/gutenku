# GutenKu

## 🌸 Daily Haiku Card 🗻

<img src="/assets/img/daily_haiku_card.jpg?t=1684326648" width="300" alt="Daily Haiku Card">

Last Snapshot: `Wed, 17 May 2023 12:30:48 +0000`

Want more? Visit [🔗gutenku.xyz](https://gutenku.xyz) or come back tomorrow 😉

## Description

GutenKu is a creative, literature-inspired project that uses Natural Language Processing (NLP), Markov Chain algorithms, Vue.js, and MongoDB to generate haiku poetry. The project scrapes selected text data from Project Gutenberg, a vast online library of free eBooks. This data is then processed to extract quotes, generate unique haiku, and offer sentiment analysis of the created poems. Furthermore, GutenKu employs OpenAI to improve selection and provide descriptions for each haiku. Ultimately, the application generates images of the haikus for posting on Instagram.

Haiku is a form of traditional Japanese poetry, consisting of three lines with a 5-7-5 syllable format. GutenKu respects this format while creating its poetry, ensuring an authentic haiku experience.

## How it works

GutenKu works by using Python to scrape text data from a whitelist of selected eBooks on Project Gutenberg. It then processes this data using a Markov Chain, a stochastic model that undergoes transitions from one state to another according to certain probabilistic rules. This model is used to match sentences with the best probability of transition.

The generated sentences are then further extracted using Natural Language Processing (NLP) techniques to split sentences into words, perform sentiment analysis, and ensure they follow the 5-7-5 syllable structure of traditional haiku. The syllable count is performed using the syllable library.

Chapters are stored in a MongoDB database, and Haiku generated too, with a cache system based on TTL (Time to Live) to improve performance. The system also uses OpenAI to improve haiku selection and provide descriptions for each haiku. Finally, the application generates images of the haikus ready for posting on Instagram.

The frontend of the application is built using Vue.js 3. It displays the generated haiku and provides users with options to generate new ones.

## API Endpoint

GutenKu provides a GraphQL API for interacting with the service. The server is built using Apollo Server, a community-driven, open-source GraphQL server that works with any GraphQL schema.

## Ecosystem

[![Api](https://github.com/heristop/gutenku/actions/workflows/api.yaml/badge.svg)](https://github.com/heristop/gutenku/actions/workflows/api.yaml) [![Vue](https://github.com/heristop/gutenku/actions/workflows/vue.yaml/badge.svg)](https://github.com/heristop/gutenku/actions/workflows/vue.yaml)

| Application                                     | Env                                                         |
| ----------------------------------------------- | ----------------------------------------------------------- |
| [Api](/packages/server/README.md#installation)  | TypeScript, Apollo Server, MongoDB, GraphQL, Python, OpenAI |
| [Front](/packages/front/README.md#installation) | TypeScript, Vue 3 / Vuetify 3 / Pinia, Cypress.io           |

## Acknowledgments

Thanks to the creators and maintainers of Project Gutenberg for providing the texts

---

![GutenKu Logo](/assets/logo/gutenku.png)

<footer>
    <p>© 2023 heristop / <a href="https://instagram.com/gutenku.poem" target="_blank">@gutenku.poem</a>. All rights reserved.</p>
</footer>
