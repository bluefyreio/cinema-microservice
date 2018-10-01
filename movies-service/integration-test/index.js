/* eslint-env mocha */
const supertest = require('supertest')

describe('movies-service', () => {
  const api = supertest('http://movies-service')
  it('returns a 200 for a known movies', (done) => {
    api.get('/movies/premieres')
      .expect(200, done)
  })
})
