const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
require('dotenv').config();
const db = require('./db');

const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

let notes = [
  {
    id: '1',
    content: '안녕하세요 멋쟁이사자처럼 최주현입니다.',
    author: 'Joohyun'
  },
  {
    id: '2',
    content: '안녕하세요 멋쟁이사자처럼 여다희입니다.',
    author: 'Dahee'
  },
  {
    id: '3',
    content: '안녕하세요 멋쟁이사자처럼 김난영입니다.',
    author: 'Nanyoung'
  }
];

const typeDefs = gql`
  type Note {
    id: ID!
    content: String!
    author: String!
  }

  type Query {
    hello: String!
    notes: [Note!]!
    note(id: ID!): Note!
  }

  type Mutation {
    newNote(content: String!): Note!
  }
`;

const resolvers = {
  Query: {
    hello: () => 'Hello, My name is Joohyun',
    notes: () => notes,
    note: (parent, args) => {
      return notes.find(note => note.id === args.id);
    }
  },
  Mutation: {
    newNote: (parent, args) => {
      let noteValue = {
        id: String(notes.length + 1),
        content: args.content,
        author: 'Joohyun'
      };
      notes.push(noteValue);
      return noteValue;
    }
  }
};

const app = express();

db.connect(DB_HOST);

const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app, path: '/api' });

app.listen({ port }, () =>
  console.log(
    `GraphQL Server running at http://localhost:${port}${server.graphqlPath}`
  )
);
