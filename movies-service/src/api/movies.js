'use strict'
const status = require('http-status')

// set up jaeger tracer
const initTracer = require('jaeger-client').initTracer;
const { Tags, FORMAT_HTTP_HEADERS } = require('opentracing')
let config = {
  serviceName: 'movies-service',
  reporter: {
    'collectorEndpoint': 'http://jaeger-collector:14268/api/traces',
    'logSpans': true
  },      
  sampler: { type: 'const', param: 1 }  
};
let options = {
  tags: {
    'movies-service.version': '1.0.0',
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

module.exports = (app, options) => {
  const {repo} = options

  app.get('/movies', (req, res, next) => {
    const span_movies = tracer.startSpan('movies');
    span_movies.setTag(Tags.HTTP_URL, '/movies')
    span_movies.setTag(Tags.HTTP_METHOD, 'get')
  
    span_movies.log({'event': 'request_received'});
    repo.getAllMovies().then(movies => {
      res.status(status.OK).json(movies)
      span_movies.log({'event': 'request_end'});
      span_movies.setTag(Tags.HTTP_STATUS_CODE, status.OK)
      span_movies.finish();    
    }).catch(next)
  })

  app.get('/movies/premieres', (req, res, next) => {
    const span_movies_premieres = tracer.startSpan('movies_premieres');
    span_movies_premieres.setTag(Tags.HTTP_URL, '/movies/premieres')
    span_movies_premieres.setTag(Tags.HTTP_METHOD, 'get')
  
    span_movies_premieres.log({'event': 'request_received'});
    repo.getMoviePremiers().then(movies => {
      res.status(status.OK).json(movies)
      span_movies_premieres.log({'event': 'request_end'});
      span_movies_premieres.setTag(Tags.HTTP_STATUS_CODE, status.OK)
      span_movies_premieres.finish();    
    }).catch(next)
  })
  
  app.get('/movies/:id', (req, res, next) => {
    const span_movies_id = tracer.startSpan('movies_id');
    span_movies_id.setTag(Tags.HTTP_URL, '/movies/:id')
    span_movies_id.setTag(Tags.HTTP_METHOD, 'get')
  
    span_movies_id.log({'event': 'request_received'});
    repo.getMovieById(req.params.id).then(movie => {
      res.status(status.OK).json(movie)
      span_movies_id.log({'event': 'request_end'});
      span_movies_id.setTag(Tags.HTTP_STATUS_CODE, status.OK)
      span_movies_id.finish();    

    }).catch(next)
  })
}
