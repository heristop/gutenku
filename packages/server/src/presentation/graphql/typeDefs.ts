const typeDefs = `#graphql
    type Book {
        id: ID!
        reference: ID
        title: String
        author: String
        chapters: [Chapter!]!
        emoticons: String
        summary: String
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

    type HaikuQuality {
        natureWords: Int!
        repeatedWords: Int!
        weakStarts: Int!
        totalScore: Int!
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
        quality: HaikuQuality
    }

    type GlobalStats {
        totalHaikusGenerated: Int!
        totalGamesPlayed: Int!
        totalGamesWon: Int!
    }

    type PuzzleHint {
        round: Int!
        type: String!
        content: String!
    }

    type Puzzle {
        date: String!
        puzzleNumber: Int!
        hints: [PuzzleHint!]!
        haikus: [String!]!
        emoticonCount: Int!
        nextPuzzleAvailableAt: String!
    }

    type DailyPuzzleResponse {
        puzzle: Puzzle!
        availableBooks: [Book!]!
    }

    type GuessResult {
        isCorrect: Boolean!
        correctBook: Book
        nextHint: PuzzleHint
        allHints: [PuzzleHint!]
    }

    type PuzzleVersion {
        puzzleNumber: Int!
        version: String!
    }

    type HaikuVersion {
        date: String!
        version: String!
    }

    type Query {
        books(filter: String): [Book]
        book(id: ID!): Book!
        chapters(filter: String): [Chapter]
        chapter(id: ID!): Chapter!
        haiku(
            useAI: Boolean,
            useCache: Boolean,
            useDaily: Boolean,
            date: String,
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
        globalStats: GlobalStats!
        dailyPuzzle(date: String!, revealedRounds: [Int!], visibleEmoticonCount: Int, revealedHaikuCount: Int): DailyPuzzleResponse!
        submitGuess(date: String!, guessedBookId: ID!, currentRound: Int!): GuessResult!
        reduceBooks(date: String!): [Book!]!
        puzzleVersion(date: String!): PuzzleVersion!
        haikuVersion(date: String!): HaikuVersion!
    }

    type Subscription {
        quoteGenerated: String
    }
`;

export default typeDefs;
