/* eslint arrow-parens: off, arrow-body-style: off, import/prefer-default-export: off */

import { graphqlExpress } from 'apollo-server-express';
import { create as createQuery } from './lib/query';

function buildAdditionalContext({ baseContext, request, context, Parse }) {
  if (!context) {
    return new Parse.Promise(resolve => {
      resolve({});
    });
  }

  const r = (typeof context) === 'function' ? context(baseContext, request) : context;

  return r && (typeof r.then === 'function') ? r : new Parse.Promise(resolve => resolve(r));
}

export function setup({ Parse, schema, context }) {
  const isSchemaLegit = typeof schema === 'object';

  if (!isSchemaLegit) {
    throw new Error('Invalid schema');
  }

  if (!Parse) {
    throw new Error('Parse instance missing');
  }

  return graphqlExpress(request => {
    const sessionToken = request.headers && request.headers.authorization;
    let baseContext = { Query: createQuery(null, Parse) };
    const baseOps = { schema };

    if (!sessionToken) {
      return buildAdditionalContext({ baseContext, request, context, Parse }).then(
        additionalContext => {
          return Object.assign({}, baseOps, {
            context: Object.assign({}, baseContext, additionalContext),
          });
        });
    }

    const q = new Parse.Query(Parse.Session).equalTo('sessionToken', sessionToken);

    return q.first({ useMasterKey: true }).then(session => session && session.get('user').fetch()).then(user => {
      baseContext = {
        Query: createQuery(sessionToken, Parse),
        sessionToken,
        user,
      };

      return buildAdditionalContext({ baseContext, request, context, Parse }).then(
        additionalContext => {
          return Object.assign(baseOps, {
            context: Object.assign({}, baseContext, additionalContext),
          });
        });
    });
  });
}
