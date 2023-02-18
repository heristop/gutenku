const typeDefs = `#graphql
  type Book {
    id: ID!
    reference: ID
    title: String
    author: String
    chapters: [Chapter]
  }

  type Chapter {
    id: ID!
    title: String!
    content: String!
  }

  type Haiku {
    book: Book
    chapter: Chapter!
    rawVerses: [String!]
    verses: [String!]
    image: String
    meaning: String
  }

  type Query {
    books: [Book]
    book(id: ID!): Book!
    chapters: [Chapter]
    haiku(useAI: Boolean): Haiku
  }
`;

export default typeDefs;
