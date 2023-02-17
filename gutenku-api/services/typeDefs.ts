const typeDefs = `#graphql
  type Book {
    id: ID!
    reference: String
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
    raw_verses: [String!]
    verses: [String!]
    image: String
  }

  type Query {
    books: [Book]
    book(id: ID!): Book!
    chapters: [Chapter]
    haiku: Haiku
  }
`;

export default typeDefs;
