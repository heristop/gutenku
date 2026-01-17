import { gql } from '@urql/vue';

export const HAIKU_VERSION_QUERY = gql`
  query HaikuVersion($date: String!) {
    haikuVersion(date: $date) {
      date
      version
    }
  }
`;

export const DAILY_HAIKU_QUERY = gql`
  query Query(
    $useCache: Boolean
    $useDaily: Boolean
    $date: String
    $theme: String
  ) {
    haiku(useCache: $useCache, useDaily: $useDaily, date: $date, theme: $theme) {
      book {
        reference
        title
        author
        emoticons
      }
      chapter {
        content
        title
      }
      verses
      rawVerses
      image
      title
      description
      hashtags
      translations {
        fr
        jp
        es
      }
      cacheUsed
      executionTime
      quality {
        natureWords
        repeatedWords
        weakStarts
        sentiment
        grammar
        trigramFlow
        markovFlow
        uniqueness
        alliteration
        verseDistance
        lineLengthBalance
        imageryDensity
        semanticCoherence
        verbPresence
        totalScore
      }
    }
  }
`;

export const ITERATIVE_HAIKU_SUBSCRIPTION = gql`
  subscription HaikuGeneration(
    $iterations: Int!
    $theme: String
    $filter: String
    $useAI: Boolean
  ) {
    haikuGeneration(
      iterations: $iterations
      theme: $theme
      filter: $filter
      useAI: $useAI
    ) {
      currentIteration
      totalIterations
      bestScore
      isComplete
      stopReason
      bestHaiku {
        book {
          reference
          title
          author
          emoticons
        }
        chapter {
          content
          title
        }
        verses
        rawVerses
        image
        title
        description
        hashtags
        translations {
          fr
          jp
          es
        }
        cacheUsed
        executionTime
        quality {
          natureWords
          repeatedWords
          weakStarts
          sentiment
          grammar
          trigramFlow
          markovFlow
          uniqueness
          alliteration
          verseDistance
          lineLengthBalance
          imageryDensity
          semanticCoherence
          verbPresence
          totalScore
        }
      }
    }
  }
`;
