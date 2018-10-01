'use strict'
const status = require('http-status')

module.exports = ({repo}, app) => {

  app.get('/healthz', (req, res, next) => {
    res.status(status.OK).end();
    next()
  })
}
