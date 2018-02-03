'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;
/* eslint import/prefer-default-export: off */

var buildOptions = function buildOptions(options, sessionToken) {
  return Object.assign(options || {}, { sessionToken: sessionToken });
};

function create(ParseObject) {
  var sessionToken = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  var looksLikeLegitParseObject = ParseObject && typeof ParseObject === 'function' && ParseObject.className;

  if (!looksLikeLegitParseObject) {
    throw new Error('create requires a class based on Parse.Object');
  }

  if (!sessionToken) {
    return ParseObject;
  }

  return ParseObject.extend({
    save: function save(target, options) {
      return ParseObject.prototype.save.call(this, target, buildOptions(options, sessionToken));
    },
    saveAll: function saveAll(list, options) {
      return ParseObject.prototype.saveAll.call(this, list, buildOptions(options, sessionToken));
    },
    destroy: function destroy(options) {
      return ParseObject.prototype.destroy.call(this, buildOptions(options, sessionToken));
    },
    destroyAll: function destroyAll(list, options) {
      return ParseObject.prototype.destroyAll.call(this, list, buildOptions(options, sessionToken));
    },
    fetch: function fetch(options) {
      return ParseObject.prototype.fetch.call(this, buildOptions(options, sessionToken));
    }
  });
}
//# sourceMappingURL=model.js.map
