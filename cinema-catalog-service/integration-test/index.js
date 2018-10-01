/* eslint-env mocha */
const supertest = require('supertest')

describe('cinema-catalog-service', () => {
  const api = supertest('http://cinema-catalog-service')
  it('returns schedules for a movie', (done) => {
    api.get('/cinemas/588ababf2d029a6d15d0b5bf/1')
      .expect(200, done)
  })
})
