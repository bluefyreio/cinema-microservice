'use strict'
const status = require('http-status')

// set up jaeger tracer
const initTracer = require('jaeger-client').initTracer;
const { Tags, FORMAT_HTTP_HEADERS } = require('opentracing')
let config = {
  serviceName: 'booking-service',
  reporter: {
    'collectorEndpoint': 'http://jaeger-collector:14268/api/traces',
    'logSpans': true
  },      
  sampler: { type: 'const', param: 1 }  
};
let options = {
  tags: {
    'booking-service.version': '1.0.0',
  },
  logger: {
    info: function logInfo(msg) {
        console.log("INFO ", msg);
    },
    error: function logError(msg) {
        console.log("ERROR", msg);
    },
},  
};
const tracer = initTracer(config, options);

module.exports = ({repo}, app) => {


  app.post('/booking', (req, res, next) => {

    let headers = {}
    const span = tracer.startSpan('booking');
    span.setTag(Tags.HTTP_URL, '/booking')
    span.setTag(Tags.HTTP_METHOD, 'post')
    span.setTag(Tags.SPAN_KIND, Tags.SPAN_KIND_RPC_CLIENT)
    tracer.inject(span, FORMAT_HTTP_HEADERS, headers);
  
    span.log({'event': 'request_received'});

    const validate = req.container.cradle.validate
    const paymentService = req.container.resolve('paymentService')
    const notificationService = req.container.resolve('notificationService')

    Promise.all([
      validate(req.body.user, 'user'),
      validate(req.body.booking, 'booking')
    ])
    .then(([user, booking]) => {
      span.log({'event': 'finish_validation'});

      const payment = {
        userName: user.name + ' ' + user.lastName,
        currency: 'mxn',
        number: user.creditCard.number,
        cvc: user.creditCard.cvc,
        exp_month: user.creditCard.exp_month,
        exp_year: user.creditCard.exp_year,
        amount: booking.totalAmount,
        description: `
          Ticket(s) for movie ${booking.movie},
          with seat(s) ${booking.seats.toString()}
          at time ${booking.schedule}`
      }

      return Promise.all([
        paymentService(payment, headers),
        Promise.resolve(user),
        Promise.resolve(booking)
      ])
    })
    .then(([paid, user, booking]) => {
      span.log({'event': 'finish_payment'});

      return Promise.all([
        repo.makeBooking(user, booking),
        Promise.resolve(paid),
        Promise.resolve(user)
      ])
    })
    .then(([booking, paid, user]) => {
      span.log({'event': 'finish_booking'});

      return Promise.all([
        repo.generateTicket(paid, booking),
        Promise.resolve(user)
      ])
    })
    .then(([ticket, user]) => {
      span.log({'event': 'finish_ticketing'});

      const payload = Object.assign({}, ticket, {user: {name: user.name + user.lastName, email: user.email}})
      span.log({'event': 'start_notification'});
      notificationService(payload, headers)
      span.log({'event': 'finish_notification'});
      span.setTag(Tags.HTTP_STATUS_CODE, status.OK)
      span.finish();    

      res.status(status.OK).json(ticket)
      
    })
    .catch(next)
  })


  app.get('/booking/verify/:orderId', (req, res, next) => {

    const span = tracer.startSpan('booking_verify');
    span.setTag(Tags.HTTP_URL, '/booking/verify/:orderId')
    span.setTag(Tags.HTTP_METHOD, 'get')
  
    span.log({'event': 'request_received'});
    repo.getOrderById(req.params.orderId)
      .then(order => {
        span.log({'event': 'request_end'});
        span.setTag(Tags.HTTP_STATUS_CODE, status.OK)
        span.finish();    
  
        res.status(status.OK).json(order)
      })
      .catch(next)
  })
}
