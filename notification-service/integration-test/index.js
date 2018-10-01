/* eslint-env mocha */
const supertest = require('supertest')

describe('Notification Service', () => {
  const api = supertest('http://notification-service')
  const payload = {
    city: 'Morelia',
    userType: 'loyal',
    totalAmount: 71,
    cinema: {
      name: 'Plaza Morelia',
      room: '1',
      seats: '53, 54'
    },
    movie: {
      title: 'Assasins Creed',
      format: 'IMAX',
      schedule: new Date()
    },
    orderId: '1aa90cx',
    description: 'some description',
    user: {
      name: 'The Rock',
      email: 'therock@wwf.com'
    }
  }

  it('can send a notification via email', (done) => {
    api.post('/notification/sendEmail')
      .send({payload})
      .expect((res) => {
        console.log(res.body)
      })
      .expect(200, done)
  })
})
