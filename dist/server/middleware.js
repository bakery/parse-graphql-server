'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /* eslint arrow-parens: off, arrow-body-style: off, import/prefer-default-export: off */

exports.setup = setup;

var _apolloServerExpress = require('apollo-server-express');

var _node = require('parse/node');

var _node2 = _interopRequireDefault(_node);

var _query = require('./lib/query');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function buildAdditionalContext(baseContext, additionalContextFactory) {
  if (!additionalContextFactory) {
    return _node2.default.Promise.as({});
  }

  var r = typeof additionalContextFactory === 'function' ? additionalContextFactory(baseContext) : additionalContextFactory;

  return r && typeof r.then === 'function' ? r : _node2.default.Promise.as(r);
}

function setup(_ref) {
  var schema = _ref.schema,
      context = _ref.context;

  var isSchemaLegit = (typeof schema === 'undefined' ? 'undefined' : _typeof(schema)) === 'object';

  if (!isSchemaLegit) {
    throw new Error('Invalid schema');
  }

  return (0, _apolloServerExpress.graphqlExpress)(function (request) {
    var sessionToken = request.headers && request.headers.authorization;
    var baseContext = { Query: (0, _query.create)(null) };
    var baseOps = { schema: schema };

    if (!sessionToken) {
      return buildAdditionalContext(baseContext, context).then(function (additionalContext) {
        return Object.assign({}, baseOps, {
          context: Object.assign({}, baseContext, additionalContext)
        });
      });
    }

    var q = new _node2.default.Query(_node2.default.Session).equalTo('sessionToken', sessionToken);

    return q.first({ useMasterKey: true }).then(function (session) {
      return session && session.get('user').fetch();
    }).then(function (user) {
      baseContext = {
        Query: (0, _query.create)(sessionToken),
        sessionToken: sessionToken,
        user: user
      };

      return buildAdditionalContext(baseContext, context).then(function (additionalContext) {
        return Object.assign(baseOps, {
          context: Object.assign({}, baseContext, additionalContext)
        });
      });
    });
  });
}
//# sourceMappingURL=middleware.js.map
