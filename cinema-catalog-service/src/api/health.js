'use strict'
const status = require('http-status')

module.exports = (app, options) => {
  const {repo} = options

  app.get('/healthz', (req, res, next) => {
    res.status(status.OK).end();
    next()
  })

}
