import parseGraphQLHTTP from '../../src/parse-graphql';

describe('parse-graphql', () => {
  it('exports parseGraphQLHTTP middleware', () => {
    expect(parseGraphQLHTTP).to.be.ok;
  });
});
