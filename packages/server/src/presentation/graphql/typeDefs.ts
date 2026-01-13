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
        quality: HaikuQuality
    }

    type HaikuQuality {
        natureWords: Int!
        repeatedWords: Int!
        weakStarts: Int!
        sentiment: Float!
        grammar: Float!
        trigramFlow: Float!
        markovFlow: Float!
        uniqueness: Float!
        alliteration: Float!
        verseDistance: Float!
        lineLengthBalance: Float!
        imageryDensity: Float!
        semanticCoherence: Float!
        verbPresence: Float!
        totalScore: Float!
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
        extractionMethod: String
    }

    type GlobalStats {
        totalHaikusGenerated: Int!
        totalGamesPlayed: Int!
        totalGamesWon: Int!
        totalEmoticonScratches: Int!
        totalHaikuReveals: Int!
        todayHaikusGenerated: Int!
        todayAverageEmoticonScratches: Float!
        todayAverageHaikuReveals: Float!
        todayGamesPlayed: Int!
        todayGamesWon: Int!
        todayTotalHints: Int!
    }

    input HintUsageInput {
        emoticonScratches: Int!
        haikuReveals: Int!
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
            uniquenessMinScore: Float,
            verseDistanceMinScore: Float,
            lineLengthBalanceMinScore: Float,
            imageryDensityMinScore: Float,
            semanticCoherenceMinScore: Float,
            verbPresenceMinScore: Float,
            descriptionTemperature: Float
        ): Haiku
        globalStats: GlobalStats!
        dailyPuzzle(date: String!, revealedRounds: [Int!], visibleEmoticonCount: Int, revealedHaikuCount: Int, locale: String): DailyPuzzleResponse!
        submitGuess(date: String!, guessedBookId: ID!, currentRound: Int!, hints: HintUsageInput, locale: String): GuessResult!
        reduceBooks(date: String!): [Book!]!
        puzzleVersion(date: String!): PuzzleVersion!
        haikuVersion(date: String!): HaikuVersion!
        verifyEmail(token: String!): SubscriptionResult!
        unsubscribeEmail(token: String!): SubscriptionResult!
    }

    type HaikuProgress {
        currentIteration: Int!
        totalIterations: Int!
        bestScore: Float!
        bestHaiku: Haiku
        isComplete: Boolean!
    }

    type Subscription {
        haikuGeneration(iterations: Int!, theme: String, filter: String): HaikuProgress!
    }

    type SubscriptionResult {
        success: Boolean!
        message: String!
    }

    type Mutation {
        subscribeEmail(email: String!): SubscriptionResult!
    }
`;

export default typeDefs;
