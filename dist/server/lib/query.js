'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.create = create;

var _node = require('parse/node');

var _node2 = _interopRequireDefault(_node);

var _model = require('./model');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* eslint import/prefer-default-export: off */

var buildOptions = function buildOptions(options, sessionToken) {
  return Object.assign(options || {}, { sessionToken: sessionToken });
};

function create(sessionToken) {
  if (!sessionToken) {
    var BasicQuery = function (_Parse$Query) {
      _inherits(BasicQuery, _Parse$Query);

      function BasicQuery(objectClass) {
        _classCallCheck(this, BasicQuery);

        var _this = _possibleConstructorReturn(this, (BasicQuery.__proto__ || Object.getPrototypeOf(BasicQuery)).call(this, objectClass));

        _this.ObjectClass = objectClass;
        return _this;
      }

      _createClass(BasicQuery, [{
        key: 'create',
        value: function create() {
          var attributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

          return new this.ObjectClass(attributes);
        }
      }]);

      return BasicQuery;
    }(_node2.default.Query);

    return BasicQuery;
  }

  var Query = function (_Parse$Query2) {
    _inherits(Query, _Parse$Query2);

    function Query(objectClass) {
      _classCallCheck(this, Query);

      var _this2 = _possibleConstructorReturn(this, (Query.__proto__ || Object.getPrototypeOf(Query)).call(this, (0, _model.create)(objectClass, sessionToken)));

      _this2.ObjectClass = (0, _model.create)(objectClass, sessionToken);
      return _this2;
    }

    _createClass(Query, [{
      key: 'create',
      value: function create() {
        var attributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        return new this.ObjectClass(attributes);
      }
    }, {
      key: 'count',
      value: function count(options) {
        return _get(Query.prototype.__proto__ || Object.getPrototypeOf(Query.prototype), 'count', this).call(this, buildOptions(options, sessionToken));
      }
    }, {
      key: 'find',
      value: function find(options) {
        return _get(Query.prototype.__proto__ || Object.getPrototypeOf(Query.prototype), 'find', this).call(this, buildOptions(options, sessionToken));
      }
    }, {
      key: 'first',
      value: function first(options) {
        return _get(Query.prototype.__proto__ || Object.getPrototypeOf(Query.prototype), 'first', this).call(this, buildOptions(options, sessionToken));
      }
    }, {
      key: 'get',
      value: function get(objectId, options) {
        return _get(Query.prototype.__proto__ || Object.getPrototypeOf(Query.prototype), 'get', this).call(this, objectId, buildOptions(options, sessionToken));
      }
    }]);

    return Query;
  }(_node2.default.Query);

  return Query;
}
//# sourceMappingURL=query.js.map
