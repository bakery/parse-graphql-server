import Parse from 'parse/node';
import { create as createModel } from './model';

const buildOptions = (options, sessionToken) => Object.assign(options || {}, { sessionToken });

export function create(sessionToken) {
  if (!sessionToken) {
    return Parse.Query;
  }

  class Query extends Parse.Query {
    constructor(objectClass) {
      super(createModel(objectClass, sessionToken));
      this.ObjectClass = createModel(objectClass, sessionToken);
    }

    create(attributes = {}) {
      return new this.ObjectClass(attributes);
    }

    count(options) {
      return super.count(buildOptions(options, sessionToken));
    }

    find(options) {
      return super.find(buildOptions(options, sessionToken));
    }

    first(options) {
      return super.first(buildOptions(options, sessionToken));
    }

    get(objectId, options) {
      return super.get(objectId, buildOptions(options, sessionToken));
    }
  }

  return Query;
}
