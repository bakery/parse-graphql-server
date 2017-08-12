/* eslint arrow-parens: off, arrow-body-style: off, import/prefer-default-export: off */

import { graphqlExpress } from 'graphql-server-express';
import Parse from 'parse/node';
import { create as createQuery } from './lib/query';

function buildAdditionalContext(baseContext, additionalContextFactory) {
  if (!additionalContextFactory) {
    return {};
  }

  return (typeof additionalContextFactory) === 'function' ? additionalContextFactory(baseContext) :
    additionalContextFactory;
}

export function setup({ schema, context }) {
  const isSchemaLegit = typeof schema === 'object';

  if (!isSchemaLegit) {
    throw new Error('Invalid schema');
  }

  return graphqlExpress(request => {
    const sessionToken = request.headers && request.headers.authorization;
    let baseContext = { Query: createQuery(null) };
    const baseOps = {
      schema,
      context: Object.assign({}, baseContext, buildAdditionalContext(baseContext, context)),
    };

    if (!sessionToken) {
      return baseOps;
    }

    const q = new Parse.Query(Parse.Session).equalTo('sessionToken', sessionToken);

    return q.first({ useMasterKey: true }).then(session => session && session.get('user').fetch()).then(user => {
      baseContext = {
        Query: createQuery(sessionToken),
        sessionToken,
        user,
      };
      return Object.assign(baseOps, {
        context: Object.assign({}, baseContext, buildAdditionalContext(baseContext, context)),
      });
    });
  });
}
