import proxyquire from 'proxyquire';

let setup;
const sessionToken = 'session-token';
const schema = {};

const mockParse = (behaviors = {}) => {
  const Query = function () {};

  const session = {
    get: () => ({
      fetch: () => 'user',
    }),
  };

  const firstFn = sinon.stub().returns(new Promise(
    (resolve, reject) => {
      if (behaviors.queryFirstFails) {
        reject({});
      } else {
        resolve(session);
      }
    }));

  Query.prototype = {
    equalTo: () => ({
      first: firstFn,
    }),
  };

  return {
    Promise,
    Query,
    queryEqualToSpy: spy(Query.prototype, 'equalTo'),
    queryFirstSpy: firstFn,
  };
};


describe('Express middleware', () => {
  let graphqlHTTPSpy;
  let createQuerySpy;

  beforeEach(() => {
    graphqlHTTPSpy = spy();
    createQuerySpy = spy();

    setup = proxyquire('../../../src/server/middleware', {
      'apollo-server-express': {
        graphqlExpress: (callback) => {
          graphqlHTTPSpy(callback);
          return callback;
        },
      },

      './lib/query': {
        create(token, Parse) {
          createQuerySpy(token, Parse);
          return token ? 'authorized query' : 'simple query';
        },
      },
    }).setup;
  });

  it('exports setup function', () => {
    expect(setup).to.be.ok;
    expect(typeof setup).to.equal('function');
  });

  describe('setup', () => {
    it('requires a valid schema object', () => {
      function setupWithoutArgs() { setup(); }
      function setupWithWrongSchema() { setup({ schema: 'hello' }); }
      expect(setupWithoutArgs).to.throw(Error);
      expect(setupWithWrongSchema).to.throw(Error);
    });

    it('requires a valid Parse instance', () => {
      function setupWithSchemaAndNoParse() { setup({ schema }); }
      expect(setupWithSchemaAndNoParse).to.throw(Error);
    });

    it('calls graphqlHTTP middleware', () => {
      setup({ Parse: mockParse(), schema });
      expect(graphqlHTTPSpy).to.have.been.calledOnce;
    });
  });

  describe('middleware function', () => {
    it('returns basic options if request has no authorization header', (done) => {
      const Parse = mockParse();
      const cb = setup({ Parse, schema });
      const r = cb({});

      r.then((options) => {
        expect(options.schema).to.equal(schema);
        expect(options.context.Query).to.equal('simple query');
        expect(createQuerySpy).to.have.been.calledOnce;
        expect(createQuerySpy).to.have.been.calledWith(null, Parse);
        done();
      });
    });

    it('looks for a session based on session token in authorization header', (done) => {
      const Parse = mockParse();
      const cb = setup({ schema, Parse });
      cb({
        headers: {
          authorization: sessionToken,
        },
      }).then(() => {
        expect(Parse.queryEqualToSpy).to.have.been.calledOnce;
        expect(Parse.queryEqualToSpy).to.have.been.calledWith('sessionToken', sessionToken);
        expect(Parse.queryFirstSpy).to.have.been.calledOnce;
        expect(Parse.queryFirstSpy).to.have.been.calledWith({ useMasterKey: true });

        done();
      });
    });

    it('throws if session token lookup fails', (done) => {
      const Parse = mockParse({ queryFirstFails: true });
      const cb = setup({ Parse, schema });

      cb({
        headers: {
          authorization: sessionToken,
        },
      }).catch(() => done());
    });

    it('returns extended context if token lookup succeeds + uses patched query generator', (done) => {
      const Parse = mockParse();
      const cb = setup({ Parse, schema });
      cb({
        headers: {
          authorization: sessionToken,
        },
      }).then((options) => {
        expect(createQuerySpy).to.have.been.calledTwice;
        expect(createQuerySpy.getCall(0).args[0]).to.equal(null);
        expect(createQuerySpy.getCall(0).args[1]).to.equal(Parse);
        expect(createQuerySpy.getCall(1).args[0]).to.equal(sessionToken);
        expect(createQuerySpy.getCall(1).args[1]).to.equal(Parse);

        expect(options.context.Query).to.equal('authorized query');
        expect(options.context.user).to.equal('user');
        expect(options.context.sessionToken).to.equal(sessionToken);
        done();
      });
    });

    it('returns additional context if it is passed along with the schema', (done) => {
      const Parse = mockParse();
      const context = {
        foo: 'bar',
      };
      const cb = setup({ Parse, schema, context });
      cb({
        headers: {
          authorization: sessionToken,
        },
      }).then((options) => {
        expect(createQuerySpy).to.have.been.calledTwice;

        expect(createQuerySpy.getCall(0).args[0]).to.equal(null);
        expect(createQuerySpy.getCall(0).args[1]).to.equal(Parse);
        expect(createQuerySpy.getCall(1).args[0]).to.equal(sessionToken);
        expect(createQuerySpy.getCall(1).args[1]).to.equal(Parse);

        expect(options.context.Query).to.equal('authorized query');
        expect(options.context.user).to.equal('user');
        expect(options.context.sessionToken).to.equal(sessionToken);

        expect(options.context.foo).to.equal('bar');

        done();
      });
    });

    it('calls context function passed alongside schema', (done) => {
      const Parse = mockParse();
      function context() {
        return {
          foo: 'bar',
        };
      }

      const cb = setup({ Parse, schema, context });
      cb({
        headers: {
          authorization: sessionToken,
        },
      }).then((options) => {
        expect(createQuerySpy).to.have.been.calledTwice;

        expect(createQuerySpy.getCall(0).args[0]).to.equal(null);
        expect(createQuerySpy.getCall(0).args[1]).to.equal(Parse);
        expect(createQuerySpy.getCall(1).args[0]).to.equal(sessionToken);
        expect(createQuerySpy.getCall(1).args[1]).to.equal(Parse);

        expect(options.context.Query).to.equal('authorized query');
        expect(options.context.user).to.equal('user');
        expect(options.context.sessionToken).to.equal(sessionToken);
        expect(options.context.foo).to.equal('bar');

        done();
      });
    });

    it('supports context function that returns a promise', (done) => {
      const Parse = mockParse();
      function context() {
        return new Promise(resolve => resolve({
          foo: 'bar',
        }));
      }

      const cb = setup({ Parse, schema, context });
      cb({
        headers: {
          authorization: sessionToken,
        },
      }).then((options) => {
        expect(createQuerySpy).to.have.been.calledTwice;

        expect(createQuerySpy.getCall(0).args[0]).to.equal(null);
        expect(createQuerySpy.getCall(0).args[1]).to.equal(Parse);
        expect(createQuerySpy.getCall(1).args[0]).to.equal(sessionToken);
        expect(createQuerySpy.getCall(1).args[1]).to.equal(Parse);

        expect(options.context.Query).to.equal('authorized query');
        expect(options.context.user).to.equal('user');
        expect(options.context.sessionToken).to.equal(sessionToken);
        expect(options.context.foo).to.equal('bar');

        done();
      });
    });
  });
});
