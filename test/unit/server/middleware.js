import proxyquire from 'proxyquire';
import Parse from 'parse/node';

let setup;
const sessionToken = 'session-token';
const schema = {};

describe('Express middleware', () => {
  let graphqlHTTPSpy;
  let queryEqualToSpy;
  let queryFirstStub;
  let createQuerySpy;

  beforeEach(() => {
    graphqlHTTPSpy = spy();
    queryEqualToSpy = spy();
    createQuerySpy = spy();

    setup = proxyquire('../../../src/server/middleware', {
      'graphql-server-express': {
        graphqlExpress: (callback) => {
          graphqlHTTPSpy(callback);
          return callback;
        },
      },

      './lib/query': {
        create(token) {
          createQuerySpy(token);
          return token ? 'authorized query' : 'simple query';
        },
      },
    }).setup;

    queryEqualToSpy = spy(Parse.Query.prototype, 'equalTo');
    queryFirstStub = stub(Parse.Query.prototype, 'first', () => {
      const fakeSession = {
        get: () => (
          {
            fetch: () => 'user',
          }
        ),
      };

      return Promise.resolve(fakeSession);
    });
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

    it('calls graphqlHTTP middleware and returns a function', () => {
      setup({ schema });
      expect(graphqlHTTPSpy).to.have.been.calledOnce;
    });
  });

  describe('middleware function', () => {
    it('returns basic options if request has no authorization header', () => {
      const cb = setup({ schema });
      const r = cb({});

      expect(r.schema).to.equal(schema);
      expect(r.context.Query).to.equal('simple query');
      expect(createQuerySpy).to.have.been.calledOnce;
      expect(createQuerySpy).to.have.been.calledWith(null);
    });
  });

  it('looks for a session based on session token in authorization header', () => {
    const cb = setup({ schema });
    cb({
      headers: {
        authorization: sessionToken,
      },
    });

    expect(queryEqualToSpy).to.have.been.calledOnce;
    expect(queryEqualToSpy).to.have.been.calledWith('sessionToken', sessionToken);
    expect(queryFirstStub).to.have.been.calledOnce;
    expect(queryFirstStub).to.have.been.calledWith({ useMasterKey: true });
  });

  it('throws if session token lookup fails', (done) => {
    Parse.Query.prototype.first.restore();
    queryFirstStub = stub(Parse.Query.prototype, 'first', () => Promise.reject({}));

    const cb = setup({ schema });
    const r = cb({
      headers: {
        authorization: sessionToken,
      },
    });

    r.then(() => {}, () => done());
  });

  it('returns extended context if token lookup succeeds + uses patched query generator', (done) => {
    const cb = setup({ schema });
    const r = cb({
      headers: {
        authorization: sessionToken,
      },
    });

    r.then((options) => {
      expect(createQuerySpy).to.have.been.calledTwice;
      expect(createQuerySpy.getCall(0).args[0]).to.equal(null);
      expect(createQuerySpy.getCall(1).args[0]).to.equal(sessionToken);
      expect(options.context.Query).to.equal('authorized query');
      expect(options.context.user).to.equal('user');
      expect(options.context.sessionToken).to.equal(sessionToken);
      done();
    });
  });

  it('returns additional context if it is passed along with the schema', (done) => {
    const context = {
      foo: 'bar',
    };
    const cb = setup({ schema, context });
    const r = cb({
      headers: {
        authorization: sessionToken,
      },
    });

    r.then((options) => {
      expect(createQuerySpy).to.have.been.calledTwice;
      expect(createQuerySpy.getCall(0).args[0]).to.equal(null);
      expect(createQuerySpy.getCall(1).args[0]).to.equal(sessionToken);
      expect(options.context.Query).to.equal('authorized query');
      expect(options.context.user).to.equal('user');
      expect(options.context.sessionToken).to.equal(sessionToken);
      expect(options.context.foo).to.equal('bar');
      done();
    });
  });

  it('calls context function passed alongside schema', (done) => {
    function context() {
      return {
        foo: 'bar',
      };
    }

    const cb = setup({ schema, context });
    const r = cb({
      headers: {
        authorization: sessionToken,
      },
    });

    r.then((options) => {
      expect(createQuerySpy).to.have.been.calledTwice;
      expect(createQuerySpy.getCall(0).args[0]).to.equal(null);
      expect(createQuerySpy.getCall(1).args[0]).to.equal(sessionToken);
      expect(options.context.Query).to.equal('authorized query');
      expect(options.context.user).to.equal('user');
      expect(options.context.sessionToken).to.equal(sessionToken);
      expect(options.context.foo).to.equal('bar');
      done();
    });
  });
});
