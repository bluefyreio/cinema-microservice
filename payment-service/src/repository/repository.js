'use strict'
const repository = (container) => {
  const {database: db} = container.cradle

  const makePurchase = (payment) => {
    return new Promise((resolve, reject) => {
      const {stripe} = container.cradle
      let chargeObj = {
        amount: Math.ceil(payment.amount * 100),
        currency: payment.currency,
        source: {
          number: payment.number,
          cvc: payment.cvc,
          exp_month: payment.exp_month,
          exp_year: payment.exp_year
        },
        description: payment.description        
      }
      console.log('chargeObj', chargeObj)
      stripe.charges.create(chargeObj, (err, charge) => {
        if (err) {
          reject(new Error('An error occurred procesing payment with stripe, err: ' + err))
        } else {
          const paid = Object.assign({}, {user: payment.userName, amount: payment.amount, charge})
          resolve(paid)
        }
      })
    })
  }

  const registerPurchase = (payment) => {
    return new Promise((resolve, reject) => {
      makePurchase(payment)
        .then(paid => {
          db.collection('payments').insertOne(paid, (err, result) => {
            if (err) {
              reject(new Error('an error occurred registring payment at db, err:' + err))
            }
            resolve(paid)
          })
        })
        .catch(err => reject(err))
    })
  }

  const getPurchaseById = (paymentId) => {
    return new Promise((resolve, reject) => {
      const response = (err, payment) => {
        if (err) {
          reject(new Error('An error occurred retrieving a order, err: ' + err))
        }
        resolve(payment)
      }
      let parsedPayment=paymentId
      try{
        parsedPayment = JSON.parse(paymentId)
      } catch(e){
        console.log('Error parsing json')        
      }
      db.collection('payments').find({'charge.id': parsedPayment}, {limit:10}).toArray(response)
    })
  }

  const disconnect = () => {
    db.close()
  }

  return Object.create({
    registerPurchase,
    getPurchaseById,
    disconnect
  })
}

const connect = (container) => {
  return new Promise((resolve, reject) => {
    if (!container.resolve('database')) {
      reject(new Error('connection db not supplied!'))
    }
    resolve(repository(container))
  })
}

module.exports = Object.assign({}, {connect})
