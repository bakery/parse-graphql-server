'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /* eslint arrow-parens: off, arrow-body-style: off, import/prefer-default-export: off */

exports.setup = setup;

var _apolloServerExpress = require('apollo-server-express');

var _query = require('./lib/query');

function buildAdditionalContext(_ref) {
  var baseContext = _ref.baseContext,
      request = _ref.request,
      additionalContextFactory = _ref.additionalContextFactory,
      Parse = _ref.Parse;

  if (!additionalContextFactory) {
    return Parse.Promise.as({});
  }

  var r = typeof additionalContextFactory === 'function' ? additionalContextFactory(baseContext, request) : additionalContextFactory;

  return r && typeof r.then === 'function' ? r : Parse.Promise.as(r);
}

function setup(_ref2) {
  var Parse = _ref2.Parse,
      schema = _ref2.schema,
      context = _ref2.context;

  var isSchemaLegit = (typeof schema === 'undefined' ? 'undefined' : _typeof(schema)) === 'object';

  if (!isSchemaLegit) {
    throw new Error('Invalid schema');
  }

  return (0, _apolloServerExpress.graphqlExpress)(function (request) {
    var sessionToken = request.headers && request.headers.authorization;
    var baseContext = { Query: (0, _query.create)(null) };
    var baseOps = { schema: schema };

    if (!sessionToken) {
      return buildAdditionalContext({ baseContext: baseContext, request: request, context: context, Parse: Parse }).then(function (additionalContext) {
        return Object.assign({}, baseOps, {
          context: Object.assign({}, baseContext, additionalContext)
        });
      });
    }

    var q = new Parse.Query(Parse.Session).equalTo('sessionToken', sessionToken);

    return q.first({ useMasterKey: true }).then(function (session) {
      return session && session.get('user').fetch();
    }).then(function (user) {
      baseContext = {
        Query: (0, _query.create)(sessionToken),
        sessionToken: sessionToken,
        user: user
      };

      return buildAdditionalContext({ baseContext: baseContext, request: request, context: context, Parse: Parse }).then(function (additionalContext) {
        return Object.assign(baseOps, {
          context: Object.assign({}, baseContext, additionalContext)
        });
      });
    });
  });
}
//# sourceMappingURL=middleware.js.map
