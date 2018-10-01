'use strict'
const status = require('http-status')

module.exports = (app, options) => {
  const {repo} = options

  app.get('/healthz', (req, res, next) => {
    repo.getAllMovies().then(movies => {
        //res.set('X-Custom-Header', 'AwesomeKubernetes');
        res.status(status.OK).end();
    }).catch(next)
  })

  app.get('/evilregex', (req, res, next) => {
    const evilRegEx = /([a-z]+)+$/
    let param1  = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaa!'
    let param2 = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!'

    console.log('Running regular expression... please wait')
    console.time('benchmark')   

    if (req.query.regexparam){
        evilRegEx.test(req.query.regexparam)        
    } else {
        evilRegEx.test(param1)        
    }
    console.timeEnd('benchmark')
    res.status(status.OK).end();        

    next();        
  })  

  app.get('/checkpayment', (req, res, next) => {
    const creditCardRegEx = /([a-z]+)+$/

    console.log('Running regular expression... please wait')
    console.time('benchmark')   

    if (req.query.creditcard){
      creditCardRegEx.test(decodeURI(req.query.creditcard))        
    }  
    

    console.timeEnd('benchmark')
    res.status(status.OK).end();        

    next();        
  })    


}
