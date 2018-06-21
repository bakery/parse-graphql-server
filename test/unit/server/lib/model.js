import { create } from '../../../../src/server/lib/model';

const MyParseObject = function MyParseObjectCtor() {};
MyParseObject.className = 'ParseObject';
MyParseObject.extend = (ext) => {
  const C = function CC() {};
  C.className = 'ParseObject';
  Object.assign(C.prototype, MyParseObject.prototype, ext);
  return C;
};

MyParseObject.prototype = {
  save: () => ({}),
  saveAll: () => ({}),
  destroy: () => ({}),
  destroyAll: () => ({}),
  fetch: () => ({}),
};

const sessionToken = 'session-token';

describe('Server models', () => {
  it('exports create method', () => {
    expect(create).to.be.ok;
    expect(typeof create).to.equal('function');
  });

  describe('create', () => {
    it('requires a Parse.Object', () => {
      function noArgsFn() { create(); }
      function stringInsteadOfObjectFn() { create('User'); }

      expect(noArgsFn).to.throw(Error);
      expect(stringInsteadOfObjectFn).to.throw(Error);
    });

    it('returns the same Parse.Object when given no auth info', () => {
      const ParseObject = create(MyParseObject);
      expect(ParseObject).to.equal(MyParseObject);
    });

    it('returns a subclass of Parse.Object when given authentication info', () => {
      const ParseObject = create(MyParseObject, sessionToken);
      expect(ParseObject).to.be.ok;
      expect(ParseObject.className).to.equal('ParseObject');
    });
  });

  describe('Model class returned from create', () => {
    const objs = [{ att1: '1' }, { att1: '2' }];
    const option = 'option';

    let saveSpy;
    let saveAllSpy;
    let destroySpy;
    let destroyAllSpy;
    let fetchSpy;
    let po;

    beforeEach(() => {
      saveSpy = spy(MyParseObject.prototype, 'save');
      saveAllSpy = spy(MyParseObject.prototype, 'saveAll');
      destroySpy = spy(MyParseObject.prototype, 'destroy');
      destroyAllSpy = spy(MyParseObject.prototype, 'destroyAll');
      fetchSpy = spy(MyParseObject.prototype, 'fetch');

      const ParseObject = create(MyParseObject, sessionToken);
      po = new ParseObject();
    });

    afterEach(() => {
      saveSpy.reset();
    });

    it('calls save with sessionToken option set', () => {
      po.save();
      expect(saveSpy).to.have.been.calledWith(undefined, { sessionToken });
    });

    it('calls save preserving original atts + options', () => {
      const atts = { att1: 'att1', att2: 'att2' };
      po.save(atts, { option });
      expect(saveSpy).to.have.been.calledWith(atts, { sessionToken, option });
    });

    it('calls saveAll with sessionToken option set', () => {
      po.saveAll(objs);
      expect(saveAllSpy).to.have.been.calledWith(objs, { sessionToken });
    });

    it('calls saveAll preserving original options', () => {
      po.saveAll(objs, { option });
      expect(saveAllSpy).to.have.been.calledWith(objs, { sessionToken, option });
    });

    it('calls destroy with sessionToken option set', () => {
      po.destroy();
      expect(destroySpy).to.have.been.calledWith({ sessionToken });
    });

    it('calls destroy preserving original options', () => {
      po.destroy({ option });
      expect(destroySpy).to.have.been.calledWith({ sessionToken, option });
    });

    it('calls destroyAll with sessionToken option set', () => {
      po.destroyAll(objs);
      expect(destroyAllSpy).to.have.been.calledWith(objs, { sessionToken });
    });

    it('calls destroyAll preserving original options', () => {
      po.destroyAll(objs, { option });
      expect(destroyAllSpy).to.have.been.calledWith(objs, { sessionToken, option });
    });

    it('calls fetch with sessionToken option set', () => {
      po.fetch();
      expect(fetchSpy).to.have.been.calledWith({ sessionToken });
    });

    it('calls fetch preserving original options', () => {
      po.fetch({ option });
      expect(fetchSpy).to.have.been.calledWith({ sessionToken, option });
    });
  });
});
