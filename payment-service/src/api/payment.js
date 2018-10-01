'use strict'
const status = require('http-status')
const debug = require('debug')('cinema:payment')

// set up jaeger tracer
const initTracer = require('jaeger-client').initTracer;
const { Tags, FORMAT_HTTP_HEADERS } = require('opentracing')
let config = {
  serviceName: 'payment-service',
  reporter: {
    'collectorEndpoint': 'http://jaeger-collector:14268/api/traces',
    'logSpans': true
  },      
  sampler: { type: 'const', param: 1 }  
};
let options = {
  tags: {
    'payment-service.version': '1.0.0',
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


  app.post('/payment/makePurchase', (req, res, next) => {

    const parentSpanContext = tracer.extract(FORMAT_HTTP_HEADERS, req.headers)
    const span = tracer.startSpan('payment_makepurchase', {
      childOf: parentSpanContext,
      tags: {[Tags.SPAN_KIND]: Tags.SPAN_KIND_RPC_SERVER}
    });
    span.setTag(Tags.HTTP_URL, '/payment/makePurchase')
    span.setTag(Tags.HTTP_METHOD, 'post')
  
    span.log({'event': 'request_received'});
    const {validate} = req.container.cradle

    validate(req.body.paymentOrder, 'payment')
      .then(payment => {
        span.log({'event': 'payment_validated'});
        return repo.registerPurchase(payment)
      })
      .then(paid => {
        span.log({'event': 'purchase_registered'});
        res.status(status.OK).json({paid})

        span.log({'event': 'request_end'});
        span.setTag(Tags.HTTP_STATUS_CODE, status.OK)
        span.finish();      
      })
      .catch(next)
  })

  app.get('/payment/getPurchaseById/:id', (req, res, next) => {

    const span = tracer.startSpan('payment_getpurchase');
    span.setTag(Tags.HTTP_URL, '/payment/getPurchaseById/:id')
    span.setTag(Tags.HTTP_METHOD, 'get')
  
    span.log({'event': 'request_received'});
    repo.getPurchaseById(req.params.id)
      .then(payment => {
        res.status(status.OK).json({payment})

        span.log({'event': 'request_end'});
        span.setTag(Tags.HTTP_STATUS_CODE, status.OK)
        span.finish();      

      })
      .catch(next)
  })

  app.post('/payment/getPurchaseById/:id', (req, res, next) => {
    const span = tracer.startSpan('payment_getpurchase_post');
    span.setTag(Tags.HTTP_URL, '/payment/getPurchaseById/:id')
    span.setTag(Tags.HTTP_METHOD, 'post') 

    span.log({'event': 'request_received'});
    debug('why am I still processing?')
    //vulnerable function
    repo.getPurchaseById(req.params.id)
      .then(payment => {
        debug('im here', payment)
        span.log({'event': 'request_end'});
        span.setTag(Tags.HTTP_STATUS_CODE, status.OK)
        span.finish();      

        res.status(status.OK).json({payment})
      })
      .catch(next)
      .catch(next);
  })


}
