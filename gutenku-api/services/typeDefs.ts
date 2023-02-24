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
    book: Book!
    chapter: Chapter!
    rawVerses: [String!]
    verses: [String!]
    image: String
    title: String
    description: String
  }

  type Log {
    id: ID!
    book_reference: String
    book_title: String
    book_author: String
    haiku_title: String
    haiku_description: String
    haiku_verses: [String!]
    haiku_image: String
    created_at: String
  }

  type Query {
    books: [Book]
    book(id: ID!): Book!
    chapters: [Chapter]
    haiku(useAI: Boolean): Haiku
    logs: [Log]
  }
`;

export default typeDefs;
