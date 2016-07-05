import { GraphQLSchema } from 'graphql';
import graphqlHTTP from 'express-graphql';
import Parse from 'parse/node';
import { create as createQuery } from './lib/query';

export function setup({ schema, graphiql = false }) {
  const isSchemaLegit = schema instanceof GraphQLSchema;

  if (!isSchemaLegit) {
    throw new Error('Invalid schema');
  }

  return graphqlHTTP(request => {
    const sessionToken = request.headers && request.headers.authorization;
    const baseOps = {
      schema,
      graphiql,
      context: {
        Query: Parse.Query,
      },
    };

    if (!sessionToken) {
      return baseOps;
    }

    const q = new Parse.Query(Parse.Session).equalTo('sessionToken', sessionToken);
    return q.first({ useMasterKey: true }).then(
      () => Object.assign(baseOps, {
        context: {
          Query: createQuery(sessionToken),
          sessionToken,
        },
      })
    );
  });
}
