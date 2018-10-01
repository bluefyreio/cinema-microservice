/* eslint-env mocha */
const supertest = require('supertest')

describe('Payment Servie', () => {
  const api = supertest('http://payment-service')
  const testPayment = {
    userName: 'The Rock',
    currency: 'mxn',
    number: '4242424242424242',
    cvc: '123',
    exp_month: '12',
    exp_year: '2017',
    amount: 71,
    description: `
      Tickect(s) for movie "Assasins Creed",
      with seat(s) 47, 48
      at time 8 / feb / 17`
  }

  it('can make a paymentOrder', (done) => {
    api.post('/payment/makePurchase')
      .send({paymentOrder: testPayment})
      .expect((res) => {
        console.log(res.body)
      })
      .expect(200, done)
  })
})
