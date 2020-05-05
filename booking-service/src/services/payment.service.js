const supertest = require('supertest')
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
process.env.NODE_TLS_ACCEPT_UNTRUSTED_CERTIFICATES_THIS_IS_INSECURE = '1'

module.exports = (paymentOrder, headers) => {
  return new Promise((resolve, reject) => {
    supertest('http://payment-service')
      .post('/payment/makePurchase/')
      .send({paymentOrder})
      .set(headers)
      .end((err, res) => {
        if (err) {
          reject(new Error('An error occured with the payment service, err: ' + err))
        }
        console.log('received response res.body', res.body)
        console.log('received response', (res && res.body && res.body.payment)?res.body.payment:'')
        resolve(res.body.paid)
      })
  })
}
