const typeDefs = `#graphql
    type Book {
        id: ID!
        reference: ID
        title: String
        author: String
        chapters: [Chapter!]!
        emoticons: String
    }

    type Chapter {
        id: ID!
        title: String!
        content: String!
        book: Book
    }

    type Translations {
        fr: String
        jp: String
        es: String
        it: String
        de: String
    }

    type Haiku {
        book: Book!
        chapter: Chapter!
        verses: [String!]
        rawVerses: [String!]
        context: [String]
        image: String
        imagePath: String
        title: String
        description: String
        hashtags: String
        translations: Translations
        cacheUsed: Boolean
        executionTime: Float
    }

    type Query {
        books(filter: String): [Book]
        book(id: ID!): Book!
        chapters(filter: String): [Chapter]
        haiku(
            useAI: Boolean,
            useCache: Boolean,
            appendImg: Boolean,
            selectionCount: Int,
            theme: String,
            filter: String,
            sentimentMinScore: Float,
            markovMinScore: Float,
            descriptionTemperature: Float
        ): Haiku
    }

    type Subscription {
        quoteGenerated: String,
    }
`;

export default typeDefs;
