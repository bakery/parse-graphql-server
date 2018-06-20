/* eslint arrow-parens: off, arrow-body-style: off, import/prefer-default-export: off */

import { graphqlExpress } from 'apollo-server-express';
import { create as createQuery } from './lib/query';

function buildAdditionalContext({ baseContext, request, additionalContextFactory, Parse }) {
  if (!additionalContextFactory) {
    return Parse.Promise.as({});
  }

  const r = (typeof additionalContextFactory) === 'function' ? additionalContextFactory(baseContext, request) :
    additionalContextFactory;

  return r && (typeof r.then === 'function') ? r : Parse.Promise.as(r);
}

export function setup({ Parse, schema, context }) {
  const isSchemaLegit = typeof schema === 'object';

  if (!isSchemaLegit) {
    throw new Error('Invalid schema');
  }

  return graphqlExpress(request => {
    const sessionToken = request.headers && request.headers.authorization;
    let baseContext = { Query: createQuery(null) };
    const baseOps = { schema };

    if (!sessionToken) {
      return buildAdditionalContext({ baseContext, request, context, Parse }).then(additionalContext => {
        return Object.assign({}, baseOps, {
          context: Object.assign({}, baseContext, additionalContext),
        });
      });
    }

    const q = new Parse.Query(Parse.Session).equalTo('sessionToken', sessionToken);

    return q.first({ useMasterKey: true }).then(session => session && session.get('user').fetch()).then(user => {
      baseContext = {
        Query: createQuery(sessionToken),
        sessionToken,
        user,
      };

      return buildAdditionalContext({ baseContext, request, context, Parse }).then(additionalContext => {
        return Object.assign(baseOps, {
          context: Object.assign({}, baseContext, additionalContext),
        });
      });
    });
  });
}
