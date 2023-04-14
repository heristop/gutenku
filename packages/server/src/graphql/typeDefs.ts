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
        es: String
    }

    type Haiku {
        book: Book!
        chapter: Chapter!
        useCache: Boolean
        rawVerses: [String!]
        verses: [String!]
        image: String
        imagePath: String
        title: String
        description: String
        hashtags: String
        translations: Translations
    }

    type Query {
        books(content: String): [Book]
        book(id: ID!): Book!
        chapters(content: String): [Chapter]
        haiku(
            useAI: Boolean,
            skipCache: Boolean,
            appendImg: Boolean,
            selectionCount: Int,
            theme: String
        ): Haiku
    }
`;

export default typeDefs;
