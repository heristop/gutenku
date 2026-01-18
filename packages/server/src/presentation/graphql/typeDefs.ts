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
        blacklistedVerses: Int!
        properNouns: Int!
        verseLengthPenalty: Int!
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
        todayGamesPlayed: Int!
        todayGamesWon: Int!
        todayAverageEmoticonScratches: Float!
        todayAverageHaikuReveals: Float!
        todayAverageHints: Float!
        todayTotalHints: Int!
        weekHaikusGenerated: Int!
        weekGamesPlayed: Int!
        weekGamesWon: Int!
        weekAverageEmoticonScratches: Float!
        weekAverageHaikuReveals: Float!
        weekAverageHints: Float!
        weekTotalHints: Int!
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
        visibleIndices: [Int!]!
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
            fromDb: Int,
            liveCount: Int,
            theme: String,
            filter: String,
            extractionMethod: String,
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
        reduceBooks(date: String!, locale: String): [Book!]!
        puzzleVersion(date: String!): PuzzleVersion!
        haikuVersion(date: String!): HaikuVersion!
    }

    type HaikuProgress {
        currentIteration: Int!
        totalIterations: Int!
        bestScore: Float!
        bestHaiku: Haiku
        isComplete: Boolean!
        stopReason: String
    }

    type Subscription {
        haikuGeneration(iterations: Int!, theme: String, filter: String, useAI: Boolean): HaikuProgress!
    }

    type EmoticonRevealResult {
        emoticons: String!
        emoticonCount: Int!
        visibleIndices: [Int!]!
    }

    type Mutation {
        revealEmoticon(date: String!, scratchedPositions: [Int!]!): EmoticonRevealResult!
        revealHaiku(date: String!, index: Int!): String
    }
`;

export default typeDefs;
