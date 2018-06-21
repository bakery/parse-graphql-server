import proxyquire from 'proxyquire';

const sessionToken = 'session-token';
let create;

const mockParse = () => {
  class Query {
    create() {
      return this.foo;
    }

    count() {
      return this.foo;
    }

    find() {
      return this.foo;
    }

    first() {
      return this.foo;
    }

    get() {
      return this.foo;
    }
  }

  class User {

  }

  return {
    Query,
    User,
  };
};


describe('Server queries', () => {
  let modelConstructorStub;
  let objectInitializeSpy;
  let modelCreateSpy;

  beforeEach(() => {
    objectInitializeSpy = spy();
    modelCreateSpy = spy();
    modelConstructorStub = stub();

    create = proxyquire('../../../../src/server/lib/query', {
      './model': {
        create(ParseObject, token) {
          modelCreateSpy(ParseObject, token);

          const Model = function ModelCtor() {
            modelConstructorStub();
          };

          Model.prototype = {
            initialize: objectInitializeSpy,
          };

          return Model;
        },
      },
    }).create;
  });

  afterEach(() => {
    objectInitializeSpy.reset();
    modelCreateSpy.reset();
  });

  it('exports create method', () => {
    expect(create).to.be.ok;
    expect(typeof create).to.equal('function');
  });

  describe('create', () => {
    it('returns a transformed Parse.Query with create method if no session token is given', () => {
      const Parse = mockParse();
      const q = create(null, Parse);
      expect(q).to.respondTo('create');
      expect(q).to.respondTo('find');
      expect(q).to.respondTo('count');
      expect(q).to.respondTo('first');
      expect(q).to.respondTo('get');
    });

    it('returns extended Parse.Query when session token is provided', () => {
      const Parse = mockParse();
      const q = create(sessionToken, Parse);
      expect(q).to.be.ok;
    });

    it('calls create to generate patched Parse.Object', () => {
      const Parse = mockParse();
      const Query = create(sessionToken, Parse);
      const q = new Query(Parse.User);
      expect(q).to.be.ok;
      expect(modelCreateSpy).to.have.been.calledWith(Parse.User, sessionToken);
    });
  });

  describe('Query returned by create', () => {
    let q;
    let Query;
    let queryCountStub;
    let queryFindStub;
    let queryFirstStub;
    let queryGetStub;

    beforeEach(() => {
      const Parse = mockParse();
      Query = create(sessionToken, Parse);
      q = new Query(Parse.User);

      queryCountStub = stub(Parse.Query.prototype, 'count');
      queryFindStub = stub(Parse.Query.prototype, 'find');
      queryFirstStub = stub(Parse.Query.prototype, 'first');
      queryGetStub = stub(Parse.Query.prototype, 'get');
    });

    afterEach(() => {
      queryCountStub.reset();
      queryFindStub.reset();
      queryFirstStub.reset();
      queryGetStub.reset();
    });

    it('suports create method', () => {
      expect(Query).to.respondTo('create');
    });

    it('creates model instance using patched Parse.Object', () => {
      const user = q.create({});
      expect(user).to.be.ok;
      expect(modelConstructorStub).to.have.been.calledOnce;
    });

    it('calls count with sessionToken option', () => {
      q.count();
      expect(queryCountStub).to.have.been.calledWith({ sessionToken });
    });

    it('calls find with sessionToken option', () => {
      q.find();
      expect(queryFindStub).to.have.been.calledWith({ sessionToken });
    });

    it('calls first with sessionToken option', () => {
      q.first();
      expect(queryFirstStub).to.have.been.calledWith({ sessionToken });
    });

    it('calls get with sessionToken option', () => {
      q.get('id');
      expect(queryGetStub).to.have.been.calledWith('id', { sessionToken });
    });
  });
});
