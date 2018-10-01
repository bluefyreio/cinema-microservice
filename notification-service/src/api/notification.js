'use strict'
const status = require('http-status')

// set up jaeger tracer
const initTracer = require('jaeger-client').initTracer;
const { Tags, FORMAT_HTTP_HEADERS } = require('opentracing')
let config = {
  serviceName: 'notification-service',
  reporter: {
    'collectorEndpoint': 'http://jaeger-collector:14268/api/traces',
    'logSpans': true
  },      
  sampler: { type: 'const', param: 1 }  
};
let options = {
  tags: {
    'notification-service.version': '1.0.0',
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
  app.post('/notification/sendEmail', (req, res, next) => {
    const parentSpanContext = tracer.extract(FORMAT_HTTP_HEADERS, req.headers)
    const span = tracer.startSpan('notification_email', {
      childOf: parentSpanContext,
      tags: {[Tags.SPAN_KIND]: Tags.SPAN_KIND_RPC_SERVER}
    });
    span.setTag(Tags.HTTP_URL, '/notification/sendEmail')
    span.setTag(Tags.HTTP_METHOD, 'post')
  
    span.log({'event': 'request_received'});

    const {validate} = req.container.cradle

    validate(req.body.payload, 'notification')
      .then(payload => {
        span.log({'event': 'notification_validated'});
        return repo.sendEmail(payload)
      })
      .then(ok => {
        span.log({'event': 'email_sent'});
        res.status(status.OK).json({msg: 'ok'})

        span.log({'event': 'request_end'});
        span.setTag(Tags.HTTP_STATUS_CODE, status.OK)
        span.finish();      

      })
      .catch(err => {
        if(err){
          span.log({'event': 'error_send'});
          span.setTag(Tags.ERROR, true)
          span.setTag(Tags.HTTP_STATUS_CODE, err.statusCode || 500);
          span.finish();
  
        }
        next(err)
      })
  })

  app.post('/notification/sendSMS', (req, res, next) => {
    const parentSpanContext = tracer.extract(FORMAT_HTTP_HEADERS, req.headers)
    const span = tracer.startSpan('notification_sms', {
      childOf: parentSpanContext,
      tags: {[Tags.SPAN_KIND]: Tags.SPAN_KIND_RPC_SERVER}
    });
    span.setTag(Tags.HTTP_URL, '/notification/sendSMS')
    span.setTag(Tags.HTTP_METHOD, 'post')
  
    span.log({'event': 'request_received'});

    const {validate} = req.container.cradle

    validate(req.body.payload, 'notification')
      .then(payload => {
        span.log({'event': 'notification_validated'});        
        return repo.sendSMS(payload)
      })
      .then(ok => {
        span.log({'event': 'sms_sent'});
        res.status(status.OK).json({msg: 'ok'})

        span.log({'event': 'request_end'});
        span.setTag(Tags.HTTP_STATUS_CODE, status.OK)
        span.finish();      

      })
      .catch(next)
  })
}
