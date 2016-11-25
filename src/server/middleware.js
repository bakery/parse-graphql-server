/* eslint arrow-parens: off, arrow-body-style: off, import/prefer-default-export: off */

import { graphqlExpress } from 'graphql-server-express';
import Parse from 'parse/node';
import { create as createQuery } from './lib/query';

export function setup({ schema }) {
  const isSchemaLegit = typeof schema === 'object';

  if (!isSchemaLegit) {
    throw new Error('Invalid schema');
  }

  return graphqlExpress(request => {
    const sessionToken = request.headers && request.headers.authorization;
    const baseOps = {
      schema,
      context: {
        Query: createQuery(null),
      },
    };

    if (!sessionToken) {
      return baseOps;
    }

    const q = new Parse.Query(Parse.Session).equalTo('sessionToken', sessionToken);

    return q.first({ useMasterKey: true }).then(session => session && session.get('user').fetch()).then(user => {
      return Object.assign(baseOps, {
        context: {
          Query: createQuery(sessionToken),
          sessionToken,
          user,
        },
      });
    });
  });
}
