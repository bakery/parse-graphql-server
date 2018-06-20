import proxyquire from 'proxyquire';
import Parse from 'parse/node';

const sessionToken = 'session-token';
let create;
let Query;

describe('Server models', () => {
  let objectInitializeSpy;
  let modelCreateSpy;
  let queryCountStub;
  let queryFindStub;
  let queryFirstStub;
  let queryGetStub;

  beforeEach(() => {
    objectInitializeSpy = spy();
    modelCreateSpy = spy();

    create = proxyquire('../../../../src/server/lib/query', {
      './model': {
        create(ParseObject, token) {
          modelCreateSpy(ParseObject, token);
          return Parse.Object.extend('MyParseObject', {
            initialize: objectInitializeSpy,
          });
        },
      },
    }).create;

    queryCountStub = stub(Parse.Query.prototype, 'count', () => 0);
    queryFindStub = stub(Parse.Query.prototype, 'find', () => []);
    queryFirstStub = stub(Parse.Query.prototype, 'first', () => {});
    queryGetStub = stub(Parse.Query.prototype, 'get', () => {});

    Query = create(sessionToken);
  });

  afterEach(() => {
    objectInitializeSpy.reset();
    modelCreateSpy.reset();
    queryCountStub.reset();
    queryFindStub.reset();
    queryFirstStub.reset();
    queryGetStub.reset();
  });

  it('exports create method', () => {
    expect(create).to.be.ok;
    expect(typeof create).to.equal('function');
  });

  describe('create', () => {
    it('returns a transformed Parse.Query with create method if no session token is given', () => {
      const q = create();
      expect(q).to.respondTo('create');
      expect(q).to.respondTo('find');
      expect(q).to.respondTo('count');
      expect(q).to.respondTo('first');
      expect(q).to.respondTo('get');
    });

    it('returns extended Parse.Query when session token is provided', () => {
      const q = create(sessionToken);
      expect(q).to.be.ok;
    });

    it('calls create to generate patched Parse.Object', () => {
      const q = new Query(Parse.User);
      expect(q).to.be.ok;
      expect(modelCreateSpy).to.have.been.calledWith(Parse.User, sessionToken);
    });
  });

  describe('Query returned by create', () => {
    let q;

    beforeEach(() => {
      q = new Query(Parse.User);
    });

    it('suports create method', () => {
      expect(Query).to.respondTo('create');
    });

    it('creates model instance using patched Parse.Object', () => {
      const user = q.create({});
      expect(user).to.be.ok;
      expect(objectInitializeSpy).to.have.been.calledOnce;
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
