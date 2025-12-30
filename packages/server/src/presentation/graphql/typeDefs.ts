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

    type SelectionInfo {
        requestedCount: Int!
        generatedCount: Int!
        selectedIndex: Int!
        reason: String
    }

    type CandidateBook {
        title: String!
        author: String!
    }

    type HaikuCandidate {
        verses: [String!]!
        book: CandidateBook!
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
        selectionInfo: SelectionInfo
        candidates: [HaikuCandidate!]
    }

    type PuzzleHint {
        round: Int!
        type: String!
        content: String!
    }

    type DailyPuzzle {
        date: String!
        puzzleNumber: Int!
        hints: [PuzzleHint!]!
        haikus: [String!]!
        emoticonCount: Int!
    }

    type DailyPuzzleResponse {
        puzzle: DailyPuzzle!
        availableBooks: [Book!]!
    }

    type GuessResult {
        isCorrect: Boolean!
        correctBook: Book
        nextHint: PuzzleHint
        allHints: [PuzzleHint!]
    }

    type GlobalStats {
        totalHaikusGenerated: Int!
        totalGamesPlayed: Int!
        totalGamesWon: Int!
    }

    type Query {
        books(filter: String): [Book]
        book(id: ID!): Book!
        chapters(filter: String): [Chapter]
        chapter(id: ID!): Chapter!
        haiku(
            useAI: Boolean,
            useCache: Boolean,
            appendImg: Boolean,
            useImageAI: Boolean,
            selectionCount: Int,
            theme: String,
            filter: String,
            sentimentMinScore: Float,
            markovMinScore: Float,
            posMinScore: Float,
            trigramMinScore: Float,
            tfidfMinScore: Float,
            phoneticsMinScore: Float,
            descriptionTemperature: Float
        ): Haiku
        dailyPuzzle(date: String!, revealedRounds: [Int!]): DailyPuzzleResponse!
        submitGuess(date: String!, guessedBookId: ID!, currentRound: Int!): GuessResult!
        globalStats: GlobalStats!
    }

    type Subscription {
        quoteGenerated: String,
    }
`;

export default typeDefs;
