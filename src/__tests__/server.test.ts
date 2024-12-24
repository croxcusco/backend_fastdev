import test from "node:test";

const { ApolloServer } = require('apollo-server');
const { createTestClient } = require('apollo-server-testing');
const { typeDefs, resolvers } = require('../schema'); // Ajusta la ruta según tu estructura
import { deepStrictEqual } from 'assert';
const server = new ApolloServer({ typeDefs, resolvers });
const { query, mutate } = createTestClient(server);

test('hello world query', async () => {
  const res = await query({ query: `{ hello }` });
  expect(res).toMatchObject({
    data: {
      hello: 'Hello world!'
    }
  });
});
function expect(res: any) {
  return {
    toMatchObject(expected: any) {
      try {
        deepStrictEqual(res, expected);
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Expected ${JSON.stringify(res)} to match ${JSON.stringify(expected)}. ${error.message}`);
        } else {
          throw error;
        }
      }
    }
  };
}
